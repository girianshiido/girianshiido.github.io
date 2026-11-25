const narration=new Audio();
const effect=new Audio();
const numberBuffers=new Map();
let numberContext,numberSource;
let sound=true,voice=true,queue=[],generation=0;

const voiceUrl=clip=>new URL('./audio/voix/'+clip+'.mp3',document.baseURI);

function prepareNumbers(){
  if(numberContext||!sound||!voice)return;
  const Context=window.AudioContext||window.webkitAudioContext;
  if(!Context)return;
  try{numberContext=new Context({latencyHint:'interactive'});}catch{return;}
  for(let n=0;n<=10;n++){
    const clip='n'+n;
    void fetch(voiceUrl(clip)).then(response=>{
      if(!response.ok)throw Error('Extrait indisponible');
      return response.arrayBuffer();
    }).then(bytes=>numberContext.decodeAudioData(bytes))
      .then(buffer=>numberBuffers.set(clip,buffer))
      .catch(()=>{}); // An unavailable buffer can still be played by the HTML audio element.
  }
}
function unlockNumbers(){
  if(sound&&voice&&numberContext&&numberContext.state!=='running'){
    void numberContext.resume().catch(()=>{});
  }
}
export function configure(settings){
  sound=settings.sound;
  voice=settings.voice;
  if(!sound)stop();
  else if(!voice)stopVoice();
  else prepareNumbers();
}
function stopVoice(){
  generation++;
  queue=[];
  narration.pause();
  if(numberSource){
    numberSource.onended=null;
    numberSource.stop();
    numberSource.disconnect();
    numberSource=null;
  }
}
export function stop(){
  stopVoice();
  effect.pause();
}
function nextClip(){
  const clip=queue.shift();
  if(!clip||!sound||!voice||document.hidden)return;
  const buffer=numberBuffers.get(clip);
  if(buffer&&numberContext.state==='running'){
    const source=numberContext.createBufferSource();
    source.buffer=buffer;
    source.connect(numberContext.destination);
    source.onended=()=>{
      source.disconnect();
      if(numberSource!==source)return;
      numberSource=null;
      nextClip();
    };
    source.start();
    numberSource=source;
    return;
  }
  const requested=generation;
  narration.src=voiceUrl(clip);
  void narration.play().catch(()=>{if(generation===requested)queue=[];});
}
narration.addEventListener('ended',()=>{if(!numberSource)nextClip();});
export function playVoice(...clips){
  stopVoice();
  if(!clips.length||!sound||!voice||document.hidden)return false;
  effect.pause();
  queue=clips;
  nextClip();
  return true;
}
export function chime(type){
  if(!sound||document.hidden||numberSource||!narration.paused)return;
  effect.pause();
  effect.src=new URL('./audio/'+type+'.mp3',document.baseURI);
  effect.volume=.48;
  void effect.play().catch(()=>{});
}
document.addEventListener('pointerup',unlockNumbers,{capture:true,passive:true});
document.addEventListener('keydown',unlockNumbers,{capture:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
