import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Briefcase, BookOpen, Cpu, FolderOpen, Calculator, Compass, Info } from 'lucide-react';
import FeedbackWidget from './FeedbackWidget';
import CustomLogo from './Logo';

const AppLogo = () => (
  <Link to="/" className="flex items-center gap-3 group">
    <CustomLogo className="w-12 h-12 sm:w-14 sm:h-14 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_10px_rgba(234,179,8,0.2)]" />
    <div className="flex flex-col">
      <span className="text-white font-bold text-lg sm:text-xl leading-none tracking-tight">innovate.tgpcet</span>
      <span className="text-slate-400 text-[10px] sm:text-xs font-medium tracking-wider uppercase">Innovating the Future 🚀</span>
    </div>
  </Link>
);

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Opportunities', path: '/opportunities', icon: Briefcase },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'AI Updates', path: '/ai-updates', icon: Cpu },
    { name: 'Resources', path: '/resources', icon: FolderOpen },
    { name: 'CGPA Calc', path: '/cgpa-calculator', icon: Calculator },
    { name: 'Career Guide', path: '/career-guide.html', external: true, icon: Compass },
    { name: 'About', path: '/about', icon: Info },
  ];

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-amber-500/30 flex flex-col relative">
      {/* Ticker Bar */}
      <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-sm font-medium overflow-hidden relative flex items-center print:hidden">
        <div className="absolute left-0 z-10 bg-amber-500 px-4 flex items-center gap-2 h-full shadow-[10px_0_20px_rgba(245,158,11,1)]">
          <span className="animate-pulse">🔥</span>
          <span className="font-bold">HOT:</span>
        </div>
        <motion.div
          className="whitespace-nowrap ml-24"
          animate={{ x: [0, -2000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          🚀 New Internship Open &nbsp;&nbsp;•&nbsp;&nbsp; 🤖 AI Tool Released &nbsp;&nbsp;•&nbsp;&nbsp; 💼 Hiring Update &nbsp;&nbsp;•&nbsp;&nbsp; 🎯 Hackathon Live &nbsp;&nbsp;•&nbsp;&nbsp; 🚀 New Internship Open &nbsp;&nbsp;•&nbsp;&nbsp; 🤖 AI Tool Released &nbsp;&nbsp;•&nbsp;&nbsp; 💼 Hiring Update &nbsp;&nbsp;•&nbsp;&nbsp; 🎯 Hackathon Live
        </motion.div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <AppLogo />
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.name}
                  href={link.path}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`${
                    location.pathname === link.path ? 'text-amber-500' : 'text-slate-400 hover:text-white'
                  } transition-colors`}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          <button 
            className="md:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-900 border-b border-slate-800 overflow-hidden"
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
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,166,35,0.1)]' 
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700 hover:text-white'
                  }`;

                  return link.external ? (
                    <a key={link.name} href={link.path} className={className}>
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
      <main className="flex-grow relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 mt-20 relative z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-4">
          <p className="text-slate-400 text-sm max-w-2xl">
            This is an unofficial hub created by students, for students. <br/>
            Not officially affiliated with any corporate entity. All resources are for informational purposes.
          </p>
          <div className="mt-4 text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} innovate.tgpcet. All rights reserved.
          </div>
        </div>
      </footer>

      <div className="print:hidden">
        <FeedbackWidget />
      </div>
    </div>
  );
}
