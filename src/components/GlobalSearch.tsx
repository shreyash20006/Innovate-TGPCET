import React, { useState, useEffect, useRef } from 'react';
import { Search, X, History, TrendingUp, Music, User, Disc } from 'lucide-react';
import { getSearchSuggestions } from '../utils/youtubeApi';

interface GlobalSearchProps {
  query: string;
  onSearch: (q: string) => void;
  searching: boolean;
}

export default function GlobalSearch({ query, onSearch, searching }: GlobalSearchProps) {
  const [inputValue, setInputValue] = useState(query);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('search_history') || '[]'); } catch { return []; }
  });

  // Debounced suggestion fetching
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (inputValue.trim().length > 1) {
        const sugg = await getSearchSuggestions(inputValue);
        setSuggestions(sugg);
      } else {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (q: string) => {
    const finalQ = q.trim();
    if (!finalQ) return;
    
    // Save to history
    const newHistory = [finalQ, ...history.filter(h => h !== finalQ)].slice(0, 8);
    setHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
    
    setInputValue(finalQ);
    onSearch(finalQ);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto z-50">
      <div className="relative group">
        <div className={`absolute inset-0 bg-[#00ff85] rounded-full blur-xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-500`} />
        
        <div className="relative flex items-center bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5 shadow-2xl transition-all focus-within:border-[#00ff85]/50 focus-within:bg-[#1a1a1a]">
          <Search className="w-5 h-5 text-zinc-500 mr-3 shrink-0" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(inputValue)}
            placeholder="Search for songs, artists, or albums..."
            className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500"
          />
          
          {inputValue && (
            <button 
              onClick={() => { setInputValue(''); setSuggestions([]); }}
              className="p-1.5 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {searching && (
            <div className="ml-2 flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00ff85] animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Dropdown ─────────────────────────────────────────────────── */}
      {showDropdown && (inputValue.length > 0 || history.length > 0) && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-3 p-3 bg-[#1a1a1a] border border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
          style={{ animation: 'mh-fadeup 0.2s ease-out' }}
        >
          {/* History */}
          {!inputValue && history.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 px-3">Recent Searches</p>
              {history.map(item => (
                <button
                  key={item}
                  onClick={() => handleSearch(item)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-zinc-300 transition-colors text-left"
                >
                  <History className="w-4 h-4 text-zinc-500" />
                  {item}
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {inputValue && suggestions.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 px-3">Suggestions</p>
              {suggestions.slice(0, 6).map(s => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-zinc-300 transition-colors text-left"
                >
                  <Search className="w-4 h-4 text-zinc-500" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Quick Filters (UI Only) */}
          <div className="mt-4 pt-4 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
            {[
              { label: 'Songs',   icon: Music,    color: '#00ff85' },
              { label: 'Artists', icon: User,     color: '#0ea5e9' },
              { label: 'Albums',  icon: Disc,     color: '#ff24e4' },
            ].map(f => (
              <button key={f.label} onClick={() => handleSearch(`${inputValue} ${f.label.toLowerCase()}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-xs font-bold transition-all hover:bg-white/10 hover:border-white/20 whitespace-nowrap">
                <f.icon className="w-3.5 h-3.5" style={{ color: f.color }} />
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
