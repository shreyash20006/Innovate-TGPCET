/**
 * YouTube Data API v3 helper
 * Uses VITE_YOUTUBE_API_KEY from .env / Vercel env vars.
 *
 * Add to .env:
 *   VITE_YOUTUBE_API_KEY=AIza...
 *
 * Vercel: Project Settings → Environment Variables → VITE_YOUTUBE_API_KEY
 */

const YT_KEY  = (import.meta as any).env.VITE_YOUTUBE_API_KEY ?? '';
const YT_BASE = 'https://www.googleapis.com/youtube/v3';

// ─── Exported Track shape (compatible with MusicHub's Track interface) ─────────
export interface YTTrack {
  id: string;          // YouTube Video ID (also serves as ytVideoId)
  name: string;        // Decoded video title
  artists: string;     // Channel title
  album: string;       // '' (not applicable)
  image: string;       // Medium thumbnail (320×180)
  preview_url: null;   // Always null — full song via YouTube IFrame
  duration_ms: number; // Duration in milliseconds
  external_url: string;// https://www.youtube.com/watch?v=...
  viewCount: string;   // Raw view count string (use fmtViews() to format)
}

// ─── Custom error class ────────────────────────────────────────────────────────
export class YouTubeAPIError extends Error {
  constructor(message: string, public code: number) {
    super(message);
    this.name = 'YouTubeAPIError';
  }
}

// ─── Parse ISO 8601 duration → ms ─────────────────────────────────────────────
// Example: "PT4M33S" → 273000
function parseDuration(iso: string): number {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return ((+(m[1] ?? 0)) * 3600 + (+(m[2] ?? 0)) * 60 + (+(m[3] ?? 0))) * 1000;
}

// ─── Decode HTML entities common in YouTube titles ────────────────────────────
function decodeTitle(raw: string): string {
  return raw
    .replace(/&amp;/g,  '&')
    .replace(/&#39;/g,  "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>');
}

// ─── Format view count ────────────────────────────────────────────────────────
// "1234567" → "1.2M views"
export function fmtViews(count: string | number): string {
  const n = typeof count === 'string' ? parseInt(count, 10) : count;
  if (!n || isNaN(n)) return '';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B views`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K views`;
  return `${n} views`;
}

// ─── Validate API key is set ───────────────────────────────────────────────────
export function isApiKeyConfigured(): boolean {
  return YT_KEY.length > 10;
}

// ─── Main search function ─────────────────────────────────────────────────────
/**
 * Search YouTube for videos using Data API v3.
 * - videoCategoryId=10 targets Music
 * - Makes two API calls: search.list + videos.list (for duration + views)
 * - Throws YouTubeAPIError with .code for handling quota/key errors
 */
export async function searchYouTubeVideos(
  query: string,
  maxResults = 20,
): Promise<YTTrack[]> {

  // Guard: API key not configured
  if (!isApiKeyConfigured()) {
    throw new YouTubeAPIError(
      'VITE_YOUTUBE_API_KEY is not configured. Add it to your .env file.',
      0,
    );
  }

  // ── Step 1: search.list ────────────────────────────────────────────────────
  const searchParams = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    videoCategoryId: '10',   // Music
    maxResults: String(maxResults),
    key: YT_KEY,
  });

  const searchRes = await fetch(`${YT_BASE}/search?${searchParams}`, {
    signal: AbortSignal.timeout(8000),
  });

  if (!searchRes.ok) {
    let code = searchRes.status;
    let msg  = `YouTube search failed (HTTP ${code})`;
    try {
      const errJson = await searchRes.json();
      const reason  = errJson?.error?.errors?.[0]?.reason ?? '';
      code = errJson?.error?.code ?? code;
      if (code === 403 || reason === 'quotaExceeded') {
        throw new YouTubeAPIError(
          'YouTube API daily quota has been reached. Try again tomorrow.',
          403,
        );
      }
      if (code === 400 || reason === 'keyInvalid') {
        throw new YouTubeAPIError('Invalid YouTube API key. Check VITE_YOUTUBE_API_KEY.', 400);
      }
      msg = errJson?.error?.message ?? msg;
    } catch (inner) {
      if (inner instanceof YouTubeAPIError) throw inner;
    }
    throw new YouTubeAPIError(msg, code);
  }

  const searchData = await searchRes.json();
  const items: any[] = searchData.items ?? [];
  if (!items.length) return [];

  // ── Step 2: videos.list — get duration + stats ─────────────────────────────
  const videoIds = items
    .map((i: any) => i.id?.videoId)
    .filter(Boolean)
    .join(',');

  if (!videoIds) return [];

  const detailParams = new URLSearchParams({
    part: 'contentDetails,statistics',
    id: videoIds,
    key: YT_KEY,
  });

  const detailRes  = await fetch(`${YT_BASE}/videos?${detailParams}`, {
    signal: AbortSignal.timeout(6000),
  }).catch(() => null);

  const detailData = detailRes?.ok ? await detailRes.json() : { items: [] };
  const byId       = new Map<string, any>(
    (detailData.items ?? []).map((d: any) => [d.id, d]),
  );

  // ── Map to YTTrack ─────────────────────────────────────────────────────────
  return items
    .map((item: any): YTTrack | null => {
      const vid = item.id?.videoId;
      if (!vid) return null;

      const sn      = item.snippet ?? {};
      const detail  = byId.get(vid) ?? {};
      const thumb   = sn.thumbnails?.medium?.url
                   ?? sn.thumbnails?.high?.url
                   ?? sn.thumbnails?.default?.url
                   ?? '';

      return {
        id:          vid,
        name:        decodeTitle(sn.title ?? ''),
        artists:     sn.channelTitle ?? '',
        album:       '',
        image:       thumb,
        preview_url: null,
        duration_ms: parseDuration(detail?.contentDetails?.duration ?? ''),
        external_url:`https://www.youtube.com/watch?v=${vid}`,
        viewCount:   detail?.statistics?.viewCount ?? '0',
      };
    })
    .filter(Boolean) as YTTrack[];
}

// ─── Trending / Discover presets ─────────────────────────────────────────────
/** Returns trending music results by searching preset queries */
export async function getTrendingMusic(): Promise<YTTrack[]> {
  return searchYouTubeVideos('top music hits 2024 bollywood hindi', 15)
    .catch(() => searchYouTubeVideos('top hits 2024 songs', 15))
    .catch(() => []);
}
