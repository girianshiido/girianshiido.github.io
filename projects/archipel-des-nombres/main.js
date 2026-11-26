import {islands,numbers,accessible,startRound,answer,advance,outcome,coreCount,finalIsland,roundSize,exampleTask,matches,practiceIslands,groupFor,groupComplete,groupOpen,legacyCount,finalPractice,activityInfo} from './engine.ts';
import {icon,collection,hitPositions,setCanvas,drawToken,drawBasket,drawBasketShells,loadObjects} from './art.js';
import {avatars,defaults,load,persist,add,remove,record} from './storage.js';
import * as audio from './audio.js';
import * as pwa from './pwa.js';
import {presentation,exampleHint,chapterTitle,voiceClips} from './lessons.js';
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
const prefs=()=>player()?.settings??save.preferences;
const voicesOn=(s=prefs())=>s.sound&&s.voice&&s.voiceVolume>0;
const range=chapter=>chapter?'6 à 10':'0 à 5';
const title=chapterTitle;
const portrait=(index,alt='')=>'<img class="portrait" src="./images/avatar-'+index+'.webp" alt="'+alt+'">';
const islandImage=(island,classes='')=>'<img class="'+classes+'" src="./images/island-'+island.art+'.webp" alt="" width="1280" height="854">';
const guideImage=(classes='')=>'<img class="'+classes+'" src="./images/guide.webp" alt="" width="512" height="512">';
const menuObjects={touch:'shell',pair:'lantern',echo:'pearl',same:'berry',cards:'shell',basket:'seed',color:'flower',change:'seed',compare:'fish',five:'pearl',hidden:'shell',ferry:'pearl',mix:'star'};
function activityIcon(item){
  const object=item.mode==='touch'?({ring:'fish',scatter:'star'}[item.fixed]??'shell'):menuObjects[item.mode];
  if(item.fixed==='hand')return '<img src="./images/hands/hand-2.webp" alt="" width="56" height="56">';
  if(item.basketChoices)return '<img src="./images/choice-basket.webp" alt="" width="56" height="56">';
  return object?'<img src="./images/objects/'+object+'.webp" alt="" width="56" height="56">':icon(item.icon);
}
const esc=value=>String(value).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const button=(label,action,glyph='',classes='secondary')=>'<button type="button" class="'+classes+'" data-action="'+action+'">'+(glyph?icon(glyph):'')+label+'</button>';
const tag=(glyph,label)=>icon(glyph)+'<span>'+label+'</span>';
let page='map',activeGroup=null,chapter=0,round=null,result=null,current=null,flashTimer=0,toastTimer=0,storageFailed=false,nextAfterCreate=null;
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
  document.body.dataset.view=page;
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
const chapterOpen=()=>!!player()&&(player().legacyChapterOpen||groupComplete(player().records[0],practiceIslands.length-1));
const firstIsland=records=>islands.slice(0,coreCount).findIndex((_,i)=>!records[i]?.mastery);
const groupProgress=(records,index)=>practiceIslands[index].activities.filter(i=>records[i]?.mastery).length;
function islandCard(island,index,records){
  const group=!chapter;
  const open=group?groupOpen(records,index):accessible(records,index,chapter);
  const done=group?groupComplete(records,index):!!records[index]?.mastery;
  const action=' data-action="'+(group?'group-':'island-')+index+'" '+(!open?'aria-disabled="true"':'');
  if(!group&&index>=coreCount)return '<button type="button" class="extra-island '+island.tone+'"'+action+'>'+
    '<span class="tile-icon">'+icon(island.icon)+'</span><span class="tile-body"><strong>'+island.title+'</strong><span class="tile-text">'+island.description+'</span></span>'+
    '<span class="tile-state" aria-label="'+(done?'Validé':open?'Jouer':'Verrouillé')+'">'+icon(done?'check':open?'arrowSmall':'lock')+'</span></button>';
  const badge=group?groupProgress(records,index)+' / '+island.activities.length+' activités':open&&!done?'À explorer':'';
  return '<button type="button" class="island '+island.tone+(!open?' locked':'')+'"'+action+'>'+
    '<span class="tile-illustration"><img src="./images/island-'+island.art+'.webp" alt="" width="480" height="360">'+
    (badge?'<span class="tile-current">'+badge+'</span>':'')+'</span>'+
    '<span class="tile-info"><span class="tile-icon">'+icon(island.icon)+'</span><span class="tile-body"><span class="tile-title">'+island.title+'</span><span class="tile-text">'+island.description+'</span></span>'+
    '<span class="tile-state" aria-label="'+(done?'Validée':open?'Ouvrir':'Verrouillée')+'">'+icon(done?'check':open?'arrowSmall':'lock')+'</span></span></button>';
}
function renderMap(){
  if(chapter&&!chapterOpen()) chapter=0;
  if(!chapter&&activeGroup!==null){renderGroup();return;}
  const records=player()?.records[chapter]??[];
  const visible=chapter?islands.slice(0,coreCount):practiceIslands;
  const completed=visible.filter((_,i)=>chapter?records[i]?.mastery:groupComplete(records,i)).length;
  const canResume=round&&round.chapter===chapter&&current;
  main.innerHTML='<div class="shell map-view"><section class="hero"><img class="hero-art" src="./images/archipel.webp" alt="" fetchpriority="high"><div class="hero-copy">'+
    '<span class="range">Compter de '+range(chapter)+'</span>'+
    '<h1 tabindex="-1" id="map-title">L’Archipel<br>des nombres</h1>'+
    '<p>Explore les îles, aide leurs habitants et allume le grand phare.</p>'+
    button(canResume?'Reprendre':completed===visible.length?'Rejouer':completed?'Continuer l’aventure':'Commencer l’aventure','play','arrow','primary hero-button')+
    '</div></section><section class="route" aria-labelledby="route-title"><div class="route-header">'+
    '<div><div class="kicker">Compter de '+range(chapter)+'</div><h2 id="route-title">'+title(chapter)+'</h2></div>'+
    '<div class="journey-progress"><div>'+completed+' / '+visible.length+' îles</div><progress value="'+completed+'" max="'+visible.length+'" aria-label="Îles validées"></progress></div></div>'+
    '<div class="island-grid">'+visible.map((island,i)=>islandCard(island,i,records)).join('')+'</div></section>'+
    '<section class="next-land"><span class="tile-icon '+(chapter?'peach':'sky')+'">'+icon(chapter?'map':'beacon')+'</span><div>'+
    '<h2>'+(chapter?'Les petites îles':'Au-delà du lagon')+'</h2><p>'+(chapter?'Retrouve les nombres de 0 à 5.':chapterOpen()?'Explore le parcours des nombres de 6 à 10.':'Rallume le grand phare pour ouvrir le parcours de 6 à 10.')+'</p></div>'+
    (chapterOpen()?button(chapter?'Revenir':'Explorer','chapter','arrow'):'<span class="future-lock" aria-label="Verrouillé">'+icon('lock')+'</span>')+'</section>'+
    (chapter?'<section class="extra-route" aria-labelledby="extra-title"><h2 id="extra-title">Ateliers à part</h2><div class="extra-grid">'+
    islands.slice(coreCount,legacyCount).map((island,i)=>islandCard(island,i+coreCount,records)).join('')+'</div></section>':'')+'</div>';
}
function renderGroup(){
  const group=practiceIslands[activeGroup],records=player()?.records[0]??[];
  const completed=groupProgress(records,activeGroup);
  const count=group.activities.length;
  main.innerHTML='<div class="shell map-view island-menu"><nav class="island-nav">'+button('Carte des îles','archipelago','back','text-button')+'</nav>'+
    '<section class="island-banner '+group.tone+'">'+
    '<div class="island-banner-copy"><span class="range">Île '+(activeGroup+1)+' / '+practiceIslands.length+'</span>'+
    '<h1 id="map-title" tabindex="-1">'+group.title+'</h1><p>'+group.description+'</p></div>'+
    '<div class="island-banner-illustration">'+islandImage(group,'island-banner-art')+'</div></section>'+
    '<div class="route-header"><h2>Activités</h2><div class="journey-progress"><div>'+completed+' / '+count+' validées</div>'+
    '<progress value="'+completed+'" max="'+count+'" aria-label="Activités validées"></progress></div></div>'+
    '<div class="activity-grid">'+group.activities.map(index=>{
      const item=activityInfo(chapter,index),available=accessible(records,index),mastered=records[index]?.mastery;
      const resumed=round?.chapter===0&&round.island===index&&current;
      const status=resumed?'Reprendre':mastered?'Validée':available?'Jouer':'Verrouillée';
      return '<button type="button" class="extra-island activity-tile '+item.tone+(mastered?' mastered':available?' ready':' locked')+'" data-action="island-'+index+'"'+(available?'':' aria-disabled="true"')+'>'+
        '<span class="activity-icon">'+activityIcon(item)+'</span><span class="tile-body"><strong>'+item.title+'</strong><span class="tile-text">'+item.description+'</span></span>'+
        '<span class="tile-state" aria-label="'+status+'">'+icon(mastered?'check':available?'arrowSmall':'lock')+'</span></button>';
    }).join('')+'</div></div>';
}
function openGroup(index){
  if(!practiceIslands[index])return;
  if(!groupOpen(player()?.records[0]??[],index)){toast('Valide les activités des îles précédentes pour ouvrir celle-ci.');return;}
  chapter=0;activeGroup=index;goMap(true);sectionFocus('map-title');
}
function start(index){
  const p=player();
  if(!p){nextAfterCreate=index;profiles(true);return;}
  if(!accessible(p.records[chapter],index,chapter)){toast('Valide l’activité précédente pour ouvrir celle-ci.');return;}
  if(!chapter)activeGroup=groupFor(index);
  round=startRound(chapter,index);
  page='game';result=null;chrome();beginTask(islands[index].mode!=='mix');
  window.scrollTo(0,0);
}
function play(){
  if(round&&current&&round.chapter===chapter){
    if(!chapter)activeGroup=groupFor(round.island);
    page='game';chrome();renderTask(!current.feedback&&!current.hidden);return;
  }
  const records=player()?.records[chapter]??[];
  if(!chapter){
    const index=practiceIslands.findIndex((_,i)=>!groupComplete(records,i));
    openGroup(index===-1?practiceIslands.length-1:index);
    return;
  }
  const index=firstIsland(records);
  start(index===-1?finalIsland:index);
}
function beginTask(example=false,justSucceeded=false){
  clearTimeout(flashTimer);
  if(!round)return;
  const q=example?exampleTask(round.chapter,round.island):round.tasks[round.index];
  const supply=q.mode==='change'?Math.max(q.n,q.start)+2:q.mode==='pair'?q.n+2:Math.max(round.chapter?12:8,q.n+2);
  current={q,example,justSucceeded,supply,marked:new Set(),markOrder:[],selected:new Set(q.mode==='change'?Array.from({length:q.start},(_,i)=>i):[]),
    slots:new Map(),order:[],hidden:false,showCountingHelp:false,feedback:null,note:'',transcript:!voicesOn(),ferrySide:'source'};
  revision++;renderTask(true);
  audio.playVoice(...voiceClips(q,example?'example':islands[round.island].mode==='mix'?'review':'question'));
}
function canvas(n,layout,token,seed,classes='',hidden=false){
  return '<canvas class="count-canvas '+classes+'" aria-hidden="true" data-n="'+n+'" data-layout="'+layout+'" data-token="'+token+'" data-seed="'+seed+'"'+(hidden?' data-hidden="true"':'')+'></canvas>';
}
function numeric(q,disabled=false){
  return '<div class="answers'+(q.choices.length>4?' answers-all':'')+'" aria-label="Réponses proposées">'+q.choices.map(n=>'<button type="button" class="number-button" data-action="answer-'+n+'" '+(disabled?'disabled':'')+'>'+n+'</button>').join('')+'</div>';
}
const auditory=q=>q.mode==='echo'||q.mode==='hear'||q.oral;
function audioCue(q){
  const name=current.transcript?numbers[q.n]:'Écouter le nombre';
  return voicesOn()
    ?button('<span class="sound-button-icon">'+icon('sound')+'</span><span>'+name+'</span>','repeat','','sound-button')
    :'<span class="sound-button sound-word">'+name+'</span>';
}
function basketFigure(n){
  return '<span class="basket-choice-figure" aria-hidden="true"><img src="./images/choice-basket.webp" width="320" height="320" alt="" draggable="false">'+
    (n?'<canvas data-shells="'+n+'"></canvas>':'')+'</span>';
}
function basketChoices(q){
  const labels=['Panier de gauche','Panier du milieu','Panier de droite'];
  return '<div class="basket-choices" role="group" aria-label="Paniers proposés">'+q.choices.map((n,i)=>
    '<button type="button" class="basket-choice" data-action="answer-'+n+'" aria-label="'+labels[i]+'">'+basketFigure(n)+'</button>'
  ).join('')+'</div>';
}
function collectionContents(q,n,layout,seed){
  return canvas(n,layout,q.token,seed,'mini-canvas')+(n===0?'<span class="collection-empty">Vide</span>':'');
}
function collectionCard(q,n,label,layout,seed,answer,extra=''){
  const contents=collectionContents(q,n,layout,seed);
  return answer===undefined?'<div class="collection-card '+extra+'">'+contents+'<span class="collection-label">'+label+'</span></div>':
    '<button type="button" class="collection-card '+extra+'" aria-label="'+label+'" data-action="answer-'+answer+'">'+contents+'</button>';
}
function collectionChoices(q){
  const layouts=q.mode==='same'?['ring','scatter','clusters']:['line','ring','scatter','clusters'];
  return '<div class="collection-options" data-options="'+q.choices.length+'" aria-label="Collections proposées">'+q.choices.map((n,i)=>{
    const layout=q.fixed??layouts[(q.seed+n)%layouts.length];
    return collectionCard(q,n,'Collection '+(i+1),layout,q.seed+n,n);
  }).join('')+'</div>';
}
function comparison(q,reveal=false){
  const {left,right,ask}=q.comparison;
  const select=ask!=='equal'&&!reveal;
  return '<div class="comparison-grid">'+
    collectionCard(q,left,reveal?'À gauche · '+left:'Groupe de gauche','line',q.seed,select?0:undefined)+
    collectionCard(q,right,reveal?'À droite · '+right:'Groupe de droite','ring',q.seed+21,select?2:undefined)+'</div>'+
    (reveal?'':'<div class="comparison-options">'+button('Autant','answer-1','')+(ask==='equal'?button('Différent','answer-0',''):'')+'</div>');
}
function glanceFigure(q,classes,hidden=false){
  if(q.layout!=='hand')return canvas(q.n,q.layout,q.token,q.seed,classes,hidden);
  return hidden?'':'<img class="hand-figure" src="./images/hands/hand-'+q.n+'.webp" width="320" height="320" alt="Main à observer" draggable="false">';
}
function taskBody(){
  const state=current,q=state.q;
  switch(q.mode){
    case 'touch':{
      const guided=!q.independent||state.showCountingHelp;
      const canAsk=q.independent&&!guided&&q.n>0&&round.index>=round.planned;
      return '<div class="scene sea" id="point-scene">'+canvas(q.n,q.layout,q.token,q.seed,guided?'point-canvas':'')+
        (guided?'<div class="hit-layer"></div>':'')+(q.n===0?'<span class="empty-scene">Aucun objet</span>':'')+'</div>'+
        numeric(q,guided&&state.marked.size!==q.n)+(canAsk?'<div class="count-help">'+button('M’aider à compter','count-help','','text-button')+'</div>':'');
    }
    case 'echo':return '<div class="scene cave sound-scene">'+audioCue(q)+'</div>'+numeric(q);
    case 'hear':{
      const prompt='<div class="audio-prompt">'+audioCue(q)+'</div>';
      return q.basketChoices?'<div class="basket-task">'+prompt+basketChoices(q)+'</div>':prompt+collectionChoices(q);
    }
    case 'cards':return collectionChoices(q);
    case 'same':
      return '<div class="model-collection">'+collectionCard(q,q.n,'Modèle',q.fixed??'line',q.seed,undefined,'model-card')+'</div>'+collectionChoices(q);
    case 'compare':return comparison(q);
    case 'five':return '<div class="scene lagoon">'+canvas(q.start,'frame',q.token,q.seed)+'</div>'+numeric(q);
    case 'hidden':return '<div class="hidden-total">En tout <strong>'+q.total+'</strong></div><div class="comparison-grid">'+
      collectionCard(q,q.start,'Visible','line',q.seed)+'<div class="chest-scene"><div class="chest-art" aria-hidden="true"><span>?</span></div><span class="collection-label">Dans le coffre</span></div></div>'+numeric(q);
    case 'glance':
      return '<div class="scene lagoon">'+glanceFigure(q,'glance-canvas',state.hidden)+(q.n===0&&q.layout!=='hand'?'<span class="empty-scene">Aucun objet</span>':'')+
        (state.hidden?'<div class="glance-cover">'+button('Revoir la figure','show','dice')+'</div>':'')+'</div>'+numeric(q);
    case 'ferry':
      if(state.ferrySide==='source')return '<div class="ferry-source"><div class="scene lagoon"><span class="scene-label">Le premier quai</span>'+
        canvas(q.n,q.layout,q.token,q.seed)+'</div>'+button('Traverser','ferry-cross','arrow','primary ferry-button')+'</div>';
      return '<div class="ferry-arrival"><span>'+icon('beacon')+' Le second quai</span>'+button('Revoir le premier quai','ferry-back','back','text-button')+
        '</div>'+manipulation();
    case 'basket':return (q.oral?'<div class="audio-prompt">'+audioCue(q)+'</div>':'')+manipulation();
    case 'pair':
    case 'change':
    case 'color':
    case 'order':return manipulation();
  }
}
function workspaceNeedsSubmission(mode){
  return mode==='basket'||mode==='color'||mode==='change'||mode==='ferry';
}
function manipulation(){
  return '<div id="workspace" class="manipulation"></div>'+
    (workspaceNeedsSubmission(current.q.mode)?button('J’ai fini','validate','check','primary validate'):'');
}
function renderTask(schedule){
  if(!round||!current) return;
  page='game';
  const q=current.q, info=presentation(q), p=prefs(), island=activityInfo(round.chapter,round.island);
  const hint=current.showCountingHelp?'Touche chaque objet une fois, puis choisis le dernier nombre.':info.hint;
  if(auditory(q)&&!voicesOn(p)) current.transcript=true;
  const retry=round.index>=round.planned;
  const count=current.example?'Exemple':retry?'Nouvel essai':(round.index+1)+' / '+round.planned;
  const progress=Array.from({length:round.planned},(_,i)=>'<span class="'+(i<round.index?'done':i===round.index&&!current.example?'here':'')+'"></span>').join('');
  main.innerHTML='<div class="shell game-view"><div class="game-top">'+button('Carte','map','back','text-button')+
    '<span class="game-island">'+icon(island.icon)+' '+island.title+'</span>'+
    '<span class="step-label">'+(current.justSucceeded&&!current.feedback?'<span class="step-success" role="status" aria-label="Bonne réponse">'+icon('check')+'</span>':'')+count+'</span></div>'+
    '<div class="steps" role="img" aria-label="'+count+'">'+progress+'</div>'+
    '<section class="game-card '+island.tone+'">'+
    '<div class="game-heading"><div class="prompt-copy">'+(current.example||retry?'<span class="kicker">'+(current.example?'Exemple guidé':'Nouvel essai')+'</span>':'')+
    '<h1 tabindex="-1" id="task-title">'+info.prompt+'</h1><p>'+(current.example?exampleHint(q,round.chapter):hint)+'</p></div>'+
    '<div class="game-setting">'+islandImage(island,'game-setting-art')+guideImage('game-guide')+'</div>'+
    '<div class="sound-tools">'+button('', 'sound',p.sound?'sound':'mute','icon-button mute-button')+
    (voicesOn(p)&&!current.feedback?button('Consigne','repeat-instruction','sound','text-button replay')+
      (auditory(q)?button(current.transcript?'Masquer le mot':'Lire le mot','transcript','','text-button transcript'):''):'')+
    '</div></div><div class="play-board"><div id="task-body">'+(current.feedback?feedbackBody():taskBody())+'</div>'+
    (current.example&&!current.feedback?'<div class="example-controls"><p id="example-note" role="status">'+current.note+'</p>'+
      button('Passer l’exemple','skip-example','','text-button')+'</div>':'')+'</div></section></div>';
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
    const rowClass=wicker?'token-row basket-grid':'token-row';
    const rowStyle=wicker?' style="--basket-rows:'+(round.chapter?3:2)+'"':'';
    const tokenRow='<div class="'+rowClass+'"'+rowStyle+'>'+(placed||'<span class="basket-empty">'+(q.n===0?'Le panier est vide':wicker?'Dépose ici':'Dépose les objets ici')+'</span>')+'</div>';
    const deposit=wicker?'<div class="wicker-basket" data-drop="basket"><canvas class="wicker-art" aria-hidden="true"></canvas>'+tokenRow+'</div>':tokenRow;
    root.innerHTML='<section class="drop-area stock" data-drop="stock"><h2>'+stockLabel+'</h2><div class="token-row">'+stock+'</div></section>'+
      '<section class="drop-area basket'+(paired?' pairing':wicker?' wicker-area':'')+'"'+(wicker?'':' data-drop="basket"')+'><h2>'+
      (wicker?'Ton panier':paired?icon('lamp')+'Le pont':icon('beacon')+'Dépose tes perles ici')+'</h2>'+
      (paired?lanes:deposit)+'</section>';
  }
  if(focusSelector) (root.querySelector(focusSelector)||$('.validate'))?.focus({preventScroll:true});
  drawSmallTokens();
}
function workspaceValue(){
  return current.q.mode==='order'?current.order:current.selected.size;
}
function updateWorkspace(focusSelector){
  const q=current.q;
  const orderComplete=q.mode==='order'&&current.order.length===q.order.length;
  const bridgeComplete=q.mode==='pair'&&current.selected.size===q.n;
  if(orderComplete||bridgeComplete){
    submit(workspaceValue());
    return;
  }
  audio.chime('tap');
  renderWorkspace(focusSelector);
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
  for(const node of main.querySelectorAll('.basket-choice-figure canvas')){
    drawBasketShells(node,Number(node.dataset.shells));
  }
  for(const node of main.querySelectorAll('.count-canvas')){
    const d=node.dataset;
    let marked=null;
    if(node.classList.contains('point-canvas')){
      marked=current.marked;
      marked.order=current.markOrder;
    }else if(node.classList.contains('feedback-canvas')&&current.q.independent){
      const order=Array.from({length:current.q.n},(_,i)=>i);
      marked=new Set(order);
      marked.order=order;
    }
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
function explanation(q,value){
  if(q.mode==='order')return 'Dans cet ordre, chaque nombre est plus grand que celui qui le précède.';
  if(q.mode==='change')return 'Il y avait '+q.start+'. '+(q.n>q.start?'Avec un de plus':'Avec un de moins')+', il y en a '+q.n+'.';
  if(q.mode==='pair')return 'Il faut mettre une lanterne sous chacune des '+q.n+' feuilles.';
  if(q.mode==='ferry')return 'Tu as déposé '+value+' perles. Sur le premier quai, il y en avait '+q.n+'.';
  if(q.mode==='compare'){
    const {left,right}=q.comparison;
    return 'Il y en a '+left+' à gauche et '+right+' à droite. '+(left===right?'Les deux groupes ont la même quantité.':(left>right?'Le groupe de gauche':'Le groupe de droite')+' en a plus.');
  }
  if(q.mode==='five')return 'Il y avait '+q.start+' objets. Il en manquait '+q.n+' pour arriver à cinq.';
  if(q.mode==='hidden')return 'Il y en a '+q.start+' dehors et '+q.n+' dans le coffre. Cela fait '+q.total+' en tout.';
  if(q.layout==='hand')return q.n===0?'Aucun doigt n’est levé. Cela fait zéro.':'Il y a '+q.n+' doigt'+(q.n===1?'':'s')+' levé'+(q.n===1?'':'s')+'.';
  if(q.basketChoices)return q.n===0?'Le panier vide contient zéro coquillage.':
    'Le bon panier contient '+q.n+' coquillage'+(q.n===1?'': 's')+'.';
  if(q.n===0)return 'Zéro veut dire qu’il n’y a aucun objet.';
  if(q.mode==='basket'||q.mode==='color')return 'Ta collection en contient '+value+'. Il en fallait '+q.n+'.';
  if(q.mode==='echo')return 'Tu as entendu « '+numbers[q.n]+' ». Le chiffre est '+q.n+'.';
  return 'On en compte '+q.n+' en tout.';
}
function feedbackBody(){
  const {q,feedback}=current;
  const media=q.mode==='compare'?comparison(q,true):q.mode==='order'
    ?'<div class="answer-demo">'+[...q.order].sort((a,b)=>a-b).map(n=>'<span>'+n+'</span>').join('<b aria-hidden="true">›</b>')+'</div>'
    :'<div class="answer-demo">'+(q.basketChoices?basketFigure(q.n):q.mode==='echo'?'':glanceFigure(q,'feedback-canvas'))+'<span>'+q.n+'</span></div>';
  return '<div class="feedback guided"><div class="feedback-title"><span>'+icon('spark')+'</span><div>'+
    '<h2 id="feedback-title" tabindex="-1">Observons ensemble</h2><p>'+explanation(q,feedback.value)+'</p></div></div>'+
    media+'<p class="retry-note">'+(round.index<round.planned?'Tu retrouveras une variante en fin de série.':'Tu pourras retravailler cette activité.')+'</p>'+
    button('Continuer','advance','arrow','primary feedback-next')+'</div>';
}
function submit(value){
  if(!current||!round||current.feedback)return;
  const example=current.example;
  const correct=example?matches(current.q,value):answer(round,value);
  if(correct===null)return;
  if(current.example&&!correct){
    current.note=explanation(current.q,value,false)+' Essaie encore.';
    $('#example-note').textContent=current.note;
    audio.chime('guide');
    return;
  }
  audio.stop();
  if(correct){
    next(true);
    if(page==='game'||!result?.mastery)audio.chime('good',true);
    return;
  }
  clearTimeout(flashTimer);
  current.feedback={value};
  audio.chime('guide');
  player().records[round.chapter][round.island].errors++;
  persistSave();
  renderTask(false);
  sectionFocus('feedback-title');
}
function next(justSucceeded=false){
  if(!round||!current||(!current.example&&!round.answered))return;
  if(current.example||advance(round)){beginTask(false,justSucceeded);return;}
  const done=outcome(round),p=player();
  record(p,round.chapter,round.island,done);persistSave();
  result={...done,island:round.island,chapter:round.chapter};
  current=null;round=null;page='result';chrome();renderResult();
  if(done.mastery)audio.chime('finish');
}
function renderResult(){
  const r=result,records=player().records[r.chapter],name=activityInfo(r.chapter,r.island);
  const group=r.chapter?-1:groupFor(r.island);
  const activities=r.chapter?[]:practiceIslands[group].activities;
  const complete=!r.chapter&&groupComplete(records,group);
  const end=r.chapter?r.island===finalIsland:r.island===finalPractice&&complete;
  const nextActivity=r.chapter?(r.island<finalIsland?r.island+1:undefined):
    activities.find(id=>!records[id].mastery&&accessible(records,id));
  let headline='Ta série est terminée',primary=button('Rejouer','island-'+r.island,'arrow','primary');
  let message='Pour valider, il faut '+Math.ceil(.8*r.total)+' réussites du premier coup sur '+r.total+'.';
  if(r.mastery){
    headline=end?'Le grand phare brille !':complete?'Île validée !':'Activité validée !';
    if(end&&!r.chapter){
      message='Tu peux maintenant explorer les nombres de 6 à 10.';
      primary=button('Explorer le lagon','chapter','arrow','primary');
    }else if(nextActivity!==undefined){
      message=activityInfo(r.chapter,nextActivity).title+' est disponible.';
      primary=button(r.chapter?'Île suivante':'Activité suivante','island-'+nextActivity,'arrow','primary');
    }else if(complete&&group+1<practiceIslands.length&&groupOpen(records,group+1)){
      message=practiceIslands[group+1].title+' est ouverte.';
      primary=button('Île suivante','group-'+(group+1),'arrow','primary');
    }else{
      message=end?'Tu as parcouru les îles de 6 à 10.':'Tu peux rejouer cette activité quand tu veux.';
      primary=button(r.chapter?'Retour à la carte':'Retour aux activités','map','arrow','primary');
    }
  }
  const tally=Array.from({length:r.total},(_,i)=>'<span'+(i<r.first?' class="earned"':'')+'></span>').join('');
  main.innerHTML='<div class="shell result-view"><section class="result-card '+name.tone+(end&&r.mastery?' lighthouse-win':'')+'">'+
    '<div class="result-art">'+islandImage(name,'result-place')+guideImage('result-guide')+'</div>'+
    '<div class="result-copy"><div class="result-emblem">'+icon(r.mastery?'beacon':'shell')+'</div>'+
    '<h1 id="result-title" tabindex="-1">'+headline+'</h1><p>'+message+'</p><div class="score"><strong>'+r.first+' / '+r.total+'</strong><span>réussites du premier coup</span><div class="score-marks" aria-hidden="true">'+tally+'</div></div>'+
    '<div class="result-actions">'+primary+(primary.includes('data-action="map"')?'':button(r.chapter?'Carte':'Activités','map','map'))+'</div></div></section></div>';
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
  updateWorkspace(keyboard?'[data-item="'+index+'"]':undefined);
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
dialog.addEventListener('close',()=>{
  if(opener?.isConnected)opener.focus();
  opener=null;nextAfterCreate=null;
});
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
  const toggle=([key,label,detail])=>'<label class="setting"><span><strong>'+label+'</strong><small>'+detail+'</small></span>'+
    '<input type="checkbox" role="switch" data-setting="'+key+'" '+(s[key]?'checked':'')+'><i></i></label>';
  const slider=([key,label])=>'<label class="volume-setting"><span>'+label+'<span data-level="'+key+
    '" aria-hidden="true">'+s[key]+' %</span></span><input type="range" data-setting="'+key+
    '" aria-label="'+label+'" aria-valuetext="'+s[key]+' %" min="0" max="100" value="'+s[key]+'"></label>';
  const sounds=[
    ['sound','Son général','Musique, voix et bruitages.'],
    ['music','Musique de fond','Brise du lagon.'],
    ['voice','Voix française','Consignes et nombres parlés.'],
  ];
  const volumes=[['musicVolume','Volume de la musique'],['voiceVolume','Volume des voix'],['effectsVolume','Volume des bruitages']];
  const display=[
    ['motion','Animations','Adoucit les apparitions et les changements d’écran.'],
    ['large','Grands objets','Agrandit les objets à compter.'],
    ['contrast','Contraste renforcé','Renforce la lisibilité des contours et des textes.'],
    ['flash','Figures éclair','Masque certaines petites figures après un instant. Elles peuvent être revues à volonté.'],
  ];
  openDialog('Réglages','<fieldset class="sound-settings"><legend>Audio</legend>'+sounds.map(toggle).join('')+
    '<div class="volume-settings">'+volumes.map(slider).join('')+'</div></fieldset>'+
    '<fieldset class="display-settings"><legend>Affichage et jeu</legend>'+display.map(toggle).join('')+'</fieldset>'+
    '<div class="dialog-actions">'+button('Vérifier les mises à jour','update','install')+'</div><p id="update-note" role="status"></p>','settings');
}
function stats(){
  const p=player();
  openDialog('Carnet de suivi',p?'<p>Progression de <strong>'+esc(p.name)+'</strong>. Il faut réussir au premier essai au moins 80 % d’une série pour valider l’activité. Chaque île compte six activités de 0 à 5.</p>'+
    p.records.map((records,c)=>'<h3>'+title(c)+' · '+range(c)+'</h3><ul class="stats-list">'+(c?records.map((_,i)=>i):practiceIslands.flatMap(group=>group.activities)).map(i=>{
      const r=records[i];
      const total=roundSize(c,i);
      return '<li><span>'+activityInfo(c,i).title+(r.mastery?'<small>Validée</small>':'')+'</span><span>'+(r.rounds||r.errors?'<strong>'+r.first+' / '+total+'</strong><small>'+r.errors+' erreur'+(r.errors===1?'':'s')+' · '+r.rounds+' série'+(r.rounds===1?'':'s')+'</small>':'<small>À découvrir</small>')+'</span></li>';
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
  if(save.active!==id){save.active=id;round=null;current=null;chapter=0;activeGroup=null;}
  persistSave();applySettings();closeDialog();goMap();
}
async function onAction(action,target,event){
  if(action==='map'){goMap(true);return;}
  if(action==='play'){play();return;}
  if(action==='archipelago'){activeGroup=null;goMap(true);sectionFocus('map-title');return;}
  if(action.startsWith('group-')){openGroup(Number(action.slice(6)));return;}
  if(action==='chapter'&&chapterOpen()){chapter=chapter?0:1;activeGroup=null;goMap(true);return;}
  if(action.startsWith('island-')){
    const index=Number(action.slice(7));
    if(round?.chapter===chapter&&round.island===index&&current){play();return;}
    if(round&&current&&player()&&accessible(player().records[chapter],index,chapter)){
      openDialog('Changer d’activité ?','<p>La série en cours s’arrêtera ici.</p><div class="dialog-actions">'+button('Rester','close')+button('Changer d’activité','confirm-island-'+index,'arrow','primary')+'</div>','leave');
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
    if(id===save.active){round=null;current=null;chapter=0;activeGroup=null;}
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
  if(action==='count-help'&&current.q.independent&&round.index>=round.planned){
    current.showCountingHelp=true;
    renderTask(false);
    $('.hit')?.focus({preventScroll:true});
    return;
  }
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
    updateWorkspace('[data-action="'+action+'"]');return;
  }
  if(action.startsWith('order-')){
    current.order.push(Number(action.slice(6)));
    updateWorkspace(event.detail===0?'[data-action^="order-"]:not(:disabled)':undefined);
    return;
  }
  if(action==='undo-order'){current.order=[];renderWorkspace('[data-action^="order-"]');return;}
  if(action==='validate'&&workspaceNeedsSubmission(current.q.mode))submit(workspaceValue());
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');
  if(button&&!button.disabled) void onAction(button.dataset.action,button,event);
});
function changeSetting(input){
  const key=input.dataset.setting;
  if(!Object.hasOwn(defaults,key))return false;
  const s=prefs();
  if(input.type==='range'){
    s[key]=input.valueAsNumber;
    const percentage=s[key]+' %';
    dialog.querySelector('[data-level="'+key+'"]').textContent=percentage;
    input.setAttribute('aria-valuetext',percentage);
  }else s[key]=input.checked;
  applySettings();
  return true;
}
dialog.addEventListener('input',event=>{
  if(event.target.type==='range')changeSetting(event.target);
});
dialog.addEventListener('change',event=>{
  if(!changeSetting(event.target))return;
  persistSave();
  if(page==='game')renderTask(false);
});
dialog.addEventListener('submit',event=>{
  if(event.target.id!=='new-player')return;
  event.preventDefault();
  const name=$('#player-name').value,avatar=Number(new FormData(event.target).get('avatar'));
  if(!add(save,name,avatar)){$('#profile-error').textContent=save.players.length>=12?'Le nombre maximal de profils est atteint.':'Écris un prénom ou un pseudo.';return;}
  const auto=nextAfterCreate;nextAfterCreate=null;
  round=null;current=null;chapter=0;persistSave();applySettings();closeDialog();goMap();
  if(auto!==null)start(auto);
});
bindDrag(main,place,()=>page==='game'?current:null);

loadObjects(()=>requestAnimationFrame(redraw));
applySettings();goMap();
