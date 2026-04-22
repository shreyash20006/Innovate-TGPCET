import React, { useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { getSocket } from '../lib/socket';
import { useAuthStore, useRoomStore, usePlayerStore, useChatStore, type Room, type Message, type Track } from '../store';
import SyncedPlayer from '../components/SyncedPlayer';
import ChatPanel from '../components/ChatPanel';
import TrackSearch from '../components/TrackSearch';
import Queue from '../components/Queue';
import CoupleFeatures from '../components/CoupleFeatures';
import { ArrowLeft, Wifi, WifiOff, Music, MessageCircle, ListMusic, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'player' | 'chat' | 'queue' | 'couple';

export default function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { room, partnerOnline, setRoom, setPartnerOnline } = useRoomStore();
  const { setQueue, setCurrentIndex, setIsPlaying, setCurrentTime, setIsSyncing } = usePlayerStore();
  const { setMessages, addMessage, setPartnerTyping } = useChatStore();
  const [tab, setTab] = React.useState<Tab>('player');

  // Load room + history on mount
  useEffect(() => {
    if (!code || !profile) return;

    (async () => {
      const { data: roomData, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code)
        .single();
      if (error || !roomData) {
        toast.error('Room not found');
        navigate('/');
        return;
      }
      setRoom(roomData as Room);

      // Load message history
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomData.id)
        .order('created_at', { ascending: true })
        .limit(100);
      if (msgs) setMessages(msgs as Message[]);
    })();
  }, [code, profile]);

  // Socket events
  useEffect(() => {
    if (!room || !profile) return;
    const socket = getSocket();

    socket.emit('join-room', { roomId: room.id, userId: profile.id, username: profile.username });

    socket.on('partner-online', () => setPartnerOnline(true));
    socket.on('partner-offline', () => setPartnerOnline(false));

    socket.on('play-state', ({ isPlaying, currentTime }: { isPlaying: boolean; currentTime: number }) => {
      setIsSyncing(true);
      setIsPlaying(isPlaying);
      setCurrentTime(currentTime);
      setTimeout(() => setIsSyncing(false), 500);
    });

    socket.on('seek', ({ currentTime }: { currentTime: number }) => {
      setCurrentTime(currentTime);
    });

    socket.on('track-change', ({ track, index }: { track: Track; index: number }) => {
      setCurrentIndex(index);
      setIsPlaying(true);
    });

    socket.on('queue-update', ({ queue }: { queue: Track[] }) => {
      setQueue(queue);
    });

    socket.on('message', (msg: Message) => {
      addMessage(msg);
    });

    socket.on('typing', ({ typing }: { typing: boolean }) => {
      setPartnerTyping(typing);
    });

    return () => {
      socket.emit('leave-room', { roomId: room.id, userId: profile.id });
      socket.off('partner-online');
      socket.off('partner-offline');
      socket.off('play-state');
      socket.off('seek');
      socket.off('track-change');
      socket.off('queue-update');
      socket.off('message');
      socket.off('typing');
    };
  }, [room, profile]);

  const tabs: { id: Tab; icon: typeof Music; label: string }[] = [
    { id: 'player', icon: Music, label: 'Player' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'queue', icon: ListMusic, label: 'Queue' },
    { id: 'couple', icon: Heart, label: 'Us' },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d14] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="font-semibold text-white text-sm">{room?.name || 'Loading...'}</div>
            <div className="text-xs text-white/40 font-mono tracking-widest">{code}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: partnerOnline ? [1, 1.2, 1] : 1 }}
            transition={{ repeat: partnerOnline ? Infinity : 0, duration: 2 }}
          >
            {partnerOnline ? (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                <Wifi className="w-3.5 h-3.5" />
                <span>Partner online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-white/30 text-xs">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Waiting...</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {tab === 'player' && <SyncedPlayer />}
            {tab === 'chat' && <ChatPanel />}
            {tab === 'queue' && (
              <div className="flex flex-col h-full overflow-y-auto">
                <TrackSearch />
                <Queue />
              </div>
            )}
            {tab === 'couple' && <CoupleFeatures />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="shrink-0 border-t border-white/5 bg-[#0d0d14]">
        <div className="flex">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all ${
                tab === id ? 'text-brand-pink' : 'text-white/30 hover:text-white/60'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{label}</span>
              {tab === id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 w-8 h-0.5 gradient-pink-purple rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
