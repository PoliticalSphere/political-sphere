# Immutable Audit Trail

## Overview

This directory contains the **cryptographically-signed audit trail** for all CI/CD workflow executions. Every workflow completion is logged with tamper-evident integrity controls.

## Purpose

- **Compliance**: Satisfy SOC 2, ISO 27001, NIST CSF, GDPR audit requirements
- **Security**: Detect unauthorized changes to CI/CD pipelines
- **Accountability**: Maintain complete record of who did what, when
- **Forensics**: Enable incident investigation and root cause analysis

## Architecture

### Hash Chain Integrity

Each audit log entry is linked to the previous entry via cryptographic hashing, creating an **immutable chain**:

```
Entry 1 (hash: ABC123)
  ↓ (previous_hash: 000000)
Entry 2 (hash: DEF456)
  ↓ (previous_hash: ABC123)
Entry 3 (hash: GHI789)
  ↓ (previous_hash: DEF456)
```

**Tampering Detection**: If any entry is modified, its hash changes, breaking the chain and triggering an integrity violation.

### Directory Structure

```
.github/audit-trail/
├── README.md                    # This file
├── latest-hash.txt              # Most recent hash for chain linking
└── logs/
    ├── 2025-01/
    │   ├── 2025-01-15-12345.json
    │   ├── 2025-01-16-12346.json
    │   └── ...
    ├── 2025-02/
    │   └── ...
    └── YYYY-MM/
        └── YYYY-MM-DD-{run_id}.json
```

### Log Entry Format

Each JSON log contains:

```json
{
  "version": "1.0",
  "event_type": "workflow_completed",
  "timestamp": "2025-01-15T14:30:00Z",
  "previous_hash": "abc123...",
  "workflow": {
    "name": "Continuous Integration",
    "run_id": "12345",
    "conclusion": "success",
    "duration_seconds": 420,
    "triggered_by": "username",
    "repository": "political-sphere/political-sphere",
    "head_sha": "def456...",
    "head_branch": "main"
  },
  "integrity": {
    "signed_at": "2025-01-15T14:30:05Z",
    "signing_key": "GitHub Actions GPG",
    "signature": "sha256:abc123..."
  }
}
```

## Workflows

### 1. Audit Trail Logger (`audit-trail.yml`)

**Trigger**: After every workflow completion  
**Function**: Collects event data, signs with cryptographic hash, commits to git

**Jobs**:

- `collect-audit-event`: Capture workflow run data
- `verify-integrity`: Check hash chain continuity
- `export-audit-trail`: Generate compliance reports

### 2. Daily Backup

**Trigger**: Daily at 00:00 UTC  
**Function**: Archive audit trail to long-term storage (AWS S3 Glacier)

**Retention**: 7 years (2,555 days) for compliance

## Security Controls

| Control                   | Implementation                     | Compliance       |
| ------------------------- | ---------------------------------- | ---------------- |
| **Cryptographic Signing** | SHA-256 hash of each entry         | SOC 2, ISO 27001 |
| **Hash Chain**            | Links entries to prevent tampering | NIST CSF         |
| **Immutable Storage**     | Git history + S3 Glacier           | ISO 27001        |
| **Tamper Detection**      | Automated integrity verification   | SOC 2            |
| **Access Control**        | GitHub branch protection           | ISO 27001        |
| **Retention Policy**      | 7-year archive                     | GDPR Article 30  |

## Compliance Mappings

### SOC 2 Type II

- **CC7.2**: Activity logging with integrity controls
- **CC7.3**: Audit trail retention and protection

### ISO 27001

- **A.12.4.1**: Event logging
- **A.12.4.2**: Protection of log information
- **A.12.4.3**: Administrator and operator logs

### NIST Cybersecurity Framework

- **DE.CM-7**: Monitoring for unauthorized activity
- **PR.PT-1**: Audit/log records

### GDPR

- **Article 30**: Records of processing activities
- **Article 32**: Security of processing

## Operations

### Verify Integrity Manually

```bash
# Check hash chain continuity
bash .github/workflows/verify-audit-chain.sh

# Expected output: ✅ Verified X entries, hash chain intact
```

### Export Compliance Report

```bash
# Trigger workflow manually
gh workflow run audit-trail.yml -f action=export-audit-trail

# Download report artifact
gh run download --name audit-trail-compliance-report
```

### Investigate Specific Event

```bash
# Find log by run ID
find .github/audit-trail/logs -name "*12345.json"

# View log contents
cat .github/audit-trail/logs/2025-01/2025-01-15-12345.json | jq .
```

## Incident Response

### Tampering Detected

**Alert**: Hash chain verification fails

**Immediate Actions**:

1. **Freeze CI/CD**: Emergency stop via error budget policy
2. **Preserve Evidence**: Copy entire `.github/audit-trail/` directory
3. **Investigate**: Determine which entry was modified
4. **Notify**: Security team + stakeholders
5. **Remediate**: Restore from backup if necessary

**Root Cause Analysis**:

- Check git blame: `git log --all -- .github/audit-trail/`
- Review access logs: Who had write access?
- Verify GPG signatures: `git log --show-signature`

### Missing Entries

**Alert**: Gap detected in audit trail

**Actions**:

1. Check GitHub Actions logs for failed audit-trail.yml runs
2. Verify network connectivity during logging window
3. Manually reconstruct missing entries from GitHub API
4. Document gap in incident log

## Retention and Archival

### Daily Backup (Automated)

- **When**: Daily at 00:00 UTC
- **What**: Complete `.github/audit-trail/` directory
- **Where**: AWS S3 Glacier (long-term storage)
- **Retention**: 7 years (2,555 days)

### Archive Naming Convention

```
audit-trail-YYYY-MM-DD.tar.gz
├── Compressed with gzip
├── SHA-256 checksum recorded
└── Uploaded to s3://political-sphere-audit-archive/ci-cd/
```

### Retrieval (if needed)

```bash
# Restore from S3 Glacier
aws s3 cp s3://political-sphere-audit-archive/ci-cd/2024-01-15/audit-trail-2024-01-15.tar.gz .

# Verify checksum
sha256sum audit-trail-2024-01-15.tar.gz

# Extract
tar -xzf audit-trail-2024-01-15.tar.gz
```

## Access Controls

### Write Access

- **GitHub Actions Bot**: Automated logging only
- **Repository Admins**: Emergency access (requires MFA)

### Read Access

- **All Team Members**: Read-only via git
- **Auditors**: Export compliance reports

### Branch Protection

- `.github/audit-trail/**` requires:
  - Code review approval (except for automation)
  - Status checks pass
  - No force pushes
  - No deletions

## Monitoring and Alerting

### Automated Checks

- ✅ Daily integrity verification
- ✅ Hash chain continuity check
- ✅ Tampering detection scan
- ✅ Backup success confirmation

### Alerts Triggered On

| Condition               | Severity     | Notification      |
| ----------------------- | ------------ | ----------------- |
| Hash chain broken       | **Critical** | PagerDuty + Email |
| Missing log entry       | **High**     | Email             |
| Failed backup           | **High**     | Email             |
| Integrity check failure | **Critical** | PagerDuty + Slack |

## References

- **Workflow**: `.github/workflows/audit-trail.yml`
- **Signing Workflow**: `.github/workflows/artifact-signing.yml`
- **Threat Model**: `docs/security/cicd-threat-model.md` (T9: Audit Log Tampering)
- **SLO**: `.github/SLO.md` (Security SLOs)
- **Constitution**: `docs/governance/cicd-constitution.md` (Article VI: Audit Requirements)

## Support

Questions or issues?

- **Security Team**: @security-team
- **Platform Engineering**: @platform-engineering
- **Compliance Officer**: compliance@political-sphere.com

---

**Last Updated**: 2025-01-15  
**Version**: 1.0  
**Maintained By**: Platform Engineering + Security Team
