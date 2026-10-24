import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../dist/js/engine.js";

test("The permanent assistant requires eight rebirths and 1500 dust, charged once", () => {
  const s = E.fresh();
  s.dust = s.totalDust = E.AUTOMATION.cost;
  assert.equal(E.buyAutomation(s), false);
  s.prestiges = E.AUTOMATION.gate;
  s.dust--;
  assert.equal(E.buyAutomation(s), false);
  s.dust++;
  assert.equal(E.buyAutomation(s), true);
  assert.equal(s.dust, 0);
  assert.equal(s.totalDust, E.AUTOMATION.cost);
  assert.deepEqual(s.automation, { owned: true, enabled: true });
  s.dust = 2000;
  assert.equal(E.buyAutomation(s), false);
  assert.equal(s.dust, 2000);
});

test("Automation buys general and workshop recipes, obeying gates and exact prices", () => {
  const s = E.fresh();
  s.automation = { owned: true, enabled: true };
  E.earn(s, 500);
  s.buildings[0] = 10;
  const m = E.MILESTONES.find((m) => m.id === "recipe-0-10");
  const before = s.sugar;
  const purchases = E.automateUpgrades(s);
  assert.deepEqual(purchases, [
    "Gants de confiseur",
    E.BUILDINGS[0].name + " · " + m.name,
  ]);
  assert.equal(s.sugar, before - 80 - m.price);
  assert.ok(s.sugar >= 0);
  assert.equal(s.totalMilestones, 1);
  assert.deepEqual(E.automateUpgrades(s), []);
  assert.equal(s.dust, 0);
  assert.equal(s.upgrades.includes("alloy"), false);
});

test("Automation is bounded, pausable, cannot spend dust or purchase machines/research", () => {
  const s = E.fresh();
  E.earn(s, 1e30);
  s.buildings.fill(200);
  s.dust = s.totalDust = 2000;
  assert.deepEqual(E.automateUpgrades(s), []);
  s.automation = { owned: true, enabled: false };
  assert.deepEqual(E.automateUpgrades(s), []);
  s.automation.enabled = true;
  const counts = [...s.buildings];
  assert.equal(E.automateUpgrades(s).length, 3);
  assert.deepEqual(s.buildings, counts);
  assert.equal(s.dust, 2000);
  assert.deepEqual(s.research, { radiance: 0, touch: 0, time: 0 });
  assert.ok(s.sugar >= 0);
});

test("Automation exhausts the eligible recipe catalogue without duplicate purchases", () => {
  const s = E.fresh();
  E.earn(s, 1e250);
  s.prestiges = 36;
  s.buildings.fill(800);
  s.automation = { owned: true, enabled: true };
  let purchases = 0;
  for (let tick = 0; tick < 100; tick++) {
    const batch = E.automateUpgrades(s);
    assert.ok(batch.length <= 3);
    purchases += batch.length;
  }
  assert.equal(purchases, E.UPGRADES.length + E.MILESTONES.length);
  assert.equal(s.totalMilestones, E.MILESTONES.length);
  assert.equal(new Set(s.milestones).size, E.MILESTONES.length);
  assert.deepEqual(E.automateUpgrades(s), []);
  assert.ok(Number.isFinite(E.production(s)));
});

test("Assistant ownership and pause survive save parsing and rebirth", () => {
  const s = E.fresh(1000);
  const legacy = structuredClone(s);
  delete legacy.automation;
  assert.deepEqual(E.parseSave(JSON.stringify(legacy), 1000).automation, {
    owned: false,
    enabled: false,
  });
  s.automation = { owned: true, enabled: false };
  E.earn(s, 1e9);
  const restored = E.parseSave(JSON.stringify(s), 1000);
  assert.deepEqual(restored.automation, s.automation);
  assert.ok(E.prestige(restored, 1000));
  assert.deepEqual(restored.automation, { owned: true, enabled: false });
  const invalid = structuredClone(s);
  invalid.automation = { owned: false, enabled: true };
  assert.equal(
    E.parseSave(JSON.stringify(invalid), 1000).automation.enabled,
    false,
  );
});

test("Every workshop has a unique HD PNG included in the offline cache", async () => {
  const { readFile } = await import("node:fs/promises");
  const { createHash } = await import("node:crypto");
  const sw = await readFile("dist/sw.js", "utf8");
  const hashes = new Set();
  let bytes = 0;
  for (let i = 0; i < E.BUILDINGS.length; i++) {
    const file = `./images/workshops/${i}.png`;
    const png = await readFile("dist/" + file.slice(2));
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(png.readUInt32BE(16), 384);
    assert.equal(png.readUInt32BE(20), 384);
    assert.ok(sw.includes(file));
    hashes.add(createHash("sha256").update(png).digest("hex"));
    bytes += png.length;
  }
  assert.equal(hashes.size, E.BUILDINGS.length);
  assert.ok(bytes < 4_000_000, "Keep the complete workshop art set below 4 MB");
});
