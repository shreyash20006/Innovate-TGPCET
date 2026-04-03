import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ExternalLink, Award, Code, Wrench, Lightbulb, Globe, Briefcase, GraduationCap } from 'lucide-react';

const CATEGORIES = ['All', 'Coding', 'Software Tools', 'Aptitude', 'Web Development', 'Management'];

const COURSES: any[] = [];

const categoryIcons: Record<string, React.ReactNode> = {
  'Coding': <Code className="w-4 h-4" />,
  'Software Tools': <Wrench className="w-4 h-4" />,
  'Aptitude': <Lightbulb className="w-4 h-4" />,
  'Web Development': <Globe className="w-4 h-4" />,
  'Management': <Briefcase className="w-4 h-4" />,
  'All': <Award className="w-4 h-4" />
};

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredCourses = COURSES.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 text-amber-500 rounded-2xl mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4">Free Courses & Certifications</h1>
        <p className="text-slate-400 mb-4">Enhance your skills with top-rated free courses.</p>
        <div className="inline-flex items-center bg-slate-900 border border-slate-800 text-amber-400/80 text-xs sm:text-sm px-4 py-2 rounded-full">
          <span className="font-semibold mr-1">Note:</span> We redirect to trusted platforms for course access.
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-10 space-y-6">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search for courses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all shadow-lg shadow-slate-950/50"
          />
        </div>

        {/* Horizontal Scroll Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-2 justify-start md:justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {categoryIcons[cat]}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCourses.map((course, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              key={course.id}
              className="group bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col relative overflow-hidden"
            >
              {/* Decorative Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-amber-500/10 transition-colors" />
              
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-950 border border-slate-800 text-amber-400">
                  {categoryIcons[course.category]}
                  {course.category}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors z-10">
                {course.title}
              </h3>
              
              <p className="text-slate-400 text-sm mb-8 flex-grow z-10 leading-relaxed">
                {course.desc}
              </p>
              
              <a 
                href={course.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-950 border border-slate-800 hover:bg-amber-500 hover:border-amber-500 text-slate-300 hover:text-slate-950 font-bold rounded-xl transition-all duration-300 z-10 group/btn"
              >
                Explore Course
                <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </a>
            </motion.div>
          ))}
          
          {filteredCourses.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 border border-slate-800 mb-6 shadow-lg shadow-slate-950/50">
                <GraduationCap className="w-10 h-10 text-amber-500/50" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Coming Soon</h3>
              <p className="text-slate-400 max-w-md mx-auto">We are currently curating the best free courses and certifications for you. Stay tuned!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
