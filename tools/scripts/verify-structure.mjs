#!/usr/bin/env node

/**
 * Verify Repository Structure Against file-structure.md
 *
 * Compares actual directory structure with canonical specification
 * and reports any missing directories or misalignments.
 *
 * Usage:
 *   node tools/scripts/verify-structure.mjs
 *
 * @version 1.0.0
 * @date 2025-11-10
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// Expected structure from file-structure.md v2.4.0
const EXPECTED_STRUCTURE = {
  'apps/': {
    'api/': { required: true, type: 'core-service' },
    'game-server/': { required: true, type: 'core-service' },
    'worker/': { required: true, type: 'core-service' },
    'web/': { required: true, type: 'frontend' },
    'shell/': { required: true, type: 'frontend' },
    'feature-auth-remote/': { required: true, type: 'frontend' },
    'feature-dashboard-remote/': { required: true, type: 'frontend' },
    'infrastructure/': { required: true, type: 'support' },
    'e2e/': { required: true, type: 'support' },
    'load-test/': { required: true, type: 'support' },
    'dev/': { required: true, type: 'support' },
  },
  'libs/': {
    'shared/': {
      required: true,
      subdirs: {
        'utils/': { required: true },
        'types/': { required: true },
        'constants/': { required: true },
        'config/': { required: true },
        'schemas/': { required: true },
      },
    },
    'platform/': {
      required: true,
      subdirs: {
        'auth/': { required: true },
        'api-client/': { required: true },
        'state/': { required: true },
        'routing/': { required: true },
      },
    },
    'ui/': {
      required: true,
      subdirs: {
        'components/': { required: true },
        'design-system/': { required: true },
        'accessibility/': { required: true },
      },
    },
    'game-engine/': {
      required: true,
      subdirs: {
        'core/': { required: true },
        'simulation/': { required: true },
        'events/': { required: true },
      },
    },
    'domain-election/': { required: true },
    'domain-governance/': { required: true },
    'domain-legislation/': { required: true },
    'data-user/': { required: true },
    'data-game-state/': { required: true },
    'feature-flags/': { required: true },
    'i18n/': { required: true },
    'observability/': { required: true },
    'testing/': { required: true },
  },
  'docs/': {
    '00-foundation/': { required: true },
    '01-strategy/': { required: true },
    '02-governance/': { required: true },
    '03-legal-and-compliance/': { required: true },
    '04-architecture/': { required: true },
    '05-engineering-and-devops/': { required: true },
    '06-security-and-risk/': { required: true },
    '07-ai-and-simulation/': { required: true },
    '08-game-design-and-mechanics/': { required: true },
    '09-observability-and-ops/': { required: true },
  },
  'tools/': {
    'scripts/': { required: true },
    'config/': { required: false },
  },
  'scripts/': {
    'ci/': { required: true },
    'migrations/': { required: false },
  },
  'config/': {
    'docker/': { required: true },
    'env/': { required: true },
    'typescript/': { required: true },
    'vitest/': { required: true },
  },
  'reports/': {
    'app-audit/': { required: true },
    'github-audit/': { required: true },
    'devcontainer-audit/': { required: true },
    'openapi-audit/': { required: true },
  },
};

class StructureVerifier {
  constructor() {
    this.issues = {
      missing: [],
      unexpected: [],
      misplaced: [],
    };
    this.stats = {
      checked: 0,
      passed: 0,
      failed: 0,
    };
  }

  async pathExists(p) {
    try {
      const fullPath = path.join(ROOT_DIR, p);
      const stats = await fs.stat(fullPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  async getDirectories(basePath) {
    try {
      const fullPath = path.join(ROOT_DIR, basePath);
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      return entries.filter(entry => entry.isDirectory()).map(entry => entry.name + '/');
    } catch {
      return [];
    }
  }

  log(message, level = 'info') {
    const colors = {
      info: '\x1b[36m', // Cyan
      success: '\x1b[32m', // Green
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
      reset: '\x1b[0m',
    };

    const color = colors[level] || colors.info;
    console.log(`${color}${message}${colors.reset}`);
  }

  async verifyDirectory(basePath, expectedDirs) {
    const actualDirs = await this.getDirectories(basePath);

    // Check for required directories
    for (const [dirName, config] of Object.entries(expectedDirs)) {
      this.stats.checked++;
      const fullPath = path.join(basePath, dirName);

      if (await this.pathExists(fullPath)) {
        this.stats.passed++;

        // Check subdirectories if specified
        if (config.subdirs) {
          await this.verifyDirectory(fullPath, config.subdirs);
        }
      } else {
        this.stats.failed++;
        this.issues.missing.push({
          path: fullPath,
          required: config.required,
          type: config.type || 'directory',
        });
      }
    }

    // Check for unexpected directories (only report if not in expected list)
    const expectedNames = Object.keys(expectedDirs);
    const unexpectedDirs = actualDirs.filter(dir => !expectedNames.includes(dir));

    for (const dir of unexpectedDirs) {
      // Filter out common acceptable directories
      const acceptable = [
        'node_modules/',
        '.git/',
        '.nx/',
        'dist/',
        'build/',
        '.next/',
        '.turbo/',
        'coverage/',
        '.temp/',
        '.cache/',
        'logs/',
        'tmp/',
      ];

      if (!acceptable.includes(dir)) {
        this.issues.unexpected.push({
          path: path.join(basePath, dir),
          note: 'Not in file-structure.md specification',
        });
      }
    }
  }

  async verifyAppsStructure() {
    this.log('\n=== Verifying apps/ Structure ===', 'info');
    await this.verifyDirectory('apps/', EXPECTED_STRUCTURE['apps/']);
  }

  async verifyLibsStructure() {
    this.log('\n=== Verifying libs/ Structure ===', 'info');
    await this.verifyDirectory('libs/', EXPECTED_STRUCTURE['libs/']);
  }

  async verifyDocsStructure() {
    this.log('\n=== Verifying docs/ Structure ===', 'info');
    await this.verifyDirectory('docs/', EXPECTED_STRUCTURE['docs/']);
  }

  async verifyToolsStructure() {
    this.log('\n=== Verifying tools/ Structure ===', 'info');
    await this.verifyDirectory('tools/', EXPECTED_STRUCTURE['tools/']);
  }

  async verifyScriptsStructure() {
    this.log('\n=== Verifying scripts/ Structure ===', 'info');
    await this.verifyDirectory('scripts/', EXPECTED_STRUCTURE['scripts/']);
  }

  async verifyConfigStructure() {
    this.log('\n=== Verifying config/ Structure ===', 'info');
    await this.verifyDirectory('config/', EXPECTED_STRUCTURE['config/']);
  }

  async verifyReportsStructure() {
    this.log('\n=== Verifying reports/ Structure ===', 'info');
    await this.verifyDirectory('reports/', EXPECTED_STRUCTURE['reports/']);
  }

  generateReport() {
    this.log('\n' + '='.repeat(80), 'info');
    this.log('STRUCTURE VERIFICATION REPORT', 'info');
    this.log('='.repeat(80), 'info');

    // Statistics
    this.log('\nStatistics:', 'info');
    this.log(`  Total checks: ${this.stats.checked}`);
    this.log(`  Passed: ${this.stats.passed}`, 'success');
    this.log(`  Failed: ${this.stats.failed}`, this.stats.failed > 0 ? 'error' : 'success');

    // Missing directories
    if (this.issues.missing.length > 0) {
      this.log('\nMissing Directories:', 'error');
      this.issues.missing.forEach(issue => {
        const required = issue.required ? '[REQUIRED]' : '[OPTIONAL]';
        this.log(`  ✗ ${required} ${issue.path}`, 'error');
      });
    } else {
      this.log('\n✓ No missing required directories', 'success');
    }

    // Unexpected directories
    if (this.issues.unexpected.length > 0) {
      this.log('\nUnexpected Directories (not in spec):', 'warn');
      this.issues.unexpected.forEach(issue => {
        this.log(`  ⚠ ${issue.path}`, 'warn');
        if (issue.note) {
          this.log(`    Note: ${issue.note}`, 'warn');
        }
      });
    }

    // Summary
    this.log('\n' + '='.repeat(80), 'info');
    const allPassed = this.stats.failed === 0 && this.issues.missing.length === 0;
    if (allPassed) {
      this.log('✓ Repository structure matches file-structure.md v2.4.0', 'success');
    } else {
      this.log('✗ Repository structure has discrepancies', 'error');
      this.log('\nRecommended Actions:', 'warn');
      if (this.issues.missing.length > 0) {
        this.log('  1. Run: node tools/scripts/align-to-file-structure.mjs --execute', 'warn');
      }
      if (this.issues.unexpected.length > 0) {
        this.log('  2. Review unexpected directories and move/remove as needed', 'warn');
      }
    }
    this.log('='.repeat(80) + '\n', 'info');

    return {
      passed: allPassed,
      stats: this.stats,
      issues: this.issues,
    };
  }

  async saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      specification: 'file-structure.md v2.4.0',
      stats: this.stats,
      issues: this.issues,
      summary: {
        compliant: this.stats.failed === 0 && this.issues.missing.length === 0,
        totalIssues: this.issues.missing.length + this.issues.unexpected.length,
      },
    };

    const reportPath = path.join(ROOT_DIR, 'reports/structure-verification.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    this.log(`Report saved to: ${reportPath}`, 'info');
    return report;
  }

  async run() {
    try {
      this.log('='.repeat(80), 'info');
      this.log('REPOSITORY STRUCTURE VERIFICATION', 'info');
      this.log('Target: file-structure.md v2.4.0', 'info');
      this.log('='.repeat(80), 'info');

      await this.verifyAppsStructure();
      await this.verifyLibsStructure();
      await this.verifyDocsStructure();
      await this.verifyToolsStructure();
      await this.verifyScriptsStructure();
      await this.verifyConfigStructure();
      await this.verifyReportsStructure();

      const result = this.generateReport();
      await this.saveReport();

      return result.passed ? 0 : 1;
    } catch (error) {
      this.log(`\n✗ Fatal error: ${error.message}`, 'error');
      console.error(error);
      return 1;
    }
  }
}

// CLI
async function main() {
  const verifier = new StructureVerifier();
  const exitCode = await verifier.run();
  process.exit(exitCode);
}

main();
