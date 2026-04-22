import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown, Heart, Shuffle, Repeat, SkipBack, SkipForward, Play, Pause,
  Volume2, VolumeX, ListMusic
} from 'lucide-react';
import { Track } from '../types/music';

interface Props {
  track: Track;
  queue: Track[];
  ytVideoId: string | null;
  ytLoading?: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onTrackSelect: (t: Track) => void;
  isHost?: boolean;
  roomCode?: string | null;
}

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

export default function NowPlaying({
  track, queue, ytVideoId, ytLoading, onClose, onNext, onPrev, onTrackSelect
}: Props) {
  const ytDivRef = useRef<HTMLDivElement>(null);
  const ytPlayer = useRef<any>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(track.duration_ms / 1000);
  const [seeking, setSeeking] = useState(false);
  const [seekVal, setSeekVal] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'none'|'all'|'one'>('none');
  const [liked, setLiked] = useState(false); // Should lift this if sharing with main app

  // ── YouTube IFrame API ──────────────────────────────────────────────────────
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
              else if (repeat === 'all' || !repeat) onNext();
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
      } catch {}
    }, 400);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [seeking]);

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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[999] bg-[#0a0a0a] text-white font-sans overflow-hidden slide-up-anim">
      {/* Tiny hidden YT iframe (1px audio source) */}
      <div ref={ytDivRef} style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, opacity: 0.01, pointerEvents: 'none' }} />
      
      {/* ── Navbar just for close button (Optional but good UX) ── */}
      <div className="absolute top-0 left-0 w-full p-6 z-[100] flex justify-between">
        <button onClick={onClose} className="p-2 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-all">
          <ChevronDown className="w-8 h-8 text-white" />
        </button>
      </div>

      {/* Nebula Background Effects */}
      <div className="fixed inset-0 nebula-gradient pointer-events-none z-0"></div>
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#ff24e4]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#00ff85]/5 blur-[150px] rounded-full pointer-events-none"></div>

      <main className="relative z-10 pt-20 h-screen flex flex-col md:flex-row px-0 md:px-12 pb-28 gap-4 md:gap-8 overflow-y-auto np-scrollbar">
        {/* Center Visualizer Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[400px]">
          {/* Frequency Orbit (Visualizer) */}
          <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none scale-75 md:scale-100">
            <div className={`w-[320px] h-[320px] md:w-[500px] md:h-[500px] rounded-full border-2 border-[#00ff85]/20 ${playing ? 'animate-pulse' : ''} transition-all duration-1000`}></div>
            <div className="absolute w-[360px] h-[360px] md:w-[560px] md:h-[560px] rounded-full border border-[#ff24e4]/10"></div>
            <div className="absolute w-full h-full flex items-center justify-center">
              <svg className={`w-full h-full opacity-30 ${playing ? 'animate-[spin_20s_linear_infinite]' : ''}`} viewBox="0 0 100 100">
                <circle className="text-[#00ff85]" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeDasharray="2 1" strokeWidth="0.5"></circle>
              </svg>
            </div>
          </div>
          
          {/* Album Art */}
          <div className="relative group scale-90 md:scale-100 mt-12 md:mt-0">
            <div className={`absolute -inset-4 bg-[#00ff85]/20 blur-2xl rounded-full ${playing ? 'opacity-60' : 'opacity-0'} group-hover:opacity-100 transition-opacity duration-700`}></div>
            <div className={`w-64 h-64 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl relative z-20 ${playing ? 'animate-[spin_20s_linear_infinite]' : ''}`}>
              <img alt="Album artwork" className="w-full h-full object-cover" src={track.image || 'https://via.placeholder.com/400'} />
            </div>
          </div>
          
          {/* Track Info */}
          <div className="mt-8 md:mt-12 text-center z-20 px-4">
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#00ff85] tracking-tight drop-shadow-md truncate max-w-sm md:max-w-xl">{track.name}</h1>
            <p className="text-lg md:text-2xl text-zinc-400 mt-2 truncate max-w-xs md:max-w-md mx-auto">{track.artists}</p>
          </div>
        </div>

        {/* Right Side: Glassmorphic Queue & Lyrics */}
        <aside className="w-full md:w-96 flex flex-col gap-6 z-20 h-full p-4 md:p-0">
          <div className="glass-panel rim-light rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]/30">
              <h2 className="text-lg md:text-xl font-bold text-white">Up Next</h2>
              <span className="text-[10px] font-bold text-[#00ff85] uppercase tracking-widest bg-[#00ff85]/10 px-2 py-1 rounded-md">Queue</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 np-scrollbar">
              {queue.map((t) => {
                const isActive = t.id === track.id;
                return (
                  <div key={t.id} onClick={() => onTrackSelect(t)} 
                       className={`flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-xl transition-all cursor-pointer ${isActive ? 'bg-white/10 border-l-4 border-[#00ff85]' : 'hover:bg-white/5 group'}`}>
                    <img alt="Album thumb" className={`w-10 h-10 md:w-12 md:h-12 rounded object-cover ${isActive ? '' : 'grayscale group-hover:grayscale-0'} transition-all`} src={t.image} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm md:text-base font-semibold truncate ${isActive ? 'text-[#00ff85]' : 'text-zinc-300'}`}>{t.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{t.artists}</p>
                    </div>
                    {isActive ? (
                      <div className="flex items-end gap-[2px] h-4 w-4">
                        {[1,2,3].map(i => <div key={i} className={`w-1 bg-[#00ff85] rounded-full animate-pulse`} style={{ animationDelay: `${i*0.2}s`, height: playing ? `${Math.floor(Math.random()*100)}%` : '20%' }}/>)}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-600 hidden md:block">{fmt(t.duration_ms/1000)}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Mini Lyrics Preview (Placeholder logic for visuals) */}
          <div className="glass-panel rim-light rounded-2xl p-4 md:p-6 h-32 md:h-40 shadow-xl hidden md:flex flex-col justify-center text-center">
             <p className="text-sm text-zinc-500 opacity-50 mb-1">♪ (Lyrics not synced)</p>
             <p className="text-lg text-[#00ff85] font-bold drop-shadow-[0_0_8px_rgba(0,255,133,0.4)] truncate">{track.name}</p>
             <p className="text-sm text-zinc-500 opacity-50 mt-1">{track.album}</p>
          </div>
        </aside>
      </main>

      {/* Bottom Control Bar */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-2xl border-t border-white/5 h-28 flex flex-col justify-center px-4 md:px-8">
        {/* Progress Slider */}
        <div className="absolute top-0 left-0 w-full -mt-[6px] px-8 group cursor-pointer"
             onMouseDown={() => setSeeking(true)}
             onTouchStart={() => setSeeking(true)}
             onMouseUp={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = (e as any).clientX || (e as any).changedTouches[0].clientX;
                const perc = Math.max(0, Math.min(100, ((clickX - rect.left) / rect.width) * 100));
                seek(perc);
                setSeeking(false);
             }}
             onTouchEnd={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.changedTouches[0].clientX;
                const perc = Math.max(0, Math.min(100, ((clickX - rect.left) / rect.width) * 100));
                seek(perc);
                setSeeking(false);
             }}
        >
          <div className="relative h-2 w-full bg-[#222] rounded-full overflow-visible">
            <div className="absolute top-0 left-0 h-full bg-[#00ff85] rounded-full shadow-[0_0_15px_#00FF85] transition-all" style={{ width: `${seeking ? seekVal : progress}%` }}></div>
            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full bg-opacity-0 group-hover:bg-opacity-100 transition-all shadow-[0_0_15px_#fff]" style={{ left: `calc(${seeking ? seekVal : progress}% - 8px)` }}></div>
          </div>
          <div className="flex justify-between mt-1 px-1">
            <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400">{fmt(currentTime)}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400">{fmt(duration || track.duration_ms/1000)}</span>
          </div>
        </div>

        {/* Main Controls - Mobile Layout adjusts flex */}
        <div className="flex items-center justify-between w-full mt-2">
          
          {/* Secondary Actions (Hidden tightly on very small screens) */}
          <div className="hidden sm:flex items-center gap-4 md:gap-6 w-1/4">
            <Heart className={`w-5 h-5 cursor-pointer transition-all ${liked ? 'text-[#ff24e4] fill-[#ff24e4]' : 'text-zinc-400 hover:text-[#00ff85]'}`} onClick={() => setLiked(!liked)} />
            <Shuffle className={`w-5 h-5 cursor-pointer transition-all ${shuffle ? 'text-[#00ff85]' : 'text-zinc-400 hover:text-[#00ff85]'}`} onClick={() => setShuffle(!shuffle)} />
            <div className="relative cursor-pointer" onClick={() => setRepeat(r => r === 'none' ? 'all' : r === 'all' ? 'one' : 'none')}>
                <Repeat className={`w-5 h-5 transition-all ${repeat !== 'none' ? 'text-[#00ff85]' : 'text-zinc-400 hover:text-[#00ff85]'}`} />
                {repeat === 'one' && <span className="absolute -top-1 -right-1 text-[8px] font-bold text-[#00ff85]">1</span>}
            </div>
          </div>

          {/* Primary Playback Cluster */}
          <div className="flex items-center justify-center gap-6 md:gap-8 flex-1 sm:flex-none">
            <SkipBack className="w-8 h-8 text-zinc-300 hover:scale-110 hover:text-[#00FF85] transition-all cursor-pointer fill-current" onClick={onPrev} />
            <div className="relative group cursor-pointer transition-all hover:scale-105 active:scale-95" onClick={togglePlay}>
              <div className="absolute -inset-2 bg-[#00ff85]/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {playing ? (
                  <Pause className="w-14 h-14 text-[#00FF85] drop-shadow-[0_0_15px_rgba(0,255,133,0.8)] fill-current relative z-10" />
              ) : (
                  <Play className="w-14 h-14 text-[#00FF85] drop-shadow-[0_0_15px_rgba(0,255,133,0.8)] fill-current relative z-10 pl-1" />
              )}
            </div>
            <SkipForward className="w-8 h-8 text-zinc-300 hover:scale-110 hover:text-[#00FF85] transition-all cursor-pointer fill-current" onClick={onNext} />
          </div>

          {/* Volume and Settings */}
          <div className="flex items-center gap-3 md:gap-4 w-1/4 justify-end">
            <div className="hidden md:flex items-center gap-2 w-full max-w-[120px]">
                {muted ? <VolumeX className="w-5 h-5 text-zinc-400 cursor-pointer" onClick={toggleMute} /> : <Volume2 className="w-5 h-5 text-zinc-400 cursor-pointer" onClick={toggleMute} />}
                <input type="range" min={0} max={100} value={muted ? 0 : volume} onChange={e => changeVolume(+e.target.value)}
                    className="w-full h-1 bg-[#222] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                    style={{ background: `linear-gradient(to right, #ccc ${muted ? 0 : volume}%, #222 ${muted ? 0 : volume}%)` }} />
            </div>
            <ListMusic className="w-5 h-5 text-zinc-400 hover:text-[#00ff85] cursor-pointer" onClick={onClose} />
          </div>
        </div>
      </footer>
      
      <style>{`
        .glass-panel {
            background: rgba(26, 26, 26, 0.4);
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .rim-light {
            border-top: 1px solid rgba(255, 255, 255, 0.15);
            border-left: 1px solid rgba(255, 255, 255, 0.15);
        }
        .nebula-gradient {
            background: radial-gradient(circle at 50% 50%, rgba(255, 0, 230, 0.07) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(0, 255, 133, 0.05) 0%, transparent 40%);
        }
        .np-scrollbar::-webkit-scrollbar { width: 4px; }
        .np-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        .slide-up-anim { animation: np-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes np-slide-up {
            from { transform: translateY(100vh); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
