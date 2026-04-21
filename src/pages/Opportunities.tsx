import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Search, ExternalLink, Calendar, MapPin, Clock, X, IndianRupee, Laptop, Filter } from 'lucide-react';

// --- Types ---
export type OpportunityType = 'Internship' | 'Competition' | 'Workshop' | 'Accelerator' | 'Simulation';

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  description: string | React.ReactNode;
  eligibility: string;
  deadline: string;
  applyLink: string;
  isNew?: boolean;
  stipend?: string;
  duration?: string;
  company?: string;
  location?: string;
  tags?: string[];
  buttonText?: string;
}

// --- Dummy Data ---
export const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'sim-1',
    title: 'Technology Consulting & Strategy',
    company: 'Accenture',
    type: 'Simulation',
    location: 'Virtual',
    description: 'Free job simulation program from Forage. Experience what it is like to work in Technology Consulting & Strategy at Accenture.',
    eligibility: 'Open to All',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    applyLink: 'https://www.theforage.com/virtual-internships/prototype/Accenture/technology-consulting',
    tags: ['🟢 Beginner', 'Consulting'],
    buttonText: 'Start Simulation',
  },
  {
    id: 'sim-2',
    title: 'Introduction to Strategy Consulting',
    company: 'BCG',
    type: 'Simulation',
    location: 'Virtual',
    description: 'Free job simulation program from Forage. Experience what it is like to work in Strategy Consulting at BCG.',
    eligibility: 'Open to All',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    applyLink: 'https://www.theforage.com/virtual-internships/prototype/BCG/strategy-consulting',
    tags: ['🟢 Beginner', 'Consulting'],
    buttonText: 'Start Simulation',
  },
  {
    id: 'sim-3',
    title: 'Management Consulting',
    company: 'PwC',
    type: 'Simulation',
    location: 'Virtual',
    description: 'Free job simulation program from Forage. Experience what it is like to work in Management Consulting at PwC.',
    eligibility: 'Open to All',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    applyLink: 'https://www.theforage.com/virtual-internships/prototype/PwC/management-consulting',
    tags: ['🔵 Intermediate', 'Consulting'],
    buttonText: 'Start Simulation',
  },
  {
    id: 'sim-4',
    title: 'Software Engineering',
    company: 'JP Morgan',
    type: 'Simulation',
    location: 'Virtual',
    description: 'Free job simulation program from Forage. Experience what it is like to work in Software Engineering at JP Morgan.',
    eligibility: 'Open to All',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    applyLink: 'https://www.theforage.com/virtual-internships/prototype/JPMorgan/software-engineering',
    tags: ['🔵 Intermediate', 'Tech'],
    buttonText: 'Start Simulation',
  },
  {
    id: 'sim-5',
    title: 'Software Engineering',
    company: 'Skyscanner',
    type: 'Simulation',
    location: 'Virtual',
    description: 'Free job simulation program from Forage. Experience what it is like to work in Software Engineering at Skyscanner.',
    eligibility: 'Open to All',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    applyLink: 'https://www.theforage.com/virtual-internships/prototype/Skyscanner/software-engineering',
    tags: ['🟢 Beginner', 'Tech'],
    buttonText: 'Start Simulation',
  },
  {
    id: 'sim-6',
    title: 'Advanced Software Engineering',
    company: 'Walmart',
    type: 'Simulation',
    location: 'Virtual',
    description: 'Free job simulation program from Forage. Experience what it is like to work in Advanced Software Engineering at Walmart.',
    eligibility: 'Open to All',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    applyLink: 'https://www.theforage.com/virtual-internships/prototype/Walmart/software-engineering',
    tags: ['🔴 Advanced', 'Tech'],
    buttonText: 'Start Simulation',
  },
  {
    id: 'sim-7',
    title: 'Data Visualization',
    company: 'TATA',
    type: 'Simulation',
    location: 'Virtual',
    description: 'Free job simulation program from Forage. Experience what it is like to work in Data Visualization at TATA.',
    eligibility: 'Open to All',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    applyLink: 'https://www.theforage.com/virtual-internships/prototype/Tata/data-visualisation',
    tags: ['🟢 Beginner', 'Data'],
    buttonText: 'Start Simulation',
  },
  {
    id: 'sim-8',
    title: 'GenAI Powered Data Analytics',
    company: 'TATA',
    type: 'Simulation',
    location: 'Virtual',
    description: 'Free job simulation program from Forage. Experience what it is like to work in GenAI Powered Data Analytics at TATA.',
    eligibility: 'Open to All',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    applyLink: 'https://www.theforage.com/virtual-internships/prototype/Tata/genai-data-analytics',
    tags: ['🔴 Advanced', 'AI'],
    buttonText: 'Start Simulation',
  },
  {
    id: 'sim-9',
    title: 'Data Analytics & Cyber Security',
    company: 'Deloitte',
    type: 'Simulation',
    location: 'Virtual',
    description: 'Free job simulation program from Forage. Experience what it is like to work in Data Analytics & Cyber Security at Deloitte.',
    eligibility: 'Open to All',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    applyLink: 'https://www.theforage.com/virtual-internships/prototype/Deloitte/data-analytics',
    tags: ['🔵 Intermediate', 'Data'],
    buttonText: 'Start Simulation',
  },
  {
    id: 'sim-10',
    title: 'Investment Banking',
    company: 'JP Morgan',
    type: 'Simulation',
    location: 'Virtual',
    description: 'Free job simulation program from Forage. Experience what it is like to work in Investment Banking at JP Morgan.',
    eligibility: 'Open to All',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    applyLink: 'https://www.theforage.com/virtual-internships/prototype/JPMorgan/investment-banking',
    tags: ['🔵 Intermediate', 'Finance'],
    buttonText: 'Start Simulation',
  },
  {
    id: 'sim-11',
    title: 'Finance Controllers',
    company: 'Goldman Sachs',
    type: 'Simulation',
    location: 'Virtual',
    description: 'Free job simulation program from Forage. Experience what it is like to work in Finance Controllers at Goldman Sachs.',
    eligibility: 'Open to All',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    applyLink: 'https://www.theforage.com/virtual-internships/prototype/GoldmanSachs/finance-controllers',
    tags: ['🟢 Beginner', 'Finance'],
    buttonText: 'Start Simulation',
  },
  {
    id: 'sim-12',
    title: 'Finance Operations',
    company: 'Goldman Sachs',
    type: 'Simulation',
    location: 'Virtual',
    description: 'Free job simulation program from Forage. Experience what it is like to work in Finance Operations at Goldman Sachs.',
    eligibility: 'Open to All',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    applyLink: 'https://www.theforage.com/virtual-internships/prototype/GoldmanSachs/operations',
    tags: ['🟢 Beginner', 'Finance'],
    buttonText: 'Start Simulation',
  },
  {
    id: 'sim-13',
    title: 'Digital Assurance',
    company: 'PwC',
    type: 'Simulation',
    location: 'Virtual',
    description: 'Free job simulation program from Forage. Experience what it is like to work in Digital Assurance at PwC.',
    eligibility: 'Open to All',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    applyLink: 'https://www.theforage.com/virtual-internships/prototype/PwC/digital-assurance',
    tags: ['🔵 Intermediate', 'Audit'],
    buttonText: 'Start Simulation',
  },
  {
    id: '2',
    title: 'Healthcare Internship Batches (April & May 2026)',
    company: 'MindSparc',
    type: 'Internship',
    location: 'Online',
    description: (
      <div className="space-y-2">
        <p className="font-semibold text-amber-400">High-Demand Healthcare Careers | Limited Seats</p>
        <p className="text-emerald-400 text-[10px] sm:text-xs font-bold bg-emerald-400/10 inline-block px-2 py-1 rounded border border-emerald-400/20">MSME | NASSCOM | ISO | MCA Certified</p>
        <div className="mt-2 text-sm text-slate-300">
          <p className="font-bold text-white mb-1">💡 Available Programs:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Advance Medical Coding</li>
            <li>Pharmacovigilance</li>
            <li>Drug Regulatory Affairs</li>
            <li>Clinical SAS</li>
            <li>AI in Healthcare</li>
          </ul>
        </div>
        <ul className="list-disc pl-4 space-y-1 text-slate-300 mt-3 text-sm">
          <li>Live Practical Training</li>
          <li>Govt. & Industry Recognised Certificate</li>
          <li>Minimal Charges & Affordable</li>
        </ul>
        <p className="text-amber-500 font-bold text-xs mt-3 animate-pulse">⏳ Seats Filling Fast – Apply Now!</p>
      </div>
    ),
    eligibility: 'Open to All',
    duration: '3 Months Online Internship',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    applyLink: 'https://wa.me/+917416314671?text=Hello%20Sir%0aI\'m%20interested%20For%203months%20Online%20Training%20Kindly%20Share%20Me%20Course%20Details%20',
    isNew: true,
  },
  {
    id: '1',
    title: 'Google 2026 Startup Accelerator (India)',
    company: 'Google',
    type: 'Accelerator',
    location: 'India',
    description: (
      <div className="space-y-2">
        <p className="text-slate-300 text-sm">
          A three-month, equity-free program designed to help founders move faster with access to Google’s ecosystem.
        </p>
        <ul className="list-disc pl-4 space-y-1 text-slate-300 mt-2 text-sm">
          <li>Mentorship from industry experts</li>
          <li>Access to advanced AI tools</li>
          <li>Up to $350,000 in Cloud credits for scaling</li>
        </ul>
        <p className="text-amber-500 font-bold text-xs mt-3">Focus: Generative AI, Machine Learning & Emerging Tech</p>
      </div>
    ),
    eligibility: 'Seed to Series A Startups',
    stipend: 'Up to $350K Cloud Credits',
    duration: '3 Months (Equity-Free)',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Setting a 30-day deadline
    applyLink: 'https://startup.google.com/programs/accelerator/india/',
    isNew: true,
  },
  {
    id: '0',
    title: 'Industrial Training & Internship Program',
    company: 'AWS & Wipro',
    type: 'Internship',
    location: 'Remote / Hybrid',
    description: (
      <div className="space-y-2">
        <p className="font-semibold text-amber-400">Powered by AWS and Wipro</p>
        <p className="text-emerald-400 text-[10px] sm:text-xs font-bold bg-emerald-400/10 inline-block px-2 py-1 rounded border border-emerald-400/20">AICTE | MSME | NSDC Approved</p>
        <ul className="list-disc pl-4 space-y-1 text-slate-300 mt-2 text-sm">
          <li>Live Projects & Industry Experts</li>
          <li>Govt. Certificate upon completion</li>
          <li>Step into the industry with real experience.</li>
        </ul>
        <p className="text-amber-500 font-bold text-xs mt-3 animate-pulse">⚡ Limited Seats – Register Early!</p>
      </div>
    ),
    eligibility: 'Open to All Students',
    stipend: '₹5K – ₹15K (Performance-Based)',
    duration: 'Online | 3 Months',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    applyLink: 'https://forms.gle/ZAbT9yDQw72LKxSS6',
    isNew: true,
  }
];

const useCountdown = (targetDate: string) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference <= 0) return 'Expired';
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      if (days > 0) return `${days}d ${hours}h left`;
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      return `${hours}h ${minutes}m left`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

export default function Opportunities() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<OpportunityType | 'All'>('All');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await fetch('/api/notion/opportunities');
        if (!response.ok) throw new Error('Failed to fetch opportunities');
        const data = await response.json();
        // If Notion is empty or fails, fallback to dummy data
        if (data && data.length > 0) {
          setOpportunities(data);
        } else {
          setOpportunities(OPPORTUNITIES);
        }
      } catch (err) {
        console.error('Error fetching from Notion:', err);
        // Fallback to dummy data on error
        setOpportunities(OPPORTUNITIES);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const allTags = Array.from(
    new Set(opportunities.flatMap((opp) => opp.tags || []))
  ).sort();

  const filteredOpportunities = opportunities.filter((opp) => {
    const descText = typeof opp.description === 'string' ? opp.description : '';
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          descText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeFilter === 'All' || opp.type === activeFilter;
    const matchesTags = activeTags.length === 0 || activeTags.some(tag => opp.tags?.includes(tag));
    return matchesSearch && matchesType && matchesTags;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      <div className="mb-12 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto flex flex-col items-center"
        >
          <div className="font-mono text-[11px] text-cyber-pink tracking-[0.3em] uppercase flex items-center gap-[16px] mb-[16px] before:content-[''] before:w-[40px] before:h-[1px] before:bg-cyber-pink after:content-[''] after:w-[40px] after:h-[1px] after:bg-cyber-pink">
            Explore Futures
          </div>
          <h1 className="font-display text-[clamp(40px,6vw,72px)] font-[900] leading-[0.95] tracking-[-0.03em] text-cyber-white mb-[24px]">
            Tech <em className="not-italic text-cyber-pink">Opportunities</em>
          </h1>
          <p className="text-cyber-muted max-w-[480px] text-[16px] leading-[1.7] mx-auto font-body">
            Find internships, hackathons, and workshops to accelerate your career.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1E2A3A] p-6 border border-cyber-border space-y-4 relative overflow-hidden" 
          style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-cyber-pink"></div>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-cyber-pink" />
              </div>
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 sm:py-2.5 border-none border-b border-cyber-border leading-5 bg-transparent text-cyber-lime placeholder:text-[#aaff004d] focus:outline-none focus:border-cyber-lime transition-all font-mono text-[13px] sm:text-[14px] cursor-none"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-4 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {(['All', 'Internship', 'Competition', 'Workshop', 'Accelerator', 'Simulation'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 text-[12px] font-mono tracking-widest uppercase whitespace-nowrap transition-colors border cursor-none ${
                    activeFilter === filter
                      ? 'bg-cyber-pink/20 text-cyber-pink border-cyber-pink'
                      : 'bg-transparent text-cyber-muted border-cyber-border hover:border-cyber-blue hover:text-cyber-blue'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-400">Filter by Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setActiveTags(prev => 
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                      );
                    }}
                    className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors border cursor-none ${
                      activeTags.includes(tag)
                        ? 'bg-cyber-lime/20 border-cyber-lime text-cyber-lime'
                        : 'bg-transparent border-cyber-border text-cyber-muted hover:border-cyber-pink hover:text-cyber-pink'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full py-20 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full mb-4 animate-pulse">
                <Briefcase className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Loading Opportunities...</h3>
              <p className="text-slate-400">Fetching the latest data from Notion.</p>
            </motion.div>
          ) : filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((opp, index) => (
              <OpportunityCard key={opp.id} opportunity={opp} index={index} onApply={() => setSelectedOpp(opp)} />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full py-20 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full mb-4">
                <Search className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No opportunities found</h3>
              <p className="text-slate-400">Try adjusting your search or filters.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {selectedOpp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <button 
                onClick={() => setSelectedOpp(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="mb-6 pr-12">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-500 mb-4 inline-block">
                  {selectedOpp.type}
                </span>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedOpp.title}</h2>
                {selectedOpp.company && <p className="text-lg text-slate-400">{selectedOpp.company}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {selectedOpp.location && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="text-slate-500 text-sm mb-1">Location</div>
                    <div className="text-white font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500" /> {selectedOpp.location}
                    </div>
                  </div>
                )}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="text-slate-500 text-sm mb-1">Deadline</div>
                  <div className="text-white font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" /> {new Date(selectedOpp.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="prose prose-invert max-w-none mb-8">
                <h3 className="text-lg font-bold text-white mb-4">About the Opportunity</h3>
                <div className="text-slate-300 leading-relaxed">{selectedOpp.description}</div>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 text-center">
                <h3 className="text-lg font-bold text-white mb-2">Ready to apply?</h3>
                <p className="text-slate-400 mb-6">You will be redirected to the official application page.</p>
                <a 
                  href={selectedOpp.applyLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-amber-500 text-slate-950 px-8 py-3 rounded-xl font-bold hover:bg-amber-400 transition-colors w-full sm:w-auto"
                >
                  {selectedOpp.buttonText || 'Continue to Application'} <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const OpportunityCard: React.FC<{ opportunity: Opportunity; index: number, onApply: () => void }> = ({ opportunity, index, onApply }) => {
  const timeLeft = useCountdown(opportunity.deadline);
  const isUrgent = timeLeft.includes('h') && !timeLeft.includes('d');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-cyber-bg2/80 border border-cyber-border p-5 sm:p-[28px] hover:border-[#ff006659] hover:shadow-[0_0_40px_rgba(255,0,102,0.1)] transition-all group flex flex-col relative overflow-hidden"
      style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-cyber-pink scale-y-0 origin-top transition-transform duration-400 group-hover:scale-y-100"></div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-start gap-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase px-3 py-1 bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/50">
            {opportunity.type}
          </span>
          {opportunity.tags?.map(tag => (
            <span key={tag} className="font-mono text-[9px] tracking-[0.2em] uppercase px-2 sm:px-3 py-1 border border-white/10 text-cyber-muted">
              {tag}
            </span>
          ))}
        </div>
        <span className={`font-mono text-[10px] tracking-[0.1em] uppercase px-2 py-1 flex items-center gap-1 border whitespace-nowrap self-start ${isUrgent ? 'bg-[#ff00421f] text-[#ff4466] border-[#ff00424d]' : 'bg-transparent text-cyber-muted border-cyber-border'}`}>
          <Clock className="w-3 h-3" /> {timeLeft}
        </span>
      </div>
      
      <h3 className="font-display text-[22px] font-[800] leading-[1.2] text-cyber-white mb-1 group-hover:text-cyber-lime transition-colors">{opportunity.title}</h3>
      {opportunity.company && <p className="font-mono text-[12px] text-cyber-pink tracking-widest uppercase mb-4">{opportunity.company}</p>}
      
      <div className="space-y-2 mb-6">
        {opportunity.location && (
          <div className="flex items-center gap-2 text-xs font-mono text-cyber-muted uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-cyber-blue" /> {opportunity.location}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs font-mono text-cyber-muted uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-cyber-blue" /> Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
        </div>
      </div>
      
      <div className="text-[14px] text-cyber-muted leading-[1.6] mb-6 flex-grow">{opportunity.description}</div>
      
      <button 
        onClick={onApply}
        className="w-full bg-transparent border border-cyber-border text-cyber-pink font-display text-[13px] font-[700] tracking-[0.15em] uppercase hover:bg-cyber-pink hover:border-cyber-pink hover:text-black py-3 transition-colors flex items-center justify-center gap-2 mt-auto cursor-none"
      >
        {opportunity.buttonText || 'Apply Now'} <ExternalLink className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
