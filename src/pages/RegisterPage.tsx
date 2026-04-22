import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MessageSquare, ArrowRight, Sparkles, Shield } from 'lucide-react';
import { sendToWebhook } from '../utils/webhookService';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await sendToWebhook('REGISTRATION', formData);
      setIsSuccess(true);
    } catch (err) {
      alert('Registration failed. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center px-4 bg-cyber-bg overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 border border-cyber-lime bg-cyber-lime/5 max-w-lg relative"
          style={{ clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))' }}
        >
          <div className="w-20 h-20 bg-cyber-lime/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-cyber-lime" />
          </div>
          <h2 className="text-3xl font-black text-cyber-white uppercase tracking-tighter mb-4">Application Received</h2>
          <p className="text-cyber-muted font-mono text-sm leading-relaxed mb-8 uppercase tracking-widest">
            Your data has been securely transmitted to our neural network. <br/>
            Expect a response within 24 standard hours.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-cyber-lime text-black font-display font-bold uppercase tracking-widest hover:bg-white transition-colors"
          >
            Return to Terminal
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-68px)] py-20 px-4 relative bg-cyber-bg overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyber-pink/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyber-blue/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Left Side: Info */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-cyber-pink/30 bg-cyber-pink/5 text-cyber-pink font-mono text-[10px] uppercase tracking-[0.2em] mb-8">
            <Shield className="w-3 h-3" /> Secure Enrollment
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black text-cyber-white mb-6 uppercase tracking-tight">
            Join the <span className="text-cyber-pink">Innovate</span> <br/> 
            <span className="text-transparent" style={{ WebkitTextStroke: '1px var(--color-cyber-pink)' }}>Ecosystem</span>
          </h1>
          <p className="text-cyber-muted text-lg max-w-md leading-relaxed mb-10">
            Gain exclusive access to high-tier internships, global hackathons, and a community of elite engineering students.
          </p>
          
          <div className="space-y-6">
            {[
              { label: 'Network Access', desc: 'Connect with industry mentors and alumni.' },
              { label: 'Priority Alerts', desc: 'Get notified before opportunities go public.' },
              { label: 'Resource Vault', desc: 'Premium courses and study materials.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-10 h-10 border border-cyber-border bg-cyber-bg2 flex items-center justify-center text-cyber-pink font-mono text-sm group-hover:border-cyber-pink transition-colors">
                  0{i + 1}
                </div>
                <div>
                  <h4 className="text-cyber-white font-bold uppercase tracking-wider text-sm">{item.label}</h4>
                  <p className="text-cyber-muted text-xs font-mono mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-cyber-pink to-cyber-blue opacity-20 blur-xl"></div>
          <div 
            className="relative border border-cyber-border bg-cyber-bg2/80 backdrop-blur-xl p-10"
            style={{ clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))' }}
          >
            <h3 className="font-display text-2xl font-black text-cyber-white mb-8 uppercase tracking-widest">
              Identity <span className="text-cyber-pink">Verification</span>
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 group">
                <label className="font-mono text-[10px] text-cyber-muted tracking-[0.2em] uppercase ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted group-focus-within:text-cyber-pink transition-colors" />
                  <input 
                    type="text" required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-cyber-bg border border-cyber-border p-4 pl-12 text-cyber-white outline-none focus:border-cyber-pink font-mono text-sm"
                    placeholder="ENTER_NAME"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="font-mono text-[10px] text-cyber-muted tracking-[0.2em] uppercase ml-1">College Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted group-focus-within:text-cyber-pink transition-colors" />
                  <input 
                    type="email" required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-cyber-bg border border-cyber-border p-4 pl-12 text-cyber-white outline-none focus:border-cyber-pink font-mono text-sm"
                    placeholder="STUDENT@TGPCET.COM"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="font-mono text-[10px] text-cyber-muted tracking-[0.2em] uppercase ml-1">Contact Link</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted group-focus-within:text-cyber-pink transition-colors" />
                  <input 
                    type="text" required
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-cyber-bg border border-cyber-border p-4 pl-12 text-cyber-white outline-none focus:border-cyber-pink font-mono text-sm"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="font-mono text-[10px] text-cyber-muted tracking-[0.2em] uppercase ml-1">Core Interests</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-cyber-muted group-focus-within:text-cyber-pink transition-colors" />
                  <textarea 
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-cyber-bg border border-cyber-border p-4 pl-12 text-cyber-white outline-none focus:border-cyber-pink font-mono text-sm h-28 resize-none"
                    placeholder="DESCRIBE_GOALS..."
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-cyber-pink text-white font-display font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-cyber-lime hover:text-black transition-all group"
              >
                {isSubmitting ? 'Transmitting...' : (
                  <>
                    Initialize Registration <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
