import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Search, ExternalLink, Calendar, MapPin, Clock, X, IndianRupee, Laptop } from 'lucide-react';

// --- Types ---
type OpportunityType = 'Internship' | 'Competition' | 'Workshop' | 'Accelerator';

interface Opportunity {
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
}

// --- Dummy Data ---
const OPPORTUNITIES: Opportunity[] = [
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
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  const filteredOpportunities = OPPORTUNITIES.filter((opp) => {
    const descText = typeof opp.description === 'string' ? opp.description : '';
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          descText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || opp.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      <div className="mb-12 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-2xl mb-4">
            <Briefcase className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Opportunities
          </h1>
          <p className="text-lg text-slate-400">
            Find internships, hackathons, and workshops to accelerate your career.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800"
        >
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-800 rounded-xl leading-5 bg-slate-950 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all sm:text-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {(['All', 'Internship', 'Competition', 'Workshop', 'Accelerator'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredOpportunities.length > 0 ? (
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
                  Continue to Application <ExternalLink className="w-5 h-5" />
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
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/50 transition-all group flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-500">
          {opportunity.type}
        </span>
        <span className={`text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1 ${isUrgent ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-300'}`}>
          <Clock className="w-3 h-3" /> {timeLeft}
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-500 transition-colors">{opportunity.title}</h3>
      {opportunity.company && <p className="text-slate-400 font-medium mb-4">{opportunity.company}</p>}
      
      <div className="space-y-2 mb-6">
        {opportunity.location && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="w-4 h-4" /> {opportunity.location}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar className="w-4 h-4" /> Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
        </div>
      </div>
      
      <div className="text-slate-400 text-sm mb-6 flex-grow">{opportunity.description}</div>
      
      <button 
        onClick={onApply}
        className="w-full bg-slate-800 hover:bg-amber-500 text-white hover:text-slate-950 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 mt-auto"
      >
        Apply Now <ExternalLink className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
