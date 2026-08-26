import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

const TEMPLATE_PATH = fileURLToPath(
  new URL('../templates/index.html', import.meta.url),
);

export function standaloneHtml(name: string): string {
  return fs
    .readFileSync(TEMPLATE_PATH, 'utf8')
    .replaceAll('__MFE_TITLE__', `${name} MFE`);
}

/**
 * Materializes the shared standalone HTML inside the MFE root at build/dev time
 * so Vite has an entry, without committing per-app index.html files.
 */
export function medmateStandaloneHtmlPlugin(
  name: string,
  rootDir: string,
): Plugin {
  const html = standaloneHtml(name);
  const htmlPath = path.join(rootDir, 'index.html');

  function writeHtml() {
    fs.writeFileSync(htmlPath, html);
  }

  return {
    name: 'medmate-standalone-html',
    config() {
      writeHtml();
    },
    configureServer() {
      writeHtml();
    },
    buildStart() {
      writeHtml();
    },
  };
}
