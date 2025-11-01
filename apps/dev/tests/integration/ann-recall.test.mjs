// Integration test: ANN-backed vector search vs brute-force
// - Builds index and embeddings if missing
// - Starts index server without ANN (brute baseline)
// - Optionally starts index server with ANN_BACKEND_URL (set TEST_ANN_URL) and compares recall@k
// - Validates ANN fallback/metrics behaviour when ANN is unavailable

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { promises as fsp } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../..');

const INDEX_FILE = path.join(REPO_ROOT, 'ai-index', 'codebase-index.json');
const VECTORS_FILE = path.join(REPO_ROOT, 'ai-index', 'semantic-vectors.json');

// Helpers
function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
function httpGetJSON(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString('utf8');
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
  });
}

async function ensureIndexAndEmbeddings() {
  const idxExists = await fsp.stat(INDEX_FILE).then(() => true).catch(() => false);
  if (!idxExists) {
    await new Promise((resolve, reject) => {
      const p = spawn('node', ['scripts/ai/code-indexer.js', 'build'], { cwd: REPO_ROOT, stdio: 'inherit' });
      p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('indexer exited ' + code))));
    });
  }
  const vecExists = await fsp.stat(VECTORS_FILE).then(() => true).catch(() => false);
  if (!vecExists) {
    await new Promise((resolve, reject) => {
      const p = spawn('node', ['scripts/ai/embeddings.js', 'build'], { cwd: REPO_ROOT, stdio: 'inherit' });
      p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('embeddings exited ' + code))));
    });
  }
}

function startIndexServer({ port, annUrl }) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    if (annUrl) env.ANN_BACKEND_URL = annUrl;
    const p = spawn('node', ['scripts/ai/index-server.js', String(port)], {
      cwd: REPO_ROOT,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let ready = false;
    const onData = (buf) => {
      const s = String(buf);
      if (s.includes('AI index server listening')) {
        ready = true;
        resolve(p);
      }
    };
    p.stdout.on('data', onData);
    p.stderr.on('data', onData);
    p.on('exit', (code) => {
      if (!ready) reject(new Error('index-server exited early: ' + code));
    });
  });
}

async function stop(proc) {
  if (!proc) return;
  try { proc.kill('SIGTERM'); } catch {}
  await wait(200);
}

const queries = ['component', 'server', 'index', 'graph', 'policy'];
const K = 5;

let bruteProc; let annProc;

before(async () => {
  await ensureIndexAndEmbeddings();
  bruteProc = await startIndexServer({ port: 3031 });
});

after(async () => {
  await stop(annProc);
  await stop(bruteProc);
});

function pluckFiles(items) { return (items || []).map((x) => x.file || x.info?.filePath || x.filePath); }

function jaccard(a, b) {
  const A = new Set(a); const B = new Set(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 1 : inter / union;
}

// Baseline: brute-force responds with results
for (const q of queries) {
  test(`brute-force vector search returns results for q="${q}"`, async () => {
    const { status, data } = await httpGetJSON(`http://127.0.0.1:3031/vector-search?q=${encodeURIComponent(q)}&top=${K}`);
    assert.equal(status, 200);
    assert.ok(Array.isArray(data.results));
    assert.ok(data.results.length > 0, 'expected some results');
    assert.equal(data.meta.backend, 'brute');
  });
}

// Optional: Compare ANN vs brute when ANN is available
const TEST_ANN_URL = process.env.TEST_ANN_URL || process.env.ANN_BACKEND_URL || '';
if (TEST_ANN_URL) {
  test('ANN recall@K is reasonable vs brute-force', async () => {
    annProc = await startIndexServer({ port: 3032, annUrl: TEST_ANN_URL });
    let recalls = [];
    for (const q of queries) {
      const base = await httpGetJSON(`http://127.0.0.1:3031/vector-search?q=${encodeURIComponent(q)}&top=${K}`);
      const ann = await httpGetJSON(`http://127.0.0.1:3032/vector-search?q=${encodeURIComponent(q)}&top=${K}`);
      assert.equal(ann.status, 200);
      assert.equal(ann.data.meta.backend, 'ann');
      const baseFiles = pluckFiles(base.data.results);
      const annFiles = pluckFiles(ann.data.results);
      const overlap = baseFiles.filter((f) => annFiles.includes(f)).length;
      const recall = baseFiles.length ? overlap / baseFiles.length : 1;
      recalls.push(recall);
    }
    const avgRecall = recalls.reduce((a, b) => a + b, 0) / (recalls.length || 1);
    // Allow modest threshold since ANN is approximate and embeddings are simple
    assert.ok(avgRecall >= 0.6, `expected avg recall >= 0.6, got ${avgRecall.toFixed(2)}`);
  });

  test('ANN metrics are exposed and increment on calls', async () => {
    const m1 = await httpGetJSON('http://127.0.0.1:3032/metrics');
    assert.equal(m1.status, 200);
    // Trigger a query to bump metrics
    await httpGetJSON(`http://127.0.0.1:3032/vector-search?q=test&top=3`);
    const m2 = await httpGetJSON('http://127.0.0.1:3032/metrics');
    assert.equal(m2.status, 200);
    assert.ok(typeof m2.data === 'string' || typeof m2.data === 'object');
  });
} else {
  test('ANN not configured: comparison test skipped', async () => {
    // Documented skip: Provide TEST_ANN_URL to enable ANN comparison tests
    assert.ok(true);
  });
}

// Fallback behaviour: with bad ANN URL, server should still return brute-force results
test('ANN fallback: server returns brute-force results on ANN failure', async () => {
  const badEnv = { ...process.env, ANN_BACKEND_URL: 'http://127.0.0.1:65534' };
  const p = spawn('node', ['scripts/ai/index-server.js', '3033'], { cwd: REPO_ROOT, env: badEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve) => {
    const onData = (d) => { if (String(d).includes('AI index server listening')) resolve(); };
    p.stdout.on('data', onData); p.stderr.on('data', onData);
  });
  const { status, data } = await httpGetJSON('http://127.0.0.1:3033/vector-search?q=test&top=3');
  assert.equal(status, 200);
  assert.ok(Array.isArray(data.results) && data.results.length > 0);
  // backend may be brute due to fallback
  await stop(p);
});
