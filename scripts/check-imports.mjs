import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const appRoots = ['apps/extension/src', 'apps/userscript/src', 'apps/cli/src', 'apps/snippets/src', 'apps/bookmarklets/src'];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (full.endsWith('.js') || full.endsWith('.mjs')) out.push(full);
  }
  return out;
}

let failed = false;
for (const root of appRoots) {
  for (const file of walk(root)) {
    const text = readFileSync(file, 'utf8');
    if (!text.includes('packages/core/src/index.js') && !text.includes('@atlas/core')) {
      console.error(`Missing packages/core usage in: ${file}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log('All adapter sources reference packages/core.');
