import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {groupFor} from '../engine.ts';

const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg','.ogg':'audio/ogg','.m4a':'audio/mp4','.webmanifest':'application/manifest+json'};
const root=resolve('dist');
const server=createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if(!path.startsWith('/archipel/')){res.writeHead(404).end();return;}
  const name=path.slice('/archipel/'.length)||'index.html';
  const file=resolve(root,name);
  if(!file.startsWith(root+'/')){res.writeHead(404).end();return;}
  try{
    const body=await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]??'text/plain'}).end(body);
  }catch{res.writeHead(404).end();}
}).listen(0,'127.0.0.1');
await new Promise(resolve=>server.once('listening',resolve));
const base='http://127.0.0.1:'+server.address().port+'/archipel/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:320,height:730},isMobile:true,hasTouch:true,deviceScaleFactor:2});
const page=await context.newPage();
const fail=[];
page.on('pageerror',error=>fail.push(error.message));
const action=name=>page.locator('[data-action="'+name+'"]').last();
async function enter(index){
  if(await action('archipelago').count())await action('archipelago').tap();
  await action('group-'+groupFor(index)).tap();
  await action('island-'+index).tap();
  const confirm=action('confirm-island-'+index);
  if(await confirm.count())await confirm.tap();
}
const storeKey='archipel-des-nombres:save';
async function inSeries(){
  assert.equal(await action('advance').count(),0);
  assert.match(await page.locator('.step-label').innerText(),/^1 \/ \d+$/);
}

try{
  await page.addInitScript(()=>{
    window.numberStarts=0;
    const start=AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start=function(...args){
      window.numberStarts++;
      return start.apply(this,args);
    };
  });
  await page.goto(base,{waitUntil:'networkidle'});
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  assert.equal(await page.locator('.island img').count(),6);
  assert.ok(await page.locator('.island img').evaluateAll(imgs=>imgs.every(img=>img.complete&&img.naturalWidth>0)));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),320);
  assert.equal(await page.locator('.hero h1').evaluate(element=>getComputedStyle(element).userSelect),'none');
  const contextMenuBlocked=target=>target.evaluate(element=>!element.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true})));
  assert.equal(await contextMenuBlocked(page.locator('.hero h1')),true);
  const cdp=await context.newCDPSession(page);
  const scale=()=>page.evaluate(()=>window.visualViewport.scale);
  await page.touchscreen.tap(150,159);
  await page.touchscreen.tap(150,159);
  await page.waitForTimeout(300);
  assert.equal(await scale(),1);
  const fingers=distance=>[{x:160-distance,y:180,id:0},{x:160+distance,y:180,id:1}];
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:fingers(20)});
  for(let distance=30;distance<=80;distance+=10){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:fingers(distance)});
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForTimeout(300);
  assert.equal(await scale(),1);
  const waterLight=()=>page.locator('.hero').evaluate(el=>getComputedStyle(el,'::after').animationName);
  assert.equal(await waterLight(),'hero-water-light');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await waterLight(),'none');
  await page.emulateMedia({reducedMotion:'no-preference'});
  assert.equal(await action('group-1').getAttribute('aria-disabled'),'true');
  await action('play').click();
  assert.equal(await page.locator('.activity-tile').count(),6);
  assert.equal(await action('island-10').getAttribute('aria-disabled'),'true');
  await action('island-9').tap();
  assert.equal(await page.locator('#player-name').evaluate(element=>getComputedStyle(element).userSelect),'text');
  assert.equal(await contextMenuBlocked(page.locator('#player-name')),false);
  await page.locator('#player-name').fill('Camille');
  await page.getByRole('button',{name:'Créer mon profil'}).click();
  await page.locator('.hit').first().waitFor();
  assert.match(await page.locator('.step-label').innerText(),/Exemple/);
  const novice=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),storeKey);
  assert.equal(await action('answer-2').isDisabled(),true);
  await page.locator('.hit').nth(0).tap();
  assert.equal(await page.evaluate(()=>window.numberStarts),1,'Le nombre démarre lors du toucher');
  await page.locator('.hit').nth(1).tap();
  assert.equal(await page.evaluate(()=>window.numberStarts),2);
  const wrong=page.locator('.number-button:not([data-action="answer-2"])').first();
  await wrong.tap();
  assert.match(await page.locator('#example-note').innerText(),/Essaie encore/);
  assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).players[0].records[0][9].errors,storeKey),0);
  await action('answer-2').tap();
  await inSeries();
  assert.equal(await page.locator('.step-label').innerText(),'1 / 6');

  await page.evaluate(({key,novice})=>{
    novice.players[0].records[0].forEach(entry=>entry.mastery=true);
    novice.players[0].settings.narrator='lagon';
    localStorage.setItem(key,JSON.stringify(novice));
  },{key:storeKey,novice});
  await page.reload({waitUntil:'networkidle'});
  await action('settings').tap();
  assert.equal(await page.locator('#narrator-choice').count(),0);
  await page.locator('.setting').filter({hasText:'Animations'}).click();
  assert.equal(await page.locator('[data-setting="motion"]').isChecked(),false);
  assert.equal(await waterLight(),'none');
  const volumeControl=key=>page.locator('[data-setting="'+key+'"]');
  for(const [key,value] of [['musicVolume',32],['voiceVolume',62],['effectsVolume',0]]){
    await volumeControl(key).fill(String(value));
    assert.equal(await volumeControl(key).getAttribute('aria-valuetext'),value+' %');
  }
  await volumeControl('music').uncheck();
  const soundPrefs=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).players[0].settings,storeKey);
  assert.deepEqual([soundPrefs.music,soundPrefs.musicVolume,soundPrefs.voiceVolume,soundPrefs.effectsVolume],[false,32,62,0]);
  await volumeControl('effectsVolume').fill('48');
  await action('close').tap();
  await enter(3);
  async function drag(from,to){
    const a=await from.boundingBox(), b=await to.boundingBox();
    assert.ok(a&&b);
    const x=a.x+a.width/2,y=a.y+a.height/2,dx=b.x+b.width/2-x,dy=b.y+b.height/2-y;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let step=1;step<=10;step++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*step/10,y:y+dy*step/10}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.waitForTimeout(130);
  }
  const wicker=page.locator('.wicker-basket');
  assert.equal(await wicker.locator('[data-item]').count(),0);
  assert.ok(await wicker.locator('canvas.wicker-art').evaluate(canvas=>
    canvas.getContext('2d').getImageData(canvas.width/2,canvas.height/2,1,1).data[3]>0));
  assert.equal(await contextMenuBlocked(action('put-0')),true);
  await drag(action('put-0'),wicker.locator('.token-row'));
  assert.equal(await wicker.locator('[data-item]').count(),1);
  await action('take-0').tap();
  assert.equal(await wicker.locator('[data-item]').count(),0);
  await action('put-0').tap();
  await action('put-1').tap();
  await inSeries();
  await page.locator('.game-top [data-action="map"]').tap();
  await enter(4);
  await drag(action('put-0'),page.locator('[data-slot="1"]'));
  assert.equal(await page.locator('[data-slot="1"] [data-item="0"]').count(),1);
  assert.equal(await page.locator('[data-slot="0"] [data-item]').count(),0);
  assert.equal(await page.locator('.stock [data-item="3"]').count(),1);
  await drag(action('put-1'),page.locator('[data-slot="1"]'));
  assert.equal(await page.locator('[data-slot="1"] [data-item="1"]').count(),1);
  assert.equal(await page.locator('.stock [data-item="0"]').count(),1);
  await drag(action('take-1'),page.locator('.stock h2'));
  assert.equal(await page.locator('.stock [data-item="1"]').count(),1);
  assert.equal(await page.locator('[data-slot="1"] [data-item]').count(),0);
  await action('put-2').tap();
  assert.equal(await page.locator('[data-slot="0"] [data-item="2"]').count(),1);
  await action('put-1').tap();
  await inSeries();

  await page.locator('.game-top [data-action="map"]').tap();
  await enter(5);
  await action('ferry-cross').tap();
  assert.equal(await page.locator('.ferry-source').count(),0);
  await action('put-0').tap();
  await action('ferry-back').tap();
  assert.equal(await page.locator('.ferry-source').count(),1);
  await action('ferry-cross').tap();
  assert.equal(await page.locator('.basket [data-item="0"]').count(),1);
  for(const id of [1,2])await action('put-'+id).tap();
  await inSeries();

  await page.locator('.game-top [data-action="map"]').tap();
  await enter(22);
  await action('skip-example').tap();
  assert.equal(await page.locator('.collection-options button').count(),4);
  const cardNumber=Number((await page.locator('#task-title').innerText()).match(/\d+/)[0]);
  await action('answer-'+cardNumber).tap();
  assert.equal(await page.locator('.step-label').innerText(),'2 / 8');
  const collectionCards=page.locator('.collection-options button');
  const collectionRects=()=>collectionCards.evaluateAll(cards=>cards.map(card=>{
    const {top,width}=card.getBoundingClientRect();
    return {top,width};
  }));
  assert.equal(await collectionCards.count(),3);
  const mobileCards=await collectionRects();
  assert.equal(new Set(mobileCards.map(card=>card.top)).size,1);
  assert.ok(mobileCards.every(card=>card.width>=72));

  await page.locator('.game-top [data-action="map"]').tap();
  await page.setViewportSize({width:1280,height:900});
  await enter(23);
  const desktopCards=await collectionRects();
  assert.equal(desktopCards.length,3);
  assert.equal(new Set(desktopCards.map(card=>card.top)).size,1);
  assert.ok(desktopCards.every(card=>card.width<=180));
  assert.ok(await page.locator('.model-card').evaluate(card=>card.getBoundingClientRect().width<=184));
  await action('answer-2').tap();
  await inSeries();
  await page.setViewportSize({width:320,height:730});

  await page.locator('.game-top [data-action="map"]').tap();
  await enter(29);
  assert.equal(await page.locator('.comparison-grid .collection-card').count(),2);
  await action('answer-1').tap();
  await inSeries();

  await page.locator('.game-top [data-action="map"]').tap();
  await enter(16);
  assert.equal(await page.locator('#task-title').innerText(),'Combien vois-tu de poissons ?');
  assert.equal(await page.locator('.hit').count(),0);
  assert.equal(await action('answer-2').isEnabled(),true);
  await action('answer-2').tap();
  await inSeries();
  let incorrect=false;
  for(let i=0;i<6;i++){
    assert.equal(await action('count-help').count(),0);
    const n=Number(await page.locator('#point-scene canvas').getAttribute('data-n'));
    if(n>0&&!incorrect){
      await page.locator('.number-button:not([data-action="answer-'+n+'"])').first().tap();
      assert.match(await page.locator('.feedback-title').innerText(),/Observons ensemble/);
      incorrect=true;
      await action('advance').tap();
    }else await action('answer-'+n).tap();
  }
  await action('count-help').tap();
  const targets=page.locator('.hit');
  const n=await targets.count();
  assert.ok(n>0);
  assert.equal(await action('answer-'+n).isDisabled(),true);
  for(let i=0;i<n;i++)await action('point-'+i).tap();
  assert.equal(await action('answer-'+n).isEnabled(),true);

  await page.locator('.game-top [data-action="map"]').tap();
  await enter(0);
  assert.equal(await page.locator('.answers-all button').count(),6);
  assert.equal(await page.locator('.answers-all button:enabled').count(),6);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),320);

  await context.setOffline(true);
  await page.reload({waitUntil:'networkidle'});
  await page.locator('.hero').waitFor();
  const partial=await page.evaluate(async()=> {
    const response=await fetch('./audio/voix/touch.mp3',{headers:{Range:'bytes=0-39'}});
    return [response.status,(await response.arrayBuffer()).byteLength,response.headers.get('Content-Type')];
  });
  assert.deepEqual(partial,[206,40,'audio/mpeg']);
  assert.equal(await page.evaluate(async()=> (await fetch('./audio/brise-du-lagon.ogg')).ok),true);
  assert.equal(await page.evaluate(async()=> (await fetch('./audio/voix/count-hand.mp3')).ok),true);
  await enter(13);
  const basketCards=page.locator('.basket-choices .basket-choice');
  assert.equal(await basketCards.count(),3);
  await basketCards.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));
  const cards=await basketCards.evaluateAll(buttons=>buttons.map(button=>({
    top:button.getBoundingClientRect().top,
    left:button.getBoundingClientRect().left,
    quantity:Number(button.querySelector('canvas')?.dataset.shells??0),
  })));
  assert.equal(new Set(cards.map(card=>card.top)).size,1);
  assert.ok(cards[0].left<cards[1].left&&cards[1].left<cards[2].left);
  assert.deepEqual(cards.map(card=>card.quantity).sort(),[0,1,2]);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),320);
  const listen=page.getByRole('button',{name:'Écouter le nombre',exact:true});
  assert.equal(await listen.count(),1);
  assert.ok(await listen.evaluate(button=>parseFloat(getComputedStyle(button).borderRadius)>20));
  await listen.tap();
  await action('answer-2').tap();
  await inSeries();
  await page.locator('.game-top [data-action="map"]').tap();
  // The illustrated zero through five poses must also load during offline play.
  await enter(11);
  const hand = page.locator('.hand-figure');
  await hand.evaluate(img=>img.decode());
  assert.match(await hand.getAttribute('src'),/hand-2\.webp$/);
  await page.locator('.game-top [data-action="map"]').tap();
  await enter(19);
  await action('skip-example').tap();
  const poses=new Set();
  for(let i=0;i<6;i++){
    await hand.evaluate(img=>img.decode());
    const n=Number((await hand.getAttribute('src')).match(/hand-(\d)\.webp$/)[1]);
    poses.add(n);
    if(n===0){
      await page.locator('.number-button:not([data-action="answer-0"])').first().tap();
      await hand.evaluate(img=>img.decode());
      assert.match(await hand.getAttribute('src'),/hand-0\.webp$/);
      assert.match(await page.locator('.feedback-title').innerText(),/Aucun doigt n’est levé/);
      await action('advance').tap();
    }else await action('answer-'+n).tap();
  }
  assert.deepEqual([...poses].sort(),[0,1,2,3,4,5]);
  await action('map').tap();
  await enter(9);
  const object=page.locator('.hit').first();
  const starts=await page.evaluate(()=>window.numberStarts);
  await object.tap();
  assert.equal(await page.evaluate(()=>window.numberStarts),starts+1,'Lecture Web Audio hors ligne');

  await context.setOffline(false);
  await page.addInitScript(()=>{
    // Exercise the HTML audio fallback and check its original narration order.
    window.AudioContext=undefined;
    window.webkitAudioContext=undefined;
    window.voicePlayed=[];
    window.effectsPlayed=[];
    // Observe the clips selected by the game without waiting for actual playback.
    HTMLMediaElement.prototype.play=function(){
      const clip=this.src.match(/\/voix\/(.+)\.mp3$/)?.[1];
      if(clip){
        window.voicePlayed.push(clip);
        setTimeout(()=>this.dispatchEvent(new Event('ended')),0);
      }else window.effectsPlayed.push(this.src);
      return Promise.resolve();
    };
  });
  await page.reload();
  const played=()=>page.evaluate(()=>window.voicePlayed);
  const clearVoice=()=>page.evaluate(()=>{window.voicePlayed=[];});
  const waitForClips=count=>page.waitForFunction(n=>window.voicePlayed.length>=n,count);
  await enter(1);
  await waitForClips(3);
  assert.deepEqual(await played(),['example','echo-guide','n2']);
  await clearVoice();
  await action('skip-example').tap();
  await waitForClips(1);
  const [firstNumber]=await played();
  assert.match(firstNumber,/^n[0-5]$/);
  await action('repeat').tap();
  assert.deepEqual(await played(),[firstNumber,firstNumber]);
  await action('repeat-instruction').tap();
  assert.deepEqual(await played(),[firstNumber,firstNumber,'echo-guide']);
  await clearVoice();
  await action('answer-'+firstNumber.slice(1)).tap();
  await waitForClips(1);
  assert.match((await played()).join(),/^n[0-5]$/);
  await page.locator('.game-top [data-action="map"]').tap();
  await clearVoice();
  await enter(13);
  await waitForClips(3);
  assert.deepEqual(await played(),['example','hear-basket','n2']);
  await page.locator('.game-top [data-action="map"]').tap();
  await clearVoice();
  await enter(16);
  await waitForClips(2);
  assert.deepEqual(await played(),['example','count-fish']);
  await page.locator('.game-top [data-action="map"]').tap();
  await clearVoice();
  await enter(9);
  await waitForClips(2);
  assert.deepEqual(await played(),['example','count-line']);
  await clearVoice();
  await action('skip-example').tap();
  assert.deepEqual(await played(),[]);
  await action('repeat-instruction').tap();
  assert.deepEqual(await played(),['count-line']);
  await clearVoice();
  await page.evaluate(()=>{window.effectsPlayed=[];});
  await page.locator('.hit').first().tap();
  await waitForClips(1);
  assert.deepEqual(await played(),['n1']);
  assert.deepEqual(await page.evaluate(()=>window.effectsPlayed),[]);

  assert.deepEqual(fail,[]);
  console.log('Interface à 320 px, exemple, glisser tactile par emplacement, traversée et cache vocal hors ligne validés.');
}finally{
  await browser.close();
  server.close();
}
