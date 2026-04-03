import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Calendar, ExternalLink, IndianRupee, Laptop, X } from 'lucide-react';

// --- Types ---
type OpportunityType = 'Internship' | 'Competition' | 'Workshop';

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
}

// --- Dummy Data ---
const OPPORTUNITIES: Opportunity[] = [
  {
    id: '0',
    title: 'Industrial Training & Internship Program',
    type: 'Internship',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Discover Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Big Opportunity</span>
          </h1>
          <p className="text-lg text-slate-400">
            Find the best internships, hackathons, and workshops to accelerate your career.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-950 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {(['All', 'Internship', 'Competition', 'Workshop'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === filter
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 mb-4">
                <Search className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No opportunities found</h3>
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
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <h3 className="font-bold text-white truncate pr-4">Apply: {selectedOpp.title}</h3>
                <button 
                  onClick={() => setSelectedOpp(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-grow p-4 bg-slate-900 relative min-h-[400px]">
                {/* Iframe Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-500">
                  <ExternalLink className="w-12 h-12 mb-4 opacity-50" />
                  <p>Google Form Embed Placeholder</p>
                  <a 
                    href={selectedOpp.applyLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-4 text-amber-500 hover:underline"
                  >
                    Open form in new tab instead
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OpportunityCard({ opportunity, index, onApply }: { opportunity: Opportunity; index: number, onApply: () => void }) {
  const timeLeft = useCountdown(opportunity.deadline);
  const formattedDeadline = new Date(opportunity.deadline).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const typeColors = {
    Internship: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Competition: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Workshop: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative flex flex-col bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10"
    >
      <div className="p-6 pb-4 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${typeColors[opportunity.type]}`}>
            {opportunity.type}
          </span>
          {opportunity.isNew && (
            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 rounded-md shadow-sm shadow-amber-500/50 animate-pulse">
              New
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors line-clamp-2">
          {opportunity.title}
        </h3>
        
        <div className="text-slate-400 text-sm mb-6 leading-relaxed">
          {opportunity.description}
        </div>

        <div className="space-y-3 text-sm">
          {opportunity.stipend && (
            <div className="flex items-start gap-2 text-slate-300">
              <div className="mt-0.5 p-1 rounded bg-slate-800 text-slate-400"><IndianRupee className="w-3.5 h-3.5" /></div>
              <div><span className="block text-xs text-slate-500 font-medium mb-0.5">Stipend</span><span className="text-emerald-400 font-medium">{opportunity.stipend}</span></div>
            </div>
          )}
          {opportunity.duration && (
            <div className="flex items-start gap-2 text-slate-300">
              <div className="mt-0.5 p-1 rounded bg-slate-800 text-slate-400"><Laptop className="w-3.5 h-3.5" /></div>
              <div><span className="block text-xs text-slate-500 font-medium mb-0.5">Format & Duration</span>{opportunity.duration}</div>
            </div>
          )}
          <div className="flex items-start gap-2 text-slate-300">
            <div className="mt-0.5 p-1 rounded bg-slate-800 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div><span className="block text-xs text-slate-500 font-medium mb-0.5">Eligibility</span>{opportunity.eligibility}</div>
          </div>
          <div className="flex items-start gap-2 text-slate-300">
            <div className="mt-0.5 p-1 rounded bg-slate-800 text-slate-400"><Calendar className="w-3.5 h-3.5" /></div>
            <div><span className="block text-xs text-slate-500 font-medium mb-0.5">Deadline</span><span className="font-medium text-amber-100">{formattedDeadline}</span></div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 mt-auto">
        <div className="flex items-center justify-between p-3 mb-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-2 text-amber-500">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wide uppercase">{timeLeft}</span>
          </div>
        </div>
        <button
          onClick={onApply}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-amber-500 text-white hover:text-slate-950 font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] group/btn"
        >
          Apply Now
          <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
