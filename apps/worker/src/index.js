// Prefer the shared telemetry helper so the worker uses a single source of truth.
// Fall back to a lightweight local logger if the shared logger cannot be imported.
import { startTelemetry, getLogger } from "@political-sphere/shared";
const sharedLogger = getLogger({ service: "worker" });

try {
  // startTelemetry returns a Promise that resolves when the SDK is started
  // We don't fail the worker startup if telemetry fails, but we try to initialize it.
  await startTelemetry({
    serviceName: "political-sphere-worker",
    serviceVersion: process.env.APP_VERSION || "0.0.0",
    environment: process.env.NODE_ENV || "development",
  });
} catch (err) {
  // Telemetry is best-effort in dev; log the issue and continue
  const tempLogger = {
    error: (msg, meta) => console.error(JSON.stringify({ level: "ERROR", message: msg, ...meta })),
  };
  tempLogger.error("Shared telemetry initialization failed (continuing)", {
    error: err?.message ?? err,
  });
}

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import process from "node:process";

import { summarizeNews } from "./aggregator.js";
import { API_URL, INTERVAL, OUTPUT_PATH } from "./config.js";
// Prefer the shared logger when available, otherwise fall back to a compact local logger.
const _localLogger = {
  info: (msg, meta) => console.log(JSON.stringify({ level: "INFO", message: msg, ...meta })),
  warn: (msg, meta) => console.warn(JSON.stringify({ level: "WARN", message: msg, ...meta })),
  error: (msg, meta) => console.error(JSON.stringify({ level: "ERROR", message: msg, ...meta })),
};
const logger =
  sharedLogger && typeof sharedLogger.info === "function" ? sharedLogger : _localLogger;

let intervalId;

async function persistSummary(summary) {
  try {
    await mkdir(dirname(OUTPUT_PATH), { recursive: true });
    await writeFile(OUTPUT_PATH, JSON.stringify(summary, null, 2), "utf8");
  } catch (err) {
    // Log and continue; persistence failures should not crash the worker
    logger.error("Failed to persist summary", { error: err?.message || err });
  }
}

async function fetchUpdates() {
  try {
    const response = await fetch(new URL("/api/news", API_URL));
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }
    const payload = await response.json();
    const items = Array.isArray(payload.data) ? payload.data : [];
    const summary = summarizeNews(items);
    await persistSummary(summary);
    logger.info("Processed news stories", {
      total: summary.total,
      latestUpdate: summary.latest?.updatedAt ?? "n/a",
      outputPath: OUTPUT_PATH,
    });
  } catch (error) {
    logger.error("Failed to call API", { error: error.message, apiUrl: API_URL });
  }
}

function start() {
  logger.info("Worker started", { apiUrl: API_URL, intervalMs: INTERVAL });
  intervalId = setInterval(fetchUpdates, INTERVAL);
  fetchUpdates().catch((error) => logger.error("Initial fetch failed", { error: error.message }));
}

function shutdown() {
  logger.info("Received termination signal, shutting down");
  if (intervalId) {
    clearInterval(intervalId);
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();
