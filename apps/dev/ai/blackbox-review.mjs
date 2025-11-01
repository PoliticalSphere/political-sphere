#!/usr/bin/env node

// Blackbox AI-powered code review assistant
// Integrates with Blackbox API for enhanced code analysis

import { execSync } from 'child_process';
import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// repo root (three levels up from apps/dev/ai)
const ROOT = path.resolve(__dirname, '../../..');
const CACHE_FILE = path.join(ROOT, 'ai-cache', 'cache.json');
const CONTROLS_FILE = path.join(ROOT, 'ai-controls.json');
const METRICS_FILE = path.join(ROOT, 'ai-metrics.json');

async function recordMetric(entry) {
  try {
    const raw = await fsp.readFile(METRICS_FILE, 'utf8').catch(() => null);
    const metrics = raw ? JSON.parse(raw) : { scriptRuns: [] };
    metrics.scriptRuns = metrics.scriptRuns || [];
    metrics.scriptRuns.push(entry);
    await fsp.writeFile(METRICS_FILE, JSON.stringify(metrics, null, 2));
  } catch (err) {
    // non-fatal
  }
}

function getChangedFiles() {
  try {
    const output = execSync('git diff --name-only HEAD~1', {
      cwd: ROOT,
      encoding: 'utf8',
    });
    return output
      .trim()
      .split('\n')
      .filter((f) => f);
  } catch (e) {
    console.log('No previous commit found, using all files');
    return [];
  }
}

async function fastPathFromCache() {
  // Allow immediate bypass for full analysis when testing: set SKIP_FAST=1
  if (process.env.SKIP_FAST === '1') {
    console.log('SKIP_FAST=1 -> skipping fast-path cache');
    return false;
  }
  try {
    let fastMode = false;
    if (process.env.FAST_AI === '1') fastMode = true;
    try {
      const rawControls = await fsp.readFile(CONTROLS_FILE, 'utf8').catch(() => null);
      if (rawControls) {
        const controls = JSON.parse(rawControls);
        if (controls.fastMode?.enabled) fastMode = true;
      }
    } catch (e) {
      // ignore
    }

    if (!fastMode) return false;

    const raw = await fsp.readFile(CACHE_FILE, 'utf8').catch(() => null);
    if (!raw) return false;
    const cache = JSON.parse(raw);
    const entries = Object.values(cache.queries || {}).slice(0, 10);
    if (entries.length === 0) return false;

    console.log('\n🔁 Fast-mode: serving cached responses (first 10)');
    entries.forEach((e, i) => {
      console.log(`\n--- Cached [${i + 1}] Query: ${e.query}`);
      console.log(e.response || '(no response cached)');
    });
    // record metric for fast cache hit
    await recordMetric({
      script: 'blackbox-review',
      mode: 'fast',
      timestamp: new Date().toISOString(),
      cachedResponses: entries.length,
    });
    return true;
  } catch (err) {
    return false;
  }
}

function analyzeFile(filePath) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) return null;

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');

  const functions = (
    content.match(/\bfunction\s+\w+\s*\(|\bconst\s+\w+\s*=\s*\(?\s*\w*\s*=>/g) || []
  ).length;
  const classes = (content.match(/class\s+\w+/g) || []).length;
  const imports = (content.match(/\bimport\b|\brequire\(/g) || []).length;

  // Heuristic checks
  const todos = content.match(/\b(TODO|FIXME|HACK|XXX)\b/g) || [];
  const consoleLogs = content.match(/console\.(log|error|warn|debug)\s*\(/g) || [];

  // Find async functions and check for try/catch presence inside them (simple heuristic)
  const asyncFuncMatches = [
    ...content.matchAll(/async\s+function\s+\w+|async\s*\([^)]*\)\s*=>|:\s*async\s*\(/g),
  ];
  let asyncWithoutTry = 0;
  if (asyncFuncMatches.length > 0) {
    // naive: split by async keywords and check following 200 chars for try
    for (const m of asyncFuncMatches) {
      const idx = m.index + (m[0] ? m[0].length : 0);
      const snippet = content.slice(idx, idx + 1000);
      if (!/\btry\b/.test(snippet)) asyncWithoutTry++;
    }
  }

  // Large function heuristic: look for function blocks with many lines
  const largeFunctions = [];
  const functionBlocks = content.split(/\n(?=\s*(?:function|const)\s)/);
  for (const block of functionBlocks) {
    const ln = block.split('\n').length;
    if (ln > 200) largeFunctions.push({ lines: ln, preview: block.slice(0, 200) });
  }

  // Basic maintainability score (simple heuristic)
  let score = 100;
  score -= Math.min(20, todos.length * 5);
  score -= Math.min(30, consoleLogs.length * 3);
  score -= Math.min(30, asyncWithoutTry * 5);
  score -= Math.min(20, largeFunctions.length * 10);

  const analysis = {
    file: filePath,
    lines: lines.length,
    functions,
    classes,
    imports,
    todos: todos.length,
    consoleLogs: consoleLogs.length,
    asyncWithoutTry,
    largeFunctions: largeFunctions.length,
    maintainabilityScore: Math.max(0, Math.round(score)),
  };

  return analysis;
}

function summarizeFindings(changedFiles) {
  const analyses = changedFiles.map(analyzeFile).filter(Boolean);
  if (analyses.length === 0) return 'No analysable files found.';

  const findings = [];
  for (const a of analyses) {
    const fileFindings = [];
    if (a.todos > 0)
      fileFindings.push({ severity: 'medium', message: `${a.todos} TODO/FIXME/HACK comments` });
    if (a.consoleLogs > 0)
      fileFindings.push({ severity: 'low', message: `${a.consoleLogs} console.* calls present` });
    if (a.asyncWithoutTry > 0)
      fileFindings.push({
        severity: 'high',
        message: `${a.asyncWithoutTry} async functions may lack try/catch`,
      });
    if (a.largeFunctions > 0)
      fileFindings.push({
        severity: 'medium',
        message: `${a.largeFunctions} very large function(s) (>200 lines)`,
      });
    if (a.maintainabilityScore < 50)
      fileFindings.push({
        severity: 'high',
        message: `Low maintainability score: ${a.maintainabilityScore}`,
      });

    findings.push({
      file: a.file,
      summary: `Lines: ${a.lines}, funcs: ${a.functions}, classes: ${a.classes}`,
      issues: fileFindings,
    });
  }

  // Create a human-readable summary
  let out = '';
  out += `Analysis of ${analyses.length} file(s):\n`;
  for (const f of findings) {
    out += `\nFile: ${f.file}\n  ${f.summary}\n`;
    if (f.issues.length === 0) {
      out += '  No immediate issues found.\n';
    } else {
      for (const issue of f.issues) {
        out += `  - [${issue.severity.toUpperCase()}] ${issue.message}\n`;
      }
    }
  }

  // Top-level recommendations
  out += `\nRecommendations:\n`;
  out += ` - Address high-severity async functions by adding try/catch and proper error handling.\n`;
  out += ` - Remove or replace console.* calls with structured logger in production code.\n`;
  out += ` - Resolve TODO/FIXME comments before merging critical changes.\n`;
  out += ` - Consider refactoring very large functions into smaller units to improve testability and readability.\n`;
  out += ` - Run unit tests and static analyzers (lint, typecheck) locally to catch additional issues.\n`;

  return out;
}

async function main() {
  console.log('🤖 Blackbox AI Code Review Assistant');
  console.log('=====================================');
  const changedFiles = getChangedFiles();
  // Fast-path: if fast mode enabled and cache has entries, print cached responses and exit quickly
  const startedAt = Date.now();
  const fast = await fastPathFromCache();
  if (fast) return;
  if (changedFiles.length === 0) {
    console.log('No changed files detected.');
    return;
  }

  console.log(`Analyzing ${changedFiles.length} changed files...`);
  // Perform local static analysis and output findings
  const report = summarizeFindings(changedFiles);
  console.log('\n📋 Static Analysis Report:');
  console.log(report);

  // Record metric for analysis run
  try {
    await recordMetric({
      script: 'blackbox-review',
      mode: 'analysis',
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      analysedFiles: changedFiles.length,
    });
  } catch (e) {
    // ignore metric errors
  }
}

if (__filename === process.argv[1]) {
  main().catch(console.error);
}
