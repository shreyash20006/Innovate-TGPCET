import React from 'react';
import { motion, Reorder } from 'framer-motion';
import { Trash2, Music2, GripVertical, Play } from 'lucide-react';
import { usePlayerStore, useRoomStore } from '../store';
import { getSocket } from '../lib/socket';

export default function Queue() {
  const { queue, currentIndex, setQueue, setCurrentIndex, removeFromQueue, setIsPlaying } = usePlayerStore();
  const { room } = useRoomStore();

  function playAt(i: number) {
    setCurrentIndex(i);
    setIsPlaying(true);
    if (!room) return;
    getSocket().emit('track-change', { roomId: room.id, index: i, track: queue[i] });
  }

  function remove(i: number) {
    removeFromQueue(i);
    const next = queue.filter((_, idx) => idx !== i);
    if (room) getSocket().emit('queue-update', { roomId: room.id, queue: next });
  }

  function onReorder(newQueue: typeof queue) {
    setQueue(newQueue);
    if (room) getSocket().emit('queue-update', { roomId: room.id, queue: newQueue });
  }

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <Music2 className="w-12 h-12 text-white/10 mb-3" />
        <p className="text-white/30 text-sm">Queue is empty</p>
        <p className="text-white/20 text-xs mt-1">Search for tracks above to add them</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/60 text-xs font-medium uppercase tracking-widest">
          Queue ({queue.length})
        </span>
        <button
          onClick={() => { setQueue([]); if (room) getSocket().emit('queue-update', { roomId: room.id, queue: [] }); }}
          className="text-white/30 hover:text-red-400 text-xs transition-colors"
        >
          Clear all
        </button>
      </div>

      <Reorder.Group axis="y" values={queue} onReorder={onReorder} className="space-y-2">
        {queue.map((track, i) => (
          <Reorder.Item key={track.id} value={track}>
            <motion.div
              className={`flex items-center gap-3 glass rounded-xl px-3 py-2.5 cursor-default ${
                i === currentIndex ? 'border-brand-pink/40 bg-brand-pink/5' : ''
              }`}
              whileHover={{ scale: 1.01 }}
            >
              <GripVertical className="w-4 h-4 text-white/20 shrink-0 cursor-grab" />

              <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-white/5 relative">
                {track.artwork
                  ? <img src={track.artwork} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-base">🎵</div>
                }
                {i === currentIndex && (
                  <div className="absolute inset-0 bg-brand-pink/40 flex items-center justify-center">
                    <div className="flex gap-0.5">
                      {[0,1,2].map(b => (
                        <motion.div key={b} className="w-0.5 bg-white rounded"
                          animate={{ height: [4, 14, 4] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: b * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${i === currentIndex ? 'text-brand-pink' : 'text-white'}`}>
                  {track.title}
                </div>
                <div className="text-white/40 text-xs truncate">{track.artist}</div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {i !== currentIndex && (
                  <button onClick={() => playAt(i)} className="text-white/30 hover:text-brand-pink transition-colors">
                    <Play className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => remove(i)} className="text-white/30 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
