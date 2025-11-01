#!/usr/bin/env python3
"""
Build an HNSW ANN index from ai-index/semantic-vectors.json and optionally serve a simple HTTP API
Endpoints (when serving):
 - GET /ann-search?q=<query>&top=<k>

Usage:
  python build_and_serve.py build   # creates index files: ann_index.bin and file_order.json
  python build_and_serve.py serve   # loads prebuilt index and serves HTTP API
  python build_and_serve.py all     # build then serve

Note: Requires the Python packages in requirements.txt (hnswlib, numpy, flask)
"""
import argparse
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
VECTORS_PATH = ROOT / 'ai-index' / 'semantic-vectors.json'
ANN_DIR = ROOT / 'ai-index' / 'ann'
ANN_DIR.mkdir(parents=True, exist_ok=True)
INDEX_FILE = ANN_DIR / 'ann_index.bin'
ORDER_FILE = ANN_DIR / 'file_order.json'

# We'll implement the same hashing-trick vectorizer as the Node embedding script to ensure compatibility
import hashlib
import numpy as np


def normalize_token(t: str):
    return ''.join([c for c in t.lower() if c.isalnum()])


def hash_to_index(token: str, dims: int):
    h = hashlib.sha256(token.encode('utf8')).digest()
    val = int.from_bytes(h[:4], 'big')
    return val % dims


def vectorize_text(text: str, dims: int = 128):
    vec = np.zeros(dims, dtype=np.float32)
    tokens = [normalize_token(t) for t in text.split() if normalize_token(t)]
    freq = {}
    for t in tokens:
        freq[t] = freq.get(t, 0) + 1
    for tok, w in freq.items():
        idx = hash_to_index(tok, dims)
        vec[idx] += w
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec


def build_ann(index_path: Path = VECTORS_PATH, index_file: Path = INDEX_FILE, order_file: Path = ORDER_FILE, space: str = 'cosine', ef_construction: int = 200, M: int = 16):
    try:
        import hnswlib
    except Exception as e:
        print('hnswlib not installed. Please install requirements:', e, file=sys.stderr)
        sys.exit(1)

    if not index_path.exists():
        print('Embeddings file missing at', index_path, file=sys.stderr)
        sys.exit(1)

    data = json.loads(index_path.read_text())
    dims = data.get('dims', 128)
    vectors = data.get('vectors', {})
    file_list = list(vectors.keys())
    X = np.vstack([np.array(vectors[f], dtype=np.float32) for f in file_list])

    print(f'Building HNSW index for {len(file_list)} vectors (dims={dims})')
    p = hnswlib.Index(space=space, dim=dims)
    p.init_index(max_elements=len(file_list), ef_construction=ef_construction, M=M)
    p.add_items(X, np.arange(len(file_list)))
    p.set_ef(50)
    p.save_index(str(index_file))
    order_file.write_text(json.dumps(file_list))
    print('Wrote ANN index to', index_file, 'and order to', order_file)


def serve(index_file: Path = INDEX_FILE, order_file: Path = ORDER_FILE, host: str = '127.0.0.1', port: int = 8001):
    try:
        import hnswlib
        from flask import Flask, request, jsonify
    except Exception as e:
        print('Required Python packages missing:', e, file=sys.stderr)
        sys.exit(1)

    if not index_file.exists() or not order_file.exists():
        print('Index or order file missing. Run build first.', file=sys.stderr)
        sys.exit(1)

    file_list = json.loads(order_file.read_text())
    dims = json.loads(VECTORS_PATH.read_text()).get('dims', 128)

    app = Flask(__name__)
    idx = hnswlib.Index(space='cosine', dim=dims)
    idx.load_index(str(index_file))
    idx.set_ef(50)

    @app.route('/ann-search')
    def ann_search():
        q = request.args.get('q', '')
        top = int(request.args.get('top', '10'))
        if not q:
            return jsonify({'results': [], 'meta': {'q': q}})
        qvec = vectorize_text(q, dims)
        labels, distances = idx.knn_query(qvec, k=top)
        res = []
        for lab, dist in zip(labels[0], distances[0]):
            file = file_list[int(lab)]
            # hnswlib cosine distance is in [0,2]; convert to similarity score
            raw_dist = float(dist)
            # Ensure finite and valid: clamp to [0, 2] then convert to similarity
            raw_dist = max(0.0, min(2.0, raw_dist))
            score = 1.0 - (raw_dist / 2.0)  # normalize to [0, 1] similarity
            res.append({'file': file, 'score': score})
        return jsonify({'results': res, 'meta': {'q': q}})

    print(f'Serving ANN microservice on http://{host}:{port}')
    app.run(host=host, port=port)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['build', 'serve', 'all'], help='build index, serve, or both')
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8001)
    args = parser.parse_args()

    if args.mode in ('build', 'all'):
        build_ann()
    if args.mode in ('serve', 'all'):
        serve(host=args.host, port=args.port)


if __name__ == '__main__':
    main()
