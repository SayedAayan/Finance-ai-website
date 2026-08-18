export const STRATEGIES = [
  {
    id: 'buffett',
    number: '01',
    gradient: 'from-blue-600 to-indigo-600',
    title: 'Value & Economic Moat',
    subtitle: 'The Warren Buffett Method',
    description: 'Focuses on buying wonderful companies at fair prices. Looks for businesses with a durable competitive advantage (moat), consistent high ROE, low debt, and predictable cash flows.',
    keyMetrics: ['Consistent ROE > 15%', 'Low Debt-to-Equity', 'Predictable Earnings', 'High Profit Margins'],
    color: 'blue'
  },
  {
    id: 'lynch',
    number: '02',
    gradient: 'from-emerald-500 to-teal-500',
    title: 'Growth at a Reasonable Price',
    subtitle: 'The Peter Lynch Method',
    description: 'Invests in "what you know." Focuses on fast-growing companies trading at valuations that don\'t fully reflect their growth potential. Heavily relies on the PEG ratio.',
    keyMetrics: ['PEG Ratio < 1.0', 'Low Institutional Ownership', 'Strong Balance Sheet', 'Consistent EPS Growth'],
    color: 'emerald'
  },
  {
    id: 'graham',
    number: '03',
    gradient: 'from-amber-600 to-orange-600',
    title: 'Deep Value & Margin of Safety',
    subtitle: 'The Benjamin Graham Method',
    description: 'The father of value investing. Focuses on buying stocks deeply below their intrinsic value, often looking for companies trading below their net working capital (Net-Net).',
    keyMetrics: ['P/E Ratio < 15', 'P/B Ratio < 1.5', 'Current Ratio > 2.0', 'Uninterrupted Dividends'],
    color: 'amber'
  },
  {
    id: 'dalio',
    number: '04',
    gradient: 'from-slate-600 to-gray-700',
    title: 'All Weather Risk Parity',
    subtitle: 'The Ray Dalio Method',
    description: 'A macroeconomic approach that builds portfolios designed to perform well across all economic environments (inflation, deflation, bull, and bear markets) through risk balancing.',
    keyMetrics: ['Low Market Correlation', 'Diversified Cash Flows', 'Stable Dividend Yield', 'Low Beta'],
    color: 'slate'
  },
  {
    id: 'greenblatt',
    number: '05',
    gradient: 'from-purple-600 to-fuchsia-600',
    title: 'The Magic Formula',
    subtitle: 'The Joel Greenblatt Method',
    description: 'A disciplined, rules-based approach that ranks companies based on two simple metrics: Earnings Yield (how cheap the stock is) and Return on Capital (how good the business is).',
    keyMetrics: ['High Earnings Yield (EBIT / EV)', 'High Return on Capital', 'Exclude Utilities & Financials', 'Top 30 Ranked'],
    color: 'purple'
  },
  {
    id: 'munger',
    number: '06',
    gradient: 'from-red-600 to-rose-700',
    title: 'Quality at a Fair Price',
    subtitle: 'The Charlie Munger Method',
    description: 'Advocates paying a fair price for a great business rather than a great price for a fair business. Emphasizes psychological models, extreme quality, and outstanding management.',
    keyMetrics: ['High Return on Invested Capital', 'Low Capital Intensity', 'Dominant Market Position', 'Ethical Management'],
    color: 'red'
  },
  {
    id: 'fisher',
    number: '07',
    gradient: 'from-cyan-500 to-blue-500',
    title: 'Growth & Scuttlebutt',
    subtitle: 'The Philip Fisher Method',
    description: 'A qualitative approach focusing on growth. Evaluates management quality, R&D capabilities, and profit margins, often using the "scuttlebutt" method of talking to competitors and suppliers.',
    keyMetrics: ['High R&D Margins', 'Above Average Profit Margins', 'Long-term Sales Growth', 'Outstanding Management'],
    color: 'cyan'
  },
  {
    id: 'bogle',
    number: '08',
    gradient: 'from-green-600 to-emerald-700',
    title: 'Broad Market Indexing',
    subtitle: 'The John Bogle Method',
    description: 'The pioneer of index investing. Advocates for buying and holding the entire stock market with minimal fees, capturing the natural long-term growth of the economy without active risk.',
    keyMetrics: ['Low Expense Ratio', 'Market Cap Weighted', 'High Liquidity', 'Zero Active Management'],
    color: 'green'
  },
  {
    id: 'soros',
    number: '09',
    gradient: 'from-yellow-500 to-amber-600',
    title: 'Macro Reflexivity',
    subtitle: 'The George Soros Method',
    description: 'Capitalizes on the theory of reflexivity—that investor biases affect market fundamentals, creating boom and bust cycles. Highly opportunistic and focuses on global macroeconomic trends.',
    keyMetrics: ['Global Macro Trends', 'High Liquidity', 'Catalyst-Driven', 'High Volatility Tolerance'],
    color: 'yellow'
  },
  {
    id: 'ackman',
    number: '10',
    gradient: 'from-pink-600 to-rose-600',
    title: 'Activist Value',
    subtitle: 'The Bill Ackman Method',
    description: 'Takes large concentrated positions in undervalued, highly predictable businesses and actively pushes management to make changes that unlock shareholder value.',
    keyMetrics: ['Predictable Cash Flow', 'High Barriers to Entry', 'Large Cap / High Liquidity', 'Identifiable Catalyst'],
    color: 'pink'
  }
];

export function getStrategy(id) {
  return STRATEGIES.find(s => s.id === id);
}

// Returns 0-100 fit score for a stock under a given strategy, purely from its fundamentals.
function scoreStock(strategyId, stock) {
  const changeScore = clamp((stock.changePercent / 3) * 100, 0, 100);
  const priceScore = clamp((stock.price / 3000) * 100, 0, 100);
  const peScore = clamp(100 - (stock.peRatio / 25) * 100, 0, 100);
  const pbScore = clamp(100 - (stock.pbRatio / 5) * 100, 0, 100);
  const divScore = clamp((stock.dividendYield / 2) * 100, 0, 100);
  const stability = clamp((1 - stock.debtToEquity) * 100, 0, 100);

  switch (strategyId) {
    case 'buffett':
    case 'munger':
      return weighted([peScore, 0.4], [stability, 0.4], [divScore, 0.2]);
    case 'lynch':
    case 'fisher':
      return weighted([changeScore, 0.5], [peScore, 0.3], [priceScore, 0.2]);
    case 'graham':
    case 'greenblatt':
      return weighted([peScore, 0.5], [pbScore, 0.5]);
    case 'dalio':
    case 'bogle':
      return weighted([stability, 0.6], [divScore, 0.4]);
    case 'soros':
    case 'ackman':
      return weighted([changeScore, 0.7], [priceScore, 0.3]);
    default:
      return 50;
  }
}

function passesFilter(strategyId, stock) {
  switch (strategyId) {
    case 'buffett':
    case 'munger':
      return stock.peRatio <= 32 && stock.debtToEquity <= 0.6;
    case 'lynch':
    case 'fisher':
      return stock.peRatio > 0 && (stock.changePercent > 0 || stock.dividendYield > 0.5);
    case 'graham':
    case 'greenblatt':
      return stock.peRatio < 28 || stock.pbRatio < 3.5;
    case 'dalio':
    case 'bogle':
      return stock.dividendYield >= 0.3 && stock.debtToEquity < 0.9;
    case 'soros':
    case 'ackman':
      return Math.abs(stock.changePercent) > 0.5 || stock.price > 800;
    default:
      return true;
  }
}

export function getMatchedStocks(strategyId, stocks) {
  const scored = (stocks || []).map(s => ({
    ...s,
    matchScore: Math.round(scoreStock(strategyId, s))
  }));
  const filtered = scored.filter(s => passesFilter(strategyId, s));
  const results = filtered.length > 0 ? filtered : scored;
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

function clamp(n, min, max) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function weighted(...pairs) {
  return pairs.reduce((sum, [value, weight]) => sum + value * weight, 0);
}
