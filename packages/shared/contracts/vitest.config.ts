import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createVitestConfig } from '../../../config/vitest/base';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default createVitestConfig({
  rootDir,
  environment: 'node',
  withReact: false,
  strictCoverage: true,
  coverageInclude: ['src/**/*.ts'],
});
