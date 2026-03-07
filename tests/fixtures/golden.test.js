import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { exportConversation } from '../../packages/core/src/index.js';

const fixtures = readdirSync('./fixtures/raw-dom').filter((f) => f.endsWith('.json')).sort();
const optionsByFixture = {
  'interim-status': { includeStatusUpdates: false },
};

for (const fixture of fixtures) {
  const base = fixture.replace('.json', '');
  const raw = readFileSync(`./fixtures/raw-dom/${fixture}`, 'utf8');
  const options = optionsByFixture[base] ?? {};

  test(`golden markdown: ${base}`, () => {
    const actual = exportConversation(raw, { ...options, outputFormat: 'markdown' });
    const expected = readFileSync(`./fixtures/expected-md/${base}.md`, 'utf8');
    assert.equal(actual, expected);
  });

  test(`golden json: ${base}`, () => {
    const actual = exportConversation(raw, { ...options, outputFormat: 'json' });
    const expected = readFileSync(`./fixtures/expected-json/${base}.json`, 'utf8');
    assert.equal(actual, expected);
  });
}
