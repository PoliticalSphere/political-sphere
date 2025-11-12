// @ts-check

import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const projectRoot = fileURLToPath(new URL('.', import.meta.url)); // Works where __dirname is undefined (Vitest extension, ESM)

/** @type {import('vitest/config').UserConfig} */
const config = {
  test: {
    globals: false,
    environment: process.env.VITEST_ENV || 'node',
    testTimeout: 15000,
    exclude: [
      '**/node_modules/**',
      '**/e2e/**',
      '**/playwright.config.js',
      // Exclude Playwright tests, a11y suites and tooling tests from Vitest collector
      'tools/**',
      // Exclude Node.js native test runner files (use node:test instead)
      'libs/shared/src/path-security.test.mjs',
      // Performance: exclude cache and build directories
      '**/.nx/**',
      '**/.vitest/**',
      '**/.playwright/**',
      '**/.turbo/**',
      '**/.temp/**',
      '**/.bh/**',
      '**/.biome-home/**',
      '**/dist/**',
      '**/coverage/**',
      '**/test-results/**',
      '**/reports/**',
      '**/logs/**',
      '**/app-audit/**',
      '**/github-audit/**',
      '**/openapi-audit/**',
      '**/devcontainer-audit/**',
      '**/*.log',
      '**/*.db',
      '**/*.db-shm',
      '**/*.db-wal',
    ],
    include:
      process.env.VITEST_SCOPE === 'shared'
        ? ['libs/shared/src/__tests__/**/*.{test,spec}.{js,mjs,ts,tsx,jsx,tsx}']
        : ['**/*.{test,spec}.{js,mjs,ts,tsx,jsx,tsx}'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      // Measure coverage across the entire codebase for full project assessment
      all: true,
      // Include all source files across apps and libs
      include: ['apps/*/src/**/*.{js,ts,jsx,tsx}', 'libs/*/src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        'tools/**',
        'ai/**',
        'docs/**',
        '**/__tests__/**',
        '**/tests/**',
        '**/*.test.{js,ts,jsx,tsx}',
        '**/*.spec.{js,ts,jsx,tsx}',
        // Exclude migration and setup files
        '**/migrations/**',
        '**/migrations.{js,ts}',
        // Exclude frontend JSX files - need proper Babel config
        'apps/frontend/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    // Use threads for better performance while maintaining isolation
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    maxThreads: 4,
    minThreads: 1,
    setupFiles: ['./tools/testing/test-env-setup.ts'],
    // Performance: disable unnecessary features
    reporters: process.env.CI ? ['default'] : ['verbose'],
    silent: false,
    ui: false,
    open: false,
    // Enable parallel execution for faster test runs
    sequence: {
      hooks: 'parallel',
    },
    // Add caching to speed up repeated test runs (use Vite's cacheDir)
    // NOTE: Vitest deprecated test.cache.dir; use top-level cacheDir instead.
    // We'll set cacheDir at the root of this config object below.
    // Enable changed mode for faster development feedback
    // Default to disabled to ensure CI and coverage runs execute all tests.
    // Opt-in by setting VITEST_CHANGED=1 in dev tasks.
    changed: process.env.VITEST_CHANGED === '1',
  },
  // Use Vite's cache directory; Vitest will nest under this path automatically
  cacheDir: '.vitest/cache',
  resolve: {
    alias: {
      '@political-sphere/shared': resolve(projectRoot, 'libs/shared/cjs-shared.cjs'),
      '@political-sphere/ui': resolve(projectRoot, 'libs/ui/src'),
      '@political-sphere/platform': resolve(projectRoot, 'libs/platform/src'),
      '@political-sphere/ci-utils': resolve(projectRoot, 'libs/ci/src'),
      '@political-sphere/infrastructure': resolve(projectRoot, 'libs/infrastructure/src'),
      '@political-sphere/game-engine': resolve(projectRoot, 'libs/game-engine/src'),
    },
  },
};

export default defineConfig(config);
