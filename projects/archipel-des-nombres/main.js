import {islands,numbers,accessible,startRound,answer,advance,outcome,coreCount,finalIsland,roundSize,exampleTask,matches} from './engine.js';
import {icon,collection,hitPositions,setCanvas,drawToken,drawBasket} from './art.js';
import {avatars,defaults,load,persist,add,remove,record} from './storage.js';
import * as audio from './audio.js';
import * as pwa from './pwa.js';
import {presentation,exampleHint,exampleVoices,chapterTitle,voiceClips} from './lessons.js';
import {bindDrag} from './drag.js';

// WebKit also sends its own pinch gesture events in some display modes.
for(const event of ['gesturestart','gesturechange']){
  document.addEventListener(event,e=>e.preventDefault(),{passive:false});
}
document.addEventListener('contextmenu',event=>{
  const target=event.target;
  if(!(target instanceof Element&&target.closest('input,textarea,[contenteditable="true"]')))event.preventDefault();
});

const $=selector=>document.querySelector(selector);
const main=$('#main'),header=$('#header'),footer=$('#footer'),dialog=$('#dialog');
const save=load();
const player=()=>save.players.find(p=>p.id===save.active);
const prefs=()=>player()?.settings??defaults;
const range=chapter=>chapter?'6 à 10':'0 à 5';
const title=chapterTitle;
const portrait=(index,alt='')=>'<img class="portrait" src="./images/avatar-'+index+'.webp" alt="'+alt+'">';
const esc=value=>String(value).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const button=(label,action,glyph='',classes='secondary')=>'<button type="button" class="'+classes+'" data-action="'+action+'">'+(glyph?icon(glyph):'')+label+'</button>';
const tag=(glyph,label)=>icon(glyph)+'<span>'+label+'</span>';
let page='map',chapter=0,round=null,result=null,current=null,flashTimer=0,toastTimer=0,storageFailed=false,nextAfterCreate=false;
let revision=0, opener=null;

function persistSave(){
  if(!persist(save)&&!storageFailed){storageFailed=true;toast('La sauvegarde locale est indisponible dans ce navigateur.');}
}
function toast(message) {
  const node=$('#toast');node.textContent=message;node.classList.add('live');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('live'),3800);
}
function applySettings(){
  const s=prefs();
  for(const name of ['motion','contrast','large']) document.documentElement.dataset[name]=String(s[name]);
  audio.configure(s);
}
function chrome(){
  const p=player(), view=page==='map'?' aria-current="page"':'';
  header.innerHTML='<div class="topbar shell"><button type="button" class="brand" data-action="map"><span class="brand-icon">'+icon('beacon')+'</span><span>L’Archipel<span class="brand-tail"> des nombres</span></span></button>'+
    '<nav aria-label="Navigation principale">'+
    '<button type="button" data-action="map" class="toplink map-link" aria-label="Carte"'+view+'>'+tag('map','Carte')+'</button>'+
    '<button type="button" class="toplink" data-action="settings" aria-label="Réglages">'+tag('settings','Réglages')+'</button>'+
    '<button type="button" class="toplink profile-link" data-action="profiles" aria-label="Joueurs'+(p?' · '+esc(p.name):'')+'">'+(p?'<span class="mini-avatar" aria-hidden="true">'+portrait(p.avatar)+'</span><span class="profile-name">'+esc(p.name)+'</span>':tag('user','Joueurs'))+'</button></nav></div>';
  footer.innerHTML='<div class="shell bottom"><span class="bottom-title">'+icon('beacon')+' L’Archipel des nombres</span><div>'+
    (pwa.installed?'<span class="offline-note">'+icon('check')+' Application installée</span>':button('Installer','install','install','text-button'))+
    button('Suivi','stats','chart','text-button')+'</div></div>';
}
function goMap(scroll=false){
  clearTimeout(flashTimer);audio.stop();page='map';result=null;chrome();renderMap();
  if(scroll) window.scrollTo(0,0);
}
function sectionFocus(id){
  requestAnimationFrame(()=>{const node=document.getElementById(id);node?.focus({preventScroll:true});});
}
const chapterOpen=()=>!!player()?.records[0][finalIsland].mastery;
const firstIsland=records=>islands.slice(0,coreCount).findIndex((_,i)=>!records[i]?.mastery);
function islandCard(island,index,records){
  const open=accessible(records,index),done=!!records[index]?.mastery;
  const action=' data-action="island-'+index+'" '+(!open?'aria-disabled="true"':'');
  if(index>=coreCount)return '<button type="button" class="extra-island '+island.tone+'"'+action+'>'+
    '<span class="tile-icon">'+icon(island.icon)+'</span><span class="tile-body"><strong>'+island.title+'</strong><span class="tile-text">'+island.description+'</span></span>'+
    '<span class="tile-state" aria-label="'+(done?'Validée':open?'Jouer':'Verrouillée')+'">'+icon(done?'check':open?'arrowSmall':'lock')+'</span></button>';
  return '<button type="button" class="island '+island.tone+(!open?' locked':'')+'"'+action+'>'+
    '<span class="tile-illustration"><img src="./images/island-'+island.art+'.webp" alt="" width="480" height="360">'+
    (open&&!done?'<span class="tile-current">À explorer</span>':'')+'</span>'+
    '<span class="tile-info"><span class="tile-icon">'+icon(island.icon)+'</span><span class="tile-body"><span class="tile-title">'+island.title+'</span><span class="tile-text">'+island.description+'</span></span>'+
    '<span class="tile-state" aria-label="'+(done?'Validée':open?'Jouer':'Verrouillée')+'">'+icon(done?'check':open?'arrowSmall':'lock')+'</span></span></button>';
}
function renderMap(){
  if(chapter&&!chapterOpen()) chapter=0;
  const records=player()?.records[chapter]??[];
  const completed=records.slice(0,coreCount).filter(entry=>entry.mastery).length;
  const active=firstIsland(records);
  const canResume=round&&round.chapter===chapter&&current&&!result;
  main.innerHTML='<div class="shell map-view"><section class="hero"><img class="hero-art" src="./images/archipel.webp" alt="" fetchpriority="high"><div class="hero-copy">'+
    '<span class="range">Compter de '+range(chapter)+'</span>'+
    '<h1 tabindex="-1" id="map-title">L’Archipel<br>des nombres</h1>'+
    '<p>Explore les îles, aide leurs habitants et allume le grand phare.</p>'+
    button(canResume?'Reprendre':active===-1?'Rejouer au phare':completed?'Continuer l’aventure':'Commencer l’aventure','play','arrow','primary hero-button')+
    '</div></section><section class="route" aria-labelledby="route-title"><div class="route-header">'+
    '<div><div class="kicker">Le parcours · '+range(chapter)+'</div><h2 id="route-title">'+title(chapter)+'</h2></div>'+
    '<div class="journey-progress"><div>'+completed+' île'+(completed>1?'s':'')+' sur '+coreCount+'</div><progress value="'+completed+'" max="'+coreCount+'" aria-label="Îles validées"></progress></div></div>'+
    '<div class="island-grid">'+islands.slice(0,coreCount).map((island,i)=>islandCard(island,i,records)).join('')+'</div></section>'+
    '<section class="next-land"><span class="tile-icon '+(chapter?'peach':'sky')+'">'+icon(chapter?'map':'beacon')+'</span><div>'+
    '<h2>'+(chapter?'Les petites îles':'Au-delà du lagon')+'</h2><p>'+(chapter?'Retrouve les nombres de 0 à 5.':chapterOpen()?'Explore le parcours des nombres de 6 à 10.':'Allume le phare pour partir explorer les nombres de 6 à 10.')+'</p></div>'+
    (chapterOpen()?button(chapter?'Revenir':'Explorer','chapter','arrow'):('<span class="future-lock" aria-label="Verrouillé">'+icon('lock')+'</span>'))+'</section>'+
    '<section class="extra-route" aria-labelledby="extra-title"><h2 id="extra-title">Ateliers à part</h2>'+
    '<p>'+(!records[finalIsland]?.mastery?'À découvrir après la traversée, à ton rythme.':'Choisis une autre façon de jouer avec les nombres.')+'</p><div class="extra-grid">'+
    islands.slice(coreCount).map((island,i)=>islandCard(island,i+coreCount,records)).join('')+'</div></section></div>';
}
function start(index){
  const p=player();
  if(!p){nextAfterCreate=true;profiles(true);return;}
  if(!accessible(p.records[chapter],index)){toast(index<coreCount?'Termine l’île précédente pour ouvrir celle-ci.':'Termine la traversée du phare pour ouvrir cet atelier.');return;}
  round=startRound(chapter,index);
  page='game';result=null;chrome();beginTask(true);
  window.scrollTo(0,0);
}
function play(){
  if(round&&current&&round.chapter===chapter){
    page='game';chrome();renderTask(!current.feedback&&!current.hidden);return;
  }
  const index=firstIsland(player()?.records[chapter]??[]);
  start(index===-1?finalIsland:index);
}
function beginTask(example=false){
  clearTimeout(flashTimer);
  if(!round)return;
  const q=example?exampleTask(round.chapter,round.island):round.tasks[round.index];
  const supply=q.mode==='change'?Math.max(q.n,q.start)+2:q.mode==='pair'?q.n+2:Math.max(round.chapter?12:8,q.n+2);
  current={q,example,supply,marked:new Set(),markOrder:[],selected:new Set(q.mode==='change'?Array.from({length:q.start},(_,i)=>i):[]),
    slots:new Map(),order:[],hidden:false,feedback:null,note:'',transcript:!prefs().sound||!prefs().voice,ferrySide:'source'};
  revision++;renderTask(true);
  audio.playVoice(...voiceClips(q,example?'example':'question'));
}
function canvas(n,layout,token,seed,classes='',hidden=false){
  return '<canvas class="count-canvas '+classes+'" aria-hidden="true" data-n="'+n+'" data-layout="'+layout+'" data-token="'+token+'" data-seed="'+seed+'"'+(hidden?' data-hidden="true"':'')+'></canvas>';
}
function numeric(q,disabled=false){
  return '<div class="answers" aria-label="Réponses proposées">'+q.choices.map(n=>'<button type="button" class="number-button" data-action="answer-'+n+'" '+(disabled?'disabled':'')+'>'+n+'</button>').join('')+'</div>';
}
function taskBody(){
  const state=current,q=state.q;
  switch(q.mode){
    case 'touch':
      return '<div class="scene sea" id="point-scene">'+canvas(q.n,q.layout,q.token,q.seed,'point-canvas')+'<div class="hit-layer"></div>'+(q.n===0?'<span class="empty-scene">Aucun objet</span>':'')+'</div>'+numeric(q,state.marked.size!==q.n);
    case 'echo': {
      const p=prefs();
      const name=state.transcript?numbers[q.n]:'Écouter le nombre';
      const audioButton=p.sound&&p.voice?button(name,'repeat','sound','sound-button'):'<span class="sound-button secondary">'+name+'</span>';
      return '<div class="scene cave sound-scene">'+audioButton+'</div>'+numeric(q);
    }
    case 'glance':
      return '<div class="scene lagoon">'+canvas(q.n,q.layout,q.token,q.seed,'glance-canvas',state.hidden)+(q.n===0?'<span class="empty-scene">Aucun objet</span>':'')+
        (state.hidden?'<div class="glance-cover">'+button('Revoir la figure','show','dice')+'</div>':'')+'</div>'+numeric(q);
    case 'ferry':
      if(state.ferrySide==='source')return '<div class="ferry-source"><div class="scene lagoon"><span class="scene-label">Le premier quai</span>'+
        canvas(q.n,q.layout,q.token,q.seed)+'</div>'+button('Traverser','ferry-cross','arrow','primary ferry-button')+'</div>';
      return '<div class="ferry-arrival"><span>'+icon('beacon')+' Le second quai</span>'+button('Revoir le premier quai','ferry-back','back','text-button')+
        '</div>'+manipulation();
    case 'basket':
    case 'pair':
    case 'change':
    case 'color':
    case 'order':return manipulation();
  }
}
function manipulation(){
  return '<div id="workspace" class="manipulation"></div>'+button('Valider','validate','check','primary validate');
}
function renderTask(schedule){
  if(!round||!current) return;
  page='game';
  const q=current.q, info=presentation(q), p=prefs(), island=islands[round.island];
  if(q.mode==='echo'&&(!p.sound||!p.voice)) current.transcript=true;
  const retry=round.index>=round.planned;
  const count=current.example?'Exemple':retry?'Nouvel essai':(round.index+1)+' / '+round.planned;
  const progress=Array.from({length:round.planned},(_,i)=>'<span class="'+(i<round.index?'done':i===round.index&&!current.example?'here':'')+'"></span>').join('');
  main.innerHTML='<div class="shell game-view"><div class="game-top">'+button('Carte','map','back','text-button')+
    '<span class="game-island">'+icon(island.icon)+' '+island.title+'</span>'+
    '<span class="step-label">'+count+'</span></div>'+
    '<div class="steps" role="img" aria-label="'+count+'">'+progress+'</div>'+
    '<section class="game-card '+island.tone+'" style="--island-art:url(./images/island-'+island.art+'.webp)">'+
    '<div class="game-heading"><div><span class="kicker">'+(current.example?'Exemple guidé':retry?'Une nouvelle variante':island.title)+'</span>'+
    '<h1 tabindex="-1" id="task-title">'+info.prompt+'</h1><p>'+(current.example?exampleHint(q,round.chapter):info.hint)+'</p></div>'+
    '<div class="sound-tools">'+button('', 'sound',p.sound?'sound':'mute','icon-button mute-button')+
    (p.sound&&p.voice&&!current.feedback?button('Consigne','repeat-instruction','sound','text-button replay')+
      (q.mode==='echo'?button(current.transcript?'Masquer le mot':'Lire le mot','transcript','','text-button transcript'):''):'')+
    '</div></div><div id="task-body">'+(current.feedback?feedbackBody():taskBody())+'</div>'+
    (current.example&&!current.feedback?'<div class="example-controls"><p id="example-note" role="status">'+current.note+'</p>'+
      button('Passer l’exemple','skip-example','','text-button')+'</div>':'')+'</section></div>';
  const mute=$('.mute-button');mute.setAttribute('aria-label',p.sound?'Couper le son':'Rétablir le son');mute.setAttribute('aria-pressed',String(!p.sound));
  if($('#workspace')) renderWorkspace();
  redraw();
  if(schedule){
    sectionFocus('task-title');
    if(q.flash&&p.flash&&!current.example){
      const at=revision;
      flashTimer=setTimeout(()=>{
        if(at!==revision||page!=='game'||!current||current.feedback||dialog.open)return;
        const focused=document.activeElement?.dataset.action;
        current.hidden=true;renderTask(false);
        if(focused) main.querySelector('[data-action="'+focused+'"]')?.focus({preventScroll:true});
      },2500);
    }
  }
}
function tokenButton(i,where,token){
  const action=where==='basket'?'take-':'put-';
  const names={seed:'graine',pearl:'perle',lantern:'lanterne'};
  const noun=names[token]||'objet',article=names[token]?'une':'un';
  return '<button type="button" class="token-button" data-action="'+action+i+'" data-item="'+i+'" data-where="'+where+'" aria-label="'+(where==='basket'?'Retirer':'Ajouter')+' '+article+' '+noun+' '+(i+1)+'"><canvas class="token-canvas" data-token="'+token+'" aria-hidden="true"></canvas></button>';
}
function renderWorkspace(focusSelector){
  const root=$('#workspace');
  if(!root)return;
  const state=current,q=state.q;
  if(q.mode==='color'){
    const count=round.chapter?10:5;
    root.innerHTML='<div class="paint-grid" style="--columns:5" aria-label="Cases à colorier">'+Array.from({length:count},(_,i)=>'<button type="button" data-action="paint-'+i+'" class="paint-cell" aria-pressed="'+state.selected.has(i)+'" aria-label="Case '+(i+1)+'">'+(state.selected.has(i)?icon('spark'):'')+'</button>').join('')+'</div>';
  }else if(q.mode==='order'){
    root.innerHTML='<div class="order-slots" aria-label="Nombres rangés">'+q.order.map((_,i)=>'<button type="button" data-action="undo-order" class="order-slot" '+(i>=state.order.length?'disabled':'')+' aria-label="Retirer le nombre '+(state.order[i]??'')+'">'+(state.order[i]??'')+'</button>').join('')+'</div>'+
      '<div class="answers" aria-label="Nombres à ranger">'+q.order.map(n=>'<button type="button" class="number-button" data-action="order-'+n+'" '+(state.order.includes(n)?'disabled':'')+'>'+n+'</button>').join('')+'</div>';
  }else{
    const paired=q.mode==='pair',stock=Array.from({length:state.supply},(_,i)=>
      state.selected.has(i)?'<span class="stock-empty" aria-hidden="true"></span>':tokenButton(i,'stock',q.token)).join('');
    const placed=[...state.selected].map(i=>tokenButton(i,'basket',q.token)).join('');
    const lanes=paired?'<div class="pair-bed">'+Array.from({length:q.n},(_,i)=>{
      const item=state.slots.get(i);
      return '<div class="pair-cell'+(item!==undefined?' lit':'')+'" data-drop="basket" data-slot="'+i+'"><canvas class="token-canvas pair-leaf" aria-hidden="true" data-token="leaf"></canvas>'+
        (item!==undefined?tokenButton(item,'basket',q.token):'<span class="lantern-hole" aria-hidden="true"></span>')+'</div>';
    }).join('')+'</div>':'';
    const stockLabel=paired?'Lanternes à prendre':q.mode==='ferry'?'Les perles':q.mode==='basket'?'Réserve de graines':'Réserve';
    const wicker=q.mode==='basket'||q.mode==='change';
    const tokenRow='<div class="token-row">'+(placed||'<span class="basket-empty">'+(q.n===0?'Le panier est vide':wicker?'Dépose ici':'Dépose les objets ici')+'</span>')+'</div>';
    const deposit=wicker?'<div class="wicker-basket" data-drop="basket"><canvas class="wicker-art" aria-hidden="true"></canvas>'+tokenRow+'</div>':tokenRow;
    root.innerHTML='<section class="drop-area stock" data-drop="stock"><h2>'+stockLabel+'</h2><div class="token-row">'+stock+'</div></section>'+
      '<section class="drop-area basket'+(paired?' pairing':wicker?' wicker-area':'')+'"'+(wicker?'':' data-drop="basket"')+'><h2>'+
      (wicker?'Ton panier':paired?icon('lamp')+'Le pont':icon('beacon')+'Dépose tes perles ici')+'</h2>'+
      (paired?lanes:deposit)+'</section>';
  }
  if(focusSelector) (root.querySelector(focusSelector)||$('.validate'))?.focus({preventScroll:true});
  drawSmallTokens();
  const validate=$('.validate');
  if(validate)validate.disabled=q.mode==='order'&&state.order.length!==q.order.length;
}
function drawSmallTokens(){
  const basket=$('.wicker-art');
  if(basket)drawBasket(basket);
  main.querySelectorAll('.token-canvas').forEach(node=>{
    const scene=setCanvas(node);
    if(scene) drawToken(scene.ctx,node.dataset.token,scene.w/2,scene.h*.51,Math.min(scene.w,scene.h)*.9);
  });
}
function redraw(){
  if(page!=='game'||!current) return;
  for(const node of main.querySelectorAll('.count-canvas')){
    const d=node.dataset;
    const marked=node.classList.contains('point-canvas')?current.marked:null;
    if(marked) marked.order=current.markOrder;
    collection(node,{n:Number(d.n),layout:d.layout,seed:Number(d.seed),token:d.token,hidden:d.hidden==='true',marked,scale:prefs().large?1.17:1});
  }
  const point=$('.point-canvas'),layer=$('.hit-layer');
  if(point&&layer&&point.clientWidth){
    const q=current.q;
    const positions=hitPositions(point,q.n,q.layout,q.seed);
    if(layer.children.length!==positions.length) layer.innerHTML=positions.map((_,i)=>'<button type="button" class="hit" data-action="point-'+i+'" aria-pressed="false" aria-label="Objet '+(i+1)+'"></button>').join('');
    positions.forEach(([x,y],i)=>{
      const button=layer.children[i];const gap=Math.min(...positions.filter((_,j)=>i!==j).map(([a,b])=>Math.hypot((a-x)*point.clientWidth/100,(b-y)*point.clientHeight/100)),62);button.style.setProperty('--size',Math.max(24,Math.min(62,gap*.93))+'px');button.style.left=x+'%';button.style.top=y+'%';
      button.setAttribute('aria-pressed',String(current.marked.has(i)));
      button.tabIndex=current.marked.has(i)?-1:0;
    });
  }
  drawSmallTokens();
}
let frame=0;
if('ResizeObserver' in window){const resize=new ResizeObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(redraw);});resize.observe(main);}
window.addEventListener('resize',redraw);
function explanation(q,value,correct){
  if(q.mode==='order')return 'Dans cet ordre, chaque nombre est plus grand que celui qui le précède.';
  if(q.mode==='change')return 'Il y avait '+q.start+'. '+(q.n>q.start?'Avec un de plus':'Avec un de moins')+', il y en a '+q.n+'.';
  if(q.mode==='pair')return correct?'Chaque feuille a sa lanterne. Il y en a autant de chaque côté.':'Il faut mettre une lanterne sous chacune des '+q.n+' feuilles.';
  if(q.mode==='ferry')return correct?'Sur chaque quai, il y a '+q.n+' perles. Le phare s’allume un peu plus !':'Tu as déposé '+value+' perles. Sur le premier quai, il y en avait '+q.n+'.';
  if(q.n===0)return 'Zéro veut dire qu’il n’y a aucun objet.';
  if(q.mode==='basket'||q.mode==='color')return correct?'Tu as obtenu exactement '+q.n+'.':'Ta collection en contient '+value+'. Il en fallait '+q.n+'.';
  if(q.mode==='echo')return 'Tu as entendu « '+numbers[q.n]+' ». Le chiffre est '+q.n+'.';
  return 'On en compte '+q.n+' en tout.';
}
function feedbackBody(){
  const {q,feedback,example}=current;
  const {correct,value}=feedback;
  const media=q.mode==='order'
    ?'<div class="answer-demo">'+[...q.order].sort((a,b)=>a-b).map(n=>'<span>'+n+'</span>').join('<b aria-hidden="true">›</b>')+'</div>'
    :'<div class="answer-demo">'+(q.mode==='echo'?'':canvas(q.n,q.layout,q.token,q.seed,'feedback-canvas'))+'<span>'+q.n+'</span></div>';
  return '<div class="feedback '+(correct?'correct':'guided')+'"><div class="feedback-title"><span>'+icon(correct?'check':'spark')+'</span><div>'+
    '<h2 id="feedback-title" tabindex="-1">'+(correct?(example?'Tu as compris le geste !':'Bien trouvé !'):'Observons ensemble')+'</h2><p>'+explanation(q,value,correct)+'</p></div></div>'+
    (!correct?media+'<p class="retry-note">'+(round.index<round.planned?'Tu retrouveras une variante en fin de série.':'Tu pourras retravailler cette activité.')+'</p>':'')+
    button(example?'Commencer la série':'Continuer','advance','arrow','primary feedback-next')+'</div>';
}
function submit(value){
  if(!current||!round||current.feedback)return;
  const correct=current.example?matches(current.q,value):answer(round,value);
  if(correct===null)return;
  if(current.example&&!correct){
    current.note=explanation(current.q,value,false)+' Essaie encore.';
    $('#example-note').textContent=current.note;
    audio.chime('guide');
    return;
  }
  clearTimeout(flashTimer);
  current.feedback={correct,value};
  audio.stop();
  if(current.example)audio.playVoice(exampleVoices[current.q.mode]);
  else audio.chime(correct?'good':'guide');
  if(!correct){player().records[round.chapter][round.island].errors++;persistSave();}
  renderTask(false);
  sectionFocus('feedback-title');
}
function next(){
  if(!round||!current?.feedback)return;
  if(current.example||advance(round)){beginTask();return;}
  const done=outcome(round),p=player();
  record(p,round.chapter,round.island,done);persistSave();
  result={...done,island:round.island,chapter:round.chapter};
  current=null;round=null;page='result';chrome();renderResult();
  if(done.mastery)audio.chime('finish');
}
function renderResult(){
  const r=result,end=r.island===finalIsland,extra=r.island>=coreCount;
  const headline=r.mastery?(end?'Le grand phare brille !':extra?'Atelier réussi !':'Île validée !'):'Ta série est terminée';
  const message=r.mastery
    ?end?(r.chapter?'Tu as parcouru tout l’archipel.':'Tu peux explorer les îles des nombres de 6 à 10 ou découvrir les ateliers à part.'):extra?'Tu peux refaire cet atelier quand tu veux.':'L’île suivante est prête à être explorée.'
    :'Objectif de la série : '+Math.ceil(.8*r.total)+' réponses du premier coup sur '+r.total+'.';
  const primary=r.mastery&&end&&!r.chapter?button('Explorer le lagon','chapter','arrow','primary')
    :r.mastery&&!end&&!extra?button('Île suivante','island-'+(r.island+1),'arrow','primary')
    :button(r.mastery?'Retour à la carte':'Rejouer',r.mastery?'map':'island-'+r.island,'arrow','primary');
  main.innerHTML='<div class="shell result-view"><section class="result-card '+(end&&r.mastery?'lighthouse-win':'')+
    '" style="--island-art:url(./images/island-'+islands[r.island].art+'.webp)"><div class="result-emblem">'+icon(r.mastery?'beacon':'shell')+'</div>'+
    '<h1 id="result-title" tabindex="-1">'+headline+'</h1><p>'+message+'</p><div class="score"><strong>'+r.first+' / '+r.total+'</strong><span>réussites du premier coup</span></div>'+
    '<div class="result-actions">'+primary+(!r.mastery||(!extra&&!end)||(end&&!r.chapter)?button('Carte','map','map'):'')+'</div></section></div>';
  window.scrollTo(0,0);sectionFocus('result-title');
}
function place(index,where,slot=null,keyboard=false){
  if(!current||current.feedback||index<0||index>=current.supply)return;
  const state=current;
  if(state.q.mode==='pair'){
    const origin=[...state.slots].find(([,item])=>item===index)?.[0];
    if(where==='basket'){
      if(slot===null)slot=Array.from({length:state.q.n},(_,i)=>i).find(i=>!state.slots.has(i));
      if(slot===undefined||slot<0||slot>=state.q.n||origin===slot)return;
      const replaced=state.slots.get(slot);
      if(origin!==undefined){
        state.slots.delete(origin);
        if(replaced!==undefined)state.slots.set(origin,replaced);
      }else if(replaced!==undefined)state.selected.delete(replaced);
      state.slots.set(slot,index);
      state.selected.add(index);
    }else{
      if(origin===undefined)return;
      state.slots.delete(origin);state.selected.delete(index);
    }
  }else if(where==='basket')state.selected.add(index);
  else state.selected.delete(index);
  audio.chime('tap');
  renderWorkspace(keyboard?'[data-item="'+index+'"]':undefined);
}
function openDialog(title,body,kind){
  if(!dialog.open) opener=document.activeElement;
  dialog.dataset.kind=kind;
  dialog.innerHTML='<div class="dialog-head"><h2 id="dialog-title">'+title+'</h2>'+
    '<button type="button" class="icon-button" data-action="close" aria-label="Fermer">'+icon('close')+'</button></div>'+body;
  if(!dialog.open) dialog.showModal();
}
function closeDialog(){
  if(dialog.open)dialog.close();
}
dialog.addEventListener('close',()=>{if(opener?.isConnected) opener.focus();opener=null;nextAfterCreate=false;});
dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog();});
function profiles(create=false){
  const p=player();
  const cards=save.players.map(profile=>'<div class="player-row"><button type="button" class="player-select" data-action="select-'+profile.id+'"><span class="big-avatar">'+portrait(profile.avatar)+'</span><span>'+esc(profile.name)+(profile===p?'<small>Profil actif</small>':'')+'</span></button>'+
    '<button type="button" class="text-button delete-profile" data-action="delete-'+profile.id+'" aria-label="Effacer '+esc(profile.name)+'">Effacer</button></div>').join('');
  const form='<form id="new-player"><label for="player-name">Prénom ou pseudo</label><input id="player-name" required maxlength="24" autocomplete="off" placeholder="Ton prénom">'+
    '<fieldset><legend>Choisis ton compagnon</legend><div class="avatar-grid">'+avatars.map((a,i)=>'<label><input type="radio" name="avatar" value="'+i+'" '+(i===0?'checked':'')+'><span>'+portrait(i,a)+'</span></label>').join('')+'</div></fieldset>'+
    '<button type="submit" class="primary">Créer mon profil '+icon('arrow')+'</button><p id="profile-error" role="status"></p></form>';
  openDialog(create||!cards?'Créer un profil':'Joueurs','<p>Chaque profil garde sa progression dans cette application.</p>'+
    (create||!cards?form:cards+(save.players.length<12?button('Nouveau profil','create','plus','primary profile-add'):'')),'profiles');
  if(create||!cards) $('#player-name')?.focus();
}
function settings(){
  const s=prefs();
  const options=[
    ['sound','Son général','Coupe toutes les voix et tous les bruitages.'],
    ['voice','Voix française','Consignes et nombres lus avec une même voix, disponibles hors connexion.'],
    ['motion','Animations','Adoucit les apparitions et les changements d’écran.'],
    ['large','Grands objets','Agrandit les objets à compter.'],
    ['contrast','Contraste renforcé','Renforce la lisibilité des contours et des textes.'],
    ['flash','Figures éclair','Masque certaines petites figures après un instant. Elles peuvent être revues à volonté.'],
  ];
  openDialog('Réglages',(player()?'':'<p>Crée un profil pour garder tes réglages.</p>')+
    options.map(([key,label,detail])=>'<label class="setting"><span><strong>'+label+'</strong><small>'+detail+'</small></span><input type="checkbox" role="switch" data-setting="'+key+'" '+(s[key]?'checked':'')+' '+(!player()?'disabled':'')+'><i></i></label>').join('')+
    '<div class="dialog-actions">'+button('Vérifier les mises à jour','update','install')+'</div><p id="update-note" role="status"></p>','settings');
}
function stats(){
  const p=player();
  openDialog('Carnet de suivi',p?'<p>Progression de <strong>'+esc(p.name)+'</strong>. Une réponse juste au premier essai sur au moins 80 % de la série ouvre l’île suivante.</p>'+
    p.records.map((records,c)=>'<h3>'+title(c)+' · '+range(c)+'</h3><ul class="stats-list">'+records.map((r,i)=>{
      const total=roundSize(c,i);
      return '<li><span>'+islands[i].title+(r.mastery?'<small>Validée</small>':'')+'</span><span>'+(r.rounds||r.errors?'<strong>'+r.first+' / '+total+'</strong><small>'+r.errors+' erreur'+(r.errors===1?'':'s')+' · '+r.rounds+' série'+(r.rounds===1?'':'s')+'</small>':'<small>À découvrir</small>')+'</span></li>';
    }).join('')+'</ul>').join(''):'<p>Crée un profil pour garder les réussites et les activités à revoir.</p>'+button('Créer un profil','create','plus','primary'),'stats');
}
function installation(){
  openDialog('Installer l’archipel',
    (pwa.installed?'<p>L’application est déjà installée.</p>':pwa.canInstall?button('Installer sur cet appareil','native-install','install','primary'):'')+
    '<dl class="install-list"><dt>iPhone et iPad</dt><dd>Dans Safari, touche Partager, puis <strong>Sur l’écran d’accueil</strong>. Active l’ouverture comme app web si Safari propose cette option.</dd>'+
    '<dt>Mac</dt><dd>Dans Safari (macOS Sonoma 14 ou plus récent), choisis <strong>Fichier → Ajouter au Dock</strong>. Chrome propose aussi l’installation dans son menu.</dd>'+
    '<dt>Android</dt><dd>Dans Chrome, ouvre le menu, puis <strong>Ajouter à l’écran d’accueil → Installer</strong>.</dd></dl>'+
    '<p id="offline-status" role="status">'+(pwa.ready?'Le jeu est prêt à fonctionner hors connexion.':'Ouvre le jeu une première fois avec une connexion pour le préparer au mode hors connexion.')+'</p>','install');
}
window.addEventListener('archipel-install-state',()=>{
  if(dialog.open&&dialog.dataset.kind==='install'){
    const note=$('#offline-status');
    if(note&&pwa.ready) note.textContent='Le jeu est prêt à fonctionner hors connexion.';
  }
  if(footer.isConnected)chrome();
});

function switchProfile(id){
  if(!save.players.some(p=>p.id===id))return;
  if(save.active!==id){save.active=id;round=null;current=null;chapter=0;}
  persistSave();applySettings();closeDialog();goMap();
}
async function onAction(action,target,event){
  if(action==='map'){goMap(true);return;}
  if(action==='play'){play();return;}
  if(action==='chapter'&&chapterOpen()){chapter=chapter?0:1;goMap(true);return;}
  if(action.startsWith('island-')){
    const index=Number(action.slice(7));
    if(round?.chapter===chapter&&round?.island===index&&current){play();return;}
    if(round&&current&&player()&&accessible(player().records[chapter],index)){
      openDialog('Changer d’île ?','<p>La série en cours s’arrêtera ici.</p><div class="dialog-actions">'+button('Rester','close')+button('Changer d’île','confirm-island-'+index,'arrow','primary')+'</div>','leave');
    } else start(index);
    return;
  }
  if(action.startsWith('confirm-island-')){closeDialog();start(Number(action.slice(15)));return;}
  switch(action){
    case 'profiles':profiles();return;
    case 'create':profiles(true);return;
    case 'settings':settings();return;
    case 'stats':stats();return;
    case 'install':installation();return;
    case 'close':closeDialog();return;
    case 'native-install':if(await pwa.install())installation();return;
    case 'update': {
      const note=$('#update-note');
      note.textContent='Recherche en cours…';
      const status=await pwa.check();
      if(!note.isConnected)return;
      note.textContent=status==='current'?'Tu utilises la version la plus récente.':status==='update'?'Une nouvelle version est disponible.':'La vérification est indisponible pour le moment.';
      if(status==='update') note.insertAdjacentHTML('afterend',button('Appliquer la mise à jour','apply-update','install'));
      return;
    }
    case 'apply-update':pwa.restart();return;
  }
  if(action.startsWith('select-')){switchProfile(action.slice(7));return;}
  if(action.startsWith('delete-')){
    const p=save.players.find(item=>item.id===action.slice(7));
    if(p) openDialog('Effacer ce profil ?','<p>La progression de <strong>'+esc(p.name)+'</strong> sera supprimée de cet appareil.</p><div class="dialog-actions">'+button('Annuler','profiles')+button('Effacer le profil','confirm-delete-'+p.id,'','danger')+'</div>','delete');
    return;
  }
  if(action.startsWith('confirm-delete-')){
    const id=action.slice(15);
    if(id===save.active){round=null;current=null;chapter=0;}
    remove(save,id);persistSave();applySettings();goMap();profiles();return;
  }
  if(!round||!current||page!=='game')return;
  if(action==='sound'){
    player().settings.sound=!prefs().sound;persistSave();applySettings();renderTask(false);
    $('.mute-button')?.focus({preventScroll:true});return;
  }
  if(action==='advance'){next();return;}
  if(action==='skip-example'&&current.example){beginTask();return;}
  if(action==='ferry-cross'||action==='ferry-back'){
    current.ferrySide=action==='ferry-cross'?'arrival':'source';renderTask(false);
    main.querySelector(action==='ferry-cross'?'.ferry-arrival button':'.ferry-button')?.focus({preventScroll:true});return;
  }
  if(current.feedback)return;
  if(action==='repeat'){audio.playVoice('n'+current.q.n);return;}
  if(action==='repeat-instruction'){audio.playVoice(...voiceClips(current.q,'instruction'));return;}
  if(action==='transcript'){current.transcript=!current.transcript;renderTask(false);$('.transcript')?.focus();return;}
  if(action==='show'){current.hidden=false;renderTask(false);$('.number-button')?.focus({preventScroll:true});return;}
  if(action.startsWith('answer-')){submit(Number(action.slice(7)));return;}
  if(action.startsWith('point-')){
    const index=Number(action.slice(6));
    if(current.marked.has(index))return;
    current.marked.add(index);current.markOrder.push(index);
    const total=current.marked.size;
    if(!audio.playVoice('n'+total))audio.chime('tap');
    redraw();
    if(total===current.q.n){
      main.querySelectorAll('.number-button').forEach(b=>b.disabled=false);
      if(event.detail===0) $('.number-button')?.focus({preventScroll:true});
    }else if(event.detail===0){$('.hit[tabindex="0"]')?.focus({preventScroll:true});}
    return;
  }
  if(action.startsWith('put-')||action.startsWith('take-')){
    if(event.detail>0)return;
    place(Number(action.slice(action.indexOf('-')+1)),action.startsWith('put-')?'basket':'stock',null,event.detail===0);
    return;
  }
  if(action.startsWith('paint-')){
    const index=Number(action.slice(6));
    if(current.selected.has(index)) current.selected.delete(index);
    else current.selected.add(index);
    audio.chime('tap');renderWorkspace('[data-action="'+action+'"]');return;
  }
  if(action.startsWith('order-')){
    current.order.push(Number(action.slice(6)));audio.chime('tap');renderWorkspace();
    if(event.detail===0) ($('[data-action^="order-"]:not(:disabled)')??$('.validate'))?.focus();
    return;
  }
  if(action==='undo-order'){current.order=[];renderWorkspace('[data-action^="order-"]');return;}
  if(action==='validate') submit(current.q.mode==='order'?current.order:current.selected.size);
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');
  if(button&&!button.disabled) void onAction(button.dataset.action,button,event);
});
document.addEventListener('change',event=>{
  const key=event.target.dataset.setting,p=player();
  if(!key||!p)return;
  p.settings[key]=event.target.checked;persistSave();applySettings();
  if(page==='game')renderTask(false);
  if(page==='map')redraw();
});
dialog.addEventListener('submit',event=>{
  if(event.target.id!=='new-player')return;
  event.preventDefault();
  const name=$('#player-name').value,avatar=Number(new FormData(event.target).get('avatar'));
  if(!add(save,name,avatar)){$('#profile-error').textContent=save.players.length>=12?'Le nombre maximal de profils est atteint.':'Écris un prénom ou un pseudo.';return;}
  const auto=nextAfterCreate;nextAfterCreate=false;
  round=null;current=null;chapter=0;persistSave();applySettings();closeDialog();goMap();
  if(auto) start(0);
});
bindDrag(main,place,()=>page==='game'?current:null);

applySettings();goMap();
