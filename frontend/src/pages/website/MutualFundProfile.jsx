import { useParams, Link } from 'react-router-dom';
import { ShieldAlert, TrendingUp, Sparkles, ArrowRight, Info, Home } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import SearchBar from '../../components/ui/SearchBar';

const DATA = {
  navValue: 1642.50,
  change: '+4.25 (+0.26%)',
  up: true,
  name: 'HDFC Flexi Cap Fund',
  plan: 'Direct Plan • Growth',
  category: 'Flexi Cap',
  risk: 4.2, // 1 to 5
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
  const d = {
    ...DATA,
    nav: formatPrice(DATA.navValue),
    metrics: [
      { label: 'AUM', val: `${formatPrice(DATA.aumCr)} Cr`, isPrimary: true },
      DATA.metrics[0],
      { label: 'Min SIP', val: formatPrice(DATA.minSip) },
      DATA.metrics[1],
      DATA.metrics[2],
    ]
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      
      {/* Header Area */}
      <div className="profile-top">
        <div className="container">
          <div className="profile-breadcrumb" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <Link to="/"><Home size={13} style={{ display: 'inline' }} /></Link> / <Link to="/">Mutual Funds</Link> / <span>{id}</span>
            </div>
            <div className="w-full sm:w-[200px]">
              <SearchBar placeholder="Search mutual funds..." />
            </div>
          </div>

          <div className="profile-name-row">
            <div>
              <h2 style={{ marginBottom: '2px' }}>{d.name}</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span className="badge badge-grey">{d.plan}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 500 }}>{d.category}</span>
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }} className="trust-mark">
              <div className="live-dot"></div> Live NAV
            </div>
          </div>

          <div className="profile-price-row">
            <div className="profile-price num">{d.nav}</div>
            <div className={`profile-change ${d.up ? 'text-green' : 'text-red'}`}>
              <span className={`badge ${d.up ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
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
              <h4 style={{ margin: 0 }}>Trailing Returns</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>As of Last Trading Session</span>
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
              <h4 style={{ margin: 0 }}>Top 5 Holdings</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Updated Monthly</span>
            </div>
            <div style={{ padding: '20px' }}>
              {[
                { name: 'HDFC Bank Ltd.', val: '9.2%' },
                { name: 'ICICI Bank Ltd.', val: '7.8%' },
                { name: 'Reliance Industries Ltd.', val: '6.5%' },
                { name: 'Larsen & Toubro Ltd.', val: '5.1%' },
                { name: 'Infosys Ltd.', val: '4.9%' },
              ].map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                  <div style={{ width: '120px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-1)' }}>{h.name}</div>
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
              <h4 style={{ margin: 0 }}>SEBI Riskometer</h4>
              <ShieldAlert size={16} color="var(--red)" />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Very High Risk</p>
            
            <div className="risk-bar-wrap" style={{ marginTop: '20px', marginBottom: '12px' }}>
              <div className="risk-dot" style={{ left: `${(d.risk / 5) * 100}%` }}></div>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
              Investors should understand that their principal will be at <strong className="text-1">Very High risk</strong>. 
              The benchmark for this scheme is {d.metrics[4].val}.
            </p>
          </div>

          <div className="ai-panel">
            <div className="ai-panel-header">
              <Sparkles size={16} color="var(--violet)" />
              <div className="ai-panel-title">AI Summary</div>
              <span className="badge badge-violet" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>Research</span>
            </div>
            <p>
              This is a <strong className="text-1">Flexi Cap fund</strong>, meaning the manager can dynamically shift investments across Large, Mid, and Small-cap stocks without restrictions.
            </p>
            <p style={{ marginTop: '12px' }}>
              It has consistently beaten its benchmark over the 1, 3, and 5-year periods. The expense ratio of {d.metrics[1].val} for the Direct plan is competitive for this category.
            </p>
            <Link to="/compare" className="btn btn-violet btn-sm w-full mt-3" style={{ justifyContent: 'center' }}>
              Compare with PPFAS <ArrowRight size={13} />
            </Link>
          </div>

          <div className="card card-pad">
            <h4 style={{ marginBottom: '12px' }}>Fund Management</h4>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--text-3)', fontSize: '1.2rem' }}>
                RJ
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: '0.95rem' }}>Roshi Jain</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Managing since 2022</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
