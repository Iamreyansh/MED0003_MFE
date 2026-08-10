import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const catalogPath = path.join(repoRoot, 'config/mfes.json');

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
 * @param {{ mfes: MfeEntry[] }} catalog
 */
export function validateCatalog(catalog) {
  /** @type {string[]} */
  const errors = [];
  const names = new Set();
  const packages = new Set();
  const ports = new Set();
  const domains = new Set();
  const federationNames = new Set();

  for (const mfe of catalog.mfes) {
    if (!/^[a-z][a-z0-9-]*$/.test(mfe.name)) {
      errors.push(`Invalid name: ${mfe.name}`);
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

    names.add(mfe.name);
    packages.add(mfe.package);
    ports.add(mfe.port);
    domains.add(mfe.domain);
    federationNames.add(mfe.federationName);

    if (!mfe.domain.endsWith('.mfe.nammamedmate.com')) {
      errors.push(`Domain must end with .mfe.nammamedmate.com: ${mfe.domain}`);
    }
    if (mfe.port < 5100 || mfe.port > 5999) {
      errors.push(`Port out of range for ${mfe.name}: ${mfe.port}`);
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
