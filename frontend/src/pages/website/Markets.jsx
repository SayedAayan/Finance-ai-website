import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Activity, Globe, DollarSign, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AMC_DOMAINS = {
  'Axis Mutual Fund': 'axismf.com',
  'Invesco Mutual Fund': 'invescomutualfund.com',
  'HDFC Mutual Fund': 'hdfcfund.com',
  'SBI Mutual Fund': 'sbimf.com',
  'ICICI Prudential Mutual Fund': 'icicipruamc.com',
  'Nippon India Mutual Fund': 'nipponindiamf.com',
  'Kotak Mahindra Mutual Fund': 'kotakmf.com',
  'Aditya Birla Sun Life Mutual Fund': 'mutualfund.adityabirlacapital.com',
  'UTI Mutual Fund': 'utimf.com',
  'Bandhan Mutual Fund': 'bandhanmutual.com',
  'DSP Mutual Fund': 'dspim.com',
  'Mirae Asset Mutual Fund': 'miraeassetmf.co.in',
  'Tata Mutual Fund': 'tatamutualfund.com',
  'Edelweiss Mutual Fund': 'edelweissmf.com',
  'Canara Robeco Mutual Fund': 'canararobeco.com',
  'Motilal Oswal Mutual Fund': 'motilaloswalmf.com',
  'Navi Mutual Fund': 'navi.com',
  'Quant Mutual Fund': 'quantmutual.com'
};

const TICKER_TO_DOMAIN = {
  // 'AARTISURF': 'aarti-surfactants.com' // logo.dev returns a black box for this
};

const FORCE_FALLBACK = ['AARTISURF'];

const Logo = ({ type, identifier, fallbackLetter, fallbackColorClass, onError }) => {
  const [error, setError] = useState(false);
  const token = import.meta.env.VITE_LOGO_DEV_KEY;
  
  const cleanId = identifier ? identifier.split('.')[0] : '';
  
  let src = '';
  if (token && !error && identifier && !FORCE_FALLBACK.includes(cleanId)) {
    if (type === 'ticker' && TICKER_TO_DOMAIN[cleanId]) {
      src = `https://img.logo.dev/${TICKER_TO_DOMAIN[cleanId]}?token=${token}&size=60&retina=true`;
    } else if (type === 'ticker') {
      src = `https://img.logo.dev/ticker/${identifier}?token=${token}&size=60&retina=true`;
    } else if (type === 'domain') {
      src = `https://img.logo.dev/${identifier}?token=${token}&size=60&retina=true`;
    }
  }

  if (!token || error || !src) {
    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${fallbackColorClass}`}>
        {fallbackLetter}
      </div>
    );
  }

  const handleError = () => {
    setError(true);
    if (onError) onError();
  };

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800 bg-white shrink-0 shadow-sm p-1.5 flex items-center justify-center">
      <img src={src} alt="logo" className="w-full h-full object-contain" onError={handleError} />
    </div>
  );
};

export default function Markets() {
  const [indices, setIndices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gainersPool, setGainersPool] = useState([]);
  const [losersPool, setLosersPool] = useState([]);
  const [topFunds, setTopFunds] = useState([]);
  const [failedLogos, setFailedLogos] = useState([]);
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const handleLogoError = (ticker) => {
    setFailedLogos(prev => [...prev, ticker]);
  };

  const defaultCms = {
    pages: { markets: { features: { showSectorPerformance: true, showTopGainers: true, showGlobalIndices: true } } }
  };
  const [cmsConfig, setCmsConfig] = useState(defaultCms);

  useEffect(() => {
    fetch('/api/cms')
      .then(res => res.json())
      .then(data => {
        if (data && data.pages) setCmsConfig(data);
      })
      .catch(err => console.error('Failed to load CMS config', err));
  }, []);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch(`${API_URL}/market-overview`);
        if (!response.ok) throw new Error('Failed to fetch market data');
        const data = await response.json();
        setIndices(data.indices || []);
      } catch (err) {
        setError(err.message);
      }

      try {
        const compRes = await fetch(`${API_URL}/companies?live=true&limit=100`);
        if (compRes.ok) {
           const compData = await compRes.json();
           const validCompanies = (compData.companies || []).filter(c => typeof c.changePercent === 'number' || !isNaN(parseFloat(c.changePercent)));
           const sortedGainers = [...validCompanies].sort((a,b) => parseFloat(b.changePercent) - parseFloat(a.changePercent));
           const sortedLosers = [...validCompanies].sort((a,b) => parseFloat(a.changePercent) - parseFloat(b.changePercent));
           setGainersPool(sortedGainers);
           setLosersPool(sortedLosers);
        }
      } catch(err) { console.error('Failed to fetch top companies', err); }

      try {
        const schemeRes = await fetch(`${API_URL}/schemes?limit=100`);
        if (schemeRes.ok) {
           const schemeData = await schemeRes.json();
           const funds = schemeData.schemes || [];
           const top = [...funds].sort((a,b) => parseFloat(b.nav) - parseFloat(a.nav)).slice(0, 5);
           setTopFunds(top);
        }
      } catch (err) { console.error('Failed to fetch schemes', err); }

      setLoading(false);
    };

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Activity size={32} className="text-violet-600 dark:text-violet-400 animate-pulse" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading live markets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl border border-red-100 dark:border-red-500/20 font-medium">
          Error: {error}
        </div>
      </div>
    );
  }

  const displayGainers = gainersPool.filter(c => !failedLogos.includes(c.ticker)).slice(0, 5);
  const displayLosers = losersPool.filter(c => !failedLogos.includes(c.ticker)).slice(0, 5);

  return (
    <div className="flex-1 bg-[#F8FAFC] dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Market Overview</h1>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Globe size={16} /> Live Indian Market Indices
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-4 py-2 rounded-full border border-green-100 dark:border-green-500/20 font-medium shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Markets Open
          </div>
        </div>

        {/* Indices Grid */}
        {cmsConfig?.pages?.markets?.features?.showGlobalIndices && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {indices.map((index, idx) => {
              const isPositive = parseFloat(index.change) >= 0;
              return (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  {/* Decorative background glow */}
                  <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>

                  <div className="flex justify-between items-start mb-4 relative">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{index.label}</h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider font-semibold">{index.symbol}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                      {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-mono tracking-tight">
                      {index.label === 'USD/INR' ? '₹' : ''}
                      {index.currentPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      <span>{isPositive ? '+' : ''}{index.change}</span>
                      <span className="text-sm bg-white/50 dark:bg-gray-800/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        ({isPositive ? '+' : ''}{index.changePercent}%)
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={12}/> Updated</span>
                    <span>{index.timestamp || 'Just now'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Additional Markets Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top Gainers */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                  <TrendingUp size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Top Gainers</h2>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {displayGainers.map((stock, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate(`/stock/${stock.ticker}`)}
                  className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Logo 
                      type="ticker" 
                      identifier={stock.ticker} 
                      fallbackLetter={stock.symbol?.[0] || stock.ticker?.[0] || '?'} 
                      fallbackColorClass="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 text-green-700 dark:text-green-400"
                      onError={() => handleLogoError(stock.ticker)}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 truncate text-[13px]">{stock.name}</div>
                      <div className="text-[11px] text-gray-500 truncate">{stock.symbol || stock.ticker}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="font-bold text-gray-900 dark:text-gray-100 text-[13px]">{formatPrice(stock.price)}</div>
                    <div className="text-[11px] font-semibold text-green-600 dark:text-green-400">+{stock.changePercent}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400">
                  <TrendingDown size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Top Losers</h2>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {displayLosers.map((stock, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate(`/stock/${stock.ticker}`)}
                  className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Logo 
                      type="ticker" 
                      identifier={stock.ticker} 
                      fallbackLetter={stock.symbol?.[0] || stock.ticker?.[0] || '?'} 
                      fallbackColorClass="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 text-red-700 dark:text-red-400"
                      onError={() => handleLogoError(stock.ticker)}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 truncate text-[13px]">{stock.name}</div>
                      <div className="text-[11px] text-gray-500 truncate">{stock.symbol || stock.ticker}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="font-bold text-gray-900 dark:text-gray-100 text-[13px]">{formatPrice(stock.price)}</div>
                    <div className="text-[11px] font-semibold text-red-600 dark:text-red-400">{stock.changePercent}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Mutual Funds */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Activity size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Top Mutual Funds</h2>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {topFunds.map((fund, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate(`/fund/${fund.id}`)}
                  className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Logo 
                      type="domain" 
                      identifier={AMC_DOMAINS[fund.amc]} 
                      fallbackLetter={fund.amc?.[0] || 'M'} 
                      fallbackColorClass="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-400"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 truncate text-[12px]">{fund.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{fund.amc}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="font-bold text-gray-900 dark:text-gray-100 text-[13px]">{formatPrice(fund.nav)}</div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase">NAV</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
