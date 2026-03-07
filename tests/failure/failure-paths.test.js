import test from 'node:test';
import assert from 'node:assert/strict';
import { copyExport, downloadExport } from '../../apps/cli/src/actions.js';
import { exportConversation } from '../../packages/core/src/index.js';

test('no turns found', () => {
  assert.throws(() => exportConversation('<main><p>none</p></main>'), /No turns found/);
});

test('selector drift behaves as no turns found', () => {
  assert.throws(() => exportConversation('<div class="message" data-speaker="assistant">hi</div>'), /No turns found/);
});

test('malformed citations normalize without crash', () => {
  const md = exportConversation('<div data-turn data-role="assistant" class="turn"><div class="content"><p>x <span class="citation">[1]</span></p></div></div>');
  assert.match(md, /\[1\]/);
});

test('blocked copy gives actionable error', async () => {
  await assert.rejects(copyExport('x', { writeText: async () => Promise.reject(new Error('denied')) }), (err) => err.code === 'CLIPBOARD_BLOCKED');
});

test('blocked download gives actionable error', async () => {
  await assert.rejects(downloadExport('chat.md', 'x', { save: async () => Promise.reject(new Error('denied')) }), (err) => err.code === 'DOWNLOAD_BLOCKED');
});

test('partial dom exports loaded portion', () => {
  assert.match(exportConversation('<div data-turn data-role="assistant" class="turn"><div class="content"><p>Loaded chunk</p></div></div>'), /Loaded chunk/);
});
