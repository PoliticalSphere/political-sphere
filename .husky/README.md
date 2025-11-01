# Git Hooks

This project uses [Lefthook](https://github.com/evilmartians/lefthook) for managing git hooks.

## Pre-Commit Hooks

Runs automatically when you commit. These checks run on **staged files only**:

- ✅ **lint-staged** - ESLint, Prettier, Biome formatting
- ✅ **cspell** - Spell checking
- ✅ **a11y** - Accessibility checks (for UI files)
- ✅ **import-boundaries** - Module boundary enforcement
- ✅ **secrets** - Secret scanning with gitleaks

### Output

All hooks now show **detailed output** so you can see exactly what passed or failed.

## Pre-Push Hooks

Runs automatically before pushing. These checks ensure code quality:

- ✅ **integrity** - Workspace integrity check
- ✅ **test-affected** - Run tests for affected projects
- ✅ **lint-affected** - Lint affected projects

### Skipping Checks

You can skip specific checks using environment variables:

```bash
# Skip tests
SKIP_TESTS=1 git push

# Skip linting
SKIP_LINT=1 git push

# Skip both
SKIP_TESTS=1 SKIP_LINT=1 git push
```

### Fast Mode

For quick pushes without checks (use sparingly):

```bash
LEFTHOOK=0 git push
```

## Troubleshooting

### Hook not running?

```bash
# Reinstall hooks
npx lefthook install
```

### See what hooks are configured

```bash
npx lefthook run --list
```

### Run hooks manually

```bash
# Run pre-commit hooks
npx lefthook run pre-commit

# Run pre-push hooks
npx lefthook run pre-push
```

## Configuration

Hooks are configured in `.lefthook.yml` at the project root.
