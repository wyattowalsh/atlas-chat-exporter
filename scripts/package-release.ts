import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

interface Options {
  version: string;
  outDir: string;
  sourceDateEpoch: number;
}

function parseArgs(argv: string[]): Options {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith('--')) continue;
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
    args.set(key.slice(2), value);
  }

  const version = args.get('version') ?? process.env.RELEASE_VERSION;
  if (!version) {
    throw new Error('Missing version. Use --version vX.Y.Z or set RELEASE_VERSION.');
  }

  return {
    version,
    outDir: resolve(args.get('out-dir') ?? 'dist/release'),
    sourceDateEpoch: Number(args.get('source-date-epoch') ?? process.env.SOURCE_DATE_EPOCH ?? 1704067200)
  };
}

function copyIfExists(path: string, destRoot: string): void {
  const absPath = resolve(path);
  if (!existsSync(absPath)) {
    console.warn(`Skipping missing path: ${path}`);
    return;
  }

  cpSync(absPath, join(destRoot, path), { recursive: true });
}

function walkFiles(rootDir: string): string[] {
  const files: string[] = [];
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop()!;
    const entries = readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile()) {
        files.push(relative(rootDir, fullPath));
      }
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
}

function normalizeMtime(rootDir: string, sourceDateEpoch: number): void {
  const fixed = new Date(sourceDateEpoch * 1000);
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop()!;
    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      }
      utimesSync(fullPath, fixed, fixed);
    }
  }
  utimesSync(rootDir, fixed, fixed);
}

function runZip(rootDir: string, outFile: string, files: string[]): void {
  const result = spawnSync('zip', ['-X', '-q', outFile, ...files], {
    cwd: rootDir,
    stdio: 'inherit'
  });
  if (result.status !== 0) {
    throw new Error(`zip failed with code ${result.status}`);
  }
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  mkdirSync(options.outDir, { recursive: true });

  const stageDir = mkdtempSync(join(tmpdir(), 'atlas-release-stage-'));
  try {
    const packagePaths = [
      'README.md',
      'LICENSE',
      'docs',
      'apps/snippets/dist',
      'apps/bookmarklets/dist',
      'apps/cli/dist'
    ];

    for (const path of packagePaths) {
      copyIfExists(path, stageDir);
    }

    normalizeMtime(stageDir, options.sourceDateEpoch);
    const files = walkFiles(stageDir);
    const outPath = join(options.outDir, `atlas-chat-exporter-${options.version}.zip`);
    runZip(stageDir, outPath, files);

    console.log(`Created release bundle: ${outPath}`);
  } finally {
    rmSync(stageDir, { recursive: true, force: true });
  }
}

main();
