import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Award, BookOpen, Target, Briefcase, BarChart2, CheckCircle2, ChevronRight, ArrowRight, PlayCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockStocks } from '../../data/mockData';

export default function InvestorsStrategy() {
  const strategies = [
    {
      id: 'value',
      number: '01',
      icon: <Briefcase size={24} />,
      gradient: 'from-blue-600 to-indigo-600',
      lightBg: 'bg-blue-50 dark:bg-blue-900/20',
      title: 'Value Investing',
      subtitle: 'The Warren Buffett & Benjamin Graham Method',
      description: 'Focuses on buying undervalued stocks that trade for less than their intrinsic value. Value investors look for companies with strong fundamentals, low P/E ratios, and a wide "margin of safety" to protect against downside risk.',
      keyMetrics: ['P/E Ratio < 15', 'Price-to-Book < 1.5', 'Consistent Free Cash Flow', 'High Dividend Yield'],
      color: 'blue'
    },
    {
      id: 'canslim',
      number: '02',
      icon: <TrendingUp size={24} />,
      gradient: 'from-emerald-500 to-teal-500',
      lightBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      title: 'CAN SLIM Strategy',
      subtitle: 'William J. O\'Neil\'s Growth System',
      description: 'A bullish strategy combining fundamental and technical analysis to identify high-growth stocks before they make major price advances. It emphasizes earnings momentum and strong market trends.',
      keyMetrics: ['Current Quarterly Earnings > 25%', 'Annual Earnings Growth > 25%', 'New Products/Management', 'Strong Market Direction'],
      color: 'emerald'
    },
    {
      id: 'magic',
      number: '03',
      icon: <Award size={24} />,
      gradient: 'from-purple-600 to-fuchsia-600',
      lightBg: 'bg-purple-50 dark:bg-purple-900/20',
      title: 'The Magic Formula',
      subtitle: 'Joel Greenblatt\'s Systematic Approach',
      description: 'A disciplined, rules-based approach that ranks companies based on two simple metrics: Earnings Yield (how cheap the stock is) and Return on Capital (how good the business is). It aims to buy good companies at bargain prices.',
      keyMetrics: ['High Earnings Yield (EBIT / EV)', 'High Return on Capital', 'Exclude Utilities & Financials'],
      color: 'purple'
    },
    {
      id: 'drip',
      number: '04',
      icon: <BarChart2 size={24} />,
      gradient: 'from-amber-500 to-orange-500',
      lightBg: 'bg-amber-50 dark:bg-amber-900/20',
      title: 'Dividend Growth',
      subtitle: 'The Compound Interest Machine',
      description: 'Focuses on "Dividend Aristocrats"—companies that consistently increase their dividend payouts year after year. Dividends are automatically reinvested to accelerate compound growth exponentially over time.',
      keyMetrics: ['Dividend Yield > 2%', 'Payout Ratio < 60%', '10+ Years of Dividend Increases', 'Strong Balance Sheet'],
      color: 'amber'
    },
    {
      id: 'momentum',
      number: '05',
      icon: <Target size={24} />,
      gradient: 'from-rose-500 to-red-600',
      lightBg: 'bg-rose-50 dark:bg-rose-900/20',
      title: 'Momentum Investing',
      subtitle: 'Riding the Trend',
      description: 'Based on the premise that stocks that have performed well recently will continue to perform well in the short-to-medium term. It relies heavily on technical indicators, price action, and market sentiment rather than fundamentals.',
      keyMetrics: ['52-Week High Proximity', 'Relative Strength Index (RSI)', 'Moving Average Crossovers', 'High Trading Volume'],
      color: 'rose'
    }
  ];

  const [activeId, setActiveId] = useState(strategies[0].id);
  const navigate = useNavigate();

  const activeStrategy = strategies.find(s => s.id === activeId);

  const getMatchedStocks = (strategyId) => {
    switch(strategyId) {
      case 'value':
        return mockStocks.filter(s => s.peRatio < 25 && s.pbRatio < 5); // Relaxed for mock data
      case 'canslim':
        return mockStocks.filter(s => s.changePercent > 1.0);
      case 'magic':
        return mockStocks.filter(s => (s.eps / s.price) > 0.02 && s.debtToEquity < 0.5);
      case 'drip':
        return mockStocks.filter(s => s.dividendYield > 0.5);
      case 'momentum':
        return mockStocks.filter(s => s.changePercent > 0 || s.price > 2000);
      default:
        return [];
    }
  };

  const matchedStocks = getMatchedStocks(activeId);

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-950 min-h-screen pt-28 pb-24 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 dark:bg-purple-900/20 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 text-blue-600 dark:text-blue-400 text-sm font-bold tracking-wide uppercase mb-6"
          >
            <ShieldCheck size={16} />
            <span>Master the Markets</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6"
          >
            Screener & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Strategies</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            Select a world-class investment strategy to instantly run our live screener and find matching stocks.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar: Strategy Selector */}
          <div className="w-full lg:w-1/3 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 px-2">
              Select Strategy
            </h3>
            {strategies.map((strategy) => {
              const isActive = activeId === strategy.id;
              return (
                <button
                  key={strategy.id}
                  onClick={() => setActiveId(strategy.id)}
                  className={`w-full text-left p-5 rounded-2xl transition-all duration-300 border flex items-center justify-between group
                    ${isActive 
                      ? `bg-white dark:bg-gray-900 border-${strategy.color}-400 dark:border-${strategy.color}-500 shadow-md ring-1 ring-${strategy.color}-400/50` 
                      : `bg-transparent border-transparent hover:bg-white dark:hover:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-800 hover:shadow-sm`
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors duration-300
                      ${isActive 
                        ? `bg-gradient-to-br ${strategy.gradient} text-white shadow-lg` 
                        : `bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100`
                      }`}
                    >
                      {strategy.icon}
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg transition-colors duration-300 ${isActive ? `text-${strategy.color}-600 dark:text-${strategy.color}-400` : 'text-gray-900 dark:text-white'}`}>
                        {strategy.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {strategy.subtitle}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <ChevronRight size={20} className={`text-${strategy.color}-500`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Main Content: Strategy Details & Screener */}
          <div className="w-full lg:w-2/3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-900 rounded-[32px] shadow-xl border border-gray-200/60 dark:border-gray-800 overflow-hidden"
              >
                {/* Header Area */}
                <div className={`p-8 md:p-10 border-b border-gray-100 dark:border-gray-800 relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${activeStrategy.gradient} opacity-5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3`} />
                  
                  <div className="inline-flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-${activeStrategy.color}-50 dark:bg-${activeStrategy.color}-900/20 text-${activeStrategy.color}-600 dark:text-${activeStrategy.color}-400`}>
                      Strategy {activeStrategy.number}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                    {activeStrategy.title}
                  </h2>
                  <h4 className={`text-lg font-semibold text-gray-500 dark:text-gray-400 mb-6`}>
                    {activeStrategy.subtitle}
                  </h4>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mb-8 max-w-3xl">
                    {activeStrategy.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeStrategy.keyMetrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-950/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800/60">
                        <CheckCircle2 size={18} className={`text-${activeStrategy.color}-500 shrink-0`} />
                        <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm">{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Screener Results Area */}
                <div className="p-8 md:p-10 bg-gray-50 dark:bg-gray-950/50">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <PlayCircle className={`text-${activeStrategy.color}-500`} size={24} />
                        Live Screener Results
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Stocks matching the strict criteria of this strategy today.
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-gray-900 dark:text-white">{matchedStocks.length}</span>
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">Matches</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {matchedStocks.length > 0 ? (
                      matchedStocks.map(stock => (
                        <div 
                          key={stock.id} 
                          onClick={() => navigate(`/stock/${stock.ticker}`)}
                          className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-${activeStrategy.color}-50 dark:bg-${activeStrategy.color}-900/20 flex items-center justify-center font-bold text-lg text-${activeStrategy.color}-600 dark:text-${activeStrategy.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                              {stock.ticker.substring(0,2)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white text-lg">{stock.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stock.ticker} • P/E: {stock.peRatio}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="font-bold text-gray-900 dark:text-white text-lg">₹{stock.price}</div>
                              <div className={`text-sm font-bold ${stock.changePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                              <ArrowRight size={16} className="text-gray-600 dark:text-gray-300" />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 px-6 bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                          <Target size={24} className="text-gray-400" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Perfect Matches Today</h4>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                          Our screener couldn't find any stocks in the mock database that perfectly match all criteria for this strategy today.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
