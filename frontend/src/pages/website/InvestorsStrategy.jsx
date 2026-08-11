import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Briefcase, BarChart2, Target, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockStocks } from '../../data/mockData';
import { STRATEGIES, getMatchedStocks } from '../../data/strategyEngine';

const ICONS = { value: Briefcase, canslim: TrendingUp, magic: Award, drip: BarChart2, momentum: Target };

export default function InvestorsStrategy() {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-950 min-h-screen pt-12 pb-16 relative overflow-hidden">

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 dark:bg-purple-900/20 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 text-blue-600 dark:text-blue-400 text-sm font-bold tracking-wide uppercase mb-4"
          >
            <ShieldCheck size={16} />
            <span>Master the Markets</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4"
          >
            Pick a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 pr-1 -mr-1 pb-1">Strategy</span>, See the Stocks
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            Every card below is a world-class investing method. Open one to instantly run our live screener and see which stocks match its criteria today, ranked by fit.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STRATEGIES.map((strategy, idx) => {
            const Icon = ICONS[strategy.id] || Briefcase;
            const count = getMatchedStocks(strategy.id, mockStocks).length;
            return (
              <motion.button
                key={strategy.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx, duration: 0.35 }}
                whileHover={{ y: -6 }}
                onClick={() => navigate(`/investors-strategy/${strategy.id}`)}
                className="apple-glass-card text-left p-7 rounded-[28px] group relative overflow-hidden flex flex-col"
              >
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${strategy.gradient} opacity-10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3`} />

                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${strategy.gradient} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${strategy.color}-50 dark:bg-${strategy.color}-900/20 text-${strategy.color}-600 dark:text-${strategy.color}-400`}>
                    {count} match{count === 1 ? '' : 'es'}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">{strategy.title}</h3>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-4">{strategy.subtitle}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 flex-1">{strategy.description}</p>

                <div className={`inline-flex items-center gap-2 text-sm font-bold text-${strategy.color}-600 dark:text-${strategy.color}-400`}>
                  View matching stocks
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
