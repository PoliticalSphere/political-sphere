import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 4016;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', name: 'duckduckgo-mcp' });
});

// Simple search proxy to DuckDuckGo Instant Answer API (CORS-friendly, JSON)
// Note: this is a convenience stub for local development only. Do not use in production without proper rate-limiting and caching.
app.get('/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'query parameter q required' });

  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_redirect=1&no_html=1`;
    const r = await fetch(url, { method: 'GET' });
    const json = await r.json();
    res.json({ source: 'duckduckgo', q, data: json });
  } catch (err) {
    console.error('DuckDuckGo proxy error:', err);
    res.status(502).json({ error: 'proxy error', details: String(err) });
  }
});

app.listen(port, () => {
  console.log(`DuckDuckGo MCP stub listening on http://localhost:${port} — /health /search?q=...`);
});
