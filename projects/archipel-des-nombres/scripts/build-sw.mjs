import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/',import.meta.url));
const template = await readFile(new URL('./sw.template.js',import.meta.url),'utf8');
const entries = await readdir(root,{recursive:true,withFileTypes:true});
const files = entries.filter(file=>file.isFile()&&file.name!=='sw.js')
  .map(file=>'./'+relative(root,join(file.parentPath,file.name)).replaceAll('\\','/')).sort();
const hash = createHash('sha256');
for(const name of files) hash.update(await readFile(join(root,name)));
await writeFile(join(root,'sw.js'),template.replace('__REVISION__',hash.digest('hex').slice(0,16)).replace('__FILES__',JSON.stringify(files)));
