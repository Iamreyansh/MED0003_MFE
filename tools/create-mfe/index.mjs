#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadCatalog,
  nextPort,
  toFederationName,
  validateCatalog,
} from './lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const catalogPath = path.join(repoRoot, 'config/mfes.json');

const name = process.argv[2];
if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('Usage: pnpm create:mfe <kebab-case-name>');
  process.exit(1);
}

const catalog = loadCatalog();
if (catalog.mfes.some((m) => m.name === name)) {
  console.error(`MFE already exists: ${name}`);
  process.exit(1);
}

const port = nextPort(name, catalog);
const federationName = toFederationName(name);
const packageName = `@medmate/${name}`;
const packagePath = `packages/components/${name}`;
const domain = `${name}.mfe.nammamedmate.com`;
const targetDir = path.join(repoRoot, packagePath);

const entry = {
  name,
  package: packageName,
  path: packagePath,
  federationName,
  expose: './Mfe',
  port,
  domain,
  owner: 'platform',
};

catalog.mfes.push(entry);
const errors = validateCatalog(catalog);
if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const templateDir = path.join(__dirname, 'templates/mfe');
fs.cpSync(templateDir, targetDir, { recursive: true });

const title = name
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');
const pascal = name
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('');

const replacements = {
  __NAME__: name,
  __PACKAGE__: packageName,
  __FEDERATION__: federationName,
  __PORT__: String(port),
  __DOMAIN__: domain,
  __TITLE__: title,
  __PASCAL__: pascal,
};

function rewrite(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [token, value] of Object.entries(replacements)) {
    content = content.replaceAll(token, value);
  }
  fs.writeFileSync(filePath, content);
}

function walk(dir) {
  for (const entryName of fs.readdirSync(dir)) {
    const full = path.join(dir, entryName);
    if (fs.statSync(full).isDirectory()) walk(full);
    else rewrite(full);
  }
}

walk(targetDir);
fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

console.log(`Created ${packageName} at ${packagePath}`);
console.log(`Domain: https://${domain}`);
console.log('Next: apply Terraform so the subdomain and CDN are provisioned.');
