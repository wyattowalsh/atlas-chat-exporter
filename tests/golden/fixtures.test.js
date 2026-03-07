import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { exportConversation } from '../../packages/core/src/index.js';

for (const file of readdirSync('fixtures/raw-dom').filter((f) => f.endsWith('.html')).sort()) {
  const base = file.replace(/\.html$/, '');
  test(`${base} markdown golden`, () => {
    const html = readFileSync(path.join('fixtures/raw-dom', file), 'utf8');
    assert.equal(`${exportConversation(html, { outputFormat: 'markdown' })}\n`, readFileSync(`fixtures/expected-md/${base}.md`, 'utf8'));
  });
  test(`${base} json golden`, () => {
    const html = readFileSync(path.join('fixtures/raw-dom', file), 'utf8');
    assert.equal(`${exportConversation(html, { outputFormat: 'json' })}\n`, readFileSync(`fixtures/expected-json/${base}.json`, 'utf8'));
  });
}
