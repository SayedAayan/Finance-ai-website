export const STRATEGIES = [
  {
    id: 'value',
    number: '01',
    gradient: 'from-blue-600 to-indigo-600',
    title: 'Value Investing',
    subtitle: 'The Warren Buffett & Benjamin Graham Method',
    description: 'Focuses on buying undervalued stocks that trade for less than their intrinsic value. Value investors look for companies with strong fundamentals, low P/E ratios, and a wide "margin of safety" to protect against downside risk.',
    keyMetrics: ['P/E Ratio < 25', 'Price-to-Book < 5', 'Consistent Free Cash Flow', 'High Dividend Yield'],
    color: 'blue'
  },
  {
    id: 'canslim',
    number: '02',
    gradient: 'from-emerald-500 to-teal-500',
    title: 'CAN SLIM Strategy',
    subtitle: "William J. O'Neil's Growth System",
    description: 'A bullish strategy combining fundamental and technical analysis to identify high-growth stocks before they make major price advances. It emphasizes earnings momentum and strong market trends.',
    keyMetrics: ['Current Quarterly Earnings > 25%', 'Annual Earnings Growth > 25%', 'New Products/Management', 'Strong Market Direction'],
    color: 'emerald'
  },
  {
    id: 'magic',
    number: '03',
    gradient: 'from-purple-600 to-fuchsia-600',
    title: 'The Magic Formula',
    subtitle: "Joel Greenblatt's Systematic Approach",
    description: 'A disciplined, rules-based approach that ranks companies based on two simple metrics: Earnings Yield (how cheap the stock is) and Return on Capital (how good the business is). It aims to buy good companies at bargain prices.',
    keyMetrics: ['High Earnings Yield (EBIT / EV)', 'High Return on Capital', 'Exclude Utilities & Financials'],
    color: 'purple'
  },
  {
    id: 'drip',
    number: '04',
    gradient: 'from-amber-500 to-orange-500',
    title: 'Dividend Growth',
    subtitle: 'The Compound Interest Machine',
    description: 'Focuses on "Dividend Aristocrats"—companies that consistently increase their dividend payouts year after year. Dividends are automatically reinvested to accelerate compound growth exponentially over time.',
    keyMetrics: ['Dividend Yield > 0.5%', 'Payout Ratio < 60%', '10+ Years of Dividend Increases', 'Strong Balance Sheet'],
    color: 'amber'
  },
  {
    id: 'momentum',
    number: '05',
    gradient: 'from-rose-500 to-red-600',
    title: 'Momentum Investing',
    subtitle: 'Riding the Trend',
    description: 'Based on the premise that stocks that have performed well recently will continue to perform well in the short-to-medium term. It relies heavily on technical indicators, price action, and market sentiment rather than fundamentals.',
    keyMetrics: ['52-Week High Proximity', 'Relative Strength Index (RSI)', 'Moving Average Crossovers', 'High Trading Volume'],
    color: 'rose'
  }
];

export function getStrategy(id) {
  return STRATEGIES.find(s => s.id === id);
}

// Returns 0-100 fit score for a stock under a given strategy, purely from its fundamentals.
function scoreStock(strategyId, stock) {
  switch (strategyId) {
    case 'value': {
      const peScore = clamp(100 - (stock.peRatio / 25) * 100, 0, 100);
      const pbScore = clamp(100 - (stock.pbRatio / 5) * 100, 0, 100);
      const divScore = clamp((stock.dividendYield / 2) * 100, 0, 100);
      return weighted([peScore, 0.45], [pbScore, 0.35], [divScore, 0.2]);
    }
    case 'canslim': {
      const momentum = clamp((stock.changePercent / 3) * 100, 0, 100);
      const priceStrength = clamp((stock.price / 3000) * 100, 0, 100);
      return weighted([momentum, 0.7], [priceStrength, 0.3]);
    }
    case 'magic': {
      const earningsYield = stock.eps / stock.price;
      const eyScore = clamp((earningsYield / 0.05) * 100, 0, 100);
      const roc = clamp((1 - stock.debtToEquity) * 100, 0, 100);
      return weighted([eyScore, 0.5], [roc, 0.5]);
    }
    case 'drip': {
      const divScore = clamp((stock.dividendYield / 2.5) * 100, 0, 100);
      const stabilityScore = clamp((1 - stock.debtToEquity) * 100, 0, 100);
      return weighted([divScore, 0.65], [stabilityScore, 0.35]);
    }
    case 'momentum': {
      const changeScore = clamp((stock.changePercent / 2) * 100, 0, 100);
      const priceScore = clamp((stock.price / 3000) * 100, 0, 100);
      return weighted([changeScore, 0.75], [priceScore, 0.25]);
    }
    default:
      return 0;
  }
}

function passesFilter(strategyId, stock) {
  switch (strategyId) {
    case 'value':
      return stock.peRatio < 25 && stock.pbRatio < 5;
    case 'canslim':
      return stock.changePercent > 1.0;
    case 'magic':
      return (stock.eps / stock.price) > 0.02 && stock.debtToEquity < 0.5;
    case 'drip':
      return stock.dividendYield > 0.5;
    case 'momentum':
      return stock.changePercent > 0 || stock.price > 2000;
    default:
      return false;
  }
}

export function getMatchedStocks(strategyId, stocks) {
  return stocks
    .filter(s => passesFilter(strategyId, s))
    .map(s => ({ ...s, matchScore: Math.round(scoreStock(strategyId, s)) }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

function clamp(n, min, max) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function weighted(...pairs) {
  return pairs.reduce((sum, [value, weight]) => sum + value * weight, 0);
}
