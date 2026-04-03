import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Cpu, Instagram } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-24 pb-12">
      {/* Hero Section */}
      <section className="relative pt-20 pb-10 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950 to-slate-950 -z-10" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
            Your Free Student Hub for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              Opportunities & AI Updates
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            100% Free. No hidden fees. Just pure value for students looking to excel in their academics and careers.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/opportunities" className="bg-amber-500 text-slate-950 px-8 py-4 rounded-xl font-bold hover:bg-amber-400 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
              Explore Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Opportunities Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl font-bold text-white">Featured Opportunities</h2>
          </div>
          <Link to="/opportunities" className="text-slate-400 hover:text-white transition-colors">View All &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20 mb-4 inline-block">Internship</span>
            <h3 className="text-xl font-bold text-white mb-2">Industrial Training & Internship</h3>
            <p className="text-slate-400 text-sm mb-4">Powered by AWS and Wipro. AICTE | MSME | NSDC Approved.</p>
            <Link to="/opportunities" className="text-amber-500 text-sm font-medium">Learn more &rarr;</Link>
          </div>
        </div>
      </section>

      {/* AI Updates Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Cpu className="w-8 h-8 text-emerald-400" />
            <h2 className="text-3xl font-bold text-white">Latest AI Updates</h2>
          </div>
          <Link to="/ai-updates" className="text-slate-400 hover:text-white transition-colors">View All &rarr;</Link>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-12 text-center">
          <p className="text-slate-400">Stay tuned! We are gathering the latest AI news and updates for you.</p>
        </div>
      </section>
    </div>
  );
}
