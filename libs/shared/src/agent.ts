export const SANDBOX = process.env["AI_SANDBOX"] === "1";
// Agents must NOOP any destructive operations when SANDBOX=1 and emit a plan instead.
