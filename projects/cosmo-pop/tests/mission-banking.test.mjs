import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/js/engine.js';
globalThis.location={pathname:'/cosmo-pop/'};
const {exportEncrypted,importEncrypted}=await import('../dist/js/storage.js');

const galaxy = () => {
  const s=E.fresh(1000);s.prestiges=5;s.mission=14;
  E.earn(s,4e18);s.buildings[10]=1;
  return s;
};

test('A completed Galaxy challenge survives rebirth without collection, then pays exactly once', () => {
  const s=galaxy();assert.equal(E.missionReady(s),true);
  assert.ok(E.prestige(s,2000));assert.equal(s.buildings[10],0);assert.equal(s.sugar,0);
  assert.equal(s.mission,14);assert.ok(s.completedMissions.includes(14));assert.ok(E.missionReady(s));
  const dust=s.dust,total=s.total,run=s.run;
  assert.ok(E.claimMission(s));assert.equal(s.sugar,2e17);
  assert.equal(s.total,total+2e17);assert.equal(s.run,run+2e17);
  assert.equal(s.dust,dust+25);assert.equal(s.mission,15);
  assert.equal(E.claimMission(s),false);assert.equal(s.sugar,2e17);
  E.earn(s,E.prestigeTarget(s));assert.ok(E.prestige(s,3000));
  assert.equal(s.mission,15);assert.equal(E.claimMission(s),false);
});

test('Validation banks all achieved objectives, including later challenges, without advancing or paying', () => {
  const s=galaxy();s.mission=0;s.buildings[11]=1;s.buildings[0]=9;
  const reserve=s.sugar,dust=s.dust;
  assert.ok(E.refreshMissions(s));assert.equal(s.mission,0);
  assert.ok(s.completedMissions.includes(14));assert.ok(s.completedMissions.includes(15));
  assert.equal(s.sugar,reserve);assert.equal(s.dust,dust);
  assert.equal(E.refreshMissions(s),false);
  assert.equal(new Set(s.completedMissions).size,s.completedMissions.length);
  assert.ok(!s.completedMissions.includes(4)); // Nine marmitons is not ten.
});

test('Workshop, production and chapter conditions stay validated after their current values fall', () => {
  const s=E.fresh(1000);s.buildings[0]=10;s.buildings.fill(10,12,18);
  E.refreshMissions(s);assert.ok(s.completedMissions.includes(4));assert.ok(s.completedMissions.includes(16));
  s.buildings.fill(0);s.mission=4;assert.ok(E.missionReady(s));
  s.mission=16;assert.ok(E.missionReady(s));
  const p=E.fresh(1000);p.buildings[5]=1;E.refreshMissions(p);
  assert.ok(p.completedMissions.includes(7));p.buildings.fill(0);p.mission=7;
  assert.ok(E.missionReady(p));
});

test('Partial objectives do not become completed just because a rebirth occurs', () => {
  const s=galaxy();s.buildings[10]=0;assert.ok(E.prestige(s,2000));
  assert.equal(E.missionReady(s),false);assert.equal(E.claimMission(s),false);
  assert.equal(s.sugar,0);assert.ok(!s.completedMissions.includes(14));
});

test('Legacy migration captures live objectives and durable achievement proofs, never repaying collected ones', () => {
  const live=galaxy();delete live.completedMissions;
  assert.ok(E.parseSave(JSON.stringify(live),1000).completedMissions.includes(14));
  const historical=galaxy();historical.buildings.fill(0);historical.achievements=['spiral'];
  delete historical.completedMissions;
  const restored=E.parseSave(JSON.stringify(historical),1000);
  assert.ok(E.missionReady(restored));assert.equal(restored.sugar,historical.sugar);
  historical.mission=15;
  const collected=E.parseSave(JSON.stringify(historical),1000);
  assert.equal(E.claimMission(collected),false);assert.equal(collected.mission,15);
  historical.mission=14;historical.achievements=[];
  assert.equal(E.missionReady(E.parseSave(JSON.stringify(historical),1000)),false);
});

test('Banked challenges survive encrypted export and repeated rebirths, with no duplicate reward', async () => {
  const s=galaxy();const password='Les défis restent acquis !';
  // Export snapshots current objectives even when no paint or periodic audit occurred.
  const encrypted=await exportEncrypted(s,password);assert.ok(!encrypted.includes('completedMissions'));
  const restored=await importEncrypted(encrypted,password);
  assert.ok(restored.completedMissions.includes(14));
  for(let i=0;i<3;i++) { E.earn(restored,E.prestigeTarget(restored));assert.ok(E.prestige(restored,Date.now())); }
  assert.ok(E.missionReady(restored));assert.equal(restored.sugar,0);
  const saved=E.parseSave(JSON.stringify(restored));assert.ok(E.claimMission(saved));
  const after=E.parseSave(JSON.stringify(saved));assert.equal(E.claimMission(after),false);
});

test('Malformed validation lists are rejected without weakening save validation', () => {
  const s=E.fresh(1000);
  for(const completedMissions of [null,{},[-1],[19],[1.5],[0,0],Array(20).fill(0)])
    assert.throws(()=>E.parseSave(JSON.stringify({...s,completedMissions}),1000));
  assert.deepEqual(E.parseSave(JSON.stringify(s),1000),s);
});
