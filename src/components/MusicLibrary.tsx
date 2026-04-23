import React, { useState } from 'react';
import {
  Music2, Search, Heart, LogIn, LogOut, User, Radio, X, AlertTriangle, Youtube, TrendingUp, Play
} from 'lucide-react';
import { Track } from '../types/music';

// ─── Equalizer Bars ────────────────────────────────────────────────────
const EQ_ANIMS = ['mh-eq1', 'mh-eq2', 'mh-eq3', 'mh-eq4', 'mh-eq5'];
const EQ_DELAYS = ['0s', '0.1s', '0.2s', '0.15s', '0.05s'];
export function Equalizer({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {EQ_ANIMS.map((anim, i) => (
        <div key={i}
          style={{ width: 3, height: 4, borderRadius: 2, background: '#1DB954', animation: active ? `${anim} 0.5s ease-in-out ${EQ_DELAYS[i]} infinite` : 'none' }} />
      ))}
    </div>
  );
}

const fmt = (ms: number) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`; };
const fmtViews = (v: string) => { const n = parseInt(v, 10); if (isNaN(n)) return v; if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'; if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'; if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'; return n.toString(); };

const TrackCard: React.FC<{
  track: Track; playing: boolean; onPlay: () => void; onFavorite: () => void; isFav: boolean; layout?: 'grid' | 'list';
}> = ({ track, playing, onPlay, onFavorite, isFav, layout = 'list' }) => {
  const duration = track.duration_ms ? fmt(track.duration_ms) : '';
  const views    = track.viewCount   ? fmtViews(track.viewCount) : '';

  if (layout === 'grid') {
    return (
      <div className={`glass-panel rim-light p-4 rounded-xl group cursor-pointer transition-all duration-300 ${playing ? 'border-l-4 border-l-[#00FF85] bg-white/5' : 'hover:border-[#00FF85]/30'}`} onClick={onPlay} style={{ animation: 'mh-fadeup 0.3s ease-out both' }}>
        <div className="relative aspect-square overflow-hidden rounded-lg mb-4 bg-[#1a1a2e]">
          {track.image ? <img src={track.image} alt={track.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🎵</div>}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {playing ? <Equalizer active /> : <Play className="w-12 h-12 text-white drop-shadow-md" fill="currentColor" />}
          </div>
          {playing && <div className="absolute top-2 left-2 bg-[#00FF85] text-zinc-950 px-2 py-1 rounded text-[10px] font-bold shadow-[0_0_10px_rgba(0,255,133,0.5)]">PLAYING</div>}
          {duration && <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-[10px] font-bold">{duration}</div>}
        </div>
        
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold truncate text-base ${playing ? 'text-[#00FF85]' : 'text-white'}`}>{track.name}</h3>
            <p className="text-zinc-500 text-xs uppercase tracking-wider truncate mt-1">{track.artists} {views && `• ${views}`}</p>
          </div>
          <button onClick={e => { e.stopPropagation(); onFavorite(); }} className="transition-all hover:scale-110 active:scale-90 p-1" style={{ color: isFav ? '#ff2d78' : 'rgba(255,255,255,0.25)' }} title={isFav ? 'Remove from favorites' : 'Add to favorites'}>
            <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rim-light p-3 rounded-lg flex items-center justify-between hover:bg-white/5 group transition-colors cursor-pointer" onClick={onPlay} style={{ background: playing ? 'rgba(29,185,84,0.08)' : 'transparent', borderLeft: playing ? '3px solid #00FF85' : '3px solid transparent', animation: 'mh-fadeup 0.3s ease-out both' }}>
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 rounded overflow-hidden shadow-lg shrink-0">
          {track.image ? <img className="w-full h-full object-cover" src={track.image} alt={track.name} /> : <div className="w-full h-full bg-[#1a1a2e] flex items-center justify-center">🎵</div>}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {playing ? <Equalizer active /> : <Play className="w-5 h-5 text-white" fill="currentColor" />}
          </div>
        </div>
        <div className="min-w-0">
          <p className={`font-semibold truncate ${playing ? 'text-[#00FF85]' : 'text-white'}`}>{track.name}</p>
          <p className="text-zinc-500 text-sm truncate">{track.artists}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 md:gap-8 shrink-0 pl-2">
        {views && <span className="text-zinc-500 text-sm hidden md:block">{views}</span>}
        <span className="text-zinc-500 text-sm w-10 text-right">{duration}</span>
        <button onClick={e => { e.stopPropagation(); onFavorite(); }} className="transition-all hover:scale-110 active:scale-90 p-1" style={{ color: isFav ? '#ff2d78' : 'rgba(255,255,255,0.25)' }} title={isFav ? 'Remove from favorites' : 'Add to favorites'}>
          <Heart className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}

export interface MusicLibraryProps {
  state: {
    token: string | null;
    user: { display_name: string; images?: { url: string }[]; product?: string } | null;
    query: string;
    searching: boolean;
    displayTracks: Track[];
    results: Track[];
    activeTab: 'search' | 'top' | 'favorites';
    loadingUser: boolean;
    ytError: string;
    activeRoom: string | null;
    nowPlaying: Track | null;
    favorites: string[];
    isApiKeyConfigured: boolean;
  };
  actions: {
    setQuery: (q: string) => void;
    search: () => void;
    setActiveTab: (tab: 'search' | 'top' | 'favorites') => void;
    loadTrending: () => void;
    setYtError: (e: string) => void;
    setShowRoomModal: (s: boolean) => void;
    logout: () => void;
    setNowPlaying: (t: Track) => void;
    setShowNowPlaying: (s: boolean) => void;
    setFavorites: (favs: string[]) => void;
  };
  /** When true, the internal sidebar is hidden (MusicHub renders its own unified sidebar) */
  hideInternalSidebar?: boolean;
}

export default function MusicLibrary({ state, actions, hideInternalSidebar }: MusicLibraryProps) {
  const toggleFavorite = (track: Track) => {
    actions.setFavorites(state.favorites.includes(track.id) ? state.favorites.filter(id => id !== track.id) : [...state.favorites, track.id]);
  };

  return (
    <>
      {/* Sidebar for Desktop — hidden when parent provides its own */}
      {!hideInternalSidebar && (
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 pt-6 pb-24 z-30 min-h-full shrink-0 relative bg-[#0a0a0a]/90 backdrop-blur-2xl shadow-2xl overflow-y-auto">
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 px-2">Library</p>
          <div className="space-y-1">
            <button onClick={() => { actions.setActiveTab('top'); actions.loadTrending(); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${state.activeTab === 'top' ? 'bg-[#00FF85]/10 text-[#00FF85] shadow-[0_0_15px_rgba(0,255,133,0.1)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
              <TrendingUp className="w-5 h-5" /> <span className="font-semibold text-sm">Explore</span>
            </button>
            <button onClick={() => actions.setActiveTab('search')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${state.activeTab === 'search' ? 'bg-[#00FF85]/10 text-[#00FF85] shadow-[0_0_15px_rgba(0,255,133,0.1)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
              <Search className="w-5 h-5" /> <span className="font-semibold text-sm">Search</span>
            </button>
            <button onClick={() => actions.setActiveTab('favorites')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${state.activeTab === 'favorites' ? 'bg-[#00FF85]/10 text-[#00FF85] shadow-[0_0_15px_rgba(0,255,133,0.1)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
              <Heart className="w-5 h-5" /> <span className="font-semibold text-sm">Liked Songs</span>
            </button>
          </div>
        </div>
      </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 relative z-10 flex flex-col pt-4 md:pt-8 pb-32">
        {/* Header */}
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white">
              <Music2 className="w-6 h-6 text-[#00FF85]" />
            </button>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {state.activeTab === 'search' ? 'Search' : state.activeTab === 'top' ? 'Explore' : 'Liked Songs'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {state.token && (
              <button onClick={() => actions.setShowRoomModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                style={{ background: state.activeRoom ? 'rgba(0,255,133,0.2)' : 'rgba(255,255,255,0.06)', color: state.activeRoom ? '#00FF85' : '#aaa', border: `1px solid ${state.activeRoom ? 'rgba(0,255,133,0.4)' : 'rgba(255,255,255,0.1)'}` }}>
                <Radio className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{state.activeRoom ? `Room · ${state.activeRoom}` : 'Sync Room'}</span>
              </button>
            )}

            {state.token ? (
              <div className="flex items-center gap-2">
                {state.loadingUser ? (
                  <div className="flex gap-1 items-center px-3 py-2">
                    {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#00FF85] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                  </div>
                ) : state.user ? (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel">
                    {state.user.images?.[0]?.url ? <img src={state.user.images[0].url} className="w-6 h-6 rounded-full" alt="" /> : <User className="w-4 h-4 text-zinc-400" />}
                    <span className="text-xs text-white font-medium">{state.user.display_name}</span>
                    {state.user.product === 'premium' && <span className="text-[9px] text-[#00FF85] font-bold">PRO</span>}
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel">
                    <User className="w-4 h-4 text-[#00FF85]" />
                    <span className="text-xs text-[#00FF85] font-medium">Connected ✓</span>
                  </div>
                )}
                <button onClick={actions.logout} className="p-2 rounded-lg text-zinc-500 hover:text-white transition-colors" title="Disconnect">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <a href="/auth/spotify/login" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-zinc-950 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,255,133,0.4)]" style={{ background: '#00FF85' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.214c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.856zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.97-.519.781.781 0 01.52-.971c3.632-1.102 8.147-.568 11.23 1.328a.78.78 0 01.257 1.071zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 11-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.935.935 0 01-.954 1.608z"/>
                </svg>
                Connect Spotify
              </a>
            )}
          </div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-2">
          {!state.isApiKeyConfigured && (
            <div className="flex items-start gap-3 p-4 rounded-2xl mb-5" style={{ background: 'rgba(255,160,0,0.08)', border: '1px solid rgba(255,160,0,0.3)' }}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#FFA000' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#FFA000' }}>YouTube API Key Missing</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,160,0,0.8)' }}>
                  Add <code className="bg-black/30 px-1 rounded">VITE_YOUTUBE_API_KEY</code> to your <code className="bg-black/30 px-1 rounded">.env</code> file or Vercel env vars.
                </p>
              </div>
            </div>
          )}

          {state.ytError && (
            <div className="flex items-start gap-3 p-4 rounded-2xl mb-5" style={{ background: 'rgba(255,45,120,0.07)', border: '1px solid rgba(255,45,120,0.25)' }}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#ff2d78' }} />
              <div className="flex-1"><p className="text-sm" style={{ color: '#ff2d78' }}>{state.ytError}</p></div>
              <button onClick={() => actions.setYtError('')} className="text-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>
          )}

          {!state.token ? (
            <div style={{ animation: 'mh-fadeup 0.5s ease-out' }}>
              <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input value={state.query} onChange={e => actions.setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && actions.search()} placeholder="Search any song or artist…" className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm text-white outline-none placeholder-gray-600 glass-panel" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <button onClick={actions.search} disabled={state.searching || !state.query.trim()} className="px-5 py-3 rounded-2xl font-bold text-sm text-zinc-950 disabled:opacity-40 transition-all hover:scale-105 active:scale-95 neon-glow" style={{ background: '#00FF85' }}>
                  {state.searching ? '…' : 'Search'}
                </button>
              </div>

              {state.results.length > 0 && (
                <div className="space-y-2 mb-8" style={{ animation: 'mh-fadeup 0.4s ease-out' }}>
                  {state.results.map(t => (
                    <TrackCard key={t.id} track={t} playing={state.nowPlaying?.id === t.id} isFav={state.favorites.includes(t.id)} layout="grid"
                      onPlay={() => { actions.setNowPlaying(t); actions.setShowNowPlaying(true); }}
                      onFavorite={() => toggleFavorite(t)} />
                  ))}
                </div>
              )}

              {state.results.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center neon-glow" style={{ background: '#00FF85' }}>
                    <svg className="w-10 h-10 text-zinc-950" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.214c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.856zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.97-.519.781.781 0 01.52-.971c3.632-1.102 8.147-.568 11.23 1.328a.78.78 0 01.257 1.071zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 11-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.935.935 0 01-.954 1.608z"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black mb-2 text-white">NovaStream</h2>
                  <p className="text-gray-400 mb-1 max-w-md mx-auto">Premium Audio · <span className="text-[#00FF85] font-semibold">listen together</span> with your partner</p>
                  <p className="text-gray-600 text-sm mb-6">🌍 Long-distance · ❤️ Favorites · 🎵 YouTube API</p>
                  <a href="/auth/spotify/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[#00FF85] font-bold text-sm transition-all hover:scale-105 active:scale-95 glass-panel" style={{ border: '1px solid rgba(0,255,133,0.3)' }}>
                    <LogIn className="w-4 h-4" /> Connect Spotify for Sync Rooms
                  </a>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input value={state.query} onChange={e => actions.setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && actions.search()} placeholder="Search any song on YouTube…" className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm text-white outline-none placeholder-gray-600" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <button onClick={actions.search} disabled={state.searching || !state.query.trim()} className="px-5 py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-40 transition-all hover:scale-105 active:scale-95" style={{ background: '#FF0000', boxShadow: '0 0 20px rgba(255,0,0,0.3)' }}>
                  {state.searching ? '…' : <Youtube className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex md:hidden gap-1 mb-5 p-1 rounded-2xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {([
                  { id: 'search', label: 'Search', icon: Search },
                  { id: 'top', label: 'Explore', icon: TrendingUp },
                  { id: 'favorites', label: `Liked`, icon: Heart },
                ] as const).map(tab => (
                  <button key={tab.id} onClick={() => { actions.setActiveTab(tab.id); if (tab.id === 'top') actions.loadTrending(); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all" style={state.activeTab === tab.id ? { background: '#00FF85', color: '#0a0a0a', boxShadow: '0 0 15px rgba(0,255,133,0.3)' } : { color: '#666' }}>
                    <tab.icon className="w-3.5 h-3.5" />{tab.label}
                  </button>
                ))}
              </div>

              {state.searching && state.displayTracks.length === 0 && (
                <div className="flex flex-col items-center py-16">
                  <div className="flex gap-2 mb-4">
                    {[0,1,2,3].map(i => <div key={i} className="w-1.5 h-8 rounded-full animate-pulse" style={{ background: '#00FF85', animationDelay: `${i*0.15}s`, animationDuration: '0.8s' }} />)}
                  </div>
                  <p className="text-gray-600 text-sm">Searching YouTube…</p>
                </div>
              )}
              
              {!state.searching && state.displayTracks.length === 0 && (
                <div className="text-center py-16" style={{ animation: 'mh-fadeup 0.4s ease-out' }}>
                  <div className="text-5xl mb-4">{state.activeTab === 'favorites' ? '💔' : state.activeTab === 'top' ? '📈' : '🎬'}</div>
                  <p className="text-gray-600 text-sm">
                    {state.activeTab === 'favorites' ? 'Heart a track to save it here.' : state.activeTab === 'top' ? 'Click Trending to load top YouTube music.' : 'Search any song, artist, or album above.'}
                  </p>
                </div>
              )}

              {state.displayTracks.length > 0 && (
                <div className={state.activeTab === 'favorites' ? "space-y-2" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}>
                  {state.displayTracks.map(t => (
                    <TrackCard key={t.id} track={t} playing={state.nowPlaying?.id === t.id} layout={state.activeTab === 'favorites' ? 'list' : 'grid'}
                      onPlay={() => { actions.setNowPlaying(t); actions.setShowNowPlaying(true); }}
                      onFavorite={() => toggleFavorite(t)} isFav={state.favorites.includes(t.id)} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
