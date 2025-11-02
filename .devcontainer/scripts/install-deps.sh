#!/usr/bin/env bash
# Robust dependency installation for Dev Container
# - Skips when node_modules already populated
# - Prefers npm ci; falls back to npm install on lock issues
# - Avoids audit/network noise for speed

set -euo pipefail

# Work in the workspace root (Dev Container sets CWD there)
ROOT_DIR=$(pwd)

# Fast-path: if node_modules exists and is populated, skip
if [ -d "$ROOT_DIR/node_modules" ]; then
  count=$(ls -1 "$ROOT_DIR/node_modules" | wc -l | tr -d ' ' || echo 0)
  if [ "$count" -gt 100 ]; then
    echo "📦 node_modules already present ($count entries) — skipping install"
    exit 0
  fi
fi

# Ensure clean partial installs don't confuse npm
# If a previous npm ci was interrupted, clear stale lock state by removing
# the npm-internal lockfile artifacts but keep package-lock.json intact initially.

run_npm_ci() {
  echo "▶️  Running: npm ci --prefer-offline --no-audit"
  npm ci --prefer-offline --no-audit
}

run_npm_install() {
  echo "▶️  Running: npm install --no-audit"
  npm install --no-audit
}

# Try npm ci first; on ECOMPROMISED or non-zero, fallback to npm install.
if run_npm_ci; then
  echo "✅ npm ci completed"
  exit 0
else
  status=$?
  echo "⚠️  npm ci failed with status $status — attempting npm install fallback"
  # Some failures are due to a compromised/invalid lockfile; try install fallback.
  if ! run_npm_install; then
    echo "❌ npm install also failed. Printing npm version and last log snippet for debugging:"
    npm -v || true
    node -v || true
    # Show last error log if present
    last_log=$(ls -t /home/node/.npm/_logs/* 2>/dev/null | head -n1 || true)
    if [ -n "$last_log" ] && [ -f "$last_log" ]; then
      echo "--- Begin npm log ($last_log) tail ---"
      tail -n 50 "$last_log" || true
      echo "--- End npm log tail ---"
    fi
    exit 1
  else
    echo "✅ npm install completed (fallback)"
  fi
fi
