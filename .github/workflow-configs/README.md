# GitHub Workflow Configuration Files

This directory contains configuration files for various GitHub workflow features and integrations.

## Files Overview

### `labeler.yml`

- **Purpose**: Automated PR labeling based on file changes
- **Configuration**: Rules for applying labels like `ci`, `docs`, `dependencies`, etc.
- **Usage**: Referenced by labeler workflow in `/workflows/`
- **Documentation**: [GitHub Labeler action](https://github.com/actions/labeler)

### `pr-size.yml`

- **Purpose**: Automated PR size labeling
- **Configuration**: Size thresholds (XS, S, M, L, XL) based on lines changed
- **Usage**: Referenced by PR labeler workflows
- **Documentation**: [PR Size Labeler action](https://github.com/codacy/git-version)

### `stale.yml`

- **Purpose**: Automated stale issue and PR management
- **Configuration**: Timeouts and labels for stale items
- **Usage**: Manages inactive issues and pull requests
- **Documentation**: [Stale action](https://github.com/actions/stale)

## Note on Dependabot

`dependabot.yml` has been moved to `/.github/dependabot.yml` (GitHub's standard location).

## Best Practices

- Keep configuration files in this directory for better organization
- Reference them from workflow files using relative paths
- Document any changes to configuration in commit messages
- Test configuration changes in a non-production branch first

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
