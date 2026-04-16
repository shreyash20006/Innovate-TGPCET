import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Info, ShieldAlert, Heart, Mail, Instagram, Send, MessageCircle } from 'lucide-react';

const TiltCard = ({ children }: { children: React.ReactNode }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      className="relative w-full"
    >
      <div style={{ transform: "translateZ(50px)" }} className="w-full">
        {children}
      </div>
    </motion.div>
  );
};

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-2xl mb-4">
            <Info className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">About Us</h1>
        </div>

        {/* 3D Community Section */}
        <TiltCard>
          <section className="text-center w-full">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 md:p-12 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
              
              {/* 3D floating elements inside the card */}
              <motion.div style={{ transform: "translateZ(30px)" }}>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4 drop-shadow-lg">🚀 Join Our Community</h2>
              </motion.div>
              
              <motion.div style={{ transform: "translateZ(20px)" }}>
                <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-lg">Join 500+ students getting daily updates</p>
              </motion.div>
              
              <motion.div style={{ transform: "translateZ(40px)" }} className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <a href="https://t.me/innovatetgpcet" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white px-4 py-3 sm:px-8 sm:py-4 rounded-xl font-bold transition-colors text-sm sm:text-base shadow-lg hover:shadow-[#0088cc]/50">
                  <Send className="w-5 h-5" /> Join Telegram
                </a>
                <a href="https://whatsapp.com/channel/0029VbC3hiw6WaKna525w139" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 sm:px-8 sm:py-4 rounded-xl font-bold transition-colors text-sm sm:text-base shadow-lg hover:shadow-[#25D366]/50">
                  <MessageCircle className="w-5 h-5" /> Join WhatsApp
                </a>
              </motion.div>
            </div>
          </section>
        </TiltCard>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-amber-500" /> Our Mission
            </h2>
            <p className="text-slate-300 leading-relaxed text-lg font-medium italic">
              "Helping students access free resources and opportunities."
            </p>
            <p className="text-slate-400 mt-4 leading-relaxed">
              We believe that education and career growth should not be hindered by paywalls. 
              This platform was built to centralize high-quality notes, legitimate internship opportunities, 
              and the latest tech updates—all completely free for students.
            </p>
          </section>

          <hr className="border-slate-800" />

          {/* Contact & Connect Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Mail className="w-6 h-6 text-amber-500" /> Connect With Us
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Email Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-amber-500/50 transition-colors">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-white font-bold mb-2">Email Us</h3>
                <a href="mailto:hello@passionpages.shop" className="text-slate-400 hover:text-amber-500 transition-colors">
                  hello@passionpages.shop
                </a>
              </div>

              {/* Instagram Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-pink-500/50 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold mb-2">Follow on Instagram</h3>
                <a 
                  href="https://www.instagram.com/innovate.tgpcet/?hl=en" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-pink-500/25 flex items-center gap-2"
                >
                  <Instagram className="w-4 h-4" />
                  Follow
                </a>
              </div>
            </div>
          </section>

          <hr className="border-slate-800" />

          <section className="bg-slate-950 rounded-2xl p-6 border border-slate-800 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-2xl"></div>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" /> Disclaimer
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              This is an <strong className="text-amber-500">unofficial, student-driven platform</strong>. It is not affiliated with, endorsed by, or officially connected to any specific college, university, or organization. 
              <br /><br />
              All notes, links, and opportunities are crowdsourced or curated for informational purposes. We do not charge any fees, and we do not sell any data.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
