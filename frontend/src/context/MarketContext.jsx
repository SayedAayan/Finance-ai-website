import React, { createContext, useContext, useState, useEffect } from 'react';

const MarketContext = createContext();

export const MARKET_OPTIONS = [
  { code: 'IN', name: 'India', flag: '🇮🇳', exchange: 'NSE / BSE', currency: 'INR', symbol: '₹' },
  { code: 'US', name: 'United States', flag: '🇺🇸', exchange: 'NYSE / NASDAQ', currency: 'USD', symbol: '$' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', exchange: 'LSE', currency: 'GBP', symbol: '£' },
  { code: 'GLOBAL', name: 'Global Watchlist', flag: '🌐', exchange: 'All Markets', currency: 'USD', symbol: '$' }
];

export function MarketProvider({ children }) {
  const [selectedMarket, setSelectedMarketState] = useState(() => {
    return localStorage.getItem('stockbuzz_market') || 'IN';
  });
  
  const [currencyMode, setCurrencyMode] = useState('NATIVE'); // 'NATIVE' | 'CONVERTED'
  const [marketsData, setMarketsData] = useState([]);
  const [fxRates, setFxRates] = useState({
    base: 'INR',
    rates: { INR: 1, USD: 0.0116, GBP: 0.0092, EUR: 0.0107 },
    pairs: { 'USD/INR': 86.20, 'GBP/INR': 108.70, 'EUR/INR': 93.40 }
  });
  const [loading, setLoading] = useState(true);

  const setSelectedMarket = (marketCode) => {
    setSelectedMarketState(marketCode);
    localStorage.setItem('stockbuzz_market', marketCode);
  };

  const toggleCurrencyMode = () => {
    setCurrencyMode(prev => prev === 'NATIVE' ? 'CONVERTED' : 'NATIVE');
  };

  const fetchMarketMeta = async () => {
    try {
      const res = await fetch('/api/markets');
      if (res.ok) {
        const data = await res.json();
        if (data.markets) setMarketsData(data.markets);
        if (data.fx) setFxRates(data.fx);
      }
    } catch (err) {
      console.warn('[MarketContext] Could not fetch live market statuses, using local fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketMeta();
    const interval = setInterval(fetchMarketMeta, 60000); // 1-minute auto refresh for market statuses
    return () => clearInterval(interval);
  }, []);

  const getMarketMeta = (code) => {
    const market = marketsData.find(m => m.code === code) || MARKET_OPTIONS.find(m => m.code === code) || MARKET_OPTIONS[0];
    return market;
  };

  // Converts amount according to active currencyMode
  const formatMarketPrice = (amount, sourceCurrency = 'INR') => {
    if (amount == null || isNaN(amount)) return '—';
    const num = Number(amount);
    
    // If native mode or currency already matches
    if (currencyMode === 'NATIVE') {
      if (sourceCurrency === 'USD' || sourceCurrency === '$') return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (sourceCurrency === 'GBP' || sourceCurrency === '£') return `£${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // If CONVERTED mode: Convert to INR if international, or to USD if Indian
    if (sourceCurrency === 'USD') {
      const inrRate = fxRates.pairs['USD/INR'] || 86.2;
      const converted = num * inrRate;
      return `₹${converted.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (conv.)`;
    }

    if (sourceCurrency === 'GBP') {
      const inrRate = fxRates.pairs['GBP/INR'] || 108.7;
      const converted = num * inrRate;
      return `₹${converted.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (conv.)`;
    }

    // Default INR
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <MarketContext.Provider
      value={{
        selectedMarket,
        setSelectedMarket,
        marketsData,
        fxRates,
        currencyMode,
        toggleCurrencyMode,
        getMarketMeta,
        formatMarketPrice,
        loading
      }}
    >
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
}
