import {islands,numbers,accessible,startRound,answer,advance,outcome} from './engine.js';
import {icon,collection,hitPositions,setCanvas,drawToken} from './art.js';
import {avatars,defaults,load,persist,add,remove,record} from './storage.js';
import * as audio from './audio.js';
import * as pwa from './pwa.js';

const $=selector=>document.querySelector(selector);
const main=$('#main'),header=$('#header'),footer=$('#footer'),dialog=$('#dialog');
const save=load();
const player=()=>save.players.find(p=>p.id===save.active);
const prefs=()=>player()?.settings??defaults;
const range=chapter=>chapter?'6 à 10':'0 à 5';
const title=chapter=>chapter?'Au-delà du lagon':'Les petites îles';
const esc=value=>String(value).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const button=(label,action,glyph='',classes='secondary')=>'<button type="button" class="'+classes+'" data-action="'+action+'">'+(glyph?icon(glyph):'')+label+'</button>';
const tag=(glyph,label)=>icon(glyph)+'<span>'+label+'</span>';
let page='map',chapter=0,round=null,result=null,current=null,flashTimer=0,toastTimer=0,storageFailed=false,nextAfterCreate=false;
let revision=0, suppressedClick=false, opener=null;

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
    '<button type="button" data-action="map" class="toplink map-link"'+view+'>'+tag('map','Carte')+'</button>'+
    '<button type="button" class="toplink" data-action="settings" aria-label="Réglages">'+tag('settings','Réglages')+'</button>'+
    '<button type="button" class="toplink profile-link" data-action="profiles" aria-label="Joueurs'+(p?' · '+esc(p.name):'')+'">'+(p?'<span class="mini-avatar" aria-hidden="true">'+avatars[p.avatar]+'</span><span class="profile-name">'+esc(p.name)+'</span>':tag('user','Joueurs'))+'</button></nav></div>';
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
const chapterOpen=()=>!!player()?.records[0][5].mastery;
function renderMap(){
  if(chapter&&!chapterOpen()) chapter=0;
  const p=player(),records=p?.records[chapter]??[],completed=records.filter(entry=>entry.mastery).length;
  const active=islands.findIndex((_,i)=>!records[i]?.mastery);
  const canResume=round&&round.chapter===chapter&&current&&!result;
  main.innerHTML='<div class="shell map-view"><section class="hero"><img class="hero-art" src="./images/archipel.png" alt="" fetchpriority="high"><div class="hero-copy">'+
    '<span class="range">'+icon('spark')+' Compter de '+range(chapter)+'</span>'+
    '<h1 tabindex="-1" id="map-title">L’Archipel<br>des nombres<span>.</span></h1>'+
    '<p>Pars d’île en île, retrouve les nombres et rallume le grand phare.</p>'+
    button(canResume?'Reprendre':active===-1?'Rejouer au phare':completed?'Continuer l’aventure':'Commencer l’aventure','play','arrow','primary hero-button')+
    '</div></section><section class="route" aria-labelledby="route-title"><div class="route-header">'+
    '<div><div class="kicker">Le parcours · '+range(chapter)+'</div><h2 id="route-title">'+title(chapter)+'</h2></div>'+
    '<div class="journey-progress"><div>'+icon('spark')+' '+completed+' île'+(completed>1?'s':'')+' sur 6</div><progress value="'+completed+'" max="6" aria-label="Îles validées"></progress></div></div>'+
    '<div class="island-grid">'+islands.map((island,i)=>{
      const open=accessible(records.length?records:[{mastery:false}],i);
      const done=!!records[i]?.mastery;
      return '<button type="button" class="island '+island.tone+(!open?' locked':'')+'" data-action="island-'+i+'" '+(!open?'aria-disabled="true"':'')+'>'+
        '<span class="tile-icon">'+icon(island.icon)+'</span><span class="tile-body"><span class="tile-title">'+island.title+'</span><span class="tile-text">'+island.description+'</span></span>'+
        '<span class="tile-state" aria-label="'+(done?'Validée':open?'Jouer':'Verrouillée')+'">'+icon(done?'check':open?'arrowSmall':'lock')+'</span></button>';
    }).join('')+'</div></section>'+
    '<section class="next-land"><span class="tile-icon '+(chapter?'peach':'sky')+'">'+icon(chapter?'map':'beacon')+'</span><div>'+
    '<h2>'+(chapter?'Les petites îles':'Au-delà du lagon')+'</h2><p>'+(chapter?'Retrouve les nombres de 0 à 5.':chapterOpen()?'De nouvelles îles t’attendent, avec les nombres de 6 à 10.':'Rallume le grand phare pour partir à la découverte des nombres de 6 à 10.')+'</p></div>'+
    (chapterOpen()?button(chapter?'Revenir':'Explorer','chapter','arrow'):('<span class="future-lock" aria-label="Verrouillé">'+icon('lock')+'</span>'))+'</section></div>';
}
function start(index){
  const p=player();
  if(!p){nextAfterCreate=true;profiles(true);return;}
  if(!accessible(p.records[chapter],index)){toast('Termine l’île précédente pour ouvrir celle-ci.');return;}
  round=startRound(chapter,index);
  page='game';result=null;chrome();beginTask();
  window.scrollTo(0,0);
}
function play(){
  if(round&&current&&round.chapter===chapter){
    page='game';chrome();renderTask(false);return;
  }
  const index=player()?.records[chapter].findIndex(entry=>!entry.mastery)??0;
  start(index===-1?5:index);
}
function presentation(task){
  const word=numbers[task.n],label=task.n===1?'objet':'objets';
  switch(task.mode){
    case 'touch':return {name:'Compte un par un',prompt:'Combien y en a-t-il ?',hint:task.n?'Touche chaque objet une fois. Puis choisis le total.':'La plage est vide. Choisis le nombre qui dit « aucun objet ».'};
    case 'echo':return {name:'Écoute le nombre',prompt:'Quel nombre entends-tu ?',hint:'Écoute, puis touche le chiffre.'};
    case 'cards':return {name:'Retrouve la collection',prompt:'Choisis la bonne carte',hint:'Écoute le nombre, puis trouve la carte qui contient autant d’objets.'};
    case 'glance':return {name:'Un coup d’œil',prompt:'Combien en vois-tu ?',hint:'Regarde la figure, puis choisis le total.'};
    case 'same':return {name:'Autant d’objets',prompt:'Trouve une collection qui en a autant',hint:'Observe le modèle. La place des objets peut changer.'};
    case 'basket':return {name:'Fais une collection',prompt:'Mets '+task.n+' '+label+' dans le panier',hint:'Touche ou fais glisser les objets. Touche un objet du panier pour le remettre en réserve.'};
    case 'color':return {name:'Colorie les cases',prompt:'Colorie '+task.n+' '+(task.n===1?'case':'cases'),hint:'Touche les cases pour les colorier. Tu peux aussi effacer.'};
    case 'pair':return {name:'Une lumière pour chacun',prompt:'Donne une lumière à chaque feuille',hint:'Regarde les feuilles. Mets juste autant de lumières dans le pont.'};
    case 'change':return {name:'Un de plus ou de moins',prompt:(task.n>task.start?'Ajoute un objet au panier':'Enlève un objet du panier'),hint:'Change le panier d’un seul objet, puis valide.'};
    case 'order':return {name:'Remets les nombres en ordre',prompt:'Range du plus petit au plus grand',hint:'Touche les nombres dans l’ordre. Touche une case remplie pour recommencer.'};
  }
}
function beginTask(){
  clearTimeout(flashTimer);
  const q=round.tasks[round.index];
  const supply=q.mode==='change'?Math.max(q.n,q.start)+2:Math.max(round.chapter?12:8,q.n+2);
  current={q,supply,marked:new Set(),markOrder:[],selected:new Set(q.mode==='change'?Array.from({length:q.start},(_,i)=>i):[]),
    order:[],hidden:false,feedback:null,transcript:false};
  revision++;renderTask(true);
  announce();
}
function announce(){
  if(!current) return;
  const q=current.q;
  if(q.mode==='echo'||q.mode==='cards') audio.say(numbers[q.n],q.n);
  else audio.say(presentation(q).prompt);
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
    case 'echo':
      return '<div class="scene cave sound-scene">'+button(state.transcript?numbers[q.n]:'Écouter le nombre','repeat','sound','sound-button')+'</div>'+numeric(q);
    case 'cards':
    case 'same':
      return (q.mode==='same'?'<div class="scene lagoon small-scene"><span class="scene-label">Le modèle</span>'+canvas(q.n,q.layout,q.token,q.seed)+'</div>':
        '<div class="scene cave small-sound">'+button(state.transcript?numbers[q.n]:'Écouter le nombre','repeat','sound','sound-button')+'</div>')+
        '<div class="answer-cards" aria-label="Cartes proposées">'+q.choices.map((n,i)=>'<button type="button" class="picture-card" data-action="answer-'+n+'" aria-label="Carte '+(i+1)+'">'+canvas(n,['line','scatter','arc','clusters'][(q.seed+i)%4],q.mode==='same'?'fish':q.token,q.seed+i*19,'mini-canvas')+
        (n===0?'<span class="empty-card">Vide</span>':'')+'</button>').join('')+'</div>';
    case 'glance':
      return '<div class="scene lagoon">'+canvas(q.n,q.layout,q.token,q.seed,'glance-canvas',state.hidden)+(q.n===0?'<span class="empty-scene">Aucun objet</span>':'')+
        (state.hidden?'<div class="glance-cover">'+button('Revoir la figure','show','dice')+'</div>':'')+'</div>'+numeric(q);
    case 'basket':
    case 'pair':
    case 'change':
      return '<div id="workspace" class="manipulation"></div>'+button('Valider','validate','check','primary validate');
    case 'color':
      return '<div id="workspace" class="manipulation"></div>'+button('Valider','validate','check','primary validate');
    case 'order':
      return '<div id="workspace" class="manipulation"></div>'+button('Valider','validate','check','primary validate');
  }
}
function renderTask(schedule){
  if(!round||!current) return;
  page='game';
  const q=current.q, info=presentation(q), p=prefs();
  if((q.mode==='echo'||q.mode==='cards')&&(!p.sound||!p.voice)) current.transcript=true;
  const retry=round.index>=round.planned;
  main.innerHTML='<div class="shell game-view"><div class="game-top">'+button('Carte','map','back','text-button')+
    '<span class="game-island">'+icon(islands[round.island].icon)+' '+islands[round.island].title+'</span>'+
    '<span class="step-label">'+(retry?'Nouvel essai':(round.index+1)+' / '+round.planned)+'</span></div>'+
    '<progress class="game-progress" aria-label="Progression de la série" value="'+Math.min(round.index,round.planned)+'" max="'+round.planned+'"></progress>'+
    '<section class="game-card '+islands[round.island].tone+'"><div class="game-heading"><div><span class="kicker">'+info.name+'</span>'+
    '<h1 tabindex="-1" id="task-title">'+info.prompt+'</h1><p>'+info.hint+'</p></div>'+
    '<div class="sound-tools">'+button('', 'sound',p.sound?'sound':'mute','icon-button mute-button')+
    ((q.mode==='echo'||q.mode==='cards')?button('Lire le mot','transcript','','text-button transcript'):(p.sound&&p.voice?button('Écouter','repeat','sound','text-button replay') :''))+
    '</div></div><div id="task-body">'+(current.feedback?feedbackBody():taskBody())+'</div></section></div>';
  const mute=$('.mute-button');mute.setAttribute('aria-label',p.sound?'Couper le son':'Rétablir le son');mute.setAttribute('aria-pressed',String(!p.sound));
  if($('#workspace')) renderWorkspace();
  redraw();
  if(schedule){
    sectionFocus('task-title');
    if(q.flash&&p.flash){
      const at=revision;
      flashTimer=setTimeout(()=>{
        if(at!==revision||page!=='game'||!current||current.feedback)return;
        current.hidden=true;renderTask(false);
      },1800);
    }
  }
}
function tokenButton(i,where,token){
  const action=where==='basket'?'take-':'put-';
  return '<button type="button" class="token-button" data-action="'+action+i+'" data-item="'+i+'" data-where="'+where+'" aria-label="'+(where==='basket'?'Retirer':'Ajouter')+' un objet"><canvas class="token-canvas" data-token="'+token+'" aria-hidden="true"></canvas></button>';
}
function renderWorkspace(focusSelector){
  const root=$('#workspace');
  if(!root) return;
  const s=current,q=s.q;
  if(q.mode==='color'){
    const count=round.chapter?10:5;
    root.innerHTML='<div class="paint-grid" style="--columns:5" aria-label="Cases à colorier">'+Array.from({length:count},(_,i)=>'<button type="button" data-action="paint-'+i+'" class="paint-cell" aria-pressed="'+s.selected.has(i)+'" aria-label="Case '+(i+1)+'">'+(s.selected.has(i)?icon('spark'):'')+'</button>').join('')+'</div>';
  } else if(q.mode==='order'){
    root.innerHTML='<div class="order-slots" aria-label="Nombres rangés">'+q.order.map((_,i)=>'<button type="button" data-action="undo-order" class="order-slot" '+(i>=s.order.length?'disabled':'')+' aria-label="Retirer le nombre '+(s.order[i]??'')+'">'+(s.order[i]??'')+'</button>').join('')+'</div>'+
      '<div class="answers" aria-label="Nombres à ranger">'+q.order.map(n=>'<button type="button" class="number-button" data-action="order-'+n+'" '+(s.order.includes(n)?'disabled':'')+'>'+n+'</button>').join('')+'</div>';
  } else {
    const token=q.mode==='pair'?'star':q.token;
    const ids=Array.from({length:s.supply},(_,i)=>i);
    const placed=ids.filter(i=>s.selected.has(i));
    const row=where=>ids.filter(i=>s.selected.has(i)===(where==='basket')).map(i=>tokenButton(i,where,token)).join('');
    const pair=q.mode==='pair'&&q.n>0?'<div class="pair-bed">'+Array.from({length:q.n},(_,i)=>
      '<div class="pair-cell"><canvas class="token-canvas" aria-hidden="true" data-token="leaf"></canvas>'+
      (i<placed.length?tokenButton(placed[i],'basket',token):'<span class="spark-space" aria-hidden="true">◌</span>')+'</div>').join('')+'</div>':'';
    const inside=pair?placed.slice(q.n).map(i=>tokenButton(i,'basket',token)).join(''):row('basket');
    root.innerHTML='<section class="drop-area stock" data-drop="stock"><h2>Réserve</h2><div class="token-row">'+row('stock')+'</div></section>'+
      '<section class="drop-area basket" data-drop="basket"><h2>'+icon(q.mode==='pair'?'lamp':'basket')+(q.mode==='pair'?'Le pont':'Ton panier')+'</h2>'+pair+'<div class="token-row">'+inside+
      (!s.selected.size&&!pair?'<span class="basket-empty">Dépose les objets ici</span>':'')+'</div></section>';
  }
  if(focusSelector) root.querySelector(focusSelector)?.focus({preventScroll:true});
  drawSmallTokens();
  const validate=$('.validate');if(validate) validate.disabled=q.mode==='order'&&s.order.length!==3;
}
function drawSmallTokens(){
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
function explanation(q,value){
  if(q.mode==='order') return 'On range les nombres dans cet ordre.';
  if(q.mode==='change') return 'Il y avait '+q.start+'. '+(q.n>q.start?'Avec un de plus':'Avec un de moins')+', il y en a '+q.n+'.';
  if(q.mode==='pair') return 'Une lumière pour chaque feuille, cela fait '+q.n+' en tout.';
  if(q.n===0) return 'Zéro veut dire qu’il n’y a aucun objet.';
  if(['basket','color'].includes(q.mode)) return 'Tu en as mis '+value+'. Il en fallait '+q.n+'.';
  if(q.mode==='echo') return 'Tu as entendu « '+numbers[q.n]+' ». Voici le chiffre.';
  return 'En tout, il y en a '+q.n+'. Le nombre s’écrit '+q.n+'.';
}
function feedbackBody(){
  const {q,feedback}=current;
  const {correct,value}=feedback;
  const media=q.mode==='order'
    ?'<div class="answer-demo">'+[...q.order].sort((a,b)=>a-b).map(n=>'<span>'+n+'</span>').join('<b aria-hidden="true">›</b>')+'</div>'
    :'<div class="answer-demo">'+(q.mode==='echo'?'':canvas(q.n,q.layout,q.mode==='pair'?'star':q.token,q.seed,'feedback-canvas'))+'<span>'+q.n+'</span></div>';
  return '<div class="feedback '+(correct?'correct':'guided')+'"><div class="feedback-title"><span>'+icon(correct?'check':'spark')+'</span><div>'+
    '<h2 id="feedback-title" tabindex="-1">'+(correct?'Bien trouvé !':'Regarde la réponse')+'</h2><p>'+explanation(q,value)+'</p></div></div>'+
    (!correct?media+'<p class="retry-note">'+(round.index<round.planned?'Une variante reviendra en fin de série.':'Tu pourras retravailler cette activité.')+'</p>':'')+
    button('Continuer','advance','arrow','primary feedback-next')+'</div>';
}
function submit(value){
  if(!current||!round||current.feedback)return;
  const correct=answer(round,value);
  if(correct===null)return;
  clearTimeout(flashTimer);
  current.feedback={correct,value};
  audio.stop();audio.chime(correct?'good':'guide');
  if(!correct){player().records[round.chapter][round.island].errors++;persistSave();}
  renderTask(false);
  sectionFocus('feedback-title');
}
function next(){
  if(!round||!current?.feedback)return;
  if(advance(round)){beginTask();return;}
  const done=outcome(round),p=player();
  const already=p.records[round.chapter][round.island].mastery;
  record(p,round.chapter,round.island,done);persistSave();
  result={...done,island:round.island,chapter:round.chapter,firstMastery:done.mastery&&!already};
  current=null;round=null;page='result';chrome();renderResult();
  if(done.mastery) audio.chime('finish');
}
function renderResult(){
  const r=result, end=r.island===5;
  const headline=r.mastery?(end?'Le grand phare brille !':'Île validée !'):'Ta série est terminée';
  const message=r.mastery
    ?end?(r.chapter?'Tu as parcouru tout l’archipel.':'Tu peux maintenant explorer les îles des nombres de 6 à 10.'):'L’île suivante est prête à être explorée.'
    :'Pour ouvrir l’île suivante, trouve au moins '+Math.ceil(.8*r.total)+' réponses du premier coup sur '+r.total+'.';
  main.innerHTML='<div class="shell result-view"><section class="result-card"><div class="result-emblem">'+icon(r.mastery?'beacon':'shell')+'</div>'+
    '<h1 id="result-title" tabindex="-1">'+headline+'</h1><p>'+message+'</p><div class="score"><strong>'+r.first+' / '+r.total+'</strong><span>réussites du premier coup</span></div>'+
    '<div class="result-actions">'+(r.mastery&&end&&!r.chapter?button('Explorer le lagon','chapter','arrow','primary'):r.mastery&&!end?button('Île suivante','island-'+(r.island+1),'arrow','primary'):
      button(r.mastery?'Retour à la carte':'Rejouer l’île',r.mastery?'map':'island-'+r.island,'arrow','primary'))+
      (r.mastery&&end&&r.chapter?'':button('Carte','map','map'))+'</div></section></div>';
  window.scrollTo(0,0);sectionFocus('result-title');
}
function updateToken(index,where,keyboard=false){
  if(!current||current.feedback||index<0||index>=current.supply)return;
  const s=current;
  if(where==='basket') s.selected.add(index);
  else s.selected.delete(index);
  audio.chime('tap');renderWorkspace(keyboard?'[data-item="'+index+'"]':undefined);
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
  const cards=save.players.map(profile=>'<div class="player-row"><button type="button" class="player-select" data-action="select-'+profile.id+'"><span class="big-avatar">'+avatars[profile.avatar]+'</span><span>'+esc(profile.name)+(profile===p?'<small>Profil actif</small>':'')+'</span></button>'+
    '<button type="button" class="text-button delete-profile" data-action="delete-'+profile.id+'" aria-label="Effacer '+esc(profile.name)+'">Effacer</button></div>').join('');
  const form='<form id="new-player"><label for="player-name">Prénom ou pseudo</label><input id="player-name" required maxlength="24" autocomplete="off" placeholder="Ton prénom">'+
    '<fieldset><legend>Choisis ton compagnon</legend><div class="avatar-grid">'+avatars.map((a,i)=>'<label><input type="radio" name="avatar" value="'+i+'" '+(i===0?'checked':'')+'><span aria-label="'+['Renard','Hibou','Lapin','Chat'][i]+'">'+a+'</span></label>').join('')+'</div></fieldset>'+
    '<button type="submit" class="primary">Créer mon profil '+icon('arrow')+'</button><p id="profile-error" role="status"></p></form>';
  openDialog(create||!cards?'Créer un profil':'Joueurs','<p>Chaque profil garde sa progression dans cette application.</p>'+
    (create||!cards?form:cards+(save.players.length<12?button('Nouveau profil','create','plus','primary profile-add'):'')),'profiles');
  if(create||!cards) $('#player-name')?.focus();
}
function settings(){
  const s=prefs();
  const options=[
    ['sound','Son général','Coupe toutes les voix et tous les bruitages.'],
    ['voice','Voix française','Nombres enregistrés et consignes lues si une voix française est disponible.'],
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
      const total=i===5?10:i===4||!c?6:5;
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
  if(current.feedback)return;
  if(action==='repeat'){announce();return;}
  if(action==='transcript'){current.transcript=!current.transcript;renderTask(false);$('.transcript')?.focus();return;}
  if(action==='show'){current.hidden=false;renderTask(false);$('.number-button')?.focus({preventScroll:true});return;}
  if(action.startsWith('answer-')){submit(Number(action.slice(7)));return;}
  if(action.startsWith('point-')){
    const index=Number(action.slice(6));
    if(current.marked.has(index))return;
    current.marked.add(index);current.markOrder.push(index);
    const total=current.marked.size;
    audio.chime('tap');audio.say(numbers[total],total);redraw();
    if(total===current.q.n){
      main.querySelectorAll('.number-button').forEach(b=>b.disabled=false);
      if(event.detail===0) $('.number-button')?.focus({preventScroll:true});
    }else if(event.detail===0){$('.hit[tabindex="0"]')?.focus({preventScroll:true});}
    return;
  }
  if(action.startsWith('put-')||action.startsWith('take-')){
    if(suppressedClick)return;
    updateToken(Number(action.slice(action.indexOf('-')+1)),action.startsWith('put-')?'basket':'stock',event.detail===0);
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
let drag=null;
main.addEventListener('pointerdown',event=>{
  const token=event.target.closest('.token-button');
  if(!token||event.button!==0||!event.isPrimary)return;
  drag={id:event.pointerId,index:Number(token.dataset.item),where:token.dataset.where,x:event.clientX,y:event.clientY,ghost:null};
});
window.addEventListener('pointermove',event=>{
  if(!drag||drag.id!==event.pointerId)return;
  if(!drag.ghost&&Math.hypot(drag.x-event.clientX,drag.y-event.clientY)<8)return;
  if(!drag.ghost) {
    const node=document.createElement('div');node.className='drag-avatar';node.textContent='✦';
    node.setAttribute('aria-hidden','true');document.body.append(node);drag.ghost=node;
  }
  if(event.cancelable)event.preventDefault();
  drag.ghost.style.transform='translate('+(event.clientX-21)+'px,'+(event.clientY-21)+'px)';
},{passive:false});
function endDrag(event,cancel){
  if(!drag||drag.id!==event.pointerId)return;
  const transaction=drag;drag=null;
  if(!transaction.ghost)return;
  transaction.ghost.remove();suppressedClick=true;
  setTimeout(()=>suppressedClick=false,0);
  const target=!cancel&&document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-drop]');
  if(target&&target.dataset.drop!==transaction.where)updateToken(transaction.index,target.dataset.drop);
}
window.addEventListener('pointerup',event=>endDrag(event,false));
window.addEventListener('pointercancel',event=>endDrag(event,true));

applySettings();goMap();
