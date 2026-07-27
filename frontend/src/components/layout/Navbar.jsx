import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, X, Moon, Sun, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { useCms } from '../../context/CmsContext';

export default function Navbar({ onToggleAIChat }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const { cmsConfig } = useCms();
  const active = (p) => loc.pathname === p;

  const navItems = cmsConfig?.navbar?.navItems || [];
  const mainLinks = navItems.filter(item => !item.subItems);
  const otherLinksData = navItems.find(item => item.subItems);
  const OTHER_LINKS = otherLinksData ? otherLinksData.subItems : [];

  const isOtherActive = OTHER_LINKS.some(item => active(item.path));

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const [showOthers, setShowOthers] = useState(false);
  const othersRef = useRef(null);
  const { isDarkMode, toggleTheme } = useTheme();
  const { currency, setCurrency, currencies } = useCurrency();
  const [showCurrency, setShowCurrency] = useState(false);
  const currencyRef = useRef(null);
  const { currentUser, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutsideCurrency(event) {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setShowCurrency(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutsideCurrency);
    return () => document.removeEventListener('mousedown', handleClickOutsideCurrency);
  }, []);

  useEffect(() => {
    function handleClickOutsideOthers(event) {
      if (othersRef.current && !othersRef.current.contains(event.target)) {
        setShowOthers(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutsideOthers);
    return () => document.removeEventListener('mousedown', handleClickOutsideOthers);
  }, []);

  useEffect(() => {
    function handleClickOutsideUserMenu(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutsideUserMenu);
    return () => document.removeEventListener('mousedown', handleClickOutsideUserMenu);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [marketData, setMarketData] = useState([]);

  useEffect(() => {
    let active = true;
    fetch('/api/market-overview')
      .then(res => res.json())
      .then(data => {
        if (active && data.indices) {
          // Filter and order based on CMS config if available
          const preferredTickers = cmsConfig?.navbar?.tickers || [];
          if (preferredTickers.length > 0) {
            const ordered = preferredTickers.map(t => data.indices.find(idx => idx.label === t || idx.symbol === t)).filter(Boolean);
            setMarketData(ordered.length > 0 ? ordered : data.indices);
          } else {
            setMarketData(data.indices);
          }
        }
      })
      .catch(() => { });
    return () => { active = false; };
  }, [cmsConfig?.navbar?.tickers]);

  const searchDebounceRef = useRef(null);

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
          link: `/fund/${f.schemeCode}`,
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

        setFilteredResults([...stockResults, ...fundResults, ...amcResults]);
        setShowSuggestions(true);
      } catch {
        setFilteredResults([]);
      }
    }, 250);
  };

  const handleSelectResult = (link) => {
    navigate(link);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const siteLogo = cmsConfig?.global?.siteLogo || logo;
  const siteName = cmsConfig?.global?.siteName || 'StockBuzz';
  const askAiLabel = cmsConfig?.navbar?.askAiLabel || 'Ask AI';

  return (
    <div className="sticky top-0 z-[100] flex flex-col shadow-sm">
      {/* Ticker Bar */}
      {marketData.length > 0 && (
        <div className="bg-gray-900 text-white text-[12px] font-medium py-1.5 overflow-hidden flex whitespace-nowrap border-b border-gray-800">
          <div className="container overflow-hidden flex">
            <div className="flex gap-8 animate-[marquee_70s_linear_infinite]">
              {Array(8).fill(marketData).flat().map((idx, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-gray-400">{idx.label || idx.symbol}</span>
                  {idx.error ? (
                    <span className="text-gray-500">N/A</span>
                  ) : (
                    <>
                      <span className="font-semibold">{Number(idx.value || idx.currentPrice).toFixed(2)}</span>
                      <span className={Number(idx.changePercent) >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {Number(idx.changePercent) >= 0 ? '+' : ''}{Number(idx.changePercent).toFixed(2)}%
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <motion.nav
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300"
      >
        <div className="container h-[80px] flex items-center justify-between gap-3">

          {/* Left: Logo */}
          <Link
            to="/"
            className="flex items-center group -ml-6 shrink-0"
            onClick={(e) => {
              if (loc.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <img
              src={siteLogo}
              alt={`${siteName} — Logo`}
              className="w-[140px] md:w-[180px] h-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-2 bg-gray-50/80 dark:bg-gray-900/60 p-1 rounded-full border border-gray-100 dark:border-gray-800 shrink-0">
            {mainLinks.map((item) => (
              <Link
                key={item.id || item.path}
                to={item.path}
                className={`px-3.5 py-2 rounded-full text-[0.87rem] font-medium transition-all duration-200 ${active(item.path)
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-textMuted dark:text-gray-400 hover:text-textMain dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                  }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Others Dropdown */}
            {otherLinksData && OTHER_LINKS.length > 0 && (
              <div className="relative" ref={othersRef} onMouseEnter={() => setShowOthers(true)} onMouseLeave={() => setShowOthers(false)}>
                <button
                  onClick={() => setShowOthers(!showOthers)}
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-full text-[0.87rem] font-medium transition-all duration-200 ${isOtherActive
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'text-textMuted dark:text-gray-400 hover:text-textMain dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                    }`}
                >
                  {otherLinksData.label.replace(' ▾', '')}
                  <ChevronDown size={14} className={`transition-transform duration-200 ${showOthers ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showOthers && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[180px] z-50 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-1.5"
                    >
                      {OTHER_LINKS.map((item) => (
                        <Link
                          key={item.id || item.path}
                          to={item.path}
                          className={`block px-4 py-2.5 rounded-xl text-[0.88rem] font-medium transition-colors ${active(item.path)
                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'text-textMuted dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-textMain dark:hover:text-gray-100'
                            }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right: Search, Currency, Theme, Profile/CTA */}
          <div className="flex items-center gap-2">

            {/* Search Bar */}
            <div className="relative hidden lg:block" ref={searchRef}>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full px-3.5 w-[270px] h-[38px] shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 focus-within:w-[330px] transition-all duration-300">
                <Search size={16} className="text-textMuted dark:text-gray-500" />
                <input
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                  placeholder="Search stocks, Mutual funds..."
                  className="bg-transparent border-none outline-none text-sm text-textMain dark:text-gray-100 placeholder-textMuted dark:placeholder-gray-500 w-full"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setFilteredResults([]); }} className="text-textMuted hover:text-textMain dark:text-gray-500 dark:hover:text-gray-200">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-[calc(100%+8px)] left-0 w-full max-h-[300px] overflow-y-auto z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-2"
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

            {/* Currency Selector */}
            <div className="relative" ref={currencyRef}>
              <button
                onClick={() => setShowCurrency(!showCurrency)}
                className="flex items-center gap-1 px-2.5 h-[38px] rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-textMuted dark:text-gray-400 hover:text-textMain dark:hover:text-gray-100 text-[0.85rem] font-semibold whitespace-nowrap"
                title="Change currency"
              >
                {currencies[currency].symbol} {currency}
                <ChevronDown size={13} className={`transition-transform duration-200 ${showCurrency ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showCurrency && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-[calc(100%+8px)] right-0 w-[200px] max-h-[320px] overflow-y-auto z-50 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-1.5"
                  >
                    {Object.entries(currencies).map(([code, info]) => (
                      <button
                        key={code}
                        onClick={() => { setCurrency(code); setShowCurrency(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[0.88rem] font-medium transition-colors text-left ${currency === code
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'text-textMuted dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-textMain dark:hover:text-gray-100'
                          }`}
                      >
                        <span>{info.symbol} {code}</span>
                        <span className="text-[0.72rem] opacity-70">{info.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-[38px] h-[38px] rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-textMuted dark:text-gray-400 hover:text-textMain dark:hover:text-gray-100"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>



            {/* Ask AI Button */}
            <button
              onClick={onToggleAIChat}
              className="flex items-center justify-center whitespace-nowrap bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-3.5 h-[38px] rounded-full font-semibold text-[0.82rem] shadow-md hover:shadow-lg transition-all duration-300"
            >
              {askAiLabel}
            </button>

            {/* Auth: Sign In button or user avatar menu */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(s => !s)}
                  className="flex items-center justify-center w-[38px] h-[38px] rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold text-sm overflow-hidden"
                  title={currentUser.displayName || currentUser.phoneNumber || 'Account'}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        // If image fails, hide it and show the initial letter instead
                        e.target.style.display = 'none';
                        e.target.parentElement.setAttribute('data-fallback', 'true');
                        e.target.parentElement.innerHTML =
                          `<span style="font-size:1rem;font-weight:700;color:white">${(currentUser.displayName?.[0] || currentUser.email?.[0] || 'U').toUpperCase()}</span>`;
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>
                      {(currentUser.displayName?.[0] || currentUser.email?.[0] || currentUser.phoneNumber?.slice(-1) || 'U').toUpperCase()}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-lg p-2 z-50"
                    >
                      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                        <div className="text-sm font-semibold text-textMain dark:text-gray-100 truncate">{currentUser.displayName || 'Stockbuzz User'}</div>
                        <div className="text-xs text-textMuted dark:text-gray-500 truncate">{currentUser.email || currentUser.phoneNumber}</div>
                      </div>
                      {currentUser.isSuperadmin && (
                        <Link to="/superadmin" onClick={() => setShowUserMenu(false)} className="block px-3 py-2 rounded-lg text-sm text-violet-600 dark:text-violet-400 font-semibold hover:bg-violet-50 dark:hover:bg-violet-500/10">
                          Superadmin Panel
                        </Link>
                      )}
                      <Link to="/settings" onClick={() => setShowUserMenu(false)} className="block px-3 py-2 rounded-lg text-sm text-textMain dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Settings
                      </Link>
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center whitespace-nowrap border border-gray-200 dark:border-gray-800 text-textMain dark:text-gray-100 px-3.5 h-[38px] rounded-full font-semibold text-[0.82rem] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
              >
                Sign in
              </Link>
            )}

          </div>
        </div>
      </motion.nav>
    </div>
  );
}
