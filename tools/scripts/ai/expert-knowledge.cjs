#!/usr/bin/env node
/**
 * Expert Knowledge System
 * Captures and serves expert-level development patterns and solutions
 */

const fs = require("fs");
const path = require("path");

const KNOWLEDGE_DIR = path.join(__dirname, "../../../ai/ai-knowledge");
const EXPERT_KB = path.join(KNOWLEDGE_DIR, "expert-knowledge.json");

class ExpertKnowledge {
	constructor() {
		this.knowledge = this.load();
	}

	load() {
		if (fs.existsSync(EXPERT_KB)) {
			return JSON.parse(fs.readFileSync(EXPERT_KB, "utf8"));
		}
		return this.initializeKnowledge();
	}

	initializeKnowledge() {
		return {
			patterns: {
				errorHandling: {
					express:
						"Use async error wrapper middleware for clean error handling",
					promises:
						"Always use try-catch with async/await or .catch() with promises",
					validation: "Validate input with Zod schemas before processing",
				},
				testing: {
					unitTests:
						"Test pure functions in isolation with mocks for dependencies",
					integration:
						"Test API endpoints with supertest, include auth headers",
					e2e: "Use Playwright for critical user flows, check accessibility",
				},
				security: {
					secrets: "Never hardcode secrets - use env vars with validation",
					input: "Sanitize all user input, escape for SQL/HTML/JS contexts",
					auth: "Verify JWT tokens on protected routes, check permissions",
					headers: "Set security headers: helmet, CORS, CSP",
				},
				performance: {
					database: "Use prepared statements, batch operations, add indexes",
					caching: "Cache expensive operations, set appropriate TTLs",
					async:
						"Use Promise.all for parallel operations, avoid sequential awaits",
					bundling: "Code-split large bundles, lazy load non-critical code",
				},
				architecture: {
					separation:
						"Domain logic in services, HTTP in routes, validation in middleware",
					modularity: "Keep modules focused, single responsibility per file",
					dependencies: "Depend on abstractions, not concrete implementations",
					boundaries: "Respect package boundaries defined in workspace config",
				},
			},
			solutions: {
				commonErrors: {
					ENOENT: "File not found - check path is correct and file exists",
					EADDRINUSE:
						"Port already in use - kill process or use different port",
					MODULE_NOT_FOUND: "Missing dependency - run npm install",
					EACCES:
						"Permission denied - check file permissions or use sudo carefully",
					ECONNREFUSED:
						"Connection refused - ensure service is running on that port",
				},
				testFailures: {
					timeout: "Increase timeout or optimize async operations",
					"snapshot mismatch": "Review changes, update snapshot if intentional",
					"async not resolved": "Ensure all promises are awaited or returned",
					"module mock failed": "Check mock path matches actual import path",
				},
				buildErrors: {
					TypeScript: "Run tsc --noEmit to see full type errors",
					ESLint: "Run npm run lint:fix to auto-fix style issues",
					"import cycle": "Refactor to break circular dependencies",
					"missing types": "Add @types package or declare module types",
				},
			},
			quickFixes: {
				performance: [
					"Run npm run cleanup to kill runaway processes",
					"Clear caches: npm run perf:cache-clear",
					"Restart TypeScript: Cmd+Shift+P → TypeScript: Restart TS Server",
					"Check system load: npm run perf:monitor",
				],
				testing: [
					"Run changed tests only: npm run test:changed",
					"Watch mode for development: npm run test:watch",
					"Full coverage report: npm run test:coverage",
				],
				debugging: [
					"Check recent errors: cat ai/context-bundles/error-patterns.md",
					"Review recent changes: git log -10 --oneline",
					"Check git status: git status --short",
					'Find pattern in code: grep -r "pattern" apps/ libs/',
				],
			},
			bestPractices: {
				commits: [
					"Use conventional commit format: type(scope): message",
					"Keep commits atomic and focused",
					"Reference issues in commit body",
					"Run tests before committing",
				],
				prs: [
					"Keep PRs small and focused (< 400 lines)",
					"Write clear description with context",
					"Include screenshots for UI changes",
					"Add tests for new functionality",
				],
				code: [
					"Write self-documenting code with clear names",
					"Add comments only for non-obvious logic",
					"Extract magic numbers to named constants",
					"Prefer composition over inheritance",
				],
			},
			projectSpecific: {
				fileLocations: {
					api: "apps/api/src/",
					frontend: "apps/frontend/src/",
					shared: "libs/shared/src/",
					tests: "**/__tests__/",
					docs: "docs/",
					configs: "*.config.{js,ts}",
				},
				commands: {
					test: "npm run test:changed",
					lint: "npm run lint:fix",
					build: "npm run build --if-present",
					cleanup: "npm run cleanup",
					typecheck: "npm run type-check",
				},
				conventions: {
					naming: "kebab-case files, PascalCase components, camelCase vars",
					imports: "Use @ aliases for workspace packages",
					exports: "Named exports preferred over default exports",
					async: "Always handle promise rejections",
				},
			},
			expertTips: {
				speed: [
					"Read context bundles before making changes",
					"Use ai:context to refresh project knowledge",
					"Check TODO.md for current priorities",
					"Review ADRs for architectural decisions",
				],
				quality: [
					"Run preflight checks: npm run preflight",
					"Validate accessibility: check WCAG 2.2 AA",
					"Security scan: check for hardcoded secrets",
					"Performance: monitor bundle sizes",
				],
				debugging: [
					"Reproduce issue with minimal example",
					"Check logs for stack traces",
					"Use debugger breakpoints, not console.log",
					"Validate assumptions with tests",
				],
			},
			lastUpdated: new Date().toISOString(),
		};
	}

	save() {
		fs.mkdirSync(path.dirname(EXPERT_KB), { recursive: true });
		fs.writeFileSync(EXPERT_KB, JSON.stringify(this.knowledge, null, 2));
	}

	// Query methods for fast lookups
	getPattern(category, subcategory) {
		return this.knowledge.patterns[category]?.[subcategory];
	}

	getSolution(category, issue) {
		return this.knowledge.solutions[category]?.[issue];
	}

	getQuickFix(category) {
		return this.knowledge.quickFixes[category];
	}

	getBestPractice(category) {
		return this.knowledge.bestPractices[category];
	}

	getProjectInfo(category) {
		return this.knowledge.projectSpecific[category];
	}

	// Smart search across all knowledge
	search(query) {
		const results = [];
		const lowerQuery = query.toLowerCase();

		// Search patterns
		Object.entries(this.knowledge.patterns).forEach(([cat, items]) => {
			Object.entries(items).forEach(([key, value]) => {
				if (
					key.toLowerCase().includes(lowerQuery) ||
					value.toLowerCase().includes(lowerQuery)
				) {
					results.push({ type: "pattern", category: cat, key, value });
				}
			});
		});

		// Search solutions
		Object.entries(this.knowledge.solutions).forEach(([cat, items]) => {
			Object.entries(items).forEach(([key, value]) => {
				if (
					key.toLowerCase().includes(lowerQuery) ||
					value.toLowerCase().includes(lowerQuery)
				) {
					results.push({
						type: "solution",
						category: cat,
						issue: key,
						solution: value,
					});
				}
			});
		});

		return results;
	}

	// Add new knowledge (learning capability)
	learn(category, subcategory, knowledge) {
		if (!this.knowledge.patterns[category]) {
			this.knowledge.patterns[category] = {};
		}
		this.knowledge.patterns[category][subcategory] = knowledge;
		this.knowledge.lastUpdated = new Date().toISOString();
		this.save();
	}
}

// CLI interface
if (require.main === module) {
	const kb = new ExpertKnowledge();
	const command = process.argv[2];

	switch (command) {
		case "init":
			kb.save();
			console.log("Expert knowledge base initialized");
			break;
		case "search": {
			const query = process.argv.slice(3).join(" ");
			const results = kb.search(query);
			console.log(`Found ${results.length} results for "${query}":`);
			results.forEach((r) => console.log(`- ${r.type}: ${JSON.stringify(r)}`));
			break;
		}
		case "pattern": {
			const [cat, subcat] = process.argv.slice(3);
			const pattern = kb.getPattern(cat, subcat);
			console.log(pattern || "Pattern not found");
			break;
		}
		default:
			console.log("Expert Knowledge System");
			console.log("Commands:");
			console.log("  init           - Initialize knowledge base");
			console.log("  search <query> - Search all knowledge");
			console.log("  pattern <cat> <subcat> - Get specific pattern");
	}
}

module.exports = ExpertKnowledge;
