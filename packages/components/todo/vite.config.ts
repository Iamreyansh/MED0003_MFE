import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMfeViteConfig } from '../../../config/vite/mfe';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default createMfeViteConfig({
  rootDir,
  name: 'todo',
  port: 5101,
});
