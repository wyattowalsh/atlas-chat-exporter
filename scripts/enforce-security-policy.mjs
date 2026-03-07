#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ADAPTER_ROOTS = [
  'apps/extension',
  'apps/userscript',
  'apps/bookmarklets',
  'apps/snippets',
  'apps/cli'
];
const MANIFEST_NAMES = new Set([
  'package.json',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock'
]);
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);

const FORBIDDEN_NET_CALL_PATTERNS = [
  /navigator\.sendBeacon\s*\(/g,
  /new\s+WebSocket\s*\(/g,
  /new\s+EventSource\s*\(/g,
  /\bfetch\s*\(/g,
  /\bXMLHttpRequest\b/g
];

const URL_PATTERN = /https?:\/\/[^\s"'`<>)]*/g;
const USERSCRIPT_MATCH_METADATA = /^\s*\/\/\s*@match\s+/i;

function toPosix(value) {
  return value.split(path.sep).join('/');
}

async function readJson(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  const text = await readFile(absolutePath, 'utf8');
  return JSON.parse(text);
}

async function exists(relativePath) {
  try {
    await stat(path.join(ROOT, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function walk(relativePath, onFile) {
  const absolutePath = path.join(ROOT, relativePath);
  let entries;
  try {
    entries = await readdir(absolutePath, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const entryAbsolute = path.join(absolutePath, entry.name);
    const entryRelative = toPosix(path.relative(ROOT, entryAbsolute));

    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === '.git' ||
        entry.name === 'dist' ||
        entry.name === 'build'
      ) {
        continue;
      }
      await walk(entryRelative, onFile);
      continue;
    }

    await onFile(entryRelative);
  }
}

function collectDependencyNames(pkgJson) {
  return [
    ...Object.keys(pkgJson.dependencies ?? {}),
    ...Object.keys(pkgJson.devDependencies ?? {}),
    ...Object.keys(pkgJson.optionalDependencies ?? {}),
    ...Object.keys(pkgJson.peerDependencies ?? {})
  ];
}

async function run() {
  const forbiddenDependenciesPolicy = await readJson('security/forbidden-dependencies.json');
  const networkPolicy = await readJson('security/network-allowlist.json');

  const forbiddenDependencies = new Set(forbiddenDependenciesPolicy.forbiddenDependencies);
  const forbiddenEndpointRegexes = networkPolicy.forbiddenEndpointPatterns.map(
    (pattern) => new RegExp(pattern, 'i')
  );

  const violations = [];

  await walk('.', async (relativeFile) => {
    const fileName = path.basename(relativeFile);
    if (!MANIFEST_NAMES.has(fileName)) {
      return;
    }
    if (fileName !== 'package.json') {
      return;
    }

    const absoluteFile = path.join(ROOT, relativeFile);
    let parsed;
    try {
      parsed = JSON.parse(await readFile(absoluteFile, 'utf8'));
    } catch (error) {
      violations.push(`${relativeFile}: invalid JSON (${String(error)})`);
      return;
    }

    for (const depName of collectDependencyNames(parsed)) {
      if (forbiddenDependencies.has(depName)) {
        violations.push(`${relativeFile}: forbidden telemetry/analytics dependency '${depName}'`);
      }
    }
  });

  for (const adapterRoot of ADAPTER_ROOTS) {
    if (!(await exists(adapterRoot))) {
      continue;
    }

    await walk(adapterRoot, async (relativeFile) => {
      const extension = path.extname(relativeFile);
      if (!SOURCE_EXTENSIONS.has(extension)) {
        return;
      }

      const absoluteFile = path.join(ROOT, relativeFile);
      const source = await readFile(absoluteFile, 'utf8');

      for (const regex of FORBIDDEN_NET_CALL_PATTERNS) {
        if (regex.test(source)) {
          violations.push(`${relativeFile}: contains network call pattern ${regex}`);
        }
        regex.lastIndex = 0;
      }

      const urlsToValidate = [];
      for (const line of source.split(/\r?\n/)) {
        if (relativeFile.endsWith('.user.js') && USERSCRIPT_MATCH_METADATA.test(line)) {
          continue;
        }
        for (const rawUrl of line.match(URL_PATTERN) ?? []) {
          urlsToValidate.push(rawUrl);
        }
      }

      for (const rawUrl of urlsToValidate) {
        const endpointLooksForbidden = forbiddenEndpointRegexes.some((regex) => regex.test(rawUrl));
        if (endpointLooksForbidden) {
          violations.push(`${relativeFile}: forbidden endpoint reference '${rawUrl}'`);
        }
      }
    });
  }

  if (violations.length > 0) {
    console.error('Security policy violations found:');
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Security policy checks passed.');
}

run().catch((error) => {
  console.error(`Failed to run security policy checks: ${String(error)}`);
  process.exitCode = 1;
});
