import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { exportConversation } from '../../packages/core/src/index.js';
import { copyExport, downloadExport } from '../../apps/extension/src/actions.js';

test('smoke: extension copy/download actions succeed with permissive env', async () => {
  const raw = readFileSync('./fixtures/raw-dom/short-simple.json', 'utf8');
  const markdown = exportConversation(raw, { outputFormat: 'markdown' });

  let copied = '';
  let downloaded;

  const copyResult = await copyExport(markdown, {
    clipboard: {
      writeText: async (value) => {
        copied = value;
      },
    },
  });

  const downloadResult = downloadExport(markdown, 'chat.md', {
    download: (text, filename) => {
      downloaded = { text, filename };
    },
  });

  assert.equal(copyResult.ok, true);
  assert.equal(downloadResult.ok, true);
  assert.match(copied, /structured markdown and JSON/);
  assert.equal(downloaded.filename, 'chat.md');
});
