import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';

interface PackageTarget {
  dir: string;
  name: string;
}

async function getBuildTargets(root: string, segment: 'packages' | 'apps'): Promise<PackageTarget[]> {
  const base = path.join(root, segment);
  try {
    const children = await readdir(base);
    const targets: PackageTarget[] = [];
    for (const child of children) {
      const pkgDir = path.join(base, child);
      const pkgJsonPath = path.join(pkgDir, 'package.json');
      try {
        const pkgJsonRaw = await readFile(pkgJsonPath, 'utf8');
        const pkgJson = JSON.parse(pkgJsonRaw) as { name?: string; scripts?: Record<string, string> };
        if (pkgJson.scripts?.build) {
          targets.push({ dir: pkgDir, name: pkgJson.name ?? `${segment}/${child}` });
        }
      } catch {
        continue;
      }
    }
    return targets;
  } catch {
    return [];
  }
}

function runScript(cwd: string, script: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['run', script], {
      cwd,
      stdio: 'inherit'
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Script ${script} failed in ${cwd} with exit code ${code ?? 'unknown'}`));
    });
  });
}

async function main(): Promise<void> {
  const root = process.cwd();
  const packageTargets = await getBuildTargets(root, 'packages');
  const appTargets = await getBuildTargets(root, 'apps');
  const allTargets = [...packageTargets, ...appTargets];

  if (allTargets.length === 0) {
    console.log('No package/app build targets found.');
    return;
  }

  for (const target of allTargets) {
    const targetStat = await stat(target.dir);
    if (!targetStat.isDirectory()) {
      continue;
    }
    console.log(`Building ${target.name} (${target.dir})`);
    await runScript(target.dir, 'build');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
