import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  catalogPath,
  nextPort,
  toFederationName,
  validateCatalog,
} from './lib.mjs';

const templateDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'templates/mfe',
);

test('validateCatalog catches duplicates and invalid paths', () => {
  const errors = validateCatalog({
    mfes: [
      {
        name: 'todo',
        package: '@medmate/todo',
        path: 'packages/components/todo',
        federationName: 'todo',
        expose: './Widget',
        port: 5101,
        domain: 'todo.mfe.nammamedmate.com',
        owner: 'platform',
      },
      {
        name: 'todo',
        package: '@medmate/todo',
        path: 'packages/components/todo',
        federationName: 'todo',
        expose: './Widget',
        port: 5101,
        domain: 'todo.mfe.nammamedmate.com',
        owner: 'platform',
      },
    ],
  });
  assert.ok(errors.some((error) => error.includes('apps/')));
  assert.ok(errors.some((error) => error.includes('./Mfe')));
  assert.ok(errors.some((error) => error.includes('Duplicate')));
});

test('nextPort skips used ports', () => {
  const port = nextPort('inventory', {
    mfes: [
      {
        name: 'todo',
        package: '@medmate/todo',
        path: 'apps/todo',
        federationName: 'todo',
        expose: './Mfe',
        port: 5101,
        domain: 'todo.mfe.nammamedmate.com',
        owner: 'platform',
      },
    ],
  });
  assert.equal(port, 5102);
});

test('toFederationName replaces dashes', () => {
  assert.equal(toFederationName('stock-alerts'), 'stock_alerts');
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
