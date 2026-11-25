import {numbers} from './engine.js';

const chapters = ['Les petites îles','Au-delà du lagon'];
export const chapterTitle = chapter => chapters[chapter];
const plural = (n, singular) => n === 1 ? singular : singular+'s';
export function presentation(task){
  const n=task.n;
  switch(task.mode){
    case 'touch':return {prompt:'Combien vois-tu d’objets ?',hint:n?'Touche chaque objet une fois. Le dernier nombre donne le total.':'La plage est vide. Choisis le nombre qui signifie « aucun objet ».',clip:'touch'};
    case 'echo':return {prompt:'Quel nombre entends-tu ?',hint:'Écoute, puis touche le chiffre.',clip:'n'+n};
    case 'glance':return {prompt:'Combien en vois-tu ?',hint:'Observe les groupes, puis choisis leur total.',clip:'glance'};
    case 'basket':return {prompt:n?'Mets '+n+' '+plural(n,'graine')+' dans le panier':'Prépare un panier vide',hint:n?'Touche ou fais glisser les graines. Tu peux les remettre dans la réserve.':'Garde le panier vide pour montrer zéro, puis valide.',clip:n?'basket-'+n:'empty'};
    case 'color':return {prompt:'Colorie '+n+' '+plural(n,'case'),hint:n?'Touche les cases pour les colorier. Touche de nouveau pour effacer.':'Garde toutes les cases blanches. Cela représente zéro.',clip:'color'};
    case 'pair':return {prompt:'Une lanterne pour chaque feuille',hint:'Dépose une lanterne sur le rond sous chaque feuille. Tu peux aussi toucher une lanterne.',clip:'pair'};
    case 'ferry':return {prompt:'Autant de perles sur les deux quais',hint:'Observe les perles, puis traverse. De l’autre côté, prépare la même quantité.',clip:'ferry'};
    case 'change':return {prompt:task.n>task.start?'Ajoute un objet au panier':'Enlève un objet du panier',hint:'Change la quantité d’un seul objet, puis valide.',clip:task.n>task.start?'add':'remove'};
    case 'order':return {prompt:'Range du plus petit au plus grand',hint:'Touche les nombres dans l’ordre. Touche une case remplie pour recommencer.',clip:'order'};
  }
}

export function voiceClips(task, moment){
  const {mode,n}=task;
  const instruction=mode==='echo'?'echo-guide':presentation(task).clip;
  const number='n'+n;
  if(moment==='instruction')return mode==='color'?[instruction,number]:[instruction];
  if(moment==='example'){
    const readsNumber=mode==='echo'||mode==='color';
    return readsNumber?['example',instruction,number]:['example',instruction];
  }
  if(mode==='echo'||mode==='basket'||mode==='color')return [number];
  return mode==='change'?[instruction]:[];
}

export function exampleHint(task, chapter){
  const n=task.n;
  switch(task.mode){
    case 'touch':return 'Touche les objets. Le dernier nombre est '+n+' : choisis '+n+'.';
    case 'echo':return 'Écoute « '+numbers[n]+' ». Le chiffre correspondant est '+n+'.';
    case 'glance':return chapter?'Une rangée pleine de cinq et un objet en dessous, cela fait six.':'Ce dé a trois points. Tu peux les compter, puis choisir 3.';
    case 'basket':return 'Mets '+n+' graines dans le panier. Touche une graine ou fais-la glisser, puis valide.';
    case 'pair':return 'Prends une lanterne et dépose-la sous une feuille, puis recommence avec les autres.';
    case 'ferry':return 'Compte les perles sur le quai. Traverse, prépare la même quantité, puis compare.';
    case 'color':return 'Touche '+n+' cases différentes, puis valide.';
    case 'change':return 'Il y a '+task.start+' objets. Ajoute-en un pour en avoir '+n+'.';
    case 'order':return 'Commence par '+Math.min(...task.order)+', le plus petit. Continue avec les deux autres.';
  }
}
export const exampleVoices={
  touch:'good-count',echo:'good-echo',glance:'good-glance',basket:'good-basket',pair:'good-pair',
  ferry:'good-ferry',color:'good-color',change:'good-change',order:'good-order',
};
