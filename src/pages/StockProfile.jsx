import { useParams, Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Info, Sparkles, AlertTriangle, ArrowRight, Home } from 'lucide-react';

const DATA = {
  price: '₹2,950.45', change: '+36.20 (+1.24%)', up: true,
  name: 'Reliance Industries Ltd', ticker: 'RELIANCE', sector: 'Conglomerate',
  metrics: [
    { label: 'Market Cap', val: '₹19.8T', isPrimary: true },
    { label: 'P/E Ratio', val: '28.5', hint: 'Price to Earnings', isPrimary: true },
    { label: 'P/B Ratio', val: '2.7', hint: 'Price to Book' },
    { label: 'Div Yield', val: '0.35%' },
    { label: 'ROE', val: '9.8%', hint: 'Return on Equity' },
    { label: 'Debt/Eq', val: '0.42' },
    { label: '52W High', val: '₹3,024.90' },
    { label: '52W Low', val: '₹2,220.30' },
  ]
};

export default function StockProfile() {
  const { id } = useParams();
  const d = DATA;

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Header Area */}
      <div className="profile-top">
        <div className="container">
          <div className="profile-breadcrumb">
            <Link to="/"><Home size={13} /></Link> / <Link to="/">Stocks</Link> / <span>{id}</span>
          </div>
          
          <div className="profile-name-row">
            <div>
              <h2 style={{ marginBottom: '2px' }}>{d.name}</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span className="badge badge-grey">{d.ticker} • NSE</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 500 }}>{d.sector}</span>
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }} className="trust-mark">
              <div className="live-dot"></div> Live Data
            </div>
          </div>

          <div className="profile-price-row">
            <div className="profile-price num">{d.price}</div>
            <div className={`profile-change ${d.up ? 'text-green' : 'text-red'}`}>
              <span className={`badge ${d.up ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                {d.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {d.change}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Strip */}
        <div style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="container profile-metrics">
            {d.metrics.map((m, i) => (
              <div key={i} className="profile-metric-item">
                <div className="stat-label" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {m.label} {m.hint && <Info size={11} />}
                </div>
                <div className="stat-value num" style={{ fontSize: m.isPrimary ? '1.25rem' : '1.1rem', marginTop: '2px' }}>{m.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container profile-body">
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Chart */}
          <div className="chart-wrap">
            <div className="chart-header">
              <h4 style={{ margin: 0 }}>Price Trend</h4>
              <div className="chart-tabs">
                {['1D','1W','1M','1Y','5Y'].map((t, i) => (
                  <button key={i} className={`btn btn-sm ${t==='1Y' ? 'btn-outline' : 'btn-ghost'}`} style={{ padding: '4px 10px' }}>{t}</button>
                ))}
              </div>
            </div>
            <div className="chart-body" style={{ height: '300px', padding: '0' }}>
              <svg viewBox="0 0 800 300" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="var(--blue)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,300 L0,220 Q50,180 100,200 T200,150 T300,180 T400,100 T500,140 T600,80 T700,90 T800,40 L800,300 Z" fill="url(#chartGrad)" />
                <path d="M0,220 Q50,180 100,200 T200,150 T300,180 T400,100 T500,140 T600,80 T700,90 T800,40" fill="none" stroke="var(--blue)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </div>

          {/* Peer Comparison */}
          <div className="chart-wrap">
            <div className="chart-header">
              <h4 style={{ margin: 0 }}>Peer Comparison</h4>
              <Link to="/compare" className="btn btn-ghost btn-sm">Full Compare <ArrowRight size={13} /></Link>
            </div>
            <table className="data-table right-align">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Company</th>
                  <th>Price</th>
                  <th>Market Cap</th>
                  <th>P/E</th>
                  <th>ROE</th>
                  <th>1Y Ret</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: 'var(--blue-light)' }}>
                  <td style={{ textAlign: 'left', fontWeight: 600 }}>{d.name}</td>
                  <td className="num">{d.price}</td>
                  <td className="num">{d.metrics[0].val}</td>
                  <td className="num">{d.metrics[1].val}</td>
                  <td className="num">{d.metrics[4].val}</td>
                  <td className="num text-green fw-6">+24.5%</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'left' }}>TCS</td>
                  <td className="num">₹3,890.10</td>
                  <td className="num">₹14.2T</td>
                  <td className="num">30.2</td>
                  <td className="num">47.2%</td>
                  <td className="num text-green fw-6">+18.2%</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'left' }}>Infosys</td>
                  <td className="num">₹1,612.55</td>
                  <td className="num">₹6.7T</td>
                  <td className="num">24.1</td>
                  <td className="num">31.8%</td>
                  <td className="num text-green fw-6">+12.4%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column / Sidebar */}
        <div className="profile-sidebar">
          <div className="ai-panel">
            <div className="ai-panel-header">
              <Sparkles size={16} color="var(--violet)" />
              <div className="ai-panel-title">AI Synthesis</div>
              <span className="badge badge-violet" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>Research</span>
            </div>
            <p>
              <strong className="text-1">Reliance Industries</strong> is currently trading at a P/E of {d.metrics[1].val}, which is slightly above its 5-year historical average of 25. 
              The company's Debt-to-Equity ratio remains healthy at {d.metrics[5].val}, indicating manageable leverage.
            </p>
            <p style={{ marginTop: '12px' }}>
              Recent Q1 earnings showed strong growth in the retail and telecom (Jio) segments, offsetting weakness in O2C (Oil-to-Chemicals) margins.
            </p>
            <div className="ai-disclaimer">
              <AlertTriangle size={14} color="var(--text-3)" />
              <span>This is automated analysis based on latest filings. Not investment advice.</span>
            </div>
          </div>

          <div className="card card-pad">
            <h4 style={{ marginBottom: '16px' }}>About the Company</h4>
            <p style={{ fontSize: '0.85rem' }}>
              Reliance Industries Limited is an Indian multinational conglomerate headquartered in Mumbai. It has diverse businesses including energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles. Reliance is the most profitable company in India and the largest publicly traded company in India by market capitalisation.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
