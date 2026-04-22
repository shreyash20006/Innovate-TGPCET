import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music2, Search, Play, Pause, ExternalLink,
  Heart, LogIn, LogOut, User, ChevronRight, Clock
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
  country: string;
  product: string;
}

interface Track {
  id: string;
  name: string;
  artists: string;
  album: string;
  image: string;
  preview_url: string | null;
  duration_ms: number;
  external_url: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtMs(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

function useSpotifySession() {
  const [session, setSession] = useState<string | null>(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem('spotify_session') : null
  );

  // Watch for sessionStorage updates (set by SpotifyCallback page)
  useEffect(() => {
    function onFocus() {
      const s = sessionStorage.getItem('spotify_session');
      if (s && s !== session) setSession(s);
    }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [session]);

  function logout() {
    sessionStorage.removeItem('spotify_session');
    setSession(null);
  }

  return { session, logout };
}

// ─── Track Card ───────────────────────────────────────────────────────────────
function TrackCard({
  track, playing, onPlay, onFavorite, isFav
}: {
  track: Track;
  playing: boolean;
  onPlay: () => void;
  onFavorite: () => void;
  isFav: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200
        ${playing
          ? 'bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/30'
          : 'hover:bg-white/5 border border-transparent'
        }`}
      onClick={track.preview_url ? onPlay : undefined}
    >
      {/* Artwork */}
      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
        {track.image
          ? <img src={track.image} alt={track.album} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-[var(--bg-card)] flex items-center justify-center text-xl">🎵</div>
        }
        {/* Play overlay */}
        <AnimatePresence>
          {(playing || track.preview_url) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: playing ? 1 : 0 }}
              className={`absolute inset-0 flex items-center justify-center bg-black/60 ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
            >
              {playing
                ? <div className="flex gap-0.5 items-end h-4">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1 bg-[var(--accent-red)] rounded"
                        animate={{ height: ['4px', '16px', '4px'] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                : <Play className="w-4 h-4 text-white" />
              }
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold truncate ${playing ? 'text-[var(--accent-red)]' : 'text-[var(--text-primary)]'}`}>
          {track.name}
        </div>
        <div className="text-xs text-[var(--text-secondary)] truncate">{track.artists}</div>
        <div className="text-xs text-[var(--text-muted)] truncate">{track.album}</div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-[var(--text-muted)] font-mono">{fmtMs(track.duration_ms)}</span>
        <motion.button
          onClick={e => { e.stopPropagation(); onFavorite(); }}
          whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
          className={`transition-colors ${isFav ? 'text-[var(--accent-red)]' : 'text-[var(--text-muted)] hover:text-[var(--accent-red)]'}`}
        >
          <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
        </motion.button>
        {track.external_url && (
          <a href={track.external_url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors">
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {!track.preview_url && (
        <span className="text-[10px] text-[var(--text-muted)] bg-white/5 px-1.5 py-0.5 rounded shrink-0">
          No preview
        </span>
      )}
    </motion.div>
  );
}

// ─── Mini Audio Player ─────────────────────────────────────────────────────────
function NowPlaying({ track, onClose }: { track: Track | null; onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!audioRef.current || !track?.preview_url) return;
    audioRef.current.src = track.preview_url;
    audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    setProgress(0);
  }, [track]);

  function toggle() {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  }

  if (!track) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-color)]"
        style={{ background: 'var(--bg-secondary)', backdropFilter: 'blur(20px)' }}
      >
        {/* Progress bar */}
        <div className="h-0.5 bg-white/10">
          <motion.div className="h-full bg-[var(--accent-red)]" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center gap-3 px-4 py-3 max-w-5xl mx-auto">
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
            {track.image
              ? <img src={track.image} className="w-full h-full object-cover" alt="" />
              : <div className="w-full h-full bg-[var(--bg-card)] flex items-center justify-center">🎵</div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{track.name}</div>
            <div className="text-xs text-[var(--text-muted)] truncate">{track.artists}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-mono hidden sm:block">Preview · 30s</span>
            <motion.button
              onClick={toggle}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white"
              style={{ background: 'var(--accent-red)' }}
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </motion.button>
            <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg leading-none">×</button>
          </div>
        </div>

        <audio
          ref={audioRef}
          onTimeUpdate={() => {
            const a = audioRef.current;
            if (a && a.duration) setProgress((a.currentTime / a.duration) * 100);
          }}
          onEnded={() => { setPlaying(false); setProgress(0); }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function MusicHub() {
  const { session, logout } = useSpotifySession();
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('spotify_favs') || '[]'); } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState<'search' | 'top' | 'favorites'>('search');
  const [error, setError] = useState<string | null>(null);

  // Check for error in URL query string (Spotify redirects with ?error=... to /callback,
  // but SpotifyCallback page navigates here with no params on error — no-op needed)
  useEffect(() => { /* errors handled in SpotifyCallback page */ }, []);

  // Reload session from sessionStorage when the component mounts
  // (SpotifyCallback may have set it just before navigating here)
  useEffect(() => {
    const s = sessionStorage.getItem('spotify_session');
    if (s && !session) {
      // trigger re-render — handled by useSpotifySession's initial useState
    }
  }, []);

  // Load user profile on session acquire
  useEffect(() => {
    if (!session) { setUser(null); return; }
    setLoadingUser(true);
    fetch(`/api/spotify/me?session=${session}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && !data.error) setUser(data); })
      .finally(() => setLoadingUser(false));

    fetch(`/api/spotify/top-tracks?session=${session}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setTopTracks(Array.isArray(data) ? data : []));
  }, [session]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('spotify_favs', JSON.stringify(favorites));
  }, [favorites]);

  async function search() {
    if (!query.trim() || !session) return;
    setSearching(true);
    setActiveTab('search');
    try {
      const r = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&session=${session}`);
      const data = await r.json();
      setResults(Array.isArray(data) ? data : []);
    } catch { setResults([]); }
    finally { setSearching(false); }
  }

  function toggleFav(id: string) {
    setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  }

  const displayTracks = activeTab === 'search'
    ? results
    : activeTab === 'top'
    ? topTracks
    : [...results, ...topTracks].filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i && favorites.includes(t.id));

  const loginUrl = '/auth/spotify/login'; // hits backend → redirects to Spotify → returns to /callback

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-red)' }}>
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Music Hub</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Powered by Spotify</p>
            </div>
          </div>

          {session && user ? (
            <div className="flex items-center gap-3">
              {user.images?.[0]?.url
                ? <img src={user.images[0].url} alt={user.display_name} className="w-8 h-8 rounded-full object-cover" />
                : <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-red)' }}>
                    <User className="w-4 h-4 text-white" />
                  </div>
              }
              <div className="hidden sm:block">
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.display_name}</div>
                {user.product === 'premium' && (
                  <div className="text-[10px] text-emerald-400">Premium ✓</div>
                )}
              </div>
              <button onClick={logout} className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }} title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <motion.a
              href={loginUrl}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: '#1DB954' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.214c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.856zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.97-.519.781.781 0 01.52-.971c3.632-1.102 8.147-.568 11.23 1.328a.78.78 0 01.257 1.071zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 11-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.935.935 0 01-.954 1.608z" />
              </svg>
              Connect Spotify
            </motion.a>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 border border-red-500/30 flex items-center justify-between"
              style={{ background: 'rgba(239,68,68,0.08)' }}>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-lg leading-none ml-4">×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Not logged in state */}
        {!session && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: '#1DB954' }}>
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.214c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.856zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.97-.519.781.781 0 01.52-.971c3.632-1.102 8.147-.568 11.23 1.328a.78.78 0 01.257 1.071zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 11-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.935.935 0 01-.954 1.608z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Connect Your Spotify
            </h2>
            <p className="mb-8 max-w-md mx-auto text-sm" style={{ color: 'var(--text-muted)' }}>
              Login with Spotify to search songs, preview tracks, and build your favorites list.
            </p>
            <motion.a
              href={loginUrl}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-2xl"
              style={{ background: '#1DB954', boxShadow: '0 0 40px rgba(29,185,84,0.3)' }}
            >
              <LogIn className="w-5 h-5" />
              Login with Spotify
            </motion.a>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              {['Search any song', 'Preview 30s clips', 'Save favorites', 'See your top tracks'].map(f => (
                <div key={f} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#1DB954' }} />
                  {f}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Logged in — Dashboard */}
        {session && (
          <>
            {/* Search bar */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && search()}
                  placeholder="Search songs, artists, albums..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none"
                  style={{
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                  }}
                />
              </div>
              <motion.button
                onClick={search}
                disabled={searching || !query.trim()}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="px-5 py-3 rounded-2xl font-semibold text-sm text-white disabled:opacity-40"
                style={{ background: 'var(--accent-red)' }}
              >
                {searching ? 'Searching...' : 'Search'}
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-card)' }}>
              {[
                { id: 'search', label: 'Results', icon: Search },
                { id: 'top', label: 'Your Top', icon: Clock },
                { id: 'favorites', label: `Favorites (${favorites.length})`, icon: Heart },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id ? 'text-white' : 'hover:text-[var(--text-primary)]'
                  }`}
                  style={activeTab === tab.id ? { background: 'var(--accent-red)', color: 'white' } : { color: 'var(--text-muted)' }}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Track list */}
            {displayTracks.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">
                  {activeTab === 'favorites' ? '💔' : activeTab === 'top' ? '🎵' : '🔍'}
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {activeTab === 'favorites' ? 'No favorites yet. Heart a track to save it.'
                   : activeTab === 'top' ? 'Play more music on Spotify to see your top tracks.'
                   : 'Search for your favourite songs above.'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <AnimatePresence>
                  {displayTracks.map(track => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      playing={nowPlaying?.id === track.id}
                      onPlay={() => setNowPlaying(track.preview_url ? track : null)}
                      onFavorite={() => toggleFav(track.id)}
                      isFav={favorites.includes(track.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* Now Playing mini player */}
      <NowPlaying track={nowPlaying} onClose={() => setNowPlaying(null)} />
    </div>
  );
}
