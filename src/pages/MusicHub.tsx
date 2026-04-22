import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Music2, Search, Play, Pause, ExternalLink, Heart, LogIn, LogOut,
  User, Clock, Users, Copy, Check, Radio, X,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface SpotifyUser { id: string; display_name: string; email: string; images: { url: string }[]; product: string; }
interface Track {
  id: string; name: string; artists: string; album: string;
  image: string; preview_url: string | null; duration_ms: number; external_url: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (ms: number) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`; };

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

// ─── Token hook ──────────────────────────────────────────────────────────────
function useSpotifyToken() {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem('spotify_token') : null
  );

  useEffect(() => {
    function onReady(e: Event) {
      const t = (e as CustomEvent).detail || sessionStorage.getItem('spotify_token');
      if (t) setToken(t);
    }
    function onFocus() {
      const t = sessionStorage.getItem('spotify_token');
      if (t && t !== token) setToken(t);
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

// ─── Track Card ───────────────────────────────────────────────────────────────
function TrackCard({ track, playing, onPlay, onFavorite, isFav }: {
  track: Track; playing: boolean; onPlay: () => void; onFavorite: () => void; isFav: boolean;
}) {
  return (
    <div
      className="group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200"
      style={{
        background: playing ? 'rgba(29,185,84,0.1)' : undefined,
        border: playing ? '1px solid rgba(29,185,84,0.3)' : '1px solid transparent',
        animation: 'mh-fadeup 0.3s ease-out both',
      }}
      onClick={() => track.preview_url && onPlay()}
    >
      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
        {track.image ? <img src={track.image} alt={track.album} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xl">🎵</div>}
        <div className={`absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {playing ? <Equalizer active /> : <Play className="w-4 h-4 text-white" />}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold truncate ${playing ? 'text-[#1DB954]' : 'text-white'}`}>{track.name}</div>
        <div className="text-xs truncate text-gray-400">{track.artists}</div>
        <div className="text-xs truncate text-gray-600">{track.album}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs font-mono text-gray-600">{fmt(track.duration_ms)}</span>
        <button
          onClick={e => { e.stopPropagation(); onFavorite(); }}
          className={`transition-all hover:scale-110 active:scale-90 ${isFav ? 'text-[#ff2d78]' : 'text-gray-500 hover:text-[#ff2d78]'}`}>
          <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
        </button>
        {track.external_url && (
          <a href={track.external_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            className="text-gray-500 hover:text-[#1DB954] transition-colors"><ExternalLink className="w-4 h-4" /></a>
        )}
      </div>
      {!track.preview_url && <span className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded shrink-0">No preview</span>}
    </div>
  );
}

// ─── Now Playing Bar ──────────────────────────────────────────────────────────
function NowPlayingBar({ track, roomCode, isHost, onSyncToRoom }: {
  track: Track | null; roomCode: string | null; isHost: boolean;
  onSyncToRoom: (t: Track, playing: boolean, time: number) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!audioRef.current || !track?.preview_url) return;
    audioRef.current.src = track.preview_url;
    audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    setProgress(0);
    setVisible(true);
  }, [track]);

  useEffect(() => {
    if (!isHost || !roomCode || !track) return;
    const id = setInterval(() => {
      onSyncToRoom(track, playing, audioRef.current?.currentTime ?? 0);
    }, 5000);
    return () => clearInterval(id);
  }, [isHost, roomCode, track, playing, onSyncToRoom]);

  function toggle() {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  }

  if (!track) return null;
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10,10,20,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(29,185,84,0.2)',
        animation: visible ? 'mh-slidein 0.35s ease-out' : 'none',
      }}>
      <div className="h-0.5 bg-white/10">
        <div className="h-full bg-[#1DB954] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center gap-3 px-4 py-3 max-w-5xl mx-auto">
        <VinylRecord artwork={track.image} spinning={playing} />
        <div className="flex-1 min-w-0 ml-1">
          <div className="text-sm font-bold text-white truncate">{track.name}</div>
          <div className="text-xs text-gray-400 truncate">{track.artists}</div>
          {roomCode && (
            <div className="flex items-center gap-1 mt-0.5">
              <Radio className="w-3 h-3 text-[#1DB954]" />
              <span className="text-[10px] text-[#1DB954] font-mono">{isHost ? 'HOSTING' : 'SYNCED'} · {roomCode}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-mono hidden sm:block">30s preview</span>
          <button onClick={toggle}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-110 active:scale-90"
            style={{ background: '#1DB954', boxShadow: playing ? '0 0 20px rgba(29,185,84,0.5)' : 'none' }}>
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
        </div>
      </div>
      <audio ref={audioRef}
        onTimeUpdate={() => { const a = audioRef.current; if (a?.duration) setProgress((a.currentTime / a.duration) * 100); }}
        onEnded={() => { setPlaying(false); setProgress(0); }} />
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
  const spotifyFetch = useCallback((url: string, opts: RequestInit = {}) =>
    fetch(url, { ...opts, headers: { ...(opts.headers as Record<string,string> || {}), Authorization: `Bearer ${token}` } }),
  [token]);

  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('spotify_favs') || '[]'); } catch { return []; } });
  const [activeTab, setActiveTab] = useState<'search' | 'top' | 'favorites'>('search');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);

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

  useEffect(() => {
    if (!token) { setUser(null); return; }
    setLoadingUser(true);
    spotifyFetch('/api/spotify/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setUser(d); })
      .finally(() => setLoadingUser(false));
    spotifyFetch('/api/spotify/top-tracks')
      .then(r => r.ok ? r.json() : [])
      .then(d => setTopTracks(Array.isArray(d) ? d : []));
  }, [token, spotifyFetch]);

  useEffect(() => { localStorage.setItem('spotify_favs', JSON.stringify(favorites)); }, [favorites]);

  async function search() {
    if (!query.trim() || !token) return;
    setSearching(true); setActiveTab('search');
    try {
      const r = await spotifyFetch(`/api/spotify/search?q=${encodeURIComponent(query.trim())}`);
      const d = await r.json();
      setResults(Array.isArray(d) ? d : []);
    } catch { setResults([]); }
    finally { setSearching(false); }
  }

  const syncToRoom = useCallback(async (t: Track, isPlaying: boolean, currentTime: number) => {
    if (!activeRoom || !token) return;
    await fetch(`/api/spotify/room/${activeRoom}/sync`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ track: t, isPlaying, currentTime }),
    });
  }, [activeRoom, token]);

  const displayTracks = activeTab === 'search' ? results
    : activeTab === 'top' ? topTracks
    : [...results, ...topTracks].filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i && favorites.includes(t.id));

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
              <p className="text-[10px] text-gray-500 mt-0.5">Powered by Spotify</p>
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

        {/* ── Not logged in ── */}
        {!token && (
          <div className="text-center py-20" style={{ animation: 'mh-fadeup 0.5s ease-out' }}>
            <div
              className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center transition-transform hover:scale-110"
              style={{ background: '#1DB954', boxShadow: '0 0 60px rgba(29,185,84,0.4)' }}>
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.214c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.856zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.97-.519.781.781 0 01.52-.971c3.632-1.102 8.147-.568 11.23 1.328a.78.78 0 01.257 1.071zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 11-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.935.935 0 01-.954 1.608z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-black mb-3 text-white">Music Hub</h2>
            <p className="text-gray-400 mb-2 max-w-md mx-auto">Search songs, listen to previews, and <span className="text-[#1DB954] font-semibold">listen together</span> with your partner — no matter how far apart.</p>
            <p className="text-gray-600 text-sm mb-8">🌍 Long-distance listening · ❤️ Favorites · 🎵 30s previews</p>
            <a href="/auth/spotify/login"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-black text-lg transition-all hover:scale-105 active:scale-95"
              style={{ background: '#1DB954', boxShadow: '0 0 50px rgba(29,185,84,0.5)' }}>
              <LogIn className="w-5 h-5" /> Login with Spotify
            </a>
          </div>
        )}

        {/* ── Dashboard ── */}
        {token && (
          <>
            {/* Search */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
                  placeholder="Search songs, artists, albums…"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm text-white outline-none placeholder-gray-600"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <button onClick={search} disabled={searching || !query.trim()}
                className="px-5 py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                style={{ background: '#1DB954', boxShadow: '0 0 20px rgba(29,185,84,0.3)' }}>
                {searching ? '…' : 'Search'}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 p-1 rounded-2xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {([
                { id: 'search', label: 'Results', icon: Search },
                { id: 'top',    label: 'Your Top', icon: Clock },
                { id: 'favorites', label: `❤️ ${favorites.length}`, icon: Heart },
              ] as const).map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={activeTab === tab.id ? { background: '#1DB954', color: 'white', boxShadow: '0 0 15px rgba(29,185,84,0.3)' } : { color: '#666' }}>
                  <tab.icon className="w-3.5 h-3.5" />{tab.label}
                </button>
              ))}
            </div>

            {/* Track list */}
            {displayTracks.length === 0 ? (
              <div className="text-center py-16" style={{ animation: 'mh-fadeup 0.4s ease-out' }}>
                <div className="text-5xl mb-4">{activeTab === 'favorites' ? '💔' : activeTab === 'top' ? '🎵' : '🔍'}</div>
                <p className="text-gray-600 text-sm">
                  {activeTab === 'favorites' ? 'Heart a track to save it here.'
                   : activeTab === 'top' ? 'Listen to more music on Spotify to see your top tracks.'
                   : 'Search for a song to get started.'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {displayTracks.map(t => (
                  <TrackCard key={t.id} track={t} playing={nowPlaying?.id === t.id}
                    onPlay={() => setNowPlaying(t)}
                    onFavorite={() => setFavorites(f => f.includes(t.id) ? f.filter(x => x !== t.id) : [...f, t.id])}
                    isFav={favorites.includes(t.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Now Playing ── */}
      <NowPlayingBar track={nowPlaying} roomCode={activeRoom} isHost={isHost} onSyncToRoom={syncToRoom} />

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
