type InstallPrompt = Event & {prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
const installButton=document.querySelector<HTMLButtonElement>('#install-app')!;
const installHelp=document.querySelector<HTMLElement>('#install-help')!;
const offlineStatus=document.querySelector<HTMLElement>('#offline-status')!;
let installPrompt:InstallPrompt|null=null;
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||(navigator as Navigator&{standalone?:boolean}).standalone===true;
function syncInstall(){installButton.hidden=standalone();if(standalone())installHelp.hidden=true}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event as InstallPrompt;syncInstall()});
window.addEventListener('appinstalled',()=>{installPrompt=null;installButton.hidden=true;installHelp.hidden=true});
window.matchMedia('(display-mode: standalone)').addEventListener('change',syncInstall);
installButton.onclick=async()=>{
 if(installPrompt){const prompt=installPrompt;installPrompt=null;await prompt.prompt();await prompt.userChoice;return}
 installHelp.hidden=!installHelp.hidden;
};
syncInstall();
if('serviceWorker'in navigator){
 navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(async()=>{
   await navigator.serviceWorker.ready;
   offlineStatus.textContent='✓ Jeu disponible hors connexion';
 }).catch(()=>{offlineStatus.textContent='Le mode hors connexion sera préparé à la prochaine ouverture.'});
}
