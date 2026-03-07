import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

interface Options {
  version: string;
  inputDir: string;
  outDir: string;
  sourceDateEpoch: number;
  crxKeyPath?: string;
  updateBaseUrl?: string;
  extensionId?: string;
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
    inputDir: resolve(args.get('input-dir') ?? 'apps/extension/dist'),
    outDir: resolve(args.get('out-dir') ?? 'dist/release'),
    sourceDateEpoch: Number(args.get('source-date-epoch') ?? process.env.SOURCE_DATE_EPOCH ?? 1704067200),
    crxKeyPath: args.get('crx-key') ?? process.env.EXTENSION_CRX_KEY_PATH,
    updateBaseUrl: args.get('update-base-url') ?? process.env.EXTENSION_UPDATE_BASE_URL,
    extensionId: args.get('extension-id') ?? process.env.EXTENSION_ID
  };
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

function stageDeterministicCopy(sourceDir: string, sourceDateEpoch: number): string {
  const stageRoot = mkdtempSync(join(tmpdir(), 'atlas-ext-stage-'));
  cpSync(sourceDir, stageRoot, { recursive: true });
  const fixed = new Date(sourceDateEpoch * 1000);

  const stack = [stageRoot];
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
  utimesSync(stageRoot, fixed, fixed);

  return stageRoot;
}

function runZip(rootDir: string, outFile: string, files: string[]): void {
  const zip = spawnSync('zip', ['-X', '-q', outFile, ...files], {
    cwd: rootDir,
    stdio: 'inherit'
  });
  if (zip.status !== 0) {
    throw new Error(`zip failed with code ${zip.status}`);
  }
}

async function buildCrx(zipPath: string, outPath: string, keyPath: string): Promise<void> {
  const { default: crx3 } = await import('crx3');
  const key = readFileSync(keyPath, 'utf8');
  const zip = readFileSync(zipPath);
  const crxBuffer = await crx3(zip, key);
  writeFileSync(outPath, crxBuffer);
}

function writeUpdateManifest(options: Options, outDir: string): string {
  if (!options.updateBaseUrl || !options.extensionId) {
    throw new Error('Cannot write update manifest without --update-base-url and --extension-id.');
  }

  const version = options.version.replace(/^v/, '');
  const crxName = `atlas-chat-exporter-extension-${options.version}.crx`;
  const codebase = `${options.updateBaseUrl.replace(/\/$/, '')}/${crxName}`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<gupdate xmlns="http://www.google.com/update2/response" protocol="2.0">\n  <app appid="${options.extensionId}">\n    <updatecheck codebase="${codebase}" version="${version}" />\n  </app>\n</gupdate>\n`;
  const outPath = join(outDir, `atlas-chat-exporter-extension-${options.version}.xml`);
  writeFileSync(outPath, xml, 'utf8');
  return outPath;
}

function sha256(filePath: string): string {
  const hash = createHash('sha256');
  hash.update(readFileSync(filePath));
  return hash.digest('hex');
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!existsSync(options.inputDir)) {
    throw new Error(`Extension build directory not found: ${options.inputDir}`);
  }

  mkdirSync(options.outDir, { recursive: true });
  const stageDir = stageDeterministicCopy(options.inputDir, options.sourceDateEpoch);
  try {
    const files = walkFiles(stageDir);
    const zipName = `atlas-chat-exporter-extension-${options.version}.zip`;
    const zipPath = join(options.outDir, zipName);
    runZip(stageDir, zipPath, files);

    console.log(`Created extension zip: ${zipPath}`);
    console.log(`SHA-256: ${sha256(zipPath)}`);

    if (options.crxKeyPath) {
      const crxPath = join(options.outDir, `atlas-chat-exporter-extension-${options.version}.crx`);
      await buildCrx(zipPath, crxPath, options.crxKeyPath);
      console.log(`Created CRX: ${crxPath}`);
      console.log(`SHA-256: ${sha256(crxPath)}`);

      if (options.updateBaseUrl && options.extensionId) {
        const xmlPath = writeUpdateManifest(options, options.outDir);
        console.log(`Created update manifest: ${xmlPath}`);
      } else {
        console.log('Skipped update manifest: provide --update-base-url and --extension-id.');
      }
    } else {
      console.log('Skipped CRX build: provide --crx-key path or EXTENSION_CRX_KEY_PATH.');
      console.log('Fallback: upload extension zip to Chrome Web Store for signing/distribution.');
    }
  } finally {
    rmSync(stageDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
