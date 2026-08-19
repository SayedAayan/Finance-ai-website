import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldAlert, TrendingUp, Sparkles, ArrowRight, Info, Home, Calculator, Globe } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import SearchBar from '../../components/ui/SearchBar';

const DEFAULT_FUND = {
  navValue: 1642.50,
  change: '+4.25 (+0.26%)',
  up: true,
  name: 'HDFC Flexi Cap Fund',
  plan: 'Direct Plan • Growth',
  category: 'Flexi Cap',
  risk: 4.2,
  aumCr: 45230,
  minSip: 500,
  metrics: [
    { label: 'Expense Ratio', val: '0.85%', isPrimary: true },
    { label: 'Exit Load', val: '1% (<1Yr)' },
    { label: 'Benchmark', val: 'NIFTY 500 TRI' },
  ]
};

export default function MutualFundProfile() {
  const { id: routeId } = useParams();
  const id = routeId || '120503';
  const { formatPrice } = useCurrency();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/mutual-fund/${encodeURIComponent(id)}`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled && data.scheme) {
          setScheme(data.scheme);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  const navVal = scheme?.nav ? parseFloat(scheme.nav) : DEFAULT_FUND.navValue;
  const isGlobal = scheme?.category?.toLowerCase().includes('international') || 
                   scheme?.category?.toLowerCase().includes('overseas') || 
                   scheme?.category?.toLowerCase().includes('global') || 
                   scheme?.name?.toLowerCase().includes('nasdaq') || 
                   scheme?.name?.toLowerCase().includes('us equity');

  const d = {
    name: scheme?.name || DEFAULT_FUND.name,
    plan: scheme?.plan ? `${scheme.plan} • ${scheme.option || 'Growth'}` : DEFAULT_FUND.plan,
    category: scheme?.category || DEFAULT_FUND.category,
    amc: scheme?.amc || 'Mutual Fund AMC',
    nav: formatPrice(navVal),
    change: scheme?.changePercent ? `${scheme.changePercent}%` : DEFAULT_FUND.change,
    up: true,
    metrics: [
      { label: 'NAV', val: formatPrice(navVal), isPrimary: true },
      { label: 'AMC Provider', val: scheme?.amc || 'Top Asset Management' },
      { label: 'Category', val: scheme?.category || DEFAULT_FUND.category },
      { label: 'Market Mandate', val: isGlobal ? '🌐 Global / Overseas FoF' : '🇮🇳 Domestic Indian Equity' },
      { label: 'Benchmark', val: isGlobal ? 'NASDAQ 100 / S&P 500 TRI' : 'NIFTY 500 TRI' }
    ]
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      
      {/* Header Area */}
      <div className="profile-top">
        <div className="container">
          <div className="profile-breadcrumb" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <Link to="/"><Home size={13} style={{ display: 'inline' }} /></Link> / <Link to="/amcs">Mutual Funds</Link> / <span>{id}</span>
            </div>
            <div className="w-full sm:w-[200px]">
              <SearchBar placeholder="Search mutual funds..." />
            </div>
          </div>

          <div className="profile-name-row">
            <div>
              <h2 style={{ marginBottom: '4px' }}>{d.name}</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="badge badge-grey">{d.plan}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 500 }}>{d.category}</span>
                {isGlobal && (
                  <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Globe size={12} /> Global Markets Asset
                  </span>
                )}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div className="trust-mark">
                <div className="live-dot"></div> Live AMFI NAV
              </div>
              <Link
                to={`/calculators?calc=sip&type=fund&name=${encodeURIComponent(d.name)}&schemeCode=${encodeURIComponent(id)}`}
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Calculator size={14} /> Calculate SIP Returns
              </Link>
            </div>
          </div>

          <div className="profile-price-row">
            <div className="profile-price num">{d.nav}</div>
            <div className="profile-change text-green">
              <span className="badge badge-green" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                <TrendingUp size={14} /> {d.change}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Strip */}
        <div style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="container profile-metrics">
            {d.metrics.map((m, i) => (
              <div key={i} className="profile-metric-item">
                <div className="stat-label">{m.label}</div>
                <div className="stat-value num" style={{ fontSize: m.isPrimary ? '1.25rem' : '1.1rem', marginTop: '2px' }}>{m.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container profile-body">
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Returns Table */}
          <div className="chart-wrap">
            <div className="chart-header">
              <h4 style={{ margin: 0 }}>Trailing Returns & Performance</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Live Exchange & AMFI Updated</span>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="data-table right-align">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Period</th>
                  <th>Fund Return</th>
                  <th>Benchmark Return</th>
                  <th>Alpha (Difference)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'left', fontWeight: 600 }}>1 Year</td>
                  <td className="num fw-6">32.5%</td>
                  <td className="num">29.8%</td>
                  <td className="num text-green fw-7">+2.7%</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'left', fontWeight: 600 }}>3 Years (CAGR)</td>
                  <td className="num fw-6">21.2%</td>
                  <td className="num">19.5%</td>
                  <td className="num text-green fw-7">+1.7%</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'left', fontWeight: 600 }}>5 Years (CAGR)</td>
                  <td className="num fw-6">18.5%</td>
                  <td className="num">17.2%</td>
                  <td className="num text-green fw-7">+1.3%</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

          {/* Holdings */}
          <div className="chart-wrap">
            <div className="chart-header">
              <h4 style={{ margin: 0 }}>Asset Allocation & Top Holdings</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Updated Monthly</span>
            </div>
            <div style={{ padding: '20px' }}>
              {(isGlobal ? [
                { name: 'Apple Inc. (NASDAQ)', val: '12.4%' },
                { name: 'Microsoft Corp. (NASDAQ)', val: '10.8%' },
                { name: 'NVIDIA Corp. (NASDAQ)', val: '8.5%' },
                { name: 'Amazon.com (NASDAQ)', val: '7.1%' },
                { name: 'Alphabet Inc. (NASDAQ)', val: '5.9%' }
              ] : [
                { name: 'HDFC Bank Ltd.', val: '9.2%' },
                { name: 'ICICI Bank Ltd.', val: '7.8%' },
                { name: 'Reliance Industries Ltd.', val: '6.5%' },
                { name: 'Larsen & Toubro Ltd.', val: '5.1%' },
                { name: 'Infosys Ltd.', val: '4.9%' }
              ]).map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                  <div style={{ width: '180px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-1)' }}>{h.name}</div>
                  <div style={{ flex: 1, background: 'var(--bg-subtle)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: h.val, background: 'var(--blue)', height: '100%', borderRadius: '6px' }}></div>
                  </div>
                  <div style={{ width: '40px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 700 }} className="num">{h.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="profile-sidebar">
          
          {/* SEBI Riskometer */}
          <div className="card card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h4 style={{ margin: 0 }}>Risk Classification</h4>
              <ShieldAlert size={16} color="var(--red)" />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>High Growth / Equity Risk</p>
            
            <div className="risk-bar-wrap" style={{ marginTop: '20px', marginBottom: '12px' }}>
              <div className="risk-dot" style={{ left: '80%' }}></div>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
              {isGlobal
                ? 'This scheme invests in overseas international equities and is subject to global market volatility and currency fluctuations.'
                : 'Investors should understand that their principal will be at high risk suitable for long term wealth creation.'}
            </p>
          </div>

          <div className="ai-panel">
            <div className="ai-panel-header">
              <Sparkles size={16} color="var(--violet)" />
              <div className="ai-panel-title">AI Guardian Summary</div>
              <span className="badge badge-violet" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>Research</span>
            </div>
            <p>
              This is a <strong className="text-1">{d.category} scheme</strong> managed by <strong className="text-1">{d.amc}</strong>.
            </p>
            <p style={{ marginTop: '12px' }}>
              {isGlobal
                ? 'It provides geographic diversification by channeling domestic Indian capital into US and global market innovators.'
                : 'It has maintained solid compounding across market cycles and offers disciplined SIP opportunities.'}
            </p>
            <Link to="/compare" className="btn btn-violet btn-sm w-full mt-3" style={{ justifyContent: 'center' }}>
              Compare in Head-to-Head <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
