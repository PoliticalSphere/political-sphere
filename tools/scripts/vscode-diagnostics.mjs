#!/usr/bin/env node
/**
 * VS Code Workspace Diagnostics
 * Cross-platform Node.js script for VS Code environment validation
 * Replaces bash-dependent tasks for full Windows compatibility
 *
 * @artifact-name: VS Code Diagnostics Script
 * @artifact-purpose: Cross-platform workspace validation utilities
 * @artifact-criticality: low
 * @artifact-owner: engineering
 * @compliance: QUAL-01, OPS-01
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const COMMANDS = {
  'validate-config': validateVSCodeConfig,
  'check-extensions': checkExtensionCompatibility,
  'health-check': checkVSCodeHealth,
  'audit-security': auditSecuritySettings,
  'profile-performance': profileWorkspacePerformance,
};

const command = process.argv[2];

if (!command || !COMMANDS[command]) {
  console.error(`Usage: node vscode-diagnostics.mjs <command>
  
Available commands:
  validate-config    - Validate .vscode configuration files
  check-extensions   - Check installed extension compatibility
  health-check       - Monitor VS Code process health
  audit-security     - Audit security-related settings
  profile-performance - Profile large folders and tsserver settings

Example:
  node tools/scripts/vscode-diagnostics.mjs validate-config`);
  process.exit(1);
}

try {
  COMMANDS[command]();
  process.exit(0);
} catch (error) {
  console.error(`Error executing ${command}:`, error.message);
  process.exit(1);
}

/**
 * Validate VS Code configuration files
 * Checks existence and basic readability of .vscode directory
 * Note: VS Code uses JSONC (JSON with Comments), so we don't do strict JSON validation
 */
function validateVSCodeConfig() {
  console.log('Validating VS Code configuration...\n');

  const vscodePath = join(process.cwd(), '.vscode');
  if (!existsSync(vscodePath)) {
    console.error('❌ .vscode directory not found');
    process.exit(1);
  }

  const configFiles = ['settings.json', 'tasks.json', 'launch.json', 'extensions.json'];
  let hasErrors = false;

  for (const file of configFiles) {
    const filePath = join(vscodePath, file);
    if (!existsSync(filePath)) {
      console.log(`⚠️  ${file}: Not found (optional)`);
      continue;
    }

    try {
      // Just verify we can read the file
      const content = readFileSync(filePath, 'utf-8');
      if (content.length === 0) {
        console.error(`❌ ${file}: Empty file`);
        hasErrors = true;
      } else {
        // VS Code JSONC files can start with comments, so just check they contain JSON structure
        const hasJsonStructure = content.includes('{') || content.includes('[');
        if (!hasJsonStructure) {
          console.error(`❌ ${file}: Does not appear to be JSON`);
          hasErrors = true;
        } else {
          console.log(`✅ ${file}: Valid (${(content.length / 1024).toFixed(1)} KB)`);
        }
      }
    } catch (error) {
      console.error(`❌ ${file}: ${error.message}`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error('\n❌ Configuration validation failed');
    process.exit(1);
  }

  console.log('\n✅ All VS Code configurations are valid');
  console.log('Note: This validates file existence and basic structure.');
  console.log('VS Code will report any JSONC syntax errors when you edit the files.');
} /**
 * Check installed VS Code extensions for required tools
 * Validates presence of ESLint, Prettier, Vitest, Copilot
 */
function checkExtensionCompatibility() {
  console.log('Checking VS Code extension compatibility...\n');

  const requiredExtensions = [
    { id: 'dbaeumer.vscode-eslint', name: 'ESLint' },
    { id: 'esbenp.prettier-vscode', name: 'Prettier' },
    { id: 'vitest.explorer', name: 'Vitest' },
    { id: 'github.copilot', name: 'GitHub Copilot' },
  ];

  try {
    // Get installed extensions list
    const output = execSync('code --list-extensions', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const installed = new Set(
      output
        .trim()
        .split('\n')
        .map(ext => ext.toLowerCase())
    );

    let allPresent = true;
    for (const { id, name } of requiredExtensions) {
      if (installed.has(id.toLowerCase())) {
        console.log(`✅ ${name}: Installed (${id})`);
      } else {
        console.log(`⚠️  ${name}: Not installed (${id})`);
        allPresent = false;
      }
    }

    if (!allPresent) {
      console.log('\n⚠️  Some recommended extensions are missing');
      console.log('Install them from .vscode/extensions.json recommendations');
    } else {
      console.log('\n✅ All recommended extensions are installed');
    }
  } catch {
    console.log('⚠️  Unable to check extensions (VS Code CLI not available)');
    console.log('This is expected on non-desktop environments or if VS Code is not in PATH');
  }
}

/**
 * Monitor VS Code process health
 * Cross-platform process detection
 */
function checkVSCodeHealth() {
  console.log('Monitoring VS Code process health...\n');

  try {
    let command;
    if (process.platform === 'win32') {
      command = 'tasklist /FI "IMAGENAME eq Code.exe" /FO CSV /NH';
    } else {
      command = 'ps aux | grep -i "[c]ode" | head -5';
    }

    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const processes = output
      .trim()
      .split('\n')
      .filter(line => line.length > 0);

    if (processes.length === 0) {
      console.log('⚠️  No VS Code processes detected');
      console.log('This is normal if VS Code is not currently running');
    } else {
      console.log(`✅ Found ${processes.length} VS Code process(es):`);
      processes.forEach((proc, idx) => {
        console.log(`   ${idx + 1}. ${proc.substring(0, 100)}${proc.length > 100 ? '...' : ''}`);
      });
    }
  } catch {
    console.log('⚠️  Process listing not available on this platform');
  }
}

/**
 * Profile common VS Code hotspots that slow extension host or tsserver
 */
function profileWorkspacePerformance() {
  console.log('Profiling VS Code workspace hotspots...\n');

  const hotspots = [
    {
      label: 'Workspace node_modules',
      path: 'node_modules',
      warnMB: 600,
      tip: "Run 'npm run perf:cache-clear' to shrink root dependencies if needed.",
    },
    {
      label: '.nx cache',
      path: '.nx/cache',
      warnMB: 50,
      tip: "Clean with 'npm run perf:cache-clear' to reduce watch load.",
    },
    {
      label: 'logs',
      path: 'logs',
      warnMB: 25,
      tip: "Rotate logs via 'npm run cleanup' to keep search snappy.",
    },
    {
      label: 'test-results',
      path: 'test-results',
      warnMB: 10,
      tip: 'Delete stale coverage/result artifacts when not needed.',
    },
    {
      label: 'apps/api/openapi/node_modules',
      path: 'apps/api/openapi/node_modules',
      warnMB: 200,
      tip: 'Prune OpenAPI generator dependencies if they are only needed in CI.',
    },
  ];

  const followUps = [];

  for (const hotspot of hotspots) {
    const sizeMb = getDirectorySizeMB(hotspot.path);
    if (sizeMb === null) {
      console.log(`⚪️  ${hotspot.label}: not found (skipped)`);
      continue;
    }

    const rounded = sizeMb.toFixed(1);
    if (hotspot.warnMB && sizeMb > hotspot.warnMB) {
      console.log(`⚠️  ${hotspot.label}: ${rounded} MB (target < ${hotspot.warnMB} MB)`);
      followUps.push(`${hotspot.label} is ${rounded} MB. ${hotspot.tip}`);
    } else {
      console.log(`✅ ${hotspot.label}: ${rounded} MB`);
    }
  }

  const trackedFiles = getTrackedJsTsFileCount();
  if (trackedFiles !== null) {
    console.log(`\nℹ️  Tracked JS/TS sources: ${trackedFiles}`);
    if (trackedFiles > 2500) {
      followUps.push(
        'Very large TypeScript surface detected. Consider enabling partial semantic server mode.'
      );
    }
  }

  const tsserverMemory = readTsserverMemorySetting();
  if (tsserverMemory !== null) {
    console.log(`ℹ️  TypeScript server memory limit: ${tsserverMemory} MB`);
    if (tsserverMemory > 4096) {
      followUps.push(
        `TypeScript server memory is capped at ${tsserverMemory} MB. Lowering to 4096 MB helps on 16 GB machines.`
      );
    }
  }

  if (followUps.length) {
    console.log('\nRecommended follow-ups:');
    for (const item of followUps) {
      console.log(`  - ${item}`);
    }
  } else {
    console.log('\n✅ No immediate VS Code hotspots detected.');
  }

  console.log("\nTip: run 'npm run perf:vscode-profile' after cleanups to verify improvements.");
}

/**
 * Audit security-related settings in .vscode directory
 * Scans for security/trust/secret keywords
 */
function auditSecuritySettings() {
  console.log('Auditing VS Code security settings...\n');

  const vscodePath = join(process.cwd(), '.vscode');
  if (!existsSync(vscodePath)) {
    console.error('❌ .vscode directory not found');
    process.exit(1);
  }

  const configFiles = ['settings.json', 'tasks.json', 'launch.json'];
  const patterns = ['security', 'trust', 'secret', 'password', 'token', 'key'];
  const findings = [];

  for (const file of configFiles) {
    const filePath = join(vscodePath, file);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const lowerLine = line.toLowerCase();
      for (const pattern of patterns) {
        if (lowerLine.includes(pattern) && !line.trim().startsWith('//')) {
          findings.push({
            file,
            line: idx + 1,
            content: line.trim(),
            pattern,
          });
        }
      }
    });
  }

  if (findings.length === 0) {
    console.log('✅ No security-related settings found');
  } else {
    console.log(`Found ${findings.length} security-related setting(s):\n`);
    findings.forEach(({ file, line, content, pattern }) => {
      console.log(`${file}:${line} (${pattern})`);
      console.log(`  ${content}\n`);
    });
    console.log('⚠️  Review these settings to ensure no secrets are hardcoded');
  }
}

function getDirectorySizeMB(relativePath) {
  const directory = join(process.cwd(), relativePath);
  if (!existsSync(directory)) {
    return null;
  }

  try {
    if (process.platform === 'win32') {
      const escaped = directory.replace(/'/g, "''");
      const output = execSync(
        `powershell -NoProfile -Command "(Get-ChildItem -LiteralPath '${escaped}' -ErrorAction SilentlyContinue -Recurse | Measure-Object -Property Length -Sum).Sum"`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
      ).trim();
      const bytes = parseInt(output, 10);
      if (Number.isNaN(bytes)) {
        return null;
      }
      return bytes / (1024 * 1024);
    }

    const sanitized = directory.replace(/"/g, '\\"');
    const output = execSync(`du -sk "${sanitized}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    const kilobytes = parseInt(output.split(/\s+/)[0], 10);
    if (Number.isNaN(kilobytes)) {
      return null;
    }
    return kilobytes / 1024;
  } catch {
    return null;
  }
}

function getTrackedJsTsFileCount() {
  try {
    const output = execSync('git ls-files -- "*.ts" "*.tsx" "*.js" "*.jsx"', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    if (!output) {
      return 0;
    }
    return output.split('\n').filter(Boolean).length;
  } catch {
    return null;
  }
}

function readTsserverMemorySetting() {
  try {
    const settingsPath = join(process.cwd(), '.vscode', 'settings.json');
    if (!existsSync(settingsPath)) {
      return null;
    }
    const content = readFileSync(settingsPath, 'utf-8');
    const match = content.match(/"typescript\.tsserver\.maxTsServerMemory"\s*:\s*(\d+)/);
    return match ? Number(match[1]) : null;
  } catch {
    return null;
  }
}
