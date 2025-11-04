# GitHub Actions Configuration Files

This directory contains configuration files for various GitHub features and integrations used in the repository.

## Files Overview

### `dependabot.yml`

- **Purpose**: Automated dependency updates
- **Configuration**: Defines update schedules for npm packages across different directories (/, /apps/, /libs/)
- **Documentation**: [Dependabot documentation](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)

### `env-config.yml`

- **Purpose**: Centralized environment variables for CI/CD workflows
- **Configuration**: Node.js versions, secrets, test settings, database configs
- **Usage**: Referenced by workflow files for consistent environment setup

### `labeler.yml`

- **Purpose**: Automated PR labeling based on file changes
- **Configuration**: Rules for applying labels like `ci`, `docs`, `dependencies`, etc.
- **Documentation**: [GitHub Labeler action](https://github.com/actions/labeler)

### `pr-size.yml`

- **Purpose**: Automated PR size labeling
- **Configuration**: Size thresholds (XS, S, M, L, XL) based on lines changed
- **Documentation**: [PR Size Labeler action](https://github.com/codacy/git-version)

### `stale.yml`

- **Purpose**: Automated issue management
- **Configuration**: Rules for marking issues as stale and closing inactive ones
- **Documentation**: [Stale action](https://github.com/actions/stale)

## Modifying Configurations

### General Guidelines

- Test changes in a branch before merging to main
- Update this README if adding new configuration files
- Check the linked documentation for each tool's options

### Testing Changes

- **Dependabot**: Changes take effect on the next scheduled run
- **Labeler**: Test by creating a PR and checking applied labels
- **PR Size**: Test by creating PRs of different sizes
- **Stale**: Monitor issue activity after changes
- **Env Config**: Update workflows that reference these variables

### Security Considerations

- Environment variables in `env-config.yml` should reference GitHub secrets
- Review access permissions when modifying automation rules
- Consider the impact on existing PRs/issues when changing labeling rules

## Support

For questions about these configurations, refer to the linked documentation or ask in the development channel.
