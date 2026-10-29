import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/js/engine.js';

test('Catalogue is a permanent one-off 60-dust purchase gated at two rebirths', () => {
  const s=E.fresh(1000);s.dust=s.totalDust=60;
  assert.equal(E.buyResearch(s,'catalogue'),false);
  s.prestiges=2;s.dust=59;assert.equal(E.buyResearch(s,'catalogue'),false);
  s.dust=60;assert.ok(E.buyResearch(s,'catalogue'));assert.equal(s.dust,0);
  assert.equal(s.totalDust,60);assert.equal(E.buyResearch(s,'catalogue'),false);
  E.earn(s,E.prestigeTarget(s));assert.ok(E.prestige(s,1000));
  assert.equal(s.research.catalogue,1);
  assert.equal(E.parseSave(JSON.stringify(s),1000).research.catalogue,1);
  const legacy=structuredClone(s);delete legacy.research.catalogue;
  assert.equal(E.parseSave(JSON.stringify(legacy),1000).research.catalogue,0);
});

test('Buy all is locked without Catalogue; buys cheapest general and workshop recipes with exact payments', () => {
  const s=E.fresh(1000);E.earn(s,500);s.buildings[0]=10;
  assert.deepEqual(E.buyAllRecipes(s),[]);assert.equal(s.sugar,500);
  s.research.catalogue=1;
  const m=E.MILESTONES.find(m=>m.id==='recipe-0-10');
  assert.equal(E.availableRecipes(s),true);
  const bought=E.buyAllRecipes(s);
  assert.deepEqual(bought,['Gants de confiseur',E.BUILDINGS[0].name+' · '+m.name]);
  assert.equal(s.sugar,500-80-m.price);assert.equal(s.totalMilestones,1);
  assert.equal(E.availableRecipes(s),false);assert.deepEqual(E.buyAllRecipes(s),[]);
});

test('Buy all stops at the available budget and never buys locked recipes, machines or dust research', () => {
  const s=E.fresh(1000);E.earn(s,81);s.research.catalogue=1;
  s.buildings[0]=10;s.dust=s.totalDust=1000;
  const research={...s.research}, buildings=[...s.buildings];
  assert.deepEqual(E.buyAllRecipes(s),['Gants de confiseur']);assert.equal(s.sugar,1);
  assert.deepEqual(s.research,research);assert.deepEqual(s.buildings,buildings);assert.equal(s.dust,1000);
  E.earn(s,1e250);E.buyAllRecipes(s);
  assert.ok(!s.upgrades.some(id=>E.upgradeGate(id)>0));
  assert.ok(s.milestones.every(id=>E.MILESTONES.find(m=>m.id===id).gate===0));
  assert.ok(s.sugar>=0);
});

test('One bounded buy-all pass exhausts all eligible recipes and never duplicates assistant purchases', () => {
  const s=E.fresh(1000);E.earn(s,1e250);s.prestiges=36;s.buildings.fill(800);
  s.research.catalogue=1;s.automation={owned:true,enabled:true};
  const first=E.automateUpgrades(s);assert.equal(first.length,3);
  const rest=E.buyAllRecipes(s);
  assert.equal(first.length+rest.length,E.UPGRADES.length+E.MILESTONES.length);
  assert.deepEqual(E.buyAllRecipes(s),[]);assert.deepEqual(E.automateUpgrades(s),[]);
  assert.equal(new Set(s.upgrades).size,s.upgrades.length);
  assert.equal(new Set(s.milestones).size,s.milestones.length);
});

test('Base workshop prices are strictly increasing, including Soleil and Forge, without modifying owned units', () => {
  assert.equal(E.BUILDINGS[5].cost,240e6);assert.equal(E.BUILDINGS[6].cost,600e6);
  for(let i=1;i<E.BUILDINGS.length;i++)assert.ok(E.BUILDINGS[i].cost>E.BUILDINGS[i-1].cost);
  const s=E.fresh(1000);s.prestiges=1;E.earn(s,1e12);s.buildings[5]=4;s.buildings[6]=3;
  const restored=E.parseSave(JSON.stringify(s),1000);
  assert.deepEqual(restored.buildings,s.buildings);assert.equal(restored.sugar,s.sugar);
  assert.ok(E.cost(restored,6)>E.cost(restored,5));
});
