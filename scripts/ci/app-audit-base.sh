#!/usr/bin/env bash
################################################################################
# Base App Audit Template for Nx Monorepo Apps
# Version: 1.0.0
#
# This script provides common audit checks for all applications in the
# Political Sphere Nx monorepo. App-specific audits should source this file
# and add their own custom checks.
#
# Usage:
#   APP_NAME=api ./app-audit-base.sh
#   APP_NAME=web ./app-audit-base.sh
################################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# App name must be provided
if [[ -z "${APP_NAME:-}" ]]; then
    echo "Error: APP_NAME environment variable required"
    echo "Usage: APP_NAME=api $0"
    exit 1
fi

APP_DIR="${PROJECT_ROOT}/apps/${APP_NAME}"
AUDIT_DIR="${PROJECT_ROOT}/app-audit"
APP_AUDIT_DIR="${AUDIT_DIR}/${APP_NAME}"

# Environment variables
AUTO_FIX="${AUTO_FIX:-false}"

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
CRITICAL_COUNT=0
HIGH_COUNT=0
MEDIUM_COUNT=0
LOW_COUNT=0
PASS_COUNT=0

# Create audit directories
mkdir -p "${APP_AUDIT_DIR}"

log_critical() { echo -e "${RED}[CRITICAL]${NC} $1"; CRITICAL_COUNT=$((CRITICAL_COUNT + 1)) || true; }
log_high() { echo -e "${RED}[HIGH]${NC} $1"; HIGH_COUNT=$((HIGH_COUNT + 1)) || true; }
log_medium() { echo -e "${YELLOW}[MEDIUM]${NC} $1"; MEDIUM_COUNT=$((MEDIUM_COUNT + 1)) || true; }
log_low() { echo -e "${YELLOW}[LOW]${NC} $1"; LOW_COUNT=$((LOW_COUNT + 1)) || true; }
log_pass() { echo -e "${GREEN}[PASS]${NC} $1"; PASS_COUNT=$((PASS_COUNT + 1)) || true; }
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }

log_section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

print_header() {
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║            App Audit: ${APP_NAME}                                  "
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "App Directory: ${APP_DIR}"
    echo "Auto-Fix: ${AUTO_FIX}"
    echo ""
}

################################################################################
# Phase 1: App Structure Validation
################################################################################

phase1_app_structure() {
    log_section "Phase 1: App Structure Validation"
    
    # Check app directory exists
    if [[ ! -d "${APP_DIR}" ]]; then
        log_critical "App directory not found: ${APP_DIR}"
        return 1
    fi
    log_pass "App directory exists: ${APP_DIR}"
    
    # Check project.json (Nx configuration)
    if [[ -f "${APP_DIR}/project.json" ]]; then
        log_pass "project.json found"
        
        # Validate JSON
        if jq empty "${APP_DIR}/project.json" 2>/dev/null; then
            log_pass "project.json is valid JSON"
        else
            log_high "project.json is invalid JSON"
        fi
    else
        log_critical "project.json not found (required for Nx apps)"
    fi
    
    # Check tsconfig.json
    if [[ -f "${APP_DIR}/tsconfig.json" ]]; then
        log_pass "tsconfig.json found"
        
        # Check extends base config
        if grep -q '"extends".*"../../tsconfig.base.json"' "${APP_DIR}/tsconfig.json"; then
            log_pass "tsconfig extends base configuration"
        else
            log_medium "tsconfig should extend base configuration"
        fi
    else
        log_high "tsconfig.json not found"
    fi
    
    # Check src directory
    if [[ -d "${APP_DIR}/src" ]]; then
        log_pass "src/ directory exists"
    else
        log_critical "src/ directory not found"
    fi
    
    # Check for README
    if [[ -f "${APP_DIR}/README.md" ]]; then
        log_pass "README.md exists"
    else
        log_low "README.md missing (recommended for documentation)"
    fi
}

################################################################################
# Phase 2: Code Quality Checks
################################################################################

phase2_code_quality() {
    log_section "Phase 2: Code Quality Checks"
    
    # Check for TypeScript files
    TS_FILE_COUNT=$(find "${APP_DIR}/src" -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
    if [[ ${TS_FILE_COUNT} -gt 0 ]]; then
        log_pass "TypeScript files found: ${TS_FILE_COUNT}"
    else
        log_medium "No TypeScript files found in src/"
    fi
    
    # Check for ESLint configuration
    if [[ -f "${APP_DIR}/.eslintrc.json" ]] || [[ -f "${PROJECT_ROOT}/.eslintrc.json" ]]; then
        log_pass "ESLint configuration found"
        
        # Skip ESLint if requested
        if [[ "${SKIP_ESLINT:-false}" == "true" ]]; then
            log_info "Skipping ESLint checks (SKIP_ESLINT=true)"
        elif command -v npx &> /dev/null; then
            # Auto-fix mode: run ESLint with --fix flag
            if [[ "${AUTO_FIX}" == "true" ]]; then
                log_info "Running ESLint with auto-fix..."
                if npx eslint "${APP_DIR}/src" --fix --max-warnings 0 > "${APP_AUDIT_DIR}/eslint.log" 2>&1; then
                    log_pass "ESLint auto-fix completed successfully"
                else
                    FIXED_COUNT=$(grep -c "✔" "${APP_AUDIT_DIR}/eslint.log" 2>/dev/null || echo "0")
                    REMAINING_COUNT=$(grep -c "✖" "${APP_AUDIT_DIR}/eslint.log" 2>/dev/null || echo "0")
                    
                    if [[ ${FIXED_COUNT} -gt 0 ]]; then
                        log_pass "ESLint auto-fixed ${FIXED_COUNT} issues"
                    fi
                    if [[ ${REMAINING_COUNT} -gt 0 ]]; then
                        log_medium "ESLint found ${REMAINING_COUNT} issues requiring manual fix"
                    fi
                    log_info "See ${APP_AUDIT_DIR}/eslint.log for details"
                fi
            else
                # Normal mode: run ESLint without --fix
                log_info "Running ESLint..."
                if npx eslint "${APP_DIR}/src" --max-warnings 0 > "${APP_AUDIT_DIR}/eslint.log" 2>&1; then
                    log_pass "ESLint passed with no warnings"
                else
                    WARNING_COUNT=$(grep -c "warning" "${APP_AUDIT_DIR}/eslint.log" 2>/dev/null || echo "0")
                    ERROR_COUNT=$(grep -c "error" "${APP_AUDIT_DIR}/eslint.log" 2>/dev/null || echo "0")
                    
                    if [[ ${ERROR_COUNT} -gt 0 ]]; then
                        log_high "ESLint found ${ERROR_COUNT} errors (run with AUTO_FIX=true to auto-fix)"
                    elif [[ ${WARNING_COUNT} -gt 0 ]]; then
                        log_medium "ESLint found ${WARNING_COUNT} warnings (run with AUTO_FIX=true to auto-fix)"
                    fi
                    log_info "See ${APP_AUDIT_DIR}/eslint.log for details"
                fi
            fi
        fi
    else
        log_low "No ESLint configuration found"
    fi
    
    # Check for Prettier configuration and apply auto-formatting
    if [[ -f "${PROJECT_ROOT}/.prettierrc" ]] || [[ -f "${PROJECT_ROOT}/.prettierrc.json" ]] || [[ -f "${PROJECT_ROOT}/.prettierrc.js" ]]; then
        log_pass "Prettier configuration found"
        
        if [[ "${AUTO_FIX}" == "true" ]] && command -v npx &> /dev/null; then
            log_info "Running Prettier auto-format..."
            if npx prettier --write "${APP_DIR}/src/**/*.{ts,tsx,js,jsx,json,css,scss,md}" > "${APP_AUDIT_DIR}/prettier.log" 2>&1; then
                FORMATTED_COUNT=$(grep -c "unchanged" "${APP_AUDIT_DIR}/prettier.log" 2>/dev/null || echo "0")
                log_pass "Prettier formatted code successfully"
                log_info "See ${APP_AUDIT_DIR}/prettier.log for details"
            fi
        elif command -v npx &> /dev/null; then
            log_info "Run with AUTO_FIX=true to auto-format with Prettier"
        fi
    fi
    
    # Check TypeScript compilation
    if command -v npx &> /dev/null && [[ -f "${APP_DIR}/tsconfig.json" ]]; then
        # TypeScript compilation check
    if [[ "${SKIP_TSC:-false}" == "true" ]]; then
        log_info "Skipping TypeScript compilation (SKIP_TSC=true)"
    elif [[ -f "${APP_DIR}/tsconfig.json" ]] && command -v npx &> /dev/null; then
        log_info "Checking TypeScript compilation..."
        if npx --yes -q tsc --noEmit --project "${APP_DIR}/tsconfig.json" > "${APP_AUDIT_DIR}/tsc.log" 2>&1; then
            log_pass "TypeScript compilation successful"
        else
            log_high "TypeScript compilation failed - see ${APP_AUDIT_DIR}/tsc.log"
        fi
    fi
    fi
}

################################################################################
# Phase 3: Security Checks
################################################################################

phase3_security() {
    log_section "Phase 3: Security Checks"
    
    # Check for hardcoded secrets
    log_info "Scanning for hardcoded secrets..."
    SECRETS_FOUND=0
    
    # Common secret patterns
    if grep -r -i "password.*=.*['\"]" "${APP_DIR}/src" 2>/dev/null | grep -v "password.*: *''" > "${APP_AUDIT_DIR}/secrets.log" 2>&1; then
        SECRETS_FOUND=$((SECRETS_FOUND + 1))
        log_high "Potential hardcoded passwords found"
    fi
    
    if grep -r -i "api[_-]key.*=.*['\"]" "${APP_DIR}/src" 2>/dev/null | grep -v "api.*key.*: *''" >> "${APP_AUDIT_DIR}/secrets.log" 2>&1; then
        SECRETS_FOUND=$((SECRETS_FOUND + 1))
        log_high "Potential hardcoded API keys found"
    fi
    
    if grep -r -i "secret.*=.*['\"]" "${APP_DIR}/src" 2>/dev/null | grep -v "secret.*: *''" >> "${APP_AUDIT_DIR}/secrets.log" 2>&1; then
        SECRETS_FOUND=$((SECRETS_FOUND + 1))
        log_high "Potential hardcoded secrets found"
    fi
    
    if [[ ${SECRETS_FOUND} -eq 0 ]]; then
        log_pass "No obvious hardcoded secrets found"
    else
        log_info "See ${APP_AUDIT_DIR}/secrets.log for details"
    fi
    
    # Check for console.log in production code (common security risk)
    if grep -r "console\.log" "${APP_DIR}/src" 2>/dev/null | grep -v "// console.log" > "${APP_AUDIT_DIR}/console.log" 2>&1; then
        CONSOLE_COUNT=$(wc -l < "${APP_AUDIT_DIR}/console.log" | tr -d ' ')
        log_medium "Found ${CONSOLE_COUNT} console.log statements (should be removed for production)"
    else
        log_pass "No console.log statements found"
    fi
    
    # Check for eval() usage (security risk)
    if grep -r "eval\(" "${APP_DIR}/src" 2>/dev/null; then
        log_critical "Found eval() usage (major security risk - OWASP A03:2021)"
    else
        log_pass "No eval() usage found"
    fi
}

################################################################################
# Phase 4: Testing
################################################################################

phase4_testing() {
    log_section "Phase 4: Testing"
    
    # Check for test files
    TEST_FILE_COUNT=$(find "${APP_DIR}" -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" 2>/dev/null | wc -l | tr -d ' ')
    
    if [[ ${TEST_FILE_COUNT} -gt 0 ]]; then
        log_pass "Test files found: ${TEST_FILE_COUNT}"
    else
        log_high "No test files found (testing is mandatory)"
    fi
    
    # Check tests directory
    if [[ -d "${APP_DIR}/tests" ]] || [[ -d "${APP_DIR}/src/__tests__" ]]; then
        log_pass "Tests directory exists"
    else
        if [[ ${TEST_FILE_COUNT} -eq 0 ]]; then
            log_high "No tests directory found"
        fi
    fi
}

################################################################################
# Phase 5: Dependencies
################################################################################

phase5_dependencies() {
    log_section "Phase 5: Dependencies"
    
    # In Nx monorepo, dependencies are in root package.json
    ROOT_PACKAGE_JSON="${PROJECT_ROOT}/package.json"
    
    if [[ -f "${ROOT_PACKAGE_JSON}" ]]; then
        log_pass "Root package.json found"
        
        # Check for security vulnerabilities (npm audit) - skip if SKIP_NPM_AUDIT=true
        if [[ "${SKIP_NPM_AUDIT:-false}" == "true" ]]; then
            log_info "Skipping npm audit (SKIP_NPM_AUDIT=true)"
        elif command -v npm &> /dev/null; then
            log_info "Running npm audit (set SKIP_NPM_AUDIT=true to skip)..."
            
            # Auto-fix mode: attempt to fix vulnerabilities
            if [[ "${AUTO_FIX}" == "true" ]]; then
                log_info "Running npm audit fix..."
                if npm audit fix --json > "${APP_AUDIT_DIR}/npm-audit-fix.json" 2>&1; then
                    FIXED_COUNT=$(jq -r '.actions | length' "${APP_AUDIT_DIR}/npm-audit-fix.json" 2>/dev/null || echo "0")
                    if [[ ${FIXED_COUNT} -gt 0 ]]; then
                        log_pass "npm audit fixed ${FIXED_COUNT} vulnerabilities"
                    else
                        log_pass "No vulnerabilities to fix"
                    fi
                else
                    log_medium "npm audit fix completed with some remaining issues"
                    log_info "See ${APP_AUDIT_DIR}/npm-audit-fix.json for details"
                fi
            fi
            
            # Run audit to check remaining vulnerabilities
            if npm audit --audit-level=high --json > "${APP_AUDIT_DIR}/npm-audit.json" 2>&1; then
                log_pass "No high/critical vulnerabilities found"
            else
                VULN_COUNT=$(jq -r '.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical' "${APP_AUDIT_DIR}/npm-audit.json" 2>/dev/null || echo "unknown")
                if [[ "${AUTO_FIX}" == "true" ]]; then
                    log_high "Found ${VULN_COUNT} high/critical vulnerabilities requiring manual fix"
                else
                    log_high "Found ${VULN_COUNT} high/critical vulnerabilities (run with AUTO_FIX=true to attempt auto-fix)"
                fi
                log_info "See ${APP_AUDIT_DIR}/npm-audit.json for details"
            fi
        fi
        
        # OWASP Dependency-Check (comprehensive CVE scanning)
        if [[ "${SKIP_OWASP_CHECK:-false}" == "true" ]]; then
            log_info "Skipping OWASP Dependency-Check (SKIP_OWASP_CHECK=true)"
        elif command -v dependency-check &> /dev/null || command -v dependency-check.sh &> /dev/null; then
            log_info "Running OWASP Dependency-Check v12.1.8+ (CVE/CPE detection)..."
            
            OWASP_CMD="dependency-check"
            if ! command -v dependency-check &> /dev/null && command -v dependency-check.sh &> /dev/null; then
                OWASP_CMD="dependency-check.sh"
            fi
            
            # Run OWASP Dependency-Check with SARIF output
            if ${OWASP_CMD} \
                --scan "${APP_DIR}" \
                --project "${APP_NAME}" \
                --format JSON \
                --format SARIF \
                --out "${APP_AUDIT_DIR}/owasp-dependency-check" \
                --failOnCVSS 7 \
                --suppression "${PROJECT_ROOT}/.owasp-suppressions.xml" 2>&1 | tee "${APP_AUDIT_DIR}/owasp-dc.log"; then
                log_pass "OWASP Dependency-Check passed (no CVE ≥7.0 CVSS)"
            else
                CVE_COUNT=$(jq -r '.dependencies[].vulnerabilities | length' "${APP_AUDIT_DIR}/owasp-dependency-check/dependency-check-report.json" 2>/dev/null | awk '{s+=$1} END {print s}' || echo "0")
                log_critical "OWASP Dependency-Check found ${CVE_COUNT} vulnerabilities with CVSS ≥7.0"
                log_info "See ${APP_AUDIT_DIR}/owasp-dependency-check/ for details"
            fi
        else
            log_info "OWASP Dependency-Check not installed (brew install dependency-check or download from owasp.org)"
        fi
    else
        log_critical "Root package.json not found"
    fi
}

################################################################################
# Phase 6: Configuration
################################################################################

phase6_configuration() {
    log_section "Phase 6: Configuration"
    
    # Check for environment variable files
    if [[ -f "${APP_DIR}/.env.example" ]]; then
        log_pass ".env.example found"
    else
        log_low ".env.example missing (recommended for documentation)"
    fi
    
    # Ensure no .env files are committed
    if [[ -f "${APP_DIR}/.env" ]]; then
        log_critical ".env file found (should be git-ignored, never committed)"
    else
        log_pass "No .env file in repository (good)"
    fi
}

################################################################################
# Report Generation
################################################################################

generate_report() {
    log_section "Report Generation"
    
    # Generate JSON report
    cat > "${APP_AUDIT_DIR}/audit-results.json" <<EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "app": "${APP_NAME}",
  "summary": {
    "critical": ${CRITICAL_COUNT},
    "high": ${HIGH_COUNT},
    "medium": ${MEDIUM_COUNT},
    "low": ${LOW_COUNT},
    "pass": ${PASS_COUNT}
  },
  "app_dir": "${APP_DIR}",
  "audit_dir": "${APP_AUDIT_DIR}"
}
EOF
    
    log_pass "JSON report generated: ${APP_AUDIT_DIR}/audit-results.json"
    
    # Print final results
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                      FINAL RESULTS                            ║"
    echo "╠═══════════════════════════════════════════════════════════════╣"
    printf "║  Critical: %-3d  High: %-3d  Medium: %-3d  Low: %-3d     ║\n" \
        ${CRITICAL_COUNT} ${HIGH_COUNT} ${MEDIUM_COUNT} ${LOW_COUNT}
    printf "║  Pass: %-3d                                               ║\n" ${PASS_COUNT}
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Determine exit code
    if [[ ${CRITICAL_COUNT} -gt 0 ]] || [[ ${HIGH_COUNT} -gt 0 ]]; then
        echo "❌ App ${APP_NAME} has critical or high severity issues"
        return 2
    elif [[ ${MEDIUM_COUNT} -gt 5 ]]; then
        echo "⚠️  App ${APP_NAME} has multiple medium severity issues"
        return 1
    else
        echo "✓ App ${APP_NAME} meets quality standards"
        return 0
    fi
}

################################################################################
# SARIF Output Generation (for GitHub Code Scanning)
################################################################################

generate_sarif_output() {
    if [[ "${GENERATE_SARIF:-false}" != "true" ]]; then
        return 0
    fi
    
    log_info "Generating SARIF 2.1.0 format output for GitHub Code Scanning..."
    
    # Create SARIF file
    cat > "${APP_AUDIT_DIR}/audit-results.sarif" <<'SARIF_START'
{
  "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
  "version": "2.1.0",
  "runs": [
    {
      "tool": {
        "driver": {
          "name": "Political Sphere App Audit",
          "version": "1.0.0",
          "informationUri": "https://github.com/PoliticalSphere/political-sphere",
          "rules": [
            {
              "id": "PS001",
              "name": "HardcodedSecrets",
              "shortDescription": { "text": "Hardcoded secrets detected" },
              "fullDescription": { "text": "Source code contains hardcoded passwords, API keys, or secrets" },
              "defaultConfiguration": { "level": "error" }
            },
            {
              "id": "PS002",
              "name": "EvalUsage",
              "shortDescription": { "text": "eval() usage detected" },
              "fullDescription": { "text": "Use of eval() function poses security risk (OWASP A03:2021)" },
              "defaultConfiguration": { "level": "error" }
            },
            {
              "id": "PS003",
              "name": "MissingTests",
              "shortDescription": { "text": "No test files found" },
              "fullDescription": { "text": "Application lacks automated tests" },
              "defaultConfiguration": { "level": "warning" }
            },
            {
              "id": "PS004",
              "name": "DependencyVulnerability",
              "shortDescription": { "text": "Vulnerable dependencies detected" },
              "fullDescription": { "text": "npm audit found high/critical vulnerabilities" },
              "defaultConfiguration": { "level": "error" }
            }
          ]
        }
      },
      "results": []
    }
  ]
}
SARIF_START
    
    log_pass "SARIF output generated: ${APP_AUDIT_DIR}/audit-results.sarif"
}

################################################################################
# Main Execution
################################################################################

main() {
    print_header
    
    phase1_app_structure || true
    phase2_code_quality || true
    phase3_security || true
    phase4_testing || true
    phase5_dependencies || true
    phase6_configuration || true
    
    generate_sarif_output || true
    generate_report
}

# Only run main if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main
fi
