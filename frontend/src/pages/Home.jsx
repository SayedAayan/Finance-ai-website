import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, ArrowRight, BookOpen, TrendingUp, BarChart2, Plus, ArrowUpRight, TrendingDown, Activity, Newspaper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mockStocks, mockNews } from '../data/mockData';

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
const CompanyLogo = ({ ticker, size = 40 }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const domain = COMPANY_DOMAINS[ticker];
  const { bg, label } = COMPANY_LOGOS[ticker] || { bg: 'bg-gradient-to-br from-gray-400 to-gray-600', label: ticker?.[0] || '?' };
  const fontSize = label.length > 2 ? size * 0.24 : label.length === 2 ? size * 0.32 : size * 0.42;

  const logoDevKey = import.meta.env.VITE_LOGO_DEV_KEY;

  if (domain && logoDevKey && !imgFailed) {
    return (
      <img
        src={`https://img.logo.dev/${domain}?token=${logoDevKey}&size=${size * 3}&retina=true`}
        alt={ticker}
        width={size}
        height={size}
        onError={() => setImgFailed(true)}
        className="rounded-full object-contain bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex-shrink-0 shadow-sm p-1.5"
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
  const [marketMoverTab, setMarketMoverTab] = useState('gainers');
  const [stocks, setStocks] = useState(mockStocks);
  const [marketIndices, setMarketIndices] = useState(DEFAULT_INDICES);

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

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    navigate('/chat', { state: { initialFile: file } });
  };

  const handleAsk = (textArg) => {
    const q = typeof textArg === 'string' ? textArg : input;
    if (!q.trim()) return;
    navigate('/chat', { state: { initialMessage: q } });
    setInput('');
  };

  const suggestions = [
    { label: 'What is P/E ratio?', icon: <BookOpen size={16} /> },
    { label: 'Tell me about Reliance', icon: <TrendingUp size={16} /> },
    { label: 'HDFC Flexi Cap Fund', icon: <BarChart2 size={16} /> },
    { label: 'Compare TCS vs Reliance', icon: <Activity size={16} /> }
  ];

  const sortedGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  const sortedLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);
  const marketMovers = marketMoverTab === 'gainers' ? sortedGainers : sortedLosers;

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FCFCFF] dark:bg-gray-950">
      <div className="max-w-[1400px] mx-auto w-full px-6 relative">
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-6 flex flex-col items-center">

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full flex flex-col items-center">
            <motion.div variants={itemVariants} className="text-center max-w-[900px] mb-6 w-full flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-[44px] h-[44px] rounded-[14px] bg-white dark:bg-gray-900 shadow-md shadow-blue-500/10 mb-4 border border-gray-100 dark:border-gray-800 text-blue-600 dark:text-blue-400">
                <Sparkles size={22} />
              </div>
              <h1 className="text-[32px] md:text-[42px] font-bold text-textMain dark:text-gray-100 tracking-tight mb-3 leading-tight font-sans">What do you want to research?</h1>
              <p className="text-[17px] leading-[1.5] text-gray-500 dark:text-gray-400 max-w-[700px] mx-auto">Stockbuzz AI helps you analyze stocks, mutual funds, and market trends with real-time data and smart insights.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full max-w-[900px] mb-5 relative">
              <div className="relative flex items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-full shadow-sm px-[20px] h-[60px] transition-all hover:shadow-md focus-within:bg-white dark:focus-within:bg-gray-900 focus-within:shadow-md">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="p-3 text-textMuted hover:text-primary transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full ml-1"><Plus size={24} /></button>

                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAsk()} placeholder="Ask Stockbuzz AI about stocks, mutual funds, or finance..." className="flex-1 bg-transparent border-none outline-none text-base text-textMain px-2 h-full placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                <button onClick={() => handleAsk()} disabled={!input.trim()} className="w-[42px] h-[42px] rounded-full bg-gray-100 dark:bg-gray-800 text-textMuted flex items-center justify-center mr-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white"><Send size={16} className="ml-1" /></button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-[16px] mb-8 w-full max-w-[900px]">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => handleAsk(s.label)} className="flex items-center gap-2 px-[18px] h-[42px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[14px] text-[14px] font-medium text-textMuted shadow-sm hover:shadow-md hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-primary dark:hover:text-blue-400 hover:-translate-y-[2px] transition-all duration-300">
                  {s.icon} <span>{s.label}</span>
                </button>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="w-full max-w-[1200px] bg-white dark:bg-gray-900 rounded-[20px] p-[18px] shadow-sm border border-gray-100 dark:border-gray-800 mb-6 mx-auto flex items-center justify-between">
              <div className="w-[160px] pl-2"><h3 className="font-bold text-textMain dark:text-gray-100 text-lg leading-tight">Market<br />Snapshot</h3></div>
              <div className="flex-1 flex justify-between items-center px-8">
                {marketIndices.map((idx, i) => (
                  <div key={i} className="flex flex-col w-[140px]">
                    <span className="text-[11px] font-bold text-textMuted dark:text-gray-400 uppercase tracking-wider mb-1">{idx.name}</span>
                    <span className="text-[17px] font-extrabold text-textMain dark:text-gray-100 mb-1">{idx.value}</span>
                    <span className={`text-[11px] font-bold ${idx.trend === 'up' ? 'text-success' : 'text-danger'} flex items-center gap-1`}>{idx.change} ({idx.percent}) {idx.trend === 'up' ? <ArrowUpRight size={12} /> : <TrendingDown size={12} />}</span>
                  </div>
                ))}
              </div>
              <div className="w-[140px] flex justify-end pr-2"><button onClick={() => navigate('/markets')} className="px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-800 text-primary dark:text-blue-400 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">View Markets</button></div>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full max-w-[1200px] grid grid-cols-1 xl:grid-cols-3 gap-[24px] mb-12">
              <div className="bg-white dark:bg-gray-900 rounded-[22px] p-[24px] h-[290px] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-textMain dark:text-gray-100 flex items-center gap-2"><span className="text-xl">🔥</span> Trending Stocks</h3>
                  <button onClick={() => navigate('/markets')} className="text-primary dark:text-blue-400 text-xs font-bold bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">View all</button>
                </div>
                <div className="flex flex-col gap-4">
                  {stocks.slice(0, 3).map(stock => {
                    return (
                      <div key={stock.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <CompanyLogo ticker={stock.ticker} size={40} />
                          <div className="min-w-0">
                            <div className="font-semibold text-textMain truncate text-[13px]">{stock.name}</div>
                            <div className="text-[12px] text-textMuted truncate">{stock.ticker}</div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="font-bold text-textMain text-[13px]">₹{stock.price.toFixed(2)}</div>
                          <div className={`text-[12px] font-semibold ${stock.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[22px] p-[24px] h-[290px] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-textMain flex items-center gap-2"><TrendingUp size={18} className="text-gray-400 dark:text-gray-500" /> Market Movers</h3>
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
                    <button onClick={() => setMarketMoverTab('gainers')} className={`px-4 text-[11px] font-bold py-1.5 rounded-full transition-all ${marketMoverTab === 'gainers' ? 'bg-white dark:bg-gray-700 text-primary dark:text-blue-400 shadow-sm' : 'text-textMuted hover:text-textMain dark:hover:text-gray-100'}`}>Top Gainers</button>
                    <button onClick={() => setMarketMoverTab('losers')} className={`px-4 text-[11px] font-bold py-1.5 rounded-full transition-all ${marketMoverTab === 'losers' ? 'bg-white dark:bg-gray-700 text-textMain dark:text-gray-100 shadow-sm' : 'text-textMuted hover:text-textMain dark:hover:text-gray-100'}`}>Top Losers</button>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {marketMovers.map(stock => {
                    return (
                      <div key={stock.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all hover:scale-[1.02]">
                        <div className="flex items-center gap-3 min-w-0">
                          <CompanyLogo ticker={stock.ticker} size={32} />
                          <div className="min-w-0">
                            <div className="font-semibold text-textMain truncate text-[13px]">{stock.name}</div>
                            <div className="text-[12px] text-textMuted truncate">{stock.ticker}</div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="font-semibold text-textMain text-[13px]">₹{stock.price.toFixed(2)}</div>
                          <div className={`text-[12px] font-semibold ${stock.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[22px] p-[24px] h-[290px] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 flex flex-col">
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
              </div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </div>
  );
}