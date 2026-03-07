import test from 'node:test';
import assert from 'node:assert/strict';
import { exportConversation } from '../../packages/core/src/index.js';
import { copyExport, downloadExport } from '../../apps/extension/src/actions.js';
import {
  NoTurnsFoundError,
  SelectorDriftError,
  PartiallyLoadedDomError,
  MalformedCitationError,
  ClipboardBlockedError,
  DownloadBlockedError,
} from '../../packages/shared/src/errors.js';

test('failure path: no turns found', () => {
  const raw = JSON.stringify({ meta: { selectorVersion: 'v1' }, turns: [] });
  assert.throws(() => exportConversation(raw), NoTurnsFoundError);
});

test('failure path: selector drift', () => {
  const raw = JSON.stringify({ meta: { selectorVersion: 'drifted' }, turns: [{ role: 'user', blocks: [] }] });
  assert.throws(() => exportConversation(raw), SelectorDriftError);
});

test('failure path: malformed citations', () => {
  const raw = JSON.stringify({
    meta: { selectorVersion: 'v1' },
    turns: [{ role: 'assistant', blocks: [{ kind: 'paragraph', text: 'Bad [cite:broken]()' }] }],
  });

  assert.throws(() => exportConversation(raw, { citationMode: 'normalize' }), MalformedCitationError);
});

test('failure path: partially loaded DOM', () => {
  const raw = JSON.stringify({
    meta: { selectorVersion: 'v1', partial: true },
    turns: [{ role: 'assistant', blocks: [{ kind: 'paragraph', text: 'incomplete' }] }],
  });

  assert.throws(() => exportConversation(raw), PartiallyLoadedDomError);
});

test('failure path: clipboard blocked', async () => {
  await assert.rejects(
    () => copyExport('hello', { clipboard: { writeText: async () => { throw new Error('blocked'); } } }),
    ClipboardBlockedError,
  );
});

test('failure path: download blocked', () => {
  assert.throws(() => downloadExport('hello', 'chat.md', { download: () => { throw new Error('blocked'); } }), DownloadBlockedError);
});
