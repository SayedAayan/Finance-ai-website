import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, BookOpen, Target, Briefcase, BarChart2 } from 'lucide-react';

export default function InvestorsStrategy() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const strategies = [
    {
      id: 'value',
      icon: <Briefcase size={24} className="text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      title: 'Value Investing',
      subtitle: 'The Warren Buffett & Benjamin Graham Method',
      description: 'Focuses on buying undervalued stocks that trade for less than their intrinsic value. Value investors look for companies with strong fundamentals, low P/E ratios, and a wide "margin of safety".',
      keyMetrics: ['P/E Ratio < 15', 'Price-to-Book < 1.5', 'Consistent Free Cash Flow', 'High Dividend Yield'],
      color: 'blue'
    },
    {
      id: 'canslim',
      icon: <TrendingUp size={24} className="text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      title: 'CAN SLIM Strategy',
      subtitle: 'William J. O\'Neil\'s Growth System',
      description: 'A bullish strategy combining fundamental and technical analysis to identify high-growth stocks before they make major price advances.',
      keyMetrics: ['Current Quarterly Earnings > 25%', 'Annual Earnings Growth > 25%', 'New Products/Management', 'Strong Market Direction'],
      color: 'emerald'
    },
    {
      id: 'magic',
      icon: <Award size={24} className="text-purple-600 dark:text-purple-400" />,
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      title: 'The Magic Formula',
      subtitle: 'Joel Greenblatt\'s Systematic Approach',
      description: 'A disciplined, rules-based approach that ranks companies based on two simple metrics: Earnings Yield (how cheap the stock is) and Return on Capital (how good the business is).',
      keyMetrics: ['High Earnings Yield (EBIT / EV)', 'High Return on Capital (EBIT / Net Fixed Assets + Working Capital)', 'Exclude Utilities & Financials'],
      color: 'purple'
    },
    {
      id: 'drip',
      icon: <BarChart2 size={24} className="text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      title: 'Dividend Growth & DRIP',
      subtitle: 'The Compound Interest Machine',
      description: 'Focuses on "Dividend Aristocrats"—companies that consistently increase their dividend payouts year after year. Dividends are automatically reinvested (DRIP) to accelerate compound growth.',
      keyMetrics: ['Dividend Yield > 2%', 'Payout Ratio < 60%', '10+ Years of Dividend Increases', 'Strong Balance Sheet'],
      color: 'amber'
    },
    {
      id: 'momentum',
      icon: <Target size={24} className="text-rose-600 dark:text-rose-400" />,
      bg: 'bg-rose-50 dark:bg-rose-500/10',
      title: 'Momentum Investing',
      subtitle: 'Riding the Trend',
      description: 'Based on the premise that stocks that have performed well recently will continue to perform well in the short-to-medium term. It relies heavily on technical indicators and price action.',
      keyMetrics: ['52-Week High Proximity', 'Relative Strength Index (RSI)', 'Moving Average Crossovers', 'High Trading Volume'],
      color: 'rose'
    }
  ];

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-950 min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6">
            <BookOpen size={16} />
            <span>Master the Markets</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-6">
            Top Investors Strategies & Formulas
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Discover the proven methods, formulas, and strategies used by the world's most successful investors to build generational wealth and outperform the market.
          </motion.p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {strategies.map((strategy) => (
            <motion.div 
              key={strategy.id} 
              variants={itemVariants}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start gap-5">
                <div className={`w-14 h-14 rounded-2xl ${strategy.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  {strategy.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{strategy.title}</h3>
                  <p className={`text-sm font-semibold text-${strategy.color}-600 dark:text-${strategy.color}-400 mb-4`}>{strategy.subtitle}</p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {strategy.description}
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Key Metrics & Rules</h4>
                    <ul className="space-y-2">
                      {strategy.keyMetrics.map((metric, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${strategy.color}-500`} />
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
