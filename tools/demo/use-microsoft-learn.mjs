#!/usr/bin/env node
// Demo client that queries the local Microsoft Learn MCP stub
const BASE = process.env.MCP_URL || "http://localhost:4016";

async function main() {
  try {
    console.log("Querying Microsoft Learn MCP at", BASE);
    const health = await fetch(`${BASE}/health`, { timeout: 2000 }).then((r) => r.json());
    console.log("health:", health);

    const info = await fetch(`${BASE}/info`, { timeout: 2000 }).then((r) => r.json());
    console.log("info:", info);

    const modules = await fetch(`${BASE}/modules`, { timeout: 5000 }).then((r) => r.json());
    console.log("modules count:", modules.count);
    for (const m of modules.modules) {
      console.log(`- [${m.id}] ${m.title} (${m.estimatedMinutes}m) -> ${m.url}`);
    }
  } catch (err) {
    console.error("Error querying MCP:", err && err.stack ? err.stack : err);
    process.exitCode = 2;
  }
}

main();
