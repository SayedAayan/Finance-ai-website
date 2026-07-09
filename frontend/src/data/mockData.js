export const mockStocks = [
  {
    id: 'RELIANCE',
    name: 'Reliance Industries',
    ticker: 'RELIANCE',
    price: 2901.75,
    change: 35.80,
    changePercent: 1.25,
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
    price: 4135.60,
    change: 37.75,
    changePercent: 0.92,
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
  },
  {
    id: 'HDFCBANK',
    name: 'HDFC Bank',
    ticker: 'HDFCBANK',
    price: 1678.45,
    change: 19.10,
    changePercent: 1.15,
    marketCap: '12.8T',
    peRatio: 19.8,
    pbRatio: 2.9,
    eps: 84.87,
    dividendYield: 1.15,
    promoterHolding: 0.0,
    debtToEquity: 0.85,
    about: 'HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai. It is India\'s largest private sector bank by assets and the world\'s tenth-largest bank by market capitalization.',
    news: [
      { id: 4, type: 'corporate_results', title: 'Credit growth surges 15% YoY in Q1', date: '2026-06-28' }
    ],
    lastUpdated: '2026-07-02T10:30:00Z'
  },
  {
    id: 'APSEZ',
    name: 'Adani Ports',
    ticker: 'APSEZ',
    price: 1234.80,
    change: 51.50,
    changePercent: 4.35,
    marketCap: '2.6T',
    peRatio: 33.1,
    pbRatio: 5.8,
    eps: 37.36,
    dividendYield: 0.45,
    promoterHolding: 61.0,
    debtToEquity: 1.05,
    about: 'Adani Ports and Special Economic Zone Limited is India\'s largest private multi-port operator.',
    news: [],
    lastUpdated: '2026-07-02T10:30:00Z'
  },
  {
    id: 'SUNPHARMA',
    name: 'Sun Pharma',
    ticker: 'SUNPHARMA',
    price: 1567.90,
    change: 48.75,
    changePercent: 3.21,
    marketCap: '3.7T',
    peRatio: 35.5,
    pbRatio: 6.1,
    eps: 44.04,
    dividendYield: 0.79,
    promoterHolding: 54.4,
    debtToEquity: 0.08,
    about: 'Sun Pharmaceutical Industries Limited is an Indian multinational pharmaceutical company.',
    news: [],
    lastUpdated: '2026-07-02T10:30:00Z'
  },
  {
    id: 'INFY',
    name: 'Infosys',
    ticker: 'INFY',
    price: 1892.45,
    change: 52.80,
    changePercent: 2.87,
    marketCap: '6.4T',
    peRatio: 25.1,
    pbRatio: 7.8,
    eps: 61.36,
    dividendYield: 2.45,
    promoterHolding: 14.9,
    debtToEquity: 0.05,
    about: 'Infosys Limited is an Indian multinational information technology company.',
    news: [],
    lastUpdated: '2026-07-02T10:30:00Z'
  },
  {
    id: 'TATAMOTORS',
    name: 'Tata Motors Limited',
    ticker: 'TATAMOTORS',
    price: 985.40,
    change: -12.60,
    changePercent: -1.26,
    marketCap: '3.6T',
    peRatio: 16.2,
    pbRatio: 4.8,
    eps: 60.82,
    dividendYield: 0.60,
    promoterHolding: 46.4,
    debtToEquity: 1.10,
    about: 'Tata Motors Limited is an Indian multinational automotive manufacturing company, headquartered in Mumbai, and a member of the Tata Group. The company produces passenger cars, trucks, vans, coaches, and buses.',
    news: [
      { id: 8, type: 'corporate_results', title: 'JLR sales surge 18% in US and UK markets', date: '2026-06-22' }
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
    expenseRatio: 0.85,
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
  },
  {
    id: 'SBI-BLUECHIP',
    name: 'SBI Bluechip Fund',
    type: 'Equity',
    category: 'Large Cap Fund',
    aum: '41,850 Cr',
    nav: 82.40,
    navChange: 0.55,
    navChangePercent: 0.67,
    expenseRatio: 0.81,
    expenseRatioRegular: 1.58,
    exitLoad: '1% within 1 year',
    riskometer: 'Very High',
    benchmark: 'NIFTY 100 TRI',
    returns: {
      '1Y': 24.8,
      '3Y': 16.5,
      '5Y': 15.2
    },
    benchmarkReturns: {
      '1Y': 22.4,
      '3Y': 15.1,
      '5Y': 14.1
    },
    amc: 'SBI Mutual Fund',
    manager: 'Sohini Andani',
    managerTenure: '12 Years',
    inceptionDate: '2006-02-14',
    objective: 'To provide investors with opportunities for long-term growth in capital through an active management of a portfolio of equity and equity related securities.',
    holdings: [
      { name: 'HDFC Bank', weight: 9.2 },
      { name: 'ICICI Bank', weight: 8.1 },
      { name: 'Reliance Ind.', weight: 7.4 },
      { name: 'Larsen & Toubro', weight: 4.8 }
    ],
    lastUpdated: '2026-07-01T23:59:00Z'
  },
  {
    id: 'ICICI-PRU-BLUE',
    name: 'ICICI Prudential Bluechip Fund',
    type: 'Equity',
    category: 'Large Cap Fund',
    aum: '52,400 Cr',
    nav: 104.15,
    navChange: 0.90,
    navChangePercent: 0.87,
    expenseRatio: 0.75,
    expenseRatioRegular: 1.55,
    exitLoad: '1% within 1 year',
    riskometer: 'Very High',
    benchmark: 'NIFTY 100 TRI',
    returns: {
      '1Y': 26.2,
      '3Y': 17.8,
      '5Y': 16.4
    },
    benchmarkReturns: {
      '1Y': 22.4,
      '3Y': 15.1,
      '5Y': 14.1
    },
    amc: 'ICICI Prudential Mutual Fund',
    manager: 'Anish Tawakley',
    managerTenure: '6.2 Years',
    inceptionDate: '2008-05-23',
    objective: 'To generate long-term capital appreciation by actively investing in equity and equity related securities of large cap companies.',
    holdings: [
      { name: 'Reliance Ind.', weight: 8.8 },
      { name: 'ICICI Bank', weight: 8.2 },
      { name: 'HDFC Bank', weight: 7.9 },
      { name: 'Infosys', weight: 6.1 }
    ],
    lastUpdated: '2026-07-01T23:59:00Z'
  },
  {
    id: 'NIPPON-SMALL',
    name: 'Nippon India Small Cap Fund',
    type: 'Equity',
    category: 'Small Cap Fund',
    aum: '48,120 Cr',
    nav: 168.30,
    navChange: -1.20,
    navChangePercent: -0.71,
    expenseRatio: 0.68,
    expenseRatioRegular: 1.50,
    exitLoad: '1% within 1 month',
    riskometer: 'Very High',
    benchmark: 'NIFTY Smallcap 250 TRI',
    returns: {
      '1Y': 45.8,
      '3Y': 32.4,
      '5Y': 28.9
    },
    benchmarkReturns: {
      '1Y': 38.2,
      '3Y': 26.5,
      '5Y': 22.1
    },
    amc: 'Nippon India Mutual Fund',
    manager: 'Samir Rachh',
    managerTenure: '7.8 Years',
    inceptionDate: '2010-09-16',
    objective: 'To generate consistent returns by investing in small cap stocks with strong business models and structural tailwinds.',
    holdings: [
      { name: 'Tube Investments', weight: 4.2 },
      { name: 'HDFC Bank', weight: 3.5 },
      { name: 'Karur Vysya Bank', weight: 3.1 },
      { name: 'Apar Industries', weight: 2.8 }
    ],
    lastUpdated: '2026-07-01T23:59:00Z'
  },
  {
    id: 'QUANT-ACTIVE',
    name: 'Quant Active Fund',
    type: 'Equity',
    category: 'Multi Cap Fund',
    aum: '9,850 Cr',
    nav: 620.40,
    navChange: 5.10,
    navChangePercent: 0.83,
    expenseRatio: 0.77,
    expenseRatioRegular: 1.82,
    exitLoad: '1% within 15 days',
    riskometer: 'Very High',
    benchmark: 'NIFTY 500 Multicap 50:25:25 TRI',
    returns: {
      '1Y': 38.5,
      '3Y': 25.4,
      '5Y': 26.2
    },
    benchmarkReturns: {
      '1Y': 32.1,
      '3Y': 21.2,
      '5Y': 18.2
    },
    amc: 'Quant Mutual Fund',
    manager: 'Sandeep Tandon',
    managerTenure: '6.5 Years',
    inceptionDate: '2001-03-22',
    objective: 'To build a portfolio using Quant\'s VLRT strategy, balancing small-cap, mid-cap, and large-cap stocks dynamically based on momentum and liquidity factors.',
    holdings: [
      { name: 'Reliance Ind.', weight: 9.4 },
      { name: 'Adani Power', weight: 8.5 },
      { name: 'Jio Financial', weight: 7.2 },
      { name: 'SAIL', weight: 5.8 }
    ],
    lastUpdated: '2026-07-01T23:59:00Z'
  }
];
