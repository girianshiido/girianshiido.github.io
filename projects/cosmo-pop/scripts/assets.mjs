import { readFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require(
  require.resolve("sharp", {
    paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || "node_modules"],
  }),
);
const paths = JSON.parse(await readFile("scripts/icons.json", "utf8"));
await mkdir("public/images", { recursive: true });
const keys = Object.keys(paths),
  rows = Math.ceil(keys.length / 8);
const shape = (name) =>
  `<g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.spark}</g>`;
const atlas = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="${rows * 96}" viewBox="0 0 192 ${rows * 24}" color="#000">${keys.map((name, i) => `<g transform="translate(${(i % 8) * 24} ${Math.floor(i / 8) * 24})">${shape(name)}</g>`).join("")}</svg>`;
await sharp(Buffer.from(atlas)).png().toFile("public/images/icons.png");
const source = process.argv[2];
if (source)
  for (const size of [480, 960])
    await sharp(source)
      .resize(size, size, { fit: "inside" })
      .png({ palette: true, colours: 256, dither: 0.5 })
      .toFile(`public/images/planet-${size}.png`);
console.log("Atlas PNG et illustrations prêts.");
