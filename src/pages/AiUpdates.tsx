import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ArrowRight, Sparkles, Search, Share2, Check } from 'lucide-react';
import RingLoader from '../components/RingLoader';

type NewsItem = {
  id: number;
  hook: string;
  title: string;
  summary: string;
  category?: string;
  url?: string;
  date: string;
  isNew: boolean;
  videoUrl?: string;
  imageUrl?: string;
  bullets?: string[];
};

const CATEGORIES = ['All', 'AI', 'Jobs', 'Internship', 'Hiring'];

export default function AiUpdates() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleShare = async (news: NewsItem) => {
    const shareUrl = news.url || window.location.href;
    const shareData = {
      title: news.title,
      text: news.summary,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedId(news.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/news');
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || 'Failed to fetch news');
        }
        const data = await response.json();
        setNewsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filteredNews = newsData.filter(news => {
    const matchesSearch = 
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      news.summary.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (activeCategory === 'All') return matchesSearch;
    return matchesSearch && news.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-12"
      >
        <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-2xl mb-4">
          <Cpu className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4">AI Updates</h1>
        <p className="text-slate-400">Stay informed with the latest developments in Artificial Intelligence.</p>
      </motion.div>

      {/* Search & Category Filters */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-10 space-y-6"
      >
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search updates..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-lg"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-2 justify-start md:justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <RingLoader />
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <p className="text-red-500 mb-2 font-bold">Error loading news</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      ) : filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredNews.map((news, i) => (
              <motion.div 
                layout
                key={news.id}
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-amber-500/50 transition-all flex flex-col relative overflow-hidden group"
              >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              {news.isNew && (
                <div className="absolute top-4 right-4 bg-amber-500/10 text-amber-500 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 z-10">
                  <Sparkles className="w-3 h-3" /> New
                </div>
              )}
              
              <div className="text-sm text-amber-500 font-bold mb-3 pr-12 leading-relaxed">
                {news.hook}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-500 transition-colors">
                {news.title}
              </h3>
              
              <div className="flex items-center gap-2 mb-4">
                {news.category && (
                  <span className="px-2 py-1 bg-slate-800 rounded-md text-slate-300 text-xs font-medium">
                    {news.category}
                  </span>
                )}
                <span className="text-xs text-slate-500">{news.date}</span>
              </div>
              
              {news.imageUrl && (
                <div className="mb-5 overflow-hidden rounded-xl bg-slate-950 aspect-video relative">
                  <img 
                    src={news.imageUrl} 
                    alt={news.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              )}

              {news.videoUrl && !news.imageUrl && (
                <div className="mb-5 overflow-hidden rounded-xl bg-slate-950 aspect-video relative">
                  <video 
                    src={news.videoUrl} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              )}
              
              <p className="text-slate-400 text-sm mb-5 leading-relaxed flex-grow whitespace-pre-wrap">
                {news.summary}
              </p>
              
              {news.bullets && (
                <ul className="space-y-3 mb-6">
                  {news.bullets.map((bullet, idx) => (
                    <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span className="leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                {news.url ? (
                  <a 
                    href={news.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-500 font-medium flex items-center gap-2 hover:gap-3 transition-all w-fit"
                  >
                    Read Full Story <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <button className="text-amber-500 font-medium flex items-center gap-2 hover:gap-3 transition-all">
                    Read Full Story <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                
                <button 
                  onClick={() => handleShare(news)} 
                  className="text-slate-400 hover:text-amber-500 transition-colors p-2"
                  title="Share"
                >
                  {copiedId === news.id ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                </button>
              </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-full py-20 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full mb-4">
            <Search className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No updates found</h3>
          <p className="text-slate-400">Try adjusting your search parameters.</p>
        </motion.div>
      )}
    </div>
  );
}
