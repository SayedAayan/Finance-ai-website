import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';

const OPTIONS = [
  { label: 'NIFTY 50', symbol: '^NSEI' },
  { label: 'SENSEX', symbol: '^BSESN' },
  { label: 'NIFTY BANK', symbol: '^NSEBANK' },
  { label: 'Reliance', symbol: 'RELIANCE.NS' },
  { label: 'TCS', symbol: 'TCS.NS' },
  { label: 'HDFC Bank', symbol: 'HDFCBANK.NS' },
  { label: 'Infosys', symbol: 'INFY.NS' },
];

const RANGES = ['1D', '1W', '1M', '1Y', '5Y', 'MAX'];

export default function MarketGraphPanel() {
  const [symbol, setSymbol] = useState(OPTIONS[0].symbol);
  const [range, setRange] = useState('1M');
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/history?symbol=${encodeURIComponent(symbol)}&range=${range}`);
      if (!res.ok) throw new Error('Failed to load chart data');
      const data = await res.json();
      setPoints((data.points || []).map(p => ({
        time: new Date(p.time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: p.price
      })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [symbol, range]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const isUp = points.length > 1 && points.at(-1).price >= points[0].price;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[22px] p-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <LineChartIcon size={18} className="text-gray-400 dark:text-gray-500" />
          <h3 className="font-bold text-textMain dark:text-gray-100">Live Charts</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="text-[13px] font-semibold bg-gray-100 dark:bg-gray-800 text-textMain dark:text-gray-100 rounded-full px-4 py-1.5 border-none outline-none cursor-pointer"
          >
            {OPTIONS.map(o => <option key={o.symbol} value={o.symbol}>{o.label}</option>)}
          </select>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
            {RANGES.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 text-[11px] font-bold py-1.5 rounded-full transition-all ${range === r ? 'bg-white dark:bg-gray-700 text-primary dark:text-blue-400 shadow-sm' : 'text-textMuted hover:text-textMain dark:hover:text-gray-100'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 280 }}>
        {loading && (
          <div className="h-full flex items-center justify-center text-textMuted dark:text-gray-500 text-sm">Loading chart…</div>
        )}
        {!loading && error && (
          <div className="h-full flex items-center justify-center text-danger text-sm">{error}</div>
        )}
        {!loading && !error && points.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="graphFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isUp ? '#16a34a' : '#dc2626'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isUp ? '#16a34a' : '#dc2626'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={40} axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e5e7eb' }} />
              <Area type="monotone" dataKey="price" stroke={isUp ? '#16a34a' : '#dc2626'} strokeWidth={2} fill="url(#graphFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
