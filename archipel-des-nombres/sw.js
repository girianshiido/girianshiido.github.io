const PREFIX='archipel-nombres-';
const CACHE=PREFIX+'0eb68c7b7910aab7';
const FILES=["./assets/index-CNPHZNod.css","./assets/index-Dg5ZDxtp.js","./audio/CREDITS.txt","./audio/finish.mp3","./audio/good.mp3","./audio/guide.mp3","./audio/tap.mp3","./audio/voix/add.mp3","./audio/voix/basket-1.mp3","./audio/voix/basket-10.mp3","./audio/voix/basket-2.mp3","./audio/voix/basket-3.mp3","./audio/voix/basket-4.mp3","./audio/voix/basket-5.mp3","./audio/voix/basket-6.mp3","./audio/voix/basket-7.mp3","./audio/voix/basket-8.mp3","./audio/voix/basket-9.mp3","./audio/voix/color.mp3","./audio/voix/compare-equal.mp3","./audio/voix/compare-less.mp3","./audio/voix/compare-more.mp3","./audio/voix/complete-five.mp3","./audio/voix/count-collection.mp3","./audio/voix/count-dice.mp3","./audio/voix/count-fish.mp3","./audio/voix/count-hand.mp3","./audio/voix/count-line.mp3","./audio/voix/count-pearls.mp3","./audio/voix/count-ring.mp3","./audio/voix/count-scatter.mp3","./audio/voix/count-stars.mp3","./audio/voix/echo-guide.mp3","./audio/voix/empty.mp3","./audio/voix/example.mp3","./audio/voix/ferry.mp3","./audio/voix/glance.mp3","./audio/voix/good-basket.mp3","./audio/voix/good-change.mp3","./audio/voix/good-color.mp3","./audio/voix/good-compare.mp3","./audio/voix/good-count.mp3","./audio/voix/good-echo.mp3","./audio/voix/good-ferry.mp3","./audio/voix/good-five.mp3","./audio/voix/good-glance.mp3","./audio/voix/good-match.mp3","./audio/voix/good-order.mp3","./audio/voix/good-pair.mp3","./audio/voix/good-split.mp3","./audio/voix/hear-group.mp3","./audio/voix/match-cards.mp3","./audio/voix/n0.mp3","./audio/voix/n1.mp3","./audio/voix/n10.mp3","./audio/voix/n2.mp3","./audio/voix/n3.mp3","./audio/voix/n4.mp3","./audio/voix/n5.mp3","./audio/voix/n6.mp3","./audio/voix/n7.mp3","./audio/voix/n8.mp3","./audio/voix/n9.mp3","./audio/voix/order.mp3","./audio/voix/pair.mp3","./audio/voix/remove.mp3","./audio/voix/same-group.mp3","./audio/voix/split-shells.mp3","./audio/voix/touch.mp3","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-512.png","./images/archipel.webp","./images/avatar-0.webp","./images/avatar-1.webp","./images/avatar-2.webp","./images/avatar-3.webp","./images/hands/hand-0.webp","./images/hands/hand-1.webp","./images/hands/hand-2.webp","./images/hands/hand-3.webp","./images/hands/hand-4.webp","./images/hands/hand-5.webp","./images/island-0.webp","./images/island-1.webp","./images/island-2.webp","./images/island-3.webp","./images/island-4.webp","./images/island-5.webp","./index.html","./manifest.webmanifest"];
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
