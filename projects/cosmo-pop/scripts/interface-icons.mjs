import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require(
  require.resolve("sharp", {
    paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || "node_modules"],
  }),
);
const names = JSON.parse(
  await readFile("scripts/interface-icons.json", "utf8"),
);
const cell = 192;
const sources = {
  planet: "public/images/planet-480.png",
  mill: "public/images/workshops/1.png",
  sprout: "public/images/workshops/20.png",
  hive: "public/images/workshops/3.png",
  portal: "public/images/workshops/4.png",
  sun: "public/images/workshops/5.png",
  orbit: "public/images/workshops/17.png",
  nebula: "public/images/workshops/9.png",
  ...Object.fromEntries(
    [
      "hand",
      "clock",
      "comet",
      "bolt",
      "rocket",
      "moon",
      "book",
      "bot",
      "trophy",
    ].map((name) => [name, `public/images/symbols/${name}.png`]),
  ),
};
const star =
  "M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9Z";
const gear =
  Array.from({ length: 40 }, (_, i) => {
    const angle = (i * Math.PI) / 20 - Math.PI / 2,
      r = [8, 10, 10, 8][i % 4];
    return `${i ? "L" : "M"}${12 + Math.cos(angle) * r},${12 + Math.sin(angle) * r}`;
  }).join("") + "Z";
const native = {
  spark:
    '<path d="M12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9Z" fill="url(#gold)"/><path d="M12 3v9L3 12l6-3Z" fill="#fff4cd" opacity=".8"/>',
  star: `<path d="${star}" fill="url(#gold)"/><path d="M12 3v10L6.2 20l1.1-6.1L3 9.8l6.2-.9Z" fill="#fff2bd" opacity=".65"/><path d="M12 13l5.6 7-1-6.1 4.4-4.1Z" fill="#d28c3f" opacity=".4"/>`,
  settings: `<path d="${gear}" fill="url(#purple)"/><circle cx="12" cy="12" r="4.6" fill="url(#gold)"/><circle cx="12" cy="12" r="2.5" fill="#79529e"/><path d="M7 7a7 7 0 0 1 8-1" fill="none" stroke="#fff" opacity=".55" stroke-width="1.2"/>`,
  volume:
    '<path d="M3 8.5h4L13 4v16l-6-4.5H3Z" fill="url(#purple)"/><path d="M3 9h3v6H3Z" fill="url(#gold)"/><path d="M16 8q4 4 0 8m3-11q7 7 0 14" fill="none" stroke="url(#gold)" stroke-width="2.4" stroke-linecap="round"/>',
  mute: '<path d="M3 8.5h4L13 4v16l-6-4.5H3Z" fill="url(#purple)"/><path d="M3 9h3v6H3Z" fill="url(#gold)"/><path d="m17 9 5 6m0-6-5 6" fill="none" stroke="url(#rose)" stroke-width="2.8" stroke-linecap="round"/>',
  check:
    '<path d="m3 12 5 5L21 4l1.5 2.5L8 21 1 14Z" fill="url(#mint)"/><path d="m3 12 5 5L21 4" fill="none" stroke="#dffff0" stroke-width=".9"/>',
  lock: '<path d="M6.5 11V8a5.5 5.5 0 0 1 11 0v3" fill="none" stroke="url(#gold)" stroke-width="3.2"/><rect x="3" y="10" width="18" height="12" rx="3.5" fill="url(#purple)"/><circle cx="12" cy="15" r="1.8" fill="#ffe6a2"/><path d="M12 16v3" stroke="#ffe6a2" stroke-width="1.8" stroke-linecap="round"/><path d="M5 12h13" stroke="white" stroke-width=".8" opacity=".5"/>',
  arrow:
    '<path d="M2 10h12L10 5l3-2 9 9-9 9-3-2 4-5H2Z" fill="url(#gold)"/><path d="M3 10.5h12L11 5" fill="none" stroke="#fff3c8" stroke-width="1"/>',
  close:
    '<g fill="url(#purple)" stroke="#f7dba0" stroke-width=".6"><rect x="3" y="9.5" width="18" height="5" rx="2.4" transform="rotate(45 12 12)"/><rect x="3" y="9.5" width="18" height="5" rx="2.4" transform="rotate(-45 12 12)"/></g>',
  download:
    '<path d="M3 15v6h18v-6h-3v3H6v-3Z" fill="url(#purple)"/><path d="M10 2h4v9h5l-7 7-7-7h5Z" fill="url(#gold)"/>',
  upload:
    '<path d="M3 15v6h18v-6h-3v3H6v-3Z" fill="url(#purple)"/><path d="M10 17h4V9h5l-7-7-7 7h5Z" fill="url(#gold)"/>',
  info: '<circle cx="12" cy="12" r="10" fill="url(#gold)"/><circle cx="12" cy="12" r="8.3" fill="url(#purple)"/><circle cx="12" cy="7" r="1.3" fill="#fff8e8"/><rect x="10.6" y="10" width="2.8" height="8" rx="1.3" fill="#fff8e8"/><path d="M6 6a8 8 0 0 1 7-2" stroke="white" fill="none" opacity=".5" stroke-width="1"/>',
  heart:
    '<path d="M12 21C7 17 1 13 2 7c1-5 7-6 10-1 3-5 9-4 10 1 1 6-5 10-10 14Z" fill="url(#rose)"/><path d="M5 8q0-4 4-3" fill="none" stroke="#fff3fa" stroke-width="1.5" stroke-linecap="round"/>',
  sugar:
    '<path d="m12 2 9 5-9 5-9-5Z" fill="#ffe7f3"/><path d="M3 7l9 5v10l-9-5Z" fill="url(#rose)"/><path d="m12 12 9-5v10l-9 5Z" fill="url(#purple)"/><path d="m12 2 9 5-9 5-9-5Z" fill="none" stroke="#fff4dd" stroke-width=".7"/><path d="m17 10 .8 2.1 2.2.2-1.7 1.5.4 2.2-1.8-1-1.7 1 .3-2.1-1.4-1.6 2.1-.2Z" fill="#ffe3a0"/>',
  chart:
    '<path d="M3 20h19v2H2V3h2v17Z" fill="url(#gold)"/><rect x="6" y="12" width="4" height="7" rx="1.1" fill="url(#mint)"/><rect x="11.5" y="8" width="4" height="11" rx="1.1" fill="url(#rose)"/><rect x="17" y="3" width="4" height="16" rx="1.1" fill="url(#purple)"/>',
  leaf: '<path d="M4 20C-1 6 10 1 22 2c1 14-8 21-18 18Z" fill="url(#mint)"/><path d="M4 20 18 6M9 15l-1-5m5 1 4 1" stroke="#fff1b8" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M5 12q1-6 8-7" stroke="#e9fff5" stroke-width="1.2" fill="none" opacity=".65"/>',
  refresh:
    '<path d="M4.5 8a8 8 0 0 1 13-3l2 2M19.5 16a8 8 0 0 1-13 3l-2-2" fill="none" stroke="url(#gold)" stroke-width="3.2" stroke-linecap="round"/><path d="m21 2-1 9-8-2ZM3 22l1-9 8 2Z" fill="url(#purple)"/>',
};
const defs =
  '<defs><linearGradient id="gold" x1="0" y1="0" x2=".4" y2="1"><stop stop-color="#fff1b3"/><stop offset=".42" stop-color="#efc56a"/><stop offset="1" stop-color="#b47a35"/></linearGradient><linearGradient id="purple" x1="0" y1="0" x2=".5" y2="1"><stop stop-color="#e1c5fc"/><stop offset=".48" stop-color="#b88bdc"/><stop offset="1" stop-color="#8050af"/></linearGradient><linearGradient id="mint" x2=".5" y2="1"><stop stop-color="#c3f5de"/><stop offset=".45" stop-color="#82d7b7"/><stop offset="1" stop-color="#3b9a87"/></linearGradient><linearGradient id="rose" x2=".4" y2="1"><stop stop-color="#ffd6e9"/><stop offset=".45" stop-color="#eda2c1"/><stop offset="1" stop-color="#bf6a9e"/></linearGradient><filter id="soft" x="-25%" y="-25%" width="160%" height="160%"><feDropShadow dx="0" dy=".8" stdDeviation=".55" flood-color="#663c72" flood-opacity=".28"/></filter></defs>';
await mkdir("public/images/symbols", { recursive: true });
const layers = [];
for (const [i, name] of names.entries()) {
  let png;
  if (sources[name]) {
    png = await sharp(sources[name])
      .trim()
      .resize(172, 172, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .extend({
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
  } else {
    if (!native[name]) throw Error("Missing icon: " + name);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 24 24">${defs}<g transform="translate(1.2 1.2) scale(.9)" filter="url(#soft)" stroke="#735277" stroke-width=".3" stroke-linejoin="round">${native[name]}</g></svg>`;
    png = await sharp(Buffer.from(svg)).png().toBuffer();
  }
  layers.push({
    input: png,
    left: (i % 8) * cell,
    top: Math.floor(i / 8) * cell,
  });
}
await sharp({
  create: {
    width: cell * 8,
    height: cell * Math.ceil(names.length / 8),
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(layers)
  .png({ palette: true, colours: 256, dither: 0.35 })
  .toFile("public/images/icons-v14.png");
await writeFile(
  "docs/interface-icons-catalog.json",
  JSON.stringify({ cell, columns: 8, rows: 5, names }, null, 2) + "\n",
);
console.log(
  `${names.length} icônes couleur — atlas PNG ${cell * 8} × ${cell * 5}`,
);
