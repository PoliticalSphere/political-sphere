// Test utilities for Political Sphere API tests
// Provides reusable helpers for database setup, mocking, and assertions

import express from "express";
import request from "supertest";
import { closeDatabase, getDatabase } from "../../src/stores";

/**
 * Database test utilities
 */
export const dbHelpers = {
	/**
	 * Initialize database for tests
	 * @returns {Object} Database instance
	 */
	async setupDatabase() {
		return getDatabase();
	},

	/**
	 * Clean up database after tests
	 */
	async teardownDatabase() {
		closeDatabase();
	},

	/**
	 * Create a test user with default values
	 * @param {Object} overrides - Properties to override defaults
	 * @returns {Object} Created user
	 */
	async createTestUser(overrides = {}) {
		const db = getDatabase();
		const userData = {
			username: `testuser_${Date.now()}`,
			email: `test${Date.now()}@example.com`,
			...overrides,
		};
		return db.users.create(userData);
	},

	/**
	 * Create a test party with default values
	 * @param {Object} overrides - Properties to override defaults
	 * @returns {Object} Created party
	 */
	async createTestParty(overrides = {}) {
		const db = getDatabase();
		const partyData = {
			name: `Test Party ${Date.now()}`,
			description: "A test political party",
			color: "#FF6B6B",
			...overrides,
		};
		return db.parties.create(partyData);
	},

	/**
	 * Create a test bill with default values
	 * @param {Object} overrides - Properties to override defaults
	 * @returns {Object} Created bill
	 */
	async createTestBill(overrides = {}) {
		const db = getDatabase();
		const billData = {
			title: `Test Bill ${Date.now()}`,
			description: "A test bill for political simulation",
			proposerId: overrides.proposerId || (await this.createTestUser()).id,
			...overrides,
		};
		return db.bills.create(billData);
	},
};

/**
 * HTTP request utilities
 */
export const httpHelpers = {
	/**
	 * Create supertest agent with common middleware
	 * @param {Object} app - Express app instance
	 * @returns {Object} Supertest agent
	 */
	createTestAgent(app) {
		// Add common test middleware
		app.use((req, res, next) => {
			// Debug logging in test mode
			if (process.env.NODE_ENV === "test") {
				console.debug("[test] incoming headers:", req.headers);
			}
			next();
		});

		// Custom body parser for test environment
		app.use(express.text({ type: "*/*" }));
		app.use((req, res, next) => {
			try {
				if (typeof req.body === "string" && req.body.length > 0) {
					req.body = JSON.parse(req.body);
				}
				return next();
			} catch (err) {
				return next(err);
			}
		});

		return request(app);
	},

	/**
	 * Set common headers for API requests
	 * @param {Object} request - Supertest request object
	 * @returns {Object} Request with headers set
	 */
	setApiHeaders(request) {
		return request.set("Content-Type", "application/json; charset=utf-8");
	},
};

/**
 * Mock utilities
 */
export const mockHelpers = {
	/**
	 * Create mock user data
	 * @param {Object} overrides - Properties to override defaults
	 * @returns {Object} Mock user data
	 */
	createMockUser(overrides = {}) {
		return {
			id: `user_${Date.now()}`,
			username: `mockuser_${Date.now()}`,
			email: `mock${Date.now()}@example.com`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			...overrides,
		};
	},

	/**
	 * Create mock bill data
	 * @param {Object} overrides - Properties to override defaults
	 * @returns {Object} Mock bill data
	 */
	createMockBill(overrides = {}) {
		return {
			id: `bill_${Date.now()}`,
			title: `Mock Bill ${Date.now()}`,
			description: "A mock bill for testing",
			proposerId: `user_${Date.now()}`,
			status: "proposed",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			...overrides,
		};
	},
};
