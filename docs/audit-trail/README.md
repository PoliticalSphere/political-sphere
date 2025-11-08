# Audit Trail

**Version:** 2.0.0  
**Last Updated:** 2025-11-08

## Overview

This directory contains the **permanent audit trail** for all security, quality, and compliance audits run across the Political Sphere codebase. Audit results are stored here for compliance tracking, historical analysis, and production readiness assessment.

## Directory Structure

```
docs/audit-trail/
├── README.md                           # This file
├── audit-log-YYYY-MM-DD.jsonl         # Daily audit event log (JSONL format)
├── audit-summary-YYYY-MM-DD.txt       # Daily human-readable summary
├── audit-summary-YYYY-MM-DD.json      # Daily machine-readable summary
└── [historical-archives]/             # Archived audit results by date
```

## File Formats

### Audit Log (JSONL)

**Format:** One JSON object per line (newline-delimited JSON)  
**Purpose:** Machine-readable append-only log of all audit events  
**Retention:** Permanent (for compliance)

**Example:**

```jsonl
{"timestamp":"2025-11-08T21:11:12Z","audit":"GitHub","status":"PASS","critical":0,"high":0,"medium":0,"low":0}
{"timestamp":"2025-11-08T21:11:12Z","audit":"DevContainer","status":"PASS","critical":0,"high":0,"medium":0,"low":0}
```

**Fields:**

- `timestamp` - ISO 8601 UTC timestamp
- `audit` - Audit name (GitHub, DevContainer, OpenAPI, Apps)
- `status` - PASS, COMPLETED_WITH_ISSUES, FAILED, MISSING
- `critical` - Count of critical severity issues
- `high` - Count of high severity issues
- `medium` - Count of medium severity issues
- `low` - Count of low severity issues

### Audit Summary (TXT)

**Format:** Human-readable text report  
**Purpose:** Quick review of audit status and production readiness  
**Audience:** Developers, operations teams, auditors

### Audit Summary (JSON)

**Format:** Structured JSON  
**Purpose:** Programmatic access to audit results  
**Use Cases:** CI/CD gates, dashboards, alerting

**Example:**

```json
{
  "timestamp": "2025-11-08T21:11:12Z",
  "autofix": false,
  "summary": {
    "total": 2,
    "passed": 2,
    "failed": 0,
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "production_ready": true,
  "audit_directories": {
    "github": "/path/to/github-audit",
    "devcontainer": "/path/to/devcontainer-audit",
    "openapi": "/path/to/openapi-audit",
    "apps": "/path/to/app-audit"
  },
  "audit_trail": "/path/to/docs/audit-trail"
}
```

## Running Audits

### Central Audit System

Run all audits with centralized reporting:

```bash
# Run all audits
npm run audit:all

# Run specific audits
./scripts/ci/audit-central.sh github devcontainer

# Run with auto-fix
AUTO_FIX=true npm run audit:all
```

### Individual Audits

Run specific audit types independently:

```bash
# GitHub workflows audit
./scripts/ci/github-audit.sh

# DevContainer audit
./scripts/ci/devcontainer-audit.sh

# OpenAPI audit
./scripts/ci/openapi-audit.sh

# App-specific audits
./scripts/ci/app-audit-api.sh
./scripts/ci/app-audit-web.sh
```

## Production Readiness Criteria

An audit is considered **production ready** when:

1. ✅ **Critical Issues:** 0
2. ✅ **High Issues:** 0
3. ✅ **Medium Issues:** ≤ 5 (and documented with remediation plan)
4. ✅ **All Core Audits Pass:**
   - GitHub workflows security
   - DevContainer configuration
   - OpenAPI specification
   - Application dependencies

**Status Indicators:**

- ✅ **PRODUCTION READY** - All criteria met, safe to deploy
- ⚠️ **REVIEW REQUIRED** - Some issues found, review before deploying
- ❌ **NOT PRODUCTION READY** - Critical/High issues, must fix before deploy

## Audit Retention Policy

- **Active Audits:** Keep indefinitely in `audit-trail/`
- **Daily Logs:** Append-only, never delete
- **Weekly Summaries:** Aggregate into monthly reports
- **Compliance:** Retain for minimum 2 years per policy requirements

## Integration with CI/CD

Audits are automatically run in CI/CD pipelines:

```yaml
# .github/workflows/audit.yml
- name: Run Central Audit
  run: npm run audit:all

- name: Check Production Readiness
  run: |
    if ! jq -e '.production_ready == true' docs/audit-trail/audit-summary-*.json; then
      echo "❌ Not production ready"
      exit 1
    fi
```

## Compliance & Standards

Audit trail meets requirements for:

- **GDPR Article 32** - Security measures documentation
- **OWASP ASVS** - Security verification standard
- **NIST SP 800-53** - Security and privacy controls
- **SOC 2** - Trust service principles

## Troubleshooting

### Issue: Old audit files accumulating

```bash
# Archive old audit files (keep last 30 days)
find docs/audit-trail -name "audit-*.jsonl" -mtime +30 -exec mv {} docs/audit-trail/archive/ \;
```

### Issue: Audit log growing too large

JSONL format is designed for append-only logs. Use log rotation:

```bash
# Rotate logs monthly
mv audit-log-2025-11-08.jsonl archive/audit-log-2025-11.jsonl.gz
gzip archive/audit-log-2025-11.jsonl
```

## Related Documentation

- **Main Audit Docs:** `scripts/ci/README-audits.md`
- **GitHub Audit:** `github-audit/`
- **DevContainer Audit:** `devcontainer-audit/`
- **OpenAPI Audit:** `openapi-audit/`
- **Security Policy:** `docs/06-security-and-risk/security.md`
