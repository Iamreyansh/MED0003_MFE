import assert from 'node:assert/strict';
import test from 'node:test';
import { nextPort, toFederationName, validateCatalog } from './lib.mjs';

test('validateCatalog catches duplicates', () => {
  const errors = validateCatalog({
    mfes: [
      {
        name: 'todo',
        package: '@medmate/todo',
        path: 'packages/components/todo',
        federationName: 'todo',
        expose: './Mfe',
        port: 5101,
        domain: 'todo.mfe.nammamedmate.com',
        owner: 'platform',
      },
      {
        name: 'todo',
        package: '@medmate/todo',
        path: 'packages/components/todo',
        federationName: 'todo',
        expose: './Mfe',
        port: 5101,
        domain: 'todo.mfe.nammamedmate.com',
        owner: 'platform',
      },
    ],
  });
  assert.ok(errors.length > 0);
});

test('nextPort skips used ports', () => {
  const port = nextPort('inventory', {
    mfes: [
      {
        name: 'todo',
        package: '@medmate/todo',
        path: 'packages/components/todo',
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
