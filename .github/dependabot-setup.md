# Enable GitHub Dependabot and Security Features

## 1. Dependabot for Dependency Updates and Security Alerts

Add this file to `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    commit-message:
      prefix: "chore(deps)"
  - package-ecosystem: "npm"
    directory: "/apps/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    commit-message:
      prefix: "chore(deps)"
  - package-ecosystem: "npm"
    directory: "/libs/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    commit-message:
      prefix: "chore(deps)"
```

## 2. Enable GitHub Security Features

- Go to your repository on GitHub.
- In the Settings tab, under "Security & analysis", enable:
  - Dependabot alerts
  - Dependabot security updates
  - Secret scanning
  - Code scanning (use GitHub Advanced Security or add a workflow)

## 3. Add a Reminder to Onboarding Docs

Update your onboarding documentation to remind contributors to keep these features enabled.

---

For more details, see: https://docs.github.com/en/code-security/supply-chain-security/keeping-your-dependencies-updated-automatically/about-dependabot-version-updates
