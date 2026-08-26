#!/usr/bin/env node
import {
  environmentDomain,
  loadCatalog,
  toDeployMatrix,
} from '../tools/create-mfe/lib.mjs';

const [command, ...rest] = process.argv.slice(2);
const catalog = loadCatalog();

function print(value) {
  if (typeof value === 'string') {
    process.stdout.write(`${value}\n`);
    return;
  }
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

switch (command) {
  case 'list':
    print(catalog.mfes.map((mfe) => mfe.name));
    break;
  case 'get': {
    const name = rest[0];
    const mfe = catalog.mfes.find((entry) => entry.name === name);
    if (!mfe) {
      console.error(`Unknown MFE: ${name}`);
      process.exit(1);
    }
    print({
      ...mfe,
      stagingDomain: environmentDomain(mfe, catalog, 'staging'),
      productionDomain: environmentDomain(mfe, catalog, 'production'),
    });
    break;
  }
  case 'matrix':
    print(toDeployMatrix(catalog.mfes, catalog));
    break;
  case 'env-domain': {
    const [name, environment] = rest;
    const mfe = catalog.mfes.find((entry) => entry.name === name);
    if (!mfe || (environment !== 'staging' && environment !== 'production')) {
      console.error(
        'Usage: catalog.mjs env-domain <name> <staging|production>',
      );
      process.exit(1);
    }
    print(environmentDomain(mfe, catalog, environment));
    break;
  }
  default:
    console.error('Usage: catalog.mjs <list|get|matrix|env-domain> [...args]');
    process.exit(1);
}
