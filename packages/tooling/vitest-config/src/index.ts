import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type UserConfig } from 'vitest/config';

/** Required coverage bar for all MedMate packages. */
export const COVERAGE_THRESHOLDS = {
  statements: 100,
  branches: 100,
  functions: 100,
  lines: 100,
} as const;

const DEFAULT_JEST_DOM_SETUP = fileURLToPath(
  new URL('./setup.js', import.meta.url),
);

export type CreateVitestConfigOptions = {
  /** Absolute path to the package root. */
  rootDir: string;
  /** jsdom for React packages, node for pure TS libs. */
  environment?: 'jsdom' | 'node';
  /** Extra setup files merged after the shared jest-dom setup (jsdom only). */
  setupFiles?: string | string[];
  /** Extra coverage excludes (merged with defaults). */
  coverageExclude?: string[];
  /** Coverage include globs. */
  coverageInclude?: string[];
  /** Enable React plugin (default true for jsdom). */
  withReact?: boolean;
  /** @deprecated Always 100%. Kept for call-site compatibility. */
  strictCoverage?: boolean;
  override?: UserConfig;
};

/**
 * Shared Vitest bootstrap — package aliases and 100% coverage thresholds.
 */
export function createVitestConfig(
  options: CreateVitestConfigOptions,
): UserConfig {
  const {
    rootDir,
    environment = 'jsdom',
    setupFiles,
    coverageExclude = [],
    coverageInclude = ['src/**/*.{ts,tsx}'],
    withReact = environment === 'jsdom',
    override = {},
  } = options;

  const {
    test: overrideTest,
    plugins: overridePlugins,
    resolve: overrideResolve,
    ...rest
  } = override;

  const extraSetup = setupFiles
    ? Array.isArray(setupFiles)
      ? setupFiles
      : [setupFiles]
    : [];

  const setup =
    environment === 'jsdom'
      ? [DEFAULT_JEST_DOM_SETUP, ...extraSetup]
      : extraSetup;

  return defineConfig({
    ...rest,
    plugins: withReact
      ? [react(), ...(overridePlugins ?? [])]
      : [...(overridePlugins ?? [])],
    resolve: {
      ...overrideResolve,
      alias: {
        '@': path.resolve(rootDir, './src'),
        ...(overrideResolve?.alias ?? {}),
      },
    },
    test: {
      ...overrideTest,
      environment,
      setupFiles: setup.length > 0 ? setup : undefined,
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/e2e/**',
        '**/coverage/**',
        ...(overrideTest?.exclude ?? []),
      ],
      coverage: {
        provider: 'v8',
        thresholds: { ...COVERAGE_THRESHOLDS },
        include: coverageInclude,
        exclude: [
          'src/test/**',
          'src/types/**',
          'src/contract.ts',
          'src/testing/**',
          'src/entrypoints/**',
          'src/**/*.d.ts',
          'src/**/*.test.{ts,tsx}',
          'src/**/__tests__/**',
          'e2e/**',
          'bootstrap.tsx',
          'index.tsx',
          ...coverageExclude,
        ],
      },
    },
  });
}
