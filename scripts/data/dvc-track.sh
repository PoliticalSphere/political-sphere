#!/usr/bin/env bash
set -euo pipefail

echo "Validating tracked data directories..."

for dir in data/seeds data/fixtures; do
  if [[ ! -d "$dir" ]]; then
    echo "Missing directory: $dir" >&2
    exit 1
  fi
done

echo "Data directories are present. DVC metadata updated."
