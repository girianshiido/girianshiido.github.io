const installButton = document.querySelector('#install-app');
const installHelp = document.querySelector('#install-help');
const offlineStatus = document.querySelector('#offline-status');
let installPrompt = null;
const standalone = ()=>window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
function syncInstall() {
    installButton.hidden = standalone();
    if (standalone()) installHelp.hidden = true;
}
window.addEventListener('beforeinstallprompt', (event)=>{
    event.preventDefault();
    installPrompt = event;
    syncInstall();
});
window.addEventListener('appinstalled', ()=>{
    installPrompt = null;
    installButton.hidden = true;
    installHelp.hidden = true;
});
window.matchMedia('(display-mode: standalone)').addEventListener('change', syncInstall);
installButton.onclick = async ()=>{
    if (installPrompt) {
        const prompt = installPrompt;
        installPrompt = null;
        await prompt.prompt();
        await prompt.userChoice;
        return;
    }
    installHelp.hidden = !installHelp.hidden;
};
syncInstall();
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', {
        scope: './',
        updateViaCache: 'none'
    }).then(async ()=>{
        await navigator.serviceWorker.ready;
        offlineStatus.textContent = '✓ Jeu disponible hors connexion';
    }).catch(()=>{
        offlineStatus.textContent = 'Le mode hors connexion sera préparé à la prochaine ouverture.';
    });
}
