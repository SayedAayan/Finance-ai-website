import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpDown, CheckCircle2, Target } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockStocks } from '../../data/mockData';
import { getStrategy, getMatchedStocks, STRATEGIES } from '../../data/strategyEngine';

const COLUMNS = [
  { key: 'matchScore', label: 'Match' },
  { key: 'name', label: 'Stock' },
  { key: 'price', label: 'Price' },
  { key: 'changePercent', label: 'Chg %' },
  { key: 'peRatio', label: 'P/E' },
  { key: 'dividendYield', label: 'Div Yield' }
];

export default function StrategyResults() {
  const { strategyId } = useParams();
  const navigate = useNavigate();
  const strategy = getStrategy(strategyId);
  const [sortKey, setSortKey] = useState('matchScore');
  const [sortDir, setSortDir] = useState('desc');

  const matched = useMemo(() => {
    if (!strategy) return [];
    const rows = getMatchedStocks(strategy.id, mockStocks);
    const sorted = [...rows].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return sorted;
  }, [strategy, sortKey, sortDir]);

  if (!strategy) {
    return (
      <div className="w-full min-h-screen pt-32 pb-24 text-center">
        <p className="text-gray-500 dark:text-gray-400">Unknown strategy.</p>
        <button onClick={() => navigate('/investors-strategy')} className="mt-4 text-blue-600 dark:text-blue-400 font-bold">
          Back to strategies
        </button>
      </div>
    );
  }

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-950 min-h-screen pt-28 pb-24 relative overflow-hidden">
      <div className={`absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br ${strategy.gradient} opacity-10 blur-[120px] pointer-events-none`} />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        <button
          onClick={() => navigate('/investors-strategy')}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          All Strategies
        </button>

        {/* Strategy summary header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="apple-glass-card rounded-[28px] p-8 md:p-10 mb-8 relative overflow-hidden"
        >
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${strategy.gradient} opacity-10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3`} />

          <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-${strategy.color}-50 dark:bg-${strategy.color}-900/20 text-${strategy.color}-600 dark:text-${strategy.color}-400 mb-4`}>
            Strategy {strategy.number}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{strategy.title}</h1>
          <h2 className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-5">{strategy.subtitle}</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 max-w-3xl">{strategy.description}</p>

          <div className="flex flex-wrap gap-3">
            {strategy.keyMetrics.map((metric, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-950/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800/60">
                <CheckCircle2 size={14} className={`text-${strategy.color}-500 shrink-0`} />
                <span className="text-gray-700 dark:text-gray-300 font-semibold text-xs">{metric}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Results table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="apple-glass-card rounded-[28px] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Matching Stocks</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ranked by fit with this strategy's criteria, right now.</p>
            </div>
            <div className="text-right">
              <span className={`text-3xl font-black text-${strategy.color}-600 dark:text-${strategy.color}-400`}>{matched.length}</span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">Matches</span>
            </div>
          </div>

          {matched.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                    {COLUMNS.map(col => (
                      <th key={col.key} className="px-6 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wide select-none">
                        <button onClick={() => toggleSort(col.key)} className="inline-flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors">
                          {col.label}
                          <ArrowUpDown size={12} className={sortKey === col.key ? `text-${strategy.color}-500` : 'opacity-40'} />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matched.map((stock, idx) => (
                    <tr
                      key={stock.id}
                      onClick={() => navigate(`/stock/${stock.ticker}`)}
                      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors ${idx !== matched.length - 1 ? 'border-b border-gray-50 dark:border-gray-900' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 w-16 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden`}>
                            <div className={`h-full bg-gradient-to-r ${strategy.gradient}`} style={{ width: `${stock.matchScore}%` }} />
                          </div>
                          <span className={`font-bold text-${strategy.color}-600 dark:text-${strategy.color}-400`}>{stock.matchScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white">{stock.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stock.ticker}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">₹{stock.price.toLocaleString('en-IN')}</td>
                      <td className={`px-6 py-4 font-bold ${stock.changePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{stock.peRatio}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{stock.dividendYield}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Target size={24} className="text-gray-400" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Matches Today</h4>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Our screener couldn't find any stocks in the current dataset that meet this strategy's criteria today.
              </p>
            </div>
          )}
        </motion.div>

        {/* Other strategies quick switch */}
        <div className="mt-10">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">Try another strategy</h3>
          <div className="flex flex-wrap gap-3">
            {STRATEGIES.filter(s => s.id !== strategy.id).map(s => (
              <button
                key={s.id}
                onClick={() => navigate(`/investors-strategy/${s.id}`)}
                className={`px-4 py-2 rounded-full text-sm font-bold border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-${s.color}-400 hover:text-${s.color}-600 dark:hover:text-${s.color}-400 transition-colors`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
