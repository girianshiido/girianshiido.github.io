import * as E from '../dist/js/engine.js';
export function simulate(tapsPerSecond=2,duration=86400){
 const s=E.fresh(0),cycles=[];let seed=12345;
 for(let second=1;second<=duration;second++){
  const now=second*1000;E.earn(s,E.production(s,now));
  for(let i=0;i<tapsPerSecond;i++){seed=(seed*1664525+1013904223)>>>0;E.tap(s,25,seed/2**32);}
  E.finishExpedition(s,now);E.boost(s,now);
  if(second%75===35)E.earn(s,Math.max(30,E.production(s,now)*35+E.tapValue(s)*15));
  for(const a of E.ACHIEVEMENTS)if(!s.achievements.includes(a.id)&&a.test(s))s.achievements.push(a.id);
  while(E.claimMission(s)){}
  for(const r of E.RESEARCH)if(r.id!=='time')E.buyResearch(s,r.id);
  if(E.prestigeGain(s)>=5&&!s.expedition){cycles.push({cycle:s.prestiges+1,minute:Math.round(second/60),production:Math.round(E.production(s))});E.prestige(s,now);}
  // Greedy return-on-investment strategy, including saving for a better purchase.
  for(let purchase=0;purchase<30;purchase++){
   const base=E.production(s)+tapsPerSecond*E.tapValue(s,25),options=[];
   for(let i=0;i<E.BUILDINGS.length;i++)if(s.prestiges>=E.buildingGate(i)){
    const c=E.cost(s,i);s.buildings[i]++;const delta=E.production(s)+tapsPerSecond*E.tapValue(s,25)-base;s.buildings[i]--;if(delta>0)options.push({score:c/delta,c,building:i});}
   for(const u of E.UPGRADES)if(!s.upgrades.includes(u.id)&&s.total>=u.unlock&&s.prestiges>=E.upgradeGate(u.id)){
    s.upgrades.push(u.id);const delta=E.production(s)+tapsPerSecond*E.tapValue(s,25)-base;s.upgrades.pop();if(delta>0)options.push({score:u.cost/delta,c:u.cost,upgrade:u.id});}
   options.sort((a,b)=>a.score-b.score);const best=options[0];if(!best||s.sugar<best.c)break;
   if(best.upgrade)E.buyUpgrade(s,best.upgrade);else E.buyBuilding(s,best.building,1);
  }
  // Expeditions are launched only from a reserve; no future timers are accelerated.
  if(!s.expedition)for(let i=2;i>=0;i--)if(s.sugar>E.DESTINATIONS[i].cost*4){E.launch(s,i,now);break;}
 }
 return {tapsPerSecond,minutes:duration/60,buildings:s.buildings,upgrades:s.upgrades,cycles,production:Math.round(E.production(s)),achievements:s.achievements.length,totalAchievements:E.ACHIEVEMENTS.length,unlockedMachines:E.BUILDINGS.filter((_,i)=>s.prestiges>=E.buildingGate(i)).length};
}
if(import.meta.url===`file://${process.argv[1]}`)for(const [t,d] of [[2,900],[10,900],[2,7200],[0,86400]])console.log(JSON.stringify(simulate(t,d)));
