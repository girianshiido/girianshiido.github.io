import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/js/engine.js';

const rich = (now=1000) => { const s=E.fresh(now); E.earn(s,1e13); return s; };

test('Five routes have distinct roles, late gates and bounded dust yields', () => {
  assert.equal(E.DESTINATIONS.length,5);
  const s=rich();
  assert.equal(E.launch(s,3,1000),false);
  s.prestiges=3; assert.ok(E.launch(s,3,1000));
  assert.equal(s.expedition.duration,1800);
  assert.equal(E.finishExpedition(s,s.expedition.ends),40);
  assert.equal(s.voyages.reward,3);
  assert.equal(E.launch(s,0,2000000),false);
  assert.ok(E.claimVoyageBonus(s,2000000));
  assert.equal(E.launch(s,4,2000000),false);
  s.prestiges=6; assert.ok(E.launch(s,4,2000000));
  assert.equal(E.finishExpedition(s,s.expedition.ends),120);
  assert.equal(s.voyages.reward,null);
  assert.equal(E.DESTINATIONS[2].dust*3600/E.DESTINATIONS[2].duration,90);
  assert.equal(E.DESTINATIONS[3].dust*3600/E.DESTINATIONS[3].duration,80);
  assert.equal(E.DESTINATIONS[4].dust*3600/E.DESTINATIONS[4].duration,60);
  s.research.navigation=3; assert.equal(E.voyageDuration(s,4),5400);
});

test('Fares use normal production, a route-local linear surcharge capped at 50%, and no stock tax', () => {
  const s=rich(); s.buildings[0]=50;
  const base=Math.max(500,E.production(s)*5);
  assert.equal(E.voyageCost(s,0),Math.ceil(base));
  const p=E.voyageCost(s,0);
  s.sugar/=2; s.boostUntil=1e9;s.voyages.tapUntil=1e9;s.voyages.cometUntil=1e9;
  assert.equal(E.voyageCost(s,0),p);
  s.voyages.departures[0]=1; assert.equal(E.voyageCost(s,0),Math.ceil(base*1.02));
  assert.equal(E.voyageCost(s,1),Math.ceil(Math.max(8000,E.production(s)*15)));
  s.voyages.departures[0]=25; assert.equal(E.voyageCost(s,0),Math.ceil(base*1.5));
  const poor=E.fresh(1000);E.earn(poor,499);
  assert.equal(E.launch(poor,0,1000),false);assert.equal(poor.voyages.departures[0],0);
});

test('Lunar rewards wait offline, activate once and renew without stacking or passive benefits', () => {
  const s=rich();s.buildings[0]=1;
  assert.ok(E.launch(s,0,1000));const end=s.expedition.ends;
  E.offline(s,end+86400000);
  assert.equal(s.dust,1);assert.equal(s.voyages.reward,0);assert.equal(s.voyages.tapUntil,0);
  const now=end+86400000, passive=E.production(s), comet=E.cometReward(s,now), value=E.tapValue(s,0,now);
  assert.ok(E.claimVoyageBonus(s,now));assert.equal(s.voyages.tapUntil,now+900000);
  assert.equal(E.tapValue(s,0,now),value*1.5);
  assert.equal(E.tap(s,0,1,now).amount,value*1.5);
  assert.equal(E.production(s,now),passive);assert.equal(E.cometReward(s,now),comet);
  assert.equal(E.claimVoyageBonus(s,now),false);
  s.voyages.reward=0;E.claimVoyageBonus(s,now+1000);
  assert.equal(s.voyages.tapUntil,now+901000);
  assert.equal(E.tapValue(s,0,now+901000),value);
});

test('Ring coupons discount precisely five units; bulk, Max and individual purchases agree', () => {
  const s=rich();s.voyages.reward=1;
  assert.equal(E.claimVoyageBonus(s,1000,35),false);assert.equal(s.voyages.reward,1);
  assert.ok(E.claimVoyageBonus(s,1000,1));
  const plain=structuredClone(s);plain.voyages.coupon=null;
  for(let i=0;i<10;i++)assert.equal(E.cost(s,1,i),i<5?Math.ceil(E.cost(plain,1,i)*.8):E.cost(plain,1,i));
  const singles=structuredClone(s),bulk=structuredClone(s);
  for(let i=0;i<10;i++)E.buyBuilding(singles,1,1);
  E.buyBuilding(bulk,1,10);assert.deepEqual(bulk,singles);assert.equal(bulk.voyages.coupon,null);
  const before=structuredClone(s);E.buyBuilding(s,0,1);assert.deepEqual(s.voyages.coupon,before.voyages.coupon);
  const m=E.fresh();E.earn(m,10000);m.voyages.coupon={building:0,remaining:5};
  const single=structuredClone(m);while(E.buyBuilding(single,0,1)){}E.buyBuilding(m,0,'max');
  assert.deepEqual(m,single);assert.ok(m.sugar>=0);
});

test('Comet bonuses change only sweets and expire at the boundary; no dust or frequency effect', () => {
  const s=rich();s.buildings[0]=10;s.voyages.reward=3;
  const base=E.cometReward(s,1000), dust=s.totalDust;
  E.claimVoyageBonus(s,1000);
  assert.equal(E.cometReward(s,1000),base*1.25);
  assert.equal(E.cometReward(s,1201000),base);
  assert.equal(s.totalDust,dust);assert.equal(E.cometDuration(s),18);
  s.voyages.reward=3;E.claimVoyageBonus(s,2000);assert.equal(s.voyages.cometUntil,1202000);
});

test('Legacy saves and in-flight voyages migrate, and new effects and pending rewards persist', () => {
  const old=rich();delete old.voyages;
  old.expedition={id:1,ends:181000};
  const s=E.parseSave(JSON.stringify(old),1000);
  assert.deepEqual(s.voyages.departures,[0,0,0,0,0]);assert.equal(s.expedition.duration,180);
  E.finishExpedition(s,181000);assert.equal(s.voyages.reward,1);
  assert.deepEqual(E.parseSave(JSON.stringify(s),181000),s);
  E.claimVoyageBonus(s,181000,0);s.voyages.tapUntil=182000;
  assert.deepEqual(E.parseSave(JSON.stringify(s),181000),s);
  const late=rich();late.prestiges=6;E.launch(late,4,1000);
  assert.deepEqual(E.parseSave(JSON.stringify(late),1000),late);
});

test('Malformed voyage records cannot introduce coupons, stack effects or corrupt routes', () => {
  const s=rich();
  for(const change of [{departures:[0]},{departures:[0,0,0,0,26]},{reward:2},{coupon:{building:35,remaining:5}},{coupon:{building:0,remaining:6}},{tapUntil:Infinity}]) {
    const x=structuredClone(s);Object.assign(x.voyages,change);
    assert.throws(()=>E.parseSave(JSON.stringify(x),1000));
  }
  const x=structuredClone(s);x.expedition={id:0,ends:61000,duration:60};x.voyages.reward=0;
  assert.throws(()=>E.parseSave(JSON.stringify(x),1000));
});

test('Rebirth resets per-route price increases, pending rewards and perks, preserving permanent progress', () => {
  const s=rich();s.voyages={departures:[25,3,4,0,0],reward:1,tapUntil:100000,cometUntil:100000,coupon:{building:0,remaining:3}};
  s.research.navigation=3;
  assert.ok(E.prestige(s,1000));
  assert.deepEqual(s.voyages,E.fresh(1000).voyages);assert.equal(s.research.navigation,3);
  assert.equal(E.voyageCost(s,0),500);
});

test('Prices and comet rewards remain finite at the numerical limit', () => {
  const s=rich();s.prestiges=100;s.totalDust=1e280;s.buildings.fill(5000);
  for(let i=0;i<5;i++) { s.voyages.departures[i]=25;assert.ok(Number.isFinite(E.voyageCost(s,i))); }
  s.voyages.cometUntil=1e9;assert.ok(Number.isFinite(E.cometReward(s,1000)));
});


test('Recalling a long voyage releases the crew without refund, reward or completed-trip credit', () => {
  const s=rich();s.prestiges=6;
  assert.ok(E.launch(s,4,1000));const after=s.sugar;
  assert.ok(E.recallExpedition(s));assert.equal(s.sugar,after);
  assert.equal(s.expedition,null);assert.equal(s.expeditions,0);
  assert.equal(s.dust,0);assert.equal(s.voyages.reward,null);
  assert.equal(s.voyages.departures[4],1);assert.equal(E.finishExpedition(s,1e9),0);
  assert.equal(E.recallExpedition(s),false);
  E.earn(s,1e20);assert.ok(E.prestige(s,1000));
});
