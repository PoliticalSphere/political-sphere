#!/usr/bin/env bash
# =============================================================================
# Central Audit System v2.0.0
# =============================================================================
#
# Orchestrates all individual audit scripts with centralized reporting.
# Stores audit trails in docs/audit-trail/ for compliance tracking.
#
# Features:
# - Run all audits or select specific ones
# - Centralized audit trail (JSONL format in docs/audit-trail/)
# - Aggregated reporting across all audit types
# - Production readiness assessment
# - Individual and combined exit codes
#
# Usage:
#   ./audit-central.sh                    # Run all audits
#   ./audit-central.sh github devcontainer # Run specific audits
#   AUTO_FIX=true ./audit-central.sh      # Run with auto-fix
#
# Exit Codes:
#   0 - All audits passed
#   1 - Warnings or medium-severity issues
#   2 - Critical or high-severity issues
#
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Audit trail directory (docs/audit-trail/)
AUDIT_TRAIL_DIR="${PROJECT_ROOT}/docs/audit-trail"
AUDIT_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
AUDIT_DATE=$(date -u +"%Y-%m-%d")
AUDIT_LOG="${AUDIT_TRAIL_DIR}/audit-log-${AUDIT_DATE}.jsonl"
AUDIT_SUMMARY="${AUDIT_TRAIL_DIR}/audit-summary-${AUDIT_DATE}.txt"
AUDIT_JSON="${AUDIT_TRAIL_DIR}/audit-summary-${AUDIT_DATE}.json"

# Individual audit output directories (still in project root for easy access)
GITHUB_AUDIT_DIR="${PROJECT_ROOT}/github-audit"
DEVCONTAINER_AUDIT_DIR="${PROJECT_ROOT}/devcontainer-audit"
OPENAPI_AUDIT_DIR="${PROJECT_ROOT}/openapi-audit"
APP_AUDIT_DIR="${PROJECT_ROOT}/app-audit"

# Environment variables
AUTO_FIX="${AUTO_FIX:-false}"
FAIL_ON_WARNINGS="${FAIL_ON_WARNINGS:-false}"
PARALLEL="${PARALLEL:-false}"

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
TOTAL_AUDITS=0
PASSED_AUDITS=0
FAILED_AUDITS=0
TOTAL_CRITICAL=0
TOTAL_HIGH=0
TOTAL_MEDIUM=0
TOTAL_LOW=0

# Available audits
AVAILABLE_AUDITS=(
    "github"
    "devcontainer"
    "openapi"
    "apps"
)

# Selected audits (default: all)
SELECTED_AUDITS=()

# -----------------------------------------------------------------------------
# Helper Functions
# -----------------------------------------------------------------------------

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_header() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                  Central Audit System v2.0.0                 ║"
    echo "╠═══════════════════════════════════════════════════════════════╣"
    echo "║  GitHub Workflows  │  DevContainer  │  OpenAPI  │  Apps      ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Audit Timestamp: ${AUDIT_TIMESTAMP}"
    echo "Audit Trail: ${AUDIT_TRAIL_DIR}"
    echo "Auto-Fix: ${AUTO_FIX}"
    echo ""
}

setup_directories() {
    log_info "Setting up audit directories..."
    
    # Create audit trail directory in docs
    mkdir -p "${AUDIT_TRAIL_DIR}"
    
    # Create individual audit directories
    mkdir -p "${GITHUB_AUDIT_DIR}"
    mkdir -p "${DEVCONTAINER_AUDIT_DIR}"
    mkdir -p "${OPENAPI_AUDIT_DIR}"
    mkdir -p "${APP_AUDIT_DIR}"
    
    log_success "Directories created"
}

log_audit_event() {
    local audit_name="$1"
    local status="$2"
    local critical="${3:-0}"
    local high="${4:-0}"
    local medium="${5:-0}"
    local low="${6:-0}"
    
    # JSONL format (one JSON object per line)
    cat >> "${AUDIT_LOG}" <<EOF
{"timestamp":"${AUDIT_TIMESTAMP}","audit":"${audit_name}","status":"${status}","critical":${critical},"high":${high},"medium":${medium},"low":${low}}
EOF
}

run_audit() {
    local audit_name="$1"
    local audit_script="$2"
    local json_path="${3:-}"  # Optional JSON results path
    
    log_section "Running ${audit_name} Audit"
    
    if [[ ! -f "${audit_script}" ]]; then
        log_error "Audit script not found: ${audit_script}"
        log_audit_event "${audit_name}" "MISSING" 0 0 0 0
        FAILED_AUDITS=$((FAILED_AUDITS + 1)) || true
        return 1
    fi
    
    # Run audit and capture exit code
    if AUTO_FIX="${AUTO_FIX}" bash "${audit_script}"; then
        log_success "${audit_name} audit completed successfully"
        log_audit_event "${audit_name}" "PASS" 0 0 0 0
        PASSED_AUDITS=$((PASSED_AUDITS + 1)) || true
        return 0
    else
        local exit_code=$?
        log_warning "${audit_name} audit completed with issues (exit code: ${exit_code})"
        
        # Try to extract severity counts from audit results
        extract_and_log_results "${audit_name}" "${json_path}"
        
        FAILED_AUDITS=$((FAILED_AUDITS + 1)) || true
        return 1
    fi
}

extract_and_log_results() {
    local audit_name="$1"
    local json_path="${2:-}"
    local critical=0
    local high=0
    local medium=0
    local low=0
    
    # If JSON path provided explicitly, use it
    if [[ -n "${json_path}" ]]; then
        json_file="${json_path}"
    else
        # Try to find JSON results file for this audit
        local json_file=""
        case "${audit_name}" in
            "GitHub")
                json_file="${GITHUB_AUDIT_DIR}/github-audit-results.json"
                ;;
            "DevContainer")
                json_file="${DEVCONTAINER_AUDIT_DIR}/devcontainer-audit-results.json"
                ;;
            "OpenAPI")
                json_file="${OPENAPI_AUDIT_DIR}/openapi-audit-results.json"
                ;;
        esac
    fi
    
    if [[ -f "${json_file}" ]] && command -v jq &> /dev/null; then
        critical=$(jq -r '.summary.critical // 0' "${json_file}" 2>/dev/null || echo 0)
        high=$(jq -r '.summary.high // 0' "${json_file}" 2>/dev/null || echo 0)
        medium=$(jq -r '.summary.medium // 0' "${json_file}" 2>/dev/null || echo 0)
        low=$(jq -r '.summary.low // 0' "${json_file}" 2>/dev/null || echo 0)
    fi
    
    TOTAL_CRITICAL=$((TOTAL_CRITICAL + critical)) || true
    TOTAL_HIGH=$((TOTAL_HIGH + high)) || true
    TOTAL_MEDIUM=$((TOTAL_MEDIUM + medium)) || true
    TOTAL_LOW=$((TOTAL_LOW + low)) || true
    
    log_audit_event "${audit_name}" "COMPLETED_WITH_ISSUES" "${critical}" "${high}" "${medium}" "${low}"
}

generate_summary() {
    log_info "Generating audit summary..."
    
    # Text summary
    cat > "${AUDIT_SUMMARY}" <<EOF
═══════════════════════════════════════════════════════════════
  Central Audit System - Summary Report
═══════════════════════════════════════════════════════════════

Audit Date: ${AUDIT_TIMESTAMP}
Auto-Fix Enabled: ${AUTO_FIX}

───────────────────────────────────────────────────────────────
  Overall Results
───────────────────────────────────────────────────────────────

Total Audits Run:     ${TOTAL_AUDITS}
Passed:               ${PASSED_AUDITS}
Failed/Issues:        ${FAILED_AUDITS}

───────────────────────────────────────────────────────────────
  Aggregated Severity Counts
───────────────────────────────────────────────────────────────

Critical:             ${TOTAL_CRITICAL}
High:                 ${TOTAL_HIGH}
Medium:               ${TOTAL_MEDIUM}
Low:                  ${TOTAL_LOW}

───────────────────────────────────────────────────────────────
  Production Readiness Assessment
───────────────────────────────────────────────────────────────

EOF

    # Assess production readiness
    if [[ ${TOTAL_CRITICAL} -gt 0 ]] || [[ ${TOTAL_HIGH} -gt 0 ]]; then
        echo "Status: ❌ NOT PRODUCTION READY" >> "${AUDIT_SUMMARY}"
        echo "Reason: Critical or High severity issues found" >> "${AUDIT_SUMMARY}"
    elif [[ ${TOTAL_MEDIUM} -gt 5 ]]; then
        echo "Status: ⚠️  REVIEW REQUIRED" >> "${AUDIT_SUMMARY}"
        echo "Reason: Multiple Medium severity issues (${TOTAL_MEDIUM} found)" >> "${AUDIT_SUMMARY}"
    elif [[ ${FAILED_AUDITS} -gt 0 ]]; then
        echo "Status: ⚠️  REVIEW REQUIRED" >> "${AUDIT_SUMMARY}"
        echo "Reason: Some audits completed with issues" >> "${AUDIT_SUMMARY}"
    else
        echo "Status: ✅ PRODUCTION READY" >> "${AUDIT_SUMMARY}"
        echo "Reason: All audits passed successfully" >> "${AUDIT_SUMMARY}"
    fi
    
    cat >> "${AUDIT_SUMMARY}" <<EOF

───────────────────────────────────────────────────────────────
  Detailed Results
───────────────────────────────────────────────────────────────

Individual audit results available in:
- GitHub Workflows:  ${GITHUB_AUDIT_DIR}/
- DevContainer:      ${DEVCONTAINER_AUDIT_DIR}/
- OpenAPI:           ${OPENAPI_AUDIT_DIR}/
- Applications:      ${APP_AUDIT_DIR}/

Audit log (JSONL):   ${AUDIT_LOG}

═══════════════════════════════════════════════════════════════
EOF

    # JSON summary
    cat > "${AUDIT_JSON}" <<EOF
{
  "timestamp": "${AUDIT_TIMESTAMP}",
  "autofix": ${AUTO_FIX},
  "summary": {
    "total": ${TOTAL_AUDITS},
    "passed": ${PASSED_AUDITS},
    "failed": ${FAILED_AUDITS},
    "critical": ${TOTAL_CRITICAL},
    "high": ${TOTAL_HIGH},
    "medium": ${TOTAL_MEDIUM},
    "low": ${TOTAL_LOW}
  },
  "production_ready": $(if [[ ${TOTAL_CRITICAL} -eq 0 ]] && [[ ${TOTAL_HIGH} -eq 0 ]] && [[ ${TOTAL_MEDIUM} -le 5 ]]; then echo "true"; else echo "false"; fi),
  "audit_directories": {
    "github": "${GITHUB_AUDIT_DIR}",
    "devcontainer": "${DEVCONTAINER_AUDIT_DIR}",
    "openapi": "${OPENAPI_AUDIT_DIR}",
    "apps": "${APP_AUDIT_DIR}"
  },
  "audit_trail": "${AUDIT_TRAIL_DIR}"
}
EOF

    log_success "Summary reports generated"
}

print_final_results() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                      FINAL RESULTS                            ║"
    echo "╠═══════════════════════════════════════════════════════════════╣"
    printf "║  Audits: %d/%d passed" ${PASSED_AUDITS} ${TOTAL_AUDITS}
    printf "%*s║\n" $((55 - ${#PASSED_AUDITS} - ${#TOTAL_AUDITS})) ""
    printf "║  Critical: %-3d  High: %-3d  Medium: %-3d  Low: %-3d     ║\n" \
        ${TOTAL_CRITICAL} ${TOTAL_HIGH} ${TOTAL_MEDIUM} ${TOTAL_LOW}
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    
    if [[ ${TOTAL_CRITICAL} -gt 0 ]] || [[ ${TOTAL_HIGH} -gt 0 ]]; then
        echo -e "${RED}❌ NOT PRODUCTION READY${NC} - Critical or High severity issues found"
        echo ""
        echo "Review detailed results:"
        cat "${AUDIT_SUMMARY}"
        return 2
    elif [[ ${FAILED_AUDITS} -gt 0 ]]; then
        echo -e "${YELLOW}⚠️  REVIEW REQUIRED${NC} - Some audits completed with issues"
        echo ""
        echo "Summary: ${AUDIT_SUMMARY}"
        return 1
    else
        echo -e "${GREEN}✅ PRODUCTION READY${NC} - All audits passed"
        echo ""
        echo "Summary: ${AUDIT_SUMMARY}"
        return 0
    fi
}

# -----------------------------------------------------------------------------
# Main Execution
# -----------------------------------------------------------------------------

main() {
    print_header
    
    # Parse command line arguments
    if [[ $# -eq 0 ]]; then
        # No arguments - run all audits
        SELECTED_AUDITS=("${AVAILABLE_AUDITS[@]}")
    elif [[ "$1" == "all" ]]; then
        # Explicit "all" - run all audits
        SELECTED_AUDITS=("${AVAILABLE_AUDITS[@]}")
    else
        # Run specified audits
        SELECTED_AUDITS=("$@")
    fi
    
    log_info "Selected audits: ${SELECTED_AUDITS[*]}"
    
    setup_directories
    
    # Run each selected audit
    for audit in "${SELECTED_AUDITS[@]}"; do
        case "${audit}" in
            github)
                run_audit "GitHub" "${SCRIPT_DIR}/github-audit.sh" || true
                ;;
            devcontainer)
                run_audit "DevContainer" "${SCRIPT_DIR}/devcontainer-audit.sh" || true
                ;;
            openapi)
                run_audit "OpenAPI" "${SCRIPT_DIR}/openapi-audit-fast.sh" || true
                ;;
            apps)
                log_info "Running App-Specific Audits"
                run_audit "App: API" "${SCRIPT_DIR}/app-audit-api.sh" "app-audit/api/audit-results.json" || true
                run_audit "App: Web" "${SCRIPT_DIR}/app-audit-web.sh" "app-audit/web/audit-results.json" || true
                run_audit "App: Worker" "${SCRIPT_DIR}/app-audit-worker.sh" "app-audit/worker/audit-results.json" || true
                run_audit "App: GameServer" "${SCRIPT_DIR}/app-audit-game-server.sh" "app-audit/game-server/audit-results.json" || true
                run_audit "App: Shell" "${SCRIPT_DIR}/app-audit-shell.sh" "app-audit/shell/audit-results.json" || true
                run_audit "App: AuthRemote" "${SCRIPT_DIR}/app-audit-feature-auth-remote.sh" "app-audit/feature-auth-remote/audit-results.json" || true
                run_audit "App: DashboardRemote" "${SCRIPT_DIR}/app-audit-feature-dashboard-remote.sh" "app-audit/feature-dashboard-remote/audit-results.json" || true
                # TODO: e2e, load-test, infrastructure (non-critical)
                ;;
            *)
                log_error "Unknown audit: ${audit}"
                ;;
        esac
    done
    
    generate_summary
    print_final_results
}

main "$@"
