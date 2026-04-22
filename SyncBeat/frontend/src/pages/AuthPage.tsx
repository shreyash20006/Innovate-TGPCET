import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Heart, Mail, Lock, User, Eye, EyeOff, Chrome } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'signin') {
        await signIn(email, password);
        toast.success('Welcome back! 💕');
        navigate('/');
      } else {
        if (username.trim().length < 2) throw new Error('Username too short');
        await signUp(email, password, username);
        toast.success('Account created! Check your email 🎵');
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0d0d14]">
      {/* Ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-pink/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-purple/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-pink-purple mb-4 glow-pink"
          >
            <Music className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text">SyncBeat</h1>
          <p className="text-white/40 text-sm mt-1">Listen together, feel together 💕</p>
        </div>

        <div className="glass-strong rounded-2xl p-6">
          {/* Tabs */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-6">
            {(['signin', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === t ? 'gradient-pink-purple text-white shadow-lg' : 'text-white/50 hover:text-white'
                }`}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {tab === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text" value={username} onChange={e => setUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-pink transition-colors text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-pink transition-colors text-sm"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-pink transition-colors text-sm"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full gradient-pink-purple text-white font-semibold py-3 rounded-xl glow-pink disabled:opacity-50 transition-all text-sm"
            >
              {loading ? 'Loading...' : tab === 'signin' ? 'Sign In 🎵' : 'Create Account 💕'}
            </motion.button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-white/30 bg-[#13131f]">or continue with</span>
            </div>
          </div>

          <motion.button
            onClick={handleGoogle}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white py-3 rounded-xl hover:bg-white/10 transition-all text-sm font-medium"
          >
            <Chrome className="w-4 h-4" /> Google
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
