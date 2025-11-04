import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

// Global test setup
beforeAll(() => {
  // Setup global test environment
  process.env.NODE_ENV = "test";
  process.env.FAST_AI = "1"; // Speed up tests
});

afterAll(() => {
  // Cleanup global test environment
});

beforeEach(() => {
  // Reset any global state before each test
});

afterEach(() => {
  // Cleanup after each test
});

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});
