import test from 'node:test';
import assert from 'node:assert/strict';
import { collapseDuplicateTurns, normalizeUrl, normalizeWhitespace } from '../../packages/transform/src/index.js';

test('normalize whitespace', () => {
  assert.equal(normalizeWhitespace('a   b\n c'), 'a b c');
});

test('normalize url hash', () => {
  assert.equal(normalizeUrl('https://example.com/a#frag'), 'https://example.com/a');
});

test('collapse duplicate turns', () => {
  const turns = collapseDuplicateTurns([
    { role: 'assistant', blocks: [{ kind: 'paragraph', text: 'x' }] },
    { role: 'assistant', blocks: [{ kind: 'paragraph', text: 'x' }] }
  ]);
  assert.equal(turns.length, 1);
});
