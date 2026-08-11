import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar({ className = '', placeholder = "Search stocks, Mutual funds..." }) {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (query.trim().length < 2) {
      setFilteredResults([]);
      setShowSuggestions(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();

        const stockResults = (data.stocks || []).map(s => ({
          id: s.id,
          name: s.name,
          symbol: s.symbol,
          type: 'Stock',
          link: `/stock/${encodeURIComponent(s.ticker)}`,
          subtitle: s.exchange
        }));

        const fundResults = (data.funds || []).map(f => ({
          id: f.id,
          name: f.name,
          symbol: f.plan,
          type: 'Mutual Fund',
          link: `/fund/${encodeURIComponent(f.schemeCode)}`,
          subtitle: `NAV: ₹${f.nav?.toLocaleString?.() ?? f.nav} · ${f.amc}`
        }));

        const amcResults = (data.amcs || []).map(a => ({
          id: a.id,
          name: a.name,
          symbol: `${a.schemeCount} schemes`,
          type: 'AMC',
          link: `/amcs?amc=${encodeURIComponent(a.name)}`,
          subtitle: (a.categories || []).slice(0, 2).join(', ')
        }));

        setFilteredResults([...stockResults, ...fundResults, ...amcResults].slice(0, 8));
        setShowSuggestions(true);
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 300);
  };

  const handleSelectResult = (link) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(link);
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full px-3.5 h-[38px] transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 relative w-full">
        <Search size={16} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => { if (searchQuery.length >= 2) setShowSuggestions(true); }}
          className="bg-transparent border-none outline-none text-[0.85rem] text-textMain dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 w-full"
        />
        
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[300px] max-h-[300px] overflow-y-auto z-50 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-2"
            >
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelectResult(result.link)}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-textMain dark:text-gray-100 text-[0.9rem]">{result.name}</span>
                      <span className={`text-[0.7rem] px-2 py-0.5 rounded font-semibold ${result.type === 'Stock' ? 'bg-blue-50 dark:bg-blue-500/10 text-primary' : 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'}`}>
                        {result.type}
                      </span>
                    </div>
                    <div className="flex justify-between text-[0.75rem] text-textMuted dark:text-gray-500 mt-1">
                      <span>{result.symbol}</span>
                      <span>{result.subtitle}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-textMuted dark:text-gray-500 text-sm">
                  No results found for "{searchQuery}"
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
