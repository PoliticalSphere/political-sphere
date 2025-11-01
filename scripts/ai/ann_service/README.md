# ANN Microservice (HNSW-based Vector Search)

Fast approximate nearest-neighbor (ANN) search microservice for AI assistant code indexing.

## Overview

This service builds an HNSW (Hierarchical Navigable Small World) index from semantic embeddings and exposes a simple HTTP API for fast vector search queries. It replaces brute-force O(n) vector search with O(log n) approximate search, enabling sub-second response times even with thousands of indexed files.

**Features:**

- HNSW index built from `ai-index/semantic-vectors.json`
- Flask HTTP API exposing `/ann-search`
- Compatible hashing-trick vectorizer (matches Node embedding script)
- Configurable host/port
- Finite, normalized similarity scores (0..1 range)

## Prerequisites

Install Python dependencies:

```bash
pip install --user hnswlib numpy flask
```

Or use the requirements file:

```bash
pip install --user -r scripts/ai/ann_service/requirements.txt
```

## Usage

### Build the ANN Index

Creates `ai-index/ann/ann_index.bin` and `ai-index/ann/file_order.json` from `ai-index/semantic-vectors.json`:

```bash
python3 scripts/ai/ann_service/build_and_serve.py build
```

**Expected output:**

```
Building HNSW index for 640 vectors (dims=128)
Wrote ANN index to .../ai-index/ann/ann_index.bin and order to .../ai-index/ann/file_order.json
```

### Serve the ANN API

Starts a Flask HTTP server on the specified host/port (default: 127.0.0.1:8001):

```bash
python3 scripts/ai/ann_service/build_and_serve.py serve --host 127.0.0.1 --port 8001
```

**Run in background:**

```bash
nohup python3 scripts/ai/ann_service/build_and_serve.py serve --host 127.0.0.1 --port 8001 > /tmp/ann.log 2>&1 &
```

### Build and Serve (Combined)

```bash
python3 scripts/ai/ann_service/build_and_serve.py all --host 127.0.0.1 --port 8001
```

## API Endpoints

### GET `/ann-search`

**Query Parameters:**

- `q` (required): Query string
- `top` (optional, default=10): Number of results to return

**Example:**

```bash
curl 'http://127.0.0.1:8001/ann-search?q=component&top=5'
```

**Response:**

```json
{
  "meta": {
    "q": "component"
  },
  "results": [
    {
      "file": "apps/dev/testing/ui-visual-testing.js",
      "score": 0.92
    },
    {
      "file": "scripts/ci/validate-pipelines.mjs",
      "score": 0.85
    }
  ]
}
```

**Score:** Normalized similarity score in range [0, 1], where 1 = perfect match.

## Integration with Index Server

The Node.js index server (`scripts/ai/index-server.js`) can use this ANN service as an optional backend:

```bash
# Start the ANN service first
nohup python3 scripts/ai/ann_service/build_and_serve.py serve > /tmp/ann.log 2>&1 &

# Start the index server with ANN backend enabled
ANN_BACKEND_URL='http://127.0.0.1:8001' node scripts/ai/index-server.js 3030
```

The index server will:

1. Try the ANN backend first for `/vector-search` requests
2. Fall back to brute-force vector search if ANN is unavailable or returns an error
3. Expose metrics at `/metrics` showing ANN success/failure/fallback rates and latency

## CI Integration

To avoid rebuilding the ANN index on every CI run, the index can be pre-built and cached:

1. **Build step** (in CI workflow):

   ```yaml
   - name: Build ANN index
     run: |
       python3 scripts/ai/ann_service/build_and_serve.py build
   ```

2. **Cache step** (upload artifacts):

   ```yaml
   - name: Upload ANN index artifacts
     uses: actions/upload-artifact@v3
     with:
       name: ann-index
       path: ai-index/ann/
   ```

3. **Restore step** (in dependent jobs):
   ```yaml
   - name: Download ANN index artifacts
     uses: actions/download-artifact@v3
     with:
       name: ann-index
       path: ai-index/ann/
   ```

See `.github/workflows/ai-maintenance.yml` for the full CI integration.

## Development & Testing

### Smoke Test

Query the service and verify valid JSON response:

```bash
curl -s 'http://127.0.0.1:8001/ann-search?q=test&top=3' | python3 -m json.tool
```

### Compare ANN vs Brute-Force

Run a few test queries against both backends and compare results:

```bash
# ANN
curl -s 'http://127.0.0.1:8001/ann-search?q=component&top=5'

# Brute-force (via index server without ANN_BACKEND_URL)
curl -s 'http://127.0.0.1:3030/vector-search?q=component&top=5'
```

### Performance Testing

Measure ANN latency:

```bash
time curl -s 'http://127.0.0.1:8001/ann-search?q=component&top=10' > /dev/null
```

Expected latency: < 50ms for 10 results from ~1000 indexed files.

## Production Deployment

**DO NOT** use the Flask development server in production. Use a production WSGI server instead:

### Option 1: Gunicorn (recommended)

```bash
pip install gunicorn
gunicorn -w 4 -b 127.0.0.1:8001 'scripts.ai.ann_service.build_and_serve:create_app()'
```

### Option 2: uWSGI

```bash
pip install uwsgi
uwsgi --http 127.0.0.1:8001 --wsgi-file scripts/ai/ann_service/build_and_serve.py --callable app
```

**Note:** For production use with gunicorn/uwsgi, refactor `build_and_serve.py` to separate the Flask app factory from CLI entrypoint.

## Configuration

### Environment Variables

- `ANN_BACKEND_URL`: Set on the **index server** side to enable ANN backend (e.g., `http://127.0.0.1:8001`)
- `AI_ANN_BACKEND_URL`: Alternative name for the same config

### HNSW Parameters

Adjust in `build_and_serve.py` `build_ann()` function:

- `ef_construction` (default=200): Higher = better recall, slower build
- `M` (default=16): Links per node; higher = better recall, more memory
- `space` (default='cosine'): Distance metric ('cosine', 'l2', 'ip')

## Troubleshooting

**Issue:** `hnswlib not installed`  
**Fix:** Run `pip install --user hnswlib`

**Issue:** `Embeddings file missing`  
**Fix:** Build embeddings first: `node scripts/ai/embeddings.js build`

**Issue:** ANN returns NaN scores  
**Fix:** This is now handled by the index server's NaN sanitization, but ensure you're using the latest version of `build_and_serve.py` which clamps distances to finite values.

**Issue:** Port already in use  
**Fix:** Kill existing process: `lsof -ti:8001 | xargs kill` or use a different port

## Files Created

- `ai-index/ann/ann_index.bin` — HNSW binary index
- `ai-index/ann/file_order.json` — File list mapping indices to file paths

## Related Documentation

- [Code Indexer](../code-indexer.js) — Builds the base file index
- [Embeddings](../embeddings.js) — Generates TF-hashing vectors
- [Index Server](../index-server.js) — Main search service with ANN fallback
- [Copilot Instructions](../../../.github/copilot-instructions.md) — AI indexing operational guidance

---

**Last updated:** 2025-11-01  
**Maintained by:** AI Infrastructure Team
