// Timezone and schedule helper for International Markets
// Supported markets: 'IN' (NSE/BSE), 'US' (NYSE/NASDAQ), 'UK' (LSE)

export const MARKET_CONFIGS = {
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    currencySymbol: '₹',
    exchanges: ['NSE', 'BSE'],
    timezone: 'Asia/Kolkata',
    settlementCycle: 'T+1',
    benchmarks: [
      { symbol: '^NSEI', name: 'NIFTY 50', displaySymbol: 'NIFTY 50' },
      { symbol: '^BSESN', name: 'SENSEX', displaySymbol: 'SENSEX' },
      { symbol: '^NSEBANK', name: 'NIFTY BANK', displaySymbol: 'BANK NIFTY' }
    ],
    hours: {
      preOpen: { start: '09:00', end: '09:15' },
      regular: { start: '09:15', end: '15:30' },
      postClose: { start: '15:40', end: '16:00' }
    },
    holidays2026: [
      '2026-01-26', // Republic Day
      '2026-03-06', // Mahashivratri
      '2026-03-25', // Holi
      '2026-04-02', // Good Friday
      '2026-04-14', // Dr. Ambedkar Jayanti
      '2026-05-01', // Maharashtra Day
      '2026-08-15', // Independence Day
      '2026-10-02', // Gandhi Jayanti
      '2026-11-08', // Diwali Laxmi Pujan
      '2026-12-25'  // Christmas
    ]
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    exchanges: ['NASDAQ', 'NYSE', 'AMEX'],
    timezone: 'America/New_York',
    settlementCycle: 'T+1',
    benchmarks: [
      { symbol: '^GSPC', name: 'S&P 500', displaySymbol: 'S&P 500' },
      { symbol: '^IXIC', name: 'NASDAQ Composite', displaySymbol: 'NASDAQ' },
      { symbol: '^DJI', name: 'Dow Jones', displaySymbol: 'DOW 30' }
    ],
    hours: {
      preOpen: { start: '04:00', end: '09:30' },
      regular: { start: '09:30', end: '16:00' },
      postClose: { start: '16:00', end: '20:00' }
    },
    holidays2026: [
      '2026-01-01', // New Year's Day
      '2026-01-19', // MLK Jr. Day
      '2026-02-16', // Washington's Birthday
      '2026-04-03', // Good Friday
      '2026-05-25', // Memorial Day
      '2026-06-19', // Juneteenth
      '2026-07-03', // Independence Day Observed
      '2026-09-07', // Labor Day
      '2026-11-26', // Thanksgiving
      '2026-12-25'  // Christmas
    ]
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    exchanges: ['LSE'],
    timezone: 'Europe/London',
    settlementCycle: 'T+2',
    benchmarks: [
      { symbol: '^FTSE', name: 'FTSE 100', displaySymbol: 'FTSE 100' },
      { symbol: '^FTMC', name: 'FTSE 250', displaySymbol: 'FTSE 250' }
    ],
    hours: {
      preOpen: { start: '07:50', end: '08:00' },
      regular: { start: '08:00', end: '16:30' },
      postClose: { start: '16:30', end: '17:15' }
    },
    holidays2026: [
      '2026-01-01', // New Year's Day
      '2026-04-03', // Good Friday
      '2026-04-06', // Easter Monday
      '2026-05-04', // Early May Bank Holiday
      '2026-05-25', // Spring Bank Holiday
      '2026-08-31', // Summer Bank Holiday
      '2026-12-25', // Christmas
      '2026-12-28'  // Boxing Day Observed
    ]
  }
};

/**
 * Calculates real-time market status (OPEN, CLOSED, PRE_MARKET, AFTER_HOURS)
 * based on current UTC time, market timezone, weekend, and holiday schedule.
 */
export function getMarketStatus(marketCode = 'IN', date = new Date()) {
  const config = MARKET_CONFIGS[marketCode.toUpperCase()] || MARKET_CONFIGS.IN;
  
  const tzOptions = { timeZone: config.timezone, hour12: false };
  const formatter = new Intl.DateTimeFormat('en-US', {
    ...tzOptions,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short'
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type) => parts.find(p => p.type === type)?.value;

  const weekday = getPart('weekday');
  const yyyy = getPart('year');
  const mm = getPart('month');
  const dd = getPart('day');
  const hh = parseInt(getPart('hour'), 10);
  const min = parseInt(getPart('minute'), 10);

  const dateStr = `${yyyy}-${mm}-${dd}`;
  const currentTimeMinutes = hh * 60 + min;

  // Check weekends
  if (weekday === 'Sat' || weekday === 'Sun') {
    return {
      status: 'CLOSED',
      label: 'Market Closed (Weekend)',
      color: 'rose',
      marketCode: config.code,
      localTime: `${hh.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
      nextOpenNotice: 'Opens Monday'
    };
  }

  // Check official holidays
  if (config.holidays2026.includes(dateStr)) {
    return {
      status: 'CLOSED',
      label: 'Market Closed (Holiday)',
      color: 'rose',
      marketCode: config.code,
      localTime: `${hh.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
      nextOpenNotice: 'Trading Holiday'
    };
  }

  const parseTimeStr = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const preStart = parseTimeStr(config.hours.preOpen.start);
  const preEnd = parseTimeStr(config.hours.preOpen.end);
  const regStart = parseTimeStr(config.hours.regular.start);
  const regEnd = parseTimeStr(config.hours.regular.end);
  const postEnd = parseTimeStr(config.hours.postClose.end);

  if (currentTimeMinutes >= regStart && currentTimeMinutes < regEnd) {
    return {
      status: 'OPEN',
      label: 'Market Open',
      color: 'emerald',
      marketCode: config.code,
      localTime: `${hh.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
      closesAt: config.hours.regular.end
    };
  }

  if (currentTimeMinutes >= preStart && currentTimeMinutes < regStart) {
    return {
      status: 'PRE_MARKET',
      label: 'Pre-Market',
      color: 'amber',
      marketCode: config.code,
      localTime: `${hh.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
      opensAt: config.hours.regular.start
    };
  }

  if (currentTimeMinutes >= regEnd && currentTimeMinutes < postEnd) {
    return {
      status: 'AFTER_HOURS',
      label: 'After Hours',
      color: 'orange',
      marketCode: config.code,
      localTime: `${hh.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
    };
  }

  return {
    status: 'CLOSED',
    label: 'Market Closed',
    color: 'slate',
    marketCode: config.code,
    localTime: `${hh.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
    opensAt: config.hours.regular.start
  };
}
