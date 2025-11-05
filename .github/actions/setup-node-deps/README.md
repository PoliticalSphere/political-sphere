# Setup Node Dependencies Composite Action

This composite action sets up Node.js and installs dependencies with caching support for npm, pnpm, and yarn.

## Inputs

| Input                   | Description                                         | Required | Default |
| ----------------------- | --------------------------------------------------- | -------- | ------- |
| `node-version`          | Node.js version to use                              | No       | `20`    |
| `package-manager`       | npm, pnpm, or yarn                                  | No       | `npm`   |
| `cache-dependency-path` | Lockfile path(s) for caching                        | No       | ``      |
| `ignore-scripts`        | Set to true to run install with --ignore-scripts    | No       | `false` |
| `enable-corepack`       | Enable Corepack for package manager version locking | No       | `true`  |

## Example Usage

```yaml
- name: Setup Node and Dependencies
  uses: ./.github/actions/composite/setup-node-deps
  with:
    node-version: "20"
    package-manager: pnpm
    cache-dependency-path: "**/pnpm-lock.yaml"
```

## Notes

- Supports npm, pnpm, and yarn with appropriate caching
- Includes retry logic for flaky network conditions
- Validates package manager input to prevent typos
- Enables Corepack by default for consistent package manager versions
