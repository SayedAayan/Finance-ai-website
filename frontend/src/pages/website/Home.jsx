import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, ArrowRight, BookOpen, TrendingUp, BarChart2, Plus, ArrowUpRight, TrendingDown, Activity, Newspaper, Landmark, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mockStocks, mockNews } from '../../data/mockData';
import MarketGraphPanel from '../../components/features/MarketGraphPanel';
import { useCurrency } from '../../context/CurrencyContext';
import { useCms } from '../../context/CmsContext';
import CountingNumber from '../../components/ui/CountingNumber';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '/api/chat';

const generateSparklineData = (start, trend) => Array.from({ length: 15 }, (_, i) => ({ value: start + (Math.random() * 20 - 10) + (trend === 'up' ? i * 5 : -i * 2) }));

const COMPANY_DOMAINS = {
  'RELIANCE': 'ril.com',
  'TCS': 'tcs.com',
  'HDFCBANK': 'hdfcbank.com',
  'APSEZ': 'adaniports.com',
  'SUNPHARMA': 'sunpharma.com',
  'INFY': 'infosys.com',
  'TATAMOTORS': 'tatamotors.com',
  'AARTISURF': 'aarti-surfactants.com',
};

const COMPANY_LOGOS = {
  'RELIANCE': { bg: 'bg-gradient-to-br from-orange-400 to-red-500', label: 'R' },
  'TCS': { bg: 'bg-gradient-to-br from-blue-800 to-blue-950', label: 'TCS' },
  'HDFCBANK': { bg: 'bg-gradient-to-br from-red-600 to-red-700', label: 'H' },
  'APSEZ': { bg: 'bg-gradient-to-br from-sky-500 to-blue-700', label: 'A' },
  'SUNPHARMA': { bg: 'bg-gradient-to-br from-amber-400 to-orange-500', label: 'SP' },
  'INFY': { bg: 'bg-gradient-to-br from-teal-500 to-cyan-700', label: 'IN' },
  'TATAMOTORS': { bg: 'bg-gradient-to-br from-slate-600 to-slate-800', label: 'TM' },
};
console.log('LOGO KEY:', import.meta.env.VITE_LOGO_DEV_KEY);
const FORCE_FALLBACK = ['AARTISURF'];

const CompanyLogo = ({ ticker, size = 40 }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const cleanTicker = ticker ? ticker.split('.')[0] : '';
  const domain = COMPANY_DOMAINS[cleanTicker];
  const { bg, label } = COMPANY_LOGOS[cleanTicker] || { bg: 'bg-gradient-to-br from-gray-400 to-gray-600', label: cleanTicker?.[0] || '?' };
  const fontSize = label.length > 2 ? size * 0.24 : label.length === 2 ? size * 0.32 : size * 0.42;

  const logoDevKey = import.meta.env.VITE_LOGO_DEV_KEY;

  if (domain && logoDevKey && !imgFailed && !FORCE_FALLBACK.includes(cleanTicker)) {
    return (
      <img
        src={`https://img.logo.dev/${domain}?token=${logoDevKey}&size=${size * 3}&retina=true`}
        alt={ticker}
        width={size}
        height={size}
        onError={() => setImgFailed(true)}
        className="rounded-full object-contain bg-white border border-gray-100 dark:border-gray-800 flex-shrink-0 shadow-sm p-1.5"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full ${bg} text-white font-bold flex-shrink-0 shadow-sm`}
      style={{ width: size, height: size, fontSize }}
    >
      {label}
    </div>
  );
};

const DEFAULT_INDICES = [
  { name: 'NIFTY 50', value: '24,854.35', change: '+216.65', percent: '+0.88%', trend: 'up', data: generateSparklineData(24000, 'up') },
  { name: 'SENSEX', value: '81,362.51', change: '+689.72', percent: '+0.85%', trend: 'up', data: generateSparklineData(80000, 'up') },
  { name: 'NIFTY BANK', value: '52,158.95', change: '+443.30', percent: '+0.86%', trend: 'up', data: generateSparklineData(51000, 'up') },
  { name: 'USD/INR', value: '83.12', change: '-0.03', percent: '-0.04%', trend: 'down', data: generateSparklineData(83.5, 'down') }
];

export default function Home({ onOpenAIChat }) {
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const speechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const [marketMoverTab, setMarketMoverTab] = useState('gainers');
  const [stocks, setStocks] = useState(mockStocks);
  const [marketIndices, setMarketIndices] = useState(DEFAULT_INDICES);
  const { formatPrice } = useCurrency();
  const { cmsConfig } = useCms();
  const [featuredNews, setFeaturedNews] = useState(null);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  // Fetch today's most-searched queries, refreshed every 5 minutes
  useEffect(() => {
    let cancelled = false;
    const loadTrending = () => {
      fetch('/api/trending?limit=4')
        .then(r => r.json())
        .then(data => { if (!cancelled) setTrending(data.trending || []); })
        .catch(() => { });
    };
    loadTrending();
    const iv = setInterval(loadTrending, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const symbols = mockStocks.map(s => `${s.ticker}.NS`).join(',');
    fetch(`/api/quotes?symbols=${symbols}`)
      .then(r => r.json())
      .then(({ quotes }) => {
        if (cancelled || !Array.isArray(quotes)) return;
        setStocks(mockStocks.map(stock => {
          const q = quotes.find(q => q.symbol === `${stock.ticker}.NS`);
          if (!q || q.error || !q.currentPrice) return stock;
          return { ...stock, price: q.currentPrice, changePercent: Number(q.changePercent) };
        }));
      })
      .catch(() => { });

    fetch('/api/market-overview')
      .then(r => r.json())
      .then(({ indices }) => {
        if (cancelled || !Array.isArray(indices)) return;
        setMarketIndices(indices.map(idx => {
          if (idx.error || !idx.currentPrice) return DEFAULT_INDICES.find(d => d.name === idx.label) || DEFAULT_INDICES[0];
          const trend = Number(idx.changePercent) >= 0 ? 'up' : 'down';
          return {
            name: idx.label,
            value: Number(idx.currentPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 }),
            change: `${idx.change >= 0 ? '+' : ''}${idx.change}`,
            percent: `${idx.changePercent >= 0 ? '+' : ''}${idx.changePercent}%`,
            trend,
            data: generateSparklineData(Number(idx.currentPrice), trend)
          };
        }));
      })
      .catch(() => { });

    return () => { cancelled = true; };
  }, []);

  // Fetch featured news (article with image, pinned for the day)
  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(data => {
        const articles = data.articles || [];
        const today = new Date().toDateString();
        let cached = {};
        try { cached = JSON.parse(localStorage.getItem('sb_featured_news') || '{}'); } catch { }
        let pick = null;
        if (cached.date === today && articles.find(a => a.link === cached.link)) {
          pick = articles.find(a => a.link === cached.link);
        } else {
          pick = articles.find(a => a.image) || articles[0];
          if (pick) { try { localStorage.setItem('sb_featured_news', JSON.stringify({ date: today, link: pick.link })); } catch { } }
        }
        setFeaturedNews(pick || null);
      })
      .catch(() => { });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    navigate('/chat', { state: { initialFile: file } });
  };

  const handleAsk = (textArg, viaVoice = false) => {
    const q = typeof textArg === 'string' ? textArg : input;
    if (!q.trim()) return;
    navigate('/chat', { state: { initialMessage: q, viaVoice } });
    setInput('');
  };

  const toggleListening = () => {
    if (!speechSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleAsk(transcript, true);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const DEFAULT_SUGGESTIONS = [
    { label: 'What is P/E ratio?', icon: <BookOpen size={16} /> },
    { label: 'Tell me about Reliance', icon: <TrendingUp size={16} /> },
    { label: 'HDFC Flexi Cap Fund', icon: <BarChart2 size={16} /> },
    { label: 'Compare TCS vs Reliance', icon: <Activity size={16} /> }
  ];

  const TRENDING_ICON = { stock: <TrendingUp size={16} />, fund: <BarChart2 size={16} />, amc: <Landmark size={16} /> };

  // Trim verbose plan/option suffixes so fund names stay short enough for a single-row chip
  const shortenLabel = (label) => label.replace(/\s*-\s*(Growth Option|Growth Plan|Direct Plan|Regular Plan|Direct|Regular|Growth).*/i, '').trim();

  const trendingSuggestions = trending.map(t => ({ label: shortenLabel(t.label), icon: TRENDING_ICON[t.type] || <Activity size={16} />, trending: true }));
  const suggestions = trendingSuggestions.length >= 4
    ? trendingSuggestions.slice(0, 4)
    : [...trendingSuggestions, ...DEFAULT_SUGGESTIONS].slice(0, 4);

  const sortedGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  const sortedLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);
  const marketMovers = marketMoverTab === 'gainers' ? sortedGainers : sortedLosers;

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } } };
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-gray-950">
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 relative">
        <div className="relative z-10 w-full mx-auto py-6 flex flex-col items-center">

          <div className="w-full flex flex-col items-center">

            {/* NEW LANDING PAGE HERO SECTION */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={containerVariants}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-10 md:py-16"
            >
              {/* Left column: Value Proposition & CTAs */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-5 border border-blue-100 dark:border-blue-500/20">
                  <Sparkles size={13} className="text-blue-600 dark:text-blue-400" /> Next-Gen AI Financial Analyst
                </span>
                <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-[1.15] mb-5 font-sans">
                  Smart Wealth Building, <br />
                  <span className="bg-gradient-to-r from-blue-50 to-blue-700 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #3b82f6, #1d4ed8)' }}>Powered by AI.</span>
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mb-8 leading-relaxed">
                  Analyze stocks, track mutual funds, verify Demat statements, and compare performance with real-time market insights. All in one intelligent workspace.
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  <motion.button
                    whileHover={{ y: -2, scale: 1.02, boxShadow: '0 10px 30px rgba(37,99,235,0.08)' }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    onClick={() => navigate('/chat')}
                    className="px-6 py-3 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 hover:opacity-95 hover:shadow-lg transition-all"
                    style={{ background: 'linear-gradient(to right, #3b82f6, #1d4ed8)' }}
                  >
                    Start AI Research
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -2, scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)', borderColor: '#3b82f6' }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    onClick={() => navigate('/compare')}
                    className="px-6 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-xl font-semibold transition-all shadow-sm"
                  >
                    Compare Assets
                  </motion.button>
                </div>
              </div>

              {/* Right column: Search & Quick Chat Access */}
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                className="lg:col-span-5 w-full bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xl shadow-gray-100/50 dark:shadow-none relative"
              >
                <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                  Live Terminal
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-mono ml-1">stockbuzz-ai-v1.0</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Ask anything to get started:</h3>
                  <button
                    onClick={() => navigate('/chat', { state: { forceNewChat: true } })}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Go to Chat <ArrowRight size={12} />
                  </button>
                </div>

                <div className="relative flex items-center bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 h-[52px] mb-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-250">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="mr-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"><Plus size={20} /></button>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                    placeholder="e.g. Compare TCS vs Reliance"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-455 dark:placeholder:text-gray-500"
                  />
                  {speechSupported && (
                    <button
                      onClick={toggleListening}
                      className={`w-[32px] h-[32px] rounded-full flex items-center justify-center mr-1 transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-blue-600'}`}
                      title={isListening ? 'Stop listening' : 'Speak your question'}
                    ><Mic size={15} /></button>
                  )}
                  <button onClick={() => handleAsk()} disabled={!input.trim()} className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700">
                    <Send size={12} className="ml-0.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Suggested Prompts</span>
                  {suggestions.slice(0, 3).map((s, i) => (
                    <button key={i} onClick={() => handleAsk(s.label)} className="flex items-center gap-2 text-left px-3 py-2 bg-gray-50 dark:bg-gray-950 hover:bg-blue-50 dark:hover:bg-blue-500/5 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800/50 transition-colors truncate">
                      <span className="text-blue-500 shrink-0">{s.icon}</span>
                      <span className="truncate text-[11px]">{s.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* SERVICES & FEATURES SUMMARY CARDS */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={itemVariants} className="w-full py-10 px-6 sm:px-10 mb-10 bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 shadow-sm rounded-[32px]">
              <div className="text-center mb-8">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">Features & Services</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">What Stockbuzz Offers</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div onClick={() => navigate('/chat')} whileHover={{ y: -6, scale: 1.01, borderColor: '#3b82f6', boxShadow: '0 10px 30px rgba(37,99,235,0.08)' }} transition={{ duration: 0.3, ease: 'easeOut' }} className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 shadow-sm p-5 rounded-2xl hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900/50 transition-all flex flex-col items-start cursor-pointer group">
                  <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Sparkles size={20} />
                  </motion.div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Stockbuzz AI</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Context-aware conversational agent that answers financial queries, formats data, and tracks market sentiment.</p>
                </motion.div>
                <motion.div onClick={() => navigate('/compare')} whileHover={{ y: -6, scale: 1.01, borderColor: '#3b82f6', boxShadow: '0 10px 30px rgba(37,99,235,0.08)' }} transition={{ duration: 0.3, ease: 'easeOut' }} className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 shadow-sm p-5 rounded-2xl hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900/50 transition-all flex flex-col items-start cursor-pointer group">
                  <motion.div whileHover={{ rotate: -10, scale: 1.1 }} className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Activity size={20} />
                  </motion.div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Technical Comparison</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Run side-by-side comparisons of multiple tickers to analyze price action, returns, and fundamental valuation metrics.</p>
                </motion.div>
                <motion.div onClick={() => navigate('/mutual-funds')} whileHover={{ y: -6, scale: 1.01, borderColor: '#3b82f6', boxShadow: '0 10px 30px rgba(37,99,235,0.08)' }} transition={{ duration: 0.3, ease: 'easeOut' }} className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 shadow-sm p-5 rounded-2xl hover:shadow-xl hover:border-green-200 dark:hover:border-green-900/50 transition-all flex flex-col items-start cursor-pointer group">
                  <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                    <Landmark size={20} />
                  </motion.div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">AMFI Fund Explorer</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Direct AMFI API connection to search and browse historical NAV prices across major Indian mutual fund houses.</p>
                </motion.div>
                <motion.div onClick={() => navigate('/watchlist')} whileHover={{ y: -6, scale: 1.01, borderColor: '#3b82f6', boxShadow: '0 10px 30px rgba(37,99,235,0.08)' }} transition={{ duration: 0.3, ease: 'easeOut' }} className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 shadow-sm p-5 rounded-2xl hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all flex flex-col items-start cursor-pointer group">
                  <motion.div whileHover={{ rotate: -10, scale: 1.1 }} className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <BookOpen size={20} />
                  </motion.div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Demat Verification</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Upload Demat statement files to automatically audit holdings and get allocation feedback recommendations.</p>
                </motion.div>
              </div>
            </motion.div>

            {cmsConfig?.pages?.home?.features?.showFeaturedNews && featuredNews && (
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={itemVariants} className="w-full mb-6">
                <div
                  className="bg-white dark:bg-gray-900 rounded-[22px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 grid grid-cols-1 md:grid-cols-3"
                  onClick={() => navigate('/news')}
                >
                  {featuredNews.image && (
                    <div className="h-[200px] md:h-full overflow-hidden md:col-span-1">
                      <img
                        src={featuredNews.image}
                        alt={featuredNews.title}
                        onError={e => { e.target.parentElement.style.display = 'none'; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', transition: 'transform 0.4s' }}
                        onMouseEnter={e => { e.target.style.transform = 'scale(1.04)'; }}
                        onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
                      />
                    </div>
                  )}
                  <div className="p-5 md:p-7 flex flex-col justify-center gap-3 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontSize: '0.6rem', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>TODAY'S TOP STORY</span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">{featuredNews.source}</span>
                    </div>
                    <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-[18px] md:text-[20px] leading-snug m-0">{featuredNews.title}</h3>
                    {featuredNews.description && (
                      <p className="text-[13px] md:text-[14px] text-gray-500 dark:text-gray-400 m-0 leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{featuredNews.description}</p>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); navigate('/news'); }}
                      className="text-blue-600 dark:text-blue-400 text-[13px] font-bold text-left mt-1 hover:underline bg-transparent border-none p-0 cursor-pointer w-fit"
                    >Read full story →</button>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={itemVariants} className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] mb-12">
              {cmsConfig?.pages?.home?.features?.showTrendingStocks && (
                <motion.div whileHover={{ y: -6, scale: 1.01, borderColor: '#3b82f6', boxShadow: '0 10px 30px rgba(37,99,235,0.08)' }} transition={{ duration: 0.3, ease: 'easeOut' }} className="bg-white dark:bg-gray-900 rounded-[22px] p-[24px] h-[290px] shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 flex flex-col justify-center cursor-default">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-textMain dark:text-gray-100 flex items-center gap-2"><span className="text-xl">🔥</span> Trending Stocks</h3>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/markets')} className="text-primary dark:text-blue-400 text-xs font-bold bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">View all</motion.button>
                  </div>
                  <div className="flex flex-col gap-4">
                    {stocks.slice(0, 3).map((stock, i) => {
                      return (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }} key={stock.id} whileHover={{ scale: 1.02, x: 5 }} className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group">
                          <div className="flex items-center gap-3 min-w-0">
                            <CompanyLogo ticker={stock.ticker} size={40} />
                            <div className="min-w-0">
                              <div className="font-semibold text-textMain truncate text-[13px] group-hover:text-blue-600 transition-colors">{stock.name}</div>
                              <div className="text-[12px] text-textMuted truncate">{stock.ticker}</div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className="font-bold text-textMain text-[13px]">{formatPrice(stock.price)}</div>
                            <div className={`text-[12px] font-semibold ${stock.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%</div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {cmsConfig?.pages?.home?.features?.showMarketMovers && (
                <motion.div whileHover={{ y: -6, scale: 1.01, borderColor: '#3b82f6', boxShadow: '0 10px 30px rgba(37,99,235,0.08)' }} transition={{ duration: 0.3, ease: 'easeOut' }} className="bg-white dark:bg-gray-900 rounded-[22px] p-[24px] h-[290px] shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 flex flex-col justify-center cursor-default">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-textMain flex items-center gap-2"><TrendingUp size={18} className="text-gray-400 dark:text-gray-500" /> Market Movers</h3>
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
                      <button onClick={() => setMarketMoverTab('gainers')} className={`px-4 text-[11px] font-bold py-1.5 rounded-full transition-all ${marketMoverTab === 'gainers' ? 'bg-white dark:bg-gray-700 text-primary dark:text-blue-400 shadow-sm' : 'text-textMuted hover:text-textMain dark:hover:text-gray-100'}`}>Top Gainers</button>
                      <button onClick={() => setMarketMoverTab('losers')} className={`px-4 text-[11px] font-bold py-1.5 rounded-full transition-all ${marketMoverTab === 'losers' ? 'bg-white dark:bg-gray-700 text-textMain dark:text-gray-100 shadow-sm' : 'text-textMuted hover:text-textMain dark:hover:text-gray-100'}`}>Top Losers</button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {marketMovers.map((stock, i) => {
                      return (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} key={stock.id} whileHover={{ scale: 1.03, x: 5 }} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group">
                          <div className="flex items-center gap-3 min-w-0">
                            <CompanyLogo ticker={stock.ticker} size={32} />
                            <div className="min-w-0">
                              <div className="font-semibold text-textMain truncate text-[13px] group-hover:text-blue-600 transition-colors">{stock.name}</div>
                              <div className="text-[12px] text-textMuted truncate">{stock.ticker}</div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className="font-semibold text-textMain text-[13px]">{formatPrice(stock.price)}</div>
                            <div className={`text-[12px] font-semibold ${stock.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%</div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {cmsConfig?.pages?.home?.features?.showMarketPulse && (
                <motion.div whileHover={{ y: -6, scale: 1.01, borderColor: '#3b82f6', boxShadow: '0 10px 30px rgba(37,99,235,0.08)' }} transition={{ duration: 0.3, ease: 'easeOut' }} className="bg-white dark:bg-gray-900 rounded-[22px] p-[24px] h-[290px] shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-textMain dark:text-gray-100 flex items-center gap-2"><Newspaper size={18} className="text-gray-400 dark:text-gray-500" /> Market Pulse</h3>
                    <button onClick={() => navigate('/news')} className="text-primary dark:text-blue-400 text-xs font-bold bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full">View all</button>
                  </div>
                  <div className="relative overflow-hidden flex-1 [mask-image:linear-gradient(to_bottom,transparent,black_12px,black_calc(100%-12px),transparent)]">
                    <div className="flex flex-col gap-2.5 animate-[news-scroll_18s_linear_infinite] hover:[animation-play-state:paused]">
                      {[...mockNews, ...mockNews].map((article, i) => (
                        <div
                          key={`${article.id}-${i}`}
                          onClick={() => navigate('/news')}
                          className="bg-gray-50 dark:bg-gray-800/60 rounded-[14px] p-3 border border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group shrink-0"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${article.sentiment === 'positive' ? 'bg-green-100 dark:bg-green-500/10 text-success' : article.sentiment === 'negative' ? 'bg-red-100 dark:bg-red-500/10 text-danger' : 'bg-gray-100 dark:bg-gray-800 text-textMuted dark:text-gray-400'}`}>
                              {article.sentiment === 'positive' && <TrendingUp size={10} className="inline mr-0.5 -mt-0.5" />}
                              {article.sentiment === 'negative' && <TrendingDown size={10} className="inline mr-0.5 -mt-0.5" />}
                              {article.source}
                            </span>
                            <span className="text-[11px] text-textMuted dark:text-gray-500">{article.time}</span>
                          </div>
                          <p className="text-[12.5px] font-semibold text-textMain dark:text-gray-100 leading-snug line-clamp-2 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                            {article.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {cmsConfig?.pages?.home?.features?.showMarketSnapshot && (
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={itemVariants} whileHover={{ y: -4, scale: 1.005, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }} className="w-full bg-white dark:bg-gray-900 rounded-[20px] p-[18px] md:p-[24px] shadow-sm border border-gray-100 dark:border-gray-800 mb-6 mx-auto flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 transition-all cursor-default">
                <div className="w-full xl:w-auto xl:min-w-[160px] flex justify-between xl:block items-center xl:pl-2">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">Market<br className="hidden xl:block" />Snapshot</h3>
                  <button onClick={() => navigate('/markets')} className="xl:hidden px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">View All</button>
                </div>
                <div className="w-full xl:flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 xl:gap-0 xl:flex xl:justify-between xl:px-8">
                  {marketIndices.map((idx, i) => (
                    <div key={i} className="flex flex-col xl:w-[140px]">
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{idx.name}</span>
                      <span className="text-[15px] md:text-[17px] font-extrabold text-gray-900 dark:text-gray-100 mb-1"><CountingNumber value={idx.value} /></span>
                      <span className={`text-[11px] font-bold ${idx.trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>{idx.change} ({idx.percent}) {idx.trend === 'up' ? <ArrowUpRight size={12} /> : <TrendingDown size={12} />}</span>
                    </div>
                  ))}
                </div>
                <div className="hidden xl:flex xl:w-[140px] justify-end pr-2"><button onClick={() => navigate('/markets')} className="px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-800 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">View Markets</button></div>
              </motion.div>
            )}

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={itemVariants} className="w-full mb-12">
              <MarketGraphPanel />
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={itemVariants} className="w-full bg-white dark:bg-gray-900 rounded-[22px] p-[24px] shadow-sm border border-gray-100 dark:border-gray-800 mb-12">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-textMain dark:text-gray-100 flex items-center gap-2"><BarChart2 size={18} className="text-gray-400 dark:text-gray-500" /> All Stocks</h3>
                <button onClick={() => navigate('/markets')} className="text-primary dark:text-blue-400 text-xs font-bold bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">View all</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stocks.map(stock => (
                  <div key={stock.id} onClick={() => navigate(`/stock/${stock.ticker}`)} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <CompanyLogo ticker={stock.ticker} size={36} />
                      <div className="min-w-0">
                        <div className="font-semibold text-textMain dark:text-gray-100 truncate text-[13px]">{stock.name}</div>
                        <div className="text-[12px] text-textMuted truncate">{stock.ticker} · P/E {stock.peRatio}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="font-bold text-textMain dark:text-gray-100 text-[13px]">{formatPrice(stock.price)}</div>
                      <div className={`text-[12px] font-semibold ${stock.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full grid grid-cols-1 md:grid-cols-3 gap-[24px] mb-12">
              <div onClick={() => navigate('/amcs')} className="bg-white dark:bg-gray-900 rounded-[22px] p-[24px] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400"><Landmark size={20} /></div>
                <h3 className="font-bold text-textMain dark:text-gray-100">AMC & Mutual Fund Database</h3>
                <p className="text-[13px] text-textMuted dark:text-gray-400">Explore live NAVs and fund houses sourced directly from AMFI.</p>
              </div>
              <div onClick={() => navigate('/watchlist')} className="bg-white dark:bg-gray-900 rounded-[22px] p-[24px] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3">
                <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400"><Activity size={20} /></div>
                <h3 className="font-bold text-textMain dark:text-gray-100">Your Watchlist</h3>
                <p className="text-[13px] text-textMuted dark:text-gray-400">Track your favorite stocks and funds with live price alerts.</p>
              </div>
              <div onClick={() => navigate('/compare')} className="bg-white dark:bg-gray-900 rounded-[22px] p-[24px] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3">
                <div className="w-11 h-11 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400"><TrendingUp size={20} /></div>
                <h3 className="font-bold text-textMain dark:text-gray-100">Compare Stocks & Funds</h3>
                <p className="text-[13px] text-textMuted dark:text-gray-400">Side-by-side comparison of fundamentals and performance.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}