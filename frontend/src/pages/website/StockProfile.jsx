import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Info, Sparkles, AlertTriangle, ArrowRight, Home } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '../../context/CurrencyContext';
const DEFAULT_DATA = {
  price: '...', change: '...', up: true,
  name: 'Loading...', ticker: '...', sector: 'Company',
  metrics: [
    { label: 'Market Cap', val: '-', isPrimary: true },
    { label: 'P/E Ratio', val: '-', hint: 'Price to Earnings', isPrimary: true },
    { label: 'P/B Ratio', val: '-', hint: 'Price to Book' },
    { label: 'Div Yield', val: '-' },
    { label: 'ROE', val: '-', hint: 'Return on Equity' },
    { label: 'Debt/Eq', val: '-' },
    { label: '52W High', val: '-' },
    { label: '52W Low', val: '-' },
  ]
};

export default function StockProfile() {
  const { id } = useParams();
  const { formatPrice } = useCurrency();
  const [quote, setQuote] = useState(null);
  
  const [range, setRange] = useState('1Y');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setHistoryLoading(true);

    // Fetch live quote
    fetch(`/api/quotes?symbols=${id}`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data.quotes && data.quotes[0] && !data.quotes[0].error) {
          setQuote(data.quotes[0]);
        }
      })
      .catch(console.error);

    // Fetch history
    fetch(`/api/history?symbol=${id}&range=${range}`)
      .then(r => r.json())
      .then((data) => {
        if (cancelled) return;
        setHistory((Array.isArray(data.points) ? data.points : []).map(p => ({
          time: new Date(p.time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          price: p.price
        })));
      })
      .catch(() => { if (!cancelled) setHistory([]); })
      .finally(() => { if (!cancelled) setHistoryLoading(false); });
    return () => { cancelled = true; };
  }, [id, range]);

  const formatChange = (c, cp) => {
    if (c == null || cp == null) return '-';
    const sign = c >= 0 ? '+' : '';
    return `${sign}${c.toFixed(2)} (${sign}${cp}%)`;
  };

  const d = {
    ...DEFAULT_DATA,
    ticker: id,
    name: quote ? quote.name : id,
    price: quote ? formatPrice(quote.currentPrice, {}, quote.currency === 'USD' ? 'USD' : 'INR') : '...',
    change: quote ? formatChange(quote.change, quote.changePercent) : '...',
    up: quote ? quote.change >= 0 : true,
  };
  if (quote) {
    d.metrics[6].val = formatPrice(quote.fiftyTwoWeekHigh, {}, quote.currency === 'USD' ? 'USD' : 'INR');
    d.metrics[7].val = formatPrice(quote.fiftyTwoWeekLow, {}, quote.currency === 'USD' ? 'USD' : 'INR');
    if (quote.volume) {
      d.metrics[0].label = 'Volume';
      d.metrics[0].val = quote.volume.toLocaleString('en-IN');
    }
  }

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
                {[
                  { key: '1D', label: '1D' },
                  { key: '1W', label: '1W' },
                  { key: '1M', label: '1M' },
                  { key: '1Y', label: '1Y' },
                  { key: '5Y', label: '5Y' },
                  { key: 'MAX', label: 'Since Inception' },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setRange(t.key)}
                    className={`btn btn-sm ${t.key === range ? 'btn-outline' : 'btn-ghost'}`}
                    style={{ padding: '4px 10px' }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-body" style={{ height: '300px', padding: '0', position: 'relative' }}>
              {historyLoading ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '0.85rem' }}>
                  Loading chart…
                </div>
              ) : history.length < 2 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '0.85rem' }}>
                  No price history available for this range.
                </div>
              ) : (
                <PriceChart points={history} />
              )}
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
              <strong className="text-1">{d.name}</strong> is currently trading at {d.price}. The price has moved by {d.change} recently.
            </p>
            <p style={{ marginTop: '12px' }}>
              The 52-week high is {d.metrics[6].val} and 52-week low is {d.metrics[7].val}. {quote && quote.volume ? `The recent volume is ${quote.volume.toLocaleString('en-IN')}.` : ''}
            </p>
            <div className="ai-disclaimer">
              <AlertTriangle size={14} color="var(--text-3)" />
              <span>This is automated analysis based on latest filings. Not investment advice.</span>
            </div>
          </div>

          <div className="card card-pad">
            <h4 style={{ marginBottom: '16px' }}>About the Company</h4>
            <p style={{ fontSize: '0.85rem' }}>
              {d.name} is a publicly traded company listed on the stock exchange. It is currently trading under the ticker symbol {d.ticker}. Please consult detailed financial reports for comprehensive information about the company's operations, subsidiaries, and market performance.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

function PriceChart({ points }) {
  if (!points || points.length === 0) return null;

  const isUp = points[points.length - 1].price >= points[0].price;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="stockGraphFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isUp ? '#16a34a' : '#dc2626'} stopOpacity={0.3} />
              <stop offset="95%" stopColor={isUp ? '#16a34a' : '#dc2626'} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={40} axisLine={false} tickLine={false} />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
          <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e5e7eb' }} />
          <Area type="monotone" dataKey="price" stroke={isUp ? '#16a34a' : '#dc2626'} strokeWidth={2} fill="url(#stockGraphFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
