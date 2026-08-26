import path from 'node:path';
import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from '@playwright/test';
import { resolveCatalogMfeFromE2e } from './catalog.js';

export type CreateMfePlaywrightConfigOptions = {
  /** Absolute path to `apps/<mfe>/e2e`. */
  e2eDir: string;
  /** Catalog / federation remote name. Defaults to catalog `name`. */
  name?: string;
  /** Standalone Vite port. Defaults to the catalog port. */
  port?: number;
  /** pnpm filter name. Defaults to catalog `package`. */
  packageName?: string;
};

/**
 * Shared Playwright config. Specs, mocks, and fixtures live under the MFE `e2e/` folder.
 * Set `PDT_BASE_URL` to run the same specs against a deployed environment (no local webServer).
 */
export function createMfePlaywrightConfig(
  options: CreateMfePlaywrightConfigOptions,
): PlaywrightTestConfig {
  const catalog = resolveCatalogMfeFromE2e(options.e2eDir);
  const name = options.name ?? catalog.name;
  const port = options.port ?? catalog.port;
  const packageName = options.packageName ?? catalog.package;
  const { e2eDir } = options;

  if (options.name && options.name !== catalog.name) {
    throw new Error(
      `Playwright name ${options.name} does not match catalog ${catalog.name}`,
    );
  }
  if (options.port && options.port !== catalog.port) {
    throw new Error(
      `Playwright port ${options.port} does not match catalog port ${catalog.port}`,
    );
  }

  const deployedBaseUrl = process.env.PDT_BASE_URL;
  const isDeployed = Boolean(deployedBaseUrl);
  const reporters: PlaywrightTestConfig['reporter'] = process.env.CI
    ? [
        ['github'],
        ['html', { open: 'never', outputFolder: path.join(e2eDir, '.report') }],
        ['list'],
      ]
    : 'list';

  return defineConfig({
    testDir: path.join(e2eDir, 'specs'),
    outputDir: path.join(e2eDir, '.results'),
    fullyParallel: !process.env.CI,
    workers: process.env.CI ? 1 : undefined,
    forbidOnly: Boolean(process.env.CI),
    retries: 0,
    reporter: reporters,
    timeout: isDeployed ? 60_000 : 30_000,
    use: {
      ...devices['Desktop Chrome'],
      baseURL: deployedBaseUrl ?? `http://localhost:${port}`,
      trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
      screenshot: process.env.CI ? 'only-on-failure' : 'off',
      video: process.env.CI ? 'retain-on-failure' : 'off',
    },
    webServer: isDeployed
      ? undefined
      : {
          command: `pnpm --filter ${packageName} dev`,
          url: `http://localhost:${port}`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
    metadata: {
      mfe: name,
      package: packageName,
    },
  });
}

export { resolveCatalogMfeFromE2e, type CatalogMfe } from './catalog.js';
