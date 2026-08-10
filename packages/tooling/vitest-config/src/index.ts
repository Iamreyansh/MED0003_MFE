import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type UserConfig } from 'vitest/config';

/** Required coverage bar for all MedMate packages. */
export const COVERAGE_THRESHOLDS = {
  statements: 100,
  branches: 100,
  functions: 100,
  lines: 100,
} as const;

export type CreateVitestConfigOptions = {
  /** Absolute path to the package root. */
  rootDir: string;
  /** jsdom for React packages, node for pure TS libs. */
  environment?: 'jsdom' | 'node';
  /** Relative setup file path(s) from package root. */
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
      environment,
      setupFiles,
      coverage: {
        provider: 'v8',
        thresholds: { ...COVERAGE_THRESHOLDS },
        include: coverageInclude,
        exclude: [
          'src/test/**',
          'src/types/**',
          'src/contract.ts',
          'src/testing/**',
          'src/**/*.d.ts',
          'src/**/*.test.{ts,tsx}',
          'src/**/__tests__/**',
          'bootstrap.tsx',
          'index.tsx',
          ...coverageExclude,
        ],
      },
      ...overrideTest,
    },
  });
}
