import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Cpu, Terminal } from 'lucide-react';
import PlexusBackground from '../components/PlexusBackground';

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

export default function Home() {
  return (
    <div className="space-y-24 pb-12">
      {/* Hero Section */}
      <section className="relative pt-20 pb-10 px-4 sm:px-6 lg:px-8 text-center overflow-hidden min-h-[70vh] flex items-center justify-center">
        <PlexusBackground />
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-8 relative z-10"
        >
          <div className="inline-block text-[11px] tracking-[0.25em] uppercase text-amber-500/85 bg-amber-500/10 border border-amber-500/25 rounded-full px-5 py-1.5 mb-2">
            ✦ Student Tech Hub
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight drop-shadow-[0_2px_40px_rgba(0,0,0,0.9)]">
            <Typewriter3D text="Your Gateway to " />
            <br />
            <span className="text-amber-500 drop-shadow-[0_0_80px_rgba(245,166,35,0.4)]">
              <Typewriter3D text="Tech Opportunities" delayOffset={0.6} />
            </span>
          </h1>
          <p className="text-xl text-slate-300/80 max-w-2xl mx-auto drop-shadow-[0_1px_10px_rgba(0,0,0,0.95)] leading-relaxed">
            Discover <strong className="text-white/90">internships, hackathons, free courses</strong>, and the latest AI updates. 
            Curated specifically for students aiming for excellence.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link to="/opportunities" className="bg-amber-500 text-slate-950 px-8 py-4 rounded-full font-bold hover:bg-amber-400 transition-all shadow-[0_0_35px_rgba(245,166,35,0.45),0_4px_24px_rgba(0,0,0,0.55)] hover:shadow-[0_0_60px_rgba(245,166,35,0.65),0_10px_35px_rgba(0,0,0,0.55)] hover:-translate-y-1 flex items-center gap-2">
              Explore Opportunities <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Opportunities Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-amber-500" />
            <h2 className="text-3xl font-bold text-white">Featured Opportunities</h2>
          </div>
          <Link to="/opportunities" className="text-amber-500 hover:text-amber-400 transition-colors font-medium">View All &rarr;</Link>
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

      {/* AI Updates Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Cpu className="w-8 h-8 text-amber-500" />
            <h2 className="text-3xl font-bold text-white">Latest AI Updates</h2>
          </div>
          <Link to="/ai-updates" className="text-amber-500 hover:text-amber-400 transition-colors font-medium">View All &rarr;</Link>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center"
        >
          <Terminal className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">Fetching the latest AI news and trends...</p>
        </motion.div>
      </section>
    </div>
  );
}
