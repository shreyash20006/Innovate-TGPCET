import React, { useState, useEffect, useCallback } from 'react';
import {
  Music2, Search, Play, Pause, ExternalLink, Heart, LogIn, LogOut,
  User, Clock, Users, Copy, Check, Radio, X, ChevronUp, AlertTriangle,
  Youtube, TrendingUp,
} from 'lucide-react';
import NowPlayingScreen from './NowPlayingScreen';
import { searchYouTubeVideos, getTrendingMusic, fmtViews, YouTubeAPIError, isApiKeyConfigured } from '../utils/youtubeApi';

// ─── Types ───────────────────────────────────────────────────────────────────
interface SpotifyUser { id: string; display_name: string; email: string; images: { url: string }[]; product: string; }
interface Track {
  id: string; name: string; artists: string; album: string;
  image: string; preview_url: string | null; duration_ms: number; external_url: string;
  viewCount?: string; // YouTube view count
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (ms: number) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`; };

/** Normalize a raw Spotify track object → our Track interface */
function mapTrack(t: any): Track {
  return {
    id: t.id,
    name: t.name,
    artists: (t.artists || []).map((a: any) => a.name).join(', '),
    album: t.album?.name || '',
    image: t.album?.images?.[0]?.url || '',
    preview_url: t.preview_url ?? null,
    duration_ms: t.duration_ms || 0,
    external_url: t.external_urls?.spotify || '',
  };
}

// itunesSearch removed — replaced by YouTube Data API v3 (see src/utils/youtubeApi.ts)

// ─── CSS Keyframes (injected once) ───────────────────────────────────────────
const CSS_ANIMATIONS = `
  @keyframes mh-float {
    0%,100% { transform: translateY(0) rotate(0deg) scale(1); }
    50% { transform: translateY(-40px) rotate(15deg) scale(1.15); }
  }
  @keyframes mh-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes mh-fadeup {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes mh-orb {
    0%,100% { transform: scale(1); opacity: 0.4; }
    50% { transform: scale(1.15); opacity: 0.7; }
  }
  @keyframes mh-eq1 { 0%,100% { height:4px; } 50% { height:14px; } }
  @keyframes mh-eq2 { 0%,100% { height:4px; } 50% { height:20px; } }
  @keyframes mh-eq3 { 0%,100% { height:4px; } 50% { height:12px; } }
  @keyframes mh-eq4 { 0%,100% { height:4px; } 50% { height:18px; } }
  @keyframes mh-eq5 { 0%,100% { height:4px; } 50% { height:10px; } }
  @keyframes mh-slidein { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes mh-fadein  { from { opacity:0; } to { opacity:1; } }
  @keyframes mh-popin   { from { opacity:0; transform:scale(0.9) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }
`;

// ─── 3D Animated Background (pure CSS, no framer-motion) ─────────────────────
const NOTE_SYMBOLS = ['♪', '♫', '♬', '♩', '🎵', '🎶'];
const NOTE_DATA = Array.from({ length: 18 }, (_, i) => ({
  left:     Math.round(Math.random() * 100),
  top:      Math.round(Math.random() * 100),
  opacity:  +(0.05 + Math.random() * 0.08).toFixed(2),
  color:    i % 3 === 0 ? '#1DB954' : i % 3 === 1 ? '#ff2d78' : '#a855f7',
  symbol:   NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)],
  duration: +(5 + Math.random() * 7).toFixed(1),
  delay:    +(Math.random() * 6).toFixed(1),
}));

function FloatingNotes() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {NOTE_DATA.map((n, i) => (
        <span key={i}
          style={{
            position: 'absolute',
            left: `${n.left}%`,
            top: `${n.top}%`,
            opacity: n.opacity,
            color: n.color,
            fontSize: '1.5rem',
            userSelect: 'none',
            animation: `mh-float ${n.duration}s ease-in-out ${n.delay}s infinite`,
          }}>
          {n.symbol}
        </span>
      ))}
      {[0, 1, 2].map(i => (
        <div key={`orb-${i}`}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            filter: 'blur(80px)',
            width: 300 + i * 100,
            height: 300 + i * 100,
            left: `${20 + i * 30}%`,
            top: `${10 + i * 25}%`,
            background: i === 0 ? 'rgba(29,185,84,0.05)' : i === 1 ? 'rgba(255,45,120,0.04)' : 'rgba(168,85,247,0.04)',
            animation: `mh-orb ${6 + i * 2}s ease-in-out ${i}s infinite`,
          }} />
      ))}
    </div>
  );
}

// ─── Vinyl Record ─────────────────────────────────────────────────────────────
function VinylRecord({ artwork, spinning }: { artwork: string; spinning: boolean }) {
  return (
    <div
      className="relative w-12 h-12 rounded-full shadow-xl shrink-0"
      style={{
        animation: spinning ? 'mh-spin 3s linear infinite' : 'none',
        boxShadow: spinning ? '0 0 20px rgba(29,185,84,0.4)' : '0 4px 10px rgba(0,0,0,0.5)',
      }}>
      <div className="absolute inset-0 rounded-full border-2 border-black/70" />
      <div className="absolute inset-1 rounded-full border border-black/40" />
      <div className="absolute inset-2 rounded-full overflow-hidden border border-black/30">
        {artwork
          ? <img src={artwork} className="w-full h-full object-cover" alt="" />
          : <div className="w-full h-full bg-gray-800 flex items-center justify-center text-base">🎵</div>}
      </div>
    </div>
  );
}

// ─── Equalizer Bars (CSS animations, no random in render) ────────────────────
const EQ_ANIMS = ['mh-eq1', 'mh-eq2', 'mh-eq3', 'mh-eq4', 'mh-eq5'];
const EQ_DELAYS = ['0s', '0.1s', '0.2s', '0.15s', '0.05s'];
function Equalizer({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {EQ_ANIMS.map((anim, i) => (
        <div key={i}
          style={{
            width: 3,
            height: 4,
            borderRadius: 2,
            background: '#1DB954',
            animation: active ? `${anim} 0.5s ease-in-out ${EQ_DELAYS[i]} infinite` : 'none',
          }} />
      ))}
    </div>
  );
}

// ─── Direct Spotify API helper ────────────────────────────────────────────────
// Calls Spotify's REST API directly from the browser.
// Spotify supports browser CORS for authenticated requests.
async function spotifyAPI(endpoint: string, token: string) {
  const base = 'https://api.spotify.com/v1';
  const r = await fetch(`${base}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!r.ok) {
    // Use .text() first so non-JSON 403/WAF pages don't throw
    const text = await r.text().catch(() => '');
    let errMsg = `Spotify error ${r.status}${text ? ': ' + text.substring(0, 120) : ''}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.error?.message) errMsg = parsed.error.message;
    } catch { /* non-JSON response */ }
    console.error(`[Spotify ${r.status}] ${endpoint} →`, text.substring(0, 500));
    throw Object.assign(new Error(errMsg), { status: r.status });
  }
  return r.json();
}

// ─── Token validation ────────────────────────────────────────────────────────
// Spotify access tokens are 80-200+ chars. Reject stale "undefined"/"null"
// strings left over from old session-based architecture.
function isValidToken(t: string | null): t is string {
  return typeof t === 'string' && t.length > 50 && t !== 'undefined' && t !== 'null';
}

// ─── Token hook ──────────────────────────────────────────────────────────────
function useSpotifyToken() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem('spotify_token');
    if (!isValidToken(stored)) {
      // Auto-clear stale/invalid tokens so the user sees the login prompt
      if (stored) {
        console.warn('[MusicHub] Cleared stale token from previous session:', stored.substring(0, 30));
        sessionStorage.removeItem('spotify_token');
        sessionStorage.removeItem('spotify_token_expires');
      }
      return null;
    }
    return stored;
  });

  useEffect(() => {
    function onReady(e: Event) {
      const t = (e as CustomEvent).detail || sessionStorage.getItem('spotify_token');
      if (isValidToken(t)) setToken(t);
    }
    function onFocus() {
      const t = sessionStorage.getItem('spotify_token');
      if (isValidToken(t) && t !== token) setToken(t);
    }
    window.addEventListener('spotify-session-ready', onReady);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('spotify-session-ready', onReady);
      window.removeEventListener('focus', onFocus);
    };
  }, [token]);

  function logout() {
    sessionStorage.removeItem('spotify_token');
    sessionStorage.removeItem('spotify_token_expires');
    setToken(null);
  }
  return { token, logout };
}

// ─── YouTube-style Track Card ─────────────────────────────────────────────────
function TrackCard({ track, playing, onPlay, onFavorite, isFav }: {
  track: Track; playing: boolean; onPlay: () => void; onFavorite: () => void; isFav: boolean;
}) {
  const duration = track.duration_ms ? fmt(track.duration_ms) : '';
  const views    = track.viewCount   ? fmtViews(track.viewCount) : '';

  return (
    <div
      className="group flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all duration-200"
      style={{
        background: playing ? 'rgba(29,185,84,0.08)' : 'transparent',
        border: playing ? '1px solid rgba(29,185,84,0.25)' : '1px solid rgba(255,255,255,0.04)',
        animation: 'mh-fadeup 0.3s ease-out both',
      }}
      onMouseEnter={e => { if (!playing) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { if (!playing) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      onClick={onPlay}
    >
      {/* 16:9 thumbnail with duration overlay + hover play button */}
      <div className="relative rounded-xl overflow-hidden shrink-0"
        style={{ width: 88, height: 56 }}>
        {track.image
          ? <img src={track.image} alt={track.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: '#1a1a2e' }}>🎵</div>}
        {/* Duration badge */}
        {duration && (
          <span className="absolute bottom-1 right-1 text-[8px] font-bold px-1 py-0.5 rounded"
            style={{ background: 'rgba(0,0,0,0.82)', color: '#fff' }}>{duration}</span>
        )}
        {/* Play overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity
          ${playing ? 'opacity-100 bg-black/40' : 'opacity-0 bg-black/50 group-hover:opacity-100'}`}>
          {playing
            ? <Equalizer active />
            : <Play className="w-5 h-5 text-white" fill="currentColor" />}
        </div>
        {/* Playing indicator line */}
        {playing && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: '#1DB954' }} />}
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold leading-tight line-clamp-2 mb-0.5 ${playing ? 'text-[#1DB954]' : 'text-white'}`}
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {track.name}
        </div>
        <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{track.artists}</div>
        {views && <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{views}</div>}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <button
          onClick={e => { e.stopPropagation(); onFavorite(); }}
          className="transition-all hover:scale-110 active:scale-90"
          style={{ color: isFav ? '#ff2d78' : 'rgba(255,255,255,0.25)' }}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}>
          <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
        </button>
        {track.external_url && (
          <a href={track.external_url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="transition-colors hover:text-[#1DB954]"
            style={{ color: 'rgba(255,255,255,0.2)' }}
            title="Open in YouTube">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

// Piped API removed — YouTube video IDs now come directly from YouTube Data API v3 (track.id)

// ─── Mini Now Playing Bar (tappable → opens full-screen player) ────────────────
function MiniPlayerBar({ track, ytVideoId, ytLoading, roomCode, isHost, onClick }: {
  track: Track; ytVideoId: string | null; ytLoading: boolean;
  roomCode: string | null; isHost: boolean; onClick: () => void;
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 cursor-pointer"
      style={{
        background: 'rgba(8,8,18,0.97)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(29,185,84,0.25)',
        boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
        animation: 'mh-slidein 0.35s ease-out',
      }}
      onClick={onClick}
    >
      {/* Progress shimmer */}
      <div className="absolute top-0 left-0 h-0.5 rounded-full"
        style={{ background: '#1DB954', width: ytVideoId ? '60%' : '0%', transition: 'width 0.5s ease', boxShadow: '0 0 8px rgba(29,185,84,0.8)' }} />

      <div className="flex items-center gap-3 px-4 py-3 max-w-5xl mx-auto">
        <VinylRecord artwork={track.image} spinning={!!ytVideoId && !ytLoading} />

        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white truncate">{track.name}</div>
          <div className="text-xs text-gray-400 truncate">{track.artists}</div>
          {roomCode && (
            <div className="flex items-center gap-1 mt-0.5">
              <Radio className="w-3 h-3 text-[#1DB954]" />
              <span className="text-[10px] text-[#1DB954] font-mono">{isHost ? 'HOSTING' : 'SYNCED'} · {roomCode}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {ytLoading && (
            <div className="flex gap-1 items-center">
              {[0,1,2].map(i => <span key={i} className="w-1 h-3 rounded-full bg-[#1DB954] animate-pulse" style={{ animationDelay: `${i*0.15}s` }} />)}
            </div>
          )}
          {!ytLoading && ytVideoId && (
            <span className="text-[9px] text-[#1DB954] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(29,185,84,0.12)', border: '1px solid rgba(29,185,84,0.25)' }}>
              ▶ Full Song
            </span>
          )}
          <ChevronUp className="w-5 h-5 text-gray-500" />
        </div>
      </div>
    </div>
  );
}

// ─── Sync Room Modal ──────────────────────────────────────────────────────────
function SyncRoomModal({ token, nowPlaying, onClose, onGuestSync }: {
  token: string; nowPlaying: Track | null;
  onClose: () => void;
  onGuestSync: (track: Track, isPlaying: boolean, time: number) => void;
}) {
  const [mode, setMode] = useState<'pick' | 'host' | 'join'>('pick');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [members, setMembers] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function createRoom() {
    setLoading(true);
    try {
      const r = await fetch('/api/spotify/room/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      const d = await r.json();
      if (d.roomCode) { setRoomCode(d.roomCode); setMode('host'); }
    } catch { setStatus('Failed to create room.'); }
    setLoading(false);
  }

  async function joinRoom() {
    if (joinCode.length < 4) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/spotify/room/${joinCode.toUpperCase()}/join`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      const d = await r.json();
      if (d.error) { setStatus('Room not found. Check the code!'); setLoading(false); return; }
      setMembers(d.members);
      if (d.track) onGuestSync(d.track, d.isPlaying, d.currentTime);
      setRoomCode(joinCode.toUpperCase());
      setMode('join');
    } catch { setStatus('Failed to join room.'); }
    setLoading(false);
  }

  function copyCode() {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Guest: poll every 3s
  useEffect(() => {
    if (mode !== 'join' || !roomCode) return;
    const id = setInterval(async () => {
      const r = await fetch(`/api/spotify/room/${roomCode}`);
      const d = await r.json();
      if (!d.error && d.track) onGuestSync(d.track, d.isPlaying, d.currentTime);
      if (d.members) setMembers(d.members);
    }, 3000);
    return () => clearInterval(id);
  }, [mode, roomCode, onGuestSync]);

  // Host: push every 5s
  useEffect(() => {
    if (mode !== 'host' || !roomCode || !nowPlaying) return;
    const id = setInterval(() => {
      fetch(`/api/spotify/room/${roomCode}/sync`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ track: nowPlaying, isPlaying: true, currentTime: 0 }),
      });
    }, 5000);
    return () => clearInterval(id);
  }, [mode, roomCode, nowPlaying, token]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', animation: 'mh-fadein 0.2s ease-out' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="w-full max-w-sm rounded-3xl p-6 relative"
        style={{ background: '#0f0f1a', border: '1px solid rgba(29,185,84,0.3)', boxShadow: '0 0 60px rgba(29,185,84,0.15)', animation: 'mh-popin 0.25s ease-out' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(29,185,84,0.15)', border: '1px solid rgba(29,185,84,0.3)' }}>
            <Radio className="w-5 h-5 text-[#1DB954]" />
          </div>
          <div>
            <h3 className="text-white font-bold">Long Distance Listening</h3>
            <p className="text-xs text-gray-500">Listen together, anywhere in the world 🌍</p>
          </div>
        </div>

        {mode === 'pick' && (
          <div className="space-y-3">
            <button onClick={createRoom} disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-3 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg,#1DB954,#17a348)', boxShadow: '0 0 30px rgba(29,185,84,0.3)' }}>
              <Users className="w-5 h-5" />
              {loading ? 'Creating…' : 'Create a Room (Host)'}
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center"><span className="px-3 text-xs text-gray-500 bg-[#0f0f1a]">or</span></div>
            </div>
            <div className="flex gap-2">
              <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter room code"
                maxLength={6}
                className="flex-1 px-4 py-3 rounded-xl text-sm text-white outline-none font-mono tracking-widest uppercase"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                onKeyDown={e => e.key === 'Enter' && joinRoom()} />
              <button onClick={joinRoom} disabled={loading || joinCode.length < 4}
                className="px-4 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                {loading ? '…' : 'Join'}
              </button>
            </div>
            {status && <p className="text-red-400 text-xs text-center">{status}</p>}
          </div>
        )}

        {mode === 'host' && (
          <div className="text-center space-y-4">
            <p className="text-gray-400 text-sm">Share this code with your partner</p>
            <div className="flex items-center justify-center gap-3">
              <div className="text-4xl font-black font-mono tracking-[0.2em] text-[#1DB954]">{roomCode}</div>
              <button onClick={copyCode}
                className="p-2 rounded-lg transition-all hover:scale-110 active:scale-90"
                style={{ background: 'rgba(29,185,84,0.15)', border: '1px solid rgba(29,185,84,0.3)' }}>
                {copied ? <Check className="w-4 h-4 text-[#1DB954]" /> : <Copy className="w-4 h-4 text-[#1DB954]" />}
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Users className="w-4 h-4" /><span>{members} connected</span>
              <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse ml-1" />
            </div>
            <p className="text-xs text-gray-600">Your partner joins → music syncs automatically 🎵</p>
            {nowPlaying
              ? <div className="flex items-center gap-3 p-3 rounded-xl text-left" style={{ background: 'rgba(29,185,84,0.08)', border: '1px solid rgba(29,185,84,0.15)' }}>
                  {nowPlaying.image && <img src={nowPlaying.image} className="w-10 h-10 rounded-lg object-cover" alt="" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{nowPlaying.name}</div>
                    <div className="text-xs text-gray-500 truncate">{nowPlaying.artists}</div>
                  </div>
                  <Equalizer active />
                </div>
              : <p className="text-xs text-gray-600">Play a song preview to sync it</p>
            }
          </div>
        )}

        {mode === 'join' && (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
              <span className="text-[#1DB954] text-sm font-semibold">Live Synced · {roomCode}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Users className="w-4 h-4" /><span>{members} listening together</span>
            </div>
            <p className="text-xs text-gray-600">Music playing in sync with your partner 🎶</p>
            <p className="text-[10px] text-gray-700">Syncs every 3 seconds automatically</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MusicHub() {
  const { token, logout } = useSpotifyToken();
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [ytError, setYtError] = useState<string>('');         // quota / key errors
  const [trendingLoaded, setTrendingLoaded] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('spotify_favs') || '[]'); } catch { return []; } });
  const [activeTab, setActiveTab] = useState<'search' | 'top' | 'favorites'>('search');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);

  // ytVideoId is now the track.id (YouTube video ID) — no separate lookup!
  const ytVideoId = nowPlaying?.id ?? null;

  // Inject CSS animations once
  useEffect(() => {
    const id = 'mh-keyframes';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id;
      el.textContent = CSS_ANIMATIONS;
      document.head.appendChild(el);
    }
  }, []);

  // Load user profile + top tracks from Spotify (best-effort: fails gracefully if app owner lacks Premium)
  useEffect(() => {
    if (!token) { setUser(null); return; }
    setLoadingUser(true);
    setTokenError(false);
    spotifyAPI('/me', token)
      .then(d => setUser(d))
      .catch(e => {
        // 403 = Spotify Premium required for app owner (known restriction, not an error)
        if (e.status === 401) { logout(); setTokenError(true); }
        // else silently ignore; user can still search via iTunes
      })
      .finally(() => setLoadingUser(false));
    // Top tracks require Premium scope — skip silently if denied
    spotifyAPI('/me/top/tracks?limit=10&time_range=short_term', token)
      .then(d => setTopTracks((d.items || []).map(mapTrack)))
      .catch(() => { /* expected 403 on non-premium dev accounts */ });
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { localStorage.setItem('spotify_favs', JSON.stringify(favorites)); }, [favorites]);

  async function search() {
    if (!query.trim()) return;
    setSearching(true); setActiveTab('search'); setYtError('');
    try {
      const tracks = await searchYouTubeVideos(query.trim(), 20);
      setResults(tracks);
      if (!tracks.length) setYtError('No results found for that query.');
    } catch (e: any) {
      console.error('[YouTube search]', e.message);
      setResults([]);
      if (e instanceof YouTubeAPIError) setYtError(e.message);
      else setYtError('Search failed. Please check your connection and try again.');
    } finally { setSearching(false); }
  }

  // Load trending when switching to 'top' tab
  async function loadTrending() {
    if (trendingLoaded || topTracks.length) return;
    setSearching(true); setYtError('');
    try {
      const tracks = await getTrendingMusic();
      setTopTracks(tracks);
      setTrendingLoaded(true);
    } catch (e: any) {
      if (e instanceof YouTubeAPIError) setYtError(e.message);
    } finally { setSearching(false); }
  }

  const syncToRoom = useCallback(async (t: Track, isPlaying: boolean, currentTime: number) => {
    if (!activeRoom || !token) return;
    await fetch(`/api/spotify/room/${activeRoom}/sync`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ track: t, isPlaying, currentTime }),
    });
  }, [activeRoom, token]);

  const displayTracks = activeTab === 'search'    ? results
    : activeTab === 'top'     ? topTracks
    : [...results, ...topTracks].filter(
        (t, i, arr) => arr.findIndex(x => x.id === t.id) === i && favorites.includes(t.id)
      );

  return (
    <div className="min-h-screen relative pb-28" style={{ background: 'var(--bg-primary, #0a0a14)' }}>
      <FloatingNotes />

      {/* ── Header ── */}
      <div className="sticky top-0 z-40" style={{ background: 'rgba(10,10,20,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(29,185,84,0.15)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-110 hover:rotate-12"
              style={{ background: '#1DB954', boxShadow: '0 0 20px rgba(29,185,84,0.4)' }}>
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">Music Hub</h1>
              <p className="text-[10px] text-gray-500 mt-0.5">Powered by YouTube · Connect Spotify for rooms</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {token && (
              <button onClick={() => setShowRoomModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                style={{ background: activeRoom ? 'rgba(29,185,84,0.2)' : 'rgba(255,255,255,0.06)', color: activeRoom ? '#1DB954' : '#aaa', border: `1px solid ${activeRoom ? 'rgba(29,185,84,0.4)' : 'rgba(255,255,255,0.1)'}` }}>
                <Radio className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{activeRoom ? `Room · ${activeRoom}` : 'Sync Room'}</span>
              </button>
            )}

            {token ? (
              <div className="flex items-center gap-2">
                {loadingUser && (
                  <div className="flex gap-1 items-center px-3 py-2">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                )}
                {!loadingUser && user && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {user.images?.[0]?.url
                      ? <img src={user.images[0].url} className="w-6 h-6 rounded-full" alt="" />
                      : <User className="w-4 h-4 text-gray-400" />}
                    <span className="text-xs text-white font-medium">{user.display_name}</span>
                    {user.product === 'premium' && <span className="text-[9px] text-[#1DB954] font-bold">PRO</span>}
                  </div>
                )}
                {!loadingUser && !user && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <User className="w-4 h-4 text-[#1DB954]" />
                    <span className="text-xs text-[#1DB954] font-medium">Connected ✓</span>
                  </div>
                )}
                <button onClick={logout} className="p-2 rounded-lg text-gray-500 hover:text-white transition-colors" title="Disconnect">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <a href="/auth/spotify/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: '#1DB954', boxShadow: '0 0 20px rgba(29,185,84,0.4)' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.214c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.856zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.97-.519.781.781 0 01.52-.971c3.632-1.102 8.147-.568 11.23 1.328a.78.78 0 01.257 1.071zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 11-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.935.935 0 01-.954 1.608z"/>
                </svg>
                Connect Spotify
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">

        {/* ── YouTube API key warning ── */}
        {!isApiKeyConfigured() && (
          <div className="flex items-start gap-3 p-4 rounded-2xl mb-5"
            style={{ background: 'rgba(255,160,0,0.08)', border: '1px solid rgba(255,160,0,0.3)' }}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#FFA000' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#FFA000' }}>YouTube API Key Missing</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,160,0,0.8)' }}>
                Add <code className="bg-black/30 px-1 rounded">VITE_YOUTUBE_API_KEY</code> to your <code className="bg-black/30 px-1 rounded">.env</code> file or Vercel env vars.
                Get a free key at <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">console.cloud.google.com</a>
              </p>
            </div>
          </div>
        )}

        {/* ── Quota / search error ── */}
        {ytError && (
          <div className="flex items-start gap-3 p-4 rounded-2xl mb-5"
            style={{ background: 'rgba(255,45,120,0.07)', border: '1px solid rgba(255,45,120,0.25)' }}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#ff2d78' }} />
            <div className="flex-1">
              <p className="text-sm" style={{ color: '#ff2d78' }}>{ytError}</p>
            </div>
            <button onClick={() => setYtError('')} className="text-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* ── Not logged in: show search + login CTA ── */}
        {!token && (
          <div style={{ animation: 'mh-fadeup 0.5s ease-out' }}>
            {/* Search works without login */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
                  placeholder="Search any song or artist…"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm text-white outline-none placeholder-gray-600"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <button onClick={search} disabled={searching || !query.trim()}
                className="px-5 py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                style={{ background: '#1DB954', boxShadow: '0 0 20px rgba(29,185,84,0.3)' }}>
                {searching ? '…' : 'Search'}
              </button>
            </div>

            {/* Track results even without login */}
            {results.length > 0 && (
              <div className="space-y-2 mb-8" style={{ animation: 'mh-fadeup 0.4s ease-out' }}>
                {results.map(t => (
                  <TrackCard key={t.id} track={t} playing={nowPlaying?.id === t.id} isFav={favorites.includes(t.id)}
                    onPlay={() => { setNowPlaying(t); setShowNowPlaying(true); }}
                    onFavorite={() => setFavorites(f => f.includes(t.id) ? f.filter(x => x !== t.id) : [...f, t.id])} />
                ))}
              </div>
            )}

            {results.length === 0 && (
              <div className="text-center py-12">
                <div
                  className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
                  style={{ background: '#1DB954', boxShadow: '0 0 60px rgba(29,185,84,0.4)' }}>
                  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.214c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.856zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.97-.519.781.781 0 01.52-.971c3.632-1.102 8.147-.568 11.23 1.328a.78.78 0 01.257 1.071zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 11-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.935.935 0 01-.954 1.608z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-black mb-2 text-white">Music Hub</h2>
                <p className="text-gray-400 mb-1 max-w-md mx-auto">Search any song above · <span className="text-[#1DB954] font-semibold">listen together</span> with your partner</p>
                <p className="text-gray-600 text-sm mb-6">🌍 Long-distance · ❤️ Favorites · 🎵 30s previews</p>
                <a href="/auth/spotify/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'rgba(29,185,84,0.15)', border: '1px solid rgba(29,185,84,0.3)', color: '#1DB954' }}>
                  <LogIn className="w-4 h-4" /> Connect Spotify for Sync Rooms
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── Dashboard (logged in) ── */}
        {token && (
          <>
            {/* Search */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
                  placeholder="Search any song on YouTube…"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm text-white outline-none placeholder-gray-600"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <button onClick={search} disabled={searching || !query.trim()}
                className="px-5 py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                style={{ background: '#FF0000', boxShadow: '0 0 20px rgba(255,0,0,0.3)' }}>
                {searching ? '…' : <Youtube className="w-4 h-4" />}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 p-1 rounded-2xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {([
                { id: 'search',    label: 'Search',    icon: Search },
                { id: 'top',       label: 'Trending',  icon: TrendingUp },
                { id: 'favorites', label: `❤️ ${favorites.length}`, icon: Heart },
              ] as const).map(tab => (
                <button key={tab.id}
                  onClick={() => { setActiveTab(tab.id); if (tab.id === 'top') loadTrending(); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={activeTab === tab.id ? { background: '#1DB954', color: 'white', boxShadow: '0 0 15px rgba(29,185,84,0.3)' } : { color: '#666' }}>
                  <tab.icon className="w-3.5 h-3.5" />{tab.label}
                </button>
              ))}
            </div>

            {/* Track list */}
            {searching && displayTracks.length === 0 && (
              <div className="flex flex-col items-center py-16">
                <div className="flex gap-2 mb-4">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="w-1.5 h-8 rounded-full animate-pulse" style={{ background: '#1DB954', animationDelay: `${i*0.15}s`, animationDuration: '0.8s' }} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm">Searching YouTube…</p>
              </div>
            )}
            {!searching && displayTracks.length === 0 && (
              <div className="text-center py-16" style={{ animation: 'mh-fadeup 0.4s ease-out' }}>
                <div className="text-5xl mb-4">{activeTab === 'favorites' ? '💔' : activeTab === 'top' ? '📈' : '🎬'}</div>
                <p className="text-gray-600 text-sm">
                  {activeTab === 'favorites' ? 'Heart a track to save it here.'
                   : activeTab === 'top' ? 'Click Trending to load top YouTube music.'
                   : 'Search any song, artist, or album above.'}
                </p>
              </div>
            )}
            {displayTracks.length > 0 && (
              <div className="space-y-1.5">
                {displayTracks.map(t => (
                  <TrackCard key={t.id} track={t} playing={nowPlaying?.id === t.id}
                    onPlay={() => { setNowPlaying(t); setShowNowPlaying(true); }}
                    onFavorite={() => setFavorites(f => f.includes(t.id) ? f.filter(x => x !== t.id) : [...f, t.id])}
                    isFav={favorites.includes(t.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Mini player bar (click to open full-screen) ── */}
      {nowPlaying && !showNowPlaying && (
        <MiniPlayerBar
          track={nowPlaying}
          ytVideoId={ytVideoId}
          ytLoading={false}
          roomCode={activeRoom}
          isHost={isHost}
          onClick={() => setShowNowPlaying(true)}
        />
      )}

      {/* ── Full-screen Now Playing screen ── */}
      {nowPlaying && showNowPlaying && (
        <NowPlayingScreen
          track={nowPlaying}
          queue={[...results, ...topTracks].filter((t, i, a) => a.findIndex(x => x.id === t.id) === i)}
          ytVideoId={ytVideoId}
          ytLoading={false}
          isHost={isHost}
          roomCode={activeRoom}
          onClose={() => setShowNowPlaying(false)}
          onNext={() => {
            const list = results.length ? results : topTracks;
            const idx = list.findIndex(t => t.id === nowPlaying.id);
            if (idx >= 0 && idx + 1 < list.length) setNowPlaying(list[idx + 1]);
          }}
          onPrev={() => {
            const list = results.length ? results : topTracks;
            const idx = list.findIndex(t => t.id === nowPlaying.id);
            if (idx > 0) setNowPlaying(list[idx - 1]);
          }}
          onTrackSelect={t => setNowPlaying(t)}
        />
      )}

      {/* ── Sync Room Modal ── */}
      {showRoomModal && token && (
        <SyncRoomModal token={token} nowPlaying={nowPlaying}
          onClose={() => setShowRoomModal(false)}
          onGuestSync={(track) => {
            setNowPlaying(track);
            setIsHost(false);
          }} />
      )}
    </div>
  );
}
