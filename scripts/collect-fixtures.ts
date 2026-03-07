import { spawnSync } from 'node:child_process';

const result = spawnSync('pnpm', ['verify:fixtures', '--', '--update'], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
