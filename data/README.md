# Data Directory

This directory contains runtime data, seed data, and test fixtures for the Political Sphere application.

## Structure

- **`seeds/`** - Seed data for initializing the application with default content
  - `users.json` - Default user accounts
  - `parties.json` - Political parties
  - `scenarios.json` - Game scenarios

- **`fixtures/`** - Test fixtures for automated testing
  - `test-users.json` - Test user data
  - `test-scenarios.json` - Test scenario data

- **`*.db`** - SQLite database files (gitignored, runtime artifacts)
- **`*.db-shm`** - SQLite shared memory files (gitignored)
- **`*.db-wal`** - SQLite write-ahead log files (gitignored)

## Usage

### Seed Data

Seed data files are used to populate the database with initial content during development or first-time setup:

```bash
npm run db:seed
```

### Test Fixtures

Test fixtures are loaded during automated tests to provide consistent test data:

```bash
npm test
```

## Database Files

Database files (`.db`, `.db-shm`, `.db-wal`) are runtime artifacts and should **not** be committed to version control. They are automatically generated when the application runs.

### Current Databases

- `political_sphere.db` - Main application database
- `test-debug.db` - Debug test database
- `test-manual.db` - Manual test database

### Dataset Catalog

The file `data/datasets/catalog.json` is generated/maintained by the team so AI assistants and scripts can understand who owns each dataset, what tables it contains, and when it should be refreshed. Update this catalog whenever you add or remove `.db` files so tools such as the SQLite MCP server can surface accurate metadata.

## Gitignore

All database files are excluded from version control via `.gitignore`:

```
data/*.db
data/*.db-shm
data/*.db-wal
```

## DVC Tracking

Dataset directories are described in `dvc.yaml` so engineers can opt into remote-tracked data without polluting Git history.

```bash
# (inside devcontainer) ensure tooling is installed
dvc --version

# capture the latest state locally
dvc repro track-datasets

# push to configured remote once added (see docs)
dvc push
```

The helper script `scripts/data/dvc-track.sh` validates that required directories exist before DVC records metadata.
