// Vercel Serverless Function — acts as a CORS proxy for YouTube search suggestions.
// In production, the Vite dev-server proxy doesn't exist, so this function
// takes over the /api/suggestions route and forwards the request to Google.
export default async function handler(req, res) {
  const { q, client = 'firefox', ds = 'yt' } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter: q' });
  }

  try {
    const url = `https://suggestqueries.google.com/complete/search?client=${encodeURIComponent(client)}&ds=${encodeURIComponent(ds)}&q=${encodeURIComponent(q)}`;

    const upstream = await fetch(url, {
      headers: {
        // Mimic a real browser so Google doesn't block the request
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.youtube.com/',
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Upstream request failed' });
    }

    const text = await upstream.text();

    // Allow the client to cache suggestions for 60 seconds
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(text);
  } catch (err) {
    console.error('[suggestions proxy] error:', err);
    res.status(500).json({ error: 'Internal proxy error' });
  }
}
