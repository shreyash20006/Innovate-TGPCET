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
  
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/notion/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        
        // Map Notion data to match the UI structure
        const formattedCourses = data.map((course: any) => ({
          id: course.id,
          title: course.title,
          category: course.platform || 'Coding', // Fallback
          desc: course.description || `Learn ${course.title} on ${course.platform}`,
          link: course.link
        }));
        
        setCourses(formattedCourses);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setCourses(COURSES); // Fallback to empty/dummy array
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
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
        className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center"
      >
        <div className="font-mono text-[11px] text-cyber-pink tracking-[0.3em] uppercase flex items-center gap-[16px] mb-[16px] before:content-[''] before:w-[40px] before:h-[1px] before:bg-cyber-pink after:content-[''] after:w-[40px] after:h-[1px] after:bg-cyber-pink">
          Free Knowledge
        </div>
        <h1 className="font-display text-[clamp(40px,6vw,72px)] font-[900] leading-[0.95] tracking-[-0.03em] text-cyber-white mb-[24px]">
          Free <em className="not-italic text-cyber-pink">Courses</em>
        </h1>
        <p className="text-cyber-text-secondary max-w-[480px] text-[16px] leading-[1.7] mx-auto font-body mb-6">
          Enhance your skills with top-rated free courses from across the web.
        </p>
        <div className="inline-flex items-center bg-cyber-pink/10 text-cyber-white font-mono text-[10px] uppercase tracking-wider px-4 py-2 border border-cyber-pink">
          <span className="font-bold text-cyber-pink mr-2 animate-blink">Note:</span> Links redirect to external platforms
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-10 space-y-6"
      >
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-pink" />
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1E2A3A] border border-cyber-border py-4 pl-12 pr-4 text-white font-mono text-[14px] placeholder:text-white/70 focus:border-cyber-lime outline-none transition-all shadow-[0_0_20px_rgba(170,255,0,0.05)] cursor-none"
            style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
          />
        </div>

        {/* Horizontal Scroll Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-2 justify-start md:justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest whitespace-nowrap transition-all duration-300 cursor-none border ${
                activeCategory === cat 
                  ? 'bg-cyber-pink text-white border-cyber-pink' 
                  : 'bg-cyber-card text-cyber-text-secondary border-cyber-border hover:border-cyber-blue hover:text-cyber-blue'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center opacity-70">
                 {categoryIcons[cat]}
              </div>
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full py-20 text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 border border-slate-800 mb-6 shadow-lg animate-pulse">
                <GraduationCap className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Loading Courses...</h3>
              <p className="text-slate-400 max-w-md mx-auto">Fetching the latest courses from Notion.</p>
            </motion.div>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                key={course.id}
                className="group bg-[#1E2A3A] border border-cyber-border p-5 sm:p-[28px] hover:border-[#aaff0066] transition-all duration-300 flex flex-col relative overflow-hidden text-white"
                style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-cyber-lime scale-y-0 origin-bottom transition-transform duration-400 group-hover:scale-y-100"></div>
                
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-cyber-lime/30 text-[10px] font-mono uppercase tracking-widest bg-cyber-lime/10 text-cyber-lime">
                    {categoryIcons[course.category] || <Award className="w-3 h-3" />}
                    {course.category}
                  </span>
                </div>
                
                <h3 className="font-display text-[22px] font-[800] leading-[1.2] text-white mb-3 group-hover:text-cyber-lime transition-colors z-10">
                  {course.title}
                </h3>
                
                <p className="text-[14px] text-[#CCCCCC] leading-[1.6] mb-8 flex-grow z-10">
                  {course.desc}
                </p>
                
                <a 
                  href={course.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-transparent border border-cyber-border hover:border-cyber-lime text-cyber-lime hover:bg-cyber-lime hover:text-black py-3 font-display text-[13px] font-[700] tracking-[0.1em] uppercase transition-colors flex items-center justify-center gap-2 z-10 group/btn cursor-none"
                >
                  Start Learning
                  <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </a>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 border border-slate-800 mb-6 shadow-lg">
                <GraduationCap className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">No Courses Found</h3>
              <p className="text-slate-400 max-w-md mx-auto">Try adjusting your search or filters.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
