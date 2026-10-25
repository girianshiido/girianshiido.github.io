import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
await mkdir("dist", { recursive: true });
await cp("public", "dist", { recursive: true });
const files = [
  "./",
  "./index.html",
  "./style.css",
  "./icon-192-v13.png",
  "./icon-512-v13.png",
  "./icon-maskable-v13.png",
  "./apple-touch-icon-v13.png",
  "./images/icons-v14.png",
  ...Array.from({ length: 36 }, (_, i) => `./images/workshops/${i}.png`),
  ...Array.from({ length: 7 }, (_, i) => [480, 960].map(size => `./images/planets/${i}-${size}.png`)).flat(),
  "./manifest.webmanifest",
  "./js/main.js",
  "./js/engine.js",
  "./js/art.js",
  "./js/audio.js",
  "./js/storage.js",
  "./audio/constellations-v1.ogg",
  ...["pop", "buy", "reward", "comet", "launch"].map((x) => `./audio/${x}.ogg`),
];
const { createHash } = await import("node:crypto");
const hash = createHash("sha256");
for (const f of files.filter((x) => x !== "./"))
  hash.update(await readFile("dist/" + f.slice(2)));
const version = hash.digest("hex").slice(0, 12);
await writeFile(
  "dist/sw.js",
  `const CACHE='cosmo-pop-${version}';
const FILES=${JSON.stringify(files)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('cosmo-pop-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data==='ACTIVATE')self.skipWaiting()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request)))});
`,
);
console.log("Build prêt — cache " + version);
