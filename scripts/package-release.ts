#!/usr/bin/env node

import { cp, mkdir, mkdtemp, readdir, rm, stat, utimes, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';

interface Args {
  version: string;
  outDir: string;
  artifactPrefix: string;
  sourceDateEpoch: number;
}

const DEFAULT_EPOCH = 315532800;

function parseArgs(argv: string[]): Args {
  const params = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--') {
      continue;
    }
    if (!token.startsWith('--')) {
      continue;
    }
    const [k, v] = token.includes('=') ? token.split('=', 2) : [token, argv[i + 1]];
    const key = k.replace(/^--/, '');
    if (!token.includes('=')) {
      i += 1;
    }
    if (v !== undefined) {
      params.set(key, v);
    }
  }

  const version = params.get('version') ?? process.env.RELEASE_VERSION;
  if (!version) {
    throw new Error('Missing --version (or RELEASE_VERSION env)');
  }

  return {
    version,
    outDir: params.get('out-dir') ?? 'dist/release',
    artifactPrefix: params.get('artifact-prefix') ?? 'atlas-chat-exporter',
    sourceDateEpoch: Number(
      params.get('source-date-epoch') ?? process.env.SOURCE_DATE_EPOCH ?? DEFAULT_EPOCH
    )
  };
}

function run(cmd: string, args: string[], options: { cwd?: string } = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      cwd: options.cwd
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

async function walkFiles(root: string): Promise<string[]> {
  const found: string[] = [];
  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (entry.isFile()) {
        found.push(path.relative(root, fullPath));
      }
    }
  }

  await walk(root);
  return found;
}

async function normalizeMtime(root: string, when: Date): Promise<void> {
  const files = await walkFiles(root);
  await Promise.all(files.map(async (rel) => utimes(path.join(root, rel), when, when)));
}

async function copyIfExists(source: string, target: string): Promise<boolean> {
  try {
    const sourceStat = await stat(source);
    if (sourceStat.isDirectory()) {
      await cp(source, target, { recursive: true });
      return true;
    }
    if (sourceStat.isFile()) {
      await mkdir(path.dirname(target), { recursive: true });
      await cp(source, target);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function zipDeterministic(inputDir: string, outputZip: string): Promise<void> {
  const files = await walkFiles(inputDir);
  const manifestPath = path.join(inputDir, '.pack-order.txt');
  await writeFile(manifestPath, `${files.join('\n')}\n`, 'utf8');

  await run('zip', ['-X', '-q', '-r', outputZip, '.pack-order.txt', ...files], { cwd: inputDir });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(args.outDir);
  const tempRoot = await mkdtemp(path.join(tmpdir(), 'atlas-release-package-'));
  const stageRoot = path.join(tempRoot, 'release');

  await mkdir(stageRoot, { recursive: true });
  await mkdir(outDir, { recursive: true });

  const includeList: Array<{ from: string; to: string }> = [
    { from: 'README.md', to: 'README.md' },
    { from: 'LICENSE', to: 'LICENSE' },
    { from: 'docs', to: 'docs' },
    { from: 'apps/snippets/dist', to: 'snippets' },
    { from: 'apps/bookmarklets/dist', to: 'bookmarklets' },
    { from: 'apps/cli/dist', to: 'cli' },
    { from: 'dist/release', to: 'artifacts' }
  ];

  const included: string[] = [];
  for (const entry of includeList) {
    const copied = await copyIfExists(path.resolve(entry.from), path.join(stageRoot, entry.to));
    if (copied) {
      included.push(entry.to);
    }
  }

  const notes = [
    '# Atlas Chat Exporter Release Bundle',
    '',
    `Version: ${args.version}`,
    '',
    'Included paths:',
    ...included.map((item) => `- ${item}`),
    '',
    'Notes:',
    '- Extension CRX may be absent when signing key is not configured in CI.',
    '- Use Chrome Web Store upload flow as fallback for signed distribution.',
    ''
  ].join('\n');
  await writeFile(path.join(stageRoot, 'RELEASE_NOTES.txt'), notes, 'utf8');

  const mtime = new Date(args.sourceDateEpoch * 1000);
  await normalizeMtime(stageRoot, mtime);

  const outputZip = path.join(outDir, `${args.artifactPrefix}-v${args.version}.zip`);
  await zipDeterministic(stageRoot, outputZip);

  console.log(`Built release archive: ${outputZip}`);
  await rm(tempRoot, { recursive: true, force: true });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
