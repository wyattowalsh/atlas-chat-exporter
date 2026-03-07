import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const check = process.argv[2];

function run(command) {
  execSync(command, { stdio: 'inherit' });
}

function hasAny(paths) {
  return paths.some((path) => existsSync(path));
}

function hasBin(bin) {
  return existsSync(`node_modules/.bin/${bin}`);
}

switch (check) {
  case 'lint': {
    const hasEslintConfig = hasAny([
      '.eslintrc',
      '.eslintrc.js',
      '.eslintrc.cjs',
      '.eslintrc.json',
      'eslint.config.js',
      'eslint.config.mjs',
      'eslint.config.cjs'
    ]);

    if (!hasEslintConfig) {
      console.log('Skipping lint: no ESLint configuration found.');
      process.exit(0);
    }

    if (!hasBin('eslint')) {
      console.log('Skipping lint: eslint is not installed locally. Run `npm install`.');
      process.exit(0);
    }

    run('npx eslint . --max-warnings=0');
    break;
  }

  case 'format:check': {
    if (!hasBin('prettier')) {
      console.log('Skipping format check: prettier is not installed locally. Run `npm install`.');
      process.exit(0);
    }

    run('npx prettier --check .');
    break;
  }

  case 'typecheck': {
    const hasTsconfig = hasAny(['tsconfig.json', 'tsconfig.base.json']);

    if (!hasTsconfig) {
      console.log('Skipping typecheck: no TypeScript config found.');
      process.exit(0);
    }

    if (!hasBin('tsc')) {
      console.log('Skipping typecheck: TypeScript is not installed locally. Run `npm install`.');
      process.exit(0);
    }

    run('npx tsc --noEmit');
    break;
  }

  default:
    console.error(`Unknown check: ${check ?? '(none)'}`);
    process.exit(1);
}
