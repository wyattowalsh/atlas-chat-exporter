import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const SOURCE_DIR = path.join('apps', 'bookmarklets', 'src');
const OUTPUT_DIR = path.join('apps', 'bookmarklets', 'dist');

async function main(): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const entries = (await readdir(SOURCE_DIR)).filter((file) => file.endsWith('.ts'));

  if (entries.length === 0) {
    console.log('No bookmarklet entry files found.');
    return;
  }

  for (const entry of entries) {
    const stem = entry.replace(/\.ts$/, '');
    const outputPath = path.join(OUTPUT_DIR, `${stem}.bookmarklet.js`);

    const result = await build({
      entryPoints: [path.join(SOURCE_DIR, entry)],
      bundle: true,
      write: false,
      format: 'iife',
      platform: 'browser',
      target: 'es2020',
      minify: true,
      legalComments: 'none'
    });

    const bundled = result.outputFiles[0]?.text ?? '';
    const bookmarklet = `javascript:${encodeURIComponent(bundled)}`;

    await writeFile(outputPath, `${bookmarklet}\n`, 'utf8');
    console.log(`Bundled bookmarklet: ${stem}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
