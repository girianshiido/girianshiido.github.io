import { readFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require(
  require.resolve("sharp", {
    paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || "node_modules"],
  }),
);
const paths = JSON.parse(await readFile("scripts/icons.json", "utf8"));
const { BUILDINGS } = await import("../dist/js/engine.js");
await mkdir("public/images", { recursive: true });
const keys = Object.keys(paths),
  rows = Math.ceil(keys.length / 8);
const shape = (name) =>
  `<g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.spark}</g>`;
const atlas = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="${rows * 96}" viewBox="0 0 192 ${rows * 24}" color="#000">${keys.map((name, i) => `<g transform="translate(${(i % 8) * 24} ${Math.floor(i / 8) * 24})">${shape(name)}</g>`).join("")}</svg>`;
await sharp(Buffer.from(atlas)).png().toFile("public/images/icons.png");
const palettes = [
  ["#fbe1ef", "#cf79a6"],
  ["#d9f3e7", "#5a9a83"],
  ["#ffe8d3", "#d69555"],
  ["#fff0bd", "#bc9a38"],
  ["#eadffc", "#9271c5"],
  ["#dcecff", "#7097c5"],
];
const workshops = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="768" viewBox="0 0 768 768"><defs><linearGradient id="glass" x2=".8" y2="1"><stop stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>${BUILDINGS.map(
  (b, i) => {
    const [light, dark] = palettes[i % 6];
    return `<g transform="translate(${(i % 6) * 128} ${Math.floor(i / 6) * 128})"><ellipse cx="64" cy="108" rx="40" ry="9" fill="${dark}" opacity=".12"/><rect x="15" y="12" width="98" height="98" rx="30" fill="${light}"/><rect x="19" y="16" width="90" height="90" rx="27" fill="url(#glass)" stroke="white" stroke-opacity=".8"/><circle cx="64" cy="61" r="34" fill="${light}"/><g transform="translate(31 28) scale(2.75)" color="${dark}">${shape(b.icon)}</g><path d="m103 8 2 5 6 2-6 2-2 6-2-6-5-2 5-2Z" fill="${dark}" opacity=".5"/><circle cx="26" cy="94" r="3" fill="white"/></g>`;
  },
).join("")}</svg>`;
await sharp(Buffer.from(workshops)).png().toFile("public/images/workshops.png");
const source = process.argv[2];
if (source)
  for (const size of [480, 960])
    await sharp(source)
      .resize(size, size, { fit: "inside" })
      .png({ palette: true, colours: 256, dither: 0.5 })
      .toFile(`public/images/planet-${size}.png`);
console.log("Atlas PNG et illustrations prêts.");
