import { execSync } from 'node:child_process';

function readVersion(argv: string[]): string {
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--version') {
      return argv[i + 1] ?? '';
    }
    if (token.startsWith('--version=')) {
      return token.slice('--version='.length);
    }
  }
  return process.env.RELEASE_VERSION ?? '';
}

const version = readVersion(process.argv.slice(2));
if (!version) {
  throw new Error('Missing --version (or RELEASE_VERSION env).');
}

const steps = [
  'pnpm bundle:snippets',
  'pnpm bundle:bookmarklets',
  'pnpm build',
  `pnpm package:extension -- --version ${version}`,
  `pnpm package:release -- --version ${version}`
];

for (const step of steps) {
  console.log(`\n> ${step}`);
  execSync(step, { stdio: 'inherit' });
}

console.log('\nBuild complete.');
