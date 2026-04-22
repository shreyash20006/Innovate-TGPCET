import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Music2, Youtube, Upload, Plus, X } from 'lucide-react';
import { usePlayerStore, useRoomStore } from '../store';
import { getSocket } from '../lib/socket';
import type { Track } from '../store';
import toast from 'react-hot-toast';

type Source = 'youtube' | 'local';

// Minimal YouTube search via backend proxy
async function searchYouTube(query: string): Promise<Track[]> {
  const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
}

export default function TrackSearch() {
  const [source, setSource] = useState<Source>('youtube');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const { addToQueue, queue } = usePlayerStore();
  const { room } = useRoomStore();

  async function doSearch() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const tracks = await searchYouTube(query);
      setResults(tracks);
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  }

  function addTrack(track: Track) {
    addToQueue(track);
    const socket = getSocket();
    if (room) {
      socket.emit('queue-update', { roomId: room.id, queue: [...queue, track] });
    }
    toast.success(`Added "${track.title}" 🎵`);
  }

  function handleLocalFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const track: Track = {
        id: crypto.randomUUID(),
        title: file.name.replace(/\.[^.]+$/, ''),
        artist: 'Local File',
        album: '',
        artwork: '',
        duration: 0,
        source: 'local',
        sourceId: url,
      };
      addTrack(track);
    });
    e.target.value = '';
  }

  const sources: { id: Source; icon: typeof Music2; label: string }[] = [
    { id: 'youtube', icon: Youtube, label: 'YouTube' },
    { id: 'local', icon: Upload, label: 'Local MP3' },
  ];

  return (
    <div className="px-4 pt-4 pb-2">
      {/* Source selector */}
      <div className="flex gap-2 mb-3">
        {sources.map(s => (
          <button
            key={s.id}
            onClick={() => { setSource(s.id); setResults([]); setQuery(''); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              source === s.id
                ? 'gradient-pink-purple text-white'
                : 'glass text-white/50 hover:text-white'
            }`}
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      {source === 'local' ? (
        <label className="flex items-center justify-center gap-2 w-full py-4 glass-strong rounded-xl border-2 border-dashed border-white/10 hover:border-brand-pink/40 text-white/50 hover:text-white cursor-pointer transition-all">
          <Upload className="w-5 h-5" />
          <span className="text-sm">Click to upload MP3 files</span>
          <input type="file" accept="audio/*" multiple className="hidden" onChange={handleLocalFile} />
        </label>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder={`Search on ${source === 'youtube' ? 'YouTube' : 'Spotify'}...`}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-pink text-sm"
            />
          </div>
          <motion.button
            onClick={doSearch} disabled={searching}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2.5 gradient-pink-purple text-white rounded-xl text-sm font-medium glow-pink disabled:opacity-50"
          >
            {searching ? '...' : 'Search'}
          </motion.button>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2 max-h-72 overflow-y-auto"
          >
            {results.map(track => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 glass rounded-xl px-3 py-2"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5">
                  {track.artwork
                    ? <img src={track.artwork} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{track.title}</div>
                  <div className="text-white/40 text-xs truncate">{track.artist}</div>
                </div>
                <motion.button
                  onClick={() => addTrack(track)}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className="w-7 h-7 rounded-full gradient-pink-purple flex items-center justify-center glow-pink shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
