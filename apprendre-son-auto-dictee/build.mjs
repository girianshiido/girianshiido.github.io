import { readFileSync, writeFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
writeFileSync(new URL('./app.js',import.meta.url),stripTypeScriptTypes(readFileSync(new URL('./app.ts',import.meta.url),'utf8'),{mode:'transform'}));
