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
  const [liked, setLiked] = useState(false);

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
            if (st === 0) {
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
    <div className="np-root">
      {/* Hidden YT iframe */}
      <div ref={ytDivRef} style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, opacity: 0.01, pointerEvents: 'none' }} />

      {/* Nebula Background */}
      <div className="np-nebula" />
      <div className="np-orb np-orb-pink" />
      <div className="np-orb np-orb-green" />

      {/* Top bar */}
      <header className="np-topbar">
        <button onClick={onClose} className="np-close-btn" aria-label="Close">
          <ChevronDown size={26} />
        </button>
        <div className="np-topbar-title">
          <span className="np-playing-from">Now Playing</span>
        </div>
        <div style={{ width: 42 }} />
      </header>

      {/* Main layout: left = art+info, right = queue */}
      <main className="np-main">

        {/* ── Left: Disc + Info + Controls ── */}
        <section className="np-center">

          {/* Orbit rings */}
          <div className="np-orbit-rings" aria-hidden>
            <div className={`np-ring np-ring-1${playing ? ' np-ring-pulse' : ''}`} />
            <div className={`np-ring np-ring-2`} />
          </div>

          {/* Album Art Disc */}
          <div className="np-disc-wrapper">
            {/* Glow halo */}
            <div className={`np-disc-glow${playing ? ' np-disc-glow-active' : ''}`} />
            {/* Spinning disc container */}
            <div className={`np-disc${playing ? ' np-disc-spin' : ''}`}>
              <img
                src={track.image || 'https://via.placeholder.com/400/111/00ff85?text=♪'}
                alt={track.name}
                className="np-disc-img"
                draggable={false}
              />
              {/* Center dot */}
              <div className="np-disc-center-dot" />
            </div>
            {/* Playing badge */}
            {playing && (
              <div className="np-playing-badge">
                <span />
                LIVE
              </div>
            )}
          </div>

          {/* Track info */}
          <div className="np-track-info">
            <h1 className="np-track-title" title={track.name}>{track.name}</h1>
            <p className="np-track-artist">{track.artists}</p>
            {track.album && <p className="np-track-album">{track.album}</p>}
          </div>

          {/* Secondary controls row */}
          <div className="np-secondary-controls">
            <button
              className={`np-icon-btn${liked ? ' np-icon-btn-pink' : ''}`}
              onClick={() => setLiked(!liked)}
              title={liked ? 'Unlike' : 'Like'}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button
              className={`np-icon-btn${shuffle ? ' np-icon-btn-green' : ''}`}
              onClick={() => setShuffle(!shuffle)}
              title="Shuffle"
            >
              <Shuffle size={18} />
            </button>
            <div className="np-repeat-wrap">
              <button
                className={`np-icon-btn${repeat !== 'none' ? ' np-icon-btn-green' : ''}`}
                onClick={() => setRepeat(r => r === 'none' ? 'all' : r === 'all' ? 'one' : 'none')}
                title="Repeat"
              >
                <Repeat size={18} />
              </button>
              {repeat === 'one' && <span className="np-repeat-badge">1</span>}
            </div>
          </div>

          {/* Progress bar */}
          <div className="np-progress-area">
            <div
              className="np-seekbar-track"
              onMouseDown={() => setSeeking(true)}
              onTouchStart={() => setSeeking(true)}
              onMouseUp={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const perc = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                seek(perc); setSeeking(false);
              }}
              onTouchEnd={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const perc = Math.max(0, Math.min(100, ((e.changedTouches[0].clientX - rect.left) / rect.width) * 100));
                seek(perc); setSeeking(false);
              }}
            >
              <div className="np-seekbar-bg">
                <div className="np-seekbar-fill" style={{ width: `${seeking ? seekVal : progress}%` }} />
                <div className="np-seekbar-thumb" style={{ left: `calc(${seeking ? seekVal : progress}% - 7px)` }} />
              </div>
            </div>
            <div className="np-time-row">
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration || track.duration_ms / 1000)}</span>
            </div>
          </div>

          {/* Primary playback controls */}
          <div className="np-primary-controls">
            <button className="np-ctrl-btn" onClick={onPrev} title="Previous">
              <SkipBack size={28} fill="currentColor" />
            </button>
            <button className="np-play-btn" onClick={togglePlay} title={playing ? 'Pause' : 'Play'}>
              <div className="np-play-glow" />
              {playing
                ? <Pause size={32} fill="currentColor" className="relative z-10" />
                : <Play  size={32} fill="currentColor" className="relative z-10" style={{ paddingLeft: 3 }} />
              }
            </button>
            <button className="np-ctrl-btn" onClick={onNext} title="Next">
              <SkipForward size={28} fill="currentColor" />
            </button>
          </div>

          {/* Volume */}
          <div className="np-volume-row">
            <button className="np-icon-btn" onClick={toggleMute}>
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range" min={0} max={100} value={muted ? 0 : volume}
              onChange={e => changeVolume(+e.target.value)}
              className="np-volume-slider"
              style={{ background: `linear-gradient(to right, #00ff85 ${muted ? 0 : volume}%, #2a2a2a ${muted ? 0 : volume}%)` }}
            />
            <button className="np-icon-btn" onClick={onClose} title="Close player">
              <ListMusic size={16} />
            </button>
          </div>

        </section>

        {/* ── Right: Queue Panel ── */}
        <aside className="np-queue-panel">
          <div className="np-queue-header">
            <h2 className="np-queue-title">Up Next</h2>
            <span className="np-queue-badge">Queue</span>
          </div>
          <div className="np-queue-list np-scrollbar">
            {queue.length === 0 && (
              <div className="np-queue-empty">No tracks in queue</div>
            )}
            {queue.map((t) => {
              const isActive = t.id === track.id;
              return (
                <div
                  key={t.id}
                  onClick={() => onTrackSelect(t)}
                  className={`np-queue-item${isActive ? ' np-queue-item-active' : ''}`}
                >
                  <div className="np-queue-thumb-wrap">
                    <img
                      src={t.image || 'https://via.placeholder.com/48/111/555?text=♪'}
                      alt={t.name}
                      className={`np-queue-thumb${!isActive ? ' np-queue-thumb-gray' : ''}`}
                    />
                    {isActive && (
                      <div className="np-queue-eq">
                        {[0.2, 0.4, 0.3].map((d, i) => (
                          <div key={i} className="np-eq-bar" style={{ animationDelay: `${d}s`, animationPlayState: playing ? 'running' : 'paused' }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="np-queue-info">
                    <p className={`np-queue-name${isActive ? ' np-queue-name-active' : ''}`}>{t.name}</p>
                    <p className="np-queue-artist">{t.artists}</p>
                  </div>
                  <span className="np-queue-dur">{fmt(t.duration_ms / 1000)}</span>
                </div>
              );
            })}
          </div>

          {/* Lyrics placeholder */}
          <div className="np-lyrics-card">
            <p className="np-lyrics-hint">♪ Lyrics</p>
            <p className="np-lyrics-track">{track.name}</p>
            {track.album && <p className="np-lyrics-album">{track.album}</p>}
          </div>
        </aside>
      </main>

      <style>{`
        /* ─── Root ─────────────────────────────────────────── */
        .np-root {
          position: fixed; inset: 0; z-index: 999;
          background: #080810;
          color: #fff;
          font-family: 'Inter', system-ui, sans-serif;
          display: flex; flex-direction: column;
          overflow: hidden;
        }

        /* ─── Background ───────────────────────────────────── */
        .np-nebula {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse at 30% 40%, rgba(255,0,230,0.07) 0%, transparent 55%),
            radial-gradient(ellipse at 75% 65%, rgba(0,255,133,0.05) 0%, transparent 50%);
        }
        .np-orb {
          position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
          filter: blur(100px);
        }
        .np-orb-pink  { width: 45vw; height: 45vw; top: -15%; left: -10%; background: rgba(255,36,228,0.09); }
        .np-orb-green { width: 55vw; height: 55vw; bottom: -20%; right: -15%; background: rgba(0,255,133,0.05); }

        /* ─── Top bar ──────────────────────────────────────── */
        .np-topbar {
          position: relative; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(8,8,16,0.6);
          backdrop-filter: blur(12px);
          flex-shrink: 0;
        }
        .np-close-btn {
          width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.06); border: none; border-radius: 50%;
          color: #fff; cursor: pointer; transition: background 0.2s, transform 0.15s;
        }
        .np-close-btn:hover { background: rgba(255,255,255,0.12); transform: scale(1.08); }
        .np-topbar-title { text-align: center; }
        .np-playing-from {
          font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(255,255,255,0.4);
        }

        /* ─── Main layout ──────────────────────────────────── */
        .np-main {
          position: relative; z-index: 5;
          flex: 1; display: flex; flex-direction: row;
          overflow: hidden;
          min-height: 0;
        }

        /* ─── Center column ────────────────────────────────── */
        .np-center {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 16px 32px 24px;
          gap: 0;
          overflow-y: auto;
        }

        /* ─── Orbit rings ──────────────────────────────────── */
        .np-orbit-rings {
          position: relative; width: 100%; max-width: 380px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: -190px; /* pull disc up into rings */
          pointer-events: none;
        }
        .np-ring {
          position: absolute; border-radius: 50%;
        }
        .np-ring-1 {
          width: 300px; height: 300px;
          border: 1.5px solid rgba(0,255,133,0.18);
          transition: border-color 0.6s;
        }
        .np-ring-1.np-ring-pulse { border-color: rgba(0,255,133,0.35); animation: np-pulse-ring 2.5s ease-in-out infinite; }
        .np-ring-2 {
          width: 340px; height: 340px;
          border: 1px solid rgba(255,36,228,0.08);
        }
        @keyframes np-pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.04); opacity: 1; }
        }

        /* ─── Disc ─────────────────────────────────────────── */
        .np-disc-wrapper {
          position: relative;
          width: min(240px, 38vw);
          height: min(240px, 38vw);
          flex-shrink: 0;
          margin-bottom: 24px;
        }
        @media (min-width: 768px) {
          .np-disc-wrapper { width: min(280px, 32vw); height: min(280px, 32vw); }
        }
        @media (min-width: 1200px) {
          .np-disc-wrapper { width: 300px; height: 300px; }
        }

        .np-disc-glow {
          position: absolute; inset: -16px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,255,133,0.18) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.8s ease;
          pointer-events: none;
        }
        .np-disc-glow-active { opacity: 1; }

        .np-disc {
          width: 100%; height: 100%;
          border-radius: 50%;
          overflow: hidden;
          position: relative;
          border: 3px solid rgba(255,255,255,0.1);
          box-shadow:
            0 0 0 2px rgba(0,255,133,0.12),
            0 8px 40px rgba(0,0,0,0.6),
            inset 0 0 0 1px rgba(255,255,255,0.06);
        }
        .np-disc-spin { animation: np-spin 22s linear infinite; }
        @keyframes np-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .np-disc-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          border-radius: 50%;
          /* Ensure image always fills circle and never overflows */
          flex-shrink: 0;
        }

        .np-disc-center-dot {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #0a0a0a;
          border: 2px solid rgba(255,255,255,0.2);
          pointer-events: none;
          z-index: 2;
        }

        .np-playing-badge {
          position: absolute;
          bottom: -10px; left: 50%; transform: translateX(-50%);
          display: flex; align-items: center; gap: 5px;
          background: #00ff85; color: #0a0a0a;
          font-size: 9px; font-weight: 800; letter-spacing: 0.15em;
          padding: 3px 10px; border-radius: 20px;
          box-shadow: 0 0 12px rgba(0,255,133,0.5);
          white-space: nowrap;
        }
        .np-playing-badge span {
          width: 5px; height: 5px; border-radius: 50%;
          background: #0a0a0a; animation: np-blink 0.8s ease-in-out infinite;
        }
        @keyframes np-blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

        /* ─── Track Info ───────────────────────────────────── */
        .np-track-info {
          text-align: center;
          width: 100%; max-width: 420px;
          padding: 0 8px;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        .np-track-title {
          font-size: clamp(1.1rem, 3vw, 1.7rem);
          font-weight: 800;
          color: #00ff85;
          letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          line-height: 1.2;
          margin: 0 0 6px;
          text-shadow: 0 0 20px rgba(0,255,133,0.4);
        }
        .np-track-artist {
          font-size: clamp(0.8rem, 2vw, 1rem);
          color: rgba(255,255,255,0.5);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin: 0 0 3px;
        }
        .np-track-album {
          font-size: 0.72rem; color: rgba(255,255,255,0.28);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin: 0;
        }

        /* ─── Secondary controls ───────────────────────────── */
        .np-secondary-controls {
          display: flex; align-items: center; justify-content: center;
          gap: 20px;
          margin: 8px 0;
        }
        .np-icon-btn {
          background: transparent; border: none;
          color: rgba(255,255,255,0.4);
          cursor: pointer; padding: 6px;
          border-radius: 50%;
          transition: color 0.2s, transform 0.15s;
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .np-icon-btn:hover { color: #fff; transform: scale(1.15); }
        .np-icon-btn-green { color: #00ff85 !important; }
        .np-icon-btn-pink  { color: #ff24e4 !important; }
        .np-repeat-wrap { position: relative; }
        .np-repeat-badge {
          position: absolute; top: 0; right: -2px;
          font-size: 8px; font-weight: 800; color: #00ff85;
          line-height: 1;
        }

        /* ─── Progress / seek bar ──────────────────────────── */
        .np-progress-area {
          width: 100%; max-width: 440px;
          margin: 8px 0 4px;
        }
        .np-seekbar-track {
          width: 100%; padding: 8px 0; cursor: pointer;
        }
        .np-seekbar-bg {
          position: relative; height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .np-seekbar-fill {
          position: absolute; top: 0; left: 0; height: 100%;
          background: #00ff85;
          border-radius: 4px;
          box-shadow: 0 0 8px rgba(0,255,133,0.6);
          transition: width 0.1s linear;
        }
        .np-seekbar-thumb {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 14px; height: 14px;
          background: #fff; border-radius: 50%;
          box-shadow: 0 0 6px rgba(255,255,255,0.4);
          opacity: 0; transition: opacity 0.2s;
        }
        .np-seekbar-track:hover .np-seekbar-thumb { opacity: 1; }

        .np-time-row {
          display: flex; justify-content: space-between;
          font-size: 10px; font-weight: 700;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.05em;
          margin-top: 4px;
        }

        /* ─── Primary controls ─────────────────────────────── */
        .np-primary-controls {
          display: flex; align-items: center; justify-content: center;
          gap: 32px;
          margin: 10px 0 8px;
        }
        .np-ctrl-btn {
          background: transparent; border: none;
          color: rgba(255,255,255,0.7);
          cursor: pointer; padding: 8px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.2s, transform 0.15s;
        }
        .np-ctrl-btn:hover { color: #00ff85; transform: scale(1.12); }

        .np-play-btn {
          position: relative;
          width: 64px; height: 64px;
          border-radius: 50%; border: none;
          background: rgba(0,255,133,0.12);
          color: #00ff85;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.15s, background 0.2s;
          box-shadow: 0 0 0 1px rgba(0,255,133,0.3), 0 4px 20px rgba(0,255,133,0.2);
        }
        .np-play-btn:hover { transform: scale(1.08); background: rgba(0,255,133,0.2); }
        .np-play-btn:active { transform: scale(0.95); }
        .np-play-glow {
          position: absolute; inset: -8px; border-radius: 50%;
          background: rgba(0,255,133,0.15); filter: blur(10px);
          opacity: 0; transition: opacity 0.2s;
          pointer-events: none;
        }
        .np-play-btn:hover .np-play-glow { opacity: 1; }

        /* ─── Volume ───────────────────────────────────────── */
        .np-volume-row {
          display: flex; align-items: center; gap: 10px;
          width: 100%; max-width: 260px;
          margin-top: 4px;
        }
        .np-volume-slider {
          flex: 1; height: 3px;
          border-radius: 3px; outline: none; border: none;
          -webkit-appearance: none; appearance: none;
          cursor: pointer;
        }
        .np-volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 10px; height: 10px;
          background: #fff; border-radius: 50%;
        }

        /* ─── Queue panel ──────────────────────────────────── */
        .np-queue-panel {
          width: 320px;
          flex-shrink: 0;
          display: flex; flex-direction: column;
          background: rgba(255,255,255,0.02);
          border-left: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .np-queue-panel { display: none; }
        }
        @media (min-width: 1400px) {
          .np-queue-panel { width: 360px; }
        }

        .np-queue-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 20px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.2);
          flex-shrink: 0;
        }
        .np-queue-title {
          font-size: 15px; font-weight: 700; color: #fff; margin: 0;
        }
        .np-queue-badge {
          font-size: 9px; font-weight: 800;
          color: #00ff85; letter-spacing: 0.12em; text-transform: uppercase;
          background: rgba(0,255,133,0.1);
          padding: 3px 8px; border-radius: 6px;
          border: 1px solid rgba(0,255,133,0.2);
        }

        .np-queue-list {
          flex: 1; overflow-y: auto;
          padding: 8px 12px;
        }
        .np-queue-empty {
          text-align: center; color: rgba(255,255,255,0.2);
          font-size: 12px; padding: 32px 0;
        }

        .np-queue-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 8px; border-radius: 12px;
          cursor: pointer; transition: background 0.15s;
          border-left: 3px solid transparent;
        }
        .np-queue-item:hover { background: rgba(255,255,255,0.04); }
        .np-queue-item-active {
          background: rgba(0,255,133,0.06) !important;
          border-left-color: #00ff85;
        }

        .np-queue-thumb-wrap {
          position: relative;
          width: 44px; height: 44px; flex-shrink: 0;
        }
        .np-queue-thumb {
          width: 44px; height: 44px;
          border-radius: 8px;
          object-fit: cover;
          display: block;
        }
        .np-queue-thumb-gray { filter: grayscale(0.6); }
        .np-queue-item:hover .np-queue-thumb-gray { filter: grayscale(0); }
        .np-queue-item-active .np-queue-thumb { filter: none; }

        .np-queue-eq {
          position: absolute; inset: 0;
          display: flex; align-items: flex-end; justify-content: center;
          gap: 2px; padding: 6px;
          background: rgba(0,0,0,0.45); border-radius: 8px;
        }
        .np-eq-bar {
          width: 3px; background: #00ff85; border-radius: 2px;
          animation: np-eq 0.55s ease-in-out infinite alternate;
          flex-shrink: 0;
        }
        .np-eq-bar:nth-child(1) { height: 40%; }
        .np-eq-bar:nth-child(2) { height: 70%; }
        .np-eq-bar:nth-child(3) { height: 50%; }
        @keyframes np-eq {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }

        .np-queue-info { flex: 1; min-width: 0; }
        .np-queue-name {
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin: 0 0 2px;
        }
        .np-queue-name-active { color: #00ff85 !important; }
        .np-queue-artist {
          font-size: 11px; color: rgba(255,255,255,0.35);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin: 0;
        }
        .np-queue-dur {
          font-size: 11px; color: rgba(255,255,255,0.25);
          white-space: nowrap; flex-shrink: 0;
        }

        /* ─── Lyrics card ──────────────────────────────────── */
        .np-lyrics-card {
          flex-shrink: 0;
          margin: 0 12px 16px;
          padding: 14px 16px;
          border-radius: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          text-align: center;
        }
        .np-lyrics-hint {
          font-size: 10px; color: rgba(255,255,255,0.2);
          letter-spacing: 0.1em; margin: 0 0 5px;
        }
        .np-lyrics-track {
          font-size: 14px; font-weight: 700; color: #00ff85;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          text-shadow: 0 0 8px rgba(0,255,133,0.3);
          margin: 0 0 3px;
        }
        .np-lyrics-album {
          font-size: 11px; color: rgba(255,255,255,0.2);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin: 0;
        }

        /* ─── Scrollbar ────────────────────────────────────── */
        .np-scrollbar::-webkit-scrollbar { width: 3px; }
        .np-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12); border-radius: 3px;
        }
        .np-scrollbar::-webkit-scrollbar-track { background: transparent; }

        /* ─── Slide-up entry ───────────────────────────────── */
        .np-root { animation: np-slideup 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes np-slideup {
          from { transform: translateY(100vh); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        /* ─── Mobile adjustments ───────────────────────────── */
        @media (max-width: 600px) {
          .np-center { padding: 12px 16px 20px; gap: 0; }
          .np-orbit-rings { margin-bottom: -150px; }
          .np-ring-1 { width: 220px; height: 220px; }
          .np-ring-2 { width: 250px; height: 250px; }
          .np-primary-controls { gap: 20px; }
          .np-play-btn { width: 56px; height: 56px; }
          .np-progress-area { max-width: 100%; }
          .np-secondary-controls { gap: 16px; }
        }
      `}</style>
    </div>
  );
}
