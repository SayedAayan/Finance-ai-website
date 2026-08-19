import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Activity, Globe, DollarSign, Clock, Sparkles, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useMarket, MARKET_OPTIONS } from '../../context/MarketContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const ADR_LINKS = [
  { indianName: 'Infosys Ltd (NSE)', indianTicker: 'INFY.NS', usName: 'Infosys ADR (NYSE)', usTicker: 'INFY', ratio: '1 ADR = 1 Share' },
  { indianName: 'HDFC Bank Ltd (NSE)', indianTicker: 'HDFCBANK.NS', usName: 'HDFC Bank ADR (NYSE)', usTicker: 'HDB', ratio: '1 ADR = 3 Shares' },
  { indianName: 'ICICI Bank Ltd (NSE)', indianTicker: 'ICICIBANK.NS', usName: 'ICICI Bank ADR (NYSE)', usTicker: 'IBN', ratio: '1 ADR = 2 Shares' },
  { indianName: 'Wipro Ltd (NSE)', indianTicker: 'WIPRO.NS', usName: 'Wipro ADR (NYSE)', usTicker: 'WIT', ratio: '1 ADR = 1 Share' },
  { indianName: 'Tata Motors Ltd (NSE)', indianTicker: 'TATAMOTORS.NS', usName: 'Tata Motors ADR (NYSE)', usTicker: 'TTM', ratio: '1 ADR = 5 Shares' },
  { indianName: 'AstraZeneca PLC (LSE)', indianTicker: 'AZN.L', usName: 'AstraZeneca ADR (NASDAQ)', usTicker: 'AZN', ratio: '1 ADR = 2 Shares' }
];

export default function Markets() {
  const { selectedMarket, setSelectedMarket, formatMarketPrice, currencyMode, toggleCurrencyMode, fxRates } = useMarket();
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const activeMarketMeta = MARKET_OPTIONS.find(m => m.code === selectedMarket) || MARKET_OPTIONS[0];

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_URL}/markets/${selectedMarket}/overview`);
      if (res.ok) {
        const data = await res.json();
        setOverviewData(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOverview();
    const interval = setInterval(fetchOverview, 45000);
    return () => clearInterval(interval);
  }, [selectedMarket]);

  const status = overviewData?.status || { status: 'OPEN', label: 'Market Open', color: 'emerald' };
  const benchmarks = overviewData?.benchmarks || [];
  const movers = overviewData?.movers || [];

  return (
    <div className="flex-1 bg-[#F8FAFC] dark:bg-gray-950 min-h-screen">
      <div className="container py-8 md:py-12">
        
        {/* Header & Market Switcher Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{activeMarketMeta.flag}</span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                {activeMarketMeta.name} Markets
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm flex items-center gap-2">
              <Globe size={15} /> Real-time exchange feeds ({activeMarketMeta.exchange})
            </p>
          </div>

          {/* Right Status Pill & Currency Mode Toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Pill */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs ${
              status.status === 'OPEN'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                : status.status === 'PRE_MARKET'
                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                status.status === 'OPEN' ? 'bg-emerald-500 animate-pulse' : status.status === 'PRE_MARKET' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              <span>{status.label}</span>
              {status.localTime && <span className="opacity-70">({status.localTime})</span>}
            </div>

            {/* Currency Mode Toggle */}
            <button
              onClick={toggleCurrencyMode}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:border-blue-500 transition-all shadow-xs"
              title="Toggle Native vs Converted INR Currency View"
            >
              <DollarSign size={13} className="text-blue-500" />
              <span>{currencyMode === 'NATIVE' ? 'Native Currencies' : 'Auto Converted (INR)'}</span>
            </button>
          </div>
        </div>

        {/* Market Quick Selector Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {MARKET_OPTIONS.map((m) => {
            const isSelected = selectedMarket === m.code;
            return (
              <button
                key={m.code}
                onClick={() => setSelectedMarket(m.code)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-102'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
                }`}
              >
                <span>{m.flag}</span>
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>

        {/* Benchmark Index Cards (Mobile snap carousel & desktop grid) */}
        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
            <Layers size={14} /> Key Benchmark Indices
          </h2>

          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto snap-x pb-3 md:pb-0 scrollbar-none">
            {benchmarks.map((bench, idx) => {
              const q = bench.quote || {};
              const isPositive = !q.changePercent?.startsWith('-');
              return (
                <div
                  key={idx}
                  className="min-w-[260px] md:min-w-0 snap-start apple-glass-card dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-base">{bench.name}</h3>
                      <span className="text-[11px] font-bold text-gray-400 uppercase">{bench.symbol}</span>
                    </div>
                    <div className={`p-1.5 rounded-lg ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'}`}>
                      {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 font-mono">
                      {q.currentPrice ? Number(q.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                    </div>
                    <div className={`text-xs font-bold flex items-center gap-1 mt-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <span>{q.changePercent || '0.00%'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Movers & Heatmap Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Top Movers List */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Sparkles size={16} className="text-blue-500" />
                Active Market Movers ({activeMarketMeta.name})
              </h2>
              <span className="text-xs text-gray-400">Live Quotes</span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {movers.map((stock) => {
                const isPositive = stock.change?.startsWith('+');
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => navigate(`/stock/${encodeURIComponent(stock.symbol)}`)}
                    className="py-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 px-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900 dark:text-gray-100">{stock.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                          {stock.exchange}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{stock.symbol} · Vol {stock.volume}</div>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                        {formatMarketPrice(stock.price, stock.currency === '$' ? 'USD' : stock.currency === '£' ? 'GBP' : 'INR')}
                      </div>
                      <div className={`text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {stock.change}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FX Rates Box */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={18} className="text-amber-500" />
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">Foreign Exchange Hub</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">15-min auto-refreshed currency pairs</p>

              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700 dark:text-gray-300">🇺🇸 USD / 🇮🇳 INR</span>
                  <span className="font-mono font-bold text-sm text-gray-900 dark:text-gray-100">₹{fxRates.pairs?.['USD/INR'] || 86.20}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700 dark:text-gray-300">🇬🇧 GBP / 🇮🇳 INR</span>
                  <span className="font-mono font-bold text-sm text-gray-900 dark:text-gray-100">₹{fxRates.pairs?.['GBP/INR'] || 108.70}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700 dark:text-gray-300">🇪🇺 EUR / 🇮🇳 INR</span>
                  <span className="font-mono font-bold text-sm text-gray-900 dark:text-gray-100">₹{fxRates.pairs?.['EUR/INR'] || 93.40}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400">
              ⚡ All cross-market price conversions calculate automatically in real time.
            </div>
          </div>
        </div>

        {/* Cross-Market ADR / GDR Cross Links */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                ADR / GDR Global Cross-Listings 🌐
              </h2>
              <p className="text-xs text-gray-400">Direct links between domestic stocks and their US/UK listed depository receipts.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADR_LINKS.map((adr, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">{adr.indianName}</div>
                  <div className="text-[11px] text-gray-400">Listed as: <span className="font-semibold text-blue-600 dark:text-blue-400">{adr.usName}</span></div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-1">{adr.ratio}</div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/50 dark:border-gray-700/50 text-xs">
                  <Link to={`/stock/${encodeURIComponent(adr.indianTicker)}`} className="text-blue-600 font-bold hover:underline">
                    View Local
                  </Link>
                  <Link to={`/stock/${encodeURIComponent(adr.usTicker)}`} className="text-violet-600 font-bold hover:underline">
                    View ADR
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
