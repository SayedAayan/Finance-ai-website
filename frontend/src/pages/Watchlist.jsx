import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Sparkles, Bell, Star, BarChart2, ArrowRight, Trash2, Shield, Upload, Check } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const WATCHLIST = [
  { type: 'stock', id: 'RELIANCE', name: 'Reliance Industries', ticker: 'RELIANCE', price: '₹2,950.45', change: '+1.24%', up: true, pe: 28.5, mcap: '₹19.8T', alert: '> ₹3,000' },
  { type: 'stock', id: 'TCS', name: 'TCS', ticker: 'TCS', price: '₹3,890.10', change: '-0.39%', up: false, pe: 30.2, mcap: '₹14.2T', alert: null },
  { type: 'fund', id: 'HDFC-FLEXI', name: 'HDFC Flexi Cap Fund', ticker: 'Direct', price: '₹1,642.50', change: '+0.26%', up: true, pe: '-', mcap: '₹45,230 Cr', alert: 'AUM drops < ₹40,000 Cr' },
  { type: 'fund', id: 'PPFAS-FLEXI', name: 'Parag Parikh Flexi Cap', ticker: 'Direct', price: '₹74.85', change: '+0.20%', up: true, pe: '-', mcap: '₹62,100 Cr', alert: 'Manager change' },
];

export default function Watchlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState(WATCHLIST);

  useEffect(() => {
    let cancelled = false;
    const stockTickers = WATCHLIST.filter(item => item.type === 'stock').map(item => `${item.ticker}.NS`).join(',');
    if (!stockTickers) return;
    
    fetch(`/api/quotes?symbols=${stockTickers}`)
      .then(r => r.json())
      .then(({ quotes }) => {
        if (cancelled || !Array.isArray(quotes)) return;
        setItems(prev => prev.map(item => {
          if (item.type !== 'stock') return item;
          const q = quotes.find(q => q.symbol === `${item.ticker}.NS`);
          if (!q || q.error || !q.currentPrice) return item;
          const price = `₹${q.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
          const change = `${q.changePercent >= 0 ? '+' : ''}${q.changePercent}%`;
          const up = q.changePercent >= 0;
          return { ...item, price, change, up };
        }));
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  // Demat Upload State
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setScreenshotUploaded(true);
      
      // Auto-simulate adding a scanned item
      const hasWipro = items.some(item => item.id === 'WIPRO');
      if (!hasWipro) {
        setTimeout(() => {
          setItems(prev => [
            ...prev,
            { type: 'stock', id: 'WIPRO', name: 'Wipro Limited', ticker: 'WIPRO', price: '₹482.30', change: '+0.85%', up: true, pe: 22.4, mcap: '₹2.5T', alert: 'Synced via Demat Statement' }
          ]);
        }, 1000);
      }
    }
  };

  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div style={{ paddingBottom: '4rem' }}>
      
      <div className="hero" style={{ padding: '30px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ marginBottom: '6px' }}>My Watchlist</h2>
            <p style={{ color: 'var(--text-2)' }}>Track your favourite stocks and funds in one place.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline btn-sm"><Bell size={14} /> Manage Alerts</button>
            <button className="btn btn-primary btn-sm"><Star size={14} /> Add Asset</button>
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
            { label: 'Losers Today', value: items.filter(i => !i.up).length, color: 'var(--red)' },
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
              
              <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.95rem' }} className="num">{item.price}</div>
              
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${item.up ? 'badge-green' : 'badge-red'}`}>
                  {item.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {item.change}
                </span>
              </div>
              
              <div className="wl-hide num" style={{ textAlign: 'right', color: 'var(--text-2)', fontSize: '0.9rem' }}>
                {item.pe !== '-' ? item.pe : item.mcap}
              </div>
              
              <div className="wl-hide" style={{ textAlign: 'right' }}>
                {item.alert ? (
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

          {items.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Star size={40} style={{ margin: '0 auto 16px', opacity: 0.15, color: 'var(--text-1)' }} />
              <p style={{ color: 'var(--text-3)' }}>Your watchlist is empty. Add stocks or funds to track them here.</p>
            </div>
          )}
        </div>

        {/* Demat Sync and File Upload Section */}
        <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid var(--neutral-200)', marginBottom: '24px' }}>
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
    </div>
  );
}
