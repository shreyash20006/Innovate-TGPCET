import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronDown, MoreVertical, Heart, Plus, Share2, Play, Pause,
  SkipBack, SkipForward, Shuffle, Repeat, ListMusic, Mic2,
  Volume2, VolumeX, Bluetooth, Speaker, Headphones, Car,
  Timer, Sliders, X, Check, ExternalLink, Radio,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Track {
  id: string; name: string; artists: string; album: string;
  image: string; preview_url: string | null; duration_ms: number; external_url: string;
}
interface SyncedLine { time: number; text: string; }

interface Props {
  track: Track;
  queue?: Track[];
  ytVideoId: string | null;
  ytLoading?: boolean;
  isHost?: boolean;
  roomCode?: string | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onTrackSelect?: (t: Track) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const EQ_PRESETS: Record<string, number[]> = {
  Normal:      [0,  0,  0,  0,  0],
  'Bass Boost':[6,  4,  1,  0,  0],
  Pop:         [2,  1,  0,  1,  2],
  Rock:        [5,  3,  0,  2,  4],
  Classical:   [4,  2,  0,  2,  4],
  Electronic:  [4,  2,  0,  3,  4],
  Vocal:       [0,  0,  3,  3,  1],
  'Hip Hop':   [5,  4,  0,  1,  2],
};

const DEVICES = [
  { id: 'phone',      label: 'Phone Speaker', Icon: Speaker    },
  { id: 'bt',         label: 'Bluetooth',     Icon: Bluetooth  },
  { id: 'earbuds',    label: 'Earbuds',        Icon: Headphones },
  { id: 'car',        label: 'Car Audio',      Icon: Car        },
];

const SLEEP_OPTIONS = [5, 10, 15, 30, 45, 60];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

function parseLRC(lrc: string): SyncedLine[] {
  return lrc.split('\n')
    .map(line => {
      const m = line.match(/\[(\d{2}):(\d{2}\.\d+)\](.*)/);
      if (!m) return null;
      const [min, sec] = [parseFloat(m[1]), parseFloat(m[2])];
      return { time: min * 60 + sec, text: m[3].trim() };
    })
    .filter(Boolean) as SyncedLine[];
}

// ─── CSS injected once ────────────────────────────────────────────────────────
const NP_CSS = `
  @keyframes np-slidein { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes np-fadein  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes np-popin   { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
  @keyframes np-vinyl   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes np-glow    { 0%,100%{box-shadow:0 0 40px rgba(29,185,84,0.4)} 50%{box-shadow:0 0 80px rgba(29,185,84,0.7)} }
  @keyframes np-eq1 { 0%,100%{height:6px}  50%{height:22px} }
  @keyframes np-eq2 { 0%,100%{height:10px} 50%{height:34px} }
  @keyframes np-eq3 { 0%,100%{height:5px}  50%{height:18px} }
  @keyframes np-eq4 { 0%,100%{height:8px}  50%{height:28px} }
  @keyframes np-eq5 { 0%,100%{height:4px}  50%{height:14px} }
  @keyframes np-lyric { 0%{opacity:0.3;transform:scale(1)} 100%{opacity:1;transform:scale(1.02)} }

  .np-range { -webkit-appearance:none; appearance:none; outline:none; cursor:pointer }
  .np-range::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:#1DB954; cursor:pointer; box-shadow:0 0 8px rgba(29,185,84,0.6) }
  .np-range-vol::-webkit-slider-thumb { width:10px; height:10px }
  .np-scrollbar::-webkit-scrollbar { display:none }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────
function ActionBtn({ icon, label, onClick, active = false }: {
  icon: React.ReactNode; label: string; onClick: () => void; active?: boolean;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 transition-all hover:scale-110 active:scale-90">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all"
        style={{
          background: active ? 'rgba(29,185,84,0.15)' : 'rgba(255,255,255,0.07)',
          border: `1px solid ${active ? 'rgba(29,185,84,0.35)' : 'rgba(255,255,255,0.08)'}`,
          color: active ? '#1DB954' : 'rgba(255,255,255,0.6)',
        }}>
        {icon}
      </div>
      <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
    </button>
  );
}

function BottomSheet({ onClose, children, title }: { onClose: () => void; children: React.ReactNode; title: string }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full rounded-t-3xl p-6 pb-8"
        style={{ background: 'rgba(12,12,22,0.98)', border: '1px solid rgba(255,255,255,0.08)', animation: 'np-slidein 0.28s cubic-bezier(0.4,0,0.2,1)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-black text-lg">{title}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NowPlayingScreen({
  track, queue = [], ytVideoId, ytLoading = false,
  isHost = false, roomCode = null, onClose, onNext, onPrev, onTrackSelect,
}: Props) {

  // ── YouTube IFrame API ──────────────────────────────────────────────────────
  const ytDivRef    = useRef<HTMLDivElement>(null);
  const ytPlayer    = useRef<any>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Playback state ──────────────────────────────────────────────────────────
  const [playing,     setPlaying]     = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(track.duration_ms / 1000);
  const [seeking,     setSeeking]     = useState(false);
  const [seekVal,     setSeekVal]     = useState(0);
  const [volume,      setVolume]      = useState(80);
  const [muted,       setMuted]       = useState(false);

  // ── Feature state ───────────────────────────────────────────────────────────
  const [shuffle,    setShuffle]    = useState(false);
  const [repeat,     setRepeat]     = useState<'none'|'all'|'one'>('none');
  const [liked,      setLiked]      = useState(false);
  const [activeTab,  setActiveTab]  = useState<'lyrics'|'queue'|'video'>('lyrics');
  const [eqOpen,     setEqOpen]     = useState(false);
  const [devOpen,    setDevOpen]    = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [sleepOpen,  setSleepOpen]  = useState(false);
  const [sleepMins,  setSleepMins]  = useState<number|null>(null);
  const [eqPreset,   setEqPreset]   = useState('Normal');
  const [eqVals,     setEqVals]     = useState([0,0,0,0,0]);
  const [activeDevice,setActiveDevice] = useState('phone');

  // ── Lyrics state ────────────────────────────────────────────────────────────
  const [syncedLyrics,   setSyncedLyrics]   = useState<SyncedLine[]>([]);
  const [plainLyrics,    setPlainLyrics]    = useState('');
  const [lyricsLoading,  setLyricsLoading]  = useState(false);
  const [activeLyricIdx, setActiveLyricIdx] = useState(-1);
  const lyricsScrollRef = useRef<HTMLDivElement>(null);
  const activeLyricRef  = useRef<HTMLDivElement>(null);

  // ── Swipe-to-dismiss ────────────────────────────────────────────────────────
  const [dragY,    setDragY]    = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart  = useRef(0);

  // ── Inject CSS once ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!document.getElementById('np-styles')) {
      const el = document.createElement('style');
      el.id = 'np-styles'; el.textContent = NP_CSS;
      document.head.appendChild(el);
    }
  }, []);

  // ── YouTube IFrame API setup ─────────────────────────────────────────────────
  useEffect(() => {
    if (!ytVideoId) return;

    function createPlayer() {
      if (!ytDivRef.current) return;
      if (ytPlayer.current) { try { ytPlayer.current.destroy(); } catch {} ytPlayer.current = null; }

      ytPlayer.current = new (window as any).YT.Player(ytDivRef.current, {
        videoId: ytVideoId,
        playerVars: { autoplay: 1, controls: 0, rel: 0, playsinline: 1, modestbranding: 1 },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(volume);
            const dur = e.target.getDuration();
            if (dur > 0) setDuration(dur);
            setPlaying(true);
          },
          onStateChange: (e: any) => {
            const st = e.data;
            setPlaying(st === 1);
            if (st === 0) { // ended
              if (repeat === 'one') { e.target.seekTo(0); e.target.playVideo(); }
              else if (repeat === 'all' || !repeat) onNext?.();
            }
          },
        },
      });
    }

    if ((window as any).YT?.Player) {
      createPlayer();
    } else {
      if (!document.getElementById('yt-api-script')) {
        const s = document.createElement('script');
        s.id = 'yt-api-script';
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
      }
      (window as any).onYouTubeIframeAPIReady = createPlayer;
    }

    return () => { try { ytPlayer.current?.destroy(); } catch {} };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytVideoId]);

  // ── Progress poll ────────────────────────────────────────────────────────────
  useEffect(() => {
    progressRef.current = setInterval(() => {
      if (!ytPlayer.current?.getCurrentTime) return;
      try {
        const ct  = ytPlayer.current.getCurrentTime() ?? 0;
        const dur = ytPlayer.current.getDuration()    ?? 0;
        if (dur > 0) { setDuration(dur); if (!seeking) { setCurrentTime(ct); setSeekVal((ct / dur) * 100); } }
        if (syncedLyrics.length > 0) {
          let idx = -1;
          for (let i = 0; i < syncedLyrics.length; i++) { if (syncedLyrics[i].time <= ct) idx = i; }
          setActiveLyricIdx(idx);
        }
      } catch {}
    }, 400);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [seeking, syncedLyrics]);

  // ── Auto-scroll lyrics ───────────────────────────────────────────────────────
  useEffect(() => {
    activeLyricRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeLyricIdx]);

  // ── Fetch lyrics (LRCLIB — free, no key) ─────────────────────────────────────
  useEffect(() => {
    setSyncedLyrics([]); setPlainLyrics(''); setActiveLyricIdx(-1);
    setLyricsLoading(true);
    const q = new URLSearchParams({ artist_name: track.artists, track_name: track.name });
    fetch(`https://lrclib.net/api/search?${q}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        const item = data[0];
        if (item?.syncedLyrics) setSyncedLyrics(parseLRC(item.syncedLyrics));
        else if (item?.plainLyrics) setPlainLyrics(item.plainLyrics);
      })
      .catch(() => {})
      .finally(() => setLyricsLoading(false));
  }, [track.id, track.artists, track.name]);

  // ── Sleep timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sleepMins) return;
    const id = setTimeout(() => { ytPlayer.current?.pauseVideo(); setSleepMins(null); }, sleepMins * 60 * 1000);
    return () => clearTimeout(id);
  }, [sleepMins]);

  // ── Controls ─────────────────────────────────────────────────────────────────
  function togglePlay() {
    if (!ytPlayer.current) return;
    playing ? ytPlayer.current.pauseVideo() : ytPlayer.current.playVideo();
  }

  function seek(val: number) {
    if (!ytPlayer.current) return;
    ytPlayer.current.seekTo((val / 100) * duration, true);
    setCurrentTime((val / 100) * duration);
  }

  function changeVolume(val: number) {
    setVolume(val); setMuted(val === 0);
    ytPlayer.current?.setVolume(val);
  }

  function toggleMute() {
    if (muted) { ytPlayer.current?.unMute(); ytPlayer.current?.setVolume(volume); }
    else { ytPlayer.current?.mute(); }
    setMuted(!muted);
  }

  function applyPreset(name: string) {
    setEqPreset(name); setEqVals([...EQ_PRESETS[name]]);
  }

  const handleShare = useCallback(() => {
    navigator.share?.({ title: track.name, text: `${track.name} — ${track.artists}`, url: track.external_url }).catch(() => {});
  }, [track]);

  // ── Swipe gestures ────────────────────────────────────────────────────────────
  function onTouchStart(e: React.TouchEvent) { dragStart.current = e.touches[0].clientY; setDragging(true); }
  function onTouchMove(e: React.TouchEvent) {
    if (!dragging) return;
    const d = e.touches[0].clientY - dragStart.current;
    if (d > 0) setDragY(d);
  }
  function onTouchEnd() {
    setDragging(false);
    if (dragY > 140) onClose(); else setDragY(0);
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[999] overflow-hidden"
      style={{
        transform: `translateY(${dragY}px)`,
        transition: dragging ? 'none' : 'transform 0.38s cubic-bezier(0.4,0,0.2,1)',
        animation: dragY === 0 ? 'np-slidein 0.42s cubic-bezier(0.4,0,0.2,1)' : 'none',
      }}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    >

      {/* ── Dynamic blurred album-art background ── */}
      <div className="absolute inset-0 overflow-hidden">
        <img src={track.image} alt="" className="absolute w-full h-full object-cover"
          style={{ filter: 'blur(90px) brightness(0.3) saturate(2.5)', transform: 'scale(1.6)', transformOrigin: 'center' }} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.92) 80%, #000 100%)'
        }} />
      </div>

      {/* ── Tiny hidden YT iframe (1px audio source) ── */}
      <div ref={ytDivRef} style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, opacity: 0.01, pointerEvents: 'none' }} />

      {/* ── Scrollable content ── */}
      <div className="relative z-10 h-full flex flex-col max-w-lg mx-auto px-5 pb-6 overflow-y-auto np-scrollbar">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-0.5 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }} />
        </div>

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between py-3 shrink-0">
          <button onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.7)' }}>
            <ChevronDown className="w-6 h-6" />
          </button>

          <div className="text-center">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {roomCode ? (isHost ? '🔴 Hosting' : '🎧 Synced') : 'Now Playing'}
            </p>
            {roomCode && <p className="text-[10px] font-mono mt-0.5" style={{ color: '#1DB954' }}>{roomCode}</p>}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.7)' }}>
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Output device indicator */}
        <button onClick={() => setDevOpen(true)}
          className="flex items-center justify-center gap-1.5 mb-2 shrink-0 transition-all hover:opacity-80"
          style={{ animation: 'np-fadein 0.4s ease-out' }}>
          {(() => { const d = DEVICES.find(d => d.id === activeDevice); return d ? <d.Icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} /> : null; })()}
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {DEVICES.find(d => d.id === activeDevice)?.label ?? 'Phone Speaker'}
          </span>
        </button>

        {/* ── Album Art ── */}
        <div className="flex justify-center my-2 shrink-0" style={{ animation: 'np-fadein 0.5s ease-out' }}>
          <div className="relative" style={{ width: 'min(68vw, 260px)', height: 'min(68vw, 260px)' }}>
            <img
              src={track.image || ''}
              alt={track.album}
              className="w-full h-full object-cover"
              style={{
                borderRadius: playing ? '50%' : '28px',
                transition: 'border-radius 0.6s ease, box-shadow 0.5s ease',
                boxShadow: playing
                  ? '0 25px 70px rgba(0,0,0,0.7), 0 0 60px rgba(29,185,84,0.25)'
                  : '0 25px 70px rgba(0,0,0,0.6)',
                animation: playing ? 'np-vinyl 22s linear infinite' : 'none',
              }}
            />
            {/* Vinyl hole */}
            {playing && (
              <div className="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none">
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.7)', border: '2px solid rgba(255,255,255,0.15)' }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.5)' }} />
                </div>
              </div>
            )}
            {/* Loading overlay */}
            {(ytLoading) && (
              <div className="absolute inset-0 rounded-3xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)' }}>
                <div className="flex gap-1.5">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-2 h-2 rounded-full animate-pulse"
                      style={{ background: '#1DB954', animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Track info + Like ── */}
        <div className="flex items-start justify-between px-1 mb-5 shrink-0" style={{ animation: 'np-fadein 0.55s ease-out' }}>
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-xl font-black leading-tight truncate">{track.name}</h2>
            <p className="text-sm mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>{track.artists}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.25)' }}>{track.album}</p>
          </div>
          <button onClick={() => setLiked(l => !l)}
            className="ml-4 mt-0.5 transition-all hover:scale-125 active:scale-90 shrink-0">
            <Heart className="w-6 h-6 transition-colors"
              style={{ color: liked ? '#ff2d78' : 'rgba(255,255,255,0.35)' }}
              fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* ── Seek bar ── */}
        <div className="px-1 mb-3 shrink-0">
          <input type="range" min={0} max={100}
            value={seeking ? seekVal : progress}
            className="np-range w-full h-1.5 rounded-full"
            style={{
              background: `linear-gradient(to right, #1DB954 ${seeking ? seekVal : progress}%, rgba(255,255,255,0.18) ${seeking ? seekVal : progress}%)`,
            }}
            onMouseDown={() => setSeeking(true)}
            onTouchStart={() => setSeeking(true)}
            onChange={e => { setSeekVal(+e.target.value); if (!seeking) seek(+e.target.value); }}
            onMouseUp={e => { seek(+(e.target as HTMLInputElement).value); setSeeking(false); }}
            onTouchEnd={e => { seek(+(e.target as HTMLInputElement).value); setSeeking(false); }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>{fmt(currentTime)}</span>
            <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {fmt(duration || track.duration_ms / 1000)}
            </span>
          </div>
        </div>

        {/* ── Main playback controls ── */}
        <div className="flex items-center justify-between px-3 mb-4 shrink-0">
          <button onClick={() => setShuffle(s => !s)}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-110"
            style={{ color: shuffle ? '#1DB954' : 'rgba(255,255,255,0.4)' }}>
            <Shuffle className="w-5 h-5" />
          </button>

          <button onClick={onPrev}
            className="w-14 h-14 flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-90"
            style={{ color: 'rgba(255,255,255,0.85)' }}>
            <SkipBack className="w-8 h-8" fill="currentColor" />
          </button>

          <button onClick={togglePlay}
            className="w-18 h-18 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
            style={{
              width: 68, height: 68,
              background: 'linear-gradient(135deg, #1DB954, #17a348)',
              boxShadow: playing
                ? '0 0 0 8px rgba(29,185,84,0.15), 0 0 50px rgba(29,185,84,0.55)'
                : '0 0 30px rgba(29,185,84,0.45)',
              animation: playing ? 'np-glow 2.5s ease-in-out infinite' : 'none',
            }}>
            {playing
              ? <Pause className="w-7 h-7" fill="currentColor" />
              : <Play className="w-7 h-7 ml-1" fill="currentColor" />}
          </button>

          <button onClick={onNext}
            className="w-14 h-14 flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-90"
            style={{ color: 'rgba(255,255,255,0.85)' }}>
            <SkipForward className="w-8 h-8" fill="currentColor" />
          </button>

          <button
            onClick={() => setRepeat(r => r === 'none' ? 'all' : r === 'all' ? 'one' : 'none')}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-110 relative"
            style={{ color: repeat !== 'none' ? '#1DB954' : 'rgba(255,255,255,0.4)' }}>
            <Repeat className="w-5 h-5" />
            {repeat === 'one' && (
              <span className="absolute -top-0.5 -right-0.5 text-[8px] font-black" style={{ color: '#1DB954' }}>1</span>
            )}
          </button>
        </div>

        {/* ── Volume ── */}
        <div className="flex items-center gap-3 mb-4 px-2 shrink-0">
          <button onClick={toggleMute} className="transition-colors hover:opacity-80" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input type="range" min={0} max={100} value={muted ? 0 : volume}
            onChange={e => changeVolume(+e.target.value)}
            className="np-range np-range-vol flex-1 h-1 rounded-full"
            style={{ background: `linear-gradient(to right, rgba(255,255,255,0.65) ${muted ? 0 : volume}%, rgba(255,255,255,0.15) ${muted ? 0 : volume}%)` }} />
          <Speaker className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
        </div>

        {/* ── Action buttons ── */}
        <div className="flex items-center justify-between px-1 mb-5 shrink-0">
          <ActionBtn icon={<Plus className="w-4 h-4" />} label="Add" onClick={() => {}} />
          <ActionBtn icon={<Share2 className="w-4 h-4" />} label="Share" onClick={handleShare} />
          <ActionBtn icon={<Sliders className="w-4 h-4" />} label="EQ" onClick={() => setEqOpen(true)} active={eqPreset !== 'Normal'} />
          <ActionBtn
            icon={<Timer className="w-4 h-4" />}
            label={sleepMins ? `${sleepMins}m` : 'Sleep'}
            onClick={() => setSleepOpen(true)}
            active={!!sleepMins}
          />
          <ActionBtn icon={<Mic2 className="w-4 h-4" />} label="Lyrics" onClick={() => setActiveTab('lyrics')} active={activeTab === 'lyrics'} />
        </div>

        {/* ── Tab switcher ── */}
        <div className="flex rounded-2xl p-1 mb-3 shrink-0"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {(['lyrics','queue','video'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="flex-1 py-2 text-xs font-bold rounded-xl capitalize transition-all"
              style={{
                color: activeTab === t ? '#fff' : 'rgba(255,255,255,0.4)',
                background: activeTab === t ? 'rgba(255,255,255,0.13)' : 'transparent',
              }}>
              {t === 'lyrics' ? '🎤 Lyrics' : t === 'queue' ? '📋 Queue' : '▶ Video'}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="rounded-2xl overflow-hidden shrink-0"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', minHeight: 140 }}>

          {/* Lyrics tab */}
          {activeTab === 'lyrics' && (
            <div ref={lyricsScrollRef}
              className="np-scrollbar overflow-y-auto px-5 py-4 space-y-2.5"
              style={{ maxHeight: 200 }}>

              {lyricsLoading && (
                <div className="flex justify-center py-4">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                  </div>
                </div>
              )}

              {!lyricsLoading && syncedLyrics.length > 0 && syncedLyrics.map((line, i) => (
                <div key={i}
                  ref={i === activeLyricIdx ? activeLyricRef : undefined}
                  className="transition-all duration-500 leading-relaxed"
                  style={{
                    fontSize: i === activeLyricIdx ? 15 : 13,
                    fontWeight: i === activeLyricIdx ? 800 : 400,
                    color: i === activeLyricIdx ? '#fff' : i < activeLyricIdx ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.45)',
                    animation: i === activeLyricIdx ? 'np-lyric 0.3s ease-out both' : 'none',
                  }}>
                  {line.text || '♪'}
                </div>
              ))}

              {!lyricsLoading && syncedLyrics.length === 0 && plainLyrics && (
                <p className="text-xs leading-6 whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {plainLyrics.slice(0, 600)}
                </p>
              )}

              {!lyricsLoading && syncedLyrics.length === 0 && !plainLyrics && (
                <div className="flex flex-col items-center justify-center py-6">
                  <Mic2 className="w-6 h-6 mb-2" style={{ color: 'rgba(255,255,255,0.2)' }} />
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Lyrics not available</p>
                </div>
              )}
            </div>
          )}

          {/* Queue tab */}
          {activeTab === 'queue' && (
            <div className="np-scrollbar overflow-y-auto" style={{ maxHeight: 200 }}>
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <ListMusic className="w-6 h-6 mb-2" style={{ color: 'rgba(255,255,255,0.2)' }} />
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Queue is empty</p>
                </div>
              ) : queue.map((t, i) => (
                <button key={t.id + i} onClick={() => onTrackSelect?.(t)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                  style={{ background: t.id === track.id ? 'rgba(29,185,84,0.08)' : 'transparent' }}
                  onMouseEnter={e => { if (t.id !== track.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = t.id === track.id ? 'rgba(29,185,84,0.08)' : 'transparent'; }}>
                  <img src={t.image} className="w-9 h-9 rounded-lg object-cover shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: t.id === track.id ? '#1DB954' : '#fff' }}>{t.name}</p>
                    <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.artists}</p>
                  </div>
                  {t.id === track.id && <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#1DB954' }} />}
                </button>
              ))}
            </div>
          )}

          {/* Video tab */}
          {activeTab === 'video' && (
            <div className="p-3" style={{ height: 200 }}>
              {ytVideoId ? (
                <iframe
                  key={`vt-${ytVideoId}`}
                  src={`https://www.youtube-nocookie.com/embed/${ytVideoId}?autoplay=0&rel=0&modestbranding=1`}
                  className="w-full h-full rounded-xl"
                  allow="encrypted-media; fullscreen"
                  title={track.name}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {ytLoading ? 'Finding video…' : 'Video not available'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Powered by attribution */}
        <p className="text-center mt-3 shrink-0" style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>
          Audio via YouTube · Lyrics via LRCLIB · Art via iTunes
        </p>
      </div>

      {/* ─── Equalizer bottom sheet ──────────────────────────────────────────── */}
      {eqOpen && (
        <BottomSheet title="Equalizer" onClose={() => setEqOpen(false)}>
          {/* Animated EQ bars */}
          <div className="flex items-end justify-center gap-2 mb-5 h-10">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="rounded-t-sm w-4"
                style={{ background: '#1DB954', animation: `np-eq${i} ${0.4 + i * 0.1}s ease-in-out infinite` }} />
            ))}
          </div>

          {/* Preset chips */}
          <div className="flex gap-2 flex-wrap mb-5">
            {Object.keys(EQ_PRESETS).map(name => (
              <button key={name} onClick={() => applyPreset(name)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: eqPreset === name ? '#1DB954' : 'rgba(255,255,255,0.07)',
                  color: eqPreset === name ? '#fff' : 'rgba(255,255,255,0.5)',
                }}>
                {name}
              </button>
            ))}
          </div>

          {/* Frequency sliders */}
          <div className="flex justify-between gap-1">
            {['60Hz','230Hz','910Hz','3.6k','14kHz'].map((band, i) => (
              <div key={band} className="flex flex-col items-center gap-2 flex-1">
                <input type="range" min={-6} max={6} step={0.5} value={eqVals[i]}
                  onChange={e => { const nv = [...eqVals]; nv[i] = +e.target.value; setEqVals(nv); setEqPreset('Custom'); }}
                  className="np-range rounded-full outline-none cursor-pointer"
                  style={{
                    writingMode: 'vertical-lr' as any, direction: 'rtl' as any,
                    height: 90, width: 6,
                    background: `linear-gradient(to top, #1DB954 ${((eqVals[i]+6)/12)*100}%, rgba(255,255,255,0.12) ${((eqVals[i]+6)/12)*100}%)`,
                    appearance: 'slider-vertical' as any,
                  }} />
                <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{band}</span>
                <span className="text-[9px] font-mono" style={{ color: '#1DB954' }}>
                  {eqVals[i] >= 0 ? '+' : ''}{eqVals[i]}
                </span>
              </div>
            ))}
          </div>
        </BottomSheet>
      )}

      {/* ─── Device bottom sheet ──────────────────────────────────────────────── */}
      {devOpen && (
        <BottomSheet title="Output Device" onClose={() => setDevOpen(false)}>
          <div className="space-y-2">
            {DEVICES.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => { setActiveDevice(id); setDevOpen(false); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all"
                style={{
                  background: activeDevice === id ? 'rgba(29,185,84,0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeDevice === id ? 'rgba(29,185,84,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  color: activeDevice === id ? '#1DB954' : 'rgba(255,255,255,0.65)',
                }}>
                <Icon className="w-5 h-5" />
                <span className="font-semibold text-sm">{label}</span>
                {activeDevice === id && <Check className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </div>
        </BottomSheet>
      )}

      {/* ─── Sleep timer bottom sheet ─────────────────────────────────────────── */}
      {sleepOpen && (
        <BottomSheet title="Sleep Timer" onClose={() => setSleepOpen(false)}>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {SLEEP_OPTIONS.map(m => (
              <button key={m} onClick={() => { setSleepMins(m); setSleepOpen(false); }}
                className="py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105"
                style={{
                  background: sleepMins === m ? '#1DB954' : 'rgba(255,255,255,0.07)',
                  color: sleepMins === m ? '#fff' : 'rgba(255,255,255,0.6)',
                }}>
                {m} min
              </button>
            ))}
          </div>
          {sleepMins && (
            <button onClick={() => { setSleepMins(null); setSleepOpen(false); }}
              className="w-full py-3 rounded-2xl text-sm font-bold transition-all"
              style={{ background: 'rgba(255,45,120,0.12)', color: '#ff2d78', border: '1px solid rgba(255,45,120,0.25)' }}>
              Cancel Timer ({sleepMins}m remaining)
            </button>
          )}
        </BottomSheet>
      )}

      {/* ─── 3-dot menu ───────────────────────────────────────────────────────── */}
      {menuOpen && (
        <div className="absolute top-16 right-5 z-50 rounded-2xl overflow-hidden shadow-2xl min-w-44"
          style={{ background: 'rgba(18,18,28,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', animation: 'np-popin 0.18s ease-out' }}>
          {[
            { label: 'Add to Playlist', icon: <Plus className="w-4 h-4" /> },
            { label: 'Share Song',       icon: <Share2 className="w-4 h-4" /> },
            { label: 'Sleep Timer',      icon: <Timer className="w-4 h-4" /> },
            { label: 'Open in YouTube',  icon: <ExternalLink className="w-4 h-4" />, href: ytVideoId ? `https://www.youtube.com/watch?v=${ytVideoId}` : track.external_url },
          ].map(item => (
            item.href
              ? <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  {item.icon}{item.label}
                </a>
              : <button key={item.label}
                  onClick={() => { setMenuOpen(false); if (item.label === 'Sleep Timer') setSleepOpen(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  {item.icon}{item.label}
                </button>
          ))}
        </div>
      )}
    </div>
  );
}
