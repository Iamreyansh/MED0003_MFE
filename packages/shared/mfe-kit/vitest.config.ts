import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createVitestConfig } from '../../../config/vitest/base';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default createVitestConfig({
  rootDir,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  coverageExclude: ['src/index.ts', 'src/store/index.ts'],
});
