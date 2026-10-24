import { cp, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
if (path.basename(path.dirname(root)) !== "projects")
  throw Error(
    "Cette commande doit être exécutée depuis projects/cosmo-pop dans le dépôt GitHub Pages.",
  );
const target = path.resolve(root, "../../cosmo-pop");
await mkdir(target, { recursive: true });
for (const f of await readdir(path.join(root, "dist"))) {
  if (f.startsWith("qa")) continue;
  await cp(path.join(root, "dist", f), path.join(target, f), {
    recursive: true,
    filter: (src) =>
      !path.basename(src).startsWith("qa") && !src.endsWith("-qa.js"),
  });
}
console.log("Version GitHub Pages préparée dans " + target);
