#!/usr/bin/env node

/**
 * Codebase Indexer for AI Intelligence Enhancement
 * @fileoverview Creates semantic index of codebase for intelligent context retrieval
 */

import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { execSync } from 'child_process';

// Compute a simple 64-bit simhash from content tokens (weighted by term frequency)
function computeSimhash(text, bits = 64) {
  const v = new Array(bits).fill(0);
  const tokens = String(text)
    .split(/\W+/)
    .map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);
  const freq = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  for (const [tok, w] of Object.entries(freq)) {
    const h = crypto.createHash('sha256').update(tok).digest();
    for (let i = 0; i < bits; i++) {
      const byteIndex = Math.floor(i / 8);
      const bitIndex = i % 8;
      const bit = (h[byteIndex] >> bitIndex) & 1;
      v[i] += bit ? w : -w;
    }
  }
  let bigint = 0n;
  for (let i = 0; i < bits; i++) {
    if (v[i] > 0) {
      bigint |= 1n << BigInt(i);
    }
  }
  return bigint.toString(16).padStart(bits / 4, '0');
}

function hexToBigInt(hex) {
  if (!hex) return 0n;
  return BigInt('0x' + hex);
}

function hammingDistanceHex(aHex, bHex) {
  const a = hexToBigInt(aHex);
  const b = hexToBigInt(bHex);
  let x = a ^ b;
  let dist = 0;
  while (x) {
    dist += Number(x & 1n);
    x >>= 1n;
  }
  return dist;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INDEX_DIR = path.join(__dirname, '../../ai-index');
const INDEX_FILE = path.join(INDEX_DIR, 'codebase-index.json');
// Note: VECTOR_FILE reserved for future semantic vector implementation
// const VECTOR_FILE = path.join(INDEX_DIR, 'semantic-vectors.json');

// File patterns to index
const INCLUDE_PATTERNS = [
  '**/*.js',
  '**/*.ts',
  '**/*.jsx',
  '**/*.tsx',
  '**/*.py',
  '**/*.java',
  '**/*.go',
  '**/*.rs',
  '**/*.md',
  '**/*.json',
  '**/*.yml',
  '**/*.yaml',
];

const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.git/**',
  '**/coverage/**',
  '**/*.min.js',
  '**/ai-cache/**',
  '**/ai-metrics/**',
];

// Semantic categories for intelligent grouping
const SEMANTIC_CATEGORIES = {
  components: ['component', 'ui', 'view', 'screen', 'page'],
  services: ['service', 'api', 'client', 'provider', 'manager'],
  models: ['model', 'entity', 'schema', 'interface', 'type'],
  utilities: ['util', 'helper', 'tool', 'lib', 'common'],
  config: ['config', 'setting', 'env', 'constant'],
  tests: ['test', 'spec', 'mock', 'fixture'],
  docs: ['readme', 'doc', 'guide', 'tutorial'],
};

function shouldIncludeFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);

  // Check exclude patterns
  for (const pattern of EXCLUDE_PATTERNS) {
    if (relativePath.includes(pattern.replace('**/', ''))) {
      return false;
    }
  }

  // Check include patterns
  for (const pattern of INCLUDE_PATTERNS) {
    const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
    if (regex.test(relativePath)) {
      return true;
    }
  }

  return false;
}

function extractSemanticInfo(filePath, content) {
  const fileName = path.basename(filePath);
  const extension = path.extname(filePath);
  const relativePath = path.relative(process.cwd(), filePath);

  // Extract imports/exports for dependency analysis
  const imports = [];
  const exports = [];

  if (['.js', '.ts', '.jsx', '.tsx'].includes(extension)) {
    // Extract import statements
    const importMatches = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g) || [];
    importMatches.forEach((match) => {
      const importPath = match.match(/from\s+['"]([^'"]+)['"]/)[1];
      imports.push(importPath);
    });

    // Extract export statements
    const exportMatches = content.match(/export\s+(?:const|function|class|default)\s+(\w+)/g) || [];
    exportMatches.forEach((match) => {
      const exportName = match.match(/export\s+(?:const|function|class|default)\s+(\w+)/)[1];
      exports.push(exportName);
    });
  }

  // Determine semantic category
  let category = 'other';
  const fileNameLower = fileName.toLowerCase();
  const contentLower = content.toLowerCase();

  for (const [cat, keywords] of Object.entries(SEMANTIC_CATEGORIES)) {
    if (
      keywords.some((keyword) => fileNameLower.includes(keyword) || contentLower.includes(keyword))
    ) {
      category = cat;
      break;
    }
  }

  // Extract key functions/classes
  const functions = [];
  const classes = [];

  if (['.js', '.ts', '.jsx', '.tsx'].includes(extension)) {
    const functionMatches = content.match(/(?:function|const|let)\s+(\w+)\s*\(/g) || [];
    functionMatches.forEach((match) => {
      const funcName = match.match(/(?:function|const|let)\s+(\w+)\s*\(/)[1];
      functions.push(funcName);
    });

    const classMatches = content.match(/class\s+(\w+)/g) || [];
    classMatches.forEach((match) => {
      const className = match.match(/class\s+(\w+)/)[1];
      classes.push(className);
    });
  }

  // Generate simple semantic vector (keyword frequency)
  const keywords = [
    'function',
    'class',
    'import',
    'export',
    'async',
    'await',
    'try',
    'catch',
    'if',
    'for',
    'while',
  ];
  const vector = keywords.map((keyword) => contentLower.split(keyword).length - 1);

  return {
    filePath: relativePath,
    fileName,
    extension,
    category,
    size: content.length,
    lines: content.split('\n').length,
    imports,
    exports,
    functions,
    classes,
    lastModified: fs.statSync(filePath).mtime.toISOString(),
    semanticVector: vector,
    summary: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
  };
}

async function buildIndex({ concurrency = 50 } = {}) {
  const index = {
    files: {},
    categories: {},
    dependencies: {},
    semanticMap: {},
    // simhashIndex: prefix -> Set(filePath) to enable fast ANN-like candidate retrieval
    simhashIndex: {},
    lastIndexed: new Date().toISOString(),
    totalFiles: 0,
    totalSize: 0,
  };

  function normalizeToken(t) {
    return t
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  function addToSemanticMap(map, text, filePath) {
    if (!text) return;
    const tokens = String(text).split(/\W+/).map(normalizeToken).filter(Boolean);
    for (const tok of tokens) {
      if (!map[tok]) map[tok] = new Set();
      map[tok].add(filePath);
    }
  }

  // Simple async walk with bounded concurrency
  const queue = [process.cwd()];
  const workers = [];

  async function worker() {
    while (queue.length > 0) {
      const dirPath = queue.shift();
      if (!dirPath) break;
      let items;
      try {
        items = await fsp.readdir(dirPath);
      } catch (err) {
        continue;
      }
      await Promise.all(
        items.map(async (item) => {
          const fullPath = path.join(dirPath, item);
          try {
            const stat = await fsp.stat(fullPath);
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
              queue.push(fullPath);
            } else if (stat.isFile() && shouldIncludeFile(fullPath)) {
              try {
                const content = await fsp.readFile(fullPath, 'utf8');
                const semanticInfo = extractSemanticInfo(fullPath, content);

                index.files[semanticInfo.filePath] = semanticInfo;
                // compute simhash and add to simhash index
                try {
                  const sim = computeSimhash(content, 64);
                  semanticInfo.simhash = sim;
                  // inline: add to simhash index using a few prefix buckets
                  const prefixes = [sim.slice(0, 16), sim.slice(0, 12), sim.slice(0, 8)];
                  for (const p of prefixes) {
                    if (!index.simhashIndex[p]) index.simhashIndex[p] = new Set();
                    index.simhashIndex[p].add(semanticInfo.filePath);
                  }
                } catch (err) {
                  // ignore simhash errors
                }
                index.totalFiles++;
                index.totalSize += semanticInfo.size;

                // Group by category
                if (!index.categories[semanticInfo.category]) {
                  index.categories[semanticInfo.category] = [];
                }
                index.categories[semanticInfo.category].push(semanticInfo.filePath);

                // Build dependency graph
                semanticInfo.imports.forEach((importPath) => {
                  if (!index.dependencies[semanticInfo.filePath]) {
                    index.dependencies[semanticInfo.filePath] = { imports: [], importedBy: [] };
                  }
                  index.dependencies[semanticInfo.filePath].imports.push(importPath);
                });
                // Update semanticMap (inverted index)
                try {
                  addToSemanticMap(index.semanticMap, semanticInfo.fileName, semanticInfo.filePath);
                  addToSemanticMap(
                    index.semanticMap,
                    (semanticInfo.functions || []).join(' '),
                    semanticInfo.filePath
                  );
                  addToSemanticMap(
                    index.semanticMap,
                    (semanticInfo.classes || []).join(' '),
                    semanticInfo.filePath
                  );
                  addToSemanticMap(index.semanticMap, semanticInfo.summary, semanticInfo.filePath);
                } catch (err) {
                  // ignore semanticMap errors
                }
              } catch (error) {
                console.warn(`Failed to index ${fullPath}: ${error.message}`);
              }
            }
          } catch (err) {
            // ignore stat errors
          }
        })
      );
    }
  }

  console.log('Building codebase index (async)...');
  for (let i = 0; i < Math.max(1, Math.min(concurrency, 50)); i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  // Build reverse dependencies
  for (const [file, deps] of Object.entries(index.dependencies)) {
    deps.imports.forEach((importPath) => {
      for (const [otherFile, otherDeps] of Object.entries(index.dependencies)) {
        if (otherFile.includes(path.basename(importPath))) {
          if (!otherDeps.importedBy) otherDeps.importedBy = [];
          otherDeps.importedBy.push(file);
        }
      }
    });
  }

  index.lastIndexed = new Date().toISOString();
  // Convert semanticMap sets to arrays for JSON serialization
  const serialMap = {};
  for (const [k, s] of Object.entries(index.semanticMap)) {
    serialMap[k] = Array.from(s);
  }
  index.semanticMap = serialMap;
  // Convert simhashIndex sets to arrays
  const serialSim = {};
  for (const [k, s] of Object.entries(index.simhashIndex)) {
    serialSim[k] = Array.from(s);
  }
  index.simhashIndex = serialSim;
  return index;
}

async function saveIndex(index) {
  try {
    await fsp.mkdir(INDEX_DIR, { recursive: true });
    // record current git commit for incremental/delta indexing
    try {
      const commit = execSync('git rev-parse --verify HEAD', { encoding: 'utf8' }).trim();
      index.lastIndexedCommit = commit;
    } catch (err) {
      // if git not available, skip
    }
    await fsp.writeFile(INDEX_FILE, JSON.stringify(index, null, 2));
    console.log(`Index saved to ${INDEX_FILE}`);
    console.log(
      `Indexed ${index.totalFiles} files (${(index.totalSize / 1024 / 1024).toFixed(2)} MB)`
    );
  } catch (err) {
    console.error('Failed to save index:', err?.message || err);
  }
}

async function loadIndex() {
  try {
    const raw = await fsp.readFile(INDEX_FILE, 'utf8').catch(() => null);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to load index:', error.message);
  }
  return null;
}

async function searchIndex(query, category = null, limit = 10) {
  const index = await loadIndex();
  if (!index) {
    console.error('No index found. Run indexing first.');
    return [];
  }
  const results = [];

  const normalize = (t) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
  const tokens = String(query).split(/\W+/).map(normalize).filter(Boolean);

  // Use semanticMap to narrow candidates quickly
  const candidateSet = new Set();
  if (index.semanticMap) {
    for (const tok of tokens) {
      const hits = index.semanticMap[tok];
      if (Array.isArray(hits)) {
        hits.forEach((p) => candidateSet.add(p));
      }
    }
  }

  // initial candidates (from semantic tokens)
  // const candidates = candidateSet.size > 0 ? Array.from(candidateSet) : Object.keys(index.files);

  // Augment candidates using simhash (ANN-like) based on query tokens
  try {
    const querySim = computeSimhash(query, 64);
    const simPrefixes = [querySim.slice(0, 16), querySim.slice(0, 12), querySim.slice(0, 8)];
    for (const p of simPrefixes) {
      const hits = index.simhashIndex && index.simhashIndex[p];
      if (Array.isArray(hits)) {
        hits.forEach((pth) => candidateSet.add(pth));
      }
    }
  } catch (err) {
    // ignore simhash search errors
  }

  const finalCandidates = Array.from(
    candidateSet.size > 0 ? Array.from(candidateSet) : Object.keys(index.files)
  );

  for (const filePath of finalCandidates) {
    const fileInfo = index.files[filePath];
    if (!fileInfo) continue;
    if (category && fileInfo.category !== category) continue;

    let score = 0;
    const queryLower = query.toLowerCase();

    // File name match
    if (fileInfo.fileName.toLowerCase().includes(queryLower)) score += 10;

    // Path match
    if (filePath.toLowerCase().includes(queryLower)) score += 5;

    // Content match in summary
    if ((fileInfo.summary || '').toLowerCase().includes(queryLower)) score += 3;

    // Function/class name match
    if ((fileInfo.functions || []).some((f) => f.toLowerCase().includes(queryLower))) score += 8;
    if ((fileInfo.classes || []).some((c) => c.toLowerCase().includes(queryLower))) score += 8;

    if (score > 0) results.push({ ...fileInfo, score, filePath });
  }

  // If simhash was computed, boost scores by proximity (lower Hamming distance)
  try {
    const querySim = computeSimhash(query, 64);
    for (const r of results) {
      if (r.simhash) {
        const d = hammingDistanceHex(querySim, r.simhash, 64);
        // nearer = smaller d; convert to boost where max distance is 64
        const boost = Math.max(0, 8 - d); // small boost for very close items
        r.score += boost;
      }
    }
  } catch (err) {
    // ignore
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'build': {
      const concurrencyArg = parseInt(process.env.INDEXER_CONCURRENCY || '50', 10) || 50;
      const index = await buildIndex({ concurrency: concurrencyArg });
      await saveIndex(index);
      break;
    }

    case 'search': {
      const query = process.argv[3];
      const category = process.argv[4];
      if (!query) {
        console.error('Usage: node code-indexer.js search <query> [category]');
        process.exit(1);
      }
      const results = await searchIndex(query, category);
      console.log(`Search results for "${query}"${category ? ` in ${category}` : ''}:`);
      results.forEach((result, i) => {
        console.log(`${i + 1}. ${result.filePath} (score: ${result.score})`);
        console.log(
          `   Category: ${result.category}, Functions: ${(result.functions || []).slice(0, 3).join(', ')}`
        );
      });
      break;
    }

    case 'stats': {
      const statsIndex = await loadIndex();
      if (statsIndex) {
        console.log('Codebase Index Statistics:');
        console.log(`Total files: ${statsIndex.totalFiles}`);
        console.log(`Total size: ${(statsIndex.totalSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Last indexed: ${statsIndex.lastIndexed}`);
        console.log('Categories:');
        for (const [cat, files] of Object.entries(statsIndex.categories || {})) {
          console.log(`  ${cat}: ${files.length} files`);
        }
      } else {
        console.error('No index found. Run "build" first.');
      }
      break;
    }

    default: {
      console.log('Usage:');
      console.log('  node code-indexer.js build    - Build/rebuild the codebase index');
      console.log('  node-code-indexer.js search <query> [category] - Search the index');
      console.log('  node code-indexer.js stats    - Show index statistics');
      break;
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { buildIndex, searchIndex, loadIndex };
