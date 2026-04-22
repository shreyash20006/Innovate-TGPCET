import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Simple mock login for the Admin Dashboard
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      if (email === 'admin@innovate.com' && password === 'admin123') {
        localStorage.setItem('admin_auth', 'true');
        const origin = (location.state as any)?.from?.pathname || '/admin';
        navigate(origin);
      } else {
        alert('Invalid credentials. (Hint: admin@innovate.com / admin123)');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center px-4 py-20 relative overflow-hidden bg-cyber-bg">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyber-pink/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyber-lime/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="border border-cyber-border bg-cyber-bg2/80 backdrop-blur-2xl p-8 md:p-10 relative overflow-hidden"
             style={{ clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))' }}>
          
          {/* Top terminal-style bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-pink to-transparent"></div>
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-cyber-pink/10 border border-cyber-pink/30 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,0,102,0.2)]">
              <ShieldCheck className="w-8 h-8 text-cyber-pink" />
            </div>
            <h1 className="font-display text-3xl font-black text-cyber-white tracking-tight uppercase">
              Admin <span className="text-cyber-pink">Access</span>
            </h1>
            <p className="text-cyber-muted font-mono text-[11px] mt-2 tracking-widest uppercase">
              Secure Terminal Gateway // v1.0.4
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-cyber-muted tracking-[0.2em] uppercase ml-1">Identity Identifier</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted group-focus-within:text-cyber-pink transition-colors" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-cyber-bg border border-cyber-border p-4 pl-12 text-cyber-white outline-none focus:border-cyber-pink transition-all font-mono text-sm"
                  placeholder="admin@innovate.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-cyber-muted tracking-[0.2em] uppercase ml-1">Access Protocol</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted group-focus-within:text-cyber-pink transition-colors" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-cyber-bg border border-cyber-border p-4 pl-12 text-cyber-white outline-none focus:border-cyber-pink transition-all font-mono text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="mt-4 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-cyber-pink translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative border border-cyber-pink p-4 flex items-center justify-center gap-3 bg-transparent text-cyber-pink group-hover:text-cyber-white font-display font-bold uppercase tracking-[0.2em] transition-colors duration-300">
                {isLoading ? (
                  <Cpu className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Initialize Session <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-cyber-border/50 text-center">
            <p className="text-[10px] font-mono text-cyber-muted/60 leading-relaxed uppercase tracking-wider">
              Warning: Unauthorized access attempts are logged.<br/>
              Encryption: AES-256-GCM Active.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
