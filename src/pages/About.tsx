import React from 'react';
import { motion } from 'framer-motion';
import { Info, ShieldAlert, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 text-amber-500 rounded-2xl mb-4">
            <Info className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">About the Platform</h1>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-500" /> Our Mission
            </h2>
            <p className="text-slate-300 leading-relaxed text-lg">
              "Helping students access free resources and opportunities."
            </p>
            <p className="text-slate-400 mt-4 leading-relaxed">
              We believe that education and career growth should not be hindered by paywalls. 
              This platform was built to centralize high-quality notes, legitimate internship opportunities, 
              and the latest tech updates—all completely free for students.
            </p>
          </section>

          <hr className="border-slate-800" />

          <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Important Disclaimer
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              This is an <strong>unofficial student-driven platform</strong>. It is not affiliated with, endorsed by, or officially connected to any specific college, university, or organization. 
              <br /><br />
              All notes, links, and opportunities are crowdsourced or curated for informational purposes. We do not charge any fees, and we do not sell any data.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
