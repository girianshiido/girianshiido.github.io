const CACHE='cosmo-pop-72ee88d9ef16';
const FILES=["./","./index.html","./style.css","./icon.svg","./icon-192.png","./icon-512.png","./icon-maskable.png","./apple-touch-icon.png","./manifest.webmanifest","./js/main.js","./js/engine.js","./js/art.js","./js/audio.js","./js/storage.js","./audio/pop.ogg","./audio/buy.ogg","./audio/reward.ogg","./audio/comet.ogg","./audio/launch.ogg"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('cosmo-pop-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data==='ACTIVATE')self.skipWaiting()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request)))});
