import { useState, useEffect, useMemo, useRef } from 'react';
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { BarChart2, TrendingUp, Sparkles, AlertCircle, ArrowRight, Search, Loader2, Plus, X, LineChart as LineChartIcon, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function isBetter(val1, val2, lowerIsBetter = false) {
  if (val1 == null || val2 == null || val1 === val2) return [null, null];
  const v1 = parseFloat(String(val1).replace(/[^0-9.-]/g, ''));
  const v2 = parseFloat(String(val2).replace(/[^0-9.-]/g, ''));
  if (isNaN(v1) || isNaN(v2)) return [null, null];
  if (lowerIsBetter) return [v1 < v2 ? 'win' : 'lose', v2 < v1 ? 'win' : 'lose'];
  return [v1 > v2 ? 'win' : 'lose', v2 > v1 ? 'win' : 'lose'];
}

function fmt(n, digits = 2) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: digits });
}

const pct = (v) => v != null ? `${v >= 0 ? '+' : ''}${v}%` : '—';

// Metric definitions: only fields the backend genuinely provides (no fabricated AUM/PE/etc.)
const FUND_METRICS = [
  { key: 'amc', label: 'AMC', get: a => a.amc },
  { key: 'nav', label: 'NAV', get: (a, formatPrice) => a.nav != null ? formatPrice(a.nav) : '—' },
  { key: 'navDate', label: 'NAV Date', get: a => a.navDate },
  { key: 'category', label: 'Category', get: a => a.category },
  { key: 'planOption', label: 'Plan / Option', get: a => a.plan ? `${a.plan} - ${a.option}` : '—' },
  { key: 'schemeType', label: 'Scheme Type', get: a => a.schemeType },
  { key: 'return1M', label: '1M Return', get: a => pct(a.return1M) },
  { key: 'return3M', label: '3M Return', get: a => pct(a.return3M) },
  { key: 'return6M', label: '6M Return', get: a => pct(a.return6M) },
  { key: 'return1Y', label: '1Y Return', get: a => pct(a.return1Y) },
  { key: 'return3Y', label: '3Y Return', get: a => pct(a.return3Y) },
  { key: 'isin', label: 'ISIN', get: a => a.isin },
];

const STOCK_METRICS = [
  { key: 'exchange', label: 'Exchange', get: a => a.exchange },
  { key: 'price', label: 'Price', get: (a, formatPrice) => a.price != null ? formatPrice(a.price, {}, a.currency === 'USD' ? 'USD' : 'INR') : '—' },
  { key: 'today', label: 'Today', get: a => pct(a.changePercent != null ? Number(a.changePercent) : null) },
  { key: 'return1M', label: '1M Return', get: a => pct(a.return1M) },
  { key: 'return3M', label: '3M Return', get: a => pct(a.return3M) },
  { key: 'return6M', label: '6M Return', get: a => pct(a.return6M) },
  { key: 'return1Y', label: '1Y Return', get: a => pct(a.return1Y) },
  { key: 'fiftyTwoWeekHigh', label: '52W High', get: (a, formatPrice) => a.fiftyTwoWeekHigh != null ? formatPrice(a.fiftyTwoWeekHigh, {}, a.currency === 'USD' ? 'USD' : 'INR') : '—' },
  { key: 'fiftyTwoWeekLow', label: '52W Low', get: (a, formatPrice) => a.fiftyTwoWeekLow != null ? formatPrice(a.fiftyTwoWeekLow, {}, a.currency === 'USD' ? 'USD' : 'INR') : '—' },
  { key: 'volume', label: 'Volume', get: a => a.volume != null ? fmt(a.volume, 0) : '—' },
];

const DEFAULT_FUND_KEYS = ['amc', 'nav', 'navDate', 'category', 'return1M', 'return1Y', 'return3Y'];
const DEFAULT_STOCK_KEYS = ['exchange', 'price', 'today', 'return1M', 'return1Y', 'fiftyTwoWeekHigh', 'fiftyTwoWeekLow'];

const CHART_RANGES = [
  { key: '1D', days: 1 },
  { key: '1W', days: 7 },
  { key: '1M', days: 30 },
  { key: '1Y', days: 365 },
  { key: '3Y', days: 1095 },
  { key: '5Y', days: 1825 },
  { key: '10Y', days: 3650 },
  { key: 'MAX', days: Infinity, label: 'Since Inception' },
];

// Searchable async select backed by the live backend search/company/scheme lists
function AssetPicker({ mode, value, onSelect, placeholder }) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const boxRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const updateMenuPosition = () => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 1000
      });
    }
  };

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [open]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const endpoint = mode === 'funds' ? 'schemes' : 'companies';
    const params = new URLSearchParams({ limit: '25' });
    if (query.trim()) params.set('q', query.trim());
    fetch(`${API_URL}/${endpoint}?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        setOptions(mode === 'funds' ? (data.schemes || []) : (data.companies || []));
      })
      .catch(() => { if (active) setOptions([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, mode]);

  return (
    <div ref={boxRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setOpen(true)}
        style={{
          fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-1)',
          border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px',
          background: 'var(--bg-card)', width: '100%', cursor: 'pointer',
          boxShadow: 'var(--shadow-xs)', display: 'flex', alignItems: 'center', gap: '8px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}
      >
        <Search size={14} color="var(--text-3)" />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value ? value.name : (placeholder || 'Select...')}
        </span>
      </div>
      {open && (
        <div style={{
          ...menuStyle,
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px',
          boxShadow: 'var(--shadow-md, 0 8px 24px rgba(0,0,0,0.25))', maxHeight: '360px',
          display: 'flex', flexDirection: 'column'
        }}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === 'funds' ? 'Search mutual fund schemes...' : 'Search stocks / companies...'}
            style={{
              padding: '10px 12px', border: 'none', borderBottom: '1px solid var(--border)',
              outline: 'none', background: 'transparent', color: 'var(--text-1)', fontSize: '0.9rem'
            }}
          />
          <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
            {loading && (
              <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-3)', fontSize: '0.85rem' }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading...
              </div>
            )}
            {!loading && options.length === 0 && (
              <div style={{ padding: '12px', color: 'var(--text-3)', fontSize: '0.85rem' }}>No results</div>
            )}
            {!loading && options.map(opt => (
              <div
                key={opt.id}
                onClick={() => { onSelect(opt); setOpen(false); setQuery(''); }}
                style={{ padding: '10px 12px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-1)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontWeight: 600 }}>{opt.name}</div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>
                  {mode === 'funds' ? opt.amc : `${opt.symbol} · ${opt.exchange}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Filter control: toggle which metric rows are shown, placed in the "Select Assets to Compare" header
function MetricFilterMenu({ allMetrics, activeKeys, onToggle }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px',
          borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)',
          color: 'var(--text-2)', fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer'
        }}
      >
        <SlidersHorizontal size={13} /> Metrics ({activeKeys.length})
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 60,
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px',
          boxShadow: 'var(--shadow-md, 0 8px 24px rgba(0,0,0,0.2))', minWidth: '220px',
          maxHeight: '320px', overflowY: 'auto', padding: '6px'
        }}>
          {allMetrics.map(m => {
            const active = activeKeys.includes(m.key);
            return (
              <div
                key={m.key}
                onClick={() => onToggle(m.key)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                  padding: '8px 10px', cursor: 'pointer', borderRadius: '7px', fontSize: '0.83rem',
                  fontWeight: 600, color: active ? 'var(--text-1)' : 'var(--text-3)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span>{m.label}</span>
                {active
                  ? <X size={13} color="var(--red)" />
                  : <Plus size={13} color="var(--blue)" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Normalizes two time series (filtered to a range) to % change from the range's start so NAV and stock price can share one chart
function buildComparisonChartData(leftSeries, rightSeries, rangeDays) {
  if (!leftSeries?.length || !rightSeries?.length) return [];
  const cutoff = Number.isFinite(rangeDays) ? Date.now() - rangeDays * 86400000 : 0;
  const leftFiltered = leftSeries.filter(p => p.time >= cutoff);
  const rightFiltered = rightSeries.filter(p => p.time >= cutoff);
  if (leftFiltered.length < 2 || rightFiltered.length < 2) return [];

  const leftStart = leftFiltered[0].value;
  const rightStart = rightFiltered[0].value;
  if (!leftStart || !rightStart) return [];

  const rightByDay = new Map(rightFiltered.map(p => [new Date(p.time).toISOString().slice(0, 10), p.value]));
  const points = [];
  for (const p of leftFiltered) {
    const dayKey = new Date(p.time).toISOString().slice(0, 10);
    const rVal = rightByDay.get(dayKey);
    if (rVal == null) continue;
    points.push({
      time: p.time,
      left: Number((((p.value - leftStart) / leftStart) * 100).toFixed(2)),
      right: Number((((rVal - rightStart) / rightStart) * 100).toFixed(2))
    });
  }
  return points;
}

// Daily-return volatility (std dev of day-over-day % change) — a genuine measure computed from the series itself
function computeVolatility(series) {
  if (!series || series.length < 3) return null;
  const dailyReturns = [];
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1].value;
    const cur = series[i].value;
    if (prev && cur) dailyReturns.push((cur - prev) / prev);
  }
  if (dailyReturns.length < 2) return null;
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((a, b) => a + (b - mean) ** 2, 0) / dailyReturns.length;
  return Number((Math.sqrt(variance) * 100).toFixed(2));
}

export default function Compare() {
  const [mode, setMode] = useState('funds'); // 'funds' or 'stocks'
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [leftAsset, setLeftAsset] = useState(null);
  const [rightAsset, setRightAsset] = useState(null);
  const [leftDetail, setLeftDetail] = useState(null);
  const [rightDetail, setRightDetail] = useState(null);
  const [leftStats, setLeftStats] = useState(null);
  const [rightStats, setRightStats] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeKeys, setActiveKeys] = useState(DEFAULT_FUND_KEYS);
  const [chartRange, setChartRange] = useState('1Y');

  const metrics = mode === 'funds' ? FUND_METRICS : STOCK_METRICS;

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setLeftAsset(null);
    setRightAsset(null);
    setLeftDetail(null);
    setRightDetail(null);
    setLeftStats(null);
    setRightStats(null);
    setActiveKeys(newMode === 'funds' ? DEFAULT_FUND_KEYS : DEFAULT_STOCK_KEYS);
  };

  const toggleMetric = (key) => {
    setActiveKeys(keys => keys.includes(key) ? keys.filter(k => k !== key) : [...keys, key]);
  };

  // Preselect a sensible default pair on load / mode switch so the page isn't empty
  useEffect(() => {
    let active = true;
    async function loadDefaults() {
      try {
        if (mode === 'funds') {
          const [a, b] = await Promise.all([
            fetch(`${API_URL}/schemes?q=HDFC%20Flexi%20Cap%20Fund%20-%20Growth%20Option%20-%20Direct%20Plan&limit=1`).then(r => r.json()),
            fetch(`${API_URL}/schemes?q=Parag%20Parikh%20Flexi%20Cap%20Fund%20-%20Direct%20Plan%20-%20Growth&limit=1`).then(r => r.json())
          ]);
          if (!active) return;
          if (a.schemes?.[0]) setLeftAsset(a.schemes[0]);
          if (b.schemes?.[0]) setRightAsset(b.schemes[0]);
        } else {
          const [a, b] = await Promise.all([
            fetch(`${API_URL}/companies?q=Reliance%20Industries&limit=1`).then(r => r.json()),
            fetch(`${API_URL}/companies?q=Tata%20Consultancy%20Services&limit=1`).then(r => r.json())
          ]);
          if (!active) return;
          if (a.companies?.[0]) setLeftAsset(a.companies[0]);
          if (b.companies?.[0]) setRightAsset(b.companies[0]);
        }
      } catch { /* leave pickers empty on failure */ }
    }
    loadDefaults();
    return () => { active = false; };
  }, [mode]);

  // Fetch enriched detail (live price/NAV) + historical return stats + full chartable series whenever a picked asset changes
  useEffect(() => {
    async function loadDetail(asset, setDetail, setStats) {
      if (!asset) { setDetail(null); setStats(null); return; }
      try {
        if (mode === 'funds') {
          const schemeCode = asset.schemeCode || asset.id?.replace('MF:', '');
          const [detailRes, statsRes] = await Promise.all([
            fetch(`${API_URL}/mutual-fund/${encodeURIComponent(asset.id)}`).then(r => r.json()),
            fetch(`${API_URL}/fund-stats/${encodeURIComponent(schemeCode)}`).then(r => r.json()).catch(() => null)
          ]);
          setDetail(detailRes.scheme || null);
          setStats(statsRes && !statsRes.error ? statsRes : null);
        } else {
          const [companiesRes, statsRes] = await Promise.all([
            fetch(`${API_URL}/companies?q=${encodeURIComponent(asset.symbol)}&live=true&limit=5`).then(r => r.json()),
            fetch(`${API_URL}/stock-stats/${encodeURIComponent(asset.ticker)}`).then(r => r.json()).catch(() => null)
          ]);
          const match = (companiesRes.companies || []).find(c => c.id === asset.id) || companiesRes.companies?.[0] || null;
          setDetail(match);
          setStats(statsRes && !statsRes.error ? statsRes : null);
        }
      } catch {
        setDetail(null);
        setStats(null);
      }
    }
    setLoadingDetail(true);
    Promise.all([
      loadDetail(leftAsset, setLeftDetail, setLeftStats),
      loadDetail(rightAsset, setRightDetail, setRightStats)
    ]).finally(() => setLoadingDetail(false));
  }, [leftAsset, rightAsset, mode]);

  const left = useMemo(() => {
    if (!leftAsset) return {};
    const s = leftStats || {};
    if (mode === 'funds') {
      const d = leftDetail || {};
      return {
        id: leftAsset.id, name: leftAsset.name, amc: d.amc || leftAsset.amc, nav: d.nav, navDate: d.date,
        category: d.subCategory || d.category, isin: d.isin, plan: d.plan, option: d.option, schemeType: s.schemeType,
        return1M: s.return1M, return3M: s.return3M, return6M: s.return6M, return1Y: s.return1Y, return3Y: s.return3Y
      };
    }
    const d = leftDetail || {};
    return {
      id: leftAsset.id, name: leftAsset.name, symbol: leftAsset.symbol, exchange: leftAsset.exchange,
      price: d.price, changePercent: d.changePercent, currency: d.currency,
      fiftyTwoWeekHigh: s.fiftyTwoWeekHigh, fiftyTwoWeekLow: s.fiftyTwoWeekLow, volume: s.volume,
      return1M: s.return1M, return3M: s.return3M, return6M: s.return6M, return1Y: s.return1Y
    };
  }, [leftAsset, leftDetail, leftStats, mode]);

  const right = useMemo(() => {
    if (!rightAsset) return {};
    const s = rightStats || {};
    if (mode === 'funds') {
      const d = rightDetail || {};
      return {
        id: rightAsset.id, name: rightAsset.name, amc: d.amc || rightAsset.amc, nav: d.nav, navDate: d.date,
        category: d.subCategory || d.category, isin: d.isin, plan: d.plan, option: d.option, schemeType: s.schemeType,
        return1M: s.return1M, return3M: s.return3M, return6M: s.return6M, return1Y: s.return1Y, return3Y: s.return3Y
      };
    }
    const d = rightDetail || {};
    return {
      id: rightAsset.id, name: rightAsset.name, symbol: rightAsset.symbol, exchange: rightAsset.exchange,
      price: d.price, changePercent: d.changePercent, currency: d.currency,
      fiftyTwoWeekHigh: s.fiftyTwoWeekHigh, fiftyTwoWeekLow: s.fiftyTwoWeekLow, volume: s.volume,
      return1M: s.return1M, return3M: s.return3M, return6M: s.return6M, return1Y: s.return1Y
    };
  }, [rightAsset, rightDetail, rightStats, mode]);

  const activeMetrics = metrics.filter(m => activeKeys.includes(m.key));
  const bothSelected = leftAsset && rightAsset;
  const sameAsset = bothSelected && leftAsset.id === rightAsset.id;

  const rangeDef = CHART_RANGES.find(r => r.key === chartRange) || CHART_RANGES[3];
  const chartData = useMemo(
    () => buildComparisonChartData(leftStats?.series, rightStats?.series, rangeDef.days),
    [leftStats, rightStats, rangeDef]
  );

  // Data-driven summary: computed directly from the selected metric rows + the chart's own range/trend, not a fixed template
  const summary = useMemo(() => {
    if (!bothSelected || sameAsset || chartData.length < 2) return null;

    const leftMove = chartData[chartData.length - 1].left;
    const rightMove = chartData[chartData.length - 1].right;
    const leader = leftMove > rightMove ? left : right;
    const laggard = leftMove > rightMove ? right : left;
    const leaderMove = Math.max(leftMove, rightMove);
    const laggardMove = Math.min(leftMove, rightMove);
    const gap = Number((leaderMove - laggardMove).toFixed(2));

    const leftVol = computeVolatility(leftStats?.series?.filter(p => Number.isFinite(rangeDef.days) ? p.time >= Date.now() - rangeDef.days * 86400000 : true));
    const rightVol = computeVolatility(rightStats?.series?.filter(p => Number.isFinite(rangeDef.days) ? p.time >= Date.now() - rangeDef.days * 86400000 : true));
    const steadier = (leftVol != null && rightVol != null)
      ? (leftVol < rightVol ? left : right)
      : null;
    const steadierOther = steadier === left ? right : left;

    const rangeLabel = rangeDef.label || rangeDef.key;

    const metricLines = activeMetrics
      .filter(m => !['navDate'].includes(m.key))
      .map(m => {
        const lVal = m.get(left, formatPrice);
        const rVal = m.get(right, formatPrice);
        if (lVal === rVal || lVal == null || rVal == null || lVal === '—' || rVal === '—') return null;
        return `${m.label.toLowerCase()}: ${left.name.split(' ')[0]} ${lVal} vs ${right.name.split(' ')[0]} ${rVal}`;
      })
      .filter(Boolean);

    return { leader, laggard, gap, leaderMove, laggardMove, rangeLabel, steadier, steadierOther, leftVol, rightVol, metricLines };
  }, [bothSelected, sameAsset, chartData, left, right, leftStats, rightStats, rangeDef, activeMetrics, formatPrice]);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div className="hero" style={{ padding: '30px 0' }}>
        <div className="container">
          <h2 style={{ marginBottom: '8px' }}>Compare</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: '24px' }}>Side-by-side analysis — spot differences at a glance.</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleModeChange('funds')} className={`btn btn-sm ${mode === 'funds' ? 'btn-primary' : 'btn-outline'}`}>
              <BarChart2 size={14} /> Mutual Funds
            </button>
            <button onClick={() => handleModeChange('stocks')} className={`btn btn-sm ${mode === 'stocks' ? 'btn-primary' : 'btn-outline'}`}>
              <TrendingUp size={14} /> Stocks
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px' }}>
        <div className="compare-table" style={{ borderRadius: '18px', overflow: 'visible' }}>

          {/* Header with Asset Choice pickers + metric filter */}
          <div className="compare-row compare-header-row" style={{ borderRadius: '18px 18px 0 0', overflow: 'visible', borderBottom: 'none' }}>
            <div className="compare-col-header" style={{ background: 'var(--bg-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '10px', fontWeight: 700, paddingLeft: '16px', color: 'var(--text-3)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <span>Select Assets to Compare</span>
              {bothSelected && (
                <div style={{ textTransform: 'none' }}>
                  <MetricFilterMenu allMetrics={metrics} activeKeys={activeKeys} onToggle={toggleMetric} />
                </div>
              )}
            </div>

            <div className="compare-col-header" style={{ borderLeft: '1px solid var(--border)', padding: '16px', position: 'relative', zIndex: 5 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)' }}>ASSET 1</label>
                <AssetPicker mode={mode} value={leftAsset} onSelect={setLeftAsset} placeholder={mode === 'funds' ? 'Search a mutual fund...' : 'Search a stock...'} />
                {leftAsset && (
                  <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}
                    onClick={() => navigate(mode === 'funds' ? `/fund/${leftAsset.id}` : `/stock/${leftAsset.id}`)}>
                    Full Profile <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className="compare-col-header" style={{ borderLeft: '1px solid var(--border)', padding: '16px', position: 'relative', zIndex: 5 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)' }}>ASSET 2</label>
                <AssetPicker mode={mode} value={rightAsset} onSelect={setRightAsset} placeholder={mode === 'funds' ? 'Search a mutual fund...' : 'Search a stock...'} />
                {rightAsset && (
                  <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}
                    onClick={() => navigate(mode === 'funds' ? `/fund/${rightAsset.id}` : `/stock/${rightAsset.id}`)}>
                    Full Profile <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Rows */}
          {!bothSelected ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)' }}>
              Select two {mode === 'funds' ? 'mutual funds' : 'stocks'} above to compare.
            </div>
          ) : loadingDetail ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading live data...
            </div>
          ) : activeMetrics.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)' }}>
              No metrics selected. Use the <strong>Metrics</strong> filter above to add some.
            </div>
          ) : activeMetrics.map((m) => {
            const lVal = m.get(left, formatPrice);
            const rVal = m.get(right, formatPrice);
            const [lWin, rWin] = isBetter(lVal, rVal, m.lowerBetter);
            return (
              <div key={m.key} className="compare-row">
                <div className="compare-label-cell">{m.label}</div>
                <div className={`compare-val-cell ${lWin === 'win' ? 'winner' : lWin === 'lose' ? 'loser' : ''}`}>
                  {lVal ?? '—'}
                  {lWin === 'win' && <span style={{ marginLeft: '8px', fontSize: '0.75rem' }}>▲</span>}
                </div>
                <div className={`compare-val-cell ${rWin === 'win' ? 'winner' : rWin === 'lose' ? 'loser' : ''}`}>
                  {rVal ?? '—'}
                  {rWin === 'win' && <span style={{ marginLeft: '8px', fontSize: '0.75rem' }}>▲</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Chart */}
        {bothSelected && !loadingDetail && (
          <div style={{ marginTop: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LineChartIcon size={18} color="var(--text-3)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-1)' }}>Performance Comparison</h3>
              </div>
              <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto', flexWrap: 'wrap' }}>
                {CHART_RANGES.map(r => (
                  <button
                    key={r.key}
                    onClick={() => setChartRange(r.key)}
                    style={{
                      padding: '5px 11px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
                      cursor: 'pointer', border: 'none', transition: 'all .15s',
                      background: chartRange === r.key ? 'var(--text-1)' : 'var(--bg-subtle)',
                      color: chartRange === r.key ? 'var(--bg-card)' : 'var(--text-3)'
                    }}
                  >
                    {r.key === 'MAX' ? 'MAX' : r.key}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: '12px' }}>
              % change over {rangeDef.label || rangeDef.key}, normalized to a common start date
            </div>
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={60} axisLine={false} tickLine={false}
                    tickFormatter={v => new Date(v).toLocaleDateString('en-IN', chartRange === '1D' ? { hour: '2-digit', minute: '2-digit' } : { month: 'short', day: 'numeric', year: rangeDef.days > 400 ? '2-digit' : undefined })} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={50}
                    tickFormatter={v => `${v}%`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, fontSize: 12, border: '1px solid var(--neutral-200)', background: 'var(--bg-card)' }}
                    labelFormatter={v => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    formatter={(v, name) => [`${v >= 0 ? '+' : ''}${v}%`, name === 'left' ? left.name : right.name]}
                  />
                  <Legend
                    formatter={(value) => value === 'left' ? left.name : right.name}
                    wrapperStyle={{ fontSize: '0.8rem', fontWeight: 600 }}
                  />
                  <Line type="monotone" dataKey="left" name="left" stroke="#1A56DB" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="right" name="right" stroke="#8b5cf6" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '0.85rem' }}>
                Not enough overlapping history for this range.
              </div>
            )}
          </div>
        )}

        {/* AI Summary */}
        {bothSelected && !loadingDetail && (
          <div className="ai-panel" style={{ marginTop: '24px' }}>
            <div className="ai-panel-header">
              <Sparkles size={18} color="var(--violet)" />
              <div className="ai-panel-title" style={{ fontSize: '1rem' }}>Comparison Summary</div>
              <span className="badge badge-violet" style={{ marginLeft: 'auto' }}>Research Only</span>
            </div>
            {sameAsset ? (
              <p>You have selected the same {mode === 'funds' ? 'fund' : 'stock'} in both slots. Pick two different {mode === 'funds' ? 'funds' : 'stocks'} to see a comparison.</p>
            ) : summary ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p>
                  Over {summary.rangeLabel.toLowerCase()}, <strong>{summary.leader.name}</strong> outperformed <strong>{summary.laggard.name}</strong> by {summary.gap} percentage points
                  ({pct(summary.leaderMove)} vs {pct(summary.laggardMove)}).
                  {summary.steadier && (
                    ` ${summary.steadier.name} also showed steadier day-to-day movement (${summary.steadier === left ? summary.leftVol : summary.rightVol}% daily volatility vs ${summary.steadierOther === left ? summary.leftVol : summary.rightVol}% for ${summary.steadierOther.name}), suggesting a smoother ride for holders over this period.`
                  )}
                </p>
                {summary.metricLines.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: '4px' }}>On the metrics you've selected:</div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.7 }}>
                      {summary.metricLines.map((line, i) => <li key={i}>{line}</li>)}
                    </ul>
                  </div>
                )}
                <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                  Past performance and lower volatility are not guarantees of future results — they reflect what happened in this specific window, which can change with market conditions.
                </p>
              </div>
            ) : (
              <p>Comparing <strong>{left.name}</strong> vs <strong>{right.name}</strong>. Not enough historical overlap to compute a performance gap for the selected range.</p>
            )}
            <div className="ai-disclaimer" style={{ display: 'inline-flex', width: 'fit-content', marginTop: '10px' }}>
              <AlertCircle size={13} />
              <span>Source: NSE/BSE/NASDAQ listings, AMFI NAV feed, Yahoo Finance • Not investment advice</span>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
