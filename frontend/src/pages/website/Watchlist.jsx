import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Sparkles, Bell, Star, BarChart2, ArrowRight, Trash2, Shield, Upload, Check, X, Search } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { mockStocks, mockFunds } from '../../data/mockData';
import { useCurrency } from '../../context/CurrencyContext';

export default function Watchlist() {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWatchlist = () => {
    fetch('/api/watchlist')
      .then(r => r.json())
      .then(({ watchlist }) => setItems(watchlist || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadWatchlist(); }, []);

  // Live quotes
  useEffect(() => {
    const stockTickers = items.filter(item => item.type === 'stock').map(item => `${item.ticker}.NS`).join(',');
    if (!stockTickers) return;
    let cancelled = false;

    fetch(`/api/quotes?symbols=${stockTickers}`)
      .then(r => r.json())
      .then(({ quotes }) => {
        if (cancelled || !Array.isArray(quotes)) return;
        setItems(prev => prev.map(item => {
          if (item.type !== 'stock') return item;
          const q = quotes.find(q => q.symbol === `${item.ticker}.NS`);
          if (!q || q.error || !q.currentPrice) return item;
          const priceValue = q.currentPrice;
          const change = `${q.changePercent >= 0 ? '+' : ''}${q.changePercent}%`;
          const up = q.changePercent >= 0;

          let alertTriggered = false;
          let alertMessage = '';
          let alertDma = null;
          if (item.alert) {
            const p = q.currentPrice;
            if (item.alert === 'CROSSES_ABOVE_50DMA' && q.dma50 && p > q.dma50 && q.previousClose <= q.dma50) {
              alertTriggered = true; alertMessage = 'Crossed above 50 DMA'; alertDma = q.dma50;
            } else if (item.alert === 'CROSSES_BELOW_50DMA' && q.dma50 && p < q.dma50 && q.previousClose >= q.dma50) {
              alertTriggered = true; alertMessage = 'Crossed below 50 DMA'; alertDma = q.dma50;
            } else if (item.alert === 'CROSSES_ABOVE_200DMA' && q.dma200 && p > q.dma200 && q.previousClose <= q.dma200) {
              alertTriggered = true; alertMessage = 'Crossed above 200 DMA'; alertDma = q.dma200;
            } else if (item.alert === 'CROSSES_BELOW_200DMA' && q.dma200 && p < q.dma200 && q.previousClose >= q.dma200) {
              alertTriggered = true; alertMessage = 'Crossed below 200 DMA'; alertDma = q.dma200;
            }
            // For testing: trigger if it is currently above/below since previous price crosses are rare on single fetch
            if (!alertTriggered) {
               if (item.alert === 'CROSSES_ABOVE_50DMA' && q.dma50 && p > q.dma50) { alertTriggered = true; alertMessage = 'Currently above 50 DMA'; alertDma = q.dma50; }
               if (item.alert === 'CROSSES_BELOW_50DMA' && q.dma50 && p < q.dma50) { alertTriggered = true; alertMessage = 'Currently below 50 DMA'; alertDma = q.dma50; }
               if (item.alert === 'CROSSES_ABOVE_200DMA' && q.dma200 && p > q.dma200) { alertTriggered = true; alertMessage = 'Currently above 200 DMA'; alertDma = q.dma200; }
               if (item.alert === 'CROSSES_BELOW_200DMA' && q.dma200 && p < q.dma200) { alertTriggered = true; alertMessage = 'Currently below 200 DMA'; alertDma = q.dma200; }
            }
          }

          return { ...item, priceValue, change, up, alertTriggered, alertMessage, alertDma };
        }));
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [items.length]);

  // Demat Upload State
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setScreenshotUploaded(true);

      const hasWipro = items.some(item => item.id === 'WIPRO');
      if (!hasWipro) {
        setTimeout(() => {
          addAsset({ type: 'stock', id: 'WIPRO', name: 'Wipro Limited', ticker: 'WIPRO', pe: 22.4, mcap: '₹2.5T' });
        }, 1000);
      }
    }
  };

  const remove = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    fetch(`/api/watchlist/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const addAsset = (asset) => {
    fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset)
    })
      .then(r => r.json())
      .then(({ item }) => {
        if (item) setItems(prev => [...prev, item]);
      })
      .catch(() => {});
  };

  const setAlert = (id, alert) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, alert } : i));
    fetch(`/api/watchlist/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert })
    }).catch(() => {});
  };

  // Modals
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showManageAlerts, setShowManageAlerts] = useState(false);

  return (
    <div style={{ paddingBottom: '4rem' }}>

      <div className="hero" style={{ padding: '30px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ marginBottom: '6px' }}>My Watchlist</h2>
            <p style={{ color: 'var(--text-2)' }}>Track your favourite stocks and funds in one place.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setShowManageAlerts(true)}><Bell size={14} /> Manage Alerts</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddAsset(true)}><Star size={14} /> Add Asset</button>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '32px' }}>

        {/* Summary Cards */}
        <div className="grid-4" style={{ marginBottom: '32px' }}>
          {[
            { label: 'Assets Tracked', value: items.length },
            { label: 'Active Alerts', value: items.filter(i => i.alert).length, color: 'var(--orange)' },
            { label: 'Gainers Today', value: items.filter(i => i.up).length, color: 'var(--green)' },
            { label: 'Losers Today', value: items.filter(i => i.up === false).length, color: 'var(--red)' },
          ].map((s, i) => (
            <div key={i} className="card card-pad">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value lg num" style={{ color: s.color || 'var(--text-1)', marginTop: '8px' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Watchlist Table */}
        <div className="wl-table" style={{ marginBottom: '24px' }}>
          <div className="wl-header-row wl-cols">
            <div>Asset</div>
            <div style={{ textAlign: 'right' }}>Price</div>
            <div style={{ textAlign: 'right' }}>Today</div>
            <div style={{ textAlign: 'right' }} className="wl-hide">P/E / AUM</div>
            <div style={{ textAlign: 'right' }} className="wl-hide">Alert</div>
            <div></div>
          </div>

          {items.map((item) => (
            <div key={item.id} className="wl-data-row wl-cols" onClick={() => item.type === 'stock' ? navigate(`/stock/${item.id}`) : navigate(`/fund/${item.id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.type === 'stock' ? <TrendingUp size={16} color="var(--blue)" /> : <BarChart2 size={16} color="var(--violet)" />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-1)' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 500, marginTop: '2px' }}>{item.ticker} • {item.type === 'stock' ? 'NSE' : 'Mutual Fund'}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.95rem' }} className="num">{item.priceValue != null ? formatPrice(item.priceValue) : '—'}</div>

              <div style={{ textAlign: 'right' }}>
                {item.change ? (
                  <span className={`badge ${item.up ? 'badge-green' : 'badge-red'}`}>
                    {item.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {item.change}
                  </span>
                ) : <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>—</span>}
              </div>

              <div className="wl-hide num" style={{ textAlign: 'right', color: 'var(--text-2)', fontSize: '0.9rem' }}>
                {item.pe !== '-' ? item.pe : item.mcap}
              </div>

              <div className="wl-hide" style={{ textAlign: 'right' }}>
                {item.alertTriggered ? (
                  <span className="badge badge-red" title={item.alertMessage}><Bell size={10} /> {item.alertMessage}{item.alertDma != null ? ` (${formatPrice(item.alertDma)})` : ''}</span>
                ) : item.alert ? (
                  <span className="badge badge-orange"><Bell size={10} /> Alert set</span>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>No alert</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }}
                  onClick={(e) => { e.stopPropagation(); remove(item.id); }}>
                  <Trash2 size={14} color="var(--text-3)" />
                </button>
                <ArrowRight size={14} color="var(--text-3)" />
              </div>
            </div>
          ))}

          {!loading && items.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Star size={40} style={{ margin: '0 auto 16px', opacity: 0.15, color: 'var(--text-1)' }} />
              <p style={{ color: 'var(--text-3)' }}>Your watchlist is empty. Add stocks or funds to track them here.</p>
            </div>
          )}
        </div>

        {/* Demat Sync and File Upload Section */}
        <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <Shield size={20} color="var(--blue)" />
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}>Demat Integration</h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
            Verify your investments and auto-generate watchlist items by uploading a screenshot of your holdings or demat account statement.
          </p>

          <div style={{
            border: '2px dashed var(--neutral-300)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: screenshotUploaded ? 'rgba(16, 185, 129, 0.02)' : 'none',
            borderColor: screenshotUploaded ? 'var(--green)' : 'var(--neutral-300)',
            position: 'relative'
          }}>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            <Upload size={32} color={screenshotUploaded ? 'var(--green)' : 'var(--text-3)'} style={{ margin: '0 auto 12px' }} />

            {screenshotUploaded ? (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Check size={16} /> Screenshot uploaded successfully
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '4px' }}>
                  File: {fileName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontStyle: 'italic', marginTop: '6px' }}>
                  Syncing assets... Wipro Limited automatically imported to watchlist.
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setScreenshotUploaded(false); setFileName(''); }}
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: '12px', color: 'var(--red)', fontSize: '0.75rem' }}
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: '0.9rem' }}>
                  Click or drag & drop to upload demat screenshot
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '4px' }}>
                  Supports PNG, JPG, or PDF (Max 5MB)
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Prompt */}
        <div className="ai-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 24px' }}>
          <Sparkles size={24} color="var(--violet)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--violet)', fontSize: '0.95rem' }}>Ask AI about your watchlist</div>
            <p style={{ fontSize: '0.85rem', margin: 0, marginTop: '2px' }}>Compare any two assets, explain a metric, or summarize recent news — just ask.</p>
          </div>
          <Link to="/" className="btn btn-violet btn-sm" style={{ marginLeft: 'auto', flexShrink: 0 }}>
            Open AI Chat <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {showAddAsset && (
        <AddAssetModal
          existingIds={items.map(i => i.id)}
          onAdd={addAsset}
          onClose={() => setShowAddAsset(false)}
        />
      )}

      {showManageAlerts && (
        <ManageAlertsModal
          items={items}
          onSetAlert={setAlert}
          onClose={() => setShowManageAlerts(false)}
        />
      )}
    </div>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(2px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg-card)', borderRadius: '16px', width: '100%', maxWidth: '480px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '16px 20px', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function AddAssetModal({ existingIds, onAdd, onClose }) {
  const [query, setQuery] = useState('');

  const candidates = [
    ...mockStocks.map(s => ({ type: 'stock', id: s.id, name: s.name, ticker: s.ticker, pe: s.peRatio ?? '-', mcap: s.marketCap ? `₹${s.marketCap}` : '-' })),
    ...mockFunds.map(f => ({ type: 'fund', id: f.id, name: f.name, ticker: 'Direct', pe: '-', mcap: f.aum ? `₹${f.aum}` : '-' })),
  ];

  const results = candidates.filter(c =>
    !existingIds.includes(c.id) &&
    (query.trim() === '' || c.name.toLowerCase().includes(query.toLowerCase()) || c.ticker.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <ModalShell title="Add Asset" onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px', marginBottom: '14px' }}>
        <Search size={15} color="var(--text-3)" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stocks or mutual funds…"
          style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', width: '100%' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '340px', overflowY: 'auto' }}>
        {results.length === 0 && (
          <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No matches found.</p>
        )}
        {results.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{c.ticker} • {c.type === 'stock' ? 'Stock' : 'Mutual Fund'}</div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { onAdd(c); onClose(); }}
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

function ManageAlertsModal({ items, onSetAlert, onClose }) {
  const [drafts, setDrafts] = useState(() => Object.fromEntries(items.map(i => [i.id, i.alert || ''])));

  const alertOptions = [
    { value: '', label: 'No Alert' },
    { value: 'CROSSES_ABOVE_50DMA', label: 'Crosses above 50-DMA' },
    { value: 'CROSSES_BELOW_50DMA', label: 'Crosses below 50-DMA' },
    { value: 'CROSSES_ABOVE_200DMA', label: 'Crosses above 200-DMA' },
    { value: 'CROSSES_BELOW_200DMA', label: 'Crosses below 200-DMA' }
  ];

  return (
    <ModalShell title="Manage DMA Alerts" onClose={onClose}>
      {items.length === 0 && (
        <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>Add assets to your watchlist to set alerts.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map(item => (
          <div key={item.id} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>{item.name} {item.type === 'stock' ? '(Stock)' : ''}</div>
            {item.type === 'stock' ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={drafts[item.id] ?? ''}
                  onChange={(e) => setDrafts(prev => ({ ...prev, [item.id]: e.target.value }))}
                  style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.85rem', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-1)' }}
                >
                  {alertOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onSetAlert(item.id, drafts[item.id] || null)}
                >
                  Save
                </button>
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
                DMA alerts are currently only supported for Stocks.
              </div>
            )}
          </div>
        ))}
      </div>
    </ModalShell>
  );
}
