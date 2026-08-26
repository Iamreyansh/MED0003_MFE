import path from 'node:path';
import { MFE_SHARED } from '@medmate/federation-config';
import { federation } from '@module-federation/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type UserConfig } from 'vite';
import { medmateStandaloneHtmlPlugin } from './html.js';

export type CreateMfeViteConfigOptions = {
  /** Absolute path to the MFE package root (directory containing vite.config.ts). */
  rootDir: string;
  /** Module Federation remote name (camelCase / lowercase identifier). */
  name: string;
  /** Dev/preview port. */
  port: number;
  /**
   * Federation expose map. Defaults to `src/entrypoints/remote.tsx` as `./Mfe`.
   * Prefer leaving this default so every MFE stays consistent.
   */
  exposes?: Record<string, string>;
  /** Extra Vite overrides merged last. */
  override?: UserConfig;
};

/**
 * Shared Vite + Module Federation bootstrap for every remote MFE.
 * Packages only pass name/port/rootDir — no duplicated federation blocks.
 */
export function createMfeViteConfig(
  options: CreateMfeViteConfigOptions,
): UserConfig {
  const {
    rootDir,
    name,
    port,
    exposes = { './Mfe': './src/entrypoints/remote.tsx' },
    override = {},
  } = options;

  const {
    plugins: overridePlugins = [],
    resolve: overrideResolve,
    build: overrideBuild,
    server: overrideServer,
    preview: overridePreview,
    ...rest
  } = override;

  const repoRoot = path.resolve(rootDir, '../..');
  const outDir = path.resolve(repoRoot, 'dist', name);

  return defineConfig({
    ...rest,
    plugins: [
      react(),
      tailwindcss(),
      medmateStandaloneHtmlPlugin(name, rootDir),
      federation({
        name,
        filename: 'remoteEntry.js',
        manifest: true,
        dts: false,
        exposes,
        shared: { ...MFE_SHARED },
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
      cssCodeSplit: false,
      outDir,
      emptyOutDir: true,
      ...overrideBuild,
    },
    server: {
      ...overrideServer,
      port,
      strictPort: true,
      origin: `http://localhost:${port}`,
      cors: true,
      fs: {
        allow: [repoRoot],
        ...overrideServer?.fs,
      },
    },
    preview: {
      port,
      strictPort: true,
      cors: true,
      ...overridePreview,
    },
    optimizeDeps: {
      entries: ['src/entrypoints/standalone.tsx', 'src/entrypoints/remote.tsx'],
    },
  });
}
