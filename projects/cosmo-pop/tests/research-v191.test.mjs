import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/js/engine.js';
globalThis.location={pathname:'/cosmo-pop/'};
const {exportEncrypted,importEncrypted}=await import('../dist/js/storage.js');

test('Three original researches extend to rank 12 with unchanged first-ten prices and exact next costs', () => {
  const s=E.fresh(1000);s.dust=s.totalDust=1000;
  for(const [id,base] of [['radiance',3],['touch',2],['time',2]]) {
    const r=E.RESEARCH.find(r=>r.id===id);
    assert.equal(r.costs.length,12);
    for(let i=0;i<12;i++)assert.equal(r.costs[i],base*(i+1));
    s.research[id]=10;assert.equal(E.researchCost(s,id),base*11);
    const before=s.dust;assert.ok(E.buyResearch(s,id));assert.equal(s.dust,before-base*11);
    assert.equal(E.researchCost(s,id),base*12);assert.ok(E.buyResearch(s,id));
    assert.equal(s.research[id],12);assert.equal(E.researchCost(s,id),Infinity);
    assert.equal(E.buyResearch(s,id),false);
  }
  assert.equal(E.offlineCap(s),32*3600);
  assert.ok(Math.abs(E.globalMultiplier(s)/(1+s.totalDust*.02)-3.4)<1e-12);
});

test('Cadence purchases unlock x4, x8, x16 and charge 20, 50, 100 dust exactly', () => {
  const s=E.fresh(1000);s.dust=s.totalDust=500;
  assert.equal(E.buyResearch(s,'rhythm'),false);
  assert.equal(E.comboMaximum(s),2);assert.equal(E.comboLimit(s),25);
  s.prestiges=1;
  for(const [level,price,maximum,clicks] of [[1,20,4,75],[2,50,8,175],[3,100,16,375]]) {
    const before=s.dust;assert.equal(E.researchCost(s,'rhythm'),price);
    assert.ok(E.buyResearch(s,'rhythm'));assert.equal(s.dust,before-price);
    assert.equal(s.research.rhythm,level);assert.equal(E.comboMaximum(s),maximum);
    assert.equal(E.comboLimit(s),clicks);assert.equal(E.comboMultiplier(s,clicks),maximum);
    assert.equal(E.comboMultiplier(s,clicks+10000),maximum);
  }
  assert.equal(E.buyResearch(s,'rhythm'),false);assert.equal(s.totalDust,500);
});

test('Cadence preserves the existing ramp and affects manual clicks only, including Echo and lunar rewards', () => {
  const s=E.fresh(1000);s.buildings[0]=1;s.upgrades.push('echo');
  const passive=E.production(s), comet=E.cometReward(s,1000), unit=E.tapValue(s,0,1000);
  s.research.rhythm=3;
  for(const [combo,multiplier] of [[0,1],[25,2],[75,4],[175,8],[375,16],[999,16]]) {
    assert.equal(E.comboMultiplier(s,combo),multiplier);
    // The displayed multiplier must also apply to the late-game Echo component.
    assert.equal(E.tapValue(s,combo,1000),multiplier*(1+passive*.05));
  }
  assert.equal(E.tapValue(s,0,1000),unit);
  assert.equal(E.production(s,1000),passive);assert.equal(E.cometReward(s,1000),comet);
  s.voyages.tapUntil=2000;
  assert.equal(E.tap(s,375,1,1000).amount,16*(1+passive*.05)*1.5);
  assert.equal(E.tapValue(s,375,2000),16*(1+passive*.05));
  assert.equal(E.comboMultiplier(s,-1),1);assert.equal(E.comboMultiplier(s,NaN),1);
});

test('Rank-ten saves migrate without spending or free ranks, and reject invalid new ranks', () => {
  const old=E.fresh(1000);old.research.radiance=old.research.touch=old.research.time=10;
  old.dust=15;old.totalDust=400;delete old.research.rhythm;
  const s=E.parseSave(JSON.stringify(old),1000);
  assert.equal(s.dust,15);assert.equal(s.totalDust,400);assert.equal(s.research.rhythm,0);
  assert.equal(s.research.radiance,10);assert.equal(s.research.touch,10);assert.equal(s.research.time,10);
  for(const [id,rank] of [['radiance',13],['touch',13],['time',13],['rhythm',4],['rhythm',1.5]]) {
    const x=structuredClone(s);x.research[id]=rank;
    assert.throws(()=>E.parseSave(JSON.stringify(x),1000));
  }
  const legacy=structuredClone(s);legacy.dustEconomy=1;legacy.research.radiance=11;
  assert.throws(()=>E.parseSave(JSON.stringify(legacy),1000));
});

test('New research ranks and cadence survive encrypted export, reload and rebirth', async () => {
  const s=E.fresh();s.prestiges=1;s.research={...s.research,radiance:12,touch:12,time:12,rhythm:3};
  E.earn(s,E.prestigeTarget(s));
  const pass='Cadence et poussières 2026';
  const text=await exportEncrypted(s,pass);assert.ok(!text.includes('rhythm'));
  const restored=await importEncrypted(text,pass);
  assert.deepEqual(restored.research,s.research);assert.equal(E.comboMaximum(restored),16);
  assert.ok(E.prestige(restored,Date.now()));
  assert.deepEqual(restored.research,s.research);assert.equal(E.offlineCap(restored),32*3600);
});
