import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Award, BookOpen, Target, Briefcase, BarChart2, CheckCircle2, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockStocks } from '../../data/mockData';

export default function InvestorsStrategy() {
  const strategies = [
    {
      id: 'value',
      number: '01',
      icon: <Briefcase size={32} className="text-white" />,
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
      icon: <TrendingUp size={32} className="text-white" />,
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
      icon: <Award size={32} className="text-white" />,
      gradient: 'from-purple-600 to-fuchsia-600',
      lightBg: 'bg-purple-50 dark:bg-purple-900/20',
      title: 'The Magic Formula',
      subtitle: 'Joel Greenblatt\'s Systematic Approach',
      description: 'A disciplined, rules-based approach that ranks companies based on two simple metrics: Earnings Yield (how cheap the stock is) and Return on Capital (how good the business is). It aims to buy good companies at bargain prices.',
      keyMetrics: ['High Earnings Yield (EBIT / EV)', 'High Return on Capital (EBIT / Net Fixed Assets + Working Capital)', 'Exclude Utilities & Financials'],
      color: 'purple'
    },
    {
      id: 'drip',
      number: '04',
      icon: <BarChart2 size={32} className="text-white" />,
      gradient: 'from-amber-500 to-orange-500',
      lightBg: 'bg-amber-50 dark:bg-amber-900/20',
      title: 'Dividend Growth & DRIP',
      subtitle: 'The Compound Interest Machine',
      description: 'Focuses on "Dividend Aristocrats"—companies that consistently increase their dividend payouts year after year. Dividends are automatically reinvested (DRIP) to accelerate compound growth exponentially over time.',
      keyMetrics: ['Dividend Yield > 2%', 'Payout Ratio < 60%', '10+ Years of Dividend Increases', 'Strong Balance Sheet'],
      color: 'amber'
    },
    {
      id: 'momentum',
      number: '05',
      icon: <Target size={32} className="text-white" />,
      gradient: 'from-rose-500 to-red-600',
      lightBg: 'bg-rose-50 dark:bg-rose-900/20',
      title: 'Momentum Investing',
      subtitle: 'Riding the Trend',
      description: 'Based on the premise that stocks that have performed well recently will continue to perform well in the short-to-medium term. It relies heavily on technical indicators, price action, and market sentiment rather than fundamentals.',
      keyMetrics: ['52-Week High Proximity', 'Relative Strength Index (RSI)', 'Moving Average Crossovers', 'High Trading Volume'],
      color: 'rose'
    }
  ];

  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

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

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-950 min-h-screen pt-28 pb-24 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 dark:bg-purple-900/20 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 text-blue-600 dark:text-blue-400 text-sm font-bold tracking-wide uppercase mb-8"
          >
            <BookOpen size={16} />
            <span>Master the Markets</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6"
          >
            Top Investors <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Strategies</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            Discover the proven methods, formulas, and strategies used by the world's most successful investors to build generational wealth and outperform the market.
          </motion.p>
        </div>

        {/* Strategies Stack */}
        <div className="space-y-16">
          {strategies.map((strategy, index) => {
            const isEven = index % 2 !== 0;
            return (
              <motion.div 
                key={strategy.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`flex flex-col md:flex-row items-center gap-10 md:gap-16 ${isEven ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Visual Side */}
                <div className="w-full md:w-5/12 flex justify-center">
                  <div className={`relative w-full aspect-square max-w-[320px] rounded-[40px] bg-gradient-to-br ${strategy.gradient} p-8 flex flex-col items-center justify-center text-white shadow-2xl overflow-hidden group`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                    <div className="absolute -top-12 -right-12 text-9xl font-black text-white/10 select-none group-hover:scale-110 transition-transform duration-500">
                      {strategy.number}
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }} 
                      transition={{ type: "spring", stiffness: 300 }}
                      className="relative z-10 p-6 bg-white/20 backdrop-blur-md rounded-3xl mb-6 shadow-inner"
                    >
                      {strategy.icon}
                    </motion.div>
                    <h3 className="relative z-10 text-3xl font-bold text-center leading-tight mb-2">
                      {strategy.title}
                    </h3>
                  </div>
                </div>

                {/* Content Side */}
                <div className="w-full md:w-7/12 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <span className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br ${strategy.gradient} opacity-20`}>
                      {strategy.number}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                      {strategy.title}
                    </h2>
                  </div>
                  
                  <h4 className={`text-lg font-bold text-${strategy.color}-600 dark:text-${strategy.color}-400 mb-6 uppercase tracking-wider`}>
                    {strategy.subtitle}
                  </h4>
                  
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                    {strategy.description}
                  </p>
                  
                  <div className={`rounded-3xl p-8 ${strategy.lightBg} border border-${strategy.color}-100 dark:border-${strategy.color}-900/50 mb-6`}>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <Target size={18} className={`text-${strategy.color}-500`} />
                      Key Metrics & Rules
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                      {strategy.keyMetrics.map((metric, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 size={20} className={`text-${strategy.color}-500 shrink-0 mt-0.5`} />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{metric}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Screener Expand Button */}
                  <button 
                    onClick={() => toggleExpand(strategy.id)}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold shadow-sm hover:shadow-md hover:border-${strategy.color}-300 transition-all self-start`}
                  >
                    <span className={`text-${strategy.color}-600 dark:text-${strategy.color}-400`}>
                      {expandedId === strategy.id ? 'Hide Matching Stocks' : 'Run Screener for this Strategy'}
                    </span>
                    {expandedId === strategy.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {/* Expanded Screener Results */}
                  <AnimatePresence>
                    {expandedId === strategy.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-4">
                            Matching Assets (Mock Data)
                          </h4>
                          <div className="space-y-3">
                            {getMatchedStocks(strategy.id).map(stock => (
                              <div 
                                key={stock.id} 
                                onClick={() => navigate(`/stock/${stock.ticker}`)}
                                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg bg-${strategy.color}-100 dark:bg-${strategy.color}-900/30 flex items-center justify-center font-bold text-${strategy.color}-700 dark:text-${strategy.color}-300`}>
                                    {stock.ticker.substring(0,2)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900 dark:text-white">{stock.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{stock.ticker} • P/E: {stock.peRatio}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <div className="font-bold text-gray-900 dark:text-white">₹{stock.price}</div>
                                    <div className={`text-xs font-semibold ${stock.changePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
                                    </div>
                                  </div>
                                  <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
                                </div>
                              </div>
                            ))}
                            {getMatchedStocks(strategy.id).length === 0 && (
                              <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                                No mock stocks perfectly match this rigid criteria today.
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
