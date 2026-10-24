import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require(
  require.resolve("sharp", {
    paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || "node_modules"],
  }),
);
await import("./interface-icons.mjs");
const source = process.argv[2];
if (source)
  for (const size of [480, 960])
    await sharp(source)
      .resize(size, size, { fit: "inside" })
      .png({ palette: true, colours: 256, dither: 0.5 })
      .toFile(`public/images/planet-${size}.png`);
console.log("Atlas PNG et illustrations prêts.");
