// api/fred.js — Vercel serverless proxy for FRED API
// Bypasses CORS by fetching on the server side
// Deploy this file to /api/fred.js in your project root

export default async function handler(req, res) {
  // Allow your Vercel app to call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { series_id, api_key } = req.query;

  if (!series_id || !api_key) {
    return res.status(400).json({ error: 'Missing series_id or api_key' });
  }

  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${api_key}&file_type=json&sort_order=desc&limit=5`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'FRED API error', status: response.status });
    }

    const data = await response.json();
    // Cache for 6 hours on Vercel's CDN
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy fetch failed', message: err.message });
  }
}
