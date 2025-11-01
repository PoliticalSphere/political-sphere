#!/usr/bin/env node

/**
 * Context Preloader for AI Intelligence Enhancement
 * @fileoverview Pre-loads common development contexts for faster AI responses
 */

import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pre-defined contexts for common development tasks
const PREDEFINED_CONTEXTS = {
  'new-component': {
    description: 'Creating a new React component',
    files: [
      'libs/ui/src/components/README.md',
      'libs/ui/src/components/index.ts',
      'package.json',
      'tsconfig.base.json',
    ],
    patterns: ['export.*from.*components', 'React\\.FC', 'interface.*Props', 'styled-components'],
    knowledge: [
      'architecturalPatterns.boundedContexts',
      'bestPractices.codeStyle',
      'commonIssues.accessibility',
    ],
  },
  'api-endpoint': {
    description: 'Adding a new API endpoint',
    files: [
      'apps/api/src/main.ts',
      'apps/api/src/app.module.ts',
      'libs/platform/src/api/README.md',
      'nx.json',
    ],
    patterns: ['@Controller', '@Get\\|@Post\\|@Put\\|@Delete', 'DTO', 'validation'],
    knowledge: [
      'architecturalPatterns.moduleBoundaries',
      'bestPractices.errorHandling',
      'developmentWorkflow.ci',
    ],
  },
  'database-migration': {
    description: 'Creating a database migration',
    files: ['scripts/migrate/README.md', 'package.json', 'nx.json'],
    patterns: ['migration', 'up\\|down', 'schema', 'alter table'],
    knowledge: [
      'developmentWorkflow.branching',
      'bestPractices.documentation',
      'performancePatterns.monitoring',
    ],
  },
  'test-writing': {
    description: 'Writing unit or integration tests',
    files: ['jest.preset.js', 'jest.setup.js', 'libs/testing/src/README.md'],
    patterns: ['describe\\|it\\|test', 'expect', 'mock', 'TestingLibrary'],
    knowledge: [
      'bestPractices.testing',
      'architecturalPatterns.boundedContexts',
      'commonIssues.testing',
    ],
  },
  'ci-pipeline': {
    description: 'Modifying CI/CD pipelines',
    files: ['.github/workflows/ci.yml', 'scripts/ci/README.md', 'Makefile'],
    patterns: ['workflow_dispatch', 'push\\|pull_request', 'run:', 'uses:'],
    knowledge: [
      'developmentWorkflow.ci',
      'architecturalPatterns.security',
      'performancePatterns.optimization',
    ],
  },
};

const REPO_ROOT = path.join(__dirname, '..', '..');
const METRICS_FILE = path.join(__dirname, '../../ai-metrics.json');

async function loadKnowledgeBase() {
  try {
    const kbPath = path.join(__dirname, '../../ai-knowledge/knowledge-base.json');
    const raw = await fsp.readFile(kbPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to load knowledge base:', error.message);
    return {};
  }
}

async function loadIndex() {
  try {
    const indexPath = path.join(__dirname, '../../ai-index/codebase-index.json');
    const raw = await fsp.readFile(indexPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to load index:', error.message);
    return { files: {} };
  }
}

/**
 * Read file content asynchronously and return a small set of relevant lines.
 * Uses a quick heuristic and bails out early to avoid scanning huge files fully.
 */
const FAST_AI = process.env.FAST_AI === '1' || process.env.FAST_AI === 'true';

async function extractRelevantContent(filePath, patterns, maxLines = FAST_AI ? 6 : 20) {
  try {
    const resolved = path.isAbsolute(filePath) ? filePath : path.join(REPO_ROOT, filePath);
    const content = await fsp.readFile(resolved, 'utf8');
    const relevantLines = [];

    const lines = content.split('\n');
    const lowerPatterns = patterns.map((p) => p.toLowerCase());

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const lineLower = line.toLowerCase();
      if (lowerPatterns.some((pattern) => lineLower.includes(pattern))) {
        const start = Math.max(0, index - 2);
        const end = Math.min(lines.length, index + 3);
        for (let i = start; i < end; i++) {
          const candidate = lines[i];
          if (candidate && !relevantLines.includes(candidate)) {
            relevantLines.push(candidate);
            if (relevantLines.length >= maxLines) break;
          }
        }
      }
      if (relevantLines.length >= maxLines) break;
    }

    return relevantLines;
  } catch (error) {
    console.warn(`Failed to extract content from ${filePath}:`, error.message);
    return [];
  }
}

async function buildContext(contextName) {
  const context = PREDEFINED_CONTEXTS[contextName];
  if (!context) {
    console.error(`Unknown context: ${contextName}`);
    return null;
  }

  const knowledgeBase = await loadKnowledgeBase();
  const index = await loadIndex();

  const contextData = {
    name: contextName,
    description: context.description,
    timestamp: new Date().toISOString(),
    files: {},
    knowledge: {},
    patterns: context.patterns,
  };

  // Extract relevant file content in parallel with bounded concurrency
  const filesToProcess = FAST_AI ? context.files.slice(0, 3) : context.files;
  const concurrency = Math.max(2, Math.min(8, filesToProcess.length));
  const queue = filesToProcess.slice();
  const workers = [];
  async function worker() {
    while (queue.length > 0) {
      const filePath = queue.shift();
      try {
        const resolved = path.isAbsolute(filePath) ? filePath : path.join(REPO_ROOT, filePath);
        const exists = await fsp
          .stat(resolved)
          .then(() => true)
          .catch(() => false);
        if (exists) {
          const relevantContent = await extractRelevantContent(filePath, context.patterns);
          if (relevantContent.length > 0) {
            contextData.files[filePath] = relevantContent;
          }
        }
      } catch (error) {
        // ignore per-file errors to keep preloading resilient
      }
    }
  }
  for (let i = 0; i < concurrency; i++) workers.push(worker());
  await Promise.all(workers);

  // Extract relevant knowledge
  context.knowledge.forEach((knowledgePath) => {
    const keys = knowledgePath.split('.');
    let value = knowledgeBase;
    for (const key of keys) {
      value = value?.[key];
    }
    if (value) {
      contextData.knowledge[knowledgePath] = value;
    }
  });

  // Find related files from index (simple heuristic)
  const relatedFiles = [];
  for (const [filePath, fileInfo] of Object.entries(index.files || {})) {
    if (
      context.patterns.some(
        (pattern) =>
          (fileInfo.functions || []).some((f) => f.toLowerCase().includes(pattern.toLowerCase())) ||
          (fileInfo.classes || []).some((c) => c.toLowerCase().includes(pattern.toLowerCase())) ||
          (fileInfo.summary || '').toLowerCase().includes(pattern.toLowerCase())
      )
    ) {
      relatedFiles.push({
        path: filePath,
        category: fileInfo.category,
        functions: (fileInfo.functions || []).slice(0, 3),
        classes: (fileInfo.classes || []).slice(0, 3),
      });
    }
  }
  contextData.relatedFiles = relatedFiles.slice(0, 10);

  return contextData;
}

function saveContext(contextName, contextData) {
  const contextDir = path.join(__dirname, '../../ai-cache/contexts');
  if (!fs.existsSync(contextDir)) {
    fs.mkdirSync(contextDir, { recursive: true });
  }

  const contextPath = path.join(contextDir, `${contextName}.json`);
  fs.writeFileSync(contextPath, JSON.stringify(contextData, null, 2));
  console.log(`Context saved: ${contextPath}`);
}

function loadContext(contextName) {
  const contextPath = path.join(__dirname, '../../ai-cache/contexts', `${contextName}.json`);
  try {
    return JSON.parse(fs.readFileSync(contextPath, 'utf8'));
  } catch (error) {
    return null;
  }
}

async function preLoadAllContexts() {
  console.log('Pre-loading all predefined contexts...');
  const contextNames = Object.keys(PREDEFINED_CONTEXTS);
  let loaded = 0;

  // Build contexts in parallel but keep the save operation per-context
  await Promise.all(
    contextNames.map(async (contextName) => {
      try {
        const contextData = await buildContext(contextName);
        if (contextData) {
          saveContext(contextName, contextData);
          loaded++;
        }
      } catch (err) {
        // ignore individual context errors
      }
    })
  );

  console.log(`Pre-loaded ${loaded} contexts`);
}

async function recordRun(scriptName, startedAt, success = true) {
  try {
    const duration = Date.now() - startedAt;
    const raw = await fsp.readFile(METRICS_FILE, 'utf8').catch(() => null);
    const metrics = raw ? JSON.parse(raw) : { scriptRuns: [] };
    metrics.scriptRuns = metrics.scriptRuns || [];
    metrics.scriptRuns.push({
      script: scriptName,
      timestamp: new Date().toISOString(),
      durationMs: duration,
      success,
    });
    await fsp.writeFile(METRICS_FILE, JSON.stringify(metrics, null, 2));
  } catch (err) {
    console.warn('Failed to record run metrics:', err?.message || err);
  }
}

function main() {
  const command = process.argv[2];
  const contextName = process.argv[3];

  switch (command) {
    case 'preload': {
      (async () => {
        const startedAt = Date.now();
        let success = false;
        try {
          await preLoadAllContexts();
          success = true;
        } catch (err) {
          console.error('Preload failed:', err?.message || err);
        } finally {
          await recordRun('context-preloader:preload', startedAt, success);
        }
      })();
      break;
    }

    case 'build': {
      if (!contextName) {
        console.error('Usage: node context-preloader.js build <context-name>');
        console.log('Available contexts:', Object.keys(PREDEFINED_CONTEXTS).join(', '));
        process.exit(1);
      }
      (async () => {
        const startedAt = Date.now();
        let success = false;
        try {
          const contextData = await buildContext(contextName);
          if (contextData) {
            saveContext(contextName, contextData);
            console.log(`Built context: ${contextName}`);
          }
          success = true;
        } catch (err) {
          console.error('Build failed:', err?.message || err);
        } finally {
          await recordRun(`context-preloader:build:${contextName}`, startedAt, success);
        }
      })();
      break;
    }

    case 'list': {
      console.log('Available contexts:');
      Object.entries(PREDEFINED_CONTEXTS).forEach(([name, info]) => {
        console.log(`  ${name}: ${info.description}`);
      });
      break;
    }

    case 'show': {
      if (!contextName) {
        console.error('Usage: node context-preloader.js show <context-name>');
        process.exit(1);
      }
      const loadedContext = loadContext(contextName);
      if (loadedContext) {
        console.log(JSON.stringify(loadedContext, null, 2));
      } else {
        console.log(`Context not found: ${contextName}`);
      }
      break;
    }

    default: {
      console.log('Usage:');
      console.log('  node context-preloader.js preload    - Pre-load all contexts');
      console.log('  node context-preloader.js build <name> - Build specific context');
      console.log('  node context-preloader.js list       - List available contexts');
      console.log('  node context-preloader.js show <name> - Show context content');
      break;
    }
  }
}

if (__filename === process.argv[1]) {
  main();
}

export { buildContext, loadContext, PREDEFINED_CONTEXTS };
