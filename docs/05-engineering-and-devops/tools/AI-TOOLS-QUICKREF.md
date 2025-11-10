# AI Development Tools - Quick Reference

**🎯 TL;DR:** We have 8 AI-powered tools protecting code quality, security, and accessibility.

---

## ⚡ Quick Commands

```bash
# Run all quality checks locally
npm run test:coverage          # Coverage report (80%+ required)
npm run test:a11y              # Accessibility checks (0 violations required)
npm run lint                   # Code quality
npm run type-check             # TypeScript validation

# Check security locally
npm audit                      # Basic npm vulnerabilities
npx snyk test                  # Deep security scan (if Snyk installed)
```

---

## 🤖 Active AI Tools

| Tool           | What It Does       | Blocks PR If...              |
| -------------- | ------------------ | ---------------------------- |
| **Copilot**    | Code generation    | (advisory only)              |
| **Dependabot** | Dependency updates | (creates PRs)                |
| **CodeQL**     | Security scanning  | High-severity findings       |
| **Codecov**    | Coverage tracking  | Coverage drops significantly |
| **Lighthouse** | Performance + a11y | Accessibility < 100          |
| **axe-core**   | WCAG validation    | Any violations found         |
| **Semgrep**    | Security patterns  | High-severity findings       |
| **Snyk**       | Vulnerability scan | High-severity findings       |

---

## ✅ PR Merge Checklist

**Must pass ALL of these:**

- [ ] ✅ CodeQL: No high-severity security issues
- [ ] ✅ Codecov: Coverage maintained (80%+)
- [ ] ✅ Lighthouse: Accessibility = 100
- [ ] ✅ axe-core: Zero violations
- [ ] ✅ Semgrep: No high-severity patterns
- [ ] ✅ All unit tests passing
- [ ] ✅ TypeScript: No type errors
- [ ] ✅ ESLint: No errors

---

## 🚨 Common Issues

### "CodeQL found SQL injection"

- **Fix:** Use parameterized queries
- **Example:** `db.query('SELECT * FROM users WHERE id = ?', [userId])`

### "Accessibility score is 95"

- **Fix:** Run `npm run test:a11y` locally
- **Common causes:** Missing ARIA labels, contrast issues, keyboard nav

### "Coverage dropped to 75%"

- **Fix:** Add tests for new code
- **Target:** 80%+ overall, 100% for security code

### "Lighthouse performance is 85"

- **Note:** Performance warnings don't block (only accessibility does)
- **Fix:** Code splitting, lazy loading, image optimization

---

## 📖 Full Documentation

See `docs/05-engineering-and-devops/tools/ai-tools.md` for complete details.

---

## 🆘 Need Help?

1. Check workflow logs in GitHub Actions tab
2. Review tool-specific docs in main AI tools document
3. Create issue with `ai-tooling` label

---

**Updated:** 2025-11-10
