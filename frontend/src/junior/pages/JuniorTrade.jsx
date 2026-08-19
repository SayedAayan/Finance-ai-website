import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, TrendingUp, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, Send, RefreshCw, DollarSign, Globe, Search, Loader2, X, Filter } from 'lucide-react';
import BuzzyMascot from '../components/BuzzyMascot';
import JuniorCompanyLogo from '../components/JuniorCompanyLogo';
import { useMarket } from '../../context/MarketContext';

const FEATURED_COMPANIES = [
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', ticker: 'TCS', exchange: 'NSE', market: 'IN', currency: '₹', category: 'Tech & Code', price: 3950, change: '+1.4%', description: 'Builds super smart computer software and mobile apps used by millions.' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', ticker: 'RELIANCE', exchange: 'NSE', market: 'IN', currency: '₹', category: 'Energy & Jio', price: 2780, change: '+0.8%', description: 'Brings high-speed 5G mobile internet and grocery stores to families.' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', ticker: 'HDFCBANK', exchange: 'NSE', market: 'IN', currency: '₹', category: 'Bank & Savings', price: 1680, change: '-0.3%', description: 'Helps families save money securely and make digital payments.' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', ticker: 'TATAMOTORS', exchange: 'NSE', market: 'IN', currency: '₹', category: 'Electric Cars', price: 920, change: '+2.1%', description: 'Creates futuristic electric cars, trucks, and luxury Jaguar Land Rovers.' },
  { symbol: 'INFY.NS', name: 'Infosys Limited', ticker: 'INFY', exchange: 'NSE', market: 'IN', currency: '₹', category: 'AI & Cloud', price: 1820, change: '+1.1%', description: 'Helps planes fly safely and banks work smoothly with smart algorithms.' },
  { symbol: 'AAPL', name: 'Apple Inc.', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', currency: '$', category: 'iPhones & Macs', price: 228, change: '+1.2%', description: 'Designs iPhones, iPads, Apple Watches, and MacBooks loved globally.' },
  { symbol: 'DIS', name: 'Walt Disney Co.', ticker: 'DIS', exchange: 'NYSE', market: 'US', currency: '$', category: 'Movies & Parks', price: 112, change: '+0.5%', description: 'Creates magical cartoon movies, superhero stories, and Disney theme parks.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', ticker: 'MSFT', exchange: 'NASDAQ', market: 'US', currency: '$', category: 'Xbox & Windows', price: 445, change: '+0.9%', description: 'Creators of Windows, Minecraft, Xbox gaming, and artificial intelligence.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', ticker: 'NVDA', exchange: 'NASDAQ', market: 'US', currency: '$', category: 'AI & Gaming Chips', price: 128, change: '+3.4%', description: 'Builds super-fast graphics processors powering video games and AI.' },
  { symbol: 'TSLA', name: 'Tesla Inc.', ticker: 'TSLA', exchange: 'NASDAQ', market: 'US', currency: '$', category: 'Electric Vehicles', price: 215, change: '-1.1%', description: 'Pioneering electric autonomous cars, solar power, and humanoid robots.' },
  { symbol: 'AMZN', name: 'Amazon.com', ticker: 'AMZN', exchange: 'NASDAQ', market: 'US', currency: '$', category: 'Online Shopping', price: 186, change: '+0.7%', description: 'Delivers packages to doorsteps worldwide and powers the global cloud.' },
  { symbol: 'ZOMATO.NS', name: 'Zomato Limited', ticker: 'ZOMATO', exchange: 'NSE', market: 'IN', currency: '₹', category: 'Food Delivery', price: 260, change: '+2.8%', description: 'Connects hungry families with top neighborhood restaurants and Blinkit.' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', ticker: 'SBIN', exchange: 'NSE', market: 'IN', currency: '₹', category: 'National Banking', price: 820, change: '+0.4%', description: 'India’s largest public bank serving hundreds of millions of citizens.' },
  { symbol: 'ITC.NS', name: 'ITC Limited', ticker: 'ITC', exchange: 'NSE', market: 'IN', currency: '₹', category: 'Snacks & Hotels', price: 495, change: '+0.3%', description: 'Makers of Sunfeast biscuits, Aashirvaad flour, Classmate notebooks, and hotels.' }
];

const CATEGORY_CHIPS = [
  { id: 'all', label: '🌟 All Brands' },
  { id: 'IN', label: '🇮🇳 India (NSE/BSE)' },
  { id: 'US', label: '🇺🇸 US (NASDAQ/NYSE)' },
  { id: 'tech', label: '💻 Tech & AI' },
  { id: 'auto', label: '🚗 Cars & EV' },
  { id: 'food', label: '🍔 Food & Goods' },
  { id: 'bank', label: '🏦 Banks & Finance' }
];

export default function JuniorTrade({ account, onUpdateAccount }) {
  const { fxRates } = useMarket();
  const [companies, setCompanies] = useState(FEATURED_COMPANIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeShares, setTradeShares] = useState(1);
  const [reasonNote, setReasonNote] = useState('');
  const [actionType, setActionType] = useState('BUY');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'ledger'
  const [convertToInr, setConvertToInr] = useState(true); // Default show international in INR

  const usdRate = fxRates?.pairs?.['USD/INR'] || 83.5;

  // Search through all 18,000+ real-world companies
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}&limit=10`)
        .then(res => res.json())
        .then(async data => {
          const stocks = data.stocks || [];
          if (stocks.length > 0) {
            // Fetch live quote prices for top search matches
            const symbols = stocks.map(s => s.ticker || `${s.symbol}.NS`).join(',');
            try {
              const quotesRes = await fetch(`/api/quotes?symbols=${encodeURIComponent(symbols)}`);
              const quotesData = await quotesRes.json();
              const quotesMap = new Map((quotesData.quotes || []).map(q => [q.symbol, q]));

              const enriched = stocks.map(s => {
                const qSymbol = s.ticker || `${s.symbol}.NS`;
                const q = quotesMap.get(qSymbol) || quotesMap.get(s.symbol);
                const isUS = s.exchange === 'NASDAQ' || s.exchange === 'NYSE' || s.country === 'United States';
                return {
                  symbol: s.ticker || (isUS ? s.symbol : `${s.symbol}.NS`),
                  name: s.name,
                  ticker: s.symbol,
                  exchange: s.exchange || (isUS ? 'NASDAQ' : 'NSE'),
                  market: isUS ? 'US' : 'IN',
                  currency: isUS ? '$' : '₹',
                  category: isUS ? 'US Stock' : 'Indian Equity',
                  price: q?.currentPrice || (isUS ? 150 : 500),
                  change: q?.changePercent ? `${Number(q.changePercent) >= 0 ? '+' : ''}${q.changePercent}%` : '+0.0%',
                  description: `${s.name} is listed on ${s.exchange || 'Exchange'} and available for real-time paper trading.`
                };
              });
              setSearchResults(enriched);
            } catch {
              setSearchResults(stocks.map(s => ({
                symbol: s.ticker || s.symbol,
                name: s.name,
                ticker: s.symbol,
                exchange: s.exchange || 'Stock',
                market: s.exchange === 'NASDAQ' || s.exchange === 'NYSE' ? 'US' : 'IN',
                currency: s.exchange === 'NASDAQ' || s.exchange === 'NYSE' ? '$' : '₹',
                category: 'Public Company',
                price: 100,
                change: '+0.0%',
                description: `${s.name} listed on ${s.exchange}`
              })));
            }
          } else {
            setSearchResults([]);
          }
        })
        .catch(console.error)
        .finally(() => setIsSearching(false));
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleOpenTrade = (company, type = 'BUY') => {
    setSelectedStock(company);
    setActionType(type);
    setTradeShares(1);
    setReasonNote('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const getCompanyDisplayPrice = (company) => {
    const isUSD = company.currency === '$' || company.market === 'US';
    const rawPrice = Number(company.price) || 100;
    if (isUSD && convertToInr) {
      const inrValue = Math.round(rawPrice * usdRate);
      return {
        formatted: `₹${inrValue.toLocaleString('en-IN')}`,
        subtitle: `≈ $${rawPrice} USD`,
        numericInr: inrValue,
        isConverted: true
      };
    }
    const sym = company.currency || (isUSD ? '$' : '₹');
    return {
      formatted: `${sym}${rawPrice.toLocaleString('en-IN')}`,
      subtitle: isUSD ? `≈ ₹${Math.round(rawPrice * usdRate).toLocaleString('en-IN')}` : null,
      numericInr: isUSD ? Math.round(rawPrice * usdRate) : rawPrice,
      isConverted: false
    };
  };

  const handleExecuteTrade = async () => {
    if (!selectedStock || !account) return;
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch(`/api/junior/accounts/${account.id}/trades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          shares: tradeShares,
          action: actionType,
          reasonNote: reasonNote.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete paper trade');
      }

      setSuccessMsg(`🎉 Success! You ${actionType === 'BUY' ? 'purchased' : 'sold'} ${tradeShares} shares of ${selectedStock.name}!`);
      if (onUpdateAccount && data.account) {
        onUpdateAccount(data.account);
      }

      setTimeout(() => {
        setSelectedStock(null);
        setSuccessMsg('');
      }, 1800);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentCash = account?.portfolio?.cash || 95000;
  const currencySymbol = account?.currencySymbol || '₹';

  const modalPriceData = selectedStock ? getCompanyDisplayPrice(selectedStock) : null;
  const modalTotalCost = modalPriceData ? modalPriceData.numericInr * tradeShares : 0;

  // Filter companies based on category
  const filteredCompanies = companies.filter(c => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'IN') return c.market === 'IN';
    if (activeCategory === 'US') return c.market === 'US';
    if (activeCategory === 'tech') return c.category.toLowerCase().includes('tech') || c.category.toLowerCase().includes('ai') || c.category.toLowerCase().includes('code') || c.category.toLowerCase().includes('cloud');
    if (activeCategory === 'auto') return c.category.toLowerCase().includes('car') || c.category.toLowerCase().includes('ev') || c.category.toLowerCase().includes('auto');
    if (activeCategory === 'food') return c.category.toLowerCase().includes('food') || c.category.toLowerCase().includes('snack') || c.category.toLowerCase().includes('movie') || c.category.toLowerCase().includes('park');
    if (activeCategory === 'bank') return c.category.toLowerCase().includes('bank') || c.category.toLowerCase().includes('saving') || c.category.toLowerCase().includes('finance');
    return true;
  });

  const displayList = searchResults.length > 0 ? searchResults : filteredCompanies;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Real Market Quotes & Paper Portfolio
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 junior-font-heading mt-2">
            Practice Trading with Real World Stocks 🎮
          </h1>
          <p className="text-xs md:text-sm text-slate-600">
            Search any Indian or Global company, trade with virtual coins, and explain your investment reasoning!
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Currency Conversion Toggle */}
          <button
            onClick={() => setConvertToInr(prev => !prev)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold border shadow-xs transition-all ${
              convertToInr
                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Click to toggle currency conversion for International US stocks"
          >
            <span className="text-sm">💱</span>
            <span>{convertToInr ? 'All in INR (₹) Active' : 'Native Currencies ($/₹)'}</span>
          </button>

          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 shadow-xs">
            <div>
              <div className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Available Cash</div>
              <div className="text-base font-black text-emerald-900">
                {currencySymbol}{currentCash.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Real-World Stock Search Bar */}
      <div className="bg-white rounded-3xl p-4 border-2 border-blue-100 shadow-sm relative">
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 18,000+ real stocks (e.g. Zomato, Nvidia, Tata Motors, Apple, Tesla, SBI, Netflix)..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {isSearching ? (
            <Loader2 size={18} className="absolute right-4 text-blue-600 animate-spin" />
          ) : searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        {/* Category Pills (Visible when not actively searching) */}
        {!searchQuery && (
          <div className="flex gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none">
            {CATEGORY_CHIPS.map(chip => (
              <button
                key={chip.id}
                onClick={() => setActiveCategory(chip.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === chip.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('explore'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'explore'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {searchQuery ? `Search Results (${searchResults.length})` : 'Popular Real Companies'}
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'ledger'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Trade Ledger & Notes ({account?.ledger?.length || 0})
          </button>
        </div>

        {activeTab === 'explore' && (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Global FX Rate:</span>
            <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">1 USD ≈ ₹{usdRate.toFixed(2)}</span>
          </div>
        )}
      </div>

      {activeTab === 'explore' ? (
        /* Company Cards Grid */
        <div>
          {displayList.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border-2 border-slate-100 shadow-sm">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-extrabold text-slate-800 text-base">No stocks found for "{searchQuery}"</h3>
              <p className="text-xs text-slate-500 mt-1">Try searching by company name or ticker (e.g. Zomato, TCS, Apple, Tesla).</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayList.map((company) => {
                const holding = account?.portfolio?.holdings?.find(h => h.symbol === company.symbol || h.ticker === company.symbol);
                const cleanTicker = (company.ticker || company.symbol || '').replace(/\.(NS|BO|L|US)$/i, '');
                const exchangeTag = company.exchange || (company.market === 'US' ? 'NASDAQ' : 'NSE');
                const priceInfo = getCompanyDisplayPrice(company);

                return (
                  <div key={company.symbol} className="jr-card-3d p-6 bg-white flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <JuniorCompanyLogo
                          ticker={cleanTicker}
                          symbol={company.symbol}
                          name={company.name}
                          size={48}
                        />
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-3 py-0.5 rounded-full border border-slate-200/60">
                            {company.category}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {cleanTicker} · {exchangeTag}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-black text-base md:text-lg text-slate-900 junior-font-heading mt-1">
                        {company.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-medium">
                        {company.description}
                      </p>

                      <div className="flex items-baseline justify-between mt-4 pb-3 border-b border-slate-100">
                        <div>
                          <div className="text-xl md:text-2xl font-black text-slate-900">
                            {priceInfo.formatted}
                          </div>
                          {priceInfo.subtitle && (
                            <div className="text-[11px] font-bold text-slate-400">
                              {priceInfo.subtitle}
                            </div>
                          )}
                        </div>
                        <div className={`text-xs font-black px-2.5 py-1 rounded-xl shadow-xs ${
                          String(company.change || '').startsWith('-')
                            ? 'text-rose-700 bg-rose-50 border border-rose-200/80'
                            : 'text-emerald-700 bg-emerald-50 border border-emerald-200/80'
                        }`}>
                          {company.change || '+0.0%'}
                        </div>
                      </div>

                      {holding && (
                        <div className="mt-3 text-xs font-black text-blue-700 bg-blue-50/80 p-2.5 rounded-2xl flex items-center justify-between border border-blue-100">
                          <span>You own: <strong>{holding.shares} shares</strong></span>
                          <span>₹{(holding.shares * priceInfo.numericInr).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-5 pt-1">
                      <button
                        onClick={() => handleOpenTrade(company, 'BUY')}
                        className="flex-1 junior-btn-primary text-xs py-2.5 px-3 justify-center shadow-sm"
                      >
                        Buy Slices
                      </button>
                      {holding && holding.shares > 0 && (
                        <button
                          onClick={() => handleOpenTrade(company, 'SELL')}
                          className="px-4 py-2.5 rounded-2xl border-2 border-slate-200 text-slate-700 text-xs font-black hover:bg-slate-50 transition-colors"
                        >
                          Sell
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Immutable Ledger History */
        <div className="junior-card p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 junior-font-heading mb-4">
            Immutable Trade History & Reflection Notes
          </h3>

          <div className="space-y-3">
            {account?.ledger?.length === 0 ? (
              <p className="text-xs text-slate-400">No trades yet. Explore the brand cards above to make your first trade!</p>
            ) : (
              account?.ledger?.map((tx, idx) => {
                const sym = tx.currency || '₹';
                const cleanTicker = (tx.symbol || tx.name || '').replace(/\.(NS|BO|L|US)$/i, '');
                return (
                  <div key={tx.id || idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <JuniorCompanyLogo ticker={cleanTicker} name={tx.name} size={38} />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-extrabold px-2 py-0.5 rounded-full text-[10px] ${
                            tx.type === 'BUY' ? 'bg-emerald-100 text-emerald-800' : tx.type === 'SELL' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {tx.type}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{tx.name || tx.symbol}</span>
                          {tx.shares && <span className="text-slate-500 font-semibold">({tx.shares} shares @ {sym}{tx.price})</span>}
                        </div>
                        {tx.reasonNote && (
                          <p className="text-slate-600 italic">
                            "Why: {tx.reasonNote}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
                      {new Date(tx.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Trade Modal */}
      <AnimatePresence>
        {selectedStock && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border-2 border-blue-200"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <JuniorCompanyLogo
                    ticker={selectedStock.ticker || selectedStock.symbol}
                    name={selectedStock.name}
                    size={48}
                  />
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 junior-font-heading">
                      {actionType === 'BUY' ? 'Buy Shares in' : 'Sell Shares in'} {selectedStock.name}
                    </h3>
                    <span className="text-xs text-slate-500 font-bold">{selectedStock.symbol} · {selectedStock.exchange || 'Market'}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStock(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Shares selector */}
              <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600">Quantity (Shares):</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTradeShares(Math.max(1, tradeShares - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-800 hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="text-base font-extrabold text-slate-900 w-6 text-center">{tradeShares}</span>
                    <button
                      type="button"
                      onClick={() => setTradeShares(tradeShares + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-800 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Total Virtual Cost:</span>
                  <div>
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{modalTotalCost.toLocaleString('en-IN')}
                    </span>
                    {modalPriceData?.subtitle && (
                      <span className="text-xs text-slate-400 font-bold ml-2">
                        (${Number(selectedStock.price * tradeShares).toLocaleString('en-IN')})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mandatory Reflection Note */}
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Mandatory Investor Rule: "Why am I doing this trade?"
                </label>
                <textarea
                  rows={2}
                  value={reasonNote}
                  onChange={(e) => setReasonNote(e.target.value)}
                  placeholder="e.g. I use this product every day and believe more people will buy it this year."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-600"
                />
              </div>

              {/* Guardian Safety Tip */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 mb-4 flex items-start gap-2">
                <ShieldAlert size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Diversification Cap:</strong> StockBuzz limits any single stock to max 25% of your portfolio so you never lose too much from one company!
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold mb-4">
                  ⚠️ {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold mb-4">
                  {successMsg}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedStock(null)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteTrade}
                  disabled={loading}
                  className="flex-2 junior-btn-primary text-xs py-3 font-bold justify-center"
                >
                  {loading ? 'Executing...' : `Confirm ${actionType}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
