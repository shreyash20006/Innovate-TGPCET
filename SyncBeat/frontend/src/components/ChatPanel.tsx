import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile } from 'lucide-react';
import { useChatStore, useAuthStore, useRoomStore } from '../store';
import { getSocket } from '../lib/socket';
import { supabase } from '../lib/supabase';
import type { Message } from '../store';

const EMOJIS = ['❤️','🎵','😍','🔥','💕','✨','🎶','😂','😭','💯'];

function EmojiFloat({ emoji, id }: { emoji: string; id: string }) {
  return (
    <motion.div
      key={id}
      className="fixed bottom-20 right-6 text-3xl pointer-events-none z-50"
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{ y: -80, opacity: 0, scale: 0.5 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    >
      {emoji}
    </motion.div>
  );
}

export default function ChatPanel() {
  const { messages, partnerTyping, addMessage, setPartnerTyping } = useChatStore();
  const { profile } = useAuthStore();
  const { room } = useRoomStore();
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleType(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
    if (!room) return;
    const socket = getSocket();
    socket.emit('typing', { roomId: room.id, typing: true });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing', { roomId: room.id, typing: false });
    }, 1500);
  }

  async function sendMessage(content = text, type: Message['type'] = 'text') {
    if (!content.trim() || !room || !profile) return;
    setText('');
    const socket = getSocket();
    socket.emit('typing', { roomId: room.id, typing: false });

    const msg: Message = {
      id: crypto.randomUUID(),
      room_id: room.id,
      user_id: profile.id,
      username: profile.username,
      avatar_url: profile.avatar_url,
      content,
      created_at: new Date().toISOString(),
      type,
    };

    addMessage(msg);
    socket.emit('message', { roomId: room.id, message: msg });
    await supabase.from('messages').insert(msg);
  }

  function sendEmoji(emoji: string) {
    sendMessage(emoji, 'emoji');
    const id = crypto.randomUUID();
    setFloatingEmojis(p => [...p, { id, emoji }]);
    setTimeout(() => setFloatingEmojis(p => p.filter(e => e.id !== id)), 2000);
    setShowEmoji(false);
  }

  const isMine = (msg: Message) => msg.user_id === profile?.id;

  return (
    <div className="flex flex-col h-full">
      {/* Floating emojis */}
      <AnimatePresence>
        {floatingEmojis.map(e => <EmojiFloat key={e.id} {...e} />)}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-white/30 text-sm pt-12">
            <div className="text-4xl mb-3">💬</div>
            No messages yet. Say hi! 👋
          </div>
        )}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-end gap-2 ${isMine(msg) ? 'flex-row-reverse' : ''}`}
          >
            <div className="w-7 h-7 rounded-full gradient-pink-purple flex items-center justify-center text-white text-xs font-bold shrink-0">
              {msg.username[0].toUpperCase()}
            </div>
            <div className={`max-w-[75%] ${isMine(msg) ? 'items-end' : 'items-start'} flex flex-col`}>
              <div
                className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.type === 'dedication'
                    ? 'bg-brand-pink/20 border border-brand-pink/40 text-brand-pink'
                    : msg.type === 'emoji'
                    ? 'bg-transparent text-3xl'
                    : isMine(msg)
                    ? 'gradient-pink-purple text-white'
                    : 'glass text-white'
                } ${isMine(msg) ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
              >
                {msg.content}
              </div>
              <span className="text-white/20 text-[10px] mt-1 px-1">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {partnerTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-full gradient-pink-purple flex items-center justify-center text-white text-xs">💕</div>
              <div className="glass px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 bg-white/50 rounded-full"
                    animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-4 pb-2"
          >
            <div className="glass-strong rounded-2xl p-3 flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => sendEmoji(e)}
                  className="text-2xl hover:scale-125 transition-transform active:scale-100">
                  {e}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="px-4 pb-4 flex gap-2 shrink-0">
        <button onClick={() => setShowEmoji(v => !v)}
          className={`w-10 h-10 rounded-xl glass flex items-center justify-center transition-colors ${showEmoji ? 'text-brand-pink' : 'text-white/40 hover:text-white'}`}>
          <Smile className="w-5 h-5" />
        </button>
        <input
          value={text} onChange={handleType}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Send a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-pink text-sm"
        />
        <motion.button
          onClick={() => sendMessage()}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl gradient-pink-purple flex items-center justify-center glow-pink"
        >
          <Send className="w-4 h-4 text-white" />
        </motion.button>
      </div>
    </div>
  );
}
