#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const REQUIRED_CI_COMMANDS = [
  'pnpm install --frozen-lockfile',
  'pnpm run lint',
  'pnpm run typecheck',
  'pnpm run test:unit',
  'pnpm run test:golden',
  'pnpm run test:smoke',
  'pnpm run verify:fixtures',
  'pnpm run check:security-policy',
  'pnpm run build'
];

const REQUIRED_SCRIPT_NAMES = [
  'lint',
  'typecheck',
  'test:unit',
  'test:golden',
  'test:smoke',
  'verify:fixtures',
  'check:security-policy',
  'build'
];

async function main() {
  const [workflowYaml, packageJsonRaw] = await Promise.all([
    readFile('.github/workflows/ci.yml', 'utf8'),
    readFile('package.json', 'utf8')
  ]);

  const pkg = JSON.parse(packageJsonRaw);
  const scripts = pkg.scripts ?? {};
  const violations = [];

  for (const cmd of REQUIRED_CI_COMMANDS) {
    if (!workflowYaml.includes(cmd)) {
      violations.push(`ci.yml missing command: ${cmd}`);
    }
  }

  for (const scriptName of REQUIRED_SCRIPT_NAMES) {
    if (!(scriptName in scripts)) {
      violations.push(`package.json missing script: ${scriptName}`);
    }
  }

  const ciScript = scripts.ci;
  if (typeof ciScript !== 'string') {
    violations.push('package.json missing script: ci');
  } else {
    for (const step of REQUIRED_SCRIPT_NAMES) {
      const tokenA = `pnpm ${step}`;
      const tokenB = `pnpm run ${step}`;
      if (!ciScript.includes(tokenA) && !ciScript.includes(tokenB)) {
        violations.push(`ci script missing step: ${step}`);
      }
    }
  }

  if (violations.length > 0) {
    console.error('CI parity check failed:');
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log('CI parity check passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
