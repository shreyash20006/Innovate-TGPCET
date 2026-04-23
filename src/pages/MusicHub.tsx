import React, { useState, useEffect, useCallback } from 'react';
import {
  Music2, Search, Play, Pause, ExternalLink, Heart, LogIn, LogOut,
  User, Clock, Users, Copy, Check, Radio, X, ChevronUp, AlertTriangle,
  Youtube, TrendingUp, Compass, SkipBack, SkipForward, ListMusic,
} from 'lucide-react';
import NowPlaying from '../components/NowPlaying';
import MusicLibrary, { Equalizer } from '../components/MusicLibrary';
import DiscoverPage, { ArtistInfo } from '../components/DiscoverPage';
import ArtistProfile from '../components/ArtistProfile';
import { searchYouTubeVideos, getTrendingMusic, fmtViews, YouTubeAPIError, isApiKeyConfigured } from '../utils/youtubeApi';
import { Track } from '../types/music';
import GlobalSearch from '../components/GlobalSearch';

// ─── Types ───────────────────────────────────────────────────────────────────
interface SpotifyUser { id: string; display_name: string; email: string; images: { url: string }[]; product: string; }

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

  .glass-panel {
      background: rgba(26, 26, 26, 0.6);
      backdrop-filter: blur(20px);
      border: 1px solid transparent;
      border-image: linear-gradient(to bottom right, rgba(255,255,255,0.1), rgba(255,255,255,0.02)) 1;
  }
  .rim-light {
      box-shadow: inset 1px 1px 0px 0px rgba(255, 255, 255, 0.05);
  }
  .neon-glow {
      box-shadow: 0 0 15px rgba(0, 255, 133, 0.3);
  }
  .nebula-bg {
      background: radial-gradient(circle at 20% 30%, rgba(255, 0, 255, 0.05) 0%, transparent 40%),
                  radial-gradient(circle at 80% 70%, rgba(0, 255, 133, 0.05) 0%, transparent 40%);
  }
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
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const data = isMobile ? NOTE_DATA.slice(0, 8) : NOTE_DATA;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {data.map((n, i) => (
        <span key={i}
          style={{
            position: 'absolute',
            left: `${n.left}%`,
            top: `${n.top}%`,
            opacity: n.opacity,
            color: n.color,
            fontSize: isMobile ? '1.2rem' : '1.5rem',
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
            filter: isMobile ? 'blur(40px)' : 'blur(80px)',
            width: (isMobile ? 150 : 300) + i * (isMobile ? 50 : 100),
            height: (isMobile ? 150 : 300) + i * (isMobile ? 50 : 100),
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

// -- Equalizer imported from MusicLibrary

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
        console.warn('[MusicHub] Cleared stale token from previous session:', String(stored).substring(0, 30));
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

// -- TrackCard now in MusicLibrary

// Piped API removed — YouTube video IDs now come directly from YouTube Data API v3 (track.id)

// ─── Mini Now Playing Bar (tappable → opens full-screen player) ────────────────
function MiniPlayerBar({ track, ytVideoId, ytLoading, roomCode, isHost, onClick, onPlayPause, isPlaying, onNext, onPrev }: {
  track: Track; ytVideoId: string | null; ytLoading: boolean;
  roomCode: string | null; isHost: boolean; onClick: () => void;
  onPlayPause: (e: React.MouseEvent) => void; isPlaying: boolean;
  onNext: (e: React.MouseEvent) => void; onPrev: (e: React.MouseEvent) => void;
}) {
  return (
    <footer 
      className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 bg-[#0a0a0a]/95 backdrop-blur-3xl h-20 md:h-24 border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
      style={{ animation: 'mh-slidein 0.35s ease-out' }}
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" />
      
      {/* Track Info */}
      <div className="flex items-center gap-3 w-1/3 min-w-[30%] cursor-pointer" onClick={onClick}>
        <VinylRecord artwork={track.image} spinning={!!ytVideoId && !ytLoading && isPlaying} />
        
        <div className="overflow-hidden min-w-0 pr-2">
          <p className="text-white font-bold text-xs md:text-sm truncate">{track.name}</p>
          <div className="flex items-center gap-1.5 truncate">
            <p className="text-zinc-500 text-[10px] md:text-xs truncate">{track.artists}</p>
            {track.artists.toLowerCase().includes('vevo') && (
              <div className="w-3 h-3 rounded-full bg-white/10 flex items-center justify-center text-[8px] text-zinc-400">✓</div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 w-1/3 flex-1">
        <div className="flex items-center gap-4 md:gap-8">
          <button onClick={onPrev} className="text-zinc-400 hover:text-white transition-colors p-2 mobile-touch-scale" title="Previous">
            <SkipBack className="w-5 h-5 md:w-6 h-6" />
          </button>
          
          {ytLoading ? (
             <div className="flex gap-1 items-center px-2">
               {[0,1,2].map(i => <span key={i} className="w-1.5 h-6 rounded-full bg-[#00FF85] animate-pulse" style={{ animationDelay: `${i*0.15}s` }} />)}
             </div>
          ) : (
            <button onClick={onPlayPause} className="w-10 h-10 md:w-14 h-14 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-xl mobile-touch-scale" title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause className="w-5 h-5 md:w-7 h-7" fill="currentColor" /> : <Play className="w-5 h-5 md:w-7 h-7 ml-1" fill="currentColor" />}
            </button>
          )}

          <button onClick={onNext} className="text-zinc-400 hover:text-white transition-colors p-2 mobile-touch-scale" title="Next">
            <SkipForward className="w-5 h-5 md:w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Extras */}
      <div className="flex items-center justify-end gap-3 md:gap-6 w-1/3 min-w-[30%]">
        <button className="text-zinc-400 hover:text-white transition-colors p-2 mobile-touch-scale" title="Queue">
          <ListMusic className="w-5 h-5" />
        </button>
        <button onClick={onClick} className="text-zinc-400 hover:text-white transition-colors p-2 rotate-180 mobile-touch-scale" title="Expand player">
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>

    </footer>
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
  const [activeView, setActiveView] = useState<'discover' | 'library' | 'artist' | 'search'>('discover');
  const [selectedArtist, setSelectedArtist] = useState<ArtistInfo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // Global playback state

  function openArtist(a: ArtistInfo) { setSelectedArtist(a); setActiveView('artist'); }
  function goDiscover()              { setActiveView('discover'); }
  function goLibrary()               { setActiveView('library'); }

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

  useEffect(() => {
    if (!trendingLoaded) {
      loadTrending();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="min-h-[calc(100vh-68px)] relative pb-28 flex bg-[#0a0a0a]">
      <style>{CSS_ANIMATIONS}</style>
      <FloatingNotes />
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 nebula-bg" />

      {/* ── Mobile Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/5 py-2 px-4 flex items-center justify-around z-50 md:hidden">
        <button 
          onClick={() => setActiveView('discover')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all mobile-touch-scale ${activeView === 'discover' ? 'text-[#00FF85]' : 'text-zinc-500'}`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Discover</span>
        </button>
        <button 
          onClick={() => setActiveView('library')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all mobile-touch-scale ${activeView === 'library' ? 'text-[#00FF85]' : 'text-zinc-500'}`}
        >
          <Library className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Library</span>
        </button>
        <button 
          onClick={() => {
            setActiveView('library');
            setActiveTab('favorites');
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all mobile-touch-scale ${activeView === 'library' && activeTab === 'favorites' ? 'text-[#00FF85]' : 'text-zinc-500'}`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Liked</span>
        </button>
      </nav>

      {/* ── Unified Sidebar (always visible on desktop) ── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 pt-6 pb-24 z-30 min-h-full shrink-0 bg-[#0a0a0a]/90 backdrop-blur-2xl shadow-2xl overflow-y-auto">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,255,133,0.3)]" style={{ background: '#00FF85' }}>
            <Music2 className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none tracking-wide">NovaStream</h1>
            <p className="text-[9px] text-[#00FF85] mt-1 font-mono uppercase tracking-wider">Premium Audio</p>
          </div>
        </div>

        <div className="px-4 mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 px-2">Navigation</p>
          <div className="space-y-1">
            <button onClick={goDiscover}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all mobile-touch-scale ${
                activeView === 'discover' ? 'bg-[#00FF85]/10 text-[#00FF85] shadow-[0_0_15px_rgba(0,255,133,0.1)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}>
              <Compass className="w-5 h-5" /> <span className="font-semibold text-sm">Discover</span>
            </button>
            <button onClick={() => goLibrary()}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all mobile-touch-scale ${
                activeView === 'library' ? 'bg-[#00FF85]/10 text-[#00FF85] shadow-[0_0_15px_rgba(0,255,133,0.1)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}>
              <Search className="w-5 h-5" /> <span className="font-semibold text-sm">Search</span>
            </button>
            <button onClick={() => { goLibrary(); setActiveTab('top'); loadTrending(); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all mobile-touch-scale ${
                activeView === 'library' && activeTab === 'top' ? 'bg-[#00FF85]/10 text-[#00FF85] shadow-[0_0_15px_rgba(0,255,133,0.1)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}>
              <TrendingUp className="w-5 h-5" /> <span className="font-semibold text-sm">Explore</span>
            </button>
            <button onClick={() => { goLibrary(); setActiveTab('favorites'); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all mobile-touch-scale ${
                activeView === 'library' && activeTab === 'favorites' ? 'bg-[#00FF85]/10 text-[#00FF85] shadow-[0_0_15px_rgba(0,255,133,0.1)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}>
              <Heart className="w-5 h-5" /> <span className="font-semibold text-sm">Liked Songs</span>
            </button>
          </div>

        </div>

        {activeView === 'artist' && selectedArtist && (
          <div className="mx-4 p-4 rounded-xl" style={{ background: 'rgba(0,255,133,0.06)', border: '1px solid rgba(0,255,133,0.15)' }}>
            <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-2">Now Viewing</p>
            <div className="flex items-center gap-2">
              <img src={selectedArtist.image} alt={selectedArtist.name} className="w-8 h-8 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#00ff85] truncate">{selectedArtist.name}</p>
                <p className="text-[9px] text-zinc-600 uppercase tracking-wider truncate">{selectedArtist.genre}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden" style={{ minHeight: 'calc(100vh - 68px)' }}>
        
        {/* ── Top Header ── */}
        <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-3xl px-4 md:px-8 py-4 flex items-center justify-between gap-4 md:gap-6 border-b border-white/5">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#00FF85] shadow-[0_0_15px_rgba(0,255,133,0.3)]">
              <Music2 className="w-4 h-4 text-zinc-950" />
            </div>
          </div>
          <div className="flex-1">
            <GlobalSearch 
              query={query} 
              searching={searching} 
              onSearch={(q) => {
                setQuery(q);
                setActiveView('search');
                search();
              }} 
            />
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setShowRoomModal(true)} className="p-2.5 rounded-full bg-[#00ff85]/10 text-[#00ff85] border border-[#00ff85]/20 hover:bg-[#00ff85]/20 transition-all mobile-touch-scale relative">
               <Users className="w-5 h-5" />
               {activeRoom && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#00FF85] rounded-full border-2 border-[#0a0a0a] animate-pulse" />}
             </button>
             {token && user && (
               <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                 <img src={user.images?.[0]?.url || 'https://via.placeholder.com/32'} alt="" className="w-6 h-6 rounded-full border border-[#00FF85]/30" />
                 <span className="text-[10px] font-black text-white uppercase tracking-tighter">{user.display_name}</span>
               </div>
             )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar relative">

        {/* Discover View */}
        {activeView === 'discover' && (
          <div style={{ animation: 'mh-fadeup 0.4s ease-out' }}>
            <DiscoverPage
              topTracks={topTracks}
              nowPlaying={nowPlaying}
              onPlayTrack={t => { setNowPlaying(t); setShowNowPlaying(true); }}
              onViewArtist={openArtist}
              onLoadTrending={loadTrending}
              searching={searching}
            />
          </div>
        )}

        {/* Library View */}
        {activeView === 'library' && (
          <div style={{ animation: 'mh-fadeup 0.4s ease-out' }}>
            <MusicLibrary
              state={{
                token,
                user,
                query,
                searching,
                displayTracks,
                results,
                activeTab,
                loadingUser,
                ytError,
                activeRoom,
                nowPlaying,
                favorites,
                isApiKeyConfigured: isApiKeyConfigured()
              }}
              actions={{
                setQuery,
                search,
                setActiveTab,
                loadTrending,
                setYtError,
                setShowRoomModal,
                logout,
                setNowPlaying: (t) => { setNowPlaying(t); },
                setShowNowPlaying,
                setFavorites
              }}
              hideInternalSidebar
              hideInternalHeader
            />
          </div>
        )}

        {/* Artist Profile View */}
        {activeView === 'artist' && selectedArtist && (
          <div style={{ animation: 'mh-fadeup 0.4s ease-out' }}>
            <ArtistProfile
              artist={selectedArtist}
              nowPlaying={nowPlaying}
              onPlayTrack={t => { setNowPlaying(t); setShowNowPlaying(true); }}
              onViewArtist={openArtist}
              onBack={() => setActiveView('discover')}
            />
          </div>
        )}

        {/* Global Search Results View */}
        {activeView === 'search' && (
          <div style={{ animation: 'mh-fadeup 0.4s ease-out' }}>
            <MusicLibrary
              state={{
                token,
                user,
                query,
                searching,
                displayTracks,
                results,
                activeTab: 'search',
                loadingUser,
                ytError,
                activeRoom,
                nowPlaying,
                favorites,
                isApiKeyConfigured: isApiKeyConfigured()
              }}
              actions={{
                setQuery,
                search,
                setActiveTab,
                loadTrending,
                setYtError,
                setShowRoomModal,
                logout,
                setNowPlaying: (t) => { setNowPlaying(t); },
                setShowNowPlaying,
                setFavorites
              }}
              hideInternalSidebar
              hideInternalHeader
            />
          </div>
        )}

        </div>
      </div>

      {/* ── Mini player bar (click to open full-screen) ── */}
      {nowPlaying && !showNowPlaying && (
        <MiniPlayerBar
          track={nowPlaying}
          ytVideoId={ytVideoId}
          ytLoading={searching}
          roomCode={activeRoom}
          isHost={isHost}
          isPlaying={isPlaying}
          onPlayPause={(e) => {
            e.stopPropagation();
            setIsPlaying(!isPlaying);
          }}
          onNext={(e) => {
            e.stopPropagation();
            const list = results.length ? results : topTracks;
            const idx = list.findIndex(t => t.id === nowPlaying.id);
            if (idx >= 0 && idx + 1 < list.length) setNowPlaying(list[idx + 1]);
          }}
          onPrev={(e) => {
            e.stopPropagation();
            const list = results.length ? results : topTracks;
            const idx = list.findIndex(t => t.id === nowPlaying.id);
            if (idx > 0) setNowPlaying(list[idx - 1]);
          }}
          onClick={() => setShowNowPlaying(true)}
        />
      )}

      {/* ── Full-screen Now Playing screen ── */}
      {nowPlaying && showNowPlaying && (
        <NowPlaying
          track={nowPlaying}
          queue={[...results, ...topTracks].filter((t, i, a) => a.findIndex(x => x.id === t.id) === i)}
          ytVideoId={ytVideoId}
          ytLoading={searching}
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
