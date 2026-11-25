let installEvent=null;
let reg=null;
export let ready=false;
export let installed=matchMedia('(display-mode: standalone)').matches || navigator.standalone===true;
export let canInstall=false;
function changed(){window.dispatchEvent(new Event('archipel-install-state'));}
window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();installEvent=event;canInstall=true;changed();
});
window.addEventListener('appinstalled',()=>{installed=true;canInstall=false;installEvent=null;changed();});
if('serviceWorker' in navigator && !import.meta.env?.DEV){
  void navigator.serviceWorker.register('./sw.js').then(value=>{
    reg=value;
    void navigator.serviceWorker.ready.then(()=>{ready=true;changed();});
  }).catch(()=>{});
}
export async function install(){
  const event=installEvent;
  if(!event) return false;
  installEvent=null;canInstall=false;
  try{await event.prompt();installed=(await event.userChoice).outcome==='accepted';changed();return installed;}
  catch{return false;}
}
export async function check(){
  if(!reg) return 'unavailable';
  try{
    await reg.update();
    const worker=reg.installing;
    if(worker) await new Promise(resolve=>{
      const finish=()=>{
        if(['installed','activated','redundant'].includes(worker.state)){
          worker.removeEventListener('statechange',finish);resolve();
        }
      };
      worker.addEventListener('statechange',finish);finish();
    });
    return reg.waiting?'update':'current';
  } catch{return 'unavailable';}
}
export function restart(){
  if(!reg?.waiting) return;
  navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});
  reg.waiting.postMessage('activate');
}