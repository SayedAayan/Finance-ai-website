import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart as LineChartIcon, ChevronDown, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

const NIFTY_INDICES = [
  { label: 'NIFTY 50', symbol: '^NSEI' },
  { label: 'NIFTY Bank', symbol: '^NSEBANK' },
  { label: 'NIFTY IT', symbol: '^CNXIT' },
  { label: 'NIFTY Midcap 100', symbol: 'NIFTY_MIDCAP_100.NS' },
  { label: 'NIFTY Smallcap 50', symbol: '^CNXSC' },
  { label: 'NIFTY Midcap 50', symbol: '^NSEMDCP50' },
  { label: 'NIFTY Pharma', symbol: '^CNXPHARMA' },
  { label: 'NIFTY Auto', symbol: '^CNXAUTO' },
  { label: 'NIFTY FMCG', symbol: '^CNXFMCG' },
  { label: 'NIFTY Metal', symbol: '^CNXMETAL' },
  { label: 'NIFTY Realty', symbol: '^CNXREALTY' },
  { label: 'NIFTY Energy', symbol: '^CNXENERGY' },
];

const SENSEX_INDICES = [
  { label: 'SENSEX', symbol: '^BSESN' },
  { label: 'BSE 100', symbol: 'BSE-100.BO' },
  { label: 'BSE 200', symbol: 'BSE-200.BO' },
  { label: 'BSE 500', symbol: 'BSE-500.BO' },
  { label: 'BSE Bankex', symbol: 'BSE-BANK.BO' },
  { label: 'BSE Consumer', symbol: 'BSE-CD.BO' },
  { label: 'BSE Healthcare', symbol: 'BSE-HC.BO' },
  { label: 'BSE IT', symbol: 'BSE-IT.BO' },
  { label: 'BSE FMCG', symbol: 'BSE-FMCG.BO' },
  { label: 'BSE Metal', symbol: 'BSE-METAL.BO' },
  { label: 'BSE Auto', symbol: 'BSE-AUTO.BO' },
  { label: 'BSE Realty', symbol: 'BSE-REALTY.BO' },
];

const RANGES = ['1D', '1W', '1M', '1Y', '5Y', 'MAX'];

function MiniChart({ symbol, range }) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [change, setChange] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/history?symbol=' + encodeURIComponent(symbol) + '&range=' + range)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const pts = (data.points || []).map(p => ({ time: p.time, price: p.price }));
        setPoints(pts);
        if (pts.length > 1) {
          const first = pts[0].price;
          const last = pts[pts.length - 1].price;
          setCurrentPrice(last);
          setChange(((last - first) / first * 100).toFixed(2));
        }
      })
      .catch(() => { })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [symbol, range]);

  const isUp = points.length > 1 && points.at(-1).price >= points[0].price;
  const color = isUp ? '#16a34a' : '#dc2626';

  if (loading) return <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '0.8rem' }}>Loading...</div>;
  if (!points.length) return <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '0.8rem' }}>No data</div>;
  if (points.length === 1) return <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '0.8rem' }}><span>Not enough data points for {range} range</span></div>;

  return (
    <div>
      {currentPrice && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-1)' }}>
            {Number(currentPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isUp ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: 3 }}>
            {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {change > 0 ? '+' : ''}{change}%
          </span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={points} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={'gf' + symbol.replace(/[^a-z0-9]/gi, '')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fontSize: 10 }} minTickGap={50} axisLine={false} tickLine={false}
            tickFormatter={v => new Date(v).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={62}
            tickFormatter={v => Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })} />
          <Tooltip
            contentStyle={{ borderRadius: 10, fontSize: 11, border: '1px solid var(--neutral-200)', background: 'var(--bg-card)' }}
            labelFormatter={v => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            formatter={v => [Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 }), 'Price']}
          />
          <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2.5}
            fill={'url(#gf' + symbol.replace(/[^a-z0-9]/gi, '') + ')'} dot={false} activeDot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function IndexGroup({ title, indices, defaultOpen, accentColor }) {
  const [open, setOpen] = useState(defaultOpen || false);
  const [selected, setSelected] = useState(indices[0]);
  const [range, setRange] = useState('1M');

  return (
    <div style={{ borderRadius: 18, border: '1px solid var(--neutral-200)', background: 'var(--bg-card)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
      {/* Accordion header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', gap: 12 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: accentColor, boxShadow: '0 0 6px ' + accentColor + '80' }} />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>{title}</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-3)', background: 'var(--bg-subtle)', borderRadius: 20, padding: '2px 8px' }}>
            {indices.length} indices
          </span>
        </div>
        <div style={{ color: 'var(--text-3)', transition: 'transform .25s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronDown size={18} />
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div style={{ borderTop: '1px solid var(--neutral-200)' }}>
          {/* Index selector tabs */}
          <div className="thin-scrollbar" style={{ padding: '12px 16px 12px', display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {indices.map(idx => (
              <button key={idx.symbol} onClick={() => setSelected(idx)}
                style={{ flexShrink: 0, padding: '5px 14px', borderRadius: 20, fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', transition: 'all .18s', border: selected.symbol === idx.symbol ? '2px solid ' + accentColor : '2px solid var(--neutral-200)', background: selected.symbol === idx.symbol ? accentColor : 'var(--bg-card)', color: selected.symbol === idx.symbol ? 'white' : 'var(--text-2)' }}>
                {idx.label}
              </button>
            ))}
          </div>

          {/* Range buttons */}
          <div style={{ padding: '4px 16px 12px', display: 'flex', gap: 4 }}>
            {RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)}
                style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all .15s', border: 'none', background: range === r ? 'var(--text-1)' : 'var(--bg-subtle)', color: range === r ? 'var(--bg-card)' : 'var(--text-3)' }}>
                {r}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div style={{ padding: '0 16px 20px' }}>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-3)' }}>{selected.label}</span>
            </div>
            <MiniChart key={selected.symbol + range} symbol={selected.symbol} range={range} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function MarketGraphPanel() {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 22, padding: 24, border: '1px solid var(--neutral-200)', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <LineChartIcon size={18} style={{ color: 'var(--text-3)' }} />
        <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-1)' }}>Live Charts</h3>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-3)', marginLeft: 4 }}>Click an index to expand</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <IndexGroup
          title="NIFTY Indices"
          indices={NIFTY_INDICES}
          defaultOpen={true}
          accentColor="#6366f1"
        />
        <IndexGroup
          title="SENSEX Indices"
          indices={SENSEX_INDICES}
          defaultOpen={false}
          accentColor="#0ea5e9"
        />
      </div>
    </div>
  );
}
