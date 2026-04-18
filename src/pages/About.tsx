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
        <div className="text-center flex flex-col items-center mb-12">
          <div className="font-mono text-[11px] text-cyber-pink tracking-[0.3em] uppercase flex items-center gap-[16px] mb-[16px] before:content-[''] before:w-[40px] before:h-[1px] before:bg-cyber-pink after:content-[''] after:w-[40px] after:h-[1px] after:bg-cyber-pink">
            System Info
          </div>
          <h1 className="font-display text-[clamp(40px,6vw,72px)] font-[900] leading-[0.95] tracking-[-0.03em] text-cyber-white">
            About <em className="not-italic text-cyber-pink">Us</em>
          </h1>
        </div>

        {/* 3D Community Section */}
        <TiltCard>
          <section className="text-center w-full">
            <div 
              className="bg-cyber-bg2/80 border border-cyber-border p-6 sm:p-8 md:p-12 relative overflow-hidden shadow-[0_0_40px_rgba(255,0,102,0.15)]"
              style={{ clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))' }}
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyber-pink to-cyber-blue"></div>
              
              {/* 3D floating elements inside the card */}
              <motion.div style={{ transform: "translateZ(30px)" }}>
                <h2 className="font-display text-[24px] sm:text-[36px] md:text-[48px] font-[900] text-cyber-white mb-2 sm:mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  <span className="text-cyber-lime">_</span>Join Our Network
                </h2>
              </motion.div>
              
              <motion.div style={{ transform: "translateZ(20px)" }}>
                <p className="font-mono text-[10px] sm:text-[14px] md:text-[16px] text-cyber-muted uppercase tracking-widest mb-6 sm:mb-10">Join 500+ nodes getting daily updates</p>
              </motion.div>
              
              <motion.div style={{ transform: "translateZ(40px)" }} className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                <a href="https://t.me/innovatetgpcet" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-transparent border border-[#0088cc] hover:bg-[#0088cc]/20 text-[#0088cc] px-6 py-4 font-display font-bold uppercase tracking-widest transition-all text-sm shadow-[0_0_20px_rgba(0,136,204,0.2)] hover:shadow-[0_0_30px_rgba(0,136,204,0.5)] cursor-none" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)'}}>
                  <Send className="w-5 h-5" /> Initialize Telegram
                </a>
                <a href="https://whatsapp.com/channel/0029VbC3hiw6WaKna525w139" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-transparent border border-[#25D366] hover:bg-[#25D366]/20 text-[#25D366] px-6 py-4 font-display font-bold uppercase tracking-widest transition-all text-sm shadow-[0_0_20px_rgba(37,211,102,0.2)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] cursor-none" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)'}}>
                  <MessageCircle className="w-5 h-5" /> Initialize WhatsApp
                </a>
              </motion.div>
            </div>
          </section>
        </TiltCard>

        <div className="bg-cyber-bg2/80 border border-cyber-border p-8 md:p-12 space-y-12 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}>
          <div className="absolute top-0 right-0 w-[50px] h-[50px] border-r-2 border-t-2 border-cyber-pink opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-[50px] h-[50px] border-l-2 border-b-2 border-cyber-lime opacity-50"></div>
          
          <section>
            <h2 className="font-display text-[28px] font-[800] text-cyber-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 flex items-center justify-center bg-cyber-pink/20 border border-cyber-pink">
                <Heart className="w-4 h-4 text-cyber-pink" />
              </span>
               Core Directive
            </h2>
            <p className="text-cyber-lime font-mono text-[14px] leading-relaxed tracking-wider border-l-2 border-cyber-lime pl-4 mb-6 uppercase">
              "Bypass paywalls. Accelerate education."
            </p>
            <p className="text-cyber-muted leading-[1.8] text-[15px]">
              We believe that education and career growth should access an open network. 
              This node was built to centralize high-quality data packets, legitimate internships, 
              and the latest tech updates—all decentralized and completely free for users.
            </p>
          </section>

          <hr className="border-cyber-border border-dashed" />

          {/* Contact & Connect Section */}
          <section>
            <h2 className="font-display text-[28px] font-[800] text-cyber-white mb-8 flex items-center gap-3">
              <span className="w-8 h-8 flex items-center justify-center bg-cyber-blue/20 border border-cyber-blue">
                <Mail className="w-4 h-4 text-cyber-blue" />
              </span>
              Establish Uplink
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Email Card */}
              <div className="bg-transparent border border-cyber-border p-6 flex flex-col items-center text-center hover:border-cyber-blue transition-colors group cursor-none" style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}>
                <div className="w-12 h-12 bg-cyber-blue/10 border border-cyber-blue flex items-center justify-center mb-4 group-hover:bg-cyber-blue/20 transition-colors">
                  <Mail className="w-5 h-5 text-cyber-blue" />
                </div>
                <h3 className="font-display text-cyber-white font-[700] mb-2 uppercase tracking-widest">Protocol: Email</h3>
                <a href="mailto:hello@passionpages.shop" className="font-mono text-sm text-cyber-muted hover:text-cyber-blue transition-colors cursor-none">
                  hello@passionpages.shop
                </a>
              </div>

              {/* Instagram Card */}
              <div className="bg-transparent border border-cyber-border p-6 flex flex-col items-center text-center hover:border-[#ff0066] transition-colors group cursor-none" style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}>
                <div className="w-12 h-12 bg-[#ff0066]/10 border border-[#ff0066] flex items-center justify-center mb-4 group-hover:bg-[#ff0066]/20 transition-colors">
                  <Instagram className="w-5 h-5 text-[#ff0066]" />
                </div>
                <h3 className="font-display text-cyber-white font-[700] mb-2 uppercase tracking-widest">Protocol: Instagram</h3>
                <a 
                  href="https://www.instagram.com/innovate.tgpcet/?hl=en" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 px-6 py-2 border border-[#ff0066] text-[#ff0066] hover:bg-[#ff0066] hover:text-black font-mono text-sm uppercase tracking-widest transition-all cursor-none"
                >
                  <Instagram className="w-4 h-4 inline-block mr-2 -mt-1" />
                  Connect
                </a>
              </div>
            </div>
          </section>

          <hr className="border-cyber-border border-dashed" />

          <section className="bg-transparent p-6 border border-cyber-border relative" style={{ clipPath: 'polygon(0 16px, 16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)' }}>
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ff4466]"></div>
            <h2 className="font-display text-[20px] font-[800] text-cyber-white mb-4 flex items-center gap-3 uppercase tracking-wider">
              <ShieldAlert className="w-5 h-5 text-[#ff4466]" /> Legal Override
            </h2>
            <p className="font-mono text-cyber-muted text-[13px] leading-[1.8]">
              This is an <strong className="text-[#ff4466] font-normal">unofficial, root-level node</strong> operated by students. We are not tethered to, endorsed by, or officially connected to any corporate or academic mainframe. 
              <br /><br />
              All data packets and links are crowdsourced. We charge zero credits, and your telemetry is not for sale.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
