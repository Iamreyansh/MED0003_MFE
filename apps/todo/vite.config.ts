import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMfeViteConfig } from '@medmate/vite-config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default createMfeViteConfig({
  rootDir,
  name: 'todo',
  port: 5101,
});
