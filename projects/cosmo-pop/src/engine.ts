/** Pure deterministic economy. No browser dependencies. */
export const LIMIT = 1e100;
export const BUILDINGS = [
  {id:'marmiton',name:'Marmiton cosmique',plural:'Marmitons',desc:'De petites mains, de grandes douceurs.',cost:15,rate:.4,color:'pink',icon:'bot'},
  {id:'moulin',name:'Moulin à sucre',plural:'Moulins',desc:'La poussière de lune, finement moulue.',cost:120,rate:2.4,color:'mint',icon:'mill'},
  {id:'serre',name:'Serre lunaire',plural:'Serres',desc:'Ici, les sucettes poussent toutes seules.',cost:1100,rate:14,color:'peach',icon:'sprout'},
  {id:'ruche',name:'Ruche stellaire',plural:'Ruches',desc:'Du nectar récolté au cœur des étoiles.',cost:12000,rate:85,color:'yellow',icon:'hive'},
  {id:'portail',name:'Portail gourmand',plural:'Portails',desc:'Livraison depuis une autre dimension.',cost:145000,rate:520,color:'violet',icon:'portal'},
  {id:'soleil',name:'Soleil confiseur',plural:'Soleils',desc:'Une étoile entière au service du dessert.',cost:1800000,rate:3400,color:'blue',icon:'sun'}
] as const;
export const UPGRADES = [
  {id:'gloves',name:'Gants de confiseur',desc:'Douceurs par récolte × 2.',cost:80,unlock:40,icon:'hand'},
  {id:'spoon',name:'Cuillère intersidérale',desc:'Douceurs par récolte × 3.',cost:900,unlock:400,icon:'spark'},
  {id:'recipe',name:'La recette secrète',desc:'Toutes les machines produisent 2 fois plus.',cost:2500,unlock:1000,icon:'book'},
  {id:'lucky',name:'Une pincée de chance',desc:'15 % de récoltes critiques : gains × 5.',cost:6000,unlock:2500,icon:'star'},
  {id:'sugar',name:'Sucre de comète',desc:'Douceurs par récolte × 5.',cost:18000,unlock:8000,icon:'comet'},
  {id:'turbo',name:'Moteurs à caramel',desc:'Toutes les machines produisent 3 fois plus.',cost:65000,unlock:25000,icon:'bolt'},
  {id:'echo',name:'Écho des étoiles',desc:'Ajoute 3 secondes de production à chaque récolte.',cost:200000,unlock:100000,icon:'orbit'},
  {id:'galaxy',name:'La grande confiserie',desc:'Toutes les machines produisent 4 fois plus.',cost:1800000,unlock:500000,icon:'planet'}
] as const;
export const RESEARCH = [
  {id:'radiance',name:'Éclat cosmique',desc:'+20 % de production par niveau.',base:3,icon:'sun'},
  {id:'touch',name:'Toucher stellaire',desc:'+50 % par récolte par niveau.',base:2,icon:'hand'},
  {id:'time',name:'Poches de temps',desc:'+2 h de gains hors ligne par niveau.',base:2,icon:'clock'}
] as const;
export type ResearchId = typeof RESEARCH[number]['id'];
export const DESTINATIONS = [
  {name:'La Lune guimauve',desc:'Un petit pas pour un marmiton…',cost:500,duration:60,dust:1,icon:'moon',color:'pink'},
  {name:'Les Anneaux acidulés',desc:'Une traversée pétillante.',cost:8000,duration:180,dust:4,icon:'orbit',color:'mint'},
  {name:'La Nébuleuse vanille',desc:'Là où naissent les nouvelles recettes.',cost:100000,duration:600,dust:15,icon:'spark',color:'violet'}
] as const;
export const TIERS = [
  {name:'Pépite naissante',at:0,color:'#ffabbd'},
  {name:'Petite confiserie',at:500,color:'#ffb88a'},
  {name:'Jardin des douceurs',at:5000,color:'#8edac0'},
  {name:'Fabrique orbitale',at:50000,color:'#96bcf6'},
  {name:'Royaume gourmand',at:500000,color:'#b4a0ef'},
  {name:'Empire des étoiles',at:5000000,color:'#ffd16d'},
  {name:'Univers de délices',at:50000000,color:'#ee9bdc'}
] as const;
export interface State {
  version:1; sugar:number; total:number; run:number; dust:number; totalDust:number;
  buildings:number[]; upgrades:string[]; research:Record<ResearchId,number>; achievements:string[];
  mission:number; clicks:number; expeditions:number; prestiges:number; playSeconds:number;
  expedition:{id:number;ends:number}|null;
  boostUntil:number; boostReady:number; savedAt:number;
  settings:{sound:boolean;volume:number;motion:boolean};
}
export function fresh(now=Date.now()):State {return {version:1,sugar:0,total:0,run:0,dust:0,totalDust:0,buildings:BUILDINGS.map(()=>0),upgrades:[],research:{radiance:0,touch:0,time:0},achievements:[],mission:0,clicks:0,expeditions:0,prestiges:0,playSeconds:0,expedition:null,boostUntil:0,boostReady:0,savedAt:now,settings:{sound:true,volume:.45,motion:true}};}
const numberPrecise=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:1});
const numberInteger=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0});
export const fmt=(n:number,precision=1):string=>{
  if(n<1000)return (n<10&&precision>0?numberPrecise:numberInteger).format(Math.max(0,n));
  const units=['k','M','Md','B','Ba','T','Ta','Qa','Qi'];
  const group=Math.floor(Math.log10(n)/3);
  if(group>units.length)return n.toExponential(2).replace('.',',');
  return numberPrecise.format(n/1000**group)+' '+units[group-1];
};
export const timeFmt=(seconds:number):string=>{const s=Math.max(0,Math.ceil(seconds));return s>=3600?`${Math.floor(s/3600)} h ${Math.floor(s%3600/60)} min`:s>=60?`${Math.floor(s/60)} min ${s%60} s`:`${s} s`;};
export const tier=(s:State):number=>{let found=0;for(let i=1;i<TIERS.length;i++)if(s.total>=TIERS[i]!.at)found=i;return found;};
export function cost(s:State,id:number,offset=0):number {const b=BUILDINGS[id];return b?Math.min(LIMIT,Math.ceil(b.cost*1.16**((s.buildings[id]??0)+offset))):LIMIT;}
export function buildingMultiplier(count:number):number {return (count>=10?2:1)*(count>=25?2:1)*(count>=50?2:1)*(count>=100?2:1)*(count>=200?2:1);}
export function globalMultiplier(s:State):number{return (1+s.research.radiance*.2)*(1+s.totalDust*.02)*(1+s.achievements.length*.02)*(s.upgrades.includes('recipe')?2:1)*(s.upgrades.includes('turbo')?3:1)*(s.upgrades.includes('galaxy')?4:1);}
export function production(s:State,now=0):number {return BUILDINGS.reduce((v,b,i)=>v+b.rate*(s.buildings[i]??0)*buildingMultiplier(s.buildings[i]??0),0)*globalMultiplier(s)*(now>0&&now<s.boostUntil?3:1);}
export function tapValue(s:State,combo=0):number {return ((1+s.research.touch*.5)*(s.upgrades.includes('gloves')?2:1)*(s.upgrades.includes('spoon')?3:1)*(s.upgrades.includes('sugar')?5:1)*(1+s.totalDust*.02)*(1+Math.min(25,combo)/25)+(s.upgrades.includes('echo')?production(s)*3:0));}
export function earn(s:State,amount:number):void {if(!Number.isFinite(amount)||amount<0)return;s.sugar=Math.min(LIMIT,s.sugar+amount);s.total=Math.min(LIMIT,s.total+amount);s.run=Math.min(LIMIT,s.run+amount);}
export function tap(s:State,combo:number,random=Math.random()):{amount:number;critical:boolean} {const critical=s.upgrades.includes('lucky')&&random<.15;const amount=tapValue(s,combo)*(critical?5:1);earn(s,amount);s.clicks++;return {amount,critical};}
export function quote(s:State,id:number,quantity:number|'max'):{count:number;price:number} {let price=0,count=0;const max=quantity==='max'?5000:quantity;while(count<max&&(s.buildings[id]??5000)+count<5000){const next=cost(s,id,count);if(price+next>s.sugar+1e-8)break;price+=next;count++;}return {count,price};}
export function buyBuilding(s:State,id:number,quantity:number|'max'):number {if(!BUILDINGS[id])return 0;const q=quote(s,id,quantity);s.sugar=Math.max(0,s.sugar-q.price);s.buildings[id]=(s.buildings[id]??0)+q.count;return q.count;}
export function buyUpgrade(s:State,id:string):boolean {const u=UPGRADES.find(u=>u.id===id);if(!u||s.upgrades.includes(id)||s.total<u.unlock||s.sugar<u.cost)return false;s.sugar-=u.cost;s.upgrades.push(id);return true;}
export const researchCost=(s:State,id:ResearchId):number=>{const r=RESEARCH.find(r=>r.id===id)!;return r.base*2**s.research[id];};
export function buyResearch(s:State,id:ResearchId):boolean {if(!RESEARCH.some(r=>r.id===id)||s.research[id]>=10)return false;const c=researchCost(s,id);if(s.dust<c)return false;s.dust-=c;s.research[id]++;return true;}
export function launch(s:State,id:number,now:number):boolean {const d=DESTINATIONS[id];if(!d||s.expedition||s.sugar<d.cost)return false;s.sugar-=d.cost;s.expedition={id,ends:now+d.duration*1000};return true;}
export function finishExpedition(s:State,now:number):number {if(!s.expedition||now<s.expedition.ends)return 0;const d=DESTINATIONS[s.expedition.id];s.expedition=null;if(!d)return 0;s.dust+=d.dust;s.totalDust+=d.dust;s.expeditions++;return d.dust;}
export function boost(s:State,now:number):boolean {if(s.total<500||now<s.boostReady)return false;s.boostUntil=now+30000;s.boostReady=now+180000;return true;}
export const prestigeGain=(s:State):number=>Math.floor(Math.sqrt(s.run/1000000))*5;
export function prestige(s:State,now:number):boolean {const gain=prestigeGain(s);if(gain<5||s.expedition)return false;const n=fresh(now);Object.assign(n,{total:s.total,dust:s.dust+gain,totalDust:s.totalDust+gain,research:{...s.research},achievements:[...s.achievements],clicks:s.clicks,expeditions:s.expeditions,prestiges:s.prestiges+1,mission:s.mission,playSeconds:s.playSeconds,settings:{...s.settings}});Object.assign(s,n);return true;}
export const offlineCap=(s:State):number=>(8+s.research.time*2)*3600;
export function offline(s:State,now:number):{amount:number;seconds:number;dust:number} {const seconds=Math.max(0,Math.min(offlineCap(s),(now-s.savedAt)/1000));const amount=production(s)*seconds*.75;earn(s,amount);const dust=finishExpedition(s,now);s.savedAt=now;s.boostUntil=0;return {amount,seconds,dust};}
export const ACHIEVEMENTS = [
  {id:'first',name:'Premier pop',desc:'Récolter une première douceur.',icon:'spark',test:(s:State)=>s.clicks>=1},
  {id:'helper',name:'Un coup de main',desc:'Recruter un marmiton.',icon:'bot',test:(s:State)=>(s.buildings[0]??0)>=1},
  {id:'hundred',name:'Ça crépite !',desc:'Effectuer 100 récoltes.',icon:'hand',test:(s:State)=>s.clicks>=100},
  {id:'thousand',name:'La voie sucrée',desc:'Produire 1 000 douceurs.',icon:'planet',test:(s:State)=>s.total>=1000},
  {id:'ten',name:'Travail d’équipe',desc:'Posséder 10 marmitons.',icon:'bot',test:(s:State)=>(s.buildings[0]??0)>=10},
  {id:'moon',name:'Voyage, voyage',desc:'Terminer une expédition.',icon:'rocket',test:(s:State)=>s.expeditions>=1},
  {id:'factory',name:'Ça tourne rond',desc:'Atteindre 100 douceurs par seconde.',icon:'mill',test:(s:State)=>production(s)>=100},
  {id:'collector',name:'Collection sucrée',desc:'Acquérir les six types de machines.',icon:'hive',test:(s:State)=>s.buildings.every(n=>n>0)},
  {id:'million',name:'Million de mercis',desc:'Produire un million de douceurs.',icon:'star',test:(s:State)=>s.total>=1e6},
  {id:'explorer',name:'Sans frontières',desc:'Terminer 10 expéditions.',icon:'comet',test:(s:State)=>s.expeditions>=10},
  {id:'rebirth',name:'Un nouveau départ',desc:'Accomplir une renaissance.',icon:'orbit',test:(s:State)=>s.prestiges>=1},
  {id:'universe',name:'L’infini gourmand',desc:'Produire 100 millions de douceurs.',icon:'sun',test:(s:State)=>s.total>=1e8}
];
export const MISSIONS = [
  {title:'Tout commence par un pop',desc:'Récoltez 15 fois votre planète.',target:15,read:(s:State)=>s.clicks,reward:35,dust:0},
  {title:'Votre tout premier équipage',desc:'Recrutez 3 marmitons cosmiques.',target:3,read:(s:State)=>s.buildings[0]??0,reward:120,dust:0},
  {title:'Le bonheur tourne en boucle',desc:'Construisez votre premier moulin.',target:1,read:(s:State)=>s.buildings[1]??0,reward:300,dust:0},
  {title:'Mille et une douceurs',desc:'Produisez 1 000 douceurs au total.',target:1000,read:(s:State)=>s.total,reward:600,dust:1},
  {title:'La petite armée sucrée',desc:'Recrutez 10 marmitons. Production × 2 !',target:10,read:(s:State)=>s.buildings[0]??0,reward:1000,dust:1},
  {title:'Un aller-retour dans les étoiles',desc:'Terminez votre première expédition.',target:1,read:(s:State)=>s.expeditions,reward:3000,dust:2},
  {title:'Un petit jardin extraterrestre',desc:'Construisez 3 serres lunaires.',target:3,read:(s:State)=>s.buildings[2]??0,reward:6000,dust:2},
  {title:'Vitesse de croisière',desc:'Atteignez 100 douceurs par seconde.',target:100,read:(s:State)=>production(s),reward:15000,dust:3},
  {title:'Votre premier million',desc:'Produisez un million de douceurs.',target:1e6,read:(s:State)=>s.total,reward:100000,dust:5},
  {title:'Un nouvel horizon',desc:'Faites renaître votre planète.',target:1,read:(s:State)=>s.prestiges,reward:500,dust:5}
];
export function claimMission(s:State):boolean {const m=MISSIONS[s.mission];if(!m||m.read(s)<m.target)return false;earn(s,m.reward);s.dust+=m.dust;s.totalDust+=m.dust;s.mission++;return true;}
function finite(v:unknown,max=LIMIT):number {if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>max)throw new Error('Valeur de sauvegarde invalide.');return v;}
export function parseSave(text:string,now=Date.now()):State {
  if(text.length>100000)throw new Error('Fichier trop volumineux.');
  const v:unknown=JSON.parse(text);if(!v||typeof v!=='object')throw Error('Sauvegarde invalide.');
  const x=v as Record<string,unknown>;if(x.version!==1)throw Error('Version de sauvegarde inconnue.');
  const s=fresh(now);
  for(const k of ['sugar','total','run','dust','totalDust','clicks','expeditions','prestiges','playSeconds'] as const)s[k]=finite(x[k]);
  if(s.sugar>s.total||s.run>s.total||s.dust>s.totalDust)throw Error('Sauvegarde incohérente.');
  if(!Array.isArray(x.buildings)||x.buildings.length!==BUILDINGS.length)throw Error('Machines invalides.');
  s.buildings=x.buildings.map(n=>{finite(n,5000);if(!Number.isInteger(n))throw Error('Machines invalides.');return n as number;});
  if(!Array.isArray(x.upgrades)||!Array.isArray(x.achievements))throw Error('Collection invalide.');
  s.upgrades=[...new Set(x.upgrades.filter((n):n is string=>typeof n==='string'&&UPGRADES.some(u=>u.id===n)))];
  s.achievements=[...new Set(x.achievements.filter((n):n is string=>typeof n==='string'&&ACHIEVEMENTS.some(a=>a.id===n)))];
  if(!x.research||typeof x.research!=='object')throw Error('Recherches invalides.');
  for(const r of RESEARCH){const n=(x.research as Record<string,unknown>)[r.id];finite(n,10);if(!Number.isInteger(n))throw Error('Recherche invalide.');s.research[r.id]=n as number;}
  s.mission=finite(x.mission,MISSIONS.length);if(!Number.isInteger(s.mission))throw Error('Mission invalide.');
  s.savedAt=Math.min(now,finite(x.savedAt,1e15));s.boostUntil=Math.min(now+30000,finite(x.boostUntil,1e15));s.boostReady=Math.min(now+180000,finite(x.boostReady,1e15));
  if(x.expedition!==null){if(!x.expedition||typeof x.expedition!=='object')throw Error('Expédition invalide.');const e=x.expedition as Record<string,unknown>;const id=finite(e.id,2);if(!Number.isInteger(id))throw Error('Destination invalide.');s.expedition={id,ends:Math.min(now+DESTINATIONS[id]!.duration*1000,finite(e.ends,1e15))};}
  if(x.settings&&typeof x.settings==='object'){const o=x.settings as Record<string,unknown>;s.settings={sound:typeof o.sound==='boolean'?o.sound:true,motion:typeof o.motion==='boolean'?o.motion:true,volume:typeof o.volume==='number'&&Number.isFinite(o.volume)?Math.max(0,Math.min(1,o.volume)):.45};}
  return s;
}
