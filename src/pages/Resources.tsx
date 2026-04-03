import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, ExternalLink, Code, BookOpen, BrainCircuit } from 'lucide-react';

const RESOURCES = [
  {
    category: 'Free AI Tools',
    icon: <BrainCircuit className="w-6 h-6 text-purple-400" />,
    items: [
      { name: 'ChatGPT', desc: 'General purpose AI assistant.', link: 'https://chatgpt.com' },
      { name: 'Claude', desc: 'Great for coding and long context.', link: 'https://claude.ai' },
      { name: 'Perplexity', desc: 'AI search engine with citations.', link: 'https://perplexity.ai' },
    ]
  },
  {
    category: 'Study & Productivity',
    icon: <BookOpen className="w-6 h-6 text-blue-400" />,
    items: [
      { name: 'Notion', desc: 'All-in-one workspace for notes.', link: 'https://notion.so' },
      { name: 'Pomofocus', desc: 'Pomodoro timer for focused study.', link: 'https://pomofocus.io' },
      { name: 'Anki', desc: 'Flashcards for spaced repetition.', link: 'https://apps.ankiweb.net' },
    ]
  },
  {
    category: 'Developer Tools',
    icon: <Code className="w-6 h-6 text-amber-400" />,
    items: [
      { name: 'GitHub Student Pack', desc: 'Free pro tools for students.', link: 'https://education.github.com/pack' },
      { name: 'Vercel', desc: 'Free hosting for frontend projects.', link: 'https://vercel.com' },
      { name: 'Figma', desc: 'Free design tool for students.', link: 'https://figma.com' },
    ]
  }
];

export default function Resources() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 text-blue-400 rounded-2xl mb-4">
          <Wrench className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4">Student Resources & Tools</h1>
        <p className="text-slate-400">A curated list of free tools and websites to help you study smarter and build faster.</p>
      </div>

      <div className="space-y-12">
        {RESOURCES.map((section, i) => (
          <motion.div 
            key={section.category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
              {section.icon}
              <h2 className="text-2xl font-bold text-white">{section.category}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item) => (
                <a 
                  key={item.name}
                  href={item.link}
                  className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:bg-slate-800 transition-colors flex justify-between items-center group"
                >
                  <div>
                    <h3 className="font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{item.name}</h3>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
