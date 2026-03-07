import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { exportConversation } from '../../../packages/core/src/index.js';
import type { ExportOptions, OutputFormat } from '../../../packages/shared/src/index.js';

export const EXIT_CODES = {
  OK: 0,
  BAD_ARGS: 2,
  INPUT_ERROR: 3,
  EXPORT_ERROR: 4,
  CLIPBOARD_BLOCKED: 30,
  DOWNLOAD_BLOCKED: 40
} as const;

export function runCli(
  html: string,
  format: OutputFormat = 'markdown',
  options: Partial<ExportOptions> = {}
): string {
  const dom = new JSDOM(html);
  return exportConversation({
    root: dom.window.document.body,
    options: { ...options, outputFormat: format },
    context: {
      locationHref: 'about:blank#cli',
      documentTitle: dom.window.document.title,
      now: new Date('2024-01-01T00:00:00.000Z')
    }
  }).content;
}

export async function run(argv: string[]): Promise<number> {
  const [command = 'export', ...rest] = argv;
  if (!['export', 'copy', 'download'].includes(command)) {
    return EXIT_CODES.BAD_ARGS;
  }

  const format = (readFlag(rest, '--format') as OutputFormat | undefined) ?? 'markdown';
  const inputFile = readFlag(rest, '--file');
  const outputFile = readFlag(rest, '--out');

  let html = '';
  try {
    html = inputFile ? readFileSync(inputFile, 'utf8') : await readStdin();
  } catch {
    return EXIT_CODES.INPUT_ERROR;
  }

  try {
    const output = runCli(html, format);

    if (command === 'copy') {
      return copyToClipboard(output) ? EXIT_CODES.OK : EXIT_CODES.CLIPBOARD_BLOCKED;
    }

    if (command === 'download') {
      if (!outputFile) {
        return EXIT_CODES.BAD_ARGS;
      }
      try {
        writeFileSync(outputFile, output, 'utf8');
        return EXIT_CODES.OK;
      } catch {
        return EXIT_CODES.DOWNLOAD_BLOCKED;
      }
    }

    if (outputFile) {
      writeFileSync(outputFile, output, 'utf8');
    } else {
      process.stdout.write(output);
    }

    return EXIT_CODES.OK;
  } catch {
    return EXIT_CODES.EXPORT_ERROR;
  }
}

function copyToClipboard(text: string): boolean {
  if (process.platform !== 'darwin') {
    return false;
  }

  const result = spawnSync('pbcopy', { input: text });
  return result.status === 0;
}

function readFlag(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) {
    return '';
  }
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

const isDirect = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
if (isDirect) {
  run(process.argv.slice(2)).then((code) => {
    process.exit(code);
  });
}
