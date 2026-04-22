// ─── Spotify OAuth + Search Routes ─────────────────────────────────────────
// Appended to server.ts

import { Request, Response } from 'express';

const SPOTIFY_CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID || '';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';
const SPOTIFY_REDIRECT_URI  = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/auth/spotify/callback';

/** In-memory token store — replace with session/DB in production */
const tokenStore = new Map<string, { access_token: string; expires_at: number }>();

// ── Step 1: Redirect to Spotify login ─────────────────────────────────────
export function setupSpotifyRoutes(app: any) {
app.get('/auth/spotify/login', (_req: Request, res: Response) => {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'streaming',
    'user-modify-playback-state',
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state: Math.random().toString(36).substring(2),
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

// ── Step 2: Exchange code for tokens ──────────────────────────────────────
app.get('/auth/spotify/callback', async (req: Request, res: Response) => {
  const { code, error } = req.query as Record<string, string>;

  if (error || !code) {
    return res.redirect('/#/music-hub?error=access_denied');
  }

  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    });

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: body.toString(),
    });

    const tokens = await tokenRes.json() as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    if (!tokens.access_token) {
      throw new Error('No access token returned');
    }

    // Store token keyed by a random session ID
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    tokenStore.set(sessionId, {
      access_token: tokens.access_token,
      expires_at: Date.now() + tokens.expires_in * 1000,
    });

    // Redirect frontend with session ID (safe — not an actual token in URL)
    res.redirect(`/#/music-hub?session=${sessionId}`);
  } catch (err) {
    console.error('Spotify callback error:', err);
    res.redirect('/#/music-hub?error=token_exchange_failed');
  }
});

// ── Helper: get token from session ────────────────────────────────────────
function getSpotifyToken(sessionId: string): string | null {
  const entry = tokenStore.get(sessionId);
  if (!entry) return null;
  if (Date.now() > entry.expires_at) { tokenStore.delete(sessionId); return null; }
  return entry.access_token;
}

// ── GET /api/spotify/me ────────────────────────────────────────────────────
app.get('/api/spotify/me', async (req: Request, res: Response) => {
  const sessionId = req.query.session as string;
  const token = getSpotifyToken(sessionId);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const r = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return res.status(r.status).json({ error: 'Spotify API error' });
  res.json(await r.json());
});

// ── GET /api/spotify/search?q=&session= ───────────────────────────────────
app.get('/api/spotify/search', async (req: Request, res: Response) => {
  const { q, session } = req.query as Record<string, string>;
  if (!q || q.trim().length === 0) return res.status(400).json({ error: 'q is required' });

  const token = getSpotifyToken(session);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const params = new URLSearchParams({ q: q.trim(), type: 'track', limit: '20', market: 'IN' });
  const r = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return res.status(r.status).json({ error: 'Spotify search failed' });

  const data = await r.json() as any;
  const tracks = (data.tracks?.items || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    artists: t.artists.map((a: any) => a.name).join(', '),
    album: t.album.name,
    image: t.album.images?.[0]?.url || '',
    preview_url: t.preview_url,
    duration_ms: t.duration_ms,
    external_url: t.external_urls?.spotify,
    uri: t.uri,
  }));

  res.json(tracks);
});

// ── GET /api/spotify/top-tracks?session= ──────────────────────────────────
app.get('/api/spotify/top-tracks', async (req: Request, res: Response) => {
  const token = getSpotifyToken(req.query.session as string);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const r = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return res.status(r.status).json({ error: 'Failed to fetch top tracks' });
  const data = await r.json() as any;

  res.json((data.items || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    artists: t.artists.map((a: any) => a.name).join(', '),
    album: t.album.name,
    image: t.album.images?.[0]?.url || '',
    preview_url: t.preview_url,
    duration_ms: t.duration_ms,
    external_url: t.external_urls?.spotify,
    uri: t.uri,
  })));
});
}
