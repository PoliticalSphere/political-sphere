// CommonJS-friendly shim for @political-sphere/shared used in tests
// Exposes logger utilities from the JS implementation and provides
// minimal schema stubs for API route validation used in tests.

const logger = require("./src/logger.js");

// Improved schema stubs with basic validation for test compatibility
function createSchema(requiredFields = []) {
	return {
		parse: (input) => {
			if (!input || typeof input !== "object" || Array.isArray(input)) {
				throw new Error("Input must be an object");
			}
			for (const field of requiredFields) {
				if (
					!(field in input) ||
					input[field] === undefined ||
					input[field] === null ||
					input[field] === ""
				) {
					throw new Error(`Missing required field: ${field}`);
				}
			}
			return input;
		},
		safeParse: (input) => {
			try {
				const data = createSchema(requiredFields).parse(input);
				return { success: true, data };
			} catch (error) {
				return { success: false, error };
			}
		},
	};
}

// Basic validators used by API services (simplified test-safe versions)
const ALLOWED_CATEGORIES = new Set([
	"politics",
	"economy",
	"social",
	"technology",
	"environment",
	"health",
	"finance",
	"governance",
	"policy",
	"general",
]);

function sanitizeHtml(input) {
	if (typeof input !== "string") return "";
	return input
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#x27;")
		.replace(/\//g, "&#x2F;");
}

function isValidInput(input) {
	if (typeof input !== "string") return false;
	const dangerousPatterns = [
		/<script/i,
		/javascript:/i,
		/on\w+\s*=/i,
		/eval\(/i,
		/expression\(/i,
		/vbscript:/i,
		/\.\.\//,
		/SELECT.*FROM/i,
		/UNION.*SELECT/i,
		/INSERT.*INTO/i,
		/DROP.*TABLE/i,
		/DELETE.*FROM/i,
		/UPDATE.*SET/i,
		/\bOR\b\s+['"]?\s*1\s*=\s*1/i,
		/['"]\s*OR\s*['"]?1['"]?\s*=\s*['"]?1/i,
		/\bor\b\s+1\s*=\s*1/i,
	];
	return !dangerousPatterns.some((p) => p.test(input));
}

function isValidLength(input, min, max) {
	if (typeof input !== "string") return false;
	const len = input.trim().length;
	return len >= (min ?? 0) && len <= (max ?? Infinity);
}

function validateCategory(category) {
	if (typeof category !== "string") return false;
	const c = category.trim().toLowerCase();
	return ALLOWED_CATEGORIES.has(c) ? c : false;
}

function validateTag(tag) {
	if (typeof tag !== "string") return false;
	const t = tag.trim();
	if (!t) return false;
	// allow letters, numbers, hyphen and underscore
	return /^[a-zA-Z0-9-_]+$/.test(t) ? t : false;
}

function isValidUrl(url, allowedProtocols = ["https"]) {
	try {
		const u = new URL(url);
		const proto = u.protocol.replace(":", "");
		return allowedProtocols.includes(proto);
	} catch {
		return false;
	}
}

module.exports = {
	// Re-export logger APIs used across tests
	createLogger: logger.createLogger,
	getLogger: logger.getLogger,

	// Provide validation schemas for API routes with basic required field checks
	CreateUserSchema: createSchema(["username", "email"]),
	CreateBillSchema: createSchema(["title", "proposerId"]),
	CreateVoteSchema: createSchema(["billId", "userId", "vote"]),
	CreatePartySchema: createSchema(["name"]),

	// Security/validation helpers
	sanitizeHtml,
	isValidInput,
	isValidLength,
	validateCategory,
	validateTag,
	isValidUrl,

	// --- Security helpers (test-safe implementations) ---
	// Minimal CORS and security header helpers to support server.js in tests
	SECURITY_HEADERS: {
		"X-Content-Type-Options": "nosniff",
		"X-Frame-Options": "DENY",
		"Referrer-Policy": "no-referrer",
		"X-XSS-Protection": "0",
		"Permissions-Policy": "geolocation=()",
		"Cross-Origin-Opener-Policy": "same-origin",
		"Cross-Origin-Resource-Policy": "same-origin",
	},
	getCorsHeaders(origin, options = {}) {
		const headers = {
			Vary: "Origin",
			"Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Max-Age": "600",
		};
		if (origin) headers["Access-Control-Allow-Origin"] = origin;
		if (
			Array.isArray(options.exposedHeaders) &&
			options.exposedHeaders.length
		) {
			headers["Access-Control-Expose-Headers"] =
				options.exposedHeaders.join(", ");
		}
		return headers;
	},
	// Very simple in-memory rate limiter sufficient for tests
	_rateState: new Map(),
	checkRateLimit(key, { maxRequests = 100, windowMs = 15 * 60 * 1000 } = {}) {
		if (!key) return false;
		const now = Date.now();
		const entry = this._rateState.get(key);
		if (!entry || now - entry.first > windowMs) {
			this._rateState.set(key, { count: 1, first: now });
			return true;
		}
		if (entry.count < maxRequests) {
			entry.count += 1;
			return true;
		}
		return false;
	},
	getRateLimitInfo(key, { maxRequests = 100, windowMs = 15 * 60 * 1000 } = {}) {
		const now = Date.now();
		const entry = this._rateState.get(key) || { count: 0, first: now };
		const resetInMs = Math.max(0, entry.first + windowMs - now);
		return {
			remaining: Math.max(0, maxRequests - entry.count),
			reset: Math.ceil(resetInMs / 1000),
			limit: maxRequests,
		};
	},
	isIpAllowed(ip, blocklist = []) {
		if (!ip || typeof ip !== "string") return false;
		return !blocklist.includes(ip);
	},
};
