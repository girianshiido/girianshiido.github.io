const narration=new Audio();
const effect=new Audio();
let sound=true,voice=true,queue=[],generation=0;

export function configure(settings){
  sound=settings.sound;
  voice=settings.voice;
  if(!sound)stop();
  else if(!voice)stopVoice();
}
function stopVoice(){
  generation++;
  queue=[];
  narration.pause();
}
export function stop(){
  stopVoice();
  effect.pause();
}
function nextClip(){
  const clip=queue.shift();
  if(!clip||!sound||!voice||document.hidden)return;
  const requested=generation;
  narration.src=new URL('./audio/voix/'+clip+'.mp3',document.baseURI);
  void narration.play().catch(()=>{if(generation===requested)queue=[];});
}
narration.addEventListener('ended',nextClip);
export function playVoice(...clips){
  stopVoice();
  queue=clips;
  nextClip();
}
export function chime(type){
  if(!sound||document.hidden)return;
  effect.pause();
  effect.src=new URL('./audio/'+type+'.mp3',document.baseURI);
  effect.volume=.48;
  void effect.play().catch(()=>{});
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
