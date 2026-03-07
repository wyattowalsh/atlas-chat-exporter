import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { discoverTurns } from '../../packages/parser-dom/src/index.js';

test('parser discovers turns and code blocks', () => {
  const turns = discoverTurns(readFileSync('fixtures/raw-dom/code-heavy.html', 'utf8'));
  assert.equal(turns.length, 2);
  assert.equal(turns[1].blocks.some((b) => b.kind === 'code'), true);
});

test('parser marks malformed citation token', () => {
  const turns = discoverTurns(readFileSync('fixtures/raw-dom/citation-heavy.html', 'utf8'));
  const p = turns[1].blocks.find((b) => b.kind === 'paragraph');
  assert.match(p.text, /MALFORMED/);
});
