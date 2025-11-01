#!/usr/bin/env bash
# Fetch the latest ai-index from the ai-index-cache branch into the working tree.
# Usage: scripts/ai/fetch-index.sh [--branch BRANCH] [--force]

set -euo pipefail
BRANCH="ai-index-cache"
FORCE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch) BRANCH="$2"; shift 2 ;;
    --force) FORCE=1; shift ;;
    -h|--help) echo "Usage: $0 [--branch BRANCH] [--force]"; exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

# Ensure git repo
if [ ! -d .git ]; then
  echo "Not a git repository. Run from repo root." >&2
  exit 2
fi

# Fetch branch
echo "Fetching branch $BRANCH from origin..."
git fetch origin $BRANCH || true

# Check if branch exists on remote
if ! git ls-remote --exit-code --heads origin $BRANCH >/dev/null 2>&1; then
  echo "Remote branch $BRANCH not found. Nothing to fetch." >&2
  exit 0
fi

# Create a temporary worktree to extract ai-index
TMPDIR=$(mktemp -d)
cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

# Use git worktree to checkout the remote branch content
git worktree add -f "$TMPDIR" origin/$BRANCH

# Copy ai-index into current repo (merge carefully)
if [ -d "$TMPDIR/ai-index" ]; then
  if [ -d ai-index ] && [ $FORCE -eq 0 ]; then
    echo "ai-index already exists locally. Use --force to overwrite." >&2
    exit 1
  fi
  rm -rf ai-index || true
  cp -r "$TMPDIR/ai-index" ./ai-index
  echo "ai-index fetched to ./ai-index"
else
  echo "No ai-index directory found on branch $BRANCH" >&2
fi

# Cleanup worktree
git worktree remove --force "$TMPDIR" || true

exit 0
