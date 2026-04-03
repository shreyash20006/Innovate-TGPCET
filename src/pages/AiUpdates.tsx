import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ArrowRight, Sparkles, Search } from 'lucide-react';

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

const NEWS: NewsItem[] = [
  {
    id: 1,
    hook: "Ready to compete in global AI innovation?",
    title: "Global AI Innovation Competition Launched",
    summary: "A new global competition has launched to accelerate AI technology and industrial applications.",
    category: "AI",
    url: "https://www.manilatimes.net/2026/04/03/tmt-newswire/globenewswire/century-huatong-launches-the-2nd-digiloong-cup-global-ai-innovation-competition/2313871",
    date: "April 3, 2026",
    isNew: true
  },
  {
    id: 2,
    hook: "Tech jobs are moving to smaller cities!",
    title: "Tech Hiring Booms in Tier-2 Cities",
    summary: "Cities like Mangalore and Bhopal are seeing a massive surge in tech and GCC job postings.",
    category: "Hiring",
    url: "https://economictimes.indiatimes.com/tech/technology/small-cities-like-mangalore-bhopal-aurangabad-enter-gcc-race/articleshow/129988377.cms",
    date: "April 3, 2026",
    isNew: true
  },
  {
    id: 3,
    hook: "Are you using AI for your assignments?",
    title: "Majority of College Students Use AI",
    summary: "A new poll reveals that most college students now use AI tools for their coursework every week.",
    category: "AI",
    url: "https://www.upi.com/Top_News/US/2026/04/02/survey-college-students-artificial-intelligence-coursework/5341775162201/",
    date: "April 2, 2026",
    isNew: false
  },
  {
    id: 4,
    hook: "Will AI take your future job?",
    title: "AI: A Threat to Jobs or Humanity?",
    summary: "As AI develops at an astonishing pace, debates continue about its impact on the future of work.",
    category: "Jobs",
    url: "https://morningstaronline.co.uk/article/artificial-intelligence-threat-jobs-or-humanity-itself",
    date: "April 2, 2026",
    isNew: false
  }
];

const CATEGORIES = ['All', 'AI', 'Jobs', 'Internship', 'Hiring'];

export default function AiUpdates() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredNews = NEWS.filter(news => {
    if (activeCategory === 'All') return true;
    return news.category?.toLowerCase() === activeCategory.toLowerCase();
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

      {/* Category Filters */}
      <div className="mb-10 space-y-6">
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

      {filteredNews.length > 0 ? (
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
