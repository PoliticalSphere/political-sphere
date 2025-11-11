#!/usr/bin/env node

/**
 * Apps Directory Structure Alignment Script
 *
 * Aligns apps/ directory with canonical file-structure.md v2.4.0
 *
 * @version 1.0.0
 * @see docs/architecture/file-structure.md
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '../..');

// Expected apps from file-structure.md
const EXPECTED_APPS = [
  'api',
  'web',
  'game-server',
  'worker',
  'shell',
  'feature-auth-remote',
  'feature-dashboard-remote',
  'e2e',
  'load-test',
  'infrastructure',
  'docs-site', // May not exist yet
  'dev', // Experimental/development app
];

// Apps-specific subdirectories that should exist
const REQUIRED_SUBDIRS = {
  api: [
    'src',
    'src/config',
    'src/controllers',
    'src/middleware',
    'src/routes',
    'src/services',
    'src/repositories',
    'src/validators',
    'src/utils',
    'src/types',
    'openapi',
    'prisma',
    'tests',
    'tests/unit',
    'tests/integration',
    'tests/fixtures',
  ],
  web: [
    'public',
    'src',
    'src/app',
    'src/pages',
    'src/components',
    'src/components/common',
    'src/components/layout',
    'src/components/features',
    'src/hooks',
    'src/services',
    'src/store',
    'src/router',
    'src/styles',
    'src/utils',
    'src/types',
    'src/assets',
    'tests',
    'tests/unit',
    'tests/integration',
    'tests/e2e',
  ],
  'game-server': [
    'src',
    'src/engine',
    'src/simulation',
    'src/events',
    'src/networking',
    'src/ai',
    'src/utils',
    'tests',
    'tests/unit',
    'tests/integration',
  ],
  worker: ['src', 'src/jobs', 'src/queues', 'src/utils', 'tests'],
  shell: ['src', 'src/components', 'src/remotes'],
  'feature-auth-remote': ['src', 'src/components', 'src/services'],
  'feature-dashboard-remote': ['src', 'src/components', 'src/services'],
  e2e: ['src', 'src/api', 'src/web', 'src/smoke', 'fixtures'],
  'load-test': ['src', 'src/scenarios', 'src/utils'],
  infrastructure: [
    'docker',
    'docker/base-images',
    'kubernetes',
    'kubernetes/base',
    'kubernetes/overlays',
    'kubernetes/overlays/dev',
    'kubernetes/overlays/staging',
    'kubernetes/overlays/production',
    'kubernetes/monitoring',
    'helm',
    'terraform',
    'terraform/modules',
    'terraform/environments',
    'terraform/global',
    'argocd',
    'argocd/applications',
    'argocd/projects',
    'ci',
    'ci/scripts',
    'scripts',
    'scripts/backup',
    'scripts/monitoring',
    'scripts/maintenance',
    'docs',
    'docs/runbooks',
    'docs/architecture',
    'docs/procedures',
  ],
};

// Required files for each app
const REQUIRED_FILES = {
  api: [
    'project.json',
    'tsconfig.json',
    'README.md',
    '.env.example',
    'Dockerfile',
    '.dockerignore',
  ],
  web: [
    'project.json',
    'tsconfig.json',
    'README.md',
    '.env.example',
    'index.html',
    'vite.config.ts',
    'Dockerfile',
    '.dockerignore',
  ],
  'game-server': ['project.json', 'tsconfig.json', 'README.md', 'Dockerfile', '.dockerignore'],
  worker: ['project.json', 'tsconfig.json', 'README.md', 'Dockerfile', '.dockerignore'],
  shell: ['project.json', 'tsconfig.json', 'README.md', 'module-federation.config.ts'],
  'feature-auth-remote': [
    'project.json',
    'tsconfig.json',
    'README.md',
    'module-federation.config.ts',
  ],
  'feature-dashboard-remote': [
    'project.json',
    'tsconfig.json',
    'README.md',
    'module-federation.config.ts',
  ],
  e2e: ['project.json', 'README.md', 'playwright.config.ts'],
  'load-test': ['project.json', 'README.md'],
  infrastructure: ['project.json', 'README.md'],
};

const log = {
  info: msg => console.log(`ℹ️  ${msg}`),
  success: msg => console.log(`✅ ${msg}`),
  warning: msg => console.log(`⚠️  ${msg}`),
  error: msg => console.error(`❌ ${msg}`),
  section: msg => console.log(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`),
};

function createDirectory(path) {
  const fullPath = join(ROOT, path);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
    log.success(`Created directory: ${path}`);
    return true;
  }
  return false;
}

function createFile(path, content = '') {
  const fullPath = join(ROOT, path);
  if (!existsSync(fullPath)) {
    const dir = dirname(fullPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(fullPath, content);
    log.success(`Created file: ${path}`);
    return true;
  }
  return false;
}

function checkAppStructure(appName) {
  log.section(`Checking: ${appName}`);

  const appPath = `apps/${appName}`;
  const fullAppPath = join(ROOT, appPath);

  if (!existsSync(fullAppPath)) {
    log.warning(`App does not exist: ${appName}`);
    return { missing: true, issues: [] };
  }

  const issues = [];

  // Check required subdirectories
  const requiredDirs = REQUIRED_SUBDIRS[appName] || [];
  requiredDirs.forEach(dir => {
    const dirPath = join(fullAppPath, dir);
    if (!existsSync(dirPath)) {
      issues.push({ type: 'missing-dir', path: `${appPath}/${dir}` });
    }
  });

  // Check required files
  const requiredFiles = REQUIRED_FILES[appName] || [];
  requiredFiles.forEach(file => {
    const filePath = join(fullAppPath, file);
    if (!existsSync(filePath)) {
      issues.push({ type: 'missing-file', path: `${appPath}/${file}` });
    }
  });

  if (issues.length === 0) {
    log.success(`${appName} structure is compliant ✓`);
  } else {
    log.warning(`${appName} has ${issues.length} issues`);
  }

  return { missing: false, issues };
}

function fixAppStructure(appName, issues) {
  if (issues.length === 0) return;

  log.info(`Fixing ${issues.length} issues in ${appName}...`);

  issues.forEach(issue => {
    if (issue.type === 'missing-dir') {
      createDirectory(issue.path);
    } else if (issue.type === 'missing-file') {
      const fileName = issue.path.split('/').pop();
      let content = '';

      // Generate appropriate file content
      if (fileName === 'README.md') {
        const appTitle = appName
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        content = `# ${appTitle}\n\nTODO: Add documentation\n`;
      } else if (fileName === '.env.example') {
        content = `# Environment Variables for ${appName}\n\n# TODO: Add environment variables\n`;
      } else if (fileName === '.dockerignore') {
        content = `node_modules\n.git\n.env*\ndist\ncoverage\n*.log\n*.md\n.vscode\n.idea\ntests\n`;
      } else if (fileName === 'project.json') {
        content = JSON.stringify(
          {
            name: appName,
            $schema: '../../node_modules/nx/schemas/project-schema.json',
            sourceRoot: `apps/${appName}/src`,
            projectType: 'application',
            targets: {},
          },
          null,
          2
        );
      }

      createFile(issue.path, content);
    }
  });
}

function main() {
  log.section('Apps Directory Structure Alignment');
  log.info('Aligning apps/ with file-structure.md v2.4.0\n');

  const results = {};
  let totalIssues = 0;

  // Check all expected apps
  EXPECTED_APPS.forEach(appName => {
    const result = checkAppStructure(appName);
    results[appName] = result;
    totalIssues += result.issues.length;
  });

  // Summary
  log.section('Summary');
  const missingApps = EXPECTED_APPS.filter(app => results[app].missing);
  const appsWithIssues = EXPECTED_APPS.filter(
    app => !results[app].missing && results[app].issues.length > 0
  );

  if (missingApps.length > 0) {
    log.warning(`Missing apps: ${missingApps.join(', ')}`);
  }

  if (appsWithIssues.length > 0) {
    log.warning(`Apps with issues: ${appsWithIssues.join(', ')}`);
  }

  if (totalIssues === 0 && missingApps.length === 0) {
    log.success('All apps are compliant with file-structure.md! 🎉');
    return;
  }

  // Ask to fix
  log.info(`\nFound ${totalIssues} structural issues across ${appsWithIssues.length} apps`);
  log.info('Run with --fix to automatically create missing directories and files\n');

  if (process.argv.includes('--fix')) {
    log.section('Fixing Issues');

    appsWithIssues.forEach(appName => {
      fixAppStructure(appName, results[appName].issues);
    });

    log.success('\n✅ All issues fixed! Apps structure now compliant with file-structure.md');
    log.info('Review the changes and commit when ready.');
  }
}

main();
