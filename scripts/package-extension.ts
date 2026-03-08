#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readdir, readFile, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

interface Args {
  version: string;
  extensionDir: string;
  outDir: string;
  artifactPrefix: string;
  sourceDateEpoch: number;
  keyPath?: string;
  chromeBinary?: string;
  updateBaseUrl?: string;
}

const DEFAULT_EPOCH = 315532800; // 1980-01-01T00:00:00Z (zip lower-bound)

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
    throw new Error('Missing --version (or RELEASE_VERSION env).');
  }

  return {
    version,
    extensionDir: params.get('extension-dir') ?? 'apps/extension',
    outDir: params.get('out-dir') ?? 'dist/release',
    artifactPrefix: params.get('artifact-prefix') ?? 'atlas-chat-exporter-extension',
    sourceDateEpoch: Number(
      params.get('source-date-epoch') ?? process.env.SOURCE_DATE_EPOCH ?? DEFAULT_EPOCH
    ),
    keyPath: params.get('key-path') ?? process.env.CRX_PRIVATE_KEY_PATH,
    chromeBinary: params.get('chrome-binary') ?? process.env.CHROME_BINARY,
    updateBaseUrl: params.get('update-base-url') ?? process.env.CRX_UPDATE_BASE_URL
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
  const relFiles = await walkFiles(root);
  await Promise.all(
    relFiles.map(async (relFile) => {
      const full = path.join(root, relFile);
      await utimes(full, when, when);
    })
  );
}

async function fileSha256(filePath: string): Promise<string> {
  const data = await readFile(filePath);
  return createHash('sha256').update(data).digest('hex');
}

async function zipDeterministic(inputDir: string, outputZip: string): Promise<void> {
  const files = await walkFiles(inputDir);
  const manifest = path.join(inputDir, '.pack-order.txt');
  await writeFile(manifest, `${files.join('\n')}\n`, 'utf8');

  const relFiles = ['.pack-order.txt', ...files];
  const args = ['-X', '-q', '-r', outputZip, ...relFiles];
  await run('zip', args, { cwd: inputDir });
}

function resolveChromeBinary(override?: string): string | null {
  if (override) {
    return override;
  }

  const candidates = [
    'google-chrome',
    'google-chrome-stable',
    'chromium-browser',
    'chromium',
    'chrome'
  ];
  return candidates[0] ?? null;
}

async function buildUpdateMetadata(args: Args, crxPath: string, targetXml: string): Promise<void> {
  if (!args.updateBaseUrl) {
    return;
  }

  const crxName = path.basename(crxPath);
  const codebase = `${args.updateBaseUrl.replace(/\/$/, '')}/${crxName}`;
  const appId = await deriveExtensionId(args.keyPath!);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<gupdate xmlns="http://www.google.com/update2/response" protocol="2.0">\n  <app appid="${appId}">\n    <updatecheck codebase="${codebase}" version="${args.version}" />\n  </app>\n</gupdate>\n`;

  await writeFile(targetXml, xml, 'utf8');
}

async function deriveExtensionId(keyPath: string): Promise<string> {
  const pem = await readFile(keyPath, 'utf8');
  const keyBody = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const keyBytes = Buffer.from(keyBody, 'base64');
  const digest = createHash('sha256').update(keyBytes).digest();
  const nibbleToLetter = (n: number) => String.fromCharCode('a'.charCodeAt(0) + n);
  const id = Array.from(
    digest.slice(0, 16),
    (byte) => `${nibbleToLetter(byte >> 4)}${nibbleToLetter(byte & 0x0f)}`
  ).join('');
  return id;
}

async function makeCrx(
  args: Args,
  stagedExtensionDir: string,
  outDir: string,
  artifactBase: string
): Promise<{ crxPath: string; xmlPath?: string } | null> {
  if (!args.keyPath) {
    console.log(
      'No CRX key provided. Skipping CRX generation; use Chrome Web Store upload as fallback.'
    );
    return null;
  }

  const chromeBinary = resolveChromeBinary(args.chromeBinary);
  if (!chromeBinary) {
    console.log('No Chrome binary configured. Skipping CRX generation.');
    return null;
  }

  const crxOutputName = `${artifactBase}.crx`;
  const crxOutput = path.resolve(outDir, crxOutputName);

  await run(chromeBinary, [
    `--pack-extension=${path.resolve(stagedExtensionDir)}`,
    `--pack-extension-key=${path.resolve(args.keyPath)}`
  ]);

  const generatedCrx = `${path.resolve(stagedExtensionDir)}.crx`;
  await cp(generatedCrx, crxOutput);

  const xmlPath = path.resolve(outDir, `${artifactBase}-update.xml`);
  await buildUpdateMetadata(args, crxOutput, xmlPath);

  return {
    crxPath: crxOutput,
    xmlPath: args.updateBaseUrl ? xmlPath : undefined
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(args.outDir);
  const extensionDir = path.resolve(args.extensionDir);
  const tmpRoot = await mkdtemp(path.join(tmpdir(), 'atlas-extension-package-'));
  const stagedDir = path.join(tmpRoot, 'extension');

  await mkdir(outDir, { recursive: true });
  await cp(extensionDir, stagedDir, { recursive: true });

  const mtime = new Date(args.sourceDateEpoch * 1000);
  await normalizeMtime(stagedDir, mtime);

  const artifactBase = `${args.artifactPrefix}-v${args.version}`;
  const zipPath = path.join(outDir, `${artifactBase}.zip`);
  await zipDeterministic(stagedDir, zipPath);

  const sha = await fileSha256(zipPath);
  await writeFile(
    path.join(outDir, `${artifactBase}.zip.sha256`),
    `${sha}  ${path.basename(zipPath)}\n`,
    'utf8'
  );

  const crx = await makeCrx(args, stagedDir, outDir, artifactBase);

  console.log(`Built extension package: ${zipPath}`);
  if (crx?.crxPath) {
    console.log(`Built CRX package: ${crx.crxPath}`);
  }
  if (crx?.xmlPath) {
    console.log(`Built update metadata: ${crx.xmlPath}`);
  }

  await rm(tmpRoot, { recursive: true, force: true });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
