import { execFileSync } from 'node:child_process';

/**
 * Raycast command entrypoint.
 * Requires atlas-export CLI to be on PATH.
 */
export default async function command() {
  execFileSync('atlas-export', ['export', '--out=~/Downloads/chat-export.md'], { stdio: 'inherit', shell: true });
}
