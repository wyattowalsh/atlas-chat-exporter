import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { exportConversation } from '../packages/core/src/index.js';

const update = process.argv.includes('--update');
const root = process.cwd();

async function checkOrWrite(target, expected, drifts) {
  if (update) {
    await writeFile(target, expected, 'utf8');
    return;
  }
  try {
    const current = await readFile(target, 'utf8');
    if (current !== expected) drifts.push(`mismatch ${path.relative(root, target)}`);
  } catch {
    drifts.push(`missing ${path.relative(root, target)}`);
  }
}

async function main() {
  const rawDir = path.join(root, 'fixtures/raw-dom');
  const mdDir = path.join(root, 'fixtures/expected-md');
  const jsonDir = path.join(root, 'fixtures/expected-json');
  const files = (await readdir(rawDir)).filter((f) => f.endsWith('.html')).sort();
  const drifts = [];
  for (const file of files) {
    const base = file.replace(/\.html$/, '');
    const html = await readFile(path.join(rawDir, file), 'utf8');
    await checkOrWrite(path.join(mdDir, `${base}.md`), `${exportConversation(html, { outputFormat: 'markdown' })}\n`, drifts);
    await checkOrWrite(path.join(jsonDir, `${base}.json`), `${exportConversation(html, { outputFormat: 'json' })}\n`, drifts);
  }
  if (drifts.length) throw new Error(`Fixture drift detected:\n${drifts.join('\n')}\nRun: npm run verify:fixtures:update`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
