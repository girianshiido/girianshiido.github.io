import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/js/engine.js';
import {simulate} from '../scripts/simulate.mjs';
import {readFile,access} from 'node:fs/promises';
test('A legacy six-machine save is migrated without losing earned progress',()=>{const old=E.fresh(1000);old.buildings=[200,100,75,50,20,10];E.earn(old,1e12);old.achievements=['first','collector'];const s=E.parseSave(JSON.stringify(old),1000);assert.deepEqual(s.buildings.slice(0,6),old.buildings);assert.equal(s.buildings.length,30);assert.equal(s.total,1e12);assert.deepEqual(s.achievements,old.achievements);});
test('Later machines and upgrades cannot be purchased with money alone',()=>{const s=E.fresh();E.earn(s,1e40);assert.equal(E.buyBuilding(s,6,1),0);assert.equal(E.buyUpgrade(s,'alloy'),false);s.prestiges=1;assert.equal(E.buyBuilding(s,6,1),1);assert.equal(E.buyUpgrade(s,'alloy'),true);assert.equal(E.buyBuilding(s,7,1),0);});
test('Prestige thresholds rise and rewards grow logarithmically',()=>{const s=E.fresh();E.earn(s,1e12);assert.equal(E.prestigeGain(s),25);assert.ok(E.prestige(s,1000));assert.equal(E.prestigeTarget(s),3e9);assert.equal(E.prestigeGain(s),0);assert.equal(s.buildings.length,30);});
test('Fast play does not exhaust progression in fifteen minutes',()=>{for(const clicks of [2,10]){const r=simulate(clicks,900);assert.equal(r.cycles.length,0);assert.ok(r.production<1e6);assert.ok(r.achievements<r.totalAchievements/2);assert.equal(r.unlockedMachines,6);}});
test('Active play reaches a first reset within a bounded session',()=>{const r=simulate(2,7200);assert.ok(r.cycles[0].minute>=30);assert.ok(r.cycles[0].minute<=90);assert.ok(r.unlockedMachines<30);});
test('PWA provides raster icons and caches every installation asset',async()=>{const m=JSON.parse(await readFile('dist/manifest.webmanifest','utf8'));assert.equal(m.display,'standalone');assert.ok(m.icons.some(i=>i.sizes==='192x192'));assert.ok(m.icons.some(i=>i.sizes==='512x512'&&i.purpose==='maskable'));const sw=await readFile('dist/sw.js','utf8');for(const i of m.icons){await access('dist/'+i.src.slice(2));assert.ok(sw.includes(i.src));}await access('dist/apple-touch-icon.png');});

test('Chapter synergy requires diversity and is capped',()=>{const s=E.fresh();s.buildings[0]=1000;assert.equal(E.synergy(s,0),0);s.buildings.fill(10,0,6);assert.equal(E.synergy(s,0),.05);s.buildings.fill(1000,0,6);assert.equal(E.synergy(s,0),.25);});
