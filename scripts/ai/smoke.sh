#!/usr/bin/env bash
# Simple smoke test for AI tooling
set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)
cd "$ROOT"

echo "Running smoke tests: code-indexer, pre-cache, context-preloader, competence-monitor, performance-monitor"
node ./scripts/ai/code-indexer.js build
node ./scripts/ai/pre-cache.js
node ./scripts/ai/context-preloader.js preload
node ./scripts/ai/competence-monitor.js assess
node ./scripts/ai/performance-monitor.js

# Basic file checks
if [ ! -d ai-index ]; then
  echo "ai-index directory missing" >&2
  exit 2
fi
if [ ! -f ai-cache/cache.json ]; then
  echo "ai-cache/cache.json missing" >&2
  exit 2
fi
if [ ! -d ai-cache/contexts ]; then
  echo "ai-cache/contexts missing" >&2
  exit 2
fi

echo "Smoke tests passed"
