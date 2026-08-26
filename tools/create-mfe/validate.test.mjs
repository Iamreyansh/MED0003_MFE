import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  catalogPath,
  environmentDomain,
  nextPort,
  toDeployMatrix,
  toFederationName,
  validateCatalog,
} from './lib.mjs';

const templateDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'templates/mfe',
);

const environments = {
  staging: {
    name: 'staging',
    domainSuffix: 'staging.mfe.nammamedmate.com',
  },
  production: {
    name: 'production',
    domainSuffix: 'mfe.nammamedmate.com',
  },
};

function catalogMfe(overrides = {}) {
  return {
    name: 'todo',
    package: '@medmate/todo',
    path: 'apps/todo',
    federationName: 'todo',
    expose: './Mfe',
    port: 5101,
    domain: 'todo.mfe.nammamedmate.com',
    owner: 'platform',
    ...overrides,
  };
}

test('validateCatalog catches duplicates and invalid paths', () => {
  const errors = validateCatalog({
    environments,
    mfes: [
      catalogMfe({
        path: 'packages/components/todo',
        expose: './Widget',
      }),
      catalogMfe({
        path: 'packages/components/todo',
        expose: './Widget',
      }),
    ],
  });
  assert.ok(errors.some((error) => error.includes('apps/')));
  assert.ok(errors.some((error) => error.includes('./Mfe')));
  assert.ok(errors.some((error) => error.includes('Duplicate')));
});

test('validateCatalog requires environment suffixes and matching production domains', () => {
  const missingEnv = validateCatalog({
    mfes: [catalogMfe()],
  });
  assert.ok(
    missingEnv.some((error) => error.includes('environments.production')),
  );

  const badDomain = validateCatalog({
    environments,
    mfes: [catalogMfe({ domain: 'todo.example.com' })],
  });
  assert.ok(badDomain.some((error) => error.includes('Production domain')));
});

test('nextPort skips used ports', () => {
  const port = nextPort('inventory', {
    environments,
    mfes: [catalogMfe()],
  });
  assert.equal(port, 5102);
});

test('toFederationName replaces dashes', () => {
  assert.equal(toFederationName('stock-alerts'), 'stock_alerts');
});

test('environmentDomain derives staging independently of production', () => {
  const catalog = { environments, mfes: [catalogMfe()] };
  assert.equal(
    environmentDomain(catalog.mfes[0], catalog, 'staging'),
    'todo.staging.mfe.nammamedmate.com',
  );
  assert.equal(
    environmentDomain(catalog.mfes[0], catalog, 'production'),
    'todo.mfe.nammamedmate.com',
  );
});

test('toDeployMatrix carries both environment domains', () => {
  const catalog = { environments, mfes: [catalogMfe()] };
  const matrix = toDeployMatrix(catalog.mfes, catalog);
  assert.deepEqual(
    matrix.include[0].stagingDomain,
    'todo.staging.mfe.nammamedmate.com',
  );
  assert.deepEqual(
    matrix.include[0].productionDomain,
    'todo.mfe.nammamedmate.com',
  );
});

test('real catalog passes filesystem architecture checks', () => {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const errors = validateCatalog(catalog, { checkFilesystem: true });
  assert.deepEqual(errors, []);
});

test('template ships the reference architecture without component CSS imports', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'create-mfe-'));
  fs.cpSync(templateDir, tmp, { recursive: true });

  const required = [
    'src/entrypoints/remote.tsx',
    'src/entrypoints/standalone.tsx',
    'src/app/__PASCAL__Mfe.tsx',
    'src/layouts/__PASCAL__Layout.tsx',
    'src/ui/FeatureIntro.tsx',
    'src/contract.ts',
    'src/features/__NAME__/api/mfeService.ts',
    'e2e/playwright.config.ts',
    'e2e/specs/__NAME__.spec.ts',
  ];
  for (const relative of required) {
    assert.ok(fs.existsSync(path.join(tmp, relative)), relative);
  }

  const root = fs.readFileSync(
    path.join(tmp, 'src/app/__PASCAL__Mfe.tsx'),
    'utf8',
  );
  assert.equal(root.includes("import '@medmate/ui/styles.css'"), false);
  assert.equal(root.includes('.css'), false);

  const remote = fs.readFileSync(
    path.join(tmp, 'src/entrypoints/remote.tsx'),
    'utf8',
  );
  assert.ok(remote.includes("import '@medmate/ui/styles.css'"));
  assert.equal(remote.includes('mfe.css'), false);
  assert.ok(remote.includes("from '@medmate/vite-config'") === false);

  const vite = fs.readFileSync(path.join(tmp, 'vite.config.ts'), 'utf8');
  assert.ok(vite.includes('@medmate/vite-config'));
  assert.equal(vite.includes('port:'), false);
  const vitest = fs.readFileSync(path.join(tmp, 'vitest.config.ts'), 'utf8');
  assert.ok(vitest.includes('@medmate/vitest-config'));
  assert.equal(vitest.includes('setupFiles'), false);

  const pkg = JSON.parse(
    fs.readFileSync(path.join(tmp, 'package.json'), 'utf8'),
  );
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const spec of Object.values(deps)) {
    assert.ok(String(spec).startsWith('workspace:'));
  }
  assert.equal(fs.existsSync(path.join(tmp, 'index.html')), false);
  assert.equal(fs.existsSync(path.join(tmp, 'src/styles')), false);
});
