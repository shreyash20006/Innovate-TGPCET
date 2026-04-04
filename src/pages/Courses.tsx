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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-12"
      >
        <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-2xl mb-4">
          <GraduationCap className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4">Free Courses</h1>
        <p className="text-slate-400 mb-4">Enhance your skills with top-rated free courses from across the web.</p>
        <div className="inline-flex items-center bg-slate-800/50 text-slate-300 text-xs sm:text-sm px-4 py-2 rounded-full border border-slate-700">
          <span className="font-bold text-amber-500 mr-1">Note:</span> These links redirect to external platforms.
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-10 space-y-6"
      >
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-lg"
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
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {categoryIcons[cat]}
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCourses.map((course, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              key={course.id}
              className="group bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-amber-500/50 transition-all duration-300 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300">
                  {categoryIcons[course.category]}
                  {course.category}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-500 transition-colors z-10">
                {course.title}
              </h3>
              
              <p className="text-slate-400 text-sm mb-8 flex-grow z-10 leading-relaxed">
                {course.desc}
              </p>
              
              <a 
                href={course.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-800 hover:bg-amber-500 text-white hover:text-slate-950 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 z-10 group/btn"
              >
                Start Learning
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
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 border border-slate-800 mb-6 shadow-lg">
                <GraduationCap className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Coming Soon</h3>
              <p className="text-slate-400 max-w-md mx-auto">We're curating the best free courses for you. Check back later!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
