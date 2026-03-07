import { mkdir, readFile, writeFile } from 'node:fs/promises';

const snippetsDir = 'apps/snippets/dist';
const outDir = 'apps/bookmarklets/dist';

async function main(): Promise<void> {
  await mkdir(outDir, { recursive: true });

  for (const name of ['copy-chat', 'download-chat', 'inspect-chat-selectors']) {
    const source = (await readFile(`${snippetsDir}/${name}.js`, 'utf8'))
      .replace(/\s+/g, ' ')
      .trim();
    const bookmarklet = `javascript:${encodeURIComponent(source)}`;
    await writeFile(`${outDir}/${name}.bookmarklet.txt`, bookmarklet);
  }

  console.log('Bookmarklets bundled.');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
