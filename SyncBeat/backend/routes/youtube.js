const express = require('express');
const router = express.Router();

/**
 * GET /api/youtube/search?q=...
 * Proxies YouTube Data API v3 search to avoid exposing API key on client.
 * Returns tracks compatible with the frontend Track type.
 */
router.get('/search', async (req, res) => {
  const q = req.query.q;
  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json({ error: 'Query required' });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    // Return mock data when no API key configured
    return res.json(mockResults(q));
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('videoCategoryId', '10'); // Music category
    url.searchParams.set('q', q.trim());
    url.searchParams.set('maxResults', '10');
    url.searchParams.set('key', apiKey);

    const ytRes = await fetch(url.toString());
    if (!ytRes.ok) throw new Error(`YouTube API error: ${ytRes.status}`);
    const json = await ytRes.json();

    const tracks = (json.items || []).map(item => ({
      id: item.id.videoId,
      title: item.snippet.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'"),
      artist: item.snippet.channelTitle,
      album: 'YouTube',
      artwork: item.snippet.thumbnails?.medium?.url || '',
      duration: 0, // Would need a separate Videos.list call for contentDetails
      source: 'youtube',
      sourceId: item.id.videoId,
    }));

    res.json(tracks);
  } catch (err) {
    console.error('YouTube search error:', err.message);
    res.status(500).json({ error: 'YouTube search failed' });
  }
});

/**
 * GET /api/youtube/embed/:videoId
 * Returns embed URL for a YouTube video.
 */
router.get('/embed/:videoId', (req, res) => {
  const { videoId } = req.params;
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({ error: 'Invalid video ID' });
  }
  res.json({
    embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`,
  });
});

function mockResults(q) {
  return [
    {
      id: 'dQw4w9WgXcQ',
      title: `${q} - Top Result`,
      artist: 'SyncBeat Demo',
      album: 'YouTube',
      artwork: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      duration: 213,
      source: 'youtube',
      sourceId: 'dQw4w9WgXcQ',
    },
    {
      id: 'kJQP7kiw5Fk',
      title: `${q} - Popular Mix`,
      artist: 'SyncBeat Demo',
      album: 'YouTube',
      artwork: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
      duration: 282,
      source: 'youtube',
      sourceId: 'kJQP7kiw5Fk',
    },
  ];
}

module.exports = router;
