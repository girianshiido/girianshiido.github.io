import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const portArg=process.argv.indexOf('--port');
const port=Number(portArg>=0?process.argv[portArg+1]:process.env.PORT)||5173;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ogg':'audio/ogg','.webmanifest':'application/manifest+json'};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');let f=decodeURIComponent(url.pathname);if(f.endsWith('/'))f+='index.html';const absolute=path.resolve('dist','.'+f);if(!absolute.startsWith(path.resolve('dist')+path.sep))throw Error();const data=await readFile(absolute);res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)}catch{res.writeHead(404);res.end('Introuvable')}}).listen(port,'0.0.0.0',()=>console.log('Cosmo Pop sur le port '+port));
