import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Menu, X, Home, Briefcase, BookOpen, Cpu, FolderOpen, Calculator, Compass, Info, Moon, Sun, Youtube, Video } from 'lucide-react';
import AIChatbot from './AIChatbot';
import Background3D from './Background3D';
import CustomCursor from './CustomCursor';

const AppLogo = () => (
  <Link to="/" className="flex items-center gap-2 sm:gap-3 group decoration-transparent">
    <div className="min-w-[36px] w-[36px] h-[36px] sm:min-w-[44px] sm:w-[44px] sm:h-[44px] bg-gradient-to-br from-[#ff0066] to-[#880033] flex items-center justify-center text-white font-black text-[11px] sm:text-[13px] tracking-tight relative transition-transform duration-300 group-hover:scale-105" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', animation: 'hexPulse 3s ease-in-out infinite' }}>
      IT
    </div>
    <div className="flex flex-col">
      <span className="text-cyber-white font-[800] text-[15px] sm:text-[17px] leading-none tracking-tight font-display transition-colors">
        innovate.<em className="text-cyber-pink not-italic transition-colors">tgpcet</em>
      </span>
      <span className="text-cyber-muted text-[9px] font-mono tracking-widest uppercase mt-1 transition-colors hidden sm:block">Innovating the Future 🚀</span>
    </div>
  </Link>
);

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('theme-light');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('theme-light');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode(prev => !prev);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Opportunities', path: '/opportunities', icon: Briefcase },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'AI Updates', path: '/ai-updates', icon: Cpu },
    { name: 'Resources', path: '/resources', icon: FolderOpen },
    { name: 'CGPA Calc', path: '/cgpa-calculator', icon: Calculator },
    { name: 'Career Guide', path: '/career-guide.html', external: true, icon: Compass },
    { name: 'YouTube', path: 'https://www.youtube.com/channel/UCklqMwCH9yn4KngY6SXyeAQ', external: true, icon: Youtube },
    { name: 'About', path: '/about', icon: Info },
  ];

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen text-cyber-white font-body flex flex-col relative z-20">
      <CustomCursor />
      <Background3D />
      
      {/* Ticker Bar */}
      <div className="border-b border-cyber-border bg-cyber-pink/5 py-[9px] overflow-hidden relative flex items-center print:hidden z-50">
        <div className="absolute left-0 z-10 px-4 flex items-center gap-2 h-full bg-cyber-bg/80 backdrop-blur-md border-r border-cyber-border">
          <span className="animate-blink text-cyber-lime font-mono text-xs">◆</span>
          <span className="font-bold text-cyber-pink text-[11px] uppercase tracking-widest font-mono hidden sm:inline-block">LIVE:</span>
        </div>
        <motion.div
          className="whitespace-nowrap flex font-mono text-[11px] text-cyber-pink uppercase tracking-widest ml-12 sm:ml-24"
          animate={{ x: [0, -2000] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        >
          <span className="inline-flex items-center gap-2 px-10"><span className="text-[6px]">◆</span> 🚀 New Internship Open</span>
          <span className="inline-flex items-center gap-2 px-10"><span className="text-[6px]">◆</span> 🤖 AI Tool Released</span>
          <span className="inline-flex items-center gap-2 px-10"><span className="text-[6px]">◆</span> 💼 Hiring Update</span>
          <span className="inline-flex items-center gap-2 px-10"><span className="text-[6px]">◆</span> 🎯 Hackathon Live</span>
          <span className="inline-flex items-center gap-2 px-10"><span className="text-[6px]">◆</span> 🚀 New Internship Open</span>
          <span className="inline-flex items-center gap-2 px-10"><span className="text-[6px]">◆</span> 🤖 AI Tool Released</span>
          <span className="inline-flex items-center gap-2 px-10"><span className="text-[6px]">◆</span> 💼 Hiring Update</span>
          <span className="inline-flex items-center gap-2 px-10"><span className="text-[6px]">◆</span> 🎯 Hackathon Live</span>
        </motion.div>
      </div>

      {/* Navbar */}
      <nav className={`sticky top-0 z-40 transition-all duration-300 print:hidden h-[68px] ${scrolled ? "bg-cyber-bg/90 backdrop-blur-[24px] border-b border-cyber-border shadow-lg" : "bg-transparent border-transparent"}`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-[60px] h-full flex items-center justify-between">
          <AppLogo />
          
          <div className="hidden md:flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider font-body">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.name}
                  href={link.path}
                  target={link.path.startsWith('http') ? '_blank' : undefined}
                  rel={link.path.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="px-[13px] py-[8px] rounded-md text-cyber-muted hover:text-cyber-white transition-colors"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-[13px] py-[8px] rounded-md transition-colors ${
                    location.pathname === link.path ? 'text-cyber-pink bg-cyber-border/30 border border-cyber-border' : 'text-cyber-muted hover:text-cyber-white'
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}
            
            <button 
              onClick={toggleTheme}
              className="ml-2 p-2 text-cyber-muted hover:text-cyber-pink transition-colors cursor-none overflow-hidden"
              title="Toggle Theme"
            >
              <AnimatePresence mode="wait">
                {isLightMode ? (
                  <motion.div
                    key="sun"
                    initial={{ y: 20, opacity: 0, rotate: 90 }}
                    animate={{ y: 0, opacity: 1, rotate: 360 }}
                    exit={{ y: -20, opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ y: 20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 360 }}
                    exit={{ y: -20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <button className="ml-4 px-[22px] py-[9px] bg-cyber-pink text-white font-display text-[13px] font-bold uppercase tracking-wide rounded-lg cursor-none hover:bg-cyber-white hover:text-cyber-pink transition-all duration-200 shadow-[0_0_20px_rgba(255,0,102,0.4)] hover:shadow-[0_0_30px_rgba(255,0,102,0.5)] hover:-translate-y-[1px]">
              Get Opportunities →
            </button>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="text-cyber-muted hover:text-cyber-pink transition-colors cursor-none overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {isLightMode ? (
                  <motion.div
                    key="sun-mobile"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon-mobile"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <button 
              className="text-cyber-muted hover:text-cyber-white transition-colors cursor-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-cyber-bg2 border-b border-cyber-border overflow-hidden"
            >
              <div className="px-4 py-6 grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  
                  const content = (
                    <>
                      <Icon className={`w-6 h-6 mb-2 transition-colors ${isActive ? 'text-amber-500' : 'text-slate-400 group-hover:text-amber-400'}`} />
                      <span className="text-sm font-bold text-center leading-tight">{link.name}</span>
                    </>
                  );

                  const className = `flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 group ${
                    isActive 
                      ? 'bg-cyber-border border-cyber-border text-cyber-pink shadow-[0_0_15px_rgba(255,0,102,0.1)]' 
                      : 'bg-cyber-bg border-cyber-border/30 text-cyber-muted hover:bg-cyber-bg2 hover:border-cyber-border hover:text-cyber-white'
                  }`;

                  return link.external ? (
                    <a key={link.name} href={link.path} target={link.path.startsWith('http') ? '_blank' : undefined} rel={link.path.startsWith('http') ? 'noopener noreferrer' : undefined} className={className}>
                      {content}
                    </a>
                  ) : (
                    <Link key={link.name} to={link.path} className={className}>
                      {content}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-grow relative z-30">
        <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.15, type: "tween" }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-border bg-cyber-bg/80 py-[60px] sm:py-[100px] px-5 sm:px-[60px] mt-20 relative z-30 print:hidden backdrop-blur-md overflow-hidden">
        <div className="w-full flex flex-col items-start text-left">
          <div className="font-display font-[900] text-[clamp(40px,12vw,180px)] leading-[0.85] tracking-[-0.05em] text-transparent mb-[40px] sm:mb-[80px] pointer-events-none break-words w-full text-left" style={{ WebkitTextStroke: '2px var(--color-cyber-border)' }}>
            innovate<br className="sm:hidden" /><span className="hidden sm:inline"> </span>tgpcet
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start justify-start mb-8 sm:mb-12">
            <a 
              href="https://www.youtube.com/channel/UCklqMwCH9yn4KngY6SXyeAQ" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-cyber-muted hover:text-cyber-pink transition-colors flex items-center gap-2"
            >
              <Youtube size={20} />
              <span className="font-mono text-xs uppercase tracking-wider font-bold">Subscribe to our Channel</span>
            </a>
            <a 
              href="https://youtu.be/TAXVZTU2BZg" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-cyber-muted hover:text-cyber-pink transition-colors flex items-center gap-2"
            >
              <Video size={20} />
              <span className="font-mono text-xs uppercase tracking-wider font-bold">Watch Latest Video</span>
            </a>
          </div>

          <div className="w-full flex-col sm:flex-row flex justify-between items-start sm:items-center border-t border-cyber-border pt-[32px] gap-4">
            <div className="font-mono text-[11px] text-cyber-muted tracking-widest text-left">
              © {new Date().getFullYear()} <em className="text-cyber-pink not-italic">innovate.tgpcet</em> · All rights reserved
            </div>
            <div className="font-mono text-[10px] text-cyber-muted/60 sm:text-right text-left max-w-[400px] leading-[1.6]">
              Unofficial hub created by students, for students.<br/>
              Not affiliated with any corporate entity. Resources for informational purposes only.
            </div>
          </div>
        </div>
      </footer>

      <div className="print:hidden z-50 relative">
        <AIChatbot />
      </div>
    </div>
  );
}
