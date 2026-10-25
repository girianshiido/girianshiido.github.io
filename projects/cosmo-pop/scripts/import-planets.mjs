import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const config=JSON.parse(await readFile(process.argv[2]||'docs/generation-v17.json','utf8'));
await mkdir('public/images/planets',{recursive:true});
for(const asset of config.assets) {
  for(const size of [480,960]) {
    await sharp(asset.source).resize(size,size,{fit:'contain',background:'#00000000'})
      .png({palette:true,colours:256,dither:.35,compressionLevel:9})
      .toFile(`public/images/planets/${asset.form}-${size}.png`);
  }
}
const composite=await Promise.all(config.assets.map(async(a,i)=>({input:await sharp(`public/images/planets/${a.form}-480.png`).resize(250,250).flatten({background:'#f5f0fc'}).jpeg().toBuffer(),left:(i%4)*270+10,top:Math.floor(i/4)*290+10})));
const labels=config.assets.map((a,i)=>`<text x="${(i%4)*270+135}" y="${Math.floor(i/4)*290+278}" text-anchor="middle" font-size="17" fill="#493b63">Niveau ${a.level}</text>`).join('');
composite.push({input:Buffer.from(`<svg width="1080" height="580" xmlns="http://www.w3.org/2000/svg">${labels}</svg>`),left:0,top:0});
await writeFile('docs/planets-v17.jpg',await sharp({create:{width:1080,height:580,channels:3,background:'#f5f0fc'}}).composite(composite).jpeg({quality:88}).toBuffer());
console.log('Sept apparences PNG importées.');
