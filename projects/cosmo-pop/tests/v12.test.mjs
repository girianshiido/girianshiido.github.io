import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as E from "../dist/js/engine.js";
test("Legacy automatic milestones retain their original bonus, without inflation", () => {
  const legacy = E.fresh(1000);
  legacy.buildings = Array(30).fill(0);
  legacy.buildings[0] = 200;
  delete legacy.milestones;
  delete legacy.legacyMilestones;
  delete legacy.totalMilestones;
  delete legacy.settings.theme;
  E.earn(legacy, 1e10);
  const s = E.parseSave(JSON.stringify(legacy), 1000);
  assert.equal(s.buildings.length, 36);
  assert.equal(s.legacyMilestones.length, 5);
  assert.equal(E.buildingMultiplier(s, 0), 1.5 ** 5);
  assert.equal(s.settings.theme, "lavande");
  assert.equal(s.totalMilestones, 0);
});
test("A newly reached milestone never activates itself and spends its exact price", () => {
  const s = E.fresh();
  s.buildings[5] = 25;
  E.earn(s, 1e30);
  const m = E.MILESTONES.find((m) => m.building === 5 && m.at === 25);
  assert.equal(E.buildingMultiplier(s, 5), 1);
  const before = s.sugar;
  s.sugar = m.price - 1;
  assert.equal(E.buyMilestone(s, m.id), false);
  s.sugar = m.price;
  assert.ok(E.buyMilestone(s, m.id));
  assert.equal(s.sugar, 0);
  assert.equal(E.buildingMultiplier(s, 5), 3);
  assert.equal(s.totalMilestones, 1);
  assert.equal(E.buyMilestone(s, m.id), false);
  assert.ok(before > m.price);
});
test("Revival recipes are gated and their incremental output is capped", () => {
  const s = E.fresh();
  s.buildings[0] = 600;
  E.earn(s, 1e90);
  const rev = E.MILESTONES.find((m) => m.revival);
  assert.equal(E.buyMilestone(s, rev.id), false);
  s.prestiges = rev.gate;
  for (const m of E.MILESTONES.filter(
    (m) => m.building === 0 && !m.revival && m.at <= 600,
  ))
    E.buyMilestone(s, m.id);
  const base = E.buildingOutput(s, 0);
  assert.ok(E.buyMilestone(s, rev.id));
  assert.ok(E.buildingOutput(s, 0) <= base + rev.cap);
  assert.ok(Number.isFinite(E.production(s)));
});
test("Distant discoveries remain hidden and the next one appears before its threshold", () => {
  const s = E.fresh();
  assert.equal(E.upgradeVisible(s, "galaxy"), false);
  assert.equal(E.upgradeVisible(s, "gloves"), false);
  E.earn(s, 10);
  assert.equal(E.upgradeVisible(s, "gloves"), true);
  const m = E.MILESTONES.find((m) => m.building === 0 && m.at === 10);
  s.buildings[0] = 7;
  assert.equal(E.milestoneVisible(s, m), false);
  s.buildings[0] = 8;
  assert.equal(E.milestoneVisible(s, m), true);
  assert.equal(E.milestoneReady(s, m), false);
});
test("Prestige removes paid recipes, retaining purchase statistics and themes", () => {
  const s = E.fresh();
  E.earn(s, 1e9);
  s.buildings[0] = 10;
  E.buyMilestone(s, "recipe-0-10");
  s.settings.theme = "menthe";
  assert.ok(E.prestige(s, 1000));
  assert.equal(s.milestones.length, 0);
  assert.equal(s.totalMilestones, 1);
  assert.equal(s.settings.theme, "menthe");
});
test("Production and notation remain finite and meaningful at 10^80", () => {
  assert.ok(!E.fmt(1e80).includes("e+"));
  assert.equal(E.BUILDINGS.at(-1).cost, 1e80);
  const s = E.fresh();
  s.prestiges = 36;
  E.earn(s, 1e85);
  assert.equal(E.buyBuilding(s, 35, 1), 1);
  assert.ok(Number.isFinite(E.production(s)));
  const restored = E.parseSave(JSON.stringify(s));
  assert.equal(restored.sugar, s.sugar);
});
test("PNG artwork, native pinch zoom and non-selectable interface are included", async () => {
  const html = await readFile("dist/index.html", "utf8"),
    art = await readFile("dist/js/art.js", "utf8"),
    main = await readFile("dist/js/main.js", "utf8");
  assert.ok(!html.includes(".svg"));
  assert.ok(!art.includes("<svg"));
  assert.ok(art.includes("-960.png"));
  assert.ok(!html.includes("maximum-scale=1"));
  assert.ok(!html.includes("user-scalable=no"));
  assert.ok(!main.includes("gesturestart"));
  const css = await readFile("dist/style.css", "utf8");
  assert.ok(css.includes("touch-action: pan-y pinch-zoom"));
  assert.ok(css.includes("-webkit-user-select: none"));
  assert.ok(main.includes("update-ready"));
  assert.ok(main.includes("display-mode: standalone"));
});

test("Very large quantities remain finite through 10^300 without freezing income", () => {
  const s = E.fresh();
  E.earn(s, 1e299);
  E.earn(s, 1e299);
  assert.equal(s.sugar, 2e299);
  E.earn(s, 1e300);
  assert.equal(s.sugar, E.LIMIT);
  assert.ok(!E.fmt(1e300).includes("Infinity"));
  assert.ok(E.fmt(1e300).includes("³⁰⁰"));
  assert.equal(E.parseSave(JSON.stringify(s)).sugar, E.LIMIT);
  s.buildings[0] = 1;
  s.totalDust = s.dust = 1e300;
  s.prestiges = 1e300;
  assert.ok(Number.isFinite(E.production(s)));
  assert.ok(Number.isFinite(E.tapValue(s)));
  assert.ok(E.production(s) <= E.LIMIT);
});
