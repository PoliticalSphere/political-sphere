// ESM shim to align legacy JS entry with the new TypeScript app factory
// Export only the Express app from the TS source. Avoid re-exporting TS store modules
// to prevent Node from importing TypeScript directly in environments that bypass Vite.
export { app } from "./app.ts";
