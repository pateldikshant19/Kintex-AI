import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Shield, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { addRecentlyViewed } from '../utils/publicStorage';

const MOCK_RESULTS = [
  { id: '1', type: 'player', title: 'Virat Kohli', subtitle: 'Royal Challengers Bangalore', icon: User, link: '/player/1' },
  { id: '2', type: 'player', title: 'MS Dhoni', subtitle: 'Chennai Super Kings', icon: User, link: '/player/2' },
  { id: '6', type: 'player', title: 'Rohit Sharma', subtitle: 'Mumbai Indians', icon: User, link: '/player/3' },
  { id: '7', type: 'player', title: 'Joe Root', subtitle: 'Rajasthan Royals', icon: User, link: '/player/4' },
  { id: '8', type: 'player', title: 'Jos Buttler', subtitle: 'Rajasthan Royals', icon: User, link: '/player/5' },
  { id: '3', type: 'team', title: 'Mumbai Indians', subtitle: 'Franchise', icon: Shield, link: '/teams' },
  { id: '4', type: 'report', title: 'IPL 2026 Pitch Analysis', subtitle: 'Analytics Report', icon: FileText, link: '/analytics' },
  { id: '9', type: 'report', title: 'Fast Bowling Mechanics', subtitle: 'Analytics Report', icon: FileText, link: '/analytics' },
  { id: '5', type: 'article', title: 'T20 World Cup 2026 Preview', subtitle: 'Sports Article', icon: FileText, link: '/home' },
  { id: '10', type: 'match', title: 'MI vs CSK', subtitle: 'Live Cricket Match', icon: Calendar, link: '/cricket-lab' }
];

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const filtered = MOCK_RESULTS.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.subtitle.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query]);

  const handleResultClick = (item) => {
    addRecentlyViewed({ ...item, viewedAt: Date.now() });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Search Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#13131a] rounded-xl shadow-2xl border border-slate-200 dark:border-[#1e1e2a] overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Area */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-[#1e1e2a]">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white text-lg placeholder-slate-400"
            placeholder="Search players, teams, reports..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#1e1e2a] text-slate-500 transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto flex-1 p-2">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm">Type to start searching</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((result) => {
                const Icon = result.icon;
                return (
                  <Link
                    key={result.id}
                    to={result.link}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center px-3 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1e1e2a] transition-colors group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1a1a24] flex items-center justify-center mr-4 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 text-slate-500 group-hover:text-blue-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{result.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{result.subtitle}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-[#1e1e2a] bg-slate-50 dark:bg-[#0a0a0c] flex items-center justify-between text-xs text-slate-500">
          <span>Search powered by Kinetix AI</span>
          <div className="flex items-center gap-1">
            <span>Navigate with</span>
            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[10px]">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[10px]">↓</kbd>
            <span>to select</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
