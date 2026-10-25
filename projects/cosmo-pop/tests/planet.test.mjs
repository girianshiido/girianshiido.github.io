import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/js/engine.js';

test('Twenty planet stages end at 10^82, without workshop or time requirements', () => {
  assert.equal(E.TIERS.length, 20);
  assert.equal(E.TIERS.at(-1).at, 1e82);
  const s = E.fresh(0);
  const before = E.globalMultiplier(s);
  for (let i = 1; i < E.TIERS.length; i++) {
    assert.ok(E.TIERS[i].at > E.TIERS[i-1].at);
    s.total = E.TIERS[i].at * (1 - 1e-10);
    assert.equal(E.tier(s), i-1);
    s.total = E.TIERS[i].at;
    assert.equal(E.tier(s), i);
  }
  assert.equal(s.buildings.reduce((n,v) => n+v,0), 0);
  assert.equal(s.playSeconds, 0);
  assert.equal(E.globalMultiplier(s), before);
  E.earn(s, 1e90);
  assert.ok(E.prestige(s, 1000));
  assert.equal(E.tier(s), 19);
  assert.equal(E.tier(E.parseSave(JSON.stringify(s), 1000)), 19);
  s.total = 1e300;
  assert.equal(E.tier(s), 19);
});
