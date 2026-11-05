import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LIMIT, buyMusic, buyWeeklyHarvest, earn, fresh, musicAvailable,
  parseSave, prestige, production, weeklyHarvest,
} from '../dist/js/engine.js';

test('Each music purchase costs 400 dust once and survives saves and rebirth', () => {
  const s = fresh();
  delete s.musicUnlocks;
  delete s.settings.musicTrack;
  const legacy = parseSave(JSON.stringify(s));
  assert.equal(legacy.settings.musicTrack, 'constellations');
  assert.deepEqual(legacy.musicUnlocks, []);
  legacy.dust = legacy.totalDust = 800;
  assert.ok(musicAvailable(legacy, 'constellations'));
  assert.equal(musicAvailable(legacy, 'neptune'), false);
  assert.equal(buyMusic(legacy, 'constellations'), undefined);
  assert.equal(buyMusic(legacy, 'unknown'), undefined);
  assert.equal(buyMusic(legacy, 'neptune').cost, 400);
  assert.equal(legacy.dust, 400);
  assert.equal(buyMusic(legacy, 'neptune'), undefined);
  legacy.settings.musicTrack = 'cometes';
  assert.equal(parseSave(JSON.stringify(legacy)).settings.musicTrack, 'constellations');
  assert.equal(buyMusic(legacy, 'cometes').cost, 400);
  assert.equal(legacy.dust, 0);
  assert.equal(legacy.totalDust, 800);
  earn(legacy, 1e9);
  assert.ok(prestige(legacy, Date.now()));
  const restored = parseSave(JSON.stringify(legacy));
  assert.ok(musicAvailable(restored, 'neptune'));
  assert.ok(musicAvailable(restored, 'cometes'));
  assert.equal(restored.settings.musicTrack, 'cometes');
});

test('A weekly harvest is repeatable, uses normal production and only spends available dust', () => {
  const s = fresh();
  s.dust = s.totalDust = 1200;
  assert.equal(buyWeeklyHarvest(s), 0);
  assert.equal(s.dust, 1200);
  s.buildings[0] = 7;
  s.research.radiance = 2;
  s.boostUntil = 2000;
  s.voyages.tapUntil = 2000;
  s.voyages.cometUntil = 2000;
  const expected = production(s) * 604800;
  assert.ok(production(s, 1000) > production(s));
  assert.equal(weeklyHarvest(s), expected);
  assert.equal(buyWeeklyHarvest(s), expected);
  assert.equal(s.dust, 600);
  assert.equal(buyWeeklyHarvest(s), expected);
  assert.equal(s.dust, 0);
  assert.equal(buyWeeklyHarvest(s), 0);
  assert.equal(s.totalDust, 1200);
  assert.equal(s.sugar, 2 * expected);
  assert.equal(s.total, s.sugar);
  assert.equal(s.run, s.sugar);
  assert.equal(s.playSeconds, 0);
});

test('The weekly harvest saturates at the game limit and refuses an empty payout', () => {
  const s = fresh();
  s.dust = 1200;
  s.totalDust = 1e297;
  s.buildings[0] = 5000;
  earn(s, LIMIT / 2);
  assert.equal(buyWeeklyHarvest(s), LIMIT / 2);
  assert.equal(s.sugar, LIMIT);
  assert.equal(buyWeeklyHarvest(s), 0);
  assert.equal(s.dust, 600);
});
