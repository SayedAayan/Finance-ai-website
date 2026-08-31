import { useState, useEffect, useMemo, useRef } from 'react';
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { BarChart2, TrendingUp, Sparkles, AlertCircle, ArrowRight, Search, Loader2, Plus, X, LineChart as LineChartIcon, SlidersHorizontal, Trash2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://finance-ai-website.onrender.com/api' : '/api');

const COLORS = ['var(--violet)', 'var(--blue)', 'var(--green)', 'var(--orange)', 'var(--red)', 'var(--text-1)'];

function isBetter(val1, val2, lowerIsBetter = false) {
  if (val1 == null || val2 == null || val1 === val2) return [null, null];
  const v1 = parseFloat(String(val1).replace(/[^0-9.-]/g, ''));
  const v2 = parseFloat(String(val2).replace(/[^0-9.-]/g, ''));
  if (isNaN(v1) || isNaN(v2)) return [null, null];
  if (lowerIsBetter) return [v1 < v2 ? 'win' : 'lose', v2 < v1 ? 'win' : 'lose'];
  return [v1 > v2 ? 'win' : 'lose', v2 > v1 ? 'win' : 'lose'];
}

// Evaluate N values and return array of classes: 'winner' (best), 'loser' (worst), '' (middle)
function evaluateNValues(values, lowerIsBetter = false) {
  const parsed = values.map(v => parseFloat(String(v).replace(/[^0-9.-]/g, '')));
  const valid = parsed.filter(n => !isNaN(n));
  if (valid.length < 2) return values.map(() => '');
  
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  
  if (min === max) return values.map(() => '');

  return parsed.map(v => {
    if (isNaN(v)) return '';
    if (lowerIsBetter) {
      if (v === min) return 'winner';
      if (v === max) return 'loser';
    } else {
      if (v === max) return 'winner';
      if (v === min) return 'loser';
    }
    return '';
  });
}

function fmt(n, digits = 2) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: digits });
}

const pct = (v) => v != null ? `${v >= 0 ? '+' : ''}${v}%` : '—';

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
  { key: 'exchange', label: 'Exchange', get: a => a.exchange ? `${a.exchange === 'LSE' ? '🇬🇧 LSE' : a.exchange === 'NASDAQ' || a.exchange === 'NYSE' ? '🇺🇸 ' + a.exchange : '🇮🇳 ' + a.exchange}` : '—' },
  { key: 'price', label: 'Price', get: (a, formatPrice, formatMarketPrice) => a.price != null ? (formatMarketPrice ? formatMarketPrice(a.price, a.currency === 'USD' ? 'USD' : a.currency === 'GBP' ? 'GBP' : 'INR') : formatPrice(a.price, {}, a.currency === 'USD' ? 'USD' : 'INR')) : '—' },
  { key: 'today', label: 'Today', get: a => pct(a.changePercent != null ? Number(a.changePercent) : null) },
  { key: 'return1M', label: '1M Return', get: a => pct(a.return1M) },
  { key: 'return3M', label: '3M Return', get: a => pct(a.return3M) },
  { key: 'return6M', label: '6M Return', get: a => pct(a.return6M) },
  { key: 'return1Y', label: '1Y Return', get: a => pct(a.return1Y) },
  { key: 'fiftyTwoWeekHigh', label: '52W High', get: (a, formatPrice, formatMarketPrice) => a.fiftyTwoWeekHigh != null ? (formatMarketPrice ? formatMarketPrice(a.fiftyTwoWeekHigh, a.currency === 'USD' ? 'USD' : 'INR') : formatPrice(a.fiftyTwoWeekHigh)) : '—' },
  { key: 'fiftyTwoWeekLow', label: '52W Low', get: (a, formatPrice, formatMarketPrice) => a.fiftyTwoWeekLow != null ? (formatMarketPrice ? formatMarketPrice(a.fiftyTwoWeekLow, a.currency === 'USD' ? 'USD' : 'INR') : formatPrice(a.fiftyTwoWeekLow)) : '—' },
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

function AssetPicker({ mode, value, onSelect, placeholder }) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

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
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, width: '100%', zIndex: 1000,
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

function buildComparisonChartData(seriesArray, rangeDays) {
  if (!seriesArray || seriesArray.length === 0) return [];
  const validSeries = seriesArray.filter(s => s && s.length > 0);
  if (validSeries.length < 2) return [];

  const cutoff = Number.isFinite(rangeDays) ? Date.now() - rangeDays * 86400000 : 0;
  
  const filteredSeries = validSeries.map(s => {
    const f = s.filter(p => p.time >= cutoff);
    return { data: f, startVal: f[0]?.value };
  });

  if (filteredSeries.some(s => s.data.length < 2 || !s.startVal)) return [];

  const isIntraday = rangeDays <= 7;
  const getKey = (time) => {
    const iso = new Date(time).toISOString();
    return isIntraday ? iso.slice(0, 16) : iso.slice(0, 10); // Match by minute for intraday, else by day
  };

  const baseSeries = filteredSeries[0].data;
  const seriesMaps = filteredSeries.map(s => new Map(s.data.map(p => [getKey(p.time), p.value])));

  const points = [];
  const seenKeys = new Set();
  
  for (const p of baseSeries) {
    const key = getKey(p.time);
    
    // Deduplicate so we don't plot hundreds of identical flat points if API returns high-density intraday data for a daily chart
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    
    const point = { time: p.time };
    let missingData = false;
    
    for (let i = 0; i < filteredSeries.length; i++) {
      const val = seriesMaps[i].get(key);
      if (val == null) {
        missingData = true;
        break;
      }
      point[`asset${i}`] = Number((((val - filteredSeries[i].startVal) / filteredSeries[i].startVal) * 100).toFixed(2));
    }
    
    if (!missingData) {
      points.push(point);
    }
  }
  return points;
}

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
  const { formatMarketPrice } = useMarket();
  const { userPlan } = useAuth();

  // State arrays for N-asset comparison (default 3)
  const [assets, setAssets] = useState([null, null, null]);
  const [details, setDetails] = useState([null, null, null]);
  const [stats, setStats] = useState([null, null, null]);
  
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeKeys, setActiveKeys] = useState(DEFAULT_FUND_KEYS);
  const [chartRange, setChartRange] = useState('1Y');
  const [hiddenGraphIds, setHiddenGraphIds] = useState([]);

  const metrics = mode === 'funds' ? FUND_METRICS : STOCK_METRICS;

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setAssets([null, null, null]);
    setDetails([null, null, null]);
    setStats([null, null, null]);
    setHiddenGraphIds([]);
    setActiveKeys(newMode === 'funds' ? DEFAULT_FUND_KEYS : DEFAULT_STOCK_KEYS);
  };

  const toggleMetric = (key) => {
    setActiveKeys(keys => keys.includes(key) ? keys.filter(k => k !== key) : [...keys, key]);
  };

  const updateAsset = (index, value) => {
    const newAssets = [...assets];
    newAssets[index] = value;
    setAssets(newAssets);
  };

  const addAsset = () => {
    if (assets.length < 6) {
      setAssets([...assets, null]);
      setDetails([...details, null]);
      setStats([...stats, null]);
    }
  };

  const removeAsset = (index) => {
    let newAssets = assets.filter((_, i) => i !== index);
    let newDetails = details.filter((_, i) => i !== index);
    let newStats = stats.filter((_, i) => i !== index);
    
    if (newAssets.length < 2) {
      newAssets = [...newAssets, null];
      newDetails = [...newDetails, null];
      newStats = [...newStats, null];
    }
    setAssets(newAssets);
    setDetails(newDetails);
    setStats(newStats);
  };

  useEffect(() => {
    let active = true;
    async function loadDefaults() {
      try {
        if (mode === 'funds') {
          const [a, b, c] = await Promise.all([
            fetch(`${API_URL}/schemes?q=HDFC%20Flexi%20Cap%20Fund%20-%20Growth%20Option%20-%20Direct%20Plan&limit=1`).then(r => r.json()),
            fetch(`${API_URL}/schemes?q=Parag%20Parikh%20Flexi%20Cap%20Fund%20-%20Direct%20Plan%20-%20Growth&limit=1`).then(r => r.json()),
            fetch(`${API_URL}/schemes?q=SBI%20Bluechip%20Fund&limit=1`).then(r => r.json())
          ]);
          if (!active) return;
          setAssets([a.schemes?.[0] || null, b.schemes?.[0] || null, c.schemes?.[0] || null]);
        } else {
          const [a, b, c] = await Promise.all([
            fetch(`${API_URL}/companies?q=Reliance%20Industries&limit=1`).then(r => r.json()),
            fetch(`${API_URL}/companies?q=Tata%20Consultancy%20Services&limit=1`).then(r => r.json()),
            fetch(`${API_URL}/companies?q=HDFC%20Bank&limit=1`).then(r => r.json())
          ]);
          if (!active) return;
          setAssets([a.companies?.[0] || null, b.companies?.[0] || null, c.companies?.[0] || null]);
        }
      } catch { /* leave pickers empty on failure */ }
    }
    loadDefaults();
    return () => { active = false; };
  }, [mode]);

  useEffect(() => {
    async function loadDetail(asset) {
      if (!asset) return { detail: null, stats: null };
      try {
        if (mode === 'funds') {
          const schemeCode = asset.schemeCode || asset.id?.replace('MF:', '');
          const [detailRes, statsRes] = await Promise.all([
            fetch(`${API_URL}/mutual-fund/${encodeURIComponent(asset.id)}`).then(r => r.json()),
            fetch(`${API_URL}/fund-stats/${encodeURIComponent(schemeCode)}`).then(r => r.json()).catch(() => null)
          ]);
          return { detail: detailRes.scheme || null, stats: statsRes && !statsRes.error ? statsRes : null };
        } else {
          const [companiesRes, statsRes] = await Promise.all([
            fetch(`${API_URL}/companies?q=${encodeURIComponent(asset.symbol)}&live=true&limit=5`).then(r => r.json()),
            fetch(`${API_URL}/stock-stats/${encodeURIComponent(asset.ticker)}`).then(r => r.json()).catch(() => null)
          ]);
          const match = (companiesRes.companies || []).find(c => c.id === asset.id) || companiesRes.companies?.[0] || null;
          return { detail: match, stats: statsRes && !statsRes.error ? statsRes : null };
        }
      } catch {
        return { detail: null, stats: null };
      }
    }
    
    setLoadingDetail(true);
    Promise.all(assets.map(a => loadDetail(a))).then(results => {
      setDetails(results.map(r => r.detail));
      setStats(results.map(r => r.stats));
    }).finally(() => setLoadingDetail(false));
  }, [assets, mode]);

  const preparedAssets = useMemo(() => {
    return assets.map((asset, i) => {
      if (!asset) return null;
      const d = details[i] || {};
      const s = stats[i] || {};
      
      if (mode === 'funds') {
        return {
          id: asset.id, name: asset.name, amc: d.amc || asset.amc, nav: d.nav, navDate: d.date,
          category: d.subCategory || d.category, isin: d.isin, plan: d.plan, option: d.option, schemeType: s.schemeType,
          return1M: s.return1M, return3M: s.return3M, return6M: s.return6M, return1Y: s.return1Y, return3Y: s.return3Y,
          series: s.series
        };
      }
      return {
        id: asset.id, name: asset.name, symbol: asset.symbol, exchange: asset.exchange,
        price: d.price, changePercent: d.changePercent, currency: d.currency,
        fiftyTwoWeekHigh: s.fiftyTwoWeekHigh, fiftyTwoWeekLow: s.fiftyTwoWeekLow, volume: s.volume,
        return1M: s.return1M, return3M: s.return3M, return6M: s.return6M, return1Y: s.return1Y,
        series: s.series
      };
    });
  }, [assets, details, stats, mode]);

  const activeMetrics = metrics.filter(m => activeKeys.includes(m.key));
  const validAssets = preparedAssets.filter(Boolean);
  const anySelected = validAssets.length > 0;
  
  // Ensure we have at least 2 unique assets to show meaningful comparison
  const uniqueIds = new Set(validAssets.map(a => a.id));
  const isComparable = validAssets.length >= 2 && uniqueIds.size === validAssets.length;

  const rangeDef = CHART_RANGES.find(r => r.key === chartRange) || CHART_RANGES[3];
  
  const graphAssets = useMemo(() => validAssets.filter(a => !hiddenGraphIds.includes(a.id)), [validAssets, hiddenGraphIds]);

  const chartData = useMemo(() => {
    return buildComparisonChartData(graphAssets.map(a => a.series), rangeDef.days);
  }, [graphAssets, rangeDef]);

  const summary = useMemo(() => {
    if (!isComparable || chartData.length < 2 || graphAssets.length < 2) return null;

    const lastPoint = chartData[chartData.length - 1];
    let bestIndex = -1, worstIndex = -1;
    let maxMove = -Infinity, minMove = Infinity;

    graphAssets.forEach((a, i) => {
      const val = lastPoint[`asset${i}`];
      if (val != null) {
        if (val > maxMove) { maxMove = val; bestIndex = i; }
        if (val < minMove) { minMove = val; worstIndex = i; }
      }
    });

    if (bestIndex === -1 || worstIndex === -1) return null;

    const leader = graphAssets[bestIndex];
    const laggard = graphAssets[worstIndex];
    const gap = Number((maxMove - minMove).toFixed(2));

    const vols = graphAssets.map(a => computeVolatility(a.series?.filter(p => Number.isFinite(rangeDef.days) ? p.time >= Date.now() - rangeDef.days * 86400000 : true)));
    let lowestVol = Infinity;
    let steadier = null;
    
    vols.forEach((v, i) => {
      if (v != null && v < lowestVol) {
        lowestVol = v;
        steadier = graphAssets[i];
      }
    });

    const rangeLabel = rangeDef.label || rangeDef.key;

    return { leader, laggard, gap, leaderMove: maxMove, laggardMove: minMove, rangeLabel, steadier, lowestVol };
  }, [isComparable, chartData, graphAssets, rangeDef]);

  const tableScrollRef = useRef(null);
  const scrollTable = (direction) => {
    if (tableScrollRef.current) {
      const scrollAmount = 250;
      tableScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };


  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div className="hero" style={{ padding: '30px 0' }}>
        <div className="container">
          <h2 style={{ marginBottom: '8px' }}>Compare</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: '24px' }}>Side-by-side analysis — spot differences at a glance.</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleModeChange('funds')} className={`btn btn-sm ${mode === 'funds' ? 'btn-primary' : 'btn-outline'}`}>
                <BarChart2 size={14} /> Mutual Funds
              </button>
              <button onClick={() => handleModeChange('stocks')} className={`btn btn-sm ${mode === 'stocks' ? 'btn-primary' : 'btn-outline'}`}>
                <TrendingUp size={14} /> Stocks
              </button>
            </div>
            
            {assets.length > 2 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => scrollTable('left')} className="btn btn-outline" style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => scrollTable('right')} className="btn btn-outline" style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px' }}>
        <div className="compare-table-wrapper" style={{ position: 'relative' }}>
          <div ref={tableScrollRef} style={{ overflowX: 'auto', paddingBottom: '8px' }} className="hide-scrollbar">
            <div className="compare-table" style={{ borderRadius: '18px', display: 'flex', flexDirection: 'column', minWidth: 'max-content' }}>

              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                <div className="compare-col-header" style={{ width: '220px', flexShrink: 0, background: 'var(--bg-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '10px', fontWeight: 700, paddingLeft: '16px', color: 'var(--text-3)', fontSize: '0.8rem', textTransform: 'uppercase', borderRadius: '18px 0 0 0', position: 'sticky', left: 0, zIndex: 20 }}>
                  <span>Select Assets to Compare</span>
                  {anySelected && (
                    <div style={{ textTransform: 'none' }}>
                      <MetricFilterMenu allMetrics={metrics} activeKeys={activeKeys} onToggle={toggleMetric} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexGrow: 1 }}>
              {assets.map((asset, index) => (
                <div key={index} style={{ flex: 1, minWidth: '220px', borderLeft: '1px solid var(--border)', padding: '16px', position: 'relative', zIndex: 10 - index }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)' }}>ASSET {index + 1}</label>
                      {assets.length > 2 && (
                        <button onClick={() => removeAsset(index)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}>
                          <Trash2 size={14} color="var(--text-3)" />
                        </button>
                      )}
                    </div>
                    
                    <AssetPicker mode={mode} value={asset} onSelect={(a) => updateAsset(index, a)} placeholder={mode === 'funds' ? 'Search a fund...' : 'Search a stock...'} />
                    {asset && (
                      <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}
                        onClick={() => navigate(mode === 'funds' ? `/fund/${asset.id}` : `/stock/${asset.id}`)}>
                        Full Profile <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {assets.length < 6 && (
                <div style={{ width: '160px', flexShrink: 0, display: 'flex', alignItems: 'center', padding: '16px', borderLeft: '1px solid var(--border)' }}>
                  <button onClick={addAsset} className="btn btn-outline w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '10px' }}>
                    <Plus size={16} /> Add Asset
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {!anySelected ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)' }}>
                Select {mode === 'funds' ? 'mutual funds' : 'stocks'} above to compare.
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
              const vals = preparedAssets.map(a => a ? m.get(a, formatPrice, formatMarketPrice) : '—');
              const classes = evaluateNValues(vals, m.lowerBetter);
              return (
                <div key={m.key} style={{ display: 'flex', borderBottom: '1px solid var(--border)' }} className="compare-row-multi">
                  <div className="compare-label-cell" style={{ width: '220px', flexShrink: 0, padding: '14px 16px', fontWeight: 600, fontSize: '0.85rem', position: 'sticky', left: 0, zIndex: 20, background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>{m.label}</div>
                  <div style={{ display: 'flex', flexGrow: 1 }}>
                    {vals.map((v, i) => (
                      <div key={i} style={{ flex: 1, minWidth: '220px', padding: '14px 16px', borderLeft: '1px solid var(--border)', fontSize: '0.9rem' }} className={`compare-val-cell ${classes[i]}`}>
                        {v ?? '—'}
                        {classes[i] === 'winner' && <span style={{ marginLeft: '8px', fontSize: '0.75rem' }}>▲</span>}
                      </div>
                    ))}
                    {assets.length < 6 && <div style={{ width: '160px', flexShrink: 0, borderLeft: '1px solid var(--border)' }}></div>}
                  </div>
                </div>
              );
            })}
          </div>
            </div>
          </div>
        </div>

        {isComparable && !loadingDetail && (
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
              <div style={{ position: 'relative' }}>
                {userPlan === 'plan_free' && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backdropFilter: 'blur(5px)', background: 'rgba(255,255,255,0.2)',
                    zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '12px'
                  }}>
                    <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '300px', border: '1px solid var(--border)' }}>
                      <LineChartIcon size={32} color="var(--violet)" style={{ margin: '0 auto 12px auto' }} />
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 800 }}>Advanced Charting</h4>
                      <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-3)' }}>Unlock interactive performance comparison charts with Stockbuzz Pro.</p>
                      <Link to="/settings" className="btn btn-violet shadow-md" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: '10px', fontWeight: 700, gap: '6px' }}>
                        <Sparkles size={16} /> Upgrade to Pro
                      </Link>
                    </div>
                  </div>
                )}
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" vertical={false} />
                    <XAxis dataKey="time" type="number" scale="time" domain={['dataMin', 'dataMax']} tick={{ fontSize: 11 }} minTickGap={60} axisLine={false} tickLine={false}
                      tickFormatter={v => new Date(v).toLocaleDateString('en-IN', chartRange === '1D' ? { hour: '2-digit', minute: '2-digit' } : { month: 'short', day: 'numeric', year: rangeDef.days > 400 ? '2-digit' : undefined })} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={50}
                      tickFormatter={v => `${v}%`} />
                    <Tooltip
                      contentStyle={{ borderRadius: 10, fontSize: 12, border: '1px solid var(--neutral-200)', background: 'var(--bg-card)' }}
                      labelFormatter={v => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      formatter={(v, name, props) => {
                        const idx = parseInt(props.dataKey.replace('asset', ''));
                        return [`${v >= 0 ? '+' : ''}${v}%`, graphAssets[idx]?.name || name];
                      }}
                    />
                    {graphAssets.map((a, i) => {
                      const origIdx = validAssets.findIndex(va => va.id === a.id);
                      return <Line key={a.id} type="monotone" dataKey={`asset${i}`} stroke={COLORS[origIdx % COLORS.length]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />;
                    })}
                  </LineChart>
                </ResponsiveContainer>

                {/* Custom Interactive Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                  {validAssets.map((a, i) => {
                    const isVisible = !hiddenGraphIds.includes(a.id);
                    const color = COLORS[i % COLORS.length];
                    return (
                      <button
                        key={a.id}
                        onClick={() => setHiddenGraphIds(prev => isVisible ? [...prev, a.id] : prev.filter(id => id !== a.id))}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
                          borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                          border: `1px solid ${isVisible ? color : 'var(--border)'}`,
                          background: isVisible ? `${color}15` : 'transparent',
                          color: isVisible ? color : 'var(--text-3)',
                          transition: 'all .15s'
                        }}
                      >
                        <div style={{
                          width: '14px', height: '14px', borderRadius: '4px',
                          background: isVisible ? color : 'transparent',
                          border: `1px solid ${isVisible ? color : 'var(--text-3)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {isVisible && <Check size={10} color="#fff" strokeWidth={3} />}
                        </div>
                        {a.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '0.85rem' }}>
                Not enough overlapping history for this range.
              </div>
            )}
          </div>
        )}

        {/* AI Summary */}
        {isComparable && !loadingDetail && summary && (
          <div className="ai-panel" style={{ marginTop: '24px' }}>
            <div className="ai-panel-header">
              <Sparkles size={18} color="var(--violet)" />
              <div className="ai-panel-title" style={{ fontSize: '1rem' }}>Comparison Summary</div>
              <span className="badge badge-violet" style={{ marginLeft: 'auto' }}>Research Only</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p>
                Over {summary.rangeLabel.toLowerCase()}, <strong>{summary.leader.name}</strong> was the best performer, outperforming the laggard <strong>{summary.laggard.name}</strong> by {summary.gap} percentage points
                ({pct(summary.leaderMove)} vs {pct(summary.laggardMove)}).
                {summary.steadier && (
                  ` ${summary.steadier.name} showed the steadiest day-to-day movement (${summary.lowestVol}% daily volatility), suggesting a smoother ride for holders over this period compared to the others.`
                )}
              </p>
              
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                Past performance and lower volatility are not guarantees of future results — they reflect what happened in this specific window, which can change with market conditions.
              </p>
            </div>
            
            <div className="ai-disclaimer" style={{ display: 'inline-flex', width: 'fit-content', marginTop: '10px' }}>
              <AlertCircle size={13} />
              <span>Source: NSE/BSE/NASDAQ listings, AMFI NAV feed, Yahoo Finance • Not investment advice</span>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }
      .compare-row-multi:hover { background: var(--bg-subtle); }
      `}</style>
    </div>
  );
}
