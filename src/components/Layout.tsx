import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Menu, X } from 'lucide-react';

const Logo = () => (
  <Link to="/" className="flex items-center gap-3">
    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#111827] flex items-center justify-center p-0.5 border border-amber-500/50 shadow-lg shadow-amber-500/20 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full text-[#d4af37]">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="1" />
        <polygon points="50,24 72,36 72,64 50,76 28,64 28,36" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text x="50" y="54" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor" fontFamily="sans-serif">TGPCET</text>
        <path id="curve-top" d="M 16 50 A 34 34 0 0 1 84 50" fill="transparent" />
        <text fontSize="8" fill="currentColor" fontWeight="bold" letterSpacing="1.5">
          <textPath href="#curve-top" startOffset="50%" textAnchor="middle">INNOVATE.TGPCET</textPath>
        </text>
        <path id="curve-bottom" d="M 84 50 A 34 34 0 0 1 16 50" fill="transparent" />
        <text fontSize="5" fill="currentColor" letterSpacing="1">
          <textPath href="#curve-bottom" startOffset="50%" textAnchor="middle">IDEAS → PROJECTS → IMPACT</textPath>
        </text>
        <circle cx="12" cy="50" r="1.5" fill="currentColor" />
        <circle cx="88" cy="50" r="1.5" fill="currentColor" />
      </svg>
    </div>
    <div className="flex flex-col">
      <span className="text-white font-bold text-lg sm:text-xl leading-none tracking-tight">innovate.tgpcet</span>
    </div>
  </Link>
);

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Opportunities', path: '/opportunities' },
    { name: 'Courses', path: '/courses' },
    { name: 'AI Updates', path: '/ai-updates' },
    { name: 'Resources', path: '/resources' },
    { name: 'About', path: '/about' },
  ];

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 flex flex-col">
      {/* Ticker Bar */}
      <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-sm font-bold overflow-hidden relative flex items-center">
        <div className="absolute left-0 z-10 bg-amber-500 px-4 flex items-center gap-2 h-full shadow-[10px_0_10px_rgba(245,158,11,1)]">
          <span className="animate-pulse">🚀</span>
          <span>LATEST:</span>
        </div>
        <motion.div
          className="whitespace-nowrap ml-24"
          animate={{ x: [0, -2000] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        >
          New AWS & Wipro Internship Added! &nbsp;&nbsp;•&nbsp;&nbsp; ChatGPT-5 Rumors: What Students Need to Know &nbsp;&nbsp;•&nbsp;&nbsp; Join our upcoming UI/UX Workshop &nbsp;&nbsp;•&nbsp;&nbsp; All resources are 100% FREE!
        </motion.div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo />
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`${
                  location.pathname === link.path ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                } transition-colors`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <button 
            className="md:hidden text-slate-300 hover:text-white"
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
              <div className="px-4 py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`${
                      location.pathname === link.path ? 'text-amber-400' : 'text-slate-400'
                    } font-medium`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-2 text-amber-500">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Disclaimer</span>
          </div>
          <p className="text-slate-500 text-sm max-w-2xl">
            This is an unofficial platform created by students, for students. It is completely FREE and not officially affiliated with, endorsed by, or connected to any college, university, or organization. All opportunities and notes listed are for informational purposes.
          </p>
          <div className="mt-4 text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} Innovate Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
