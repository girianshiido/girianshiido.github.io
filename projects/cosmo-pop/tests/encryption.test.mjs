import test from "node:test";
import assert from "node:assert/strict";
globalThis.location = { pathname: "/cosmo-pop/" };
const { exportEncrypted, importEncrypted } = await import(
  "../dist/js/storage.js"
);
const { fresh, earn } = await import("../dist/js/engine.js");
const password = "Un cosmos très sucré !";
test("Portable AES-GCM encryption round-trips without leaking the plaintext state", async () => {
  const s = fresh();
  earn(s, 12345);
  const text = await exportEncrypted(s, password);
  assert.ok(!text.includes("sugar"));
  assert.ok(!text.includes("12345"));
  const restored = await importEncrypted(text, password);
  assert.equal(restored.sugar, 12345);
  assert.equal(restored.total, 12345);
});
test("Each encrypted export gets a fresh salt and IV", async () => {
  const s = fresh();
  const a = JSON.parse(await exportEncrypted(s, password)),
    b = JSON.parse(await exportEncrypted(s, password));
  assert.notEqual(a.iv, b.iv);
  assert.notEqual(a.salt, b.salt);
  assert.notEqual(a.data, b.data);
});
test("Wrong passwords and ciphertext alterations are rejected", async () => {
  const text = await exportEncrypted(fresh(), password);
  await assert.rejects(importEncrypted(text, "Un autre mot de passe"));
  const e = JSON.parse(text);
  e.data = (e.data[0] === "A" ? "B" : "A") + e.data.slice(1);
  await assert.rejects(importEncrypted(JSON.stringify(e), password));
});
test("Malformed envelopes, unsupported KDF settings and short passwords are rejected", async () => {
  await assert.rejects(exportEncrypted(fresh(), "short"));
  await assert.rejects(importEncrypted("{}", password));
  const e = JSON.parse(await exportEncrypted(fresh(), password));
  e.iterations = 1e12;
  await assert.rejects(importEncrypted(JSON.stringify(e), password));
});

test("Encrypted legacy exports receive the dust refund once and preserve new research on re-export", async () => {
  const legacy=fresh();delete legacy.dustEconomy;
  legacy.research={radiance:3,touch:0,time:0};legacy.dust=10;legacy.totalDust=31;
  const restored=await importEncrypted(await exportEncrypted(legacy,password),password);
  assert.equal(restored.dust,13);assert.equal(restored.totalDust,31);
  restored.research.navigation=2;restored.research.comets=1;restored.research.nova=3;
  const again=await importEncrypted(await exportEncrypted(restored,password),password);
  assert.equal(again.dust,13);assert.deepEqual(again.research,restored.research);
});


test("Voyage perks, pending returns and route prices remain inside the encrypted save", async () => {
  const s=fresh();earn(s,100000);s.voyages.departures=[3,2,0,0,0];
  s.voyages.reward=0;s.voyages.coupon={building:1,remaining:3};s.voyages.tapUntil=Date.now()+60000;
  const text=await exportEncrypted(s,password);
  assert.ok(!text.includes('voyages'));assert.ok(!text.includes('coupon'));
  const restored=await importEncrypted(text,password);
  assert.deepEqual(restored.voyages,s.voyages);
});
