#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog, validateCatalog } from './lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.resolve(__dirname, '../../config/mfes.json');
const catalog = loadCatalog(catalogPath);
const errors = validateCatalog(catalog);

if (errors.length > 0) {
  console.error('MFE catalog validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${catalog.mfes.length} MFE(s).`);
