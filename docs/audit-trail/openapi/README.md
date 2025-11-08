# OpenAPI Audit Trail

This directory contains structured audit findings for the Political Sphere OpenAPI specification.

## Files

### `audit-findings.json`

**Latest audit results** - This file is overwritten on each audit run.

Structure:

```json
{
  "auditVersion": "2.0.0",
  "timestamp": "2025-11-08T17:42:27Z",
  "specification": {
    "path": "apps/api/openapi/api.yaml",
    "openApiVersion": "3.1.0"
  },
  "summary": {
    "totalIssues": 14,
    "critical": 0,
    "high": 0,
    "medium": 6,
    "low": 8,
    "info": 7
  },
  "findings": [
    {
      "severity": "MEDIUM",
      "category": "OWASP-API3",
      "message": "API3:2023 - No readOnly/writeOnly usage",
      "recommendation": "Add readOnly: true to fields like id, createdAt",
      "timestamp": "2025-11-08T17:42:20Z"
    }
  ],
  "statistics": {
    "paths": 18,
    "operations": 42,
    "schemas": 449,
    "securitySchemes": 3
  },
  "validationPassed": true,
  "productionReady": true
}
```

### `audit-history.jsonl`

**Audit history** - JSON Lines format with one audit result per line (appended on each run).

Each line is a complete audit result (same structure as `audit-findings.json`).

## Severity Levels

| Level        | Description                                     | Action Required                       |
| ------------ | ----------------------------------------------- | ------------------------------------- |
| **CRITICAL** | Security vulnerabilities, broken authentication | Fix immediately before any deployment |
| **HIGH**     | Missing required fields, OWASP violations       | Fix before next release               |
| **MEDIUM**   | Documentation gaps, code generation issues      | Plan for upcoming sprint              |
| **LOW**      | Missing examples, optional improvements         | Nice-to-have enhancements             |
| **INFO**     | Informational messages, recommendations         | Consider for future work              |

## Categories

Findings are categorized to help prioritize and assign work:

- **OpenAPI-Compliance**: OpenAPI 3.1/3.2 specification compliance
- **OWASP-API1**: Broken Object Level Authorization
- **OWASP-API2**: Broken Authentication
- **OWASP-API3**: Broken Object Property Level Authorization
- **OWASP-API4**: Unrestricted Resource Consumption
- **OWASP-API5**: Broken Function Level Authorization
- **OWASP-API8**: Security Misconfiguration
- **OWASP-API9**: Improper Inventory Management
- **Documentation**: Documentation completeness and quality
- **Security-Schemes**: Authentication and authorization configuration
- **General**: Miscellaneous findings

## Usage

### View Latest Findings

```bash
cat docs/audit-trail/openapi/audit-findings.json | jq '.findings'
```

### Filter by Severity

```bash
cat docs/audit-trail/openapi/audit-findings.json | jq '.findings[] | select(.severity == "CRITICAL")'
```

### Filter by Category

```bash
cat docs/audit-trail/openapi/audit-findings.json | jq '.findings[] | select(.category == "OWASP-API4")'
```

### View Audit Trend

```bash
# Count issues over time
cat docs/audit-trail/openapi/audit-history.jsonl | jq -r '[.timestamp, .summary.totalIssues] | @csv'
```

### Track Progress

```bash
# Compare current vs previous audit
tail -2 docs/audit-trail/openapi/audit-history.jsonl | jq -s '
  {
    previous: .[0].summary,
    current: .[1].summary,
    improvement: (.[0].summary.totalIssues - .[1].summary.totalIssues)
  }'
```

## Running the Audit

```bash
# Standard audit (includes OpenAPI Generator - slower)
./scripts/ci/openapi-audit-enhanced.sh

# Fast audit (skips OpenAPI Generator)
SKIP_GENERATOR=true ./scripts/ci/openapi-audit-enhanced.sh
```

## Integration with CI/CD

The audit script is designed to integrate with CI/CD pipelines:

**Exit Codes:**

- `0` - No issues found
- `1` - HIGH priority issues (should warn but allow merge)
- `2` - CRITICAL issues (block deployment)

**Example GitHub Actions:**

```yaml
- name: OpenAPI Audit
  run: SKIP_GENERATOR=true ./scripts/ci/openapi-audit-enhanced.sh
  continue-on-error: ${{ github.ref != 'refs/heads/main' }}

- name: Upload Audit Results
  uses: actions/upload-artifact@v3
  with:
    name: openapi-audit
    path: docs/audit-trail/openapi/audit-findings.json
```

## Compliance Tracking

These audit files serve as evidence for:

- **GDPR Article 32**: Security of processing (demonstrable security measures)
- **ISO 27001**: Information security management
- **SOC 2**: Security controls and monitoring
- **OWASP ASVS**: Application security verification

The `audit-history.jsonl` file provides an immutable audit trail showing security posture improvement over time.

## Maintenance

- **Retention**: Keep `audit-history.jsonl` for at least 7 years (GDPR requirement)
- **Rotation**: Consider rotating `audit-history.jsonl` annually (e.g., `audit-history-2025.jsonl`)
- **Backup**: Include in regular backup procedures
- **Review**: Review trends monthly to identify recurring issues

## Related Documentation

- **Audit Script**: `scripts/ci/openapi-audit-enhanced.sh`
- **Research Findings**: `openapi-audit/RESEARCH-FINDINGS.md`
- **OpenAPI Spec**: `apps/api/openapi/api.yaml`
- **Security Policy**: `docs/06-security-and-risk/security.md`
