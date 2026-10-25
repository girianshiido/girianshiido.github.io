import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioManager } from '../dist/js/audio.js';
import { fresh, parseSave, prestige, earn } from '../dist/js/engine.js';

const tick = () => new Promise(resolve => setImmediate(resolve));
class Context {
  static instances = [];
  state = 'suspended'; currentTime = 0; destination = {}; sources = [];
  constructor() { Context.instances.push(this); }
  async resume() { this.state = 'running'; }
  async suspend() { this.state = 'suspended'; }
  async decodeAudioData() { return { duration: 120 }; }
  createGain() { return { gain: { value: 0, cancelScheduledValues() {}, setTargetAtTime(v) { this.value = v; } }, connect() {}, disconnect() {} }; }
  createBufferSource() {
    const source = { playbackRate: { value: 1 }, connect() {}, disconnect() {}, start(when, offset) { this.offset = offset; }, stop() { this.stopped = true; } };
    this.sources.push(source); return source;
  }
}

test('Music settings migrate, clamp invalid values and survive saves and prestige', () => {
  const legacy = fresh(); delete legacy.settings.music; delete legacy.settings.musicVolume;
  assert.equal(parseSave(JSON.stringify(legacy)).settings.musicVolume, .35);
  assert.equal(parseSave(JSON.stringify(legacy)).settings.music, true);
  for (const [input, expected] of [[-2,0], [4,1], [null,.35], ['loud',.35]]) {
    legacy.settings.musicVolume = input;
    assert.equal(parseSave(JSON.stringify(legacy)).settings.musicVolume, expected);
  }
  const state = fresh(); state.settings.music = false; state.settings.musicVolume = .17;
  earn(state, 1e9); assert.ok(prestige(state));
  assert.deepEqual(parseSave(JSON.stringify(state)).settings, state.settings);
});

test('One OGG loop starts after a gesture, pauses, resumes at its position and stays independent of SFX', async (t) => {
  const urls = [];
  t.mock.method(globalThis, 'fetch', async url => { urls.push(String(url)); return { ok: true, arrayBuffer: async () => new ArrayBuffer(1) }; });
  globalThis.AudioContext = Context;
  const audio = new AudioManager(); audio.enabled = false;
  audio.setMusic(true, .3); assert.equal(urls.length, 0);
  await audio.unlock(); await tick();
  const ctx = Context.instances.at(-1), source = ctx.sources[0];
  assert.equal(source.loop, true); assert.equal(source.loopEnd, 120);
  assert.equal(ctx.sources.length, 1);
  await audio.unlock(); audio.setMusic(true, .2); await tick();
  assert.equal(urls.filter(u => u.includes('constellations')).length, 1);
  assert.equal(ctx.sources.length, 1);
  ctx.currentTime = 17; audio.setActive(false); await tick();
  assert.equal(ctx.state, 'suspended');
  audio.setActive(true); await tick(); assert.equal(ctx.sources.length, 1);
  audio.setMusic(false, .2); assert.equal(source.stopped, true);
  ctx.currentTime = 32; audio.setMusic(true, .2);
  assert.equal(ctx.sources[1].offset, 17);
  audio.setMusic(true, 0); assert.equal(ctx.sources[1].stopped, true);
});

test('Disabling music while it downloads prevents late playback; offline failure remains harmless', async (t) => {
  let release;
  t.mock.method(globalThis, 'fetch', async url => String(url).includes('constellations') ? new Promise(resolve => release = resolve) : { ok: false });
  globalThis.AudioContext = Context;
  const audio = new AudioManager(); await audio.unlock();
  audio.setMusic(false, .3);
  release({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) }); await tick();
  const ctx = Context.instances.at(-1); assert.equal(ctx.sources.length, 0);
  audio.setMusic(true, .3); assert.equal(ctx.sources.length, 1);
  t.mock.restoreAll();
  t.mock.method(globalThis, 'fetch', async () => { throw Error('offline'); });
  const offlineAudio = new AudioManager(); await offlineAudio.unlock(); await tick();
  assert.equal(Context.instances.at(-1).sources.length, 0);
});

test('Global mute persists through migration and prestige without altering individual audio preferences', () => {
 const s=fresh();s.settings.muted=true;s.settings.music=true;s.settings.sound=false;s.settings.volume=.2;s.settings.musicVolume=.6;
 const expected={...s.settings};earn(s,1e9);assert.ok(prestige(s,1000));
 assert.deepEqual(parseSave(JSON.stringify(s),1000).settings,expected);
 delete s.settings.muted;assert.equal(parseSave(JSON.stringify(s),1000).settings.muted,false);
});
