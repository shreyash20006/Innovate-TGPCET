import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Flame, Calendar, Star, MoonStar, Gift } from 'lucide-react';
import { useAuthStore, useRoomStore } from '../store';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, color = 'text-brand-pink' }: {
  icon: typeof Heart; label: string; value: string | number; color?: string;
}) {
  return (
    <div className="glass-strong rounded-2xl p-4 flex flex-col items-center gap-2">
      <Icon className={`w-7 h-7 ${color}`} />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-white/40 text-xs text-center">{label}</div>
    </div>
  );
}

export default function CoupleFeatures() {
  const { profile, setProfile } = useAuthStore();
  const { room } = useRoomStore();
  const [streak, setStreak] = useState(profile?.love_streak ?? 0);
  const [anniv, setAnniv] = useState(profile?.anniversary_date ?? '');
  const [missYouActive, setMissYouActive] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [daysToAnniv, setDaysToAnniv] = useState<number | null>(null);

  useEffect(() => {
    if (anniv) {
      const now = new Date();
      const a = new Date(anniv);
      const next = new Date(now.getFullYear(), a.getMonth(), a.getDate());
      if (next < now) next.setFullYear(now.getFullYear() + 1);
      const diff = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setDaysToAnniv(diff);
    }
  }, [anniv]);

  async function saveAnniversary() {
    if (!profile) return;
    await supabase.from('profiles').update({ anniversary_date: anniv }).eq('id', profile.id);
    setProfile({ ...profile, anniversary_date: anniv });
    toast.success('Anniversary saved! 🎉');
  }

  async function incrementStreak() {
    if (!profile) return;
    const newStreak = streak + 1;
    await supabase.from('profiles').update({ love_streak: newStreak }).eq('id', profile.id);
    setProfile({ ...profile, love_streak: newStreak });
    setStreak(newStreak);
    toast.success(`Love streak: ${newStreak} days! 🔥`);
  }

  function activateMissYou() {
    setMissYouActive(true);
    toast('💌 Miss You mode activated — sent to your partner!', { icon: '💕', duration: 4000 });
    setTimeout(() => setMissYouActive(false), 10000);
  }

  return (
    <div className="overflow-y-auto h-full px-4 py-4 space-y-5">
      {/* Header */}
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="inline-block"
        >
          <Heart className="w-10 h-10 text-brand-pink mx-auto heartbeat" />
        </motion.div>
        <h2 className="text-white font-bold text-lg mt-2">Our Space</h2>
        <p className="text-white/40 text-xs">Your couple features & milestones</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Flame} label="Love Streak" value={`${streak} days`} color="text-orange-400" />
        <StatCard icon={Star} label="Songs Shared" value="∞" color="text-yellow-400" />
        {daysToAnniv !== null && (
          <StatCard icon={Calendar} label="Days to Anniv." value={daysToAnniv} color="text-pink-400" />
        )}
        <StatCard icon={Heart} label="Together Since" value={anniv || '—'} />
      </div>

      {/* Streak button */}
      <div className="glass-strong rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-white text-sm font-semibold">Love Streak</span>
        </div>
        <p className="text-white/40 text-xs">Tap every day you listen together to keep your streak alive!</p>
        <motion.button
          onClick={incrementStreak}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
          className="w-full py-3 gradient-pink-purple text-white font-semibold rounded-xl glow-pink text-sm"
        >
          🔥 Check In Today ({streak} days)
        </motion.button>
      </div>

      {/* Anniversary */}
      <div className="glass-strong rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-purple" />
          <span className="text-white text-sm font-semibold">Anniversary Reminder</span>
        </div>
        <input
          type="date"
          value={anniv}
          onChange={e => setAnniv(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-pink text-sm"
        />
        <motion.button
          onClick={saveAnniversary}
          whileTap={{ scale: 0.95 }}
          className="w-full py-2.5 glass border border-brand-purple/40 text-brand-purple rounded-xl text-sm font-medium hover:bg-brand-purple/10 transition-all"
        >
          Save Date 💜
        </motion.button>
        {daysToAnniv !== null && (
          <p className="text-center text-white/50 text-xs">
            🎊 {daysToAnniv === 0 ? "It's today! Happy Anniversary! 🎉" : `${daysToAnniv} days to go!`}
          </p>
        )}
      </div>

      {/* Miss You Mode */}
      <div className="glass-strong rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MoonStar className="w-4 h-4 text-brand-rose" />
          <span className="text-white text-sm font-semibold">Miss You Mode</span>
        </div>
        <p className="text-white/40 text-xs">Send a warm ping to let your partner know you're thinking of them.</p>
        <AnimatePresence>
          {missYouActive ? (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="text-center py-3"
            >
              <div className="text-4xl mb-2">💕</div>
              <div className="text-brand-pink text-sm font-medium">Sent with love...</div>
            </motion.div>
          ) : (
            <motion.button
              onClick={activateMissYou}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-brand-rose/15 border border-brand-rose/30 text-brand-rose rounded-xl text-sm font-semibold hover:bg-brand-rose/25 transition-all"
            >
              💌 Send "Miss You"
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Shared Favorites Placeholder */}
      <div className="glass rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-yellow-400" />
          <span className="text-white text-sm font-semibold">Shared Favorites</span>
          <span className="ml-auto text-xs text-white/30">Coming soon</span>
        </div>
        <p className="text-white/30 text-xs">Heart songs to save them to your shared playlist.</p>
      </div>
    </div>
  );
}
