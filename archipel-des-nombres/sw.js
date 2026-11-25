const PREFIX='archipel-nombres-';
const CACHE=PREFIX+'2669e90672ab2a53';
const FILES=["./assets/index-Q1Mh94ab.css","./assets/index-inthm4JX.js","./audio/CREDITS.txt","./audio/finish.mp3","./audio/good.mp3","./audio/guide.mp3","./audio/tap.mp3","./audio/voix/add.mp3","./audio/voix/basket-1.mp3","./audio/voix/basket-10.mp3","./audio/voix/basket-2.mp3","./audio/voix/basket-3.mp3","./audio/voix/basket-4.mp3","./audio/voix/basket-5.mp3","./audio/voix/basket-6.mp3","./audio/voix/basket-7.mp3","./audio/voix/basket-8.mp3","./audio/voix/basket-9.mp3","./audio/voix/color.mp3","./audio/voix/echo-guide.mp3","./audio/voix/empty.mp3","./audio/voix/example.mp3","./audio/voix/ferry.mp3","./audio/voix/glance.mp3","./audio/voix/good-basket.mp3","./audio/voix/good-change.mp3","./audio/voix/good-color.mp3","./audio/voix/good-count.mp3","./audio/voix/good-echo.mp3","./audio/voix/good-ferry.mp3","./audio/voix/good-glance.mp3","./audio/voix/good-order.mp3","./audio/voix/good-pair.mp3","./audio/voix/lagon/add.mp3","./audio/voix/lagon/basket-1.mp3","./audio/voix/lagon/basket-10.mp3","./audio/voix/lagon/basket-2.mp3","./audio/voix/lagon/basket-3.mp3","./audio/voix/lagon/basket-4.mp3","./audio/voix/lagon/basket-5.mp3","./audio/voix/lagon/basket-6.mp3","./audio/voix/lagon/basket-7.mp3","./audio/voix/lagon/basket-8.mp3","./audio/voix/lagon/basket-9.mp3","./audio/voix/lagon/color.mp3","./audio/voix/lagon/echo-guide.mp3","./audio/voix/lagon/empty.mp3","./audio/voix/lagon/example.mp3","./audio/voix/lagon/ferry.mp3","./audio/voix/lagon/glance.mp3","./audio/voix/lagon/good-basket.mp3","./audio/voix/lagon/good-change.mp3","./audio/voix/lagon/good-color.mp3","./audio/voix/lagon/good-count.mp3","./audio/voix/lagon/good-echo.mp3","./audio/voix/lagon/good-ferry.mp3","./audio/voix/lagon/good-glance.mp3","./audio/voix/lagon/good-order.mp3","./audio/voix/lagon/good-pair.mp3","./audio/voix/lagon/n0.mp3","./audio/voix/lagon/n1.mp3","./audio/voix/lagon/n10.mp3","./audio/voix/lagon/n2.mp3","./audio/voix/lagon/n3.mp3","./audio/voix/lagon/n4.mp3","./audio/voix/lagon/n5.mp3","./audio/voix/lagon/n6.mp3","./audio/voix/lagon/n7.mp3","./audio/voix/lagon/n8.mp3","./audio/voix/lagon/n9.mp3","./audio/voix/lagon/order.mp3","./audio/voix/lagon/pair.mp3","./audio/voix/lagon/remove.mp3","./audio/voix/lagon/touch.mp3","./audio/voix/n0.mp3","./audio/voix/n1.mp3","./audio/voix/n10.mp3","./audio/voix/n2.mp3","./audio/voix/n3.mp3","./audio/voix/n4.mp3","./audio/voix/n5.mp3","./audio/voix/n6.mp3","./audio/voix/n7.mp3","./audio/voix/n8.mp3","./audio/voix/n9.mp3","./audio/voix/order.mp3","./audio/voix/pair.mp3","./audio/voix/phare/add.mp3","./audio/voix/phare/basket-1.mp3","./audio/voix/phare/basket-10.mp3","./audio/voix/phare/basket-2.mp3","./audio/voix/phare/basket-3.mp3","./audio/voix/phare/basket-4.mp3","./audio/voix/phare/basket-5.mp3","./audio/voix/phare/basket-6.mp3","./audio/voix/phare/basket-7.mp3","./audio/voix/phare/basket-8.mp3","./audio/voix/phare/basket-9.mp3","./audio/voix/phare/color.mp3","./audio/voix/phare/echo-guide.mp3","./audio/voix/phare/empty.mp3","./audio/voix/phare/example.mp3","./audio/voix/phare/ferry.mp3","./audio/voix/phare/glance.mp3","./audio/voix/phare/good-basket.mp3","./audio/voix/phare/good-change.mp3","./audio/voix/phare/good-color.mp3","./audio/voix/phare/good-count.mp3","./audio/voix/phare/good-echo.mp3","./audio/voix/phare/good-ferry.mp3","./audio/voix/phare/good-glance.mp3","./audio/voix/phare/good-order.mp3","./audio/voix/phare/good-pair.mp3","./audio/voix/phare/n0.mp3","./audio/voix/phare/n1.mp3","./audio/voix/phare/n10.mp3","./audio/voix/phare/n2.mp3","./audio/voix/phare/n3.mp3","./audio/voix/phare/n4.mp3","./audio/voix/phare/n5.mp3","./audio/voix/phare/n6.mp3","./audio/voix/phare/n7.mp3","./audio/voix/phare/n8.mp3","./audio/voix/phare/n9.mp3","./audio/voix/phare/order.mp3","./audio/voix/phare/pair.mp3","./audio/voix/phare/remove.mp3","./audio/voix/phare/touch.mp3","./audio/voix/remove.mp3","./audio/voix/touch.mp3","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-512.png","./images/archipel.webp","./images/avatar-0.webp","./images/avatar-1.webp","./images/avatar-2.webp","./images/avatar-3.webp","./images/island-0.webp","./images/island-1.webp","./images/island-2.webp","./images/island-3.webp","./images/island-4.webp","./images/island-5.webp","./index.html","./manifest.webmanifest"];
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
