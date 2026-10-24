import { readFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require(
  require.resolve("sharp", {
    paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || "node_modules"],
  }),
);
const files = JSON.parse(
  await readFile(process.argv[2] || "scripts/generated-icons.json", "utf8"),
);
await mkdir("public/images/workshops", { recursive: true });
for (const f of files) {
  if (f.i === "app") {
    for (const [size, name] of [
      [192, "icon-192.png"],
      [512, "icon-512.png"],
      [512, "icon-maskable.png"],
      [180, "apple-touch-icon.png"],
    ])
      await sharp(f.path)
        .resize(size, size)
        .png({ palette: true, colours: 256, dither: 0.5 })
        .toFile("public/" + name);
    for (const name of [
      "icon-192.png",
      "icon-512.png",
      "icon-maskable.png",
      "apple-touch-icon.png",
    ]) {
      const { copyFile } = await import("node:fs/promises");
      await copyFile(
        "public/" + name,
        "public/" + name.replace(".png", "-v13.png"),
      );
    }
  } else {
    await sharp(f.path)
      .resize(384, 384, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ palette: true, colours: 256, dither: 0.5 })
      .toFile(`public/images/workshops/${f.i}.png`);
  }
}
console.log(`Imported ${files.length} generated assets`);
