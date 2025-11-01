#!/usr/bin/env node

/*
 * Simple in-memory index server for fast local search
 * Usage: node index-server.js [port]
 */

import http from 'http';
import { promises as fsp } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.argv[2] || process.env.AI_INDEX_PORT || '3030', 10);
const INDEX_PATH = path.join(__dirname, '..', '..', 'ai-index', 'codebase-index.json');
const VECTORS_PATH = path.join(__dirname, '..', '..', 'ai-index', 'semantic-vectors.json');

// Optional ANN backend (e.g. Flask hnswlib service)
const ANN_BACKEND_URL = process.env.ANN_BACKEND_URL || process.env.AI_ANN_BACKEND_URL || '';

const annMetrics = {
  calls: 0,
  successes: 0,
  failures: 0,
  totalLatencyMs: 0,
  fallbacks: 0,
};

let INDEX = null;
let VECTORS = null; // { dims, vectors: { filePath: [..] } }

function normalize(q) {
  return String(q || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function getCandidates(index, query) {
  if (!query) return Object.keys(index.files || {});
  const tokens = String(query).split(/\W+/).map(normalize).filter(Boolean);
  const set = new Set();
  for (const t of tokens) {
    const hits = index.semanticMap?.[t];
    if (Array.isArray(hits)) hits.forEach((p) => set.add(p));
  }
  return set.size > 0 ? Array.from(set) : Object.keys(index.files || {});
}

function scoreFile(fileInfo, filePath, query) {
  const q = String(query || '').toLowerCase();
  let score = 0;
  if (!fileInfo) return 0;
  if ((fileInfo.fileName || '').toLowerCase().includes(q)) score += 10;
  if ((filePath || '').toLowerCase().includes(q)) score += 5;
  if ((fileInfo.summary || '').toLowerCase().includes(q)) score += 3;
  if ((fileInfo.functions || []).some((f) => f.toLowerCase().includes(q))) score += 8;
  if ((fileInfo.classes || []).some((c) => c.toLowerCase().includes(q))) score += 8;
  return score;
}

async function loadIndex() {
  try {
    const raw = await fsp.readFile(INDEX_PATH, 'utf8');
    INDEX = JSON.parse(raw);
    console.log('Index loaded into memory:', INDEX_PATH);
    // try to load vector embeddings if present
    try {
      const vr = await fsp.readFile(VECTORS_PATH, 'utf8').catch(() => null);
      if (vr) {
        VECTORS = JSON.parse(vr);
        console.log(
          'Embeddings loaded:',
          VECTORS_PATH,
          'vectors=',
          Object.keys(VECTORS.vectors || {}).length
        );
      }
    } catch (e) {
      console.warn('Failed to load embeddings:', e?.message || e);
    }
    return true;
  } catch (err) {
    console.warn('Index not found or failed to load:', err?.message || err);
    return false;
  }
}

function hashToIndex(token, dims) {
  const h = crypto.createHash('sha256').update(token).digest();
  const val = h.readUInt32BE(0);
  return val % dims;
}

function vectorizeText(text, dims = 128) {
  const vec = new Array(dims).fill(0);
  const tokens = String(text)
    .split(/\W+/)
    .map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);
  const freq = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  for (const [tok, w] of Object.entries(freq)) {
    const idx = hashToIndex(tok, dims);
    vec[idx] += w;
  }
  // L2 normalize
  let norm = 0;
  for (let i = 0; i < dims; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < dims; i++) vec[i] = vec[i] / norm;
  return vec;
}

function dotProduct(a, b) {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += (a[i] || 0) * (b[i] || 0);
  return s;
}

async function buildIndexIfMissing({ maxWaitMs = 5 * 60 * 1000 } = {}) {
  const exists = await fsp
    .stat(INDEX_PATH)
    .then(() => true)
    .catch(() => false);
  if (exists) return true;

  console.log('Index file not found. Running code-indexer to build it...');
  try {
    console.log('Importing and running code-indexer build in-process...');
    const modulePath = new URL('./code-indexer.js', import.meta.url).pathname;
    const mod = await import(modulePath);
    const idx = await mod.buildIndex({
      concurrency: parseInt(process.env.INDEXER_CONCURRENCY || '50', 10) || 50,
    });
    await fsp.mkdir(path.dirname(INDEX_PATH), { recursive: true });
    await fsp.writeFile(INDEX_PATH, JSON.stringify(idx, null, 2), 'utf8');
    console.log('Index built and saved to', INDEX_PATH);
    return true;
  } catch (err) {
    console.error('Failed to build index in-process:', err?.message || err);
    return false;
  }
}

function handleSearch(query, category, limit = 10) {
  if (!INDEX) return [];
  const candidates = getCandidates(INDEX, query);
  const results = [];
  for (const filePath of candidates) {
    const fi = INDEX.files[filePath];
    if (!fi) continue;
    if (category && fi.category !== category) continue;
    const score = scoreFile(fi, filePath, query);
    if (score > 0) results.push({ ...fi, score, filePath });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

async function getPrometheusMetrics() {
  const lines = [];
  try {
    // Index metrics
    const indexStat = await fsp.stat(INDEX_PATH).catch(() => null);
    if (INDEX) {
      lines.push(`# HELP ai_index_total_files Total number of files indexed`);
      lines.push(`# TYPE ai_index_total_files gauge`);
      lines.push(`ai_index_total_files ${INDEX.totalFiles || 0}`);
      lines.push(`# HELP ai_index_size_bytes Size of index file in bytes`);
      const size = indexStat ? indexStat.size : 0;
      lines.push(`ai_index_size_bytes ${size}`);
      lines.push(
        `# HELP ai_index_last_indexed_seconds Seconds since epoch when index was last indexed`
      );
      const ts = INDEX.lastIndexed ? Math.floor(new Date(INDEX.lastIndexed).getTime() / 1000) : 0;
      lines.push(`ai_index_last_indexed_seconds ${ts}`);
    }

    // ai-metrics (various)
    const metricsPaths = [
      path.join(__dirname, '../../ai-metrics.json'),
      path.join(__dirname, '../../ai-metrics/ai-metrics.json'),
    ];
    let metrics = null;
    for (const p of metricsPaths) {
      try {
        const raw = await fsp.readFile(p, 'utf8').catch(() => null);
        if (raw) {
          metrics = JSON.parse(raw);
          break;
        }
      } catch (e) {
        /* ignore */
      }
    }
    if (metrics) {
      lines.push(`# HELP ai_average_response_time_ms Average AI response time in ms`);
      lines.push(`# TYPE ai_average_response_time_ms gauge`);
      lines.push(`ai_average_response_time_ms ${metrics.averageResponseTime || 0}`);
      const cacheHit = metrics.performanceMetrics?.cacheHitRate
        ? metrics.performanceMetrics.cacheHitRate * 1
        : 0;
      lines.push(`# HELP ai_cache_hit_rate Cache hit rate (0..1)`);
      lines.push(`# TYPE ai_cache_hit_rate gauge`);
      lines.push(`ai_cache_hit_rate ${cacheHit}`);
    }

    // ANN metrics
    lines.push(`# HELP ai_ann_calls_total Total ANN backend calls`);
    lines.push(`# TYPE ai_ann_calls_total counter`);
    lines.push(`ai_ann_calls_total ${annMetrics.calls}`);
    lines.push(`# HELP ai_ann_successes_total Successful ANN calls`);
    lines.push(`# TYPE ai_ann_successes_total counter`);
    lines.push(`ai_ann_successes_total ${annMetrics.successes}`);
    lines.push(`# HELP ai_ann_failures_total Failed ANN calls`);
    lines.push(`# TYPE ai_ann_failures_total counter`);
    lines.push(`ai_ann_failures_total ${annMetrics.failures}`);
    lines.push(`# HELP ai_ann_fallbacks_total Number of times ANN fallback to brute-force`);
    lines.push(`# TYPE ai_ann_fallbacks_total counter`);
    lines.push(`ai_ann_fallbacks_total ${annMetrics.fallbacks}`);
    const avg = annMetrics.calls > 0 ? annMetrics.totalLatencyMs / annMetrics.calls : 0;
    lines.push(`# HELP ai_ann_average_latency_ms Average ANN call latency in ms`);
    lines.push(`# TYPE ai_ann_average_latency_ms gauge`);
    lines.push(`ai_ann_average_latency_ms ${avg}`);

    // ai-cache size
    const cachePath = path.join(__dirname, '../../ai-cache/cache.json');
    try {
      const raw = await fsp.readFile(cachePath, 'utf8').catch(() => null);
      if (raw) {
        const cache = JSON.parse(raw);
        const entries = Object.keys(cache.queries || {}).length;
        lines.push(`# HELP ai_cache_entries Number of cached queries`);
        lines.push(`# TYPE ai_cache_entries gauge`);
        lines.push(`ai_cache_entries ${entries}`);
      }
    } catch (e) {
      /* ignore */
    }
  } catch (err) {
    // ignore
  }
  return lines.join('\n') + '\n';
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (url.pathname === '/search') {
      const q = url.searchParams.get('q') || '';
      const category = url.searchParams.get('category') || null;
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);
      const results = handleSearch(q, category, limit);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ results, meta: { total: results.length, q } }));
      return;
    }

    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, indexedFiles: INDEX?.totalFiles || 0 }));
      return;
    }

    if (url.pathname === '/metrics') {
      const body = await getPrometheusMetrics();
      res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
      res.end(body);
      return;
    }

    if (url.pathname === '/vector-search') {
      const q = url.searchParams.get('q') || '';
      const top = parseInt(url.searchParams.get('top') || '10', 10);

      if (!VECTORS) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'embeddings not available; run embeddings build' }));
        return;
      }

      // If ANN backend is configured, try it first and fall back to brute-force
      if (ANN_BACKEND_URL) {
        annMetrics.calls += 1;
        const start = Date.now();
        try {
          const base = ANN_BACKEND_URL.endsWith('/')
            ? ANN_BACKEND_URL.slice(0, -1)
            : ANN_BACKEND_URL;
          const annUrl = `${base}/ann-search?q=${encodeURIComponent(q)}&top=${encodeURIComponent(String(top))}`;
          const resp = await fetch(annUrl, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });
          const latency = Date.now() - start;
          annMetrics.totalLatencyMs += latency;
          if (!resp.ok) {
            annMetrics.failures += 1;
            annMetrics.fallbacks += 1;
            console.warn('ANN backend returned non-OK:', resp.status);
          } else {
            // Read response as text first (some servers may return non-standard JSON like NaN)
            let body = null;
            try {
              const txt = await resp.text();
              try {
                body = JSON.parse(txt);
              } catch (pe) {
                const sanitized = txt.replace(/\bNaN\b/g, '0');
                try {
                  body = JSON.parse(sanitized);
                } catch (e2) {
                  body = null;
                }
              }
            } catch (e) {
              body = null;
            }
            if (body && Array.isArray(body.results) && body.results.length > 0) {
              annMetrics.successes += 1;
              const results = body.results
                .map((r) => {
                  const rawScore = Number(r.score ?? r.distance ?? 0);
                  const score = Number.isFinite(rawScore) ? rawScore : 0;
                  return { file: r.file, score };
                })
                .slice(0, top);
              const annotated = results.map((r) => ({
                file: r.file,
                score: r.score,
                info: INDEX?.files?.[r.file] || null,
              }));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  results: annotated,
                  meta: { q, total: annotated.length, backend: 'ann' },
                })
              );
              return;
            }
            // unexpected payload -> fall through to brute-force
            annMetrics.failures += 1;
            annMetrics.fallbacks += 1;
            console.warn('ANN backend returned unexpected payload');
          }
        } catch (err) {
          annMetrics.failures += 1;
          annMetrics.fallbacks += 1;
          console.warn('ANN backend call failed:', err?.message || err);
        }
        // fall through to brute-force if ANN failed
      }

      // Brute-force vector search
      const dims = VECTORS.dims || 128;
      const qvec = vectorizeText(q, dims);
      const scores = [];
      for (const [file, vec] of Object.entries(VECTORS.vectors || {})) {
        const s = dotProduct(qvec, vec || []);
        scores.push({ file, score: s });
      }
      scores.sort((a, b) => b.score - a.score);
      const results = scores
        .slice(0, top)
        .map((r) => ({ file: r.file, score: r.score, info: INDEX?.files?.[r.file] || null }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ results, meta: { q, total: results.length, backend: 'brute' } }));
      return;
    }

    if (url.pathname === '/reload' && req.method === 'POST') {
      res.writeHead(202, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ reloading: true }));
      // Trigger rebuild in background
      (async () => {
        console.log('Manual reload requested: rebuilding index');
        const ok = await buildIndexIfMissing({ maxWaitMs: 2 * 60 * 1000 });
        if (ok) await loadIndex();
        console.log('Reload complete');
      })();
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  } catch (err) {
    console.error('Request handling error:', err?.message || err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'internal' }));
  }
});

async function startServer() {
  // Ensure index exists (build if necessary)
  const built = await buildIndexIfMissing().catch(() => false);
  const loaded = built ? await loadIndex() : await loadIndex();
  if (!loaded) {
    console.error(
      'Failed to load index after build attempt. Server will still start but /search will return empty results until index is available.'
    );
  }

  server.listen(PORT, () => {
    console.log(`AI index server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start index server:', err?.message || err);
  process.exit(1);
});
