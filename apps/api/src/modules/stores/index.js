// ESM shim to align legacy JS imports with the TypeScript implementation
// Re-export named APIs from the TypeScript source so tooling that touches
// this file (coverage instrumentation, older tests) resolves cleanly.
export { getDatabase, closeDatabase } from "./index.ts";
