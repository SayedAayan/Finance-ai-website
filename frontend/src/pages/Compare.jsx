import { useState } from 'react';
import { BarChart2, TrendingUp, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockStocks, mockFunds } from '../data/mockData';

function isBetter(key, val1, val2, lowerIsBetter = false) {
  if (val1 === val2) return [null, null];
  const v1 = parseFloat(String(val1).replace(/[^0-9.-]/g, ''));
  const v2 = parseFloat(String(val2).replace(/[^0-9.-]/g, ''));
  if (isNaN(v1) || isNaN(v2)) return [null, null];
  if (lowerIsBetter) return [v1 < v2 ? 'win' : 'lose', v2 < v1 ? 'win' : 'lose'];
  return [v1 > v2 ? 'win' : 'lose', v2 > v1 ? 'win' : 'lose'];
}

export default function Compare() {
  const [mode, setMode] = useState('funds'); // 'funds' or 'stocks'
  const navigate = useNavigate();

  // Selected Compare Targets
  const [leftId, setLeftId] = useState('HDFC-FLEXI');
  const [rightId, setRightId] = useState('PPFAS-FLEXI');

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'funds') {
      setLeftId('HDFC-FLEXI');
      setRightId('PPFAS-FLEXI');
    } else {
      setLeftId('RELIANCE');
      setRightId('TCS');
    }
  };

  const getCompareAsset = (id, mode) => {
    if (mode === 'funds') {
      const f = mockFunds.find(item => item.id === id);
      if (!f) return {};
      return {
        id: f.id,
        name: f.name,
        type: 'fund',
        ticker: f.category,
        aum: `₹${f.aum}`,
        nav: `₹${f.nav.toLocaleString()}`,
        expense: `${f.expenseRatio}%`,
        riskometer: f.riskometer,
        returns: f.returns,
        manager: f.manager,
        benchmark: f.benchmark,
        benchReturns: f.benchmarkReturns,
        exitLoad: f.exitLoad,
        category: f.category,
        amc: f.amc
      };
    } else {
      const s = mockStocks.find(item => item.id === id);
      if (!s) return {};
      return {
        id: s.id,
        name: s.name,
        type: 'stock',
        ticker: s.ticker,
        price: `₹${s.price.toLocaleString()}`,
        mcap: `₹${s.marketCap}`,
        pe: s.peRatio,
        pb: s.pbRatio,
        divYield: `${s.dividendYield}%`,
        roe: `${s.roe}%`,
        debtEq: s.debtToEquity,
        change: `${s.changePercent >= 0 ? '+' : ''}${s.changePercent}%`,
        changeUp: s.changePercent >= 0,
        sector: s.about.split(' ').slice(-2).join(' '), // sector summary fallback
      };
    }
  };

  const left = getCompareAsset(leftId, mode);
  const right = getCompareAsset(rightId, mode);

  const fundRows = [
    { label: 'AUM', l: left.aum, r: right.aum },
    { label: 'NAV', l: left.nav, r: right.nav },
    { label: 'Expense Ratio (Direct)', l: left.expense, r: right.expense, lowerBetter: true },
    { label: 'Exit Load', l: left.exitLoad, r: right.exitLoad },
    { label: 'Category', l: left.category, r: right.category },
    { label: 'Fund Manager', l: left.manager, r: right.manager },
    { label: 'Risk Level', l: left.riskometer, r: right.riskometer },
    { label: 'Benchmark', l: left.benchmark, r: right.benchmark },
    { label: '1Y Return', l: left.returns ? `${left.returns['1Y']}%` : '-', r: right.returns ? `${right.returns['1Y']}%` : '-' },
    { label: '3Y Return', l: left.returns ? `${left.returns['3Y']}%` : '-', r: right.returns ? `${right.returns['3Y']}%` : '-' },
    { label: '5Y Return', l: left.returns ? `${left.returns['5Y']}%` : '-', r: right.returns ? `${right.returns['5Y']}%` : '-' },
    { 
      label: '1Y vs Benchmark', 
      l: (left.returns && left.benchReturns) ? `+${(left.returns['1Y'] - left.benchReturns['1Y']).toFixed(1)}%` : '-', 
      r: (right.returns && right.benchReturns) ? `+${(right.returns['1Y'] - right.benchReturns['1Y']).toFixed(1)}%` : '-' 
    },
  ];

  const stockRows = [
    { label: 'Price', l: left.price, r: right.price },
    { label: 'Market Cap', l: left.mcap, r: right.mcap },
    { label: 'P/E Ratio', l: left.pe, r: right.pe, lowerBetter: true },
    { label: 'P/B Ratio', l: left.pb, r: right.pb, lowerBetter: true },
    { label: 'Dividend Yield', l: left.divYield, r: right.divYield },
    { label: 'Debt / Equity', l: left.debtEq, r: right.debtEq, lowerBetter: true },
    { label: 'ROE', l: left.roe, r: right.roe },
    { label: 'Sector Info', l: left.sector, r: right.sector },
    { label: 'Today', l: left.change, r: right.change },
  ];

  const rows = mode === 'funds' ? fundRows : stockRows;

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

          {/* Header with Asset Choice dropdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 1fr' }}>
            <div className="compare-col-header" style={{ background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', fontWeight: 700, paddingLeft: '16px', color: 'var(--text-3)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              Select Assets to Compare
            </div>
            
            {/* Left Slot Select */}
            <div className="compare-col-header" style={{ borderLeft: '1px solid var(--border)', padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)' }}>ASSET 1</label>
                <select
                  value={leftId}
                  onChange={(e) => setLeftId(e.target.value)}
                  style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: 'var(--text-1)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    background: 'white',
                    width: '100%',
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  {mode === 'funds' ? (
                    mockFunds.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))
                  ) : (
                    mockStocks.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.ticker})</option>
                    ))
                  )}
                </select>
                <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}
                  onClick={() => mode === 'funds' ? navigate(`/fund/${leftId}`) : navigate(`/stock/${leftId}`)}>
                  Full Profile <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Right Slot Select */}
            <div className="compare-col-header" style={{ borderLeft: '1px solid var(--border)', padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)' }}>ASSET 2</label>
                <select
                  value={rightId}
                  onChange={(e) => setRightId(e.target.value)}
                  style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: 'var(--text-1)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    background: 'white',
                    width: '100%',
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  {mode === 'funds' ? (
                    mockFunds.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))
                  ) : (
                    mockStocks.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.ticker})</option>
                    ))
                  )}
                </select>
                <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}
                  onClick={() => mode === 'funds' ? navigate(`/fund/${rightId}`) : navigate(`/stock/${rightId}`)}>
                  Full Profile <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, idx) => {
            const [lWin, rWin] = isBetter(row.label, row.l, row.r, row.lowerBetter);
            return (
              <div key={idx} className="compare-row" style={{ gridTemplateColumns: '240px 1fr 1fr' }}>
                <div className="compare-label-cell">{row.label}</div>
                <div className={`compare-val-cell ${lWin === 'win' ? 'winner' : lWin === 'lose' ? 'loser' : ''}`}>
                  {row.l}
                  {lWin === 'win' && <span style={{ marginLeft: '8px', fontSize: '0.75rem' }}>▲</span>}
                </div>
                <div className={`compare-val-cell ${rWin === 'win' ? 'winner' : rWin === 'lose' ? 'loser' : ''}`}>
                  {row.r}
                  {rWin === 'win' && <span style={{ marginLeft: '8px', fontSize: '0.75rem' }}>▲</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Summary */}
        <div className="ai-panel" style={{ marginTop: '24px' }}>
          <div className="ai-panel-header">
            <Sparkles size={18} color="var(--violet)" />
            <div className="ai-panel-title" style={{ fontSize: '1rem' }}>AI Comparison Summary</div>
            <span className="badge badge-violet" style={{ marginLeft: 'auto' }}>Research Only</span>
          </div>
          {mode === 'funds' ? (
            <p>
              Comparing <strong>{left.name}</strong> vs <strong>{right.name}</strong>. Both are actively managed portfolios.
              {leftId === rightId ? (
                " You have selected the same fund in both comparison slots. Try selecting different funds to perform a comparative alpha analysis."
              ) : (
                ` ${left.name} is managed by ${left.manager} with an expense ratio of ${left.expense}, while ${right.name} is managed by ${right.manager} with an expense ratio of ${right.expense}. PPFAS has historically favored international diversification (e.g. Microsoft), while HDFC targets high-conviction domestic equities.`
              )}
            </p>
          ) : (
            <p>
              Comparing <strong>{left.name} ({left.ticker})</strong> vs <strong>{right.name} ({right.ticker})</strong>. 
              {leftId === rightId ? (
                " You have selected the same stock in both comparison slots. Try selecting a different stock to compare metrics."
              ) : (
                ` ${left.name} trades at ₹${left.price} with a P/E of ${left.pe}, while ${right.name} trades at ₹${right.price} with a P/E of ${right.pe}. ${left.pe < right.pe ? left.name : right.name} is valued cheaper on a trailing earnings basis.`
              )}
            </p>
          )}
          <div className="ai-disclaimer" style={{ display: 'inline-flex', width: 'fit-content' }}>
            <AlertCircle size={13} />
            <span>Source: NSE, AMFI, Scheme SIDs • This is research analysis, not investment advice</span>
          </div>
        </div>
      </div>
    </div>
  );
}
