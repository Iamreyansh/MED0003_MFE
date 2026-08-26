import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMfePlaywrightConfig } from '@medmate/playwright-config';

const e2eDir = path.dirname(fileURLToPath(import.meta.url));

export default createMfePlaywrightConfig({
  name: 'todo',
  port: 5101,
  e2eDir,
});
