import path from 'node:path';
import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from '@playwright/test';

export type CreateMfePlaywrightConfigOptions = {
  /** Catalog / federation remote name (e.g. `todo`). */
  name: string;
  /** Standalone Vite port. */
  port: number;
  /** Absolute path to `apps/<mfe>/e2e`. */
  e2eDir: string;
  /** pnpm filter name. Defaults to `@medmate/<name>`. */
  packageName?: string;
};

/**
 * Shared Playwright config. Specs, mocks, and fixtures live under the MFE `e2e/` folder.
 */
export function createMfePlaywrightConfig(
  options: CreateMfePlaywrightConfigOptions,
): PlaywrightTestConfig {
  const { name, port, e2eDir, packageName = `@medmate/${name}` } = options;

  return defineConfig({
    testDir: path.join(e2eDir, 'specs'),
    outputDir: path.join(e2eDir, '.results'),
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
      ...devices['Desktop Chrome'],
      baseURL: `http://localhost:${port}`,
      trace: 'on-first-retry',
    },
    webServer: {
      command: `pnpm --filter ${packageName} dev`,
      url: `http://localhost:${port}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  });
}
