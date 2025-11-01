---
name: Rule Update
about: Use this template when updating governance rule files (`.github/copilot-instructions.md` and `.blackboxrules`).
---

## Summary

Describe the change to governance rules and rationale.

## Checklist (required)

- [ ] I updated BOTH `.github/copilot-instructions.md` and `.blackboxrules` with consistent content.
- [ ] I updated `Last updated` and `Version` fields in both files.
- [ ] I added an entry to `docs/CHANGELOG.md` under `Unreleased` (date, author, type: Added/Changed/Fixed, short description).
- [ ] I updated `docs/TODO.md` to reflect the change (completed or planned task for traceability).
- [ ] At least one governance owner (see CODEOWNERS) is requested as a reviewer.

### Emergency PR (if applicable)

If this is an emergency security or safety fix, prefix the PR title with `EMERGENCY:` and tag the Technical Governance Committee in the PR description. Explain the urgency.

### Notes

Provide any audit or migration notes required for reviewers.
