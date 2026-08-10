import path from 'node:path';
import {
  REACT_SHARED,
  buildFederationRemotes,
  type EnvRecord,
} from '@medmate/federation-config';
import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import {
  defineConfig,
  loadEnv,
  type UserConfig,
  type UserConfigExport,
} from 'vite';

export type CreateHostViteConfigOptions = {
  rootDir: string;
  /** Federation host name, e.g. pharmacy_portal_host */
  name: string;
  port?: number;
  /** Include Redux in shared scope when remotes need it. */
  shareRedux?: boolean;
  override?: UserConfig;
};

export function createHostViteConfig(
  options: CreateHostViteConfigOptions,
): UserConfigExport {
  const {
    rootDir,
    name,
    port = 5173,
    shareRedux = false,
    override = {},
  } = options;

  return defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_') as EnvRecord;
    const remotes = buildFederationRemotes(env);

    const {
      plugins: overridePlugins = [],
      resolve: overrideResolve,
      build: overrideBuild,
      server: overrideServer,
      ...rest
    } = override;

    return {
      ...rest,
      plugins: [
        react(),
        federation({
          name,
          filename: 'remoteEntry.js',
          remotes,
          shared: {
            ...REACT_SHARED,
            ...(shareRedux
              ? {
                  '@reduxjs/toolkit': {
                    singleton: true,
                    requiredVersion: '^2.8.2',
                  },
                  'react-redux': {
                    singleton: true,
                    requiredVersion: '^9.2.0',
                  },
                }
              : {}),
          },
        }),
        ...overridePlugins,
      ],
      resolve: {
        ...overrideResolve,
        alias: {
          '@': path.resolve(rootDir, './src'),
          ...(overrideResolve?.alias ?? {}),
        },
      },
      build: {
        target: 'chrome89',
        ...overrideBuild,
      },
      server: {
        origin: `http://localhost:${port}`,
        port,
        ...overrideServer,
      },
    };
  });
}
