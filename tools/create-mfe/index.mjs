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
const packagePath = `apps/${name}`;
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

// Rename template files and directories that embed tokens in their names.
function renameTokenFiles(dir) {
  for (const entryName of fs.readdirSync(dir)) {
    const full = path.join(dir, entryName);
    if (fs.statSync(full).isDirectory()) {
      renameTokenFiles(full);
    }
    let nextName = entryName;
    for (const [token, value] of Object.entries(replacements)) {
      nextName = nextName.replaceAll(token, value);
    }
    if (nextName !== entryName) {
      fs.renameSync(full, path.join(dir, nextName));
    }
  }
}
renameTokenFiles(targetDir);

fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

const rootTsconfigPath = path.join(repoRoot, 'tsconfig.json');
const rootTsconfig = JSON.parse(fs.readFileSync(rootTsconfigPath, 'utf8'));
const refPath = `./${packagePath}`;
const refs = Array.isArray(rootTsconfig.references)
  ? rootTsconfig.references
  : [];
if (!refs.some((ref) => ref.path === refPath)) {
  refs.push({ path: refPath });
  rootTsconfig.references = refs;
  fs.writeFileSync(
    rootTsconfigPath,
    `${JSON.stringify(rootTsconfig, null, 2)}\n`,
  );
}

const hostChecklist = path.join(targetDir, 'HOST_INTEGRATION.md');
fs.writeFileSync(
  hostChecklist,
  [
    `# Host integration checklist — ${name}`,
    '',
    'After Terraform provisions this remote, register it in MED0002_PharmacyPortal:',
    '',
    `1. Set \`VITE_REMOTE_${name.toUpperCase().replace(/-/g, '_')}_URL=https://${domain}/mf-manifest.json\`.`,
    `2. Add a \`REMOTE_REGISTRY\` entry: name \`${federationName}\`, module \`./Mfe\`, route \`/${name}\`.`,
    '3. Add a thin page adapter that builds an `MfeDataEnvelope` and mounts `RemoteLoader`.',
    '4. Wire the route/nav from the registry (do not hardcode strings).',
    `5. Keep Playwright coverage in \`apps/${name}/e2e\` and extend the host suite in MED0002.`,
    '',
  ].join('\n'),
);

console.log(`Created ${packageName} at ${packagePath}`);
console.log(`Domain: https://${domain}`);
console.log('Next: apply Terraform so the subdomain and CDN are provisioned.');
console.log(`Host checklist: ${packagePath}/HOST_INTEGRATION.md`);
