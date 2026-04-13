import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Cpu, Terminal, Bot, Target, BookOpen, Clock, Instagram, Send, MessageCircle, ExternalLink } from 'lucide-react';
import PlexusBackground from '../components/PlexusBackground';
import { OPPORTUNITIES } from './Opportunities';

const Typewriter3D = ({ text, className, delayOffset = 0 }: { text: string, className?: string, delayOffset?: number }) => {
  const letters = Array.from(text);
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: delayOffset },
    },
  };
  
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.3))",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 150,
      },
    },
    hidden: {
      opacity: 0,
      y: 30,
      rotateX: -80,
      rotateY: 15,
      filter: "drop-shadow(0px 20px 15px rgba(0,0,0,0.8))",
    },
  };

  return (
    <motion.span
      style={{ display: "inline-block", perspective: "1000px" }}
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={child}
          style={{ 
            display: "inline-block", 
            whiteSpace: letter === " " ? "pre" : "normal",
            transformOrigin: "bottom center"
          }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.span>
  );
};

// Define Instagram posts with an expiry timestamp (24 hours from the time of this edit: 2026-04-08T05:34:31Z)
const INSTAGRAM_POSTS = [
  { url: "https://www.instagram.com/p/DWthdTDkibS/", expiresAt: new Date('2026-04-08T05:34:31Z').getTime() },
  { url: "https://www.instagram.com/p/DRzsti0iFBY/", expiresAt: new Date('2026-04-08T05:34:31Z').getTime() },
  { url: "https://www.instagram.com/p/DWoS4OfCG-C/", expiresAt: new Date('2026-04-08T05:34:31Z').getTime() }
];

export default function Home() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [subscribeStatus, setSubscribeStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscribeMessage, setSubscribeMessage] = React.useState('');
  const [aiUpdates, setAiUpdates] = React.useState<any[]>([]);
  const [aiUpdatesLoading, setAiUpdatesLoading] = React.useState(true);
  const [aiUpdatesError, setAiUpdatesError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchNews = async () => {
      try {
        setAiUpdatesLoading(true);
        const response = await fetch('/.netlify/functions/news');
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || 'Failed to fetch news');
        }
        const data = await response.json();
        setAiUpdates(data.slice(0, 3)); // Get top 3
      } catch (err) {
        setAiUpdatesError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setAiUpdatesLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setSubscribeStatus('loading');
    try {
      const response = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubscribeStatus('success');
        setSubscribeMessage('✅ Subscribed! Check your inbox.');
        setEmail('');
        setName('');
        setTimeout(() => {
          setSubscribeStatus('idle');
          setSubscribeMessage('');
        }, 3000);
      } else {
        setSubscribeStatus('error');
        setSubscribeMessage(data.error || 'Failed to subscribe');
        setTimeout(() => {
          setSubscribeStatus('idle');
          setSubscribeMessage('');
        }, 3000);
      }
    } catch (error) {
      setSubscribeStatus('error');
      setSubscribeMessage('Network error. Please try again.');
      setTimeout(() => {
        setSubscribeStatus('idle');
        setSubscribeMessage('');
      }, 3000);
    }
  };

  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = "//www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    
    if ((window as any).instgrm) {
      (window as any).instgrm.Embeds.process();
    }
  }, []);

  return (
    <div className="space-y-24 pb-12">
      {/* Hero Section */}
      <section className="relative pt-20 pb-10 px-4 sm:px-6 lg:px-8 text-center overflow-hidden min-h-[70vh] flex items-center justify-center">
        <PlexusBackground />
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2, delayChildren: 0.1 }
            }
          }}
          className="max-w-4xl mx-auto space-y-8 relative z-10"
        >
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="inline-block text-[11px] tracking-[0.25em] uppercase text-amber-500/85 bg-amber-500/10 border border-amber-500/25 rounded-full px-5 py-1.5 mb-2"
          >
            ✦ Student Tech Hub
          </motion.div>
          <motion.h1 
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight drop-shadow-[0_2px_40px_rgba(0,0,0,0.9)]"
          >
            <Typewriter3D text="Your Gateway to " />
            <br />
            <span className="text-amber-500 drop-shadow-[0_0_80px_rgba(245,166,35,0.4)]">
              <Typewriter3D text="Tech Opportunities" delayOffset={0.6} />
            </span>
          </motion.h1>
          <motion.p 
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="text-lg sm:text-xl text-slate-300/80 max-w-2xl mx-auto drop-shadow-[0_1px_10px_rgba(0,0,0,0.95)] leading-relaxed"
          >
            Discover <strong className="text-white/90">internships, hackathons, free courses</strong>, and the latest AI updates. 
            Curated specifically for students aiming for excellence.
          </motion.p>
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="flex justify-center gap-4 pt-4"
          >
            <Link to="/opportunities" className="bg-amber-500 text-slate-950 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold hover:bg-amber-400 transition-all shadow-[0_0_35px_rgba(245,166,35,0.45),0_4px_24px_rgba(0,0,0,0.55)] hover:shadow-[0_0_60px_rgba(245,166,35,0.65),0_10px_35px_rgba(0,0,0,0.55)] hover:-translate-y-1 flex items-center gap-2 text-sm sm:text-base">
              Explore Opportunities <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Quick Access Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'AI Tools', icon: Bot, link: '/resources', color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { title: 'Internships', icon: Briefcase, link: '/opportunities', color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { title: 'Hackathons', icon: Target, link: '/opportunities', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { title: 'Free Courses', icon: BookOpen, link: '/courses', color: 'text-purple-400', bg: 'bg-purple-400/10' },
          ].map((item, i) => (
            <Link key={i} to={item.link} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-6 flex flex-col items-center justify-center gap-2 sm:gap-4 hover:border-amber-500/50 hover:scale-[1.03] hover:-translate-y-1.5 transition-all duration-300 group shadow-lg text-center hover:shadow-amber-500/10 hover:shadow-xl">
              <div className={`p-3 sm:p-4 rounded-full ${item.bg} group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300`}>
                <item.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${item.color} transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110`} />
              </div>
              <span className="font-bold text-slate-300 group-hover:text-amber-500 text-xs sm:text-base transition-colors duration-300">{item.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter / Community Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-br from-[#0f1e34] to-[#131f30] border border-amber-500/20 rounded-3xl p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(240,165,0,0.08),transparent_70%)] pointer-events-none"></div>
          
          <div className="text-left max-w-lg z-10">
            <div className="text-[11px] font-bold tracking-[3px] uppercase text-amber-500 mb-3">
              Stay Updated
            </div>
            <h2 className="font-['Syne'] text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Never Miss an Opportunity
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Get weekly curated internships, hackathons & AI tools directly to your inbox.
            </p>
          </div>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10 relative">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name" 
              disabled={subscribeStatus === 'loading'}
              required
              className={`bg-white/5 border rounded-xl px-5 py-4 text-sm text-white outline-none w-full sm:w-[180px] font-['DM_Sans'] transition-colors focus:bg-white/10 placeholder:text-slate-500 ${
                subscribeStatus === 'error' ? 'border-red-500/50 focus:border-red-500' : 
                subscribeStatus === 'success' ? 'border-green-500/50 focus:border-green-500' : 
                'border-white/10 focus:border-amber-500/40'
              }`}
            />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={subscribeMessage || "Enter your college email"} 
              disabled={subscribeStatus === 'loading'}
              required
              className={`bg-white/5 border rounded-xl px-5 py-4 text-sm text-white outline-none w-full sm:w-[220px] font-['DM_Sans'] transition-colors focus:bg-white/10 placeholder:text-slate-500 ${
                subscribeStatus === 'error' ? 'border-red-500/50 focus:border-red-500' : 
                subscribeStatus === 'success' ? 'border-green-500/50 focus:border-green-500' : 
                'border-white/10 focus:border-amber-500/40'
              }`}
            />
            <button 
              type="submit"
              disabled={subscribeStatus === 'loading'}
              className="bg-gradient-to-br from-amber-500 to-[#e08800] text-black border-none rounded-xl px-7 py-4 font-['Syne'] font-bold text-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(240,165,0,0.35)] whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {subscribeStatus === 'loading' ? 'Subscribing...' : 'Subscribe \u2192'}
            </button>
            {subscribeStatus === 'error' && (
              <div className="absolute -bottom-6 left-0 text-xs text-red-400">
                {subscribeMessage}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Opportunities Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Featured Opportunities</h2>
          </div>
          <Link to="/opportunities" className="text-amber-500 hover:text-amber-400 transition-colors font-medium text-sm sm:text-base">View All &rarr;</Link>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/50 transition-colors group"
          >
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-500 mb-4 inline-block">Internship</span>
            <h3 className="text-xl font-bold text-white mb-2">Industrial Training & Internship</h3>
            <p className="text-slate-400 text-sm mb-4">Powered by AWS and Wipro. AICTE | MSME | NSDC Approved.</p>
            <Link to="/opportunities" className="text-amber-500 text-sm font-medium hover:text-amber-400 transition-colors">Learn More &rarr;</Link>
          </motion.div>
        </div>
      </section>

      {/* Expiring Soon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Closing Soon</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OPPORTUNITIES
            .filter(opp => new Date(opp.deadline).getTime() > Date.now())
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
            .slice(0, 3)
            .map((item, i) => {
              const diff = new Date(item.deadline).getTime() - Date.now();
              const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
              const deadlineText = days === 1 ? '1 Day Left' : `${days} Days Left`;
              
              return (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-red-500/30 transition-colors shadow-lg">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-white line-clamp-2">{item.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-red-400 text-sm font-medium bg-red-500/10 w-fit px-3 py-1.5 rounded-md">
                    <Clock className="w-4 h-4" /> {deadlineText}
                  </div>
                  <Link to="/opportunities" className="mt-auto w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl text-sm font-medium text-center transition-colors">
                    View Details
                  </Link>
                </div>
              );
          })}
        </div>
      </section>

      {/* AI Updates Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Cpu className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Latest AI Updates</h2>
          </div>
          <Link to="/ai-updates" className="text-amber-500 hover:text-amber-400 transition-colors font-medium text-sm sm:text-base">View All &rarr;</Link>
        </motion.div>
        {aiUpdatesLoading ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center"
          >
            <Terminal className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-300 text-base sm:text-lg">Fetching the latest AI news and trends...</p>
          </motion.div>
        ) : aiUpdatesError ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="bg-red-500/10 border border-red-500/50 rounded-3xl p-8 sm:p-12 text-center"
          >
            <p className="text-red-500 mb-2 font-bold text-lg">Error loading AI updates</p>
            <p className="text-slate-400 text-sm sm:text-base">{aiUpdatesError}</p>
          </motion.div>
        ) : aiUpdates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiUpdates.map((news, i) => (
              <motion.div 
                key={news.id || i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/50 transition-colors flex flex-col h-full"
              >
                <div className="text-xs text-amber-500 font-bold mb-2">{news.hook || 'UPDATE'}</div>
                <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">{news.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-3 flex-grow">{news.summary}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                  <span className="text-xs text-slate-500">{news.date}</span>
                  {news.url ? (
                    <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-amber-500 text-sm font-medium hover:text-amber-400 transition-colors">
                      Read More &rarr;
                    </a>
                  ) : (
                    <Link to="/ai-updates" className="text-amber-500 text-sm font-medium hover:text-amber-400 transition-colors">
                      Read More &rarr;
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center"
          >
            <p className="text-slate-300 text-base sm:text-lg">No AI updates available at the moment.</p>
          </motion.div>
        )}
      </section>

      {/* Instagram Section */}
      {INSTAGRAM_POSTS.filter(post => Date.now() < post.expiresAt).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Instagram className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white">From Instagram</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 justify-items-center w-full overflow-hidden">
            {INSTAGRAM_POSTS.filter(post => Date.now() < post.expiresAt).map((post, i) => (
              <div key={i} className="w-full max-w-full flex justify-center bg-white rounded-xl overflow-hidden shadow-lg min-h-[350px] sm:min-h-[400px]">
                <blockquote 
                  className="instagram-media" 
                  data-instgrm-permalink={`${post.url}?utm_source=ig_embed&amp;utm_campaign=loading`} 
                  data-instgrm-version="14" 
                  style={{ background: '#FFF', border: 0, margin: 0, padding: 0, width: '100%', minWidth: '100%', maxWidth: '100%' }}
                >
                </blockquote>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Community Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">🚀 Join Our Community</h2>
          <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-lg">Join 500+ students getting daily updates</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <a href="#" className="flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white px-4 py-3 sm:px-8 sm:py-4 rounded-xl font-bold transition-colors text-sm sm:text-base">
              <Send className="w-5 h-5" /> Join Telegram
            </a>
            <a href="https://whatsapp.com/channel/0029VbC3hiw6WaKna525w139" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 sm:px-8 sm:py-4 rounded-xl font-bold transition-colors text-sm sm:text-base">
              <MessageCircle className="w-5 h-5" /> Join WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
