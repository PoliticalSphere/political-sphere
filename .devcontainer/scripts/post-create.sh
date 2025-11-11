#!/usr/bin/env bash
set -euo pipefail

echo "📦 Installing Python tooling (DVC & friends)..."
if [[ -f requirements-dev.txt ]]; then
  python3 -m pip install --user --upgrade pip
  python3 -m pip install --user -r requirements-dev.txt
else
  echo "requirements-dev.txt not found, skipping Python tool installation."
fi

echo "🚦 Running AI preflight..."
npm run ai:preflight || echo 'Preflight checks skipped'
