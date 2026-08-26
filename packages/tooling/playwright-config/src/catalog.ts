import fs from 'node:fs';
import path from 'node:path';

export type CatalogMfe = {
  name: string;
  package: string;
  path: string;
  federationName: string;
  expose: string;
  port: number;
  domain: string;
  owner: string;
};

type CatalogFile = {
  mfes?: CatalogMfe[];
};

export function findRepoRoot(startDir: string): string {
  let dir = path.resolve(startDir);
  while (dir !== path.dirname(dir)) {
    if (
      fs.existsSync(path.join(dir, 'config/mfes.json')) &&
      fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))
    ) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  throw new Error(`Unable to locate MED0003 repo root from ${startDir}`);
}

export function resolveCatalogMfeFromE2e(e2eDir: string): CatalogMfe {
  const appRoot = path.resolve(e2eDir, '..');
  const repoRoot = findRepoRoot(appRoot);
  const rel = path.relative(repoRoot, appRoot).replaceAll('\\', '/');
  const catalog = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'config/mfes.json'), 'utf8'),
  ) as CatalogFile;
  const mfe = (catalog.mfes ?? []).find((entry) => entry.path === rel);
  if (!mfe) {
    throw new Error(`No catalog entry for ${rel}`);
  }
  return mfe;
}
