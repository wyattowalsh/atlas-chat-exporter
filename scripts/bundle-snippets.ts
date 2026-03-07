import { mkdir, writeFile } from 'node:fs/promises';
import { inspectChatSelectorsSnippet, snippetRuntime } from '../apps/snippets/src/index.js';

const outDir = 'apps/snippets/dist';

async function main(): Promise<void> {
  await mkdir(outDir, { recursive: true });
  await writeFile(`${outDir}/copy-chat.js`, snippetRuntime('copy'));
  await writeFile(`${outDir}/download-chat.js`, snippetRuntime('download'));
  await writeFile(`${outDir}/inspect-chat-selectors.js`, inspectChatSelectorsSnippet());

  console.log('Snippets bundled.');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
