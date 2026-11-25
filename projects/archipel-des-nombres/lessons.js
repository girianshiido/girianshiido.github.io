import {numbers} from './engine.ts';

const chapters = ['Les petites îles','Au-delà du lagon'];
export const chapterTitle = chapter => chapters[chapter];
const plural = (n, singular) => n === 1 ? singular : singular+'s';
const focused = {
  line:['Combien d’objets dans la rangée ?','Compte en suivant la rangée.','count-line'],
  hand:['Combien de doigts sont levés ?','Seuls les doigts levés comptent.','count-hand'],
  dice:['Combien de points sur le dé ?','Observe les points du dé.','count-dice'],
};
const independent = {
  line:['Combien vois-tu de perles ?','count-pearls'],
  ring:['Combien vois-tu de poissons ?','count-fish'],
  scatter:['Combien vois-tu d’étoiles ?','count-stars'],
};
export function presentation(task){
  const n=task.n;
  if(task.independent){
    const [prompt,clip]=independent[task.fixed]??['Combien vois-tu d’objets ?','count-collection'];
    return {prompt,hint:'Compte à ton rythme, puis choisis le nombre.',clip};
  }
  if((task.mode==='touch'||task.mode==='glance')&&task.fixed&&focused[task.fixed]){
    const [prompt,hint,clip]=focused[task.fixed];
    return {prompt,hint,clip};
  }
  switch(task.mode){
    case 'touch':return {prompt:'Combien vois-tu d’objets ?',hint:n?'Touche chaque objet une fois. Le dernier nombre donne le total.':'La plage est vide. Choisis le nombre qui signifie « aucun objet ».',clip:'touch'};
    case 'echo':return {prompt:'Quel nombre entends-tu ?',hint:'Écoute, puis touche le chiffre.',clip:'n'+n};
    case 'hear':return {prompt:'Montre le groupe demandé',hint:'Écoute le nombre, puis touche le groupe correspondant.',clip:'hear-group'};
    case 'same':return {prompt:'Où y en a-t-il autant ?',hint:'Observe le modèle, puis cherche un groupe de même quantité.',clip:'same-group'};
    case 'cards':return {prompt:'Trouve la carte avec '+n+' '+plural(n,'coquillage'),hint:'La bonne carte quitte le jeu après ta réponse.',clip:'match-cards'};
    case 'compare':{
      const {ask}=task.comparison;
      if(ask==='equal')return {prompt:'Y en a-t-il autant des deux côtés ?',hint:'Observe les deux groupes. Choisis « Autant » ou « Différent ».',clip:'compare-equal'};
      return {prompt:ask==='more'?'Quel groupe en a le plus ?':'Quel groupe en a le moins ?',hint:'Touche un groupe, ou choisis « Autant » si les quantités sont égales.',clip:'compare-'+ask};
    }
    case 'five':return {prompt:'Combien en manque-t-il pour faire cinq ?',hint:'Les cases libres peuvent t’aider.',clip:'complete-five'};
    case 'hidden':return {prompt:'Combien sont cachés dans le coffre ?',hint:'Le nombre au-dessus donne le total. Observe ceux qui sont dehors.',clip:'split-shells'};
    case 'glance':return {prompt:'Combien en vois-tu ?',hint:'Observe les groupes, puis choisis leur total.',clip:'glance'};
    case 'basket':return task.oral?{prompt:'Prépare la commande',hint:'Écoute le nombre de graines à mettre dans le panier.',clip:'hear-group'}:{prompt:n?'Mets '+n+' '+plural(n,'graine')+' dans le panier':'Prépare un panier vide',hint:n?'Touche ou fais glisser les graines. Tu peux les remettre dans la réserve.':'Garde le panier vide pour montrer zéro, puis valide.',clip:n?'basket-'+n:'empty'};
    case 'color':return {prompt:'Colorie '+n+' '+plural(n,'case'),hint:n?'Touche les cases pour les colorier. Touche de nouveau pour effacer.':'Garde toutes les cases blanches. Cela représente zéro.',clip:'color'};
    case 'pair':return {prompt:'Une lanterne pour chaque feuille',hint:'Dépose une lanterne sur le rond sous chaque feuille. Tu peux aussi toucher une lanterne.',clip:'pair'};
    case 'ferry':return {prompt:'Autant de perles sur les deux quais',hint:'Observe les perles, puis traverse. De l’autre côté, prépare la même quantité.',clip:'ferry'};
    case 'change':return {prompt:task.n>task.start?'Ajoute un objet au panier':'Enlève un objet du panier',hint:'Change la quantité d’un seul objet, puis valide.',clip:task.n>task.start?'add':'remove'};
    case 'order':return {prompt:'Range du plus petit au plus grand',hint:'Touche les nombres dans l’ordre. Touche une case remplie pour recommencer.',clip:'order'};
  }
}

export function voiceClips(task, moment){
  const {mode,n}=task;
  const instruction=mode==='echo'?'echo-guide':task.oral?(n?'basket-'+n:'empty'):presentation(task).clip;
  const number='n'+n;
  const hearsNumber=mode==='echo'||mode==='hear'||mode==='color';
  const withNumber=hearsNumber?[instruction,number]:[instruction];
  if(moment==='instruction')return mode==='color'?[instruction,number]:[instruction];
  if(moment==='review')return withNumber;
  if(moment==='example')return ['example',...withNumber];
  if(hearsNumber||mode==='basket')return [number];
  return mode==='change'?[instruction]:[];
}

export function exampleHint(task, chapter){
  const n=task.n;
  switch(task.mode){
    case 'touch':return task.independent?'Observe la collection. Il y en a '+n+'. Choisis '+n+'.':'Touche les objets. Le dernier nombre est '+n+' : choisis '+n+'.';
    case 'echo':return 'Écoute « '+numbers[n]+' ». Le chiffre correspondant est '+n+'.';
    case 'glance':return task.fixed?'Observe la figure. Il y en a '+n+'. Choisis '+n+'.':chapter?'Une rangée pleine de cinq et un objet en dessous, cela fait six.':'Ce dé a trois points. Tu peux les compter, puis choisir 3.';
    case 'hear':return 'Écoute « '+numbers[n]+' », puis touche le groupe qui en contient '+n+'.';
    case 'cards':return 'Touche la carte sur laquelle tu comptes '+n+' coquillages.';
    case 'same':return 'Compte les '+n+' objets du modèle, puis trouve un groupe de même quantité.';
    case 'compare':{
      const {left,right}=task.comparison;
      return 'Il y en a '+left+' à gauche et '+right+' à droite. '+(left===right?'Choisis « Autant ».':'Choisis le groupe correspondant à la consigne.');
    }
    case 'five':return 'Le cadre peut contenir cinq objets. Compte les '+n+' cases libres.';
    case 'hidden':return 'Il y en a '+task.total+' en tout et '+task.start+' dehors. Il en reste '+n+' dans le coffre.';
    case 'basket':return 'Mets '+n+' graines dans le panier. Touche une graine ou fais-la glisser, puis valide.';
    case 'pair':return 'Prends une lanterne et dépose-la sous une feuille, puis recommence avec les autres.';
    case 'ferry':return 'Compte les perles sur le quai. Traverse, prépare la même quantité, puis compare.';
    case 'color':return 'Touche '+n+' cases différentes, puis valide.';
    case 'change':return 'Il y a '+task.start+' objets. Ajoute-en un pour en avoir '+n+'.';
    case 'order':return 'Commence par '+Math.min(...task.order)+', le plus petit. Continue avec les deux autres.';
  }
}
export const exampleVoices={
  independent:'good-glance',touch:'good-count',echo:'good-echo',glance:'good-glance',basket:'good-basket',pair:'good-pair',
  hear:'good-match',cards:'good-match',same:'good-match',compare:'good-compare',five:'good-five',hidden:'good-split',
  ferry:'good-ferry',color:'good-color',change:'good-change',order:'good-order',
};
