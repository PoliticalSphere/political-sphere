// Jest configuration for API app
// Extends root preset with API-specific overrides for ESM support and environment setup
module.exports = {
  displayName: 'api',
  testEnvironment: 'node',
  // Only run ESM test files (.mjs) for consistency with top-level await and ESM syntax
  testMatch: ['**/tests/**/*.test.mjs'],
  // SWC transform for TypeScript and JS, configured for ESM compatibility
  transform: {
    '^.+\\.(js|mjs|ts)$': [
      '@swc/jest',
      {
        module: {
          type: 'commonjs', // Transform to CommonJS for Jest compatibility
        },
        jsc: {
          target: 'es2022',
          parser: {
            syntax: 'typescript',
            tsx: false,
            dynamicImport: true,
            privateMethod: true,
            functionBind: true,
            exportDefaultFrom: true,
            exportNamespaceFrom: true,
            decorators: true,
            decoratorsBeforeExport: true,
            topLevelAwait: false, // Disabled to avoid issues with Jest
            importMeta: false,
          },
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'mjs', 'json'],
  // Transform only a small whitelist of ESM-first packages that Jest can't parse natively.
  // Keep native addons (like better-sqlite3) untransformed to avoid runtime interop issues.
  transformIgnorePatterns: [
    'node_modules/(?!(uuid|gaxios|gcp-metadata|@opentelemetry|@opentelemetry/auto-instrumentations-node)/)',
  ],
  // Module mapping for shared libraries and dependencies
  moduleNameMapper: {
    '^@political-sphere/shared$': '<rootDir>/../../libs/shared/dist/index.js',
    '^uuid$': require.resolve('uuid'),
  },
  // Environment setup - ensure secrets are loaded before module imports
  setupFiles: ['<rootDir>/../../jest.env.js'],
  // Test environment variables (use env vars in production, these are for testing only)
  testEnvironmentOptions: {
    env: {
      JWT_SECRET: process.env.JWT_SECRET || 'test-jwt-secret-for-testing-purposes-only',
      JWT_REFRESH_SECRET:
        process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-for-testing-purposes-only',
    },
  },
};
