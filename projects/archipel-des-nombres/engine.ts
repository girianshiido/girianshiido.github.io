export type Mode = 'touch' | 'echo' | 'glance' | 'basket' | 'color' | 'pair' | 'change' | 'ferry' | 'order';
export type Layout = 'line' | 'arc' | 'scatter' | 'clusters' | 'frame' | 'dice';
export type Token = 'shell' | 'fish' | 'berry' | 'flower' | 'leaf' | 'star' | 'seed' | 'pearl' | 'lantern';
export interface Task {
  mode: Mode; n: number; start: number; choices: number[];
  layout: Layout; token: Token; seed: number; flash: boolean; order: number[];
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
export const islands: Island[] = [
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
  const wanted = mode === 'echo' && !chapter ? 1 : 2;
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
  return chapter || islands[island].mode==='pair' || islands[island].mode==='ferry' ? 5 : 6;
}

export function exampleTask(chapter: number, island: number): Task {
  const mode = islands[island].mode;
  const n = chapter ? 6 : exampleTargets[island];
  const task = makeTask(mode,n,chapter,rng(321 + island));
  task.layout = mode==='glance' ? (chapter?'frame':'dice') : 'line';
  task.flash = false;
  const low = chapter ? 5 : 1;
  if (mode==='order') task.order = [low+2,low,low+1];
  if (mode==='change') task.start = n-1;
  return task;
}

export function startRound(chapter: number, island: number, random = Math.random): Round {
  const mode = islands[island].mode;
  const values = chapter ? [6,7,8,9,10] : mode==='pair'||mode==='ferry' ? [1,2,3,4,5] : [0,1,2,3,4,5];
  const targets = shuffle(values,random);
  if (!chapter && mode==='touch') targets.splice(0,6,1,2,3,...shuffle([0,4,5],random));
  if (!chapter && mode==='glance') targets.splice(0,6,2,3,...shuffle([0,1,4,5],random));
  const tasks = targets.map(n=>makeTask(mode,n,chapter,random));
  if (!chapter && mode==='glance') {
    tasks[0].layout = 'dice';
    tasks[0].flash = true;
    tasks[1].layout = 'frame';
    tasks[1].flash = true;
  }
  return {chapter,island,tasks,planned:roundSize(chapter,island),index:0,first:0,errors:0,answered:false};
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
    if(original) round.tasks.push(makeTask(task.mode,task.n,round.chapter,random,task));
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
export function accessible(records: readonly {mastery: boolean}[], index: number) {
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
