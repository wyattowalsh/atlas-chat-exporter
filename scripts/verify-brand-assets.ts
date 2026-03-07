#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const allowMissing = process.argv.includes('--allow-missing');

const canonicalSizes = [2048, 1024, 512, 256, 128, 64, 32, 16] as const;
const requiredBrandFiles = canonicalSizes.map((size) => `assets/brand/logo-${size}.png`);

const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
let failed = false;
let warned = false;

function report(message: string, isWarn = false): void {
  if (isWarn) {
    warned = true;
    console.warn(`WARN: ${message}`);
    return;
  }
  failed = true;
  console.error(`ERROR: ${message}`);
}

function readPngSize(filePath: string): { width: number; height: number } {
  const buff = fs.readFileSync(filePath);
  if (!buff.subarray(0, 8).equals(pngSig)) {
    throw new Error(`Not a PNG: ${filePath}`);
  }
  return { width: buff.readUInt32BE(16), height: buff.readUInt32BE(20) };
}

for (const rel of requiredBrandFiles) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    report(
      `Missing required canonical asset: ${rel}. Run: python scripts/regenerate-brand-assets.py after adding provided files to assets/brand/source/.`,
      allowMissing
    );
    continue;
  }

  const expectedMatch = rel.match(/logo-(\d+)\.png$/);
  const expectedSize = expectedMatch ? Number(expectedMatch[1]) : Number.NaN;
  const { width, height } = readPngSize(abs);
  if (width !== expectedSize || height !== expectedSize) {
    report(`${rel} has ${width}x${height}; expected ${expectedSize}x${expectedSize}`);
  }
}

const manifestPath = path.join(root, 'apps/extension/manifest.json');
if (!fs.existsSync(manifestPath)) {
  report('Missing apps/extension/manifest.json');
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    icons?: Record<string, string>;
    action?: { default_icon?: Record<string, string> };
  };

  const iconTargets = [
    ...Object.values(manifest.icons ?? {}),
    ...Object.values(manifest.action?.default_icon ?? {})
  ];

  for (const iconPath of iconTargets) {
    const abs = path.join(path.dirname(manifestPath), iconPath);
    if (!fs.existsSync(abs)) {
      report(`Extension manifest references missing icon: ${iconPath}`, allowMissing);
    }
  }
}

const userscriptPath = path.join(root, 'apps/userscript/src/atlas-chat-exporter.user.js');
if (!fs.existsSync(userscriptPath)) {
  report('Missing userscript metadata file.');
} else {
  const src = fs.readFileSync(userscriptPath, 'utf8');
  if (!src.match(/@icon\s+.+/)) {
    report('Userscript metadata missing @icon.');
  }
  if (!src.match(/@icon64\s+.+/)) {
    report('Userscript metadata missing @icon64.');
  }
}

if (failed) {
  process.exit(1);
}

if (warned) {
  console.log('WARN: Brand asset verification passed with warnings.');
} else {
  console.log('OK: Brand asset verification passed.');
}
