#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(__dirname, '../..');
export const catalogPath = path.join(repoRoot, 'config/mfes.json');

/**
 * @typedef {{
 *   name: string;
 *   package: string;
 *   path: string;
 *   federationName: string;
 *   expose: string;
 *   port: number;
 *   domain: string;
 *   owner: string;
 * }} MfeEntry
 */

/**
 * @param {string} [catalogFile]
 */
export function loadCatalog(catalogFile = catalogPath) {
  return JSON.parse(fs.readFileSync(catalogFile, 'utf8'));
}

/**
 * @param {string} packagePath
 */
export function readPackageJson(packagePath) {
  const file = path.join(repoRoot, packagePath, 'package.json');
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * @param {string} dir
 * @param {string[]} acc
 */
export function walkFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === 'node_modules' ||
      entry.name === 'dist' ||
      entry.name === 'coverage' ||
      entry.name === '.results' ||
      entry.name === '.turbo'
    ) {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

function isWorkspaceSpec(value) {
  return String(value).startsWith('workspace:');
}

/**
 * @param {{ mfes: MfeEntry[] }} catalog
 * @param {{ checkFilesystem?: boolean }} [options]
 */
export function validateCatalog(catalog, options = {}) {
  const { checkFilesystem = false } = options;
  /** @type {string[]} */
  const errors = [];
  const names = new Set();
  const packages = new Set();
  const ports = new Set();
  const domains = new Set();
  const federationNames = new Set();
  const paths = new Set();

  for (const mfe of catalog.mfes ?? []) {
    if (!/^[a-z][a-z0-9-]*$/.test(mfe.name)) {
      errors.push(`Invalid name: ${mfe.name}`);
    }
    if (!String(mfe.path ?? '').startsWith('apps/')) {
      errors.push(`Path must live under apps/: ${mfe.path}`);
    }
    if (mfe.expose !== './Mfe') {
      errors.push(`${mfe.name} must expose ./Mfe (got ${mfe.expose})`);
    }
    if (names.has(mfe.name)) errors.push(`Duplicate name: ${mfe.name}`);
    if (packages.has(mfe.package)) {
      errors.push(`Duplicate package: ${mfe.package}`);
    }
    if (ports.has(mfe.port)) errors.push(`Duplicate port: ${mfe.port}`);
    if (domains.has(mfe.domain)) errors.push(`Duplicate domain: ${mfe.domain}`);
    if (federationNames.has(mfe.federationName)) {
      errors.push(`Duplicate federationName: ${mfe.federationName}`);
    }
    if (paths.has(mfe.path)) errors.push(`Duplicate path: ${mfe.path}`);

    names.add(mfe.name);
    packages.add(mfe.package);
    ports.add(mfe.port);
    domains.add(mfe.domain);
    federationNames.add(mfe.federationName);
    paths.add(mfe.path);

    if (!mfe.domain?.endsWith('.mfe.nammamedmate.com')) {
      errors.push(`Domain must end with .mfe.nammamedmate.com: ${mfe.domain}`);
    }
    if (mfe.port < 5100 || mfe.port > 5999) {
      errors.push(`Port out of range for ${mfe.name}: ${mfe.port}`);
    }

    if (!checkFilesystem) continue;

    const abs = path.join(repoRoot, mfe.path);
    if (!fs.existsSync(abs)) {
      errors.push(`Missing package directory: ${mfe.path}`);
      continue;
    }

    const pkg = readPackageJson(mfe.path);
    if (!pkg) {
      errors.push(`Missing package.json in ${mfe.path}`);
    } else {
      if (pkg.name !== mfe.package) {
        errors.push(
          `${mfe.path} package.json name ${pkg.name} != ${mfe.package}`,
        );
      }
      const deps = {
        ...(pkg.dependencies ?? {}),
        ...(pkg.devDependencies ?? {}),
      };
      if (deps['@medmate/host-kit']) {
        errors.push(`${mfe.package} must not depend on @medmate/host-kit`);
      }
      for (const [depName, spec] of Object.entries(deps)) {
        if (!isWorkspaceSpec(spec)) {
          errors.push(
            `${mfe.package} must only declare workspace:* deps (found ${depName}: ${spec})`,
          );
        }
      }
    }

    const required = [
      'src/entrypoints/remote.tsx',
      'src/entrypoints/standalone.tsx',
      'src/contract.ts',
      'src/app',
      'src/layouts',
      'src/ui',
      'e2e/playwright.config.ts',
      'e2e/specs',
    ];
    for (const relative of required) {
      if (!fs.existsSync(path.join(abs, relative))) {
        errors.push(`${mfe.name} missing ${relative}`);
      }
    }

    const forbidden = ['src/test', 'src/testing', 'src/styles'];
    for (const relative of forbidden) {
      if (fs.existsSync(path.join(abs, relative))) {
        errors.push(`${mfe.name} must not include ${relative}`);
      }
    }

    const files = walkFiles(abs);
    for (const file of files) {
      const rel = path.relative(abs, file);
      if (rel.endsWith('.css')) {
        errors.push(
          `${mfe.name} must not ship CSS files (${rel}); use Tailwind`,
        );
      }
      if (
        rel.split(path.sep).includes('ui') &&
        rel.includes(`${path.sep}features${path.sep}`)
      ) {
        errors.push(`${mfe.name} UI must not live under features/ (${rel})`);
      }
      if (/(^|\/)__tests__$/.test(path.dirname(rel).replaceAll('\\', '/'))) {
        continue;
      }
      if (/\.test\.(ts|tsx)$/.test(rel) && rel.startsWith(`src${path.sep}`)) {
        errors.push(
          `${mfe.name} unit tests must live in __tests__ folders (${rel})`,
        );
      }
    }

    const featureUi = path.join(abs, 'src/features');
    if (fs.existsSync(featureUi)) {
      const featureFiles = walkFiles(featureUi);
      for (const file of featureFiles) {
        const rel = path.relative(abs, file);
        if (rel.split(path.sep).includes('ui')) {
          errors.push(`${mfe.name} UI must not live under features/ (${rel})`);
        }
      }
    }
  }

  return errors;
}

/**
 * @param {string} name
 * @param {{ mfes: MfeEntry[] }} catalog
 */
export function nextPort(name, catalog) {
  const used = new Set(catalog.mfes.map((m) => m.port));
  let port = 5101;
  while (used.has(port)) port += 1;
  return port;
}

/**
 * @param {string} name
 */
export function toFederationName(name) {
  return name.replace(/-/g, '_');
}
