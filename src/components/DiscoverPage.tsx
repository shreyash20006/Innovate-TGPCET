import React, { useRef } from 'react';
import { Play, TrendingUp, ChevronRight, Zap } from 'lucide-react';
import { Track } from '../types/music';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ArtistInfo {
  id: string;
  name: string;
  genre: string;
  image: string;
  monthlyListeners: string;
}

interface DiscoverProps {
  topTracks:    Track[];
  nowPlaying:   Track | null;
  onPlayTrack:  (t: Track) => void;
  onViewArtist: (a: ArtistInfo) => void;
  onLoadTrending: () => void;
  searching: boolean;
}

// ─── Static featured data (no extra API calls) ───────────────────────────────
const FEATURED = {
  title: 'CYBERNETIC RESONANCE',
  artist: 'Nova Centauri',
  tag: 'Featured Release',
  desc: 'The latest atmospheric masterpiece — a journey through deep space frequencies and synthetic melodies.',
  bg: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1400&q=80',
};

const MOODS = [
  { label: 'Deep Focus',  emoji: '🧠', color: '#00ff85' },
  { label: 'Hype Mode',   emoji: '⚡', color: '#ff24e4' },
  { label: 'Lofi Chill',  emoji: '🌙', color: '#a855f7' },
  { label: 'Workout',     emoji: '🔥', color: '#f97316' },
  { label: 'Road Trip',   emoji: '🚀', color: '#0ea5e9' },
  { label: 'Late Night',  emoji: '🌌', color: '#6366f1' },
];

const GENRES = ['Electronic', 'Synthwave', 'Ambient', 'Techno', 'Lo-Fi', 'Experimental', 'Darkwave', 'Hyperpop'];

const FEATURED_ARTISTS: ArtistInfo[] = [
  { id: 'a1', name: 'Kaelo Vance',  genre: 'Synthwave',       image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80', monthlyListeners: '2.4M' },
  { id: 'a2', name: 'Ethera',       genre: 'Ambient Techno',  image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&q=80', monthlyListeners: '1.1M' },
  { id: 'a3', name: 'V0id Runner',  genre: 'Synthwave',       image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80', monthlyListeners: '890K' },
  { id: 'a4', name: 'Lyra 7',       genre: 'Experimental Pop',image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&q=80', monthlyListeners: '650K' },
  { id: 'a5', name: 'Sub:Lex',      genre: 'Darkwave',        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80', monthlyListeners: '430K' },
];

// ─── Horizontal scroll list helper ───────────────────────────────────────────
function HScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="flex gap-4 overflow-x-auto pb-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {children}
    </div>
  );
}

// ─── Track Card ───────────────────────────────────────────────────────────────
interface TrackCardProps {
  track: Track;
  active: boolean;
  onPlay: () => void;
  key?: React.Key;
}
function TrackCard({ track, active, onPlay }: TrackCardProps) {
  return (
    <div
      className="discover-track-card flex-none w-44 group cursor-pointer mobile-touch-scale"
      onClick={onPlay}
      style={{ animation: 'mh-fadeup 0.3s ease-out both' }}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-xl"
           style={{ border: active ? '2px solid #00ff85' : '1px solid rgba(255,255,255,0.06)' }}>

        {track.image
          ? <img src={track.image} alt={track.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          : <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-4xl">🎵</div>
        }
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
               style={{ background: '#00ff85', boxShadow: '0 0 15px rgba(0,255,133,0.5)' }}>
            <Play size={20} fill="black" color="black" style={{ paddingLeft: 2 }} />
          </div>
        </div>
        {active && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest"
               style={{ background: '#00ff85', color: '#0a0a0a' }}>NOW</div>
        )}
      </div>
      <h3 className="text-sm font-bold text-white truncate mb-0.5 group-hover:text-[#00ff85] transition-colors">{track.name}</h3>
      <p className="text-xs uppercase tracking-widest truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{track.artists}</p>
    </div>
  );
}

// ─── Artist Chip ─────────────────────────────────────────────────────────────
interface ArtistChipProps {
  artist: ArtistInfo;
  onView: () => void;
  key?: React.Key;
}
function ArtistChip({ artist, onView }: ArtistChipProps) {
  return (
    <div className="flex-none w-36 flex flex-col items-center gap-2 group cursor-pointer mobile-touch-scale" onClick={onView}>

      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
             style={{ background: 'rgba(0,255,133,0.15)', filter: 'blur(10px)' }} />
        <img src={artist.image} alt={artist.name}
             className="w-24 h-24 rounded-full object-cover border-2 border-transparent group-hover:border-[#00ff85] transition-all duration-300" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-white truncate max-w-[130px] group-hover:text-[#00ff85] transition-colors">{artist.name}</p>
        <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{artist.genre}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DiscoverPage({ topTracks, nowPlaying, onPlayTrack, onViewArtist, onLoadTrending, searching }: DiscoverProps) {
  return (
    <div className="discover-root flex-1 min-w-0 relative z-10 pb-36">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative h-[380px] md:h-[440px] w-full overflow-hidden rounded-none md:rounded-b-3xl">
        <img
          src={FEATURED.bg}
          alt="Featured"
          className="absolute inset-0 w-full h-full object-cover scale-105"
          style={{ filter: 'brightness(0.5) saturate(1.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
        {/* Neon atmospheric line */}
        <div className="absolute bottom-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, #00ff85, transparent)' }} />

        <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-2/3">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4"
                style={{ background: '#00ff85', color: '#0a0a0a' }}>{FEATURED.tag}</span>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter leading-none">{FEATURED.title}</h1>
          <p className="text-sm md:text-base text-zinc-400 mb-6 max-w-lg">{FEATURED.desc}</p>
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 mobile-touch-scale"
              style={{ background: '#00ff85', color: '#0a0a0a', boxShadow: '0 0 20px rgba(0,255,133,0.4)' }}
            >
              <Play size={16} fill="black" color="black" />LISTEN NOW
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm border transition-all hover:bg-white/5 mobile-touch-scale"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              ADD TO LIBRARY
            </button>
          </div>

        </div>
      </section>

      <div className="px-4 md:px-8 mt-8 space-y-10">

        {/* ── Moods ──────────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white tracking-tight">Moods & Moments</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {MOODS.map(m => (
              <button key={m.label}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer mobile-touch-scale"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${m.color}22` }}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: m.color }}>{m.label}</span>
              </button>
            ))}

          </div>
        </section>

        {/* ── Top Hits (real YouTube data) ───────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} color="#00ff85" />
              <h2 className="text-xl font-black text-white tracking-tight">Top Hits</h2>
            </div>
            <button
              onClick={onLoadTrending}
              disabled={searching}
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors hover:text-white mobile-touch-scale"
              style={{ color: '#00ff85' }}
            >
              {searching ? 'Loading…' : <><Zap size={12} /> Refresh</>}
            </button>

          </div>
          {topTracks.length > 0 ? (
            <HScrollRow>
              {topTracks.slice(0, 12).map(t => (
                <TrackCard key={t.id} track={t} active={nowPlaying?.id === t.id} onPlay={() => onPlayTrack(t)} />
              ))}
            </HScrollRow>
          ) : (
            <div
              className="flex items-center justify-center py-14 rounded-2xl cursor-pointer transition-all hover:opacity-80"
              style={{ background: 'rgba(0,255,133,0.04)', border: '1px dashed rgba(0,255,133,0.2)' }}
              onClick={onLoadTrending}
            >
              {searching ? (
                <div className="flex gap-2">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="w-1.5 h-8 rounded-full animate-pulse" style={{ background: '#00ff85', animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-3">🎵</div>
                  <p className="text-zinc-400 text-sm mb-1">Load trending music from YouTube</p>
                  <button className="text-xs font-bold text-[#00ff85] hover:underline">Tap to Explore →</button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── New Albums Bento ───────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-black text-white tracking-tight mb-4">New Systems</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative h-52 rounded-2xl overflow-hidden group cursor-pointer mobile-touch-scale"
                 style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"
                alt="Quantum Pulse"
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-end p-6">
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#00ff85' }}>Album of the Week</p>
                <h3 className="text-xl font-black text-white">Quantum Pulse</h3>
                <p className="text-sm text-zinc-400">The definitive electronic experience.</p>
              </div>
            </div>
            <div className="relative h-52 rounded-2xl overflow-hidden group cursor-pointer mobile-touch-scale"
                 style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

              <img
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80"
                alt="Studio Sessions"
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-5">
                <h3 className="text-lg font-black text-white">Studio Sessions</h3>
                <p className="text-sm text-zinc-400">Raw, unfiltered beats.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Featured Artists ───────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white tracking-tight">Artists to Watch</h2>
            <button className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors hover:text-white" style={{ color: '#00ff85' }}>
              See All <ChevronRight size={12} />
            </button>
          </div>
          <HScrollRow>
            {FEATURED_ARTISTS.map(a => (
              <ArtistChip key={a.id} artist={a} onView={() => onViewArtist(a)} />
            ))}
          </HScrollRow>
        </section>

        {/* ── Genres ────────────────────────────────────────────────────── */}
        <section className="pb-4">
          <h2 className="text-xl font-black text-white tracking-tight mb-4">Browse Genres</h2>
          <div className="flex flex-wrap gap-2">
            {GENRES.map(g => (
              <button key={g}
                className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 hover:text-[#00ff85] mobile-touch-scale"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
              >
                {g}
              </button>
            ))}
          </div>

        </section>

      </div>
    </div>
  );
}
