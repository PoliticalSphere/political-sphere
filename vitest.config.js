/// <reference types="vitest" />

import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		exclude: ["**/node_modules/**", "**/e2e/**", "**/playwright.config.js"],
		include: ["**/*.{test,spec}.{js,mjs,ts,tsx}"],
		coverage: {
			reporter: ["text", "json", "html"],
			exclude: ["node_modules/", "dist/", "**/*.d.ts", "**/*.config.{js,ts}"],
			thresholds: {
				global: {
					branches: 80,
					functions: 80,
					lines: 80,
					statements: 80,
				},
			},
		},
		pool: "threads",
		maxThreads: 4,
		minThreads: 1,
		setupFiles: ["./tools/test-setup.ts"],
	},
	resolve: {
		alias: {
			"@political-sphere/shared": resolve(__dirname, "libs/shared/src/index.ts"),
			"@political-sphere/ui": resolve(__dirname, "libs/ui/src"),
			"@political-sphere/platform": resolve(__dirname, "libs/platform/src"),
			"@political-sphere/ci-utils": resolve(__dirname, "libs/ci/src"),
			"@political-sphere/infrastructure": resolve(
				__dirname,
				"libs/infrastructure/src",
			),
			"@political-sphere/game-engine": resolve(__dirname, "libs/game-engine/src"),
		},
	},
});
