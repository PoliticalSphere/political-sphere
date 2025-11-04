# Quality Checks Composite Action

This composite action runs comprehensive quality checks for Node.js projects, including linting, type checking, import boundary validation, and optional security scanning.

## Inputs

| Input                   | Description                                         | Required | Default                            |
| ----------------------- | --------------------------------------------------- | -------- | ---------------------------------- |
| `fail-fast`             | Exit immediately on first failing check             | No       | `true`                             |
| `continue-on-error`     | Do not fail the job even if checks fail             | No       | `false`                            |
| `node-version`          | Node.js version                                     | No       | `22`                               |
| `working-directory`     | Directory to run commands in (monorepo friendly)    | No       | `.`                                |
| `package-manager`       | npm, pnpm, or yarn                                  | No       | `npm`                              |
| `cache-dependency-path` | Lockfile path(s) for caching                        | No       | ``                                 |
| `ignore-scripts`        | Set to true to run install with --ignore-scripts    | No       | `false`                            |
| `enable-corepack`       | Enable Corepack for package manager version locking | No       | `true`                             |
| `run-semgrep`           | Run Semgrep security scan                           | No       | `true`                             |
| `lint-command`          | Fallback lint command if lint script not found      | No       | `npx eslint . --max-warnings=0`    |
| `typecheck-command`     | Fallback typecheck command if no script is defined  | No       | `npx tsc -b \|\| npx tsc --noEmit` |

## Outputs

| Output              | Description        |
| ------------------- | ------------------ |
| `lint-result`       | success \| failure |
| `typecheck-result`  | success \| failure |
| `boundaries-result` | success \| failure |
| `semgrep-result`    | success \| failure |
| `overall-result`    | success \| failure |

## Example Usage

```yaml
- name: Run Quality Checks
  uses: ./.github/actions/composite/quality-checks
  with:
    working-directory: ./apps/api
    package-manager: pnpm
    run-semgrep: false
```

## Notes

- The action prefers project-defined npm scripts (`lint`, `typecheck`, `lint:import-boundaries`) over fallbacks
- Semgrep scanning is skipped gracefully if no configuration is found
- Artifacts are uploaded on failure for debugging
- All checks run with timing information and rich summaries
