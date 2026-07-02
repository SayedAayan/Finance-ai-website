export const mockStocks = [
  {
    id: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    ticker: 'RELIANCE',
    price: 2950.45,
    change: 12.30,
    changePercent: 0.42,
    marketCap: '19.8T',
    peRatio: 28.5,
    pbRatio: 2.7,
    eps: 103.52,
    dividendYield: 0.35,
    promoterHolding: 50.3,
    debtToEquity: 0.42,
    about: 'Reliance Industries Limited is an Indian multinational conglomerate headquartered in Mumbai. It has diverse businesses including energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles.',
    news: [
      { id: 1, type: 'corporate_results', title: 'Q1 Results: Net Profit up 10%', date: '2026-06-15' },
      { id: 2, type: 'regulatory_action', title: 'New spectrum acquisition approved', date: '2026-06-10' }
    ],
    lastUpdated: '2026-07-02T10:30:00Z'
  },
  {
    id: 'TCS',
    name: 'Tata Consultancy Services',
    ticker: 'TCS',
    price: 3890.10,
    change: -15.40,
    changePercent: -0.39,
    marketCap: '14.2T',
    peRatio: 30.2,
    pbRatio: 12.1,
    eps: 128.80,
    dividendYield: 1.85,
    promoterHolding: 72.3,
    debtToEquity: 0.08,
    about: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company headquartered in Mumbai.',
    news: [
      { id: 3, type: 'corporate_results', title: 'Secures $2B deal in Europe', date: '2026-06-20' }
    ],
    lastUpdated: '2026-07-02T10:30:00Z'
  }
];

export const mockFunds = [
  {
    id: 'HDFC-FLEXI',
    name: 'HDFC Flexi Cap Fund',
    type: 'Equity',
    category: 'Flexi Cap Fund',
    aum: '45,230 Cr',
    nav: 1642.50,
    navChange: 4.2,
    navChangePercent: 0.25,
    expenseRatio: 0.85, /* Direct */
    expenseRatioRegular: 1.65,
    exitLoad: '1% within 1 year',
    riskometer: 'Very High',
    benchmark: 'NIFTY 500 TRI',
    returns: {
      '1Y': 32.5,
      '3Y': 21.2,
      '5Y': 18.5
    },
    benchmarkReturns: {
      '1Y': 29.8,
      '3Y': 19.5,
      '5Y': 17.2
    },
    amc: 'HDFC Mutual Fund',
    manager: 'Roshi Jain',
    managerTenure: '2.5 Years',
    inceptionDate: '1995-01-01',
    objective: 'To generate capital appreciation / income from a portfolio, predominantly invested in equity and equity related instruments.',
    holdings: [
      { name: 'ICICI Bank', weight: 8.5 },
      { name: 'HDFC Bank', weight: 7.2 },
      { name: 'Reliance Ind.', weight: 6.8 },
      { name: 'Infosys', weight: 5.4 }
    ],
    lastUpdated: '2026-07-01T23:59:00Z'
  },
  {
    id: 'PPFAS-FLEXI',
    name: 'Parag Parikh Flexi Cap Fund',
    type: 'Equity',
    category: 'Flexi Cap Fund',
    aum: '62,100 Cr',
    nav: 74.85,
    navChange: 0.15,
    navChangePercent: 0.20,
    expenseRatio: 0.65,
    expenseRatioRegular: 1.45,
    exitLoad: '2% within 1 yr, 1% within 2 yrs',
    riskometer: 'Very High',
    benchmark: 'NIFTY 500 TRI',
    returns: {
      '1Y': 30.1,
      '3Y': 22.8,
      '5Y': 20.4
    },
    benchmarkReturns: {
      '1Y': 29.8,
      '3Y': 19.5,
      '5Y': 17.2
    },
    amc: 'PPFAS Mutual Fund',
    manager: 'Rajeev Thakkar',
    managerTenure: '10+ Years',
    inceptionDate: '2013-05-28',
    objective: 'To seek to generate long-term capital growth from an actively managed portfolio primarily of Equity and Equity Related Securities.',
    holdings: [
      { name: 'HDFC Bank', weight: 8.1 },
      { name: 'Bajaj Holdings', weight: 7.5 },
      { name: 'ITC', weight: 6.9 },
      { name: 'Microsoft (US)', weight: 5.2 }
    ],
    lastUpdated: '2026-07-01T23:59:00Z'
  }
];
