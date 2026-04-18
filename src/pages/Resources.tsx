import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, ExternalLink, Code, BookOpen, BrainCircuit, Palette, FlaskConical, Briefcase, Sparkles, Settings, Microscope } from 'lucide-react';

const RESOURCES = [
  {
    category: 'AI Creation & Development',
    icon: <BrainCircuit className="w-6 h-6 text-purple-400" />,
    items: [
      { name: 'Google AI Studio', desc: 'Build and test AI apps using Gemini models with API access and prompts.', link: 'https://aistudio.google.com' },
      { name: 'Gemini (Google AI)', desc: 'Google’s main AI assistant for writing, coding, research, and productivity.', link: 'https://gemini.google.com' },
      { name: 'Gemini Advanced', desc: 'More powerful version of Gemini with better reasoning and long context.', link: 'https://gemini.google.com/advanced' },
      { name: 'MakerSuite (Legacy)', desc: 'Earlier version of AI Studio for prompt engineering and testing.', link: 'https://makersuite.google.com' },
    ]
  },
  {
    category: 'Design, Media & Creative AI',
    icon: <Palette className="w-6 h-6 text-pink-400" />,
    items: [
      { name: 'ImageFX', desc: 'Generate high-quality AI images using text prompts.', link: 'https://labs.google/fx/tools/image-fx' },
      { name: 'MusicFX', desc: 'Create AI-generated music from simple descriptions.', link: 'https://labs.google/fx/tools/music-fx' },
      { name: 'VideoFX (Experimental)', desc: 'Generate short AI videos using prompts.', link: 'https://labs.google/fx/tools/video-fx' },
      { name: 'Whisk (Google Labs)', desc: 'Creative AI tool for experimenting and remixing ideas.', link: 'https://labs.google' },
      { name: 'Stitch (UI Generator AI)', desc: 'Generate UI designs from prompts.', link: 'https://stitch.withgoogle.com' },
    ]
  },
  {
    category: 'Developer & Coding Tools',
    icon: <Code className="w-6 h-6 text-amber-400" />,
    items: [
      { name: 'Project IDX', desc: 'Cloud-based IDE by Google for full-stack development in browser.', link: 'https://idx.dev' },
      { name: 'Duet AI (for Developers)', desc: 'AI coding assistant integrated with Google Cloud tools.', link: 'https://cloud.google.com/duet-ai' },
      { name: 'Codey (Gemini Code Model)', desc: 'AI model trained specifically for coding tasks.', link: 'https://cloud.google.com/vertex-ai/docs/generative-ai/code' },
      { name: 'Gen App Builder', desc: 'Build AI-powered apps without heavy backend setup.', link: 'https://cloud.google.com/gen-app-builder' },
      { name: 'GitHub Student Pack', desc: 'Free pro tools for students.', link: 'https://education.github.com/pack' },
      { name: 'Vercel', desc: 'Free hosting for frontend projects.', link: 'https://vercel.com' },
    ]
  },
  {
    category: 'Experimental / Labs Projects',
    icon: <FlaskConical className="w-6 h-6 text-emerald-400" />,
    items: [
      { name: 'NotebookLM', desc: 'AI notebook that summarizes PDFs, notes, and research.', link: 'https://notebooklm.google.com' },
      { name: 'Learn About', desc: 'AI learning tool with interactive explanations.', link: 'https://labs.google/learn' },
      { name: 'Illuminate', desc: 'Simplifies complex topics using AI visuals.', link: 'https://illuminate.withgoogle.com' },
      { name: 'PaLM Playground (Legacy)', desc: 'Old interface to test Google language models.', link: 'https://makersuite.google.com/app/playground' },
    ]
  },
  {
    category: 'Productivity & Workspace AI',
    icon: <Briefcase className="w-6 h-6 text-blue-400" />,
    items: [
      { name: 'Duet AI (Workspace)', desc: 'AI in Docs, Sheets, Gmail for writing and automation.', link: 'https://workspace.google.com/ai' },
      { name: 'Help Me Write (Gmail AI)', desc: 'AI-powered email writing inside Gmail.', link: 'https://workspace.google.com/gmail' },
      { name: 'Help Me Organize (Sheets AI)', desc: 'AI-powered data organization and analysis.', link: 'https://workspace.google.com/sheets' },
      { name: 'Notion', desc: 'All-in-one workspace for notes.', link: 'https://notion.so' },
      { name: 'Pomofocus', desc: 'Pomodoro timer for focused study.', link: 'https://pomofocus.io' },
    ]
  },
  {
    category: 'Special Projects / Unique Tools',
    icon: <Sparkles className="w-6 h-6 text-indigo-400" />,
    items: [
      { name: 'Project Astra', desc: 'Real-time AI assistant that understands surroundings.', link: 'https://deepmind.google/technologies/gemini/project-astra' },
      { name: 'Project Tailwind', desc: 'AI working with your personal documents.', link: 'https://notebooklm.google.com' },
      { name: 'Google Vids AI', desc: 'Create presentations and videos using AI.', link: 'https://workspace.google.com/products/vids' },
      { name: 'Imagen (AI Model)', desc: 'Google’s advanced image generation model.', link: 'https://deepmind.google/technologies/imagen' },
    ]
  },
  {
    category: 'Automation & Script Tools',
    icon: <Settings className="w-6 h-6 text-teal-400" />,
    items: [
      { name: 'Google Apps Script', desc: 'Automate Google services using JavaScript.', link: 'https://script.google.com' },
      { name: 'Vertex AI', desc: 'Full AI platform for building and deploying models.', link: 'https://cloud.google.com/vertex-ai' },
      { name: 'AutoML (Vertex AI)', desc: 'Train custom AI models without deep coding.', link: 'https://cloud.google.com/vertex-ai/docs/start' },
    ]
  },
  {
    category: 'Research & Knowledge AI',
    icon: <Microscope className="w-6 h-6 text-rose-400" />,
    items: [
      { name: 'Bard', desc: 'Earlier version of Gemini (legacy mention).', link: 'https://bard.google.com' },
      { name: 'DeepMind Models', desc: 'Advanced AI research models for science & biology.', link: 'https://deepmind.google' },
      { name: 'Perplexity', desc: 'AI search engine with citations.', link: 'https://perplexity.ai' },
    ]
  }
];

export default function Resources() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center"
      >
        <div className="font-mono text-[11px] text-cyber-pink tracking-[0.3em] uppercase flex items-center gap-[16px] mb-[16px] before:content-[''] before:w-[40px] before:h-[1px] before:bg-cyber-pink after:content-[''] after:w-[40px] after:h-[1px] after:bg-cyber-pink">
          Equip Yourself
        </div>
        <h1 className="font-display text-[clamp(40px,6vw,72px)] font-[900] leading-[0.95] tracking-[-0.03em] text-cyber-white mb-[24px]">
          Digital <em className="not-italic text-cyber-pink">Resources</em>
        </h1>
        <p className="text-cyber-muted max-w-[480px] text-[16px] leading-[1.7] mx-auto font-body">
          Curated tools and platforms to enhance your productivity and learning.
        </p>
      </motion.div>

      <div className="space-y-12">
        {RESOURCES.map((section, i) => (
          <motion.div 
            key={section.category}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-6 border-b border-cyber-border pb-4">
              <div className="p-2 bg-cyber-bg2/80 border border-cyber-border flex items-center justify-center" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
                {section.icon}
              </div>
              <h2 className="font-display text-[24px] font-[800] text-cyber-white">{section.category}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item) => (
                <a 
                  key={item.name}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-cyber-bg2/80 border border-cyber-border p-4 sm:p-5 hover:border-cyber-lime/50 transition-all flex justify-between items-center group relative overflow-hidden cursor-none"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyber-lime transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom"></div>
                  <div className="pl-3">
                    <h3 className="font-display text-[16px] font-[700] text-cyber-white mb-1 group-hover:text-cyber-lime transition-colors">{item.name}</h3>
                    <p className="font-mono text-[11px] text-cyber-muted leading-[1.6]">{item.desc}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-cyber-border group-hover:text-cyber-lime transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
