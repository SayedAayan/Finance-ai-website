import { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart2, TrendingUp, Sparkles, AlertCircle, ArrowRight, Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function isBetter(key, val1, val2, lowerIsBetter = false) {
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
          border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px',
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
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px',
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

export default function Compare() {
  const [mode, setMode] = useState('funds'); // 'funds' or 'stocks'
  const navigate = useNavigate();

  const [leftAsset, setLeftAsset] = useState(null);
  const [rightAsset, setRightAsset] = useState(null);
  const [leftDetail, setLeftDetail] = useState(null);
  const [rightDetail, setRightDetail] = useState(null);
  const [leftStats, setLeftStats] = useState(null);
  const [rightStats, setRightStats] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setLeftAsset(null);
    setRightAsset(null);
    setLeftDetail(null);
    setRightDetail(null);
    setLeftStats(null);
    setRightStats(null);
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

  // Fetch enriched detail (live price/NAV) + historical return stats whenever a picked asset changes
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

  const pct = (v) => v != null ? `${v >= 0 ? '+' : ''}${v}%` : '—';

  const fundRows = [
    { label: 'AMC', l: left.amc, r: right.amc },
    { label: 'NAV', l: left.nav != null ? `₹${fmt(left.nav)}` : '—', r: right.nav != null ? `₹${fmt(right.nav)}` : '—' },
    { label: 'NAV Date', l: left.navDate, r: right.navDate },
    { label: 'Category', l: left.category, r: right.category },
    { label: 'Plan / Option', l: left.plan ? `${left.plan} - ${left.option}` : '—', r: right.plan ? `${right.plan} - ${right.option}` : '—' },
    { label: 'Scheme Type', l: left.schemeType, r: right.schemeType },
    { label: '1M Return', l: pct(left.return1M), r: pct(right.return1M) },
    { label: '3M Return', l: pct(left.return3M), r: pct(right.return3M) },
    { label: '6M Return', l: pct(left.return6M), r: pct(right.return6M) },
    { label: '1Y Return', l: pct(left.return1Y), r: pct(right.return1Y) },
    { label: '3Y Return', l: pct(left.return3Y), r: pct(right.return3Y) },
    { label: 'ISIN', l: left.isin, r: right.isin },
  ];

  const stockRows = [
    { label: 'Exchange', l: left.exchange, r: right.exchange },
    { label: 'Price', l: left.price != null ? `${left.currency === 'USD' ? '$' : '₹'}${fmt(left.price)}` : '—', r: right.price != null ? `${right.currency === 'USD' ? '$' : '₹'}${fmt(right.price)}` : '—' },
    { label: 'Today', l: pct(left.changePercent != null ? Number(left.changePercent) : null), r: pct(right.changePercent != null ? Number(right.changePercent) : null) },
    { label: '1M Return', l: pct(left.return1M), r: pct(right.return1M) },
    { label: '3M Return', l: pct(left.return3M), r: pct(right.return3M) },
    { label: '6M Return', l: pct(left.return6M), r: pct(right.return6M) },
    { label: '1Y Return', l: pct(left.return1Y), r: pct(right.return1Y) },
    { label: '52W High', l: left.fiftyTwoWeekHigh != null ? fmt(left.fiftyTwoWeekHigh) : '—', r: right.fiftyTwoWeekHigh != null ? fmt(right.fiftyTwoWeekHigh) : '—' },
    { label: '52W Low', l: left.fiftyTwoWeekLow != null ? fmt(left.fiftyTwoWeekLow) : '—', r: right.fiftyTwoWeekLow != null ? fmt(right.fiftyTwoWeekLow) : '—' },
    { label: 'Volume', l: left.volume != null ? fmt(left.volume, 0) : '—', r: right.volume != null ? fmt(right.volume, 0) : '—' },
  ];

  const rows = mode === 'funds' ? fundRows : stockRows;
  const bothSelected = leftAsset && rightAsset;

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
        <div className="compare-table">

          {/* Header with Asset Choice pickers */}
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 1fr' }}>
            <div className="compare-col-header" style={{ background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', fontWeight: 700, paddingLeft: '16px', color: 'var(--text-3)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              Select Assets to Compare
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
          ) : rows.map((row, idx) => {
            const [lWin, rWin] = isBetter(row.label, row.l, row.r, row.lowerBetter);
            return (
              <div key={idx} className="compare-row" style={{ gridTemplateColumns: '240px 1fr 1fr' }}>
                <div className="compare-label-cell">{row.label}</div>
                <div className={`compare-val-cell ${lWin === 'win' ? 'winner' : lWin === 'lose' ? 'loser' : ''}`}>
                  {row.l ?? '—'}
                  {lWin === 'win' && <span style={{ marginLeft: '8px', fontSize: '0.75rem' }}>▲</span>}
                </div>
                <div className={`compare-val-cell ${rWin === 'win' ? 'winner' : rWin === 'lose' ? 'loser' : ''}`}>
                  {row.r ?? '—'}
                  {rWin === 'win' && <span style={{ marginLeft: '8px', fontSize: '0.75rem' }}>▲</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Summary */}
        {bothSelected && !loadingDetail && (
          <div className="ai-panel" style={{ marginTop: '24px' }}>
            <div className="ai-panel-header">
              <Sparkles size={18} color="var(--violet)" />
              <div className="ai-panel-title" style={{ fontSize: '1rem' }}>Comparison Summary</div>
              <span className="badge badge-violet" style={{ marginLeft: 'auto' }}>Research Only</span>
            </div>
            {mode === 'funds' ? (
              <p>
                Comparing <strong>{left.name}</strong> vs <strong>{right.name}</strong>.
                {leftAsset.id === rightAsset.id ? (
                  ' You have selected the same fund in both comparison slots. Try selecting different funds to compare.'
                ) : (
                  ` ${left.name} is offered by ${left.amc || 'its AMC'} with a NAV of ₹${fmt(left.nav)}, while ${right.name} is offered by ${right.amc || 'its AMC'} with a NAV of ₹${fmt(right.nav)}.`
                )}
                {left.return1Y != null && right.return1Y != null && leftAsset.id !== rightAsset.id && (
                  ` Over the past year, ${left.name} returned ${pct(left.return1Y)} versus ${pct(right.return1Y)} for ${right.name}.`
                )}
              </p>
            ) : (
              <p>
                Comparing <strong>{left.name} ({left.symbol})</strong> vs <strong>{right.name} ({right.symbol})</strong>.
                {leftAsset.id === rightAsset.id ? (
                  ' You have selected the same stock in both comparison slots. Try selecting a different stock to compare.'
                ) : (
                  ` ${left.name} trades at ${left.price != null ? fmt(left.price) : 'n/a'} on ${left.exchange}, while ${right.name} trades at ${right.price != null ? fmt(right.price) : 'n/a'} on ${right.exchange}.`
                )}
                {left.return1Y != null && right.return1Y != null && leftAsset.id !== rightAsset.id && (
                  ` Over the past year, ${left.name} moved ${pct(left.return1Y)} versus ${pct(right.return1Y)} for ${right.name}.`
                )}
              </p>
            )}
            <div className="ai-disclaimer" style={{ display: 'inline-flex', width: 'fit-content' }}>
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
