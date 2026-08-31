import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Info, Sparkles, AlertTriangle, ArrowRight, Home, LineChart as LineChartIcon, Calculator, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import SearchBar from '../../components/ui/SearchBar';
import TradingViewWidget from '../../components/ui/TradingViewWidget';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { useCms } from '../../context/CmsContext';

const DEFAULT_DATA = {
  price: '...', change: '...', up: true,
  name: 'Loading...', ticker: '...', sector: 'Company',
  metrics: [
    { label: 'Volume', val: '-', isPrimary: true },
    { label: 'Exchange', val: '-', hint: 'Primary Exchange', isPrimary: true },
    { label: 'Currency', val: '-', hint: 'Base Currency' },
    { label: 'Settlement', val: 'T+1' },
    { label: 'Trading Hours', val: 'Regular Session' },
    { label: 'Market Region', val: 'Domestic / Global' },
    { label: '52W High', val: '-' },
    { label: '52W Low', val: '-' },
  ]
};

const US_PEERS = [
  { name: 'Apple Inc.', ticker: 'AAPL', price: '$224.23', mcap: '$3.42T', pe: '34.2', roe: '147.2%', ret: '+28.4%' },
  { name: 'Microsoft Corp.', ticker: 'MSFT', price: '$448.50', mcap: '$3.33T', pe: '36.8', roe: '38.5%', ret: '+22.1%' },
  { name: 'NVIDIA Corp.', ticker: 'NVDA', price: '$128.80', mcap: '$3.15T', pe: '62.4', roe: '115.0%', ret: '+142.5%' },
  { name: 'Alphabet Inc.', ticker: 'GOOGL', price: '$180.20', mcap: '$2.24T', pe: '25.6', roe: '29.8%', ret: '+31.4%' }
];

const IN_PEERS = [
  { name: 'Reliance Industries', ticker: 'RELIANCE.NS', price: '₹1,314.60', mcap: '₹17.8T', pe: '24.5', roe: '9.8%', ret: '+14.5%' },
  { name: 'Tata Consultancy Services', ticker: 'TCS.NS', price: '₹3,890.10', mcap: '₹14.2T', pe: '30.2', roe: '47.2%', ret: '+18.2%' },
  { name: 'HDFC Bank', ticker: 'HDFCBANK.NS', price: '₹1,640.50', mcap: '₹12.5T', pe: '18.9', roe: '16.4%', ret: '+11.8%' },
  { name: 'Infosys Limited', ticker: 'INFY.NS', price: '₹1,612.55', mcap: '₹6.7T', pe: '24.1', roe: '31.8%', ret: '+12.4%' }
];

export default function StockProfile() {
  const { id: routeId } = useParams();
  const id = routeId || 'RELIANCE';
  const { formatPrice } = useCurrency();
  const { userPlan } = useAuth();
  const { cmsConfig } = useCms();
  const { formatMarketPrice, currencyMode, toggleCurrencyMode, fxRates } = useMarket();
  const [quote, setQuote] = useState(null);
  const [companyMeta, setCompanyMeta] = useState(null);
  
  const [range, setRange] = useState('1Y');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setHistoryLoading(true);
    setQuote(null);
    setCompanyMeta(null);

    const loadStock = async () => {
      let resolvedTicker = id;
      let fetchedMeta = null;

      try {
        const res = await fetch(`/api/company/${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.company && !cancelled) {
            fetchedMeta = data.company;
            setCompanyMeta(fetchedMeta);
            resolvedTicker = fetchedMeta.ticker || id;
          }
        }
      } catch (err) {
        console.error('Company meta fetch failed:', err);
      }

      // If no dot and not identified as US/UK, default to .NS for Indian stocks
      if (!resolvedTicker.includes('.') && (!fetchedMeta || fetchedMeta.marketCode === 'IN')) {
        resolvedTicker = `${resolvedTicker}.NS`;
      }

      // Fetch live quote
      fetch(`/api/quotes?symbols=${encodeURIComponent(resolvedTicker)}`)
        .then(r => r.json())
        .then(data => {
          if (!cancelled && data.quotes && data.quotes[0] && !data.quotes[0].error) {
            setQuote(data.quotes[0]);
          }
        })
        .catch(console.error);

      // Fetch history
      fetch(`/api/history?symbol=${encodeURIComponent(resolvedTicker)}&range=${range}`)
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
    };

    loadStock();
    return () => { cancelled = true; };
  }, [id, range]);

  const formatChange = (c, cp) => {
    const numC = Number(c);
    if (c == null || cp == null || isNaN(numC)) return '-';
    const sign = numC >= 0 ? '+' : '';
    return `${sign}${numC.toFixed(2)} (${sign}${cp}%)`;
  };

  const isUS = quote?.currency === 'USD' || id.endsWith('.US') || companyMeta?.marketCode === 'US' || companyMeta?.exchange === 'NASDAQ' || companyMeta?.exchange === 'NYSE';
  const isUK = quote?.currency === 'GBP' || id.endsWith('.L') || companyMeta?.marketCode === 'UK' || companyMeta?.exchange === 'LSE';
  const exchangeCountry = isUS ? '🇺🇸' : isUK ? '🇬🇧' : '🇮🇳';
  const exchangeName = companyMeta?.exchange || (isUS ? 'NASDAQ / NYSE' : isUK ? 'LSE' : 'NSE');
  const currencySign = isUS ? '$' : isUK ? '£' : '₹';
  const sourceCurrency = isUS ? 'USD' : isUK ? 'GBP' : 'INR';

  const d = {
    ...DEFAULT_DATA,
    ticker: companyMeta?.symbol || id,
    name: companyMeta?.name || quote?.name || id,
    price: quote?.currentPrice ? formatMarketPrice(quote.currentPrice, sourceCurrency) : '—',
    change: quote ? formatChange(quote.change, quote.changePercent) : '—',
    up: quote ? quote.change >= 0 : true,
    metrics: [
      { label: 'Volume', val: quote?.volume ? quote.volume.toLocaleString('en-IN') : '—', isPrimary: true },
      { label: 'Exchange', val: `${exchangeCountry} ${exchangeName}`, hint: 'Primary Exchange', isPrimary: true },
      { label: 'Currency', val: `${currencySign} ${sourceCurrency}`, hint: 'Base Currency' },
      { label: 'Settlement', val: companyMeta?.settlementCycle || (isUS || isUK ? 'T+1' : 'T+1') },
      { label: 'Trading Hours', val: companyMeta?.tradingHours || 'Regular Session' },
      { label: 'Market Region', val: isUS ? 'United States' : isUK ? 'United Kingdom' : 'India' },
      { label: '52W High', val: quote?.fiftyTwoWeekHigh ? formatMarketPrice(quote.fiftyTwoWeekHigh, sourceCurrency) : '—' },
      { label: '52W Low', val: quote?.fiftyTwoWeekLow ? formatMarketPrice(quote.fiftyTwoWeekLow, sourceCurrency) : '—' },
    ]
  };

  let tvSymbol = id;
  if (id.includes('BTC-USD') || id.includes('ETH-USD')) tvSymbol = `BINANCE:${id.replace('-USD', 'USDT')}`;
  else if (isUS) tvSymbol = `NASDAQ:${id.replace('.US', '')}`;
  else if (isUK) tvSymbol = `LSE:${id.replace('.L', '')}`;
  else tvSymbol = `BSE:${id.replace('.NS', '')}`;

  const peers = isUS ? US_PEERS : IN_PEERS;

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
                  {companyMeta?.sector || 'Public Company'}
                </span>
                {companyMeta?.settlementCycle && (
                  <span className="badge badge-outline" style={{ fontSize: '0.75rem' }}>
                    ⚡ {companyMeta.settlementCycle} Settlement
                  </span>
                )}
                {companyMeta?.adrLink && (
                  <Link
                    to={`/stock/${companyMeta.adrLink.crossTicker}`}
                    className="badge badge-blue hover:underline cursor-pointer"
                    style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Globe size={11} /> Cross-listed: {companyMeta.adrLink.label} ({companyMeta.adrLink.ratio})
                  </Link>
                )}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div className="trust-mark">
                <div className="live-dot"></div> Live Exchange Feed
              </div>
              
              {/* Currency Toggle for foreign stocks */}
              {(isUS || isUK) && (
                <button
                  onClick={toggleCurrencyMode}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', borderRadius: '20px' }}
                >
                  💱 {currencyMode === 'NATIVE' ? `Show in INR (₹)` : `Show Native (${currencySign})`}
                </button>
              )}

              <Link
                to={`/calculators?calc=lumpsum&type=stock&name=${encodeURIComponent(d.name)}&ticker=${encodeURIComponent(d.ticker)}`}
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Calculator size={14} /> Calculate Returns
              </Link>
            </div>
          </div>

          <div className="profile-price-row">
            <div className="profile-price num">{d.price}</div>
            <div className={`profile-change ${d.up ? 'text-green' : 'text-red'}`}>
              <span className={`badge ${d.up ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                {d.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {d.change}
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
                <div className="stat-value num" style={{ fontSize: m.isPrimary ? '1.25rem' : '1.1rem', marginTop: '2px' }}>
                  {m.val}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container profile-body">
        
        {/* Left Column: Charts and Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Chart */}
          {cmsConfig?.global?.enableTradingView !== false && (
            <div className="chart-wrap" style={{ padding: '0', overflow: 'hidden', minHeight: '500px', position: 'relative' }}>
              {userPlan === 'plan_free' ? (
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  background: 'var(--bg-subtle)',
                  zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '12px'
                }}>
                  <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '350px', border: '1px solid var(--border)' }}>
                    <LineChartIcon size={40} color="var(--violet)" style={{ margin: '0 auto 16px auto' }} />
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 800 }}>Advanced Technical Charts</h4>
                    <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: 'var(--text-3)' }}>Unlock interactive TradingView charts, indicators, and advanced technical analysis with Stockbuzz Pro.</p>
                    <Link to="/settings" className="btn btn-violet shadow-md" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: '12px', fontWeight: 700, gap: '8px', fontSize: '1rem' }}>
                      <Sparkles size={18} /> Upgrade to Pro
                    </Link>
                  </div>
                </div>
              ) : (
                <TradingViewWidget symbol={tvSymbol} height={500} theme="light" />
              )}
            </div>
          )}

          {/* Peer Comparison */}
          <div className="chart-wrap">
            <div className="chart-header">
              <h4 style={{ margin: 0 }}>Peer Comparison ({isUS ? 'US Tech Leaders' : 'Domestic Leaders'})</h4>
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
                {peers.filter(p => p.ticker !== companyMeta?.ticker).slice(0, 3).map((peer, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'left' }}>
                      <Link to={`/stock/${peer.ticker}`} className="hover:underline text-blue-600 dark:text-blue-400">
                        {peer.name}
                      </Link>
                    </td>
                    <td className="num">{peer.price}</td>
                    <td className="num">{peer.mcap}</td>
                    <td className="num">{peer.pe}</td>
                    <td className="num">{peer.roe}</td>
                    <td className="num text-green fw-6">{peer.ret}</td>
                  </tr>
                ))}
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
              <strong className="text-1">{d.name}</strong> ({d.ticker}) is trading at {d.price} on {exchangeCountry} {exchangeName}.
            </p>
            <p style={{ marginTop: '12px' }}>
              The 52-week range spans from {d.metrics[7].val} to {d.metrics[6].val}. {quote && quote.volume ? `Latest reported volume is ${quote.volume.toLocaleString('en-IN')}.` : ''}
            </p>
            <div className="ai-disclaimer">
              <AlertTriangle size={14} color="var(--text-3)" />
              <span>Automated analysis based on real-time market feeds. Not financial advice.</span>
            </div>
          </div>

          <div className="card card-pad">
            <h4 style={{ marginBottom: '16px' }}>About {d.name}</h4>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
              {d.name} is listed under ticker symbol <strong>{d.ticker}</strong> on the {exchangeCountry} {exchangeName} stock exchange. 
              {isUS || isUK ? ' International shares are settled under the standard T+1 market clearing cycle.' : ' Domestic Indian equities are cleared via Indian depository participant rules.'}
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
