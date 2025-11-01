#!/usr/bin/env bash
# Enhanced smoke test for AI tooling with error handling and metrics
set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)
cd "$ROOT"

echo "🚀 Running enhanced smoke tests for AI tooling..."

# Function to run command with timeout and error handling
run_with_timeout() {
    local cmd="$1"
    local timeout="${2:-300}"  # 5 minutes default
    local description="$3"

    echo "Running: $description"
    # Use a simple timeout implementation for macOS compatibility
    if ( bash -c "$cmd" & sleep "$timeout"; kill $! 2>/dev/null ) &>/dev/null; then
        wait $! 2>/dev/null
        local exit_code=$?
        if [ $exit_code -eq 0 ]; then
            echo "✅ $description passed"
            return 0
        else
            echo "❌ $description failed" >&2
            return 1
        fi
    else
        echo "❌ $description timed out after ${timeout}s" >&2
        return 1
    fi
}

# Test AI tooling components
run_with_timeout "node ./scripts/ai/code-indexer.js build --incremental" 180 "Code indexer build" || exit 1
run_with_timeout "node ./scripts/ai/pre-cache.js" 120 "Pre-cache initialization" || exit 1
run_with_timeout "node ./scripts/ai/context-preloader.js preload" 180 "Context preloader" || exit 1
run_with_timeout "node ./scripts/ai/competence-monitor.js assess" 60 "Competence assessment" || exit 1
run_with_timeout "node ./scripts/ai/performance-monitor.js" 30 "Performance monitoring" || exit 1

# Enhanced file and directory checks
echo "🔍 Checking AI tooling artifacts..."

checks_passed=true

# Check directories
for dir in ai-index ai-cache ai-cache/contexts ai-knowledge ai-learning ai-metrics; do
    if [ ! -d "$dir" ]; then
        echo "❌ Directory missing: $dir" >&2
        checks_passed=false
    else
        echo "✅ Directory exists: $dir"
    fi
done

# Check files
for file in ai-index/codebase-index.json ai-cache/cache.json ai-metrics.json; do
    if [ ! -f "$file" ]; then
        echo "❌ File missing: $file" >&2
        checks_passed=false
    else
        echo "✅ File exists: $file"
    fi
done

# Check file sizes (basic sanity check)
for file in ai-index/codebase-index.json ai-cache/cache.json; do
    if [ -f "$file" ] && [ "$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)" -lt 100 ]; then
        echo "⚠️  File seems too small: $file" >&2
    fi
done

# Validate JSON files
for file in ai-index/codebase-index.json ai-cache/cache.json ai-metrics.json; do
    if [ -f "$file" ] && ! jq empty "$file" 2>/dev/null; then
        echo "❌ Invalid JSON in: $file" >&2
        checks_passed=false
    fi
done

# Check AI metrics for recent activity
if [ -f ai-metrics.json ]; then
    recent_runs=$(jq '.scriptRuns | length' ai-metrics.json 2>/dev/null || echo 0)
    if [ "$recent_runs" -eq 0 ]; then
        echo "⚠️  No recent AI script runs recorded in metrics" >&2
    else
        echo "✅ AI metrics show $recent_runs recent script runs"
    fi
fi

if [ "$checks_passed" = true ]; then
    echo ""
    echo "🎉 All smoke tests passed! AI tooling is ready."
    exit 0
else
    echo ""
    echo "❌ Some smoke tests failed. Check output above."
    exit 1
fi
