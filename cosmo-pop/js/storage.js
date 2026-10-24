import { parseSave } from './engine.js';
const PREFIX = 'cosmo-pop:' + location.pathname.replace(/index\.html$/, '');
const encoder = new TextEncoder();
const to64 = (a) => btoa(Array.from(a, b => String.fromCharCode(b)).join(''));
const from64 = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
function readEnvelope(raw, mode) { if (raw.length > 200000)
    throw Error('Fichier trop volumineux.'); const e = JSON.parse(raw); if (e.format !== 'cosmo-pop-encrypted' || e.version !== 1 || e.mode !== mode || typeof e.iv !== 'string' || typeof e.data !== 'string' || from64(e.iv).length !== 12)
    throw Error('Format de sauvegarde chiffrée invalide.'); return e; }
async function deviceKey() {
    const db = await new Promise((resolve, reject) => { const r = indexedDB.open('cosmo-pop-keys', 1); r.onupgradeneeded = () => r.result.createObjectStore('keys'); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); r.onblocked = () => reject(Error('Accès au stockage bloqué.')); });
    try {
        const found = await new Promise((resolve, reject) => { const t = db.transaction('keys', 'readonly'); const r = t.objectStore('keys').get(PREFIX); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
        if (found)
            return found;
        const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
        // add(), rather than put(), prevents a concurrent first tab from replacing the key.
        try {
            await new Promise((resolve, reject) => { const t = db.transaction('keys', 'readwrite'); t.objectStore('keys').add(key, PREFIX); t.oncomplete = () => resolve(); t.onerror = () => reject(t.error); });
            return key;
        }
        catch {
            return await new Promise((resolve, reject) => { const r = db.transaction('keys', 'readonly').objectStore('keys').get(PREFIX); r.onsuccess = () => r.result ? resolve(r.result) : reject(Error('Clé indisponible.')); r.onerror = () => reject(r.error); });
        }
    }
    finally {
        db.close();
    }
}
async function seal(text, key, mode, extra = {}) { const iv = crypto.getRandomValues(new Uint8Array(12)); const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: encoder.encode('cosmo-pop:v1:' + mode) }, key, encoder.encode(text)); return JSON.stringify({ format: 'cosmo-pop-encrypted', version: 1, mode, iv: to64(iv), data: to64(new Uint8Array(data)), ...extra }); }
async function open(e, key) { const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: from64(e.iv), additionalData: encoder.encode('cosmo-pop:v1:' + e.mode) }, key, from64(e.data)); return parseSave(new TextDecoder().decode(plain)); }
async function passwordKey(password, salt) { if (password.length < 10)
    throw Error('Le mot de passe doit contenir au moins 10 caractères.'); const base = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']); return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: 310000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']); }
export async function exportEncrypted(state, password) { const salt = crypto.getRandomValues(new Uint8Array(16)); return seal(JSON.stringify({ ...state, savedAt: Date.now() }), await passwordKey(password, salt), 'password', { salt: to64(salt), iterations: 310000 }); }
export async function importEncrypted(raw, password) { const e = readEnvelope(raw, 'password'); if (typeof e.salt !== 'string' || from64(e.salt).length !== 16 || e.iterations !== 310000)
    throw Error('Paramètres de chiffrement invalides.'); try {
    return await open(e, await passwordKey(password, from64(e.salt)));
}
catch {
    throw Error('Mot de passe incorrect ou sauvegarde altérée.');
} }
export class Storage {
    key = null;
    queue = Promise.resolve();
    async load() { this.key = await deviceKey(); const raw = localStorage.getItem(PREFIX); if (!raw)
        return { state: null, recovered: false }; try {
        return { state: await open(readEnvelope(raw, 'device'), this.key), recovered: false };
    }
    catch {
        const backup = localStorage.getItem(PREFIX + ':backup');
        if (!backup)
            throw Error('Sauvegarde locale illisible. Importez une copie de secours.');
        return { state: await open(readEnvelope(backup, 'device'), this.key), recovered: true };
    } }
    save(state) { const snapshot = JSON.stringify({ ...state, savedAt: Date.now() }); const task = this.queue.catch(() => { }).then(async () => { if (!this.key)
        this.key = await deviceKey(); const encrypted = await seal(snapshot, this.key, 'device'); const old = localStorage.getItem(PREFIX); if (old)
        localStorage.setItem(PREFIX + ':backup', old); localStorage.setItem(PREFIX, encrypted); }); this.queue = task; return task; }
}
