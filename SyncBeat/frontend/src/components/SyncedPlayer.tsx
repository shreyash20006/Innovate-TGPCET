import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Heart
} from 'lucide-react';
import { usePlayerStore, useRoomStore, useChatStore } from '../store';
import { getSocket } from '../lib/socket';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store';

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Waveform animation bars
function Waveform({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-center gap-[3px] h-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-brand-pink"
          animate={playing ? { height: [4, 20, 8, 16, 4] } : { height: 4 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function SyncedPlayer() {
  const {
    queue, currentIndex, isPlaying, currentTime, volume, isSyncing,
    setIsPlaying, setCurrentTime, setCurrentIndex, setVolume
  } = usePlayerStore();
  const { room } = useRoomStore();
  const { profile } = useAuthStore();
  const { addMessage } = useChatStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const seeking = useRef(false);
  const lastEmit = useRef(0);

  const track = queue[currentIndex] ?? null;

  // Sync audio element with store
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    if (track.source === 'local') {
      audio.src = track.sourceId;
    } else {
      // For Spotify/YouTube, we just show UI — actual playback via iframe
      audio.src = '';
    }

    audio.load();
    if (isPlaying) audio.play().catch(() => {});
  }, [track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.play().catch(() => {}); }
    else { audio.pause(); }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || seeking.current) return;
    if (Math.abs(audio.currentTime - currentTime) > 1) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  // Emit play/pause to partner
  function emitPlayState(playing: boolean, time: number) {
    if (!room) return;
    const socket = getSocket();
    socket.emit('play-state', { roomId: room.id, isPlaying: playing, currentTime: time });
  }

  function togglePlay() {
    const audio = audioRef.current;
    const newPlaying = !isPlaying;
    const time = audio?.currentTime ?? currentTime;
    setIsPlaying(newPlaying);
    emitPlayState(newPlaying, time);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value);
    seeking.current = true;
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
    // Debounce emit
    clearTimeout(lastEmit.current as any);
    (lastEmit as any).current = setTimeout(() => {
      if (!room) return;
      getSocket().emit('seek', { roomId: room.id, currentTime: t });
      seeking.current = false;
    }, 300);
  }

  function next() {
    const idx = Math.min(currentIndex + 1, queue.length - 1);
    setCurrentIndex(idx);
    if (!room) return;
    getSocket().emit('track-change', { roomId: room.id, index: idx, track: queue[idx] });
  }

  function prev() {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const idx = Math.max(currentIndex - 1, 0);
    setCurrentIndex(idx);
    if (!room) return;
    getSocket().emit('track-change', { roomId: room.id, index: idx, track: queue[idx] });
  }

  // Dedicate current song
  async function dedicateSong() {
    if (!track || !room || !profile) return;
    const msg = {
      id: crypto.randomUUID(),
      room_id: room.id,
      user_id: profile.id,
      username: profile.username,
      avatar_url: profile.avatar_url,
      content: `💝 Dedicated "${track.title}" by ${track.artist} to you`,
      created_at: new Date().toISOString(),
      type: 'dedication' as const,
    };
    await supabase.from('messages').insert(msg);
    getSocket().emit('message', { roomId: room.id, message: msg });
    addMessage(msg);
  }

  const duration = track?.duration ?? 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-between h-full px-4 py-6 overflow-y-auto">
      {/* Album Art */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto gap-6">
        <motion.div
          animate={isPlaying ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative"
        >
          <div className="w-64 h-64 rounded-3xl overflow-hidden glow-pink shadow-2xl">
            {track?.artwork ? (
              <img src={track.artwork} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full gradient-pink-purple flex items-center justify-center">
                <div className="text-6xl">🎵</div>
              </div>
            )}
          </div>
          {/* Live sync indicator */}
          {isSyncing && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 text-xs">
              ↔ syncing
            </div>
          )}
        </motion.div>

        {/* Track Info */}
        <div className="w-full text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <Waveform playing={isPlaying && !!track} />
          </div>
          <h2 className="text-white font-bold text-xl truncate">{track?.title ?? 'Nothing playing'}</h2>
          <p className="text-white/50 text-sm">{track?.artist ?? 'Add a track to start'}</p>
          <p className="text-white/30 text-xs mt-0.5">{track?.album}</p>
        </div>

        {/* Seekbar */}
        <div className="w-full space-y-1">
          <input
            type="range" min={0} max={duration || 100} value={currentTime}
            onChange={handleSeek}
            className="w-full accent-brand-pink h-1"
            style={{
              background: `linear-gradient(to right, #ff2d78 ${progress}%, rgba(255,255,255,0.1) ${progress}%)`,
            }}
          />
          <div className="flex justify-between text-xs text-white/30 font-mono">
            <span>{fmtTime(currentTime)}</span>
            <span>{fmtTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-sm space-y-4">
        {/* Main Controls */}
        <div className="flex items-center justify-center gap-6">
          <button onClick={prev} className="text-white/50 hover:text-white transition-colors">
            <SkipBack className="w-6 h-6" />
          </button>

          <motion.button
            onClick={togglePlay}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full gradient-pink-purple flex items-center justify-center glow-pink shadow-xl"
          >
            {isPlaying ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white ml-1" />}
          </motion.button>

          <button onClick={next} className="text-white/50 hover:text-white transition-colors">
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Volume + Dedicate */}
        <div className="flex items-center gap-4">
          <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} className="text-white/40 hover:text-white">
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range" min={0} max={1} step={0.01} value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="flex-1"
          />
          <motion.button
            onClick={dedicateSong}
            whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
            className="text-brand-pink hover:text-white transition-colors"
          >
            <Heart className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (!seeking.current && audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onEnded={next}
      />
    </div>
  );
}
