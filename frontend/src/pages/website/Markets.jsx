import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Globe, DollarSign, Clock, Sparkles, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Markets() {
  const [indices, setIndices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } finally {
        setLoading(false);
      }
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Activity size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Global Markets (Coming Soon)</h2>
            </div>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              Global market data integration is currently being mapped. Soon you will be able to track major global indices like the S&P 500, NASDAQ, FTSE 100, and Nikkei 225 directly from this dashboard.
            </p>
          </div>

          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 rounded-3xl shadow-lg text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Sparkles size={20} />
              </div>
              <h2 className="text-xl font-bold">Ask Stockbuzz AI</h2>
            </div>
            <p className="text-violet-100 leading-relaxed mb-6">
              Want deeper insights? Our AI can analyze market trends, compare indices, and pull the latest financial news for you in real-time.
            </p>
            <a href="/chat" className="inline-flex items-center gap-2 bg-white text-violet-700 px-6 py-3 rounded-full font-bold hover:bg-violet-50 transition-colors shadow-sm">
              Start Research <ArrowRight size={16} />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
