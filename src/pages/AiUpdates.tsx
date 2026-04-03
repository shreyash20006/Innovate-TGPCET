import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ArrowRight, Sparkles, Search, Loader2 } from 'lucide-react';

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
  bullets?: string[];
};

const CATEGORIES = ['All', 'AI', 'Jobs', 'Internship', 'Hiring'];

export default function AiUpdates() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/.netlify/functions/news');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl mb-4">
          <Cpu className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4">AI Updates & News</h1>
        <p className="text-slate-400">Stay ahead of the curve with the latest developments in Artificial Intelligence.</p>
      </div>

      {/* Search & Category Filters */}
      <div className="mb-10 space-y-6">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search news..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all shadow-lg shadow-slate-950/50"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-2 justify-start md:justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
          <p className="text-slate-400">Fetching latest updates...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <p className="text-red-400 mb-2">Oops! Something went wrong.</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      ) : filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredNews.map((news, i) => (
              <motion.div 
                layout
                key={news.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all flex flex-col relative overflow-hidden group"
              >
              {news.isNew && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 z-10">
                  <Sparkles className="w-3 h-3" /> NEW
                </div>
              )}
              
              <div className="text-xs text-emerald-400 font-bold mb-3 pr-12 leading-relaxed">
                {news.hook}
              </div>
              
              <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {news.title}
              </h3>
              
              <div className="flex items-center gap-2 mb-4">
                {news.category && (
                  <span className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] uppercase tracking-wider font-bold rounded-md">
                    {news.category}
                  </span>
                )}
                <span className="text-xs text-slate-500">{news.date}</span>
              </div>
              
              {news.videoUrl && (
                <div className="mb-5 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video relative">
                  <video 
                    src={news.videoUrl} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover absolute inset-0"
                  />
                </div>
              )}
              
              <p className="text-slate-300 text-sm mb-5 leading-relaxed flex-grow">
                {news.summary}
              </p>
              
              {news.bullets && (
                <ul className="space-y-3 mb-6">
                  {news.bullets.map((bullet, idx) => (
                    <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5 text-lg leading-none">•</span>
                      <span className="leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {news.url ? (
                <a 
                  href={news.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-500 font-bold flex items-center gap-2 hover:gap-3 transition-all mt-auto pt-4 border-t border-slate-800/50 w-fit"
                >
                  Read full story <ArrowRight className="w-4 h-4" />
                </a>
              ) : (
                <button className="text-emerald-500 font-bold flex items-center gap-2 hover:gap-3 transition-all mt-auto pt-4 border-t border-slate-800/50">
                  Read full story <ArrowRight className="w-4 h-4" />
                </button>
              )}
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 mb-4">
            <Search className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No news found</h3>
          <p className="text-slate-400">Try adjusting your category filter.</p>
        </motion.div>
      )}
    </div>
  );
}
