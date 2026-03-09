// api/fred.js — Vercel serverless proxy for FRED API
// Place this file at: /api/fred.js in your project root
// This avoids CORS restrictions when calling api.stlouisfed.org from the browser

export default async function handler(req, res) {
  // Allow all origins (your app's own frontend)
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
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${api_key}&sort_order=desc&limit=10&file_type=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Cache for 1 hour on CDN edge
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy fetch failed: ' + err.message });
  }
}
