export type Mode = 'touch' | 'echo' | 'glance' | 'basket' | 'color' | 'pair' | 'change' | 'ferry' | 'order' | 'hear' | 'same' | 'cards' | 'compare' | 'five' | 'hidden' | 'mix';
export type Ask = 'more' | 'less' | 'equal';
export type Layout = 'line' | 'arc' | 'scatter' | 'clusters' | 'frame' | 'dice' | 'ring' | 'hand';
export type Token = 'shell' | 'fish' | 'berry' | 'flower' | 'leaf' | 'star' | 'seed' | 'pearl' | 'lantern';
export interface Task {
  mode: Mode; n: number; start: number; choices: number[];
  layout: Layout; token: Token; seed: number; flash: boolean; order: number[];
  activity?: number; fixed?: Layout; oral?: boolean; comparison?: {left: number; right: number; ask: Ask}; total?: number;
}
export interface Round {
  chapter: number; island: number; tasks: Task[]; planned: number; index: number;
  first: number; errors: number; answered: boolean;
}
export interface Island {
  title: string; description: string; icon: string; tone: string; mode: Mode;
  art: number;
}

export const numbers = ['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix'];
const legacy: Island[] = [
  {title:'La plage aux coquillages',description:'Compter les objets, un par un.',icon:'shell',tone:'peach',mode:'touch',art:0},
  {title:'L’écho de la grotte',description:'Relier un nombre entendu à son chiffre.',icon:'echo',tone:'lilac',mode:'echo',art:1},
  {title:'Le lagon des figures',description:'Reconnaître des quantités en un coup d’œil.',icon:'dice',tone:'mint',mode:'glance',art:2},
  {title:'Le jardin flottant',description:'Préparer exactement la quantité demandée.',icon:'flower',tone:'pink',mode:'basket',art:3},
  {title:'Le pont des lucioles',description:'Poser une lanterne sur chaque feuille.',icon:'lamp',tone:'gold',mode:'pair',art:4},
  {title:'La traversée du phare',description:'Rapporter autant de perles qu’au premier quai.',icon:'beacon',tone:'sky',mode:'ferry',art:5},
  {title:'Les marches du port',description:'Ranger les nombres du plus petit au plus grand.',icon:'map',tone:'sky',mode:'order',art:5},
  {title:'La mosaïque du jardin',description:'Colorier exactement le nombre de cases demandé.',icon:'flower',tone:'pink',mode:'color',art:3},
  {title:'La réserve du pont',description:'Voir ce qui change quand on ajoute ou retire un objet.',icon:'basket',tone:'gold',mode:'change',art:4},
];
type Practice = Island & {
  values?: number[]; fixed?: Layout; oral?: boolean; ask?: Ask; review?: number[];
};
const atelier = (title: string, description: string, mode: Mode, art: number, rules: Partial<Practice> = {}): Practice =>
  ({title,description,mode,art,icon:legacy[art].icon,tone:legacy[art].tone,...rules});
const practice: Practice[] = [
  atelier('Les trois coquillages','Compte jusqu’à trois en suivant la rangée.','touch',0,{values:[1,2,3],fixed:'line'}),
  atelier('Chacun sa lanterne','Associe une lanterne à chaque feuille.','pair',0,{values:[1,2,3]}),
  atelier('Les doigts de la plage','Compte les doigts levés, de zéro à trois.','glance',0,{values:[1,2,3,0],fixed:'hand'}),
  atelier('Les jumeaux','Trouve un groupe qui a autant d’objets que le modèle.','same',0,{values:[0,1,2,3],fixed:'line'}),
  atelier('Le panier vide','Écoute et reconnais les groupes de zéro, un ou deux objets.','hear',0,{values:[0,1,2],fixed:'line'}),
  atelier('La ronde de la plage','Retrouve les premiers gestes appris sur la plage.','mix',0,{review:[9,10,11,12,13]}),
  atelier('Les perles en ligne','Suis la rangée et compte jusqu’à cinq.','touch',2,{fixed:'line'}),
  atelier('Le cercle des poissons','Fais le tour du cercle en touchant chaque poisson.','touch',2,{fixed:'ring'}),
  atelier('La pêche aux étoiles','Retrouve chaque étoile dispersée dans le lagon.','touch',2,{fixed:'scatter'}),
  atelier('Le dé du navigateur','Reconnais les points du dé.','glance',2,{values:[1,2,3,4,5],fixed:'dice'}),
  atelier('L’empreinte de la main','Reconnais de zéro à cinq doigts levés.','glance',2,{fixed:'hand'}),
  atelier('Le cadre des perles','Lis la quantité dans un cadre de cinq cases.','glance',1,{fixed:'frame'}),
  atelier('Les échos du lagon','Écoute un nombre, puis montre le groupe correspondant.','hear',1),
  atelier('Le jeu des quatre cartes','Retrouve la carte demandée. Elle disparaît ensuite du jeu.','cards',1),
  atelier('Les collections jumelles','Retrouve la même quantité dans un autre arrangement.','same',1),
  atelier('La ronde des représentations','Relie les nombres entendus, les chiffres et les collections.','mix',1,{review:[1,20,21,22,23]}),
  atelier('Sur commande','Écoute la quantité et prépare le panier.','basket',3,{oral:true}),
  atelier('Le marché du jardin','Prépare la quantité demandée, avec ou sans modèle.','mix',3,{review:[4,3,7,25,8]}),
  atelier('Le quai le plus peuplé','Trouve le groupe qui contient le plus d’objets.','compare',4,{ask:'more'}),
  atelier('Le quai le moins peuplé','Trouve le groupe qui contient le moins d’objets.','compare',4,{ask:'less'}),
  atelier('Équilibre sur le pont','Vérifie si les groupes ont autant d’objets.','compare',4,{ask:'equal'}),
  atelier('Les places libres','Trouve combien d’objets il manque pour arriver à cinq.','five',4),
  atelier('Le coffre des coquillages','Trouve la partie cachée d’une collection.','hidden',4),
  atelier('Le signal du guetteur','Écoute les nombres et reconnais les bonnes collections.','mix',5,{review:[1,20,23,22,1]}),
  atelier('Les provisions du phare','Compose et complète les collections pour la traversée.','mix',5,{review:[25,7,8,30,31]}),
  atelier('Les deux rives','Compare ce qui se trouve des deux côtés du pont.','mix',5,{review:[27,28,29,6,23]}),
  atelier('Le grand phare','Rejoue aux activités des îles pour rallumer le phare.','mix',5,{review:[17,20,25,29,30,31]}),
];
export const islands: Practice[] = [...legacy,...practice];
export const legacyCount = legacy.length;
export const practiceIslands = [
  {...legacy[0],title:'La plage des petits nombres',description:'Les premières quantités, de zéro à trois.',activities:[9,10,11,12,13,14]},
  {...legacy[2],title:'Le lagon des collections',description:'Compte jusqu’à cinq en ligne, en cercle et en petits groupes.',activities:[15,16,17,18,19,0]},
  {...legacy[1],title:'La grotte des échos',description:'Relie les quantités, les nombres entendus et les chiffres.',activities:[1,20,21,22,23,24]},
  {...legacy[3],title:'Le jardin des paniers',description:'Construis et transforme des collections.',activities:[4,3,7,25,8,26]},
  {...legacy[4],title:'Le pont des comparaisons',description:'Compare, ordonne et décompose les nombres.',activities:[27,28,29,6,30,31]},
  {...legacy[5],title:'L’île du grand phare',description:'Réunis ce que tu as appris pour rallumer le phare.',activities:[5,2,32,33,34,35]},
];
export const finalPractice = 35;
export const groupFor = (index: number) => practiceIslands.findIndex(group=>group.activities.includes(index));
type Records = readonly {mastery: boolean}[];
export const groupComplete = (records: Records,index: number) =>
  practiceIslands[index].activities.every(i=>records[i]?.mastery);
export const groupOpen = (records: Records,index: number) => practiceIslands[index].activities.some(i=>records[i]?.mastery) ||
  practiceIslands.slice(0,index).every((_,i)=>groupComplete(records,i));

export const coreCount = 6;
export const finalIsland = coreCount - 1;
const exampleTargets = [2,2,3,2,2,3,2,3,3];

const layouts: Layout[] = ['line','arc','scatter','clusters','frame'];
const tokens: Token[] = ['shell','fish','berry','flower','leaf','star'];
export function rng(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
export function shuffle<T>(items: readonly T[], random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i],result[j]] = [result[j],result[i]];
  }
  return result;
}
export function makeTask(mode: Mode, n: number, chapter: number, random = Math.random, previous?: Task): Task {
  const max = chapter ? 10 : 5;
  let layout = shuffle(layouts.filter(item => item !== previous?.layout), random)[0];
  if (!previous && mode === 'glance' && n >= 1 && n <= 6 && random() < .6) layout = 'dice';
  if (!previous && chapter && n > 5 && mode === 'glance') layout = 'frame';
  const token = mode==='basket' ? 'seed' : mode==='ferry' ? 'pearl'
    : mode==='pair' ? 'lantern' : shuffle(tokens.filter(item => item !== previous?.token), random)[0];
  const wanted = mode==='echo'&&!chapter ? 1 : mode==='cards' ? 3 : 2;
  const pool = shuffle(Array.from({length:max+1},(_,i)=>i).filter(i=>i!==n),random)
    .sort((a,b) => Number(Math.abs(a-n)>2) - Number(Math.abs(b-n)>2));
  const choices = shuffle([n,...pool.slice(0,wanted)],random);
  if (previous && choices.indexOf(n) === previous.choices.indexOf(n)) choices.push(choices.shift()!);
  let start = n === 0 ? 1 : n === max ? max - 1 : n + (random() < .5 ? 1 : -1);
  if (previous && n > 0 && n < max) start = 2*n-previous.start;
  const low = Math.max(0,Math.min(max-2,n-1));
  let order = shuffle([low,low+1,low+2],random);
  while (order.every((value,index)=>value===low+index) || (previous&&order.join()===previous.order.join())) {
    order = [order[1],order[2],order[0]];
  }
  return { mode,n,start,choices,layout,token,order,
    seed:Math.floor(random()*100000),flash:mode==='glance' && n>=1 && n<=5 && (layout==='dice'||layout==='line'||layout==='frame') };
}
export function roundSize(chapter: number, island: number): number {
  const activity = islands[island];
  if(chapter) return 5;
  if(activity.mode==='cards') return 8;
  if(activity.review) return activity.review.length;
  if(activity.values) return activity.values.length<5 ? activity.values.length*2 : activity.values.length;
  return activity.mode==='pair'||activity.mode==='ferry'||activity.mode==='hidden'?5:6;
}

export function exampleTask(chapter: number, island: number): Task {
  const mode = islands[island].mode;
  const n = chapter ? 6 : (exampleTargets[island]??(mode==='compare'?1:mode==='hidden'?2:mode==='glance'&&islands[island].fixed==='dice'?3:2));
  const task = taskFor(island,n,chapter,rng(321 + island));
  task.layout = task.fixed ?? (mode==='glance' ? (chapter?'frame':'dice') : 'line');
  task.flash = false;
  const low = chapter ? 5 : 1;
  if (mode==='order') task.order = [low+2,low,low+1];
  if (mode==='change') task.start = n-1;
  return task;
}

function taskFor(id: number,n: number,chapter: number,random: () => number,previous?: Task): Task {
  const activity=islands[id];
  const q=makeTask(activity.mode,n,chapter,random,previous);
  q.activity=id;
  q.oral=activity.oral;
  q.fixed=activity.fixed;
  if(activity.fixed){q.layout=activity.fixed;q.flash=false;}
  if(id===15||id===20)q.token='pearl';
  if(id===16)q.token='fish';
  if(id===17)q.token='star';
  if(q.mode==='cards'||q.mode==='hidden')q.token='shell';
  if(activity.values){
    const pool=shuffle(activity.values.filter(value=>value!==n),random);
    q.choices=shuffle([n,...pool.slice(0,2)],random);
  }
  if(activity.ask){
    const ask=activity.ask;
    // Encode selecting the left group, equal quantities, and the right group.
    const lo=Math.floor(random()*5);
    const hi=lo+1+Math.floor(random()*(5-lo));
    const smallerLeft=ask==='equal'?random()<.5:ask==='less'?n===0:n===2;
    const same=n===1;
    q.comparison={left:same?lo:smallerLeft?lo:hi,right:same?lo:smallerLeft?hi:lo,ask};
    q.choices=ask==='equal'?[1,0]:[0,1,2];
  }
  if(q.mode==='five'){q.start=5-n;q.layout='frame';q.flash=false;}
  if(q.mode==='hidden'){
    q.total=n+Math.floor(random()*(6-n));
    q.start=q.total-n;
  }
  return q;
}
function valuesFor(id: number,chapter: number): number[] {
  const activity=islands[id];
  if(chapter) return [6,7,8,9,10];
  if(activity.values) return activity.values;
  if(activity.ask==='equal') return [0,1,0,1,0,1];
  if(activity.ask) return [0,1,2,0,1,2];
  if(activity.mode==='pair'||activity.mode==='ferry'||activity.mode==='hidden')return [1,2,3,4,5];
  return [0,1,2,3,4,5];
}
export function startRound(chapter: number, island: number, random = Math.random): Round {
  const activity=islands[island],mode=activity.mode;
  const values=valuesFor(island,chapter);
  const count=roundSize(chapter,island);
  const targets=shuffle(values,random);
  if (!chapter&&island===0) targets.splice(0,6,1,2,3,...shuffle([0,4,5],random));
  if (!chapter&&island===2) targets.splice(0,6,2,3,...shuffle([0,1,4,5],random));
  const deck=() => shuffle(shuffle(values,random).slice(0,4),random);
  const cards=mode==='cards'?[deck(),deck()]:[];
  const deckSeed=mode==='cards'?Math.floor(random()*100000):0;
  const deckOrder=mode==='cards'?shuffle(values,random):[];
  const tasks = Array.from({length:count},(_,i)=>{
    if(mode==='cards'){
      const visible=cards[Math.floor(i/4)].slice(i%4);
      const q=taskFor(island,visible[0],chapter,random);
      q.choices=deckOrder.filter(value=>visible.includes(value));
      q.seed=deckSeed+Math.floor(i/4)*1300;
      return q;
    }
    const id=activity.review?.[i]??island;
    const options=valuesFor(id,chapter);
    const n=id===island?(targets[i]??targets[i%targets.length]):options[Math.floor(random()*options.length)];
    return taskFor(id,n,chapter,random);
  });
  if (!chapter&&island===2) {
    tasks[0].layout = 'dice';
    tasks[0].flash = true;
    tasks[1].layout = 'frame';
    tasks[1].flash = true;
  }
  return {chapter,island,tasks,planned:count,index:0,first:0,errors:0,answered:false};
}

export function matches(task: Task, value: number | number[]): boolean {
  return task.mode==='order'
    ? Array.isArray(value) && value.length===task.order.length &&
      [...task.order].sort((a,b)=>a-b).every((n,i)=>value[i]===n)
    : value===task.n;
}

export function answer(round: Round, value: number | number[], random = Math.random) {
  if(round.answered||round.index>=round.tasks.length) return null;
  const task = round.tasks[round.index];
  const correct = matches(task,value);
  round.answered = true;
  const original = round.index<round.planned;
  if(correct&&original) round.first++;
  if(!correct) {
    round.errors++;
    if(original) round.tasks.push(taskFor(task.activity??round.island,task.n,round.chapter,random,task));
  }
  return correct;
}
export function advance(round: Round) {
  if(!round.answered) return false;
  round.index++;
  round.answered = false;
  return round.index < round.tasks.length;
}
export function outcome(round: Round) {
  return { mastery:round.index===round.tasks.length && round.first>=Math.ceil(.8*round.planned),
    first:round.first,total:round.planned,errors:round.errors };
}
export function accessible(records: Records,index: number,chapter = 0) {
  if(!chapter){
    const group=groupFor(index);
    if(group<0) return false;
    if(records[index]?.mastery) return true;
    if(!groupOpen(records,group)) return false;
    const activities = practiceIslands[group].activities;
    return activities.slice(0,activities.indexOf(index)).every(i=>records[i]?.mastery);
  }
  if(index<0||index>=legacyCount) return false;
  const needed = Math.min(index,coreCount);
  return records.length>=needed && records.slice(0,needed).every(entry=>entry.mastery);
}
export function spots(n: number,layout: Layout,seed: number): [number,number][] {
  const random = rng(seed);
  if(n===1&&layout!=='frame') return [[.5,.5]];
  if(layout==='dice'&&n<=6){
    const dice=[[],[4],[0,8],[0,4,8],[0,2,6,8],[0,2,4,6,8],[0,2,3,5,6,8]];
    return dice[n].map(i=>[.26+.24*(i%3),.22+.28*Math.floor(i/3)]);
  }
  if(layout==='frame'||(layout==='line'&&n>5)){
    return Array.from({length:n},(_,i)=>[.14+.18*(i%5), n>5?.28+.44*Math.floor(i/5):.5]);
  }
  if(layout==='line') return Array.from({length:n},(_,i)=>[.5+(i-(n-1)/2)*.17,.5]);
  if(layout==='ring') return Array.from({length:n},(_,i)=>{
    const angle=-Math.PI/2+Math.PI*2*i/n;
    return [.5+.32*Math.cos(angle),.5+.34*Math.sin(angle)];
  });
  if(layout==='arc') return Array.from({length:n},(_,i)=>{
    const angle=n>5 ? i/n*2*Math.PI : Math.PI*(.14+.72*i/(n-1));
    return n>5 ? [.5+.37*Math.cos(angle),.5+.34*Math.sin(angle)] : [.5-.39*Math.cos(angle),.78-.55*Math.sin(angle)];
  });
  if(layout==='clusters'&&n>=4){
    const left=Math.ceil(n/2);
    return Array.from({length:n},(_,i)=>{
      const j=i<left?i:i-left;
      return [(i<left?.17:.66)+.15*(j%2), .23+.26*Math.floor(j/2)];
    });
  }
  const columns=n>6?4:3;
  const cells=shuffle(Array.from({length:columns*3},(_,i)=>i),random).slice(0,n);
  return cells.map(i=>[(i%columns+.5)/columns+(random()-.5)*.045,.17+.33*Math.floor(i/columns)+(random()-.5)*.065]);
}
