import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Info, Sparkles, AlertTriangle, ArrowRight, Home, LineChart as LineChartIcon, Calculator } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import SearchBar from '../../components/ui/SearchBar';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';

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
  const { id: routeId } = useParams();
  const id = routeId || 'RELIANCE';
  const { formatPrice } = useCurrency();
  const { userPlan } = useAuth();
  const { formatMarketPrice, currencyMode, toggleCurrencyMode, fxRates } = useMarket();
  const [quote, setQuote] = useState(null);
  const [companyMeta, setCompanyMeta] = useState(null);
  
  const [range, setRange] = useState('1Y');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setHistoryLoading(true);

    const fetchId = id.includes('.') ? id : `${id}.NS`;

    // Fetch live quote
    fetch(`/api/quotes?symbols=${fetchId}`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data.quotes && data.quotes[0] && !data.quotes[0].error) {
          setQuote(data.quotes[0]);
        }
      })
      .catch(console.error);

    // Fetch company metadata (settlement cycle, ADR, trading hours)
    fetch(`/api/company/${fetchId}`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data.company) {
          setCompanyMeta(data.company);
        }
      })
      .catch(() => {});

    // Fetch history
    fetch(`/api/history?symbol=${fetchId}&range=${range}`)
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
    const numC = Number(c);
    if (c == null || cp == null || isNaN(numC)) return '-';
    const sign = numC >= 0 ? '+' : '';
    return `${sign}${numC.toFixed(2)} (${sign}${cp}%)`;
  };

  const isUS = quote?.currency === 'USD' || id.endsWith('.US') || companyMeta?.marketCode === 'US';
  const isUK = quote?.currency === 'GBP' || id.endsWith('.L') || companyMeta?.marketCode === 'UK';
  const exchangeCountry = isUS ? '🇺🇸' : isUK ? '🇬🇧' : '🇮🇳';
  const exchangeName = isUS ? 'NASDAQ / NYSE' : isUK ? 'LSE' : 'NSE';
  const currencySign = isUS ? '$' : isUK ? '£' : '₹';
  const sourceCurrency = isUS ? 'USD' : isUK ? 'GBP' : 'INR';

  const d = {
    ...DEFAULT_DATA,
    ticker: id,
    name: quote ? quote.name : id,
    price: quote ? formatMarketPrice(quote.currentPrice, sourceCurrency) : '...',
    change: quote ? formatChange(quote.change, quote.changePercent) : '...',
    up: quote ? quote.change >= 0 : true,
    metrics: JSON.parse(JSON.stringify(DEFAULT_DATA.metrics))
  };
  if (quote) {
    d.metrics[6].val = quote.fiftyTwoWeekHigh ? formatMarketPrice(quote.fiftyTwoWeekHigh, sourceCurrency) : '-';
    d.metrics[7].val = quote.fiftyTwoWeekLow ? formatMarketPrice(quote.fiftyTwoWeekLow, sourceCurrency) : '-';
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
          <div className="profile-breadcrumb" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <Link to="/"><Home size={13} style={{ display: 'inline' }} /></Link> / <Link to="/markets">Markets</Link> / <span>{id}</span>
            </div>
            <div className="w-full sm:w-[200px]">
              <SearchBar placeholder="Search stocks..." />
            </div>
          </div>
          
          <div className="profile-name-row">
            <div>
              <h2 style={{ marginBottom: '4px' }}>{d.name}</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="badge badge-grey">{exchangeCountry} {exchangeName} · {currencySign}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 500 }}>
                  Settlement: {companyMeta?.settlementCycle || (isUK ? 'T+2' : 'T+1')}
                </span>
                {companyMeta?.adrLink && (
                  <Link
                    to={`/stock/${encodeURIComponent(companyMeta.adrLink.symbol)}`}
                    className="badge badge-blue"
                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                  >
                    Cross-Listing ADR: {companyMeta.adrLink.name} ({companyMeta.adrLink.exchange}) →
                  </Link>
                )}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={toggleCurrencyMode}
                className="btn btn-outline btn-sm"
                title={`FX Rate USD/INR: ₹${fxRates.pairs['USD/INR'] || 86.2}`}
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                💱 {currencyMode === 'NATIVE' ? 'Convert to INR' : 'Show Native Currency'}
              </button>
              <div className="trust-mark">
                <div className="live-dot"></div> Live Data
              </div>
              <Link
                to={`/calculators?calc=lumpsum&type=stock&name=${encodeURIComponent(d.name)}&ticker=${encodeURIComponent(id.includes('.') ? id : `${id}.NS`)}`}
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Calculator size={14} /> Calculate Returns
              </Link>
            </div>
          </div>

          <div className="profile-price-row">
            <div className="profile-price num" style={{ transition: 'all 150ms ease' }}>{d.price}</div>
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
                <div style={{ position: 'relative', height: '100%' }}>
                  {userPlan === 'plan_free' && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      backdropFilter: 'blur(5px)', background: 'rgba(255,255,255,0.2)',
                      zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '12px'
                    }}>
                      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '300px', border: '1px solid var(--border)' }}>
                        <LineChartIcon size={32} color="var(--violet)" style={{ margin: '0 auto 12px auto' }} />
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 800 }}>Advanced Charting</h4>
                        <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-3)' }}>Unlock interactive price history charts with Stockbuzz Pro.</p>
                        <Link to="/settings" className="btn btn-violet shadow-md" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: '10px', fontWeight: 700, gap: '6px' }}>
                          <Sparkles size={16} /> Upgrade to Pro
                        </Link>
                      </div>
                    </div>
                  )}
                  <PriceChart points={history} />
                </div>
              )}
            </div>
          </div>

          {/* Peer Comparison */}
          <div className="chart-wrap">
            <div className="chart-header">
              <h4 style={{ margin: 0 }}>Peer Comparison</h4>
              <Link to="/compare" className="btn btn-ghost btn-sm">Full Compare <ArrowRight size={13} /></Link>
            </div>
            <div className="overflow-x-auto w-full">
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
