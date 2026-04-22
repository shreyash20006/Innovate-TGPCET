import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Plus, Hash, Heart, Headphones, Zap, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function nanoid(n = 6) {
  return Math.random().toString(36).substring(2, 2 + n).toUpperCase();
}

export default function LandingPage() {
  const [roomCode, setRoomCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  async function createRoom() {
    setCreating(true);
    try {
      const code = nanoid(6);
      const { data, error } = await supabase
        .from('rooms')
        .insert({ code, name: `${profile?.username}'s Room`, created_by: profile?.id })
        .select()
        .single();
      if (error) throw error;
      navigate(`/room/${data.code}`);
      toast.success('Room created! Share the code 🎵');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function joinRoom() {
    if (!roomCode.trim()) return toast.error('Enter a room code');
    setJoining(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode.toUpperCase())
        .single();
      if (error || !data) throw new Error('Room not found');
      navigate(`/room/${data.code}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setJoining(false);
    }
  }

  const features = [
    { icon: Headphones, label: 'Synced Playback', desc: 'Same timestamp, always' },
    { icon: Heart, label: 'Couple Features', desc: 'Love streaks & dedications' },
    { icon: Zap, label: 'Real-time Chat', desc: 'React with emojis' },
    { icon: Users, label: 'Private Rooms', desc: 'Just the two of you' },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d14] relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-[-30%] left-[20%] w-[600px] h-[600px] rounded-full bg-brand-pink/8 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] rounded-full bg-brand-purple/8 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-pink-purple flex items-center justify-center glow-pink">
            <Music className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">SyncBeat</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-sm hidden sm:block">Hey, {profile?.username} 👋</span>
            <div className="w-8 h-8 rounded-full gradient-pink-purple flex items-center justify-center text-white text-xs font-bold shadow-[0_0_10px_rgba(255,0,102,0.3)]">
              {profile?.username?.[0]?.toUpperCase()}
            </div>
          </div>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="p-2 text-white/30 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}
            className="inline-flex mb-6"
          >
            <Heart className="w-12 h-12 text-brand-pink text-glow-pink heartbeat" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Listen <span className="gradient-text">together</span>,<br />
            feel <span className="gradient-text">together</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Share music in perfect sync with your partner. Same song, same moment, anywhere in the world.
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
          {/* Create */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="glass-strong rounded-2xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-pink-purple flex items-center justify-center glow-pink">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Create a Room</h2>
                <p className="text-white/40 text-xs">Generate a private room code</p>
              </div>
            </div>
            <motion.button
              onClick={createRoom} disabled={creating}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full gradient-pink-purple text-white font-semibold py-3 rounded-xl glow-pink disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Room 🎵'}
            </motion.button>
          </motion.div>

          {/* Join */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="glass-strong rounded-2xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center">
                <Hash className="w-5 h-5 text-brand-purple" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Join a Room</h2>
                <p className="text-white/40 text-xs">Enter your partner's room code</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && joinRoom()}
                placeholder="ABCDEF"
                maxLength={6}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-purple font-mono tracking-widest text-center uppercase text-sm"
              />
              <motion.button
                onClick={joinRoom} disabled={joining}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-4 py-3 bg-brand-purple/20 border border-brand-purple/40 text-brand-purple rounded-xl hover:bg-brand-purple/30 transition-all font-semibold text-sm disabled:opacity-50"
              >
                {joining ? '...' : 'Join'}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
              className="glass rounded-xl p-4 text-center"
            >
              <f.icon className="w-6 h-6 text-brand-pink mx-auto mb-2" />
              <div className="text-white text-sm font-medium">{f.label}</div>
              <div className="text-white/40 text-xs mt-1">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
