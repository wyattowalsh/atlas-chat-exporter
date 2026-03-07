#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { exportConversation, EXIT_CODES } from '../../../packages/core/src/index.js';
import { getTargetDocument } from './browser-target.js';

const [, , command = 'export', ...rest] = process.argv;
const format = rest.includes('--json') ? 'json' : 'markdown';
const out = rest.find((a) => a.startsWith('--out='))?.slice('--out='.length);

const doc = await getTargetDocument();
if (!doc) {
  console.error('Browser target unavailable.');
  process.exit(EXIT_CODES.BROWSER_TARGET_UNAVAILABLE);
}

const result = exportConversation(doc, { outputFormat: format });
if (!result.doc.turns.length) {
  console.error('No turns found.');
  process.exit(EXIT_CODES.NO_TURNS_FOUND);
}

if (command === 'copy') {
  if (!globalThis.navigator?.clipboard) {
    console.error('Clipboard blocked/unavailable.');
    process.exit(EXIT_CODES.CLIPBOARD_BLOCKED);
  }
  await globalThis.navigator.clipboard.writeText(result.content);
  process.exit(EXIT_CODES.OK);
}

if (command === 'download') {
  const file = out || `chat-export.${result.extension}`;
  writeFileSync(file, result.content, 'utf8');
  process.exit(EXIT_CODES.OK);
}

if (command === 'export') {
  if (out) {
    writeFileSync(out, result.content, 'utf8');
  } else {
    process.stdout.write(result.content + '\n');
  }
  process.exit(EXIT_CODES.OK);
}

console.error(`Unknown command: ${command}`);
process.exit(EXIT_CODES.UNEXPECTED);
