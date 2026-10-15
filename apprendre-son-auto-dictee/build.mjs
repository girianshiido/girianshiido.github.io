import { readFileSync, writeFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
for (const name of ['app','pwa']) writeFileSync(new URL(`./${name}.js`,import.meta.url),stripTypeScriptTypes(readFileSync(new URL(`./${name}.ts`,import.meta.url),'utf8'),{mode:'transform'}));
