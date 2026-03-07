import test from 'node:test';
import assert from 'node:assert/strict';
import { parseConversationFixture } from '../src/index.js';
import { NoTurnsFoundError, SelectorDriftError, PartiallyLoadedDomError } from '../../shared/src/errors.js';

test('parses fixture conversation into canonical doc', () => {
  const raw = JSON.stringify({
    title: 'Sample',
    source: 'chatgpt-atlas',
    meta: { selectorVersion: 'v1' },
    turns: [{ role: 'user', blocks: [{ kind: 'paragraph', text: 'Hello' }] }],
  });

  const doc = parseConversationFixture(raw);
  assert.equal(doc.title, 'Sample');
  assert.equal(doc.turns.length, 1);
  assert.equal(doc.exportedAt, '2024-01-01T00:00:00.000Z');
});

test('throws NoTurnsFoundError when turns are absent', () => {
  const raw = JSON.stringify({ meta: { selectorVersion: 'v1' }, turns: [] });
  assert.throws(() => parseConversationFixture(raw), NoTurnsFoundError);
});

test('throws SelectorDriftError when selector version drifts', () => {
  const raw = JSON.stringify({ meta: { selectorVersion: 'v2' }, turns: [{ role: 'user', blocks: [] }] });
  assert.throws(() => parseConversationFixture(raw), SelectorDriftError);
});

test('throws PartiallyLoadedDomError for partial fixture payloads', () => {
  const raw = JSON.stringify({ meta: { selectorVersion: 'v1', partial: true }, turns: [{ role: 'user', blocks: [] }] });
  assert.throws(() => parseConversationFixture(raw), PartiallyLoadedDomError);
});
