import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

const BLOCKED = [
  '/api/v1/pharmacy/inventory',
  '/api/v1/pharmacy/settings',
  '/api/v1/pharmacy/subscription',
  '/api/v1/pharmacy/purchases',
  '/api/v1/pharmacy/invoices',
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === '__tests__' || entry === 'standalone.tsx') {
      continue;
    }
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
      continue;
    }
    if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      out.push(full);
    }
  }
  return out;
}

describe('POS API path allowlist', () => {
  it('does not call inventory, settings, or invoice APIs', () => {
    const files = walk(root);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const blocked of BLOCKED) {
        expect(source, `${file} contains ${blocked}`).not.toContain(blocked);
      }
    }
  });
});
