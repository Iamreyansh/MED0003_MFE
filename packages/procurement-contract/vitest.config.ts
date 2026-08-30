import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createVitestConfig } from '@medmate/vitest-config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default createVitestConfig({
  rootDir,
  environment: 'node',
  withReact: false,
  coverageInclude: ['src/**/*.ts'],
});
