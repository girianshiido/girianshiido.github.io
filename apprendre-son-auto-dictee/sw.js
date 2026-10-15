// Bump this version whenever a published application file changes.
const CACHE = 'autodictee-pwa-v2';
const ROOT = new URL('./', self.location.href);
const FILES = ['./','index.html','style.css','app.js','pwa.js','dictations.json','manifest.webmanifest','assets/atelier.webp','assets/le-vote.webp','assets/icon-192.png','assets/icon-512.png','assets/apple-touch-icon.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES.map(path=>new URL(path, ROOT).href))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('autodictee-pwa-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
  const canonical=new URL(url);canonical.search='';canonical.hash='';
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try {
      const response=await fetch(event.request);
      if(response.ok)await cache.put(canonical.href,response.clone());
      return response;
    } catch(error) {
      const saved=await cache.match(canonical.href);
      if(saved){
        if(url.pathname.endsWith('/dictations.json')){
          const headers=new Headers(saved.headers);headers.set('X-Autodictee-Offline','1');
          return new Response(saved.body,{status:saved.status,statusText:saved.statusText,headers});
        }
        return saved;
      }
      if(event.request.mode==='navigate'){
        const home=await cache.match(ROOT.href);
        if(home)return home;
      }
      throw error;
    }
  })());
});
