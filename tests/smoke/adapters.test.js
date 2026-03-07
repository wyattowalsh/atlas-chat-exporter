import test from 'node:test';
import assert from 'node:assert/strict';
import { copyExport, downloadExport } from '../../apps/cli/src/actions.js';
import { exportConversation } from '../../packages/core/src/index.js';

test('copy adapter smoke', async () => {
  let copied = '';
  const output = exportConversation('<div data-turn data-role="assistant" class="turn"><div class="content"><p>Hello</p></div></div>');
  await copyExport(output, { writeText: async (value) => { copied = value; } });
  assert.match(copied, /Hello/);
});

test('download adapter smoke', async () => {
  let saved = '';
  await downloadExport('chat.md', 'payload', { save: async (_, value) => { saved = value; } });
  assert.equal(saved, 'payload');
});
