import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { planetForm, planetArt, PLANET_FORMS } from '../dist/js/art.js';
import { fresh, tier, prestige } from '../dist/js/engine.js';

test('Seven planet appearances follow every level through 20 and survive prestige', () => {
  assert.deepEqual(PLANET_FORMS.map(f=>f.level), [1,4,7,10,13,16,20]);
  const expected=[0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,5,6];
  for(let level=1;level<=20;level++) {
    assert.equal(planetForm(level), expected[level-1]);
    assert.ok(planetArt(level).includes(`data-form="${expected[level-1]}"`));
    assert.ok(!planetArt(level).includes('<canvas'));
  }
  const state=fresh(0);state.total=state.run=1e82;
  assert.equal(planetForm(tier(state)+1),6);
  assert.ok(prestige(state,1000));
  assert.equal(planetForm(tier(state)+1),6);
});

test('All evolution PNGs have both responsive sizes and are cached offline', async () => {
  const sw=await readFile('dist/sw.js','utf8');
  let total=0;
  for(let form=0;form<7;form++) for(const size of [480,960]) {
    const path=`images/planets/${form}-${size}.png`;
    const png=await readFile('dist/'+path);total+=png.length;
    assert.equal(png.subarray(1,4).toString(),'PNG');
    assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);
    assert.ok(sw.includes('./'+path));
  }
  assert.ok(total<4*1024*1024,'The complete planet set stays below 4 MiB');
});

test('The first settlements do not reuse the historical advanced planet', async () => {
  for (const form of [1,2]) for (const size of [480,960])
    assert.notDeepEqual(await readFile(`dist/images/planets/${form}-${size}.png`), await readFile(`dist/images/planet-${size}.png`));
});
