const audio=new Audio();
const effect=new Audio();
const synth=window.speechSynthesis;
let sound=true, voice=true, serial=0, message=null;

export function configure(settings){
  sound=settings.sound;
  voice=settings.voice;
  if(!sound) stop();
  else if(!voice) stopVoice();
}
function stopVoice(){
  serial++; audio.pause();
  if(message) synth?.cancel();
  message=null;
}
export function stop(){
  stopVoice();
  effect.pause();
}
function speak(text){
  if(!synth||!window.SpeechSynthesisUtterance) return;
  const available=synth.getVoices().filter(item=>item.localService&&item.lang.startsWith('fr'));
  if(!available.length) return;
  message=new SpeechSynthesisUtterance(text);
  message.lang='fr-FR';
  message.voice=available.find(item=>item.lang==='fr-FR')??available[0];
  message.rate=.87;
  synth.speak(message);
}
export function say(text,number){
  if(!sound||!voice||document.hidden) return;
  stopVoice();
  if(number===undefined){speak(text);return;}
  const current=serial;
  audio.src=new URL('./audio/n'+number+'.wav',document.baseURI);
  void audio.play().catch(()=>{if(current===serial) speak(text);});
}
export function chime(type){
  if(!sound||document.hidden) return;
  effect.pause();
  effect.src=new URL('./audio/'+type+'.wav',document.baseURI);
  effect.volume=.55;
  void effect.play().catch(()=>{});
}
document.addEventListener('visibilitychange',()=>{if(document.hidden) stop();});