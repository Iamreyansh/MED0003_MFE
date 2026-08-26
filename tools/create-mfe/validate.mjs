#!/usr/bin/env node
import { loadCatalog, validateCatalog } from './lib.mjs';

const catalog = loadCatalog();
const errors = validateCatalog(catalog, { checkFilesystem: true });

if (errors.length > 0) {
  console.error('MFE catalog validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${catalog.mfes.length} MFE(s).`);
