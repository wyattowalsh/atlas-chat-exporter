import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTransforms } from '../src/index.js';
import { MalformedCitationError } from '../../shared/src/errors.js';

const baseDoc = {
  title: 'Transform Test',
  source: 'chatgpt-atlas',
  exportedAt: '2024-01-01T00:00:00.000Z',
  turns: [
    { role: 'assistant', blocks: [{ kind: 'paragraph', text: 'Status: Thinking...' }] },
    { role: 'assistant', blocks: [{ kind: 'paragraph', text: 'Fact [cite:ref](https://example.com)' }] },
    { role: 'assistant', blocks: [{ kind: 'paragraph', text: 'Fact [cite:ref](https://example.com)' }] },
  ],
};

test('strips interim status updates and adjacent duplicates', () => {
  const transformed = applyTransforms(baseDoc, { includeStatusUpdates: false, citationMode: 'normalize' });
  assert.equal(transformed.turns.length, 1);
  assert.equal(transformed.turns[0].blocks[0].text, 'Fact [ref](https://example.com)');
});

test('strip citation mode removes citation chips', () => {
  const transformed = applyTransforms(baseDoc, { citationMode: 'strip' });
  assert.equal(transformed.turns[1].blocks[0].text, 'Fact');
});

test('throws on malformed citations during normalize mode', () => {
  const malformed = {
    ...baseDoc,
    turns: [{ role: 'assistant', blocks: [{ kind: 'paragraph', text: 'Broken [cite:oops]()' }] }],
  };

  assert.throws(() => applyTransforms(malformed, { citationMode: 'normalize' }), MalformedCitationError);
});
