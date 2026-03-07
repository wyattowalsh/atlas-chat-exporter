import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const SOURCE_DIR = path.join('apps', 'snippets', 'src');
const OUTPUT_DIR = path.join('apps', 'snippets', 'dist');

async function main(): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const entries = (await readdir(SOURCE_DIR)).filter((file) => file.endsWith('.ts'));

  if (entries.length === 0) {
    console.log('No snippet entry files found.');
    return;
  }

  for (const entry of entries) {
    const stem = entry.replace(/\.ts$/, '');
    await build({
      entryPoints: [path.join(SOURCE_DIR, entry)],
      outfile: path.join(OUTPUT_DIR, `${stem}.js`),
      bundle: true,
      format: 'iife',
      platform: 'browser',
      target: 'es2020',
      minify: true,
      legalComments: 'none'
    });
    console.log(`Bundled snippet: ${stem}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
