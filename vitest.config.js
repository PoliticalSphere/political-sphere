/// <reference types="vitest" />

import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		testTimeout: 20000,
		exclude: [
			"**/node_modules/**",
			"**/e2e/**",
			"**/playwright.config.js",
			// Exclude Playwright tests, a11y suites and tooling tests from Vitest collector
			"tools/**",
		],
		include: ["**/*.{test,spec}.{js,mjs,ts,tsx}"],
		coverage: {
			provider: "istanbul",
			reporter: ["text", "json", "html"],
			// Ensure all relevant server-side source files are considered and source maps are used
			all: true,
			// Include server (api & game-server) and shared library source files (JS/TS)
			include: [
				"apps/api/src/**/*.{js,ts}",
				"apps/game-server/src/**/*.{js,ts}",
				"libs/**/src/**/*.{js,ts}",
			],
			exclude: [
				"node_modules/",
				"dist/",
				"**/*.d.ts",
				"**/*.config.{js,ts}",
				"tools/**",
				"ai/**",
				"docs/**",
				"**/__tests__/**",
			],
			sourceMap: true,
			// Raise thresholds to the new target (90%) — we'll iterate toward this.
			thresholds: {
				global: {
					branches: 90,
					functions: 90,
					lines: 90,
					statements: 90,
				},
			},
		},
		// Use threads for all runs to support ES modules and improve performance
		pool: "threads",
		maxThreads: 4,
		minThreads: 1,
		setupFiles: ["./tools/test-setup.ts"],
		// Add caching to speed up repeated test runs
		cacheDir: ".vitest",
	},
	resolve: {
		alias: {
			"@political-sphere/shared": resolve(
				__dirname,
				"libs/shared/src/index.ts",
			),
			"@political-sphere/ui": resolve(__dirname, "libs/ui/src"),
			"@political-sphere/platform": resolve(__dirname, "libs/platform/src"),
			"@political-sphere/ci-utils": resolve(__dirname, "libs/ci/src"),
			"@political-sphere/infrastructure": resolve(
				__dirname,
				"libs/infrastructure/src",
			),
			"@political-sphere/game-engine": resolve(
				__dirname,
				"libs/game-engine/src",
			),
		},
	},
});
