import { useState } from 'react';
import { BarChart2, TrendingUp, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FUND_DATA = {
  'HDFC-FLEXI': {
    name: 'HDFC Flexi Cap Fund',
    type: 'fund',
    ticker: 'HDFC Flexi Cap',
    aum: '₹45,230 Cr',
    nav: '₹1,642.50',
    expense: '0.85%',
    riskometer: 'Very High',
    returns: { '1Y': 32.5, '3Y': 21.2, '5Y': 18.5 },
    manager: 'Roshi Jain',
    benchmark: 'NIFTY 500 TRI',
    benchReturns: { '1Y': 29.8, '3Y': 19.5, '5Y': 17.2 },
    exitLoad: '1% within 1Y',
    category: 'Flexi Cap',
  },
  'PPFAS-FLEXI': {
    name: 'Parag Parikh Flexi Cap Fund',
    type: 'fund',
    ticker: 'PPFAS Flexi Cap',
    aum: '₹62,100 Cr',
    nav: '₹74.85',
    expense: '0.65%',
    riskometer: 'Very High',
    returns: { '1Y': 30.1, '3Y': 22.8, '5Y': 20.4 },
    manager: 'Rajeev Thakkar',
    benchmark: 'NIFTY 500 TRI',
    benchReturns: { '1Y': 29.8, '3Y': 19.5, '5Y': 17.2 },
    exitLoad: '2% within 1Y, 1% within 2Y',
    category: 'Flexi Cap',
  },
};

const STOCK_DATA = {
  RELIANCE: {
    name: 'Reliance Industries',
    type: 'stock',
    ticker: 'RELIANCE',
    price: '₹2,950.45',
    mcap: '₹19.8T',
    pe: 28.5,
    pb: 2.7,
    divYield: '0.35%',
    roe: '9.8%',
    debtEq: 0.42,
    change: '+1.24%',
    changeUp: true,
    sector: 'Conglomerate',
  },
  TCS: {
    name: 'Tata Consultancy Services',
    type: 'stock',
    ticker: 'TCS',
    price: '₹3,890.10',
    mcap: '₹14.2T',
    pe: 30.2,
    pb: 12.1,
    divYield: '1.85%',
    roe: '47.2%',
    debtEq: 0.08,
    change: '-0.39%',
    changeUp: false,
    sector: 'IT Services',
  },
};

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

  const left = mode === 'funds' ? FUND_DATA['HDFC-FLEXI'] : STOCK_DATA['RELIANCE'];
  const right = mode === 'funds' ? FUND_DATA['PPFAS-FLEXI'] : STOCK_DATA['TCS'];

  const fundRows = [
    { label: 'AUM', l: left.aum, r: right.aum },
    { label: 'NAV', l: left.nav, r: right.nav },
    { label: 'Expense Ratio (Direct)', l: left.expense, r: right.expense, lowerBetter: true },
    { label: 'Exit Load', l: left.exitLoad, r: right.exitLoad },
    { label: 'Category', l: left.category, r: right.category },
    { label: 'Fund Manager', l: left.manager, r: right.manager },
    { label: 'Risk Level', l: left.riskometer, r: right.riskometer },
    { label: 'Benchmark', l: left.benchmark, r: right.benchmark },
    { label: '1Y Return', l: `${left.returns['1Y']}%`, r: `${right.returns['1Y']}%` },
    { label: '3Y Return', l: `${left.returns['3Y']}%`, r: `${right.returns['3Y']}%` },
    { label: '5Y Return', l: `${left.returns['5Y']}%`, r: `${right.returns['5Y']}%` },
    { label: '1Y vs Benchmark', l: `+${(left.returns['1Y'] - left.benchReturns['1Y']).toFixed(1)}%`, r: `+${(right.returns['1Y'] - right.benchReturns['1Y']).toFixed(1)}%` },
  ];

  const stockRows = [
    { label: 'Price', l: left.price, r: right.price },
    { label: 'Market Cap', l: left.mcap, r: right.mcap },
    { label: 'P/E Ratio', l: left.pe, r: right.pe, lowerBetter: true },
    { label: 'P/B Ratio', l: left.pb, r: right.pb, lowerBetter: true },
    { label: 'Dividend Yield', l: left.divYield, r: right.divYield },
    { label: 'Debt / Equity', l: left.debtEq, r: right.debtEq, lowerBetter: true },
    { label: 'ROE', l: left.roe, r: right.roe },
    { label: 'Sector', l: left.sector, r: right.sector },
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
            <button onClick={() => setMode('funds')} className={`btn btn-sm ${mode === 'funds' ? 'btn-primary' : 'btn-outline'}`}>
              <BarChart2 size={14} /> Mutual Funds
            </button>
            <button onClick={() => setMode('stocks')} className={`btn btn-sm ${mode === 'stocks' ? 'btn-primary' : 'btn-outline'}`}>
              <TrendingUp size={14} /> Stocks
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px' }}>
        <div className="compare-table">

          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 1fr' }}>
            <div className="compare-col-header" style={{ background: 'var(--bg-subtle)' }}></div>
            {[left, right].map((asset, i) => (
              <div key={i} className="compare-col-header" style={{ borderLeft: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 40, height: 40, background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                    {mode === 'funds' ? <BarChart2 size={18} color="var(--blue)" /> : <TrendingUp size={18} color="var(--blue)" />}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-1)' }}>{asset.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '2px', fontWeight: 500 }}>{mode === 'funds' ? asset.amc || '' : asset.ticker}</div>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: '16px' }}
                  onClick={() => mode === 'funds' ? navigate(`/fund/${i === 0 ? 'HDFC-FLEXI' : 'PPFAS-FLEXI'}`) : navigate(`/stock/${i === 0 ? 'RELIANCE' : 'TCS'}`)}>
                  Full Profile <ArrowRight size={13} />
                </button>
              </div>
            ))}
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
              Both funds fall in the same <strong>Flexi Cap</strong> category tracking the same benchmark. <strong>Parag Parikh Flexi Cap</strong> edges ahead on 3Y and 5Y returns, while <strong>HDFC Flexi Cap</strong> delivered higher 1Y alpha. PPFAS has a lower expense ratio (0.65% vs 0.85%), which compounds meaningfully over the long run.
            </p>
          ) : (
            <p>
              <strong>TCS</strong> shows a higher ROE (47.2% vs 9.8%) and significantly lower Debt/Equity (0.08 vs 0.42). <strong>Reliance</strong> is the larger entity by market cap. These are fundamentally different sector profiles and shouldn't be compared in isolation.
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
