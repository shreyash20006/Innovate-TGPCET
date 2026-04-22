import React, { useState } from 'react';
import { Play, Heart, ChevronLeft, BadgeCheck, Music2 } from 'lucide-react';
import { Track } from '../types/music';
import { ArtistInfo } from './DiscoverPage';

// ─── Static top tracks per artist (demo scaffold) ────────────────────────────
const DEMO_TRACKS: Track[] = [
  { id: 'demo1', name: 'Stellar Drift',      artists: '', album: 'Quantum Pulse',  image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200&q=80', duration_ms: 262000, preview_url: null, external_url: '', viewCount: '48291002' },
  { id: 'demo2', name: 'Neon Horizon',       artists: '', album: 'Single',         image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=200&q=80', duration_ms: 225000, preview_url: null, external_url: '', viewCount: '35112984' },
  { id: 'demo3', name: 'Dark Matter Dreams', artists: '', album: 'Void Sessions',  image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80', duration_ms: 308000, preview_url: null, external_url: '', viewCount: '22891402' },
  { id: 'demo4', name: 'Signal Lost',        artists: '', album: 'Void Sessions',  image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=200&q=80', duration_ms: 192000, preview_url: null, external_url: '', viewCount: '19002115' },
  { id: 'demo5', name: 'Phase Collapse',     artists: '', album: 'Interstellar EP',image: 'https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=200&q=80', duration_ms: 244000, preview_url: null, external_url: '', viewCount: '12345678' },
];

const SIMILAR_ARTISTS: ArtistInfo[] = [
  { id: 's1', name: 'Ethera',      genre: 'Ambient Techno',  image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=200&q=80', monthlyListeners: '1.1M' },
  { id: 's2', name: 'V0id Runner', genre: 'Synthwave',       image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', monthlyListeners: '890K' },
  { id: 's3', name: 'Lyra 7',      genre: 'Experimental Pop',image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=80', monthlyListeners: '650K' },
];

const ALBUMS = [
  { title: 'Quantum Pulse',   year: '2024', tracks: 12, image: 'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=200&q=80' },
  { title: 'Void Sessions',   year: '2023', tracks: 9,  image: 'https://images.unsplash.com/photo-1571974599782-87624638275c?w=200&q=80' },
  { title: 'Interstellar EP', year: '2023', tracks: 5,  image: 'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=200&q=80' },
];

const fmt = (ms: number) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`; };
const fmtBig = (v: string) => { const n = parseInt(v, 10); if (isNaN(n)) return v; if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'; if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'; if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'; return n.toString(); };

interface ArtistProfileProps {
  artist:       ArtistInfo;
  nowPlaying:   Track | null;
  onPlayTrack:  (track: Track) => void;
  onViewArtist: (a: ArtistInfo) => void;
  onBack:       () => void;
}

export default function ArtistProfile({ artist, nowPlaying, onPlayTrack, onViewArtist, onBack }: ArtistProfileProps) {
  const [followed, setFollowed] = useState(false);
  const [likedTracks, setLikedTracks]   = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<'top' | 'albums'>('top');

  // Inject artist name into demo tracks
  const tracks = DEMO_TRACKS.map(t => ({ ...t, artists: artist.name }));

  function toggleLike(id: string) {
    setLikedTracks(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  return (
    <div className="ap-root flex-1 min-w-0 relative z-10 pb-36">

      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <section className="relative h-[360px] md:h-[420px] w-full overflow-hidden">
        {/* Back button */}
        <button
          onClick={onBack}
          className="ap-back-btn absolute top-4 left-4 z-30 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:scale-105"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
        >
          <ChevronLeft size={14} /> Back
        </button>

        {/* Banner image */}
        <img
          src={artist.image.replace('w=300', 'w=1200')}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.35) saturate(1.3)', transform: 'scale(1.05)' }}
        />
        {/* Neon atmospheric overlay */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(0,255,133,0.08) 0%, transparent 60%), linear-gradient(to top, #0a0a0a 0%, transparent 55%)' }} />

        {/* Artist info */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 z-20">
          <div className="flex items-end gap-5">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shrink-0 shadow-2xl"
                 style={{ border: '2px solid rgba(0,255,133,0.4)', boxShadow: '0 0 30px rgba(0,255,133,0.2)' }}>
              <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
            </div>

            <div>
              {/* Verified */}
              <div className="flex items-center gap-1.5 mb-1">
                <BadgeCheck size={14} color="#00ff85" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#00ff85' }}>Verified Artist</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">{artist.name}</h1>
              <p className="text-base text-zinc-400 mt-2">
                <span className="text-white font-semibold">{artist.monthlyListeners}</span> monthly listeners
              </p>
              <p className="text-xs uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{artist.genre}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { if (tracks.length) onPlayTrack(tracks[0]); }}
              className="flex items-center gap-2 px-7 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
              style={{ background: '#00ff85', color: '#0a0a0a', boxShadow: '0 0 20px rgba(0,255,133,0.4)' }}
            >
              <Play size={16} fill="black" color="black" />Play
            </button>
            <button
              onClick={() => setFollowed(p => !p)}
              className="px-7 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
              style={{
                background: followed ? 'rgba(0,255,133,0.15)' : 'transparent',
                border: `2px solid ${followed ? '#00ff85' : 'rgba(255,255,255,0.3)'}`,
                color: followed ? '#00ff85' : '#fff',
              }}
            >
              {followed ? '✓ Following' : 'Follow'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Section Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-4 md:px-8 mt-8 mb-6 p-1 rounded-2xl w-fit"
           style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {(['top', 'albums'] as const).map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            style={activeSection === s
              ? { background: '#00ff85', color: '#0a0a0a', boxShadow: '0 0 10px rgba(0,255,133,0.3)' }
              : { color: 'rgba(255,255,255,0.4)' }}>
            {s === 'top' ? 'Top Tracks' : 'Albums'}
          </button>
        ))}
      </div>

      <div className="px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Top Tracks or Albums ─────────────────────────────────────── */}
        <div className="lg:col-span-8">
          {activeSection === 'top' ? (
            <div className="space-y-1">
              {tracks.map((t, idx) => {
                const isActive = nowPlaying?.id === t.id;
                const isLiked  = likedTracks.has(t.id);
                return (
                  <div key={t.id}
                    onClick={() => onPlayTrack(t)}
                    className="group flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer"
                    style={{
                      background: isActive
                        ? 'linear-gradient(90deg, rgba(0,255,133,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                        : 'transparent',
                      borderLeft: isActive ? '3px solid #00ff85' : '3px solid transparent',
                    }}
                  >
                    <span className="text-zinc-600 font-mono text-sm w-5 text-center shrink-0"
                          style={{ color: isActive ? '#00ff85' : undefined }}>{idx + 1}</span>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play size={16} fill="white" color="white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-sm" style={{ color: isActive ? '#00ff85' : '#fff' }}>{t.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{t.album}</p>
                    </div>
                    {t.viewCount && (
                      <span className="hidden md:block text-xs text-zinc-600 tabular-nums">{fmtBig(t.viewCount)}</span>
                    )}
                    <div className="flex items-center gap-3 shrink-0">
                      <button onClick={e => { e.stopPropagation(); toggleLike(t.id); }}
                        className="transition-all hover:scale-110 active:scale-90">
                        <Heart size={15} fill={isLiked ? '#ff24e4' : 'none'} color={isLiked ? '#ff24e4' : 'rgba(255,255,255,0.25)'} />
                      </button>
                      <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.35)' }}>{fmt(t.duration_ms)}</span>
                    </div>
                  </div>
                );
              })}
              <button className="mt-5 text-[11px] font-black uppercase tracking-widest transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.3)' }}>
                See All Tracks →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ALBUMS.map(al => (
                <div key={al.title} className="group cursor-pointer"
                     style={{ animation: 'mh-fadeup 0.3s ease-out both' }}>
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-xl"
                       style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <img src={al.image} alt={al.title}
                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center"
                           style={{ background: '#00ff85', boxShadow: '0 0 15px rgba(0,255,133,0.5)' }}>
                        <Play size={20} fill="black" color="black" style={{ paddingLeft: 2 }} />
                      </div>
                    </div>
                  </div>
                  <p className="font-bold text-white text-sm truncate group-hover:text-[#00ff85] transition-colors">{al.title}</p>
                  <p className="text-xs text-zinc-500">{al.year} · {al.tracks} tracks</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right sidebar ────────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Latest Release */}
          <div className="rounded-2xl p-5 relative overflow-hidden group"
               style={{ background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.05)' }}>
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-20 blur-xl"
                 style={{ background: '#ff24e4' }} />
            <h3 className="font-black text-white text-base mb-4">Latest Release</h3>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0 group/art">
                <img src={ALBUMS[0].image} alt={ALBUMS[0].title}
                     className="w-20 h-20 rounded-xl shadow-xl object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/art:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <Play size={22} fill="white" color="white" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-black text-white text-sm truncate">{ALBUMS[0].title}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Album · {ALBUMS[0].year}</p>
                <p className="text-xs text-zinc-600 line-clamp-2">Latest exploration into deep space frequencies.</p>
              </div>
            </div>
          </div>

          {/* Similar artists */}
          <div className="rounded-2xl p-5"
               style={{ background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.05)' }}>
            <h3 className="font-black text-white text-base mb-4">Fans Also Like</h3>
            <div className="space-y-3">
              {SIMILAR_ARTISTS.map(a => (
                <div key={a.id}
                  onClick={() => onViewArtist(a)}
                  className="flex items-center gap-3 group cursor-pointer p-2 -mx-2 rounded-xl transition-colors hover:bg-white/4"
                >
                  <img src={a.image} alt={a.name}
                       className="w-11 h-11 rounded-full object-cover border-2 border-transparent group-hover:border-[#00ff85] transition-all" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate group-hover:text-[#00ff85] transition-colors">{a.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">{a.genre}</p>
                  </div>
                  <span className="text-[10px] text-zinc-600 shrink-0">{a.monthlyListeners}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats card */}
          <div className="rounded-2xl p-5"
               style={{ background: 'rgba(0,255,133,0.04)', border: '1px solid rgba(0,255,133,0.15)' }}>
            <h3 className="font-black text-[#00ff85] text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <Music2 size={14} /> Artist Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Monthly Listeners', value: artist.monthlyListeners },
                { label: 'Followers',          value: '384K' },
                { label: 'Albums',             value: '3' },
                { label: 'Playlist Adds',      value: '12.4M' },
              ].map(stat => (
                <div key={stat.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-lg font-black text-white">{stat.value}</p>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
