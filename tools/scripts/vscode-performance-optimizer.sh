#!/usr/bin/env bash
# =============================================================================
# VS Code Performance Optimizer
# =============================================================================
# @artifact-name: VS Code Performance Optimizer
# @artifact-purpose: Automated cleanup of cache, logs, and build artifacts
# @artifact-type: maintenance-script
# @artifact-category: development-tools
# @artifact-criticality: low
# @artifact-owner: engineering
# @artifact-scope: workspace
# @artifact-features: [performance-optimization, cache-management]
# =============================================================================

set -euo pipefail

WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "🚀 VS Code Performance Optimizer"
echo "================================="
echo ""

# Function to get directory size safely
get_dir_size() {
    local dir=$1
    if [ -d "$dir" ]; then
        du -sh "$dir" 2>/dev/null | awk '{print $1}' || echo "0B"
    else
        echo "N/A"
    fi
}

# Track cleaned size
total_cleaned=0

echo "📊 Current state:"
echo "  .nx cache:        $(get_dir_size "$WORKSPACE_ROOT/.nx")"
echo "  coverage:         $(get_dir_size "$WORKSPACE_ROOT/coverage")"
echo "  test-results:     $(get_dir_size "$WORKSPACE_ROOT/test-results")"
echo "  reports:          $(get_dir_size "$WORKSPACE_ROOT/reports")"
echo "  logs:             $(get_dir_size "$WORKSPACE_ROOT/logs")"
echo ""

echo "🧹 Cleaning cache and build artifacts..."

# Clean Nx cache
if [ -d "$WORKSPACE_ROOT/.nx" ]; then
    rm -rf "$WORKSPACE_ROOT/.nx"
    echo "  ✓ Removed .nx cache"
fi

# Clean coverage
if [ -d "$WORKSPACE_ROOT/coverage" ]; then
    rm -rf "$WORKSPACE_ROOT/coverage"
    echo "  ✓ Removed coverage"
fi

# Clean test results
if [ -d "$WORKSPACE_ROOT/test-results" ]; then
    rm -rf "$WORKSPACE_ROOT/test-results"
    echo "  ✓ Removed test-results"
fi

# Clean reports (keep structure)
if [ -d "$WORKSPACE_ROOT/reports" ]; then
    find "$WORKSPACE_ROOT/reports" -type f \( -name "*.json" -o -name "*.log" -o -name "*.txt" \) -delete 2>/dev/null || true
    echo "  ✓ Cleaned reports directory"
fi

# Clean logs (keep directory structure)
if [ -d "$WORKSPACE_ROOT/logs" ]; then
    find "$WORKSPACE_ROOT/logs" -type f -name "*.log" -delete 2>/dev/null || true
    echo "  ✓ Cleaned logs directory"
fi

# Clean temporary directories
for temp_dir in .temp .bh .biome-home .vitest .playwright .turbo; do
    if [ -d "$WORKSPACE_ROOT/$temp_dir" ]; then
        rm -rf "$WORKSPACE_ROOT/$temp_dir"
        echo "  ✓ Removed $temp_dir"
    fi
done

# Clean tsbuildinfo files
find "$WORKSPACE_ROOT" -name "*.tsbuildinfo" -type f -delete 2>/dev/null || true
echo "  ✓ Removed *.tsbuildinfo files"

# Clean audit directories
for audit_dir in app-audit github-audit openapi-audit devcontainer-audit; do
    if [ -d "$WORKSPACE_ROOT/$audit_dir" ]; then
        rm -rf "$WORKSPACE_ROOT/$audit_dir"
        echo "  ✓ Removed $audit_dir"
    fi
done

# Clean node_modules cache
if [ -d "$WORKSPACE_ROOT/node_modules/.cache" ]; then
    rm -rf "$WORKSPACE_ROOT/node_modules/.cache"
    echo "  ✓ Cleaned node_modules/.cache"
fi

if [ -d "$WORKSPACE_ROOT/node_modules/.vite" ]; then
    rm -rf "$WORKSPACE_ROOT/node_modules/.vite"
    echo "  ✓ Cleaned node_modules/.vite"
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "💡 Performance tips:"
echo "  1. Reload VS Code window (Cmd+Shift+P → 'Reload Window')"
echo "  2. Close unused editor tabs (limit: 6 tabs)"
echo "  3. Disable unused extensions temporarily"
echo "  4. Run this script weekly: npm run perf:cleanup"
echo ""
