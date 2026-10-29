import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/js/engine.js';

test('The complete dust budget is 1446, with no increase in earned-dust multipliers', () => {
  const s=E.fresh(1000);s.dust=s.totalDust=2000;s.prestiges=8;
  const multiplier=E.globalMultiplier(s);
  const costs=Object.fromEntries(E.RESEARCH.map(r=>[r.id,r.costs.reduce((a,b)=>a+b,0)]));
  assert.deepEqual(costs,{radiance:234,touch:156,time:156,rhythm:170,catalogue:60,navigation:145,comets:80,nova:145});
  for(const r of E.RESEARCH) {
    while(E.buyResearch(s,r.id)) {}
    assert.equal(s.research[r.id],r.costs.length);
    assert.equal(E.buyResearch(s,r.id),false);
    assert.equal(E.researchCost(s,r.id),Infinity);
  }
  assert.ok(E.buyAutomation(s));assert.equal(s.dust,554);assert.equal(s.totalDust,2000);
  // Only the pre-existing radiance research affects passive production directly.
  assert.equal(E.globalMultiplier(s),multiplier*3.4);
});

test('New research obeys progression gates, exact payments, caps and permanent ownership', () => {
  const s=E.fresh(1000);s.dust=s.totalDust=2000;
  for(const r of E.RESEARCH.filter(r=>r.gate)) {
    s.prestiges=r.gate-1;assert.equal(E.buyResearch(s,r.id),false);
    s.prestiges=r.gate;const old=s.dust;assert.ok(E.buyResearch(s,r.id));
    assert.equal(old-s.dust,r.costs[0]);
  }
  const research={...s.research};E.earn(s,E.prestigeTarget(s));
  assert.ok(E.prestige(s,2000));
  assert.deepEqual(E.parseSave(JSON.stringify(s),2000).research,research);
  s.research.navigation=4;assert.throws(()=>E.parseSave(JSON.stringify(s),2000));
});

test('Legacy research and automation price reductions are returned once, without minted lifetime dust', () => {
  const legacy=E.fresh(1000);delete legacy.dustEconomy;
  legacy.research={radiance:10,touch:10,time:10};legacy.automation={owned:true,enabled:false};
  legacy.dust=100;legacy.totalDust=8761;
  const before=E.globalMultiplier(legacy);
  const s=E.parseSave(JSON.stringify(legacy),1000);
  assert.equal(s.dust,8076);assert.equal(s.totalDust,8761);assert.equal(s.dustEconomy,2);
  assert.equal(E.globalMultiplier(s),before);assert.equal(s.automation.enabled,false);
  assert.deepEqual(E.parseSave(JSON.stringify(s),1000),s);
  assert.equal(s.research.navigation,0);assert.equal(s.research.comets,0);assert.equal(s.research.nova,0);
  legacy.totalDust=100;assert.equal(E.parseSave(JSON.stringify(legacy),1000).dust,100);
  s.dustEconomy=99;assert.throws(()=>E.parseSave(JSON.stringify(s),1000));
});

test('Navigation preserves existing voyages, accelerates subsequent ones and never duplicates rewards', () => {
  const s=E.fresh(0);E.earn(s,1e6);s.dust=s.totalDust=1000;s.prestiges=8;
  assert.ok(E.launch(s,2,0));assert.equal(s.expedition.duration,600);
  assert.ok(E.buyResearch(s,'navigation'));assert.equal(E.voyageDuration(s,2),540);
  assert.equal(s.expedition.ends,600000);assert.equal(s.expedition.duration,600);
  const restored=E.parseSave(JSON.stringify(s),0);assert.equal(restored.expedition.duration,600);
  const old=structuredClone(s);delete old.expedition.duration;
  assert.equal(E.parseSave(JSON.stringify(old),0).expedition.duration,600);
  E.buyResearch(s,'navigation');E.buyResearch(s,'navigation');
  assert.equal(E.voyageDuration(s,2),450);
  assert.equal(E.launch(s,0,0),false);assert.equal(E.finishExpedition(s,599999),0);
  assert.equal(E.finishExpedition(s,600000),15);assert.equal(E.finishExpedition(s,600001),0);
  assert.ok(E.launch(s,2,600000));assert.equal(s.expedition.ends,1050000);
  const dust=s.dust;E.offline(s,1050000);assert.equal(s.dust-dust,15);
  E.offline(s,2050000);assert.equal(s.dust-dust,15);
  assert.equal(15*3600/E.voyageDuration(s,2),120);
});

test('Comet and Supernova duration upgrades keep rewards, cooldown and offline production bounded', () => {
  const s=E.fresh(0);s.buildings[0]=1;E.earn(s,1000);
  assert.equal(E.cometDuration(s),18);assert.equal(E.boostDuration(s),30);
  s.research.comets=3;s.research.nova=3;
  assert.equal(E.cometDuration(s),33);assert.equal(E.boostDuration(s),45);
  assert.ok(E.boost(s,0));assert.equal(s.boostUntil,45000);assert.equal(s.boostReady,180000);
  assert.ok(Math.abs(E.production(s,44999)-1.2)<1e-12);assert.equal(E.production(s,45000),.4);
  assert.equal(E.boost(s,45000),false);assert.equal(E.boost(s,180000),true);
  assert.equal(E.parseSave(JSON.stringify(s),180000).boostUntil,225000);
  const result=E.offline(s,240000);assert.equal(result.amount,.4*240*.75);
});
