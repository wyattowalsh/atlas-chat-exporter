import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

const requiredPaths = [
  '.github/workflows/ci.yml',
  'scripts/build-all.ts',
  'scripts/collect-fixtures.ts',
  'scripts/verify-fixtures.ts',
  'scripts/bundle-snippets.ts',
  'scripts/bundle-bookmarklets.ts',
  'docs/release-checklist.md'
];

test('repository includes required automation scripts and docs', async () => {
  for (const requiredPath of requiredPaths) {
    await access(requiredPath);
    assert.ok(true);
  }
});
