import { readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const RAW_DIR = path.join('fixtures', 'raw-dom');
const EXPECTED_MD_DIR = path.join('fixtures', 'expected-md');
const EXPECTED_JSON_DIR = path.join('fixtures', 'expected-json');

function toStem(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '');
}

async function listStems(dir: string, extension: string): Promise<Set<string>> {
  const files = await readdir(dir);
  return new Set(files.filter((file) => file.endsWith(extension)).map(toStem));
}

async function main(): Promise<void> {
  const rawStems = await listStems(RAW_DIR, '.html');
  const mdStems = await listStems(EXPECTED_MD_DIR, '.md');
  const jsonStems = await listStems(EXPECTED_JSON_DIR, '.json');

  const errors: string[] = [];

  for (const stem of rawStems) {
    if (!mdStems.has(stem)) {
      errors.push(`Missing expected Markdown fixture for: ${stem}`);
    }
    if (!jsonStems.has(stem)) {
      errors.push(`Missing expected JSON fixture for: ${stem}`);
    }
  }

  for (const stem of mdStems) {
    if (!rawStems.has(stem)) {
      errors.push(`Orphan expected Markdown fixture without raw input: ${stem}`);
    }
  }

  for (const stem of jsonStems) {
    if (!rawStems.has(stem)) {
      errors.push(`Orphan expected JSON fixture without raw input: ${stem}`);
    }
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Fixture verification passed for ${rawStems.size} fixture(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
