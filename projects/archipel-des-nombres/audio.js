const narration=new Audio();
const effect=new Audio();
const music=new Audio();
const channels={voice:narration,effects:effect,music};
const numberBuffers=new Map();
const gains={};
let context,numberSource,numberGain;
let sound=true,voice=true,musicEnabled=true,queue=[],generation=0;
let interacted=false,musicRequested=false,musicRevision=0;
const levels={voice:1,effects:.48,music:.18};

const url=path=>new URL('./audio/'+path,document.baseURI);
const voiceUrl=clip=>url('voix/'+clip+'.mp3');
music.preload='none';
music.loop=true;
music.src=url(music.canPlayType('audio/ogg; codecs="vorbis"')?'brise-du-lagon.ogg':'brise-du-lagon.m4a');

function prepareAudio(){
  if(context||!sound)return;
  const Context=window.AudioContext||window.webkitAudioContext;
  if(!Context)return;
  try{context=new Context({latencyHint:'interactive'});}catch{return;}
  for(const [channel,element] of Object.entries(channels)){
    try{
      const gain=context.createGain();
      context.createMediaElementSource(element).connect(gain);
      gain.connect(context.destination);
      gains[channel]=gain;
    }catch{
      // Fall back to the element's gain if Web Audio routing is unavailable.
    }
  }
  numberGain=gains.voice??context.createGain();
  if(!gains.voice)numberGain.connect(context.destination);
  for(let n=0;n<=10;n++){
    const clip='n'+n;
    void fetch(voiceUrl(clip)).then(response=>{
      if(!response.ok)throw Error('Extrait indisponible');
      return response.arrayBuffer();
    }).then(bytes=>context.decodeAudioData(bytes))
      .then(buffer=>numberBuffers.set(clip,buffer))
      .catch(()=>{}); // An unavailable buffer can still be played by the audio element.
  }
}
function syncLevels(){
  for(const [channel,element] of Object.entries(channels)){
    const gain=gains[channel];
    if(gain)gain.gain.value=levels[channel];
    element.volume=gain?1:levels[channel];
  }
  if(numberGain)numberGain.gain.value=levels.voice;
}
function syncMusic(){
  const play=interacted&&sound&&musicEnabled&&levels.music>0&&!document.hidden;
  if(play===musicRequested)return;
  musicRequested=play;
  const revision=++musicRevision;
  if(play){
    void music.play().catch(()=>{if(revision===musicRevision)musicRequested=false;});
  }else music.pause();
}
function unlock(){
  interacted=true;
  if(sound&&context&&context.state!=='running'){
    void context.resume().catch(()=>{});
  }
  syncMusic();
}
export function configure(settings){
  sound=settings.sound;
  voice=settings.voice;
  musicEnabled=settings.music;
  levels.voice=settings.voiceVolume/100;
  levels.effects=settings.effectsVolume/100;
  levels.music=settings.musicVolume/100;
  if(!sound)stop();
  else{
    if(!voice||levels.voice===0)stopVoice();
    if(levels.effects===0)effect.pause();
    prepareAudio();
    if(interacted&&context?.state==='suspended')void context.resume().catch(()=>{});
  }
  syncLevels();
  syncMusic();
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
  if(!clip||!sound||!voice||levels.voice===0||document.hidden)return;
  const buffer=numberBuffers.get(clip);
  if(buffer&&context.state==='running'){
    const source=context.createBufferSource();
    source.buffer=buffer;
    source.connect(numberGain);
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
  if(!clips.length||!sound||!voice||levels.voice===0||document.hidden)return false;
  queue=clips;
  nextClip();
  return true;
}
export function chime(type,overVoice=false){
  if(!sound||levels.effects===0||document.hidden)return;
  if(!overVoice&&(numberSource||!narration.paused))return;
  effect.pause();
  effect.src=url(type+'.mp3');
  void effect.play().catch(()=>{});
}
document.addEventListener('pointerup',unlock,{capture:true,passive:true});
document.addEventListener('keydown',unlock,{capture:true});
document.addEventListener('click',unlock,{capture:true,passive:true});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden)stop();
  syncMusic();
});
