const PREFIX='archipel-nombres-';
const CACHE=PREFIX+'fd81ea15';
const FILES=["./art.js","./audio.js","./audio/CREDITS.txt","./audio/finish.wav","./audio/good.wav","./audio/guide.wav","./audio/n0.wav","./audio/n1.wav","./audio/n10.wav","./audio/n2.wav","./audio/n3.wav","./audio/n4.wav","./audio/n5.wav","./audio/n6.wav","./audio/n7.wav","./audio/n8.wav","./audio/n9.wav","./audio/tap.wav","./engine.js","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-512.png","./images/archipel.png","./index.html","./main.js","./manifest.webmanifest","./pwa.js","./storage.js","./style.css"];
const ROOT=new URL(self.registration.scope);
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(path=>
    new Request(new URL(path,ROOT),{cache:'reload'})
  ))));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',event=>{
  if(event.data==='activate')event.waitUntil(self.skipWaiting());
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
  const path='./'+url.pathname.slice(ROOT.pathname.length);
  const navigate=request.mode==='navigate'&&(path==='./'||path==='./index.html');
  if(!navigate&&!FILES.includes(path))return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const hit=await cache.match(new URL(navigate?'./index.html':path,ROOT));
    if(!hit)return fetch(request);
    const range=request.headers.get('Range');
    const parts=range&&/^bytes=(\d*)-(\d*)$/.exec(range);
    if(!parts||!parts[1]&&!parts[2])return hit;
    const bytes=await hit.arrayBuffer();
    const start=parts[1]?Number(parts[1]):Math.max(0,bytes.byteLength-Number(parts[2]));
    const end=parts[1]&&parts[2]?Math.min(bytes.byteLength-1,Number(parts[2])):bytes.byteLength-1;
    if(start>end)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+bytes.byteLength}});
    return new Response(bytes.slice(start,end+1),{status:206,headers:{
      'Content-Type':hit.headers.get('Content-Type')||'application/octet-stream',
      'Content-Range':'bytes '+start+'-'+end+'/'+bytes.byteLength,
      'Content-Length':String(end-start+1),'Accept-Ranges':'bytes',
    }});
  }));
});
