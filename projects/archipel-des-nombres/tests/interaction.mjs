import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';

const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
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
const storeKey='archipel-des-nombres:save';

try{
  await page.goto(base,{waitUntil:'networkidle'});
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  assert.equal(await page.locator('.island img').count(),6);
  assert.ok(await page.locator('.island img').evaluateAll(imgs=>imgs.every(img=>img.complete&&img.naturalWidth>0)));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),320);
  await action('play').click();
  await page.locator('#player-name').fill('Camille');
  await page.getByRole('button',{name:'Créer mon profil'}).click();
  await page.locator('.hit').first().waitFor();
  assert.match(await page.locator('.step-label').innerText(),/Exemple/);
  const novice=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),storeKey);
  assert.equal(await action('answer-2').isDisabled(),true);
  await page.locator('.hit').nth(0).tap();
  await page.locator('.hit').nth(1).tap();
  const wrong=page.locator('.number-button:not([data-action="answer-2"])').first();
  await wrong.tap();
  assert.match(await page.locator('#example-note').innerText(),/Essaie encore/);
  assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).players[0].records[0][0].errors,storeKey),0);
  await action('answer-2').tap();
  await action('advance').tap();
  assert.equal(await page.locator('.step-label').innerText(),'1 / 6');

  await page.evaluate(({key,novice})=>{
    novice.players[0].records[0].slice(0,5).forEach(entry=>entry.mastery=true);
    localStorage.setItem(key,JSON.stringify(novice));
  },{key:storeKey,novice});
  await page.reload({waitUntil:'networkidle'});
  await action('island-4').tap();
  const cdp=await context.newCDPSession(page);
  async function drag(from,to){
    const a=await from.boundingBox(), b=await to.boundingBox();
    assert.ok(a&&b);
    const x=a.x+a.width/2,y=a.y+a.height/2,dx=b.x+b.width/2-x,dy=b.y+b.height/2-y;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let step=1;step<=10;step++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*step/10,y:y+dy*step/10}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.waitForTimeout(130);
  }
  await drag(action('put-0'),page.locator('[data-slot="1"]'));
  assert.equal(await page.locator('[data-slot="1"] [data-item="0"]').count(),1);
  assert.equal(await page.locator('[data-slot="0"] [data-item]').count(),0);
  assert.equal(await page.locator('.stock [data-item="3"]').count(),1);
  await drag(action('put-1'),page.locator('[data-slot="0"]'));
  assert.equal(await page.locator('[data-slot="0"] [data-item="1"]').count(),1);
  await drag(action('take-1'),page.locator('[data-slot="1"]'));
  assert.equal(await page.locator('[data-slot="1"] [data-item="1"]').count(),1);
  assert.equal(await page.locator('[data-slot="0"] [data-item="0"]').count(),1);
  await drag(action('take-1'),page.locator('.stock h2'));
  assert.equal(await page.locator('.stock [data-item="1"]').count(),1);
  assert.equal(await page.locator('[data-slot="1"] [data-item]').count(),0);
  await action('put-2').tap();
  assert.equal(await page.locator('[data-slot="1"] [data-item="2"]').count(),1);
  await action('validate').tap();
  assert.match(await page.locator('#feedback-title').innerText(),/compris/);

  await page.locator('.game-top [data-action="map"]').tap();
  await action('island-5').tap();
  await action('confirm-island-5').tap();
  await action('ferry-cross').tap();
  assert.equal(await page.locator('.ferry-source').count(),0);
  await action('put-0').tap();
  await action('ferry-back').tap();
  assert.equal(await page.locator('.ferry-source').count(),1);
  await action('ferry-cross').tap();
  assert.equal(await page.locator('.basket [data-item="0"]').count(),1);
  for(const id of [1,2])await action('put-'+id).tap();
  await action('validate').tap();
  assert.match(await page.locator('#feedback-title').innerText(),/compris/);

  await context.setOffline(true);
  await page.reload();
  await page.locator('.hero').waitFor();
  const partial=await page.evaluate(async()=> {
    const response=await fetch('./audio/voix/touch.mp3',{headers:{Range:'bytes=0-39'}});
    return [response.status,(await response.arrayBuffer()).byteLength,response.headers.get('Content-Type')];
  });
  assert.deepEqual(partial,[206,40,'audio/mpeg']);
  assert.deepEqual(fail,[]);
  console.log('Interface à 320 px, exemple, glisser tactile par emplacement, traversée et cache vocal hors ligne validés.');
}finally{
  await browser.close();
  server.close();
}
