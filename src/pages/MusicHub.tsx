import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// ─── 3D Animated Background ──────────────────────────────────────────────────
// Pre-compute random values ONCE as module-level constants.
// NEVER use Math.random() inside render/animate props — causes infinite loops.
const NOTE_SYMBOLS = ['\u266A', '\u266b', '\u266c', '\u2669', '\uD83C\uDFB5', '\uD83C\uDFB6'];
const NOTE_DATA = Array.from({ length: 18 }, (_, i) => ({
  left:     Math.round(Math.random() * 100),
  top:      Math.round(Math.random() * 100),
  opacity:  +(0.06 + Math.random() * 0.08).toFixed(2),
  color:    i % 3 === 0 ? '#1DB954' : i % 3 === 1 ? '#ff2d78' : '#a855f7',
  symbol:   NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)],
  yRange:   Math.round(40 + Math.random() * 60),
  xRange:   Math.round((Math.random() - 0.5) * 30),
  rot:      Math.round((Math.random() - 0.5) * 40),
  scale:    +(1.2 + Math.random() * 0.3).toFixed(2),
  duration: +(4 + Math.random() * 6).toFixed(1),
  delay:    +(Math.random() * 6).toFixed(1),
}));

function FloatingNotes() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {NOTE_DATA.map((n, i) => (
        <motion.div key={i}
          className="absolute text-2xl select-none"
          style={{ left: `${n.left}%`, top: `${n.top}%`, opacity: n.opacity, color: n.color }}
          animate={{ y: [0, -n.yRange, 0], x: [0, n.xRange, 0], rotate: [0, n.rot, 0], scale: [1, n.scale, 1] }}
          transition={{ duration: n.duration, repeat: Infinity, delay: n.delay, ease: 'easeInOut' }}
        >
          {n.symbol}
        </motion.div>
      ))}
      {/* Pulsing gradient orbs */}
      {[0, 1, 2].map(i => (
        <motion.div key={`orb-${i}`}
          className="absolute rounded-full blur-3xl"
          style={{
            width: 300 + i * 100, height: 300 + i * 100,
            left: `${20 + i * 30}%`, top: `${10 + i * 25}%`,
            background: i === 0 ? 'rgba(29,185,84,0.05)' : i === 1 ? 'rgba(255,45,120,0.04)' : 'rgba(168,85,247,0.04)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}


// ─── Vinyl Record ─────────────────────────────────────────────────────────────
function VinylRecord({ artwork, spinning }: { artwork: string; spinning: boolean }) {
  return (
    <motion.div
      className="relative w-32 h-32 rounded-full mx-auto shadow-2xl"
      animate={{ rotate: spinning ? 360 : 0 }}
      transition={{ duration: 3, repeat: spinning ? Infinity : 0, ease: 'linear' }}
      style={{ boxShadow: spinning ? '0 0 40px rgba(29,185,84,0.4)' : '0 4px 20px rgba(0,0,0,0.5)' }}
    >
      {/* Grooves */}
      <div className="absolute inset-0 rounded-full border-4 border-black/70" />
      <div className="absolute inset-3 rounded-full border-2 border-black/50" />
      <div className="absolute inset-6 rounded-full border border-black/40" />
      {/* Artwork center */}
      <div className="absolute inset-8 rounded-full overflow-hidden border-2 border-black/30">
        {artwork
          ? <img src={artwork} className="w-full h-full object-cover" alt="" />
          : <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xl">🎵</div>
        }
      </div>
    </motion.div>
  );
}

// ─── Equalizer Bars ───────────────────────────────────────────────────────────
// Heights are pre-computed per bar so Math.random() never runs during render
const EQ_HEIGHTS = [14, 20, 12, 18, 10].map(h => `${h}px`);
function Equalizer({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {EQ_HEIGHTS.map((h, i) => (
        <motion.div key={i}
          className="w-[3px] rounded-full"
          style={{ background: '#1DB954' }}
          animate={active ? { height: ['4px', h, '4px'] } : { height: '4px' }}
          transition={{ duration: 0.4 + i * 0.1, repeat: active ? Infinity : 0, ease: 'easeInOut', delay: i * 0.08 }}
        />
      ))}
    </div>
  );
}

// ─── Session/Token hook ──────────────────────────────────────────────────────
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
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, x: 2 }}
      className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 ${playing
        ? 'bg-[#1DB954]/10 border border-[#1DB954]/30'
        : 'hover:bg-white/5 border border-transparent hover:border-white/10'
      }`}
      onClick={() => track.preview_url && onPlay()}
    >
      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
        {track.image ? <img src={track.image} alt={track.album} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xl">🎵</div>}
        <div className={`absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {playing ? <Equalizer active /> : <Play className="w-4 h-4 text-white" />}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold truncate ${playing ? 'text-[#1DB954]' : ''}`} style={!playing ? { color: 'var(--text-primary)' } : {}}>{track.name}</div>
        <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{track.artists}</div>
        <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{track.album}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{fmt(track.duration_ms)}</span>
        <motion.button onClick={e => { e.stopPropagation(); onFavorite(); }} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
          className={`transition-colors ${isFav ? 'text-[#ff2d78]' : 'text-gray-500 hover:text-[#ff2d78]'}`}>
          <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
        </motion.button>
        {track.external_url && (
          <a href={track.external_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            className="text-gray-500 hover:text-[#1DB954] transition-colors"><ExternalLink className="w-4 h-4" /></a>
        )}
      </div>
      {!track.preview_url && <span className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded shrink-0">No preview</span>}
    </motion.div>
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

  useEffect(() => {
    if (!audioRef.current || !track?.preview_url) return;
    audioRef.current.src = track.preview_url;
    audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    setProgress(0);
  }, [track]);

  // Sync to room every 5s when host
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
    <AnimatePresence>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{ background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(29,185,84,0.2)' }}>
        <div className="h-0.5 bg-white/10"><motion.div className="h-full" style={{ background: '#1DB954', width: `${progress}%` }} /></div>
        <div className="flex items-center gap-3 px-4 py-3 max-w-5xl mx-auto">
          <VinylRecord artwork={track.image} spinning={playing} />
          {/* Track info */}
          <div className="flex-1 min-w-0 ml-2">
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
            <motion.button onClick={toggle} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
              style={{ background: '#1DB954', boxShadow: playing ? '0 0 20px rgba(29,185,84,0.5)' : 'none' }}>
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </motion.button>
          </div>
        </div>
        <audio ref={audioRef}
          onTimeUpdate={() => { const a = audioRef.current; if (a?.duration) setProgress((a.currentTime / a.duration) * 100); }}
          onEnded={() => { setPlaying(false); setProgress(0); }} />
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Sync Room Modal ──────────────────────────────────────────────────────────
function SyncRoomModal({ session, nowPlaying, onClose, onGuestSync }: {
  session: string; nowPlaying: Track | null;
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
    const r = await fetch('/api/spotify/room/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session }),
    });
    const d = await r.json();
    if (d.roomCode) { setRoomCode(d.roomCode); setMode('host'); }
    setLoading(false);
  }

  async function joinRoom() {
    if (joinCode.length < 4) return;
    setLoading(true);
    const r = await fetch(`/api/spotify/room/${joinCode.toUpperCase()}/join`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session }),
    });
    const d = await r.json();
    if (d.error) { setStatus('Room not found. Check the code!'); setLoading(false); return; }
    setMembers(d.members);
    if (d.track) onGuestSync(d.track, d.isPlaying, d.currentTime);
    setRoomCode(joinCode.toUpperCase());
    setMode('join');
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
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session, track: nowPlaying, isPlaying: true, currentTime: 0 }),
      });
    }, 5000);
    return () => clearInterval(id);
  }, [mode, roomCode, nowPlaying, session]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-sm rounded-3xl p-6 relative"
        style={{ background: '#0f0f1a', border: '1px solid rgba(29,185,84,0.3)', boxShadow: '0 0 60px rgba(29,185,84,0.15)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(29,185,84,0.15)', border: '1px solid rgba(29,185,84,0.3)' }}>
            <Radio className="w-5 h-5 text-[#1DB954]" />
          </div>
          <div>
            <h3 className="text-white font-bold">Long Distance Listening</h3>
            <p className="text-xs text-gray-500">Listen together, anywhere in the world 🌍</p>
          </div>
        </div>

        {/* Pick mode */}
        {mode === 'pick' && (
          <div className="space-y-3">
            <motion.button onClick={createRoom} disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-3 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#1DB954,#17a348)', boxShadow: '0 0 30px rgba(29,185,84,0.3)' }}>
              <Users className="w-5 h-5" />
              {loading ? 'Creating…' : 'Create a Room (Host)'}
            </motion.button>
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
              <motion.button onClick={joinRoom} disabled={loading || joinCode.length < 4}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-4 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-40"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                {loading ? '…' : 'Join'}
              </motion.button>
            </div>
            {status && <p className="text-red-400 text-xs text-center">{status}</p>}
          </div>
        )}

        {/* Host: show room code */}
        {mode === 'host' && (
          <div className="text-center space-y-4">
            <p className="text-gray-400 text-sm">Share this code with your partner</p>
            <div className="flex items-center justify-center gap-3">
              <div className="text-4xl font-black font-mono tracking-[0.2em] text-[#1DB954]">{roomCode}</div>
              <motion.button onClick={copyCode} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg" style={{ background: 'rgba(29,185,84,0.15)', border: '1px solid rgba(29,185,84,0.3)' }}>
                {copied ? <Check className="w-4 h-4 text-[#1DB954]" /> : <Copy className="w-4 h-4 text-[#1DB954]" />}
              </motion.button>
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

        {/* Guest: show synced state */}
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
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MusicHub() {
  const { token, logout } = useSpotifyToken();
  // helper: fetch with Spotify Bearer auth
  const spotifyFetch = (url: string, opts: RequestInit = {}) =>
    fetch(url, { ...opts, headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` } });
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

  // Load profile + top tracks when token is available
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
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const syncToRoom = useCallback(async (track: Track, isPlaying: boolean, currentTime: number) => {
    if (!activeRoom || !session) return;
    await fetch(`/api/spotify/room/${activeRoom}/sync`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session, track, isPlaying, currentTime }),
    });
  }, [activeRoom, session]);

  function onGuestSync(track: Track, _isPlaying: boolean, _time: number) {
    setNowPlaying(track);
  }

  const displayTracks = activeTab === 'search' ? results
    : activeTab === 'top' ? topTracks
    : [...results, ...topTracks].filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i && favorites.includes(t.id));

  // Use token as the "session" indicator for UI
  const session = token; // alias — UI checks this for auth state

  return (
    <div className="min-h-screen relative pb-28" style={{ background: 'var(--bg-primary)' }}>
      <FloatingNotes />

      {/* ── Header ── */}
      <div className="sticky top-0 z-40" style={{ background: 'rgba(10,10,20,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(29,185,84,0.15)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#1DB954', boxShadow: '0 0 20px rgba(29,185,84,0.4)' }}>
              <Music2 className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">Music Hub</h1>
              <p className="text-[10px] text-gray-500 mt-0.5">Powered by Spotify</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session && (
              <motion.button onClick={() => setShowRoomModal(true)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: activeRoom ? 'rgba(29,185,84,0.2)' : 'rgba(255,255,255,0.06)', color: activeRoom ? '#1DB954' : '#aaa', border: `1px solid ${activeRoom ? 'rgba(29,185,84,0.4)' : 'rgba(255,255,255,0.1)'}` }}>
                <Radio className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{activeRoom ? `Room · ${activeRoom}` : 'Sync Room'}</span>
              </motion.button>
            )}

            {/* Auth button: key on session so it remounts when session changes */}
            {session ? (
              <div className="flex items-center gap-2">
                {loadingUser && (
                  <div className="flex gap-1 items-center px-3 py-2">
                    {[0,1,2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#1DB954]"
                        animate={{ opacity: [0.3,1,0.3] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i*0.2 }} />
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
              <motion.a href="/auth/spotify/login" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: '#1DB954', boxShadow: '0 0 20px rgba(29,185,84,0.4)' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.214c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.856zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.97-.519.781.781 0 01.52-.971c3.632-1.102 8.147-.568 11.23 1.328a.78.78 0 01.257 1.071zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 11-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.935.935 0 01-.954 1.608z"/>
                </svg>
                Connect Spotify
              </motion.a>
            )}

          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">

        {/* ── Not logged in ── */}
        {!session && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center"
              style={{ background: '#1DB954', boxShadow: '0 0 60px rgba(29,185,84,0.4)' }}>
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.214c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.856zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.97-.519.781.781 0 01.52-.971c3.632-1.102 8.147-.568 11.23 1.328a.78.78 0 01.257 1.071zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 11-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.935.935 0 01-.954 1.608z"/>
              </svg>
            </motion.div>
            <h2 className="text-3xl font-black mb-3 text-white">Music Hub</h2>
            <p className="text-gray-400 mb-2 max-w-md mx-auto">Search songs, listen to previews, and <span className="text-[#1DB954] font-semibold">listen together</span> with your partner — no matter how far apart.</p>
            <p className="text-gray-600 text-sm mb-8">🌍 Long-distance listening · ❤️ Favorites · 🎵 30s previews</p>
            <motion.a href="/auth/spotify/login" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-black text-lg"
              style={{ background: '#1DB954', boxShadow: '0 0 50px rgba(29,185,84,0.5)' }}>
              <LogIn className="w-5 h-5" /> Login with Spotify
            </motion.a>
          </motion.div>
        )}

        {/* ── Dashboard ── */}
        {session && (
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
              <motion.button onClick={search} disabled={searching || !query.trim()}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="px-5 py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-40"
                style={{ background: '#1DB954', boxShadow: '0 0 20px rgba(29,185,84,0.3)' }}>
                {searching ? '…' : 'Search'}
              </motion.button>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <div className="text-5xl mb-4">{activeTab === 'favorites' ? '💔' : activeTab === 'top' ? '🎵' : '🔍'}</div>
                <p className="text-gray-600 text-sm">
                  {activeTab === 'favorites' ? 'Heart a track to save it here.'
                   : activeTab === 'top' ? 'Listen to more music on Spotify to see your top tracks.'
                   : 'Search for a song to get started.'}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-1">
                <AnimatePresence>
                  {displayTracks.map(t => (
                    <TrackCard key={t.id} track={t} playing={nowPlaying?.id === t.id}
                      onPlay={() => setNowPlaying(t)}
                      onFavorite={() => setFavorites(f => f.includes(t.id) ? f.filter(x => x !== t.id) : [...f, t.id])}
                      isFav={favorites.includes(t.id)} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Now Playing ── */}
      <NowPlayingBar track={nowPlaying} roomCode={activeRoom} isHost={isHost} onSyncToRoom={syncToRoom} />

      {/* ── Sync Room Modal ── */}
      <AnimatePresence>
        {showRoomModal && session && (
          <SyncRoomModal session={session} nowPlaying={nowPlaying}
            onClose={() => setShowRoomModal(false)}
            onGuestSync={(track, isPlaying, time) => {
              setNowPlaying(track);
              setActiveRoom(joinCode => joinCode);
              setIsHost(false);
            }} />
        )}
      </AnimatePresence>
    </div>
  );
}
