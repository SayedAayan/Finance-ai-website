import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, Search, Bell, Sparkles, X } from 'lucide-react';
import { mockStocks, mockFunds } from '../../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ onToggleAIChat }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const active = (p) => loc.pathname === p;

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Reliance Q1 Results',
      desc: 'Reliance Industries Q1 net profit up 10%, beating analyst estimates.',
      time: '2 hours ago',
      read: false,
      link: '/stock/RELIANCE'
    },
    {
      id: 2,
      title: 'TCS Target Price Alert',
      desc: 'TCS dropped below ₹3,900. Sector analysis suggests support level.',
      time: '5 hours ago',
      read: false,
      link: '/stock/TCS'
    },
    {
      id: 3,
      title: 'Premium Plan Subscription',
      desc: 'Connect your Demat account to sync your portfolio automatically. Go premium.',
      time: '1 day ago',
      read: false,
      link: '/settings'
    }
  ]);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
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
        if (active && data.indices) setMarketData(data.indices);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredResults([]);
      setShowSuggestions(false);
      return;
    }

    const matchedStocks = mockStocks.filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.ticker.toLowerCase().includes(query.toLowerCase())
    ).map(s => ({
      id: s.id,
      name: s.name,
      symbol: s.ticker,
      type: 'Stock',
      link: `/stock/${s.id}`,
      subtitle: `₹${s.price.toLocaleString()} (${s.changePercent >= 0 ? '+' : ''}${s.changePercent}%)`
    }));

    const matchedFunds = mockFunds.filter(f =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.category.toLowerCase().includes(query.toLowerCase())
    ).map(f => ({
      id: f.id,
      name: f.name,
      symbol: f.category,
      type: 'Mutual Fund',
      link: `/fund/${f.id}`,
      subtitle: `NAV: ₹${f.nav.toLocaleString()} (${f.navChangePercent >= 0 ? '+' : ''}${f.navChangePercent}%)`
    }));

    setFilteredResults([...matchedStocks, ...matchedFunds]);
    setShowSuggestions(true);
  };

  const handleSelectResult = (link) => {
    navigate(link);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clickNotification = (n) => {
    setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item));
    setShowNotifications(false);
    navigate(n.link);
  };

  return (
    <div className="sticky top-0 z-[100] flex flex-col shadow-sm">
      {/* Ticker Bar */}
      {marketData.length > 0 && (
        <div className="bg-gray-900 text-white text-[12px] font-medium py-1.5 overflow-hidden flex whitespace-nowrap border-b border-gray-800">
          <div className="flex gap-8 px-6 animate-[marquee_25s_linear_infinite]">
            {marketData.concat(marketData).map((idx, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-gray-400">{idx.label}</span>
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
      )}
      <motion.nav 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-100"
      >
      <div className="max-w-[1400px] mx-auto px-10 h-[80px] flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
            <TrendingUp size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="font-sans font-bold text-xl text-textMain tracking-tight">
            StockBuzz
          </span>
        </Link>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50/80 p-1 rounded-full border border-gray-100">
          {[
            { path: '/', label: 'Home' },
            { path: '/compare', label: 'Compare' },
            { path: '/watchlist', label: 'Watchlist' },
            { path: '/markets', label: 'Markets' },
            { path: '/news', label: 'News' }
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-5 py-2 rounded-full text-[0.9rem] font-medium transition-all duration-200 ${
                active(item.path)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-textMuted hover:text-textMain hover:bg-gray-100/50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right: Search, Notification, Profile/CTA */}
        <div className="flex items-center gap-4">
          
          {/* Search Bar */}
          <div className="relative hidden lg:block" ref={searchRef}>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 w-[280px] h-[46px] shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-300">
              <Search size={16} className="text-textMuted" />
              <input 
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                placeholder="Search stocks, funds…" 
                className="bg-transparent border-none outline-none text-sm text-textMain placeholder-textMuted w-full"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setFilteredResults([]); }} className="text-textMuted hover:text-textMain">
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
                  className="absolute top-[calc(100%+8px)] left-0 w-full max-h-[300px] overflow-y-auto z-50 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl py-2"
                >
                  {filteredResults.length > 0 ? (
                    filteredResults.map((result) => (
                      <div 
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelectResult(result.link)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-textMain text-[0.9rem]">{result.name}</span>
                          <span className={`text-[0.7rem] px-2 py-0.5 rounded font-semibold ${result.type === 'Stock' ? 'bg-blue-50 text-primary' : 'bg-violet-50 text-violet-600'}`}>
                            {result.type}
                          </span>
                        </div>
                        <div className="flex justify-between text-[0.75rem] text-textMuted mt-1">
                          <span>{result.symbol}</span>
                          <span>{result.subtitle}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-textMuted text-sm">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-textMuted hover:text-textMain"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-[calc(100%+12px)] right-0 w-[340px] z-50 bg-white/98 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-2xl p-4"
                >
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <h4 className="font-bold text-textMain">Notifications</h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-primary text-xs font-semibold hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => clickNotification(n)}
                          className={`p-3 rounded-2xl cursor-pointer transition-colors ${n.read ? 'hover:bg-gray-50' : 'bg-blue-50/50 border border-blue-100/50 hover:bg-blue-50'}`}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`font-semibold text-sm ${n.read ? 'text-textMuted' : 'text-textMain'}`}>{n.title}</span>
                            <span className="text-xs text-textMuted whitespace-nowrap ml-2">{n.time}</span>
                          </div>
                          <p className="text-xs text-textMuted mt-1 leading-relaxed">{n.desc}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-textMuted text-sm">
                        No notifications
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ask AI Button */}
          <button 
            onClick={onToggleAIChat}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 h-[44px] rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Sparkles size={16} />
            Ask AI
          </button>

        </div>
      </div>
    </motion.nav>
    </div>
  );
}
