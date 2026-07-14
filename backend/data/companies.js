// Curated list of major NSE-listed Indian companies (Nifty 50 + notable Nifty 500
// constituents), grouped by sector. This is a maintained static seed — live prices
// for each ticker are fetched on demand via Yahoo Finance in the /api/companies route.
// Update this file periodically to keep the roster current.

export const NIFTY_COMPANIES = [
  // Energy & Oil/Gas
  { name: 'Reliance Industries', ticker: 'RELIANCE.NS', sector: 'Energy' },
  { name: 'ONGC', ticker: 'ONGC.NS', sector: 'Energy' },
  { name: 'Indian Oil Corporation', ticker: 'IOC.NS', sector: 'Energy' },
  { name: 'NTPC', ticker: 'NTPC.NS', sector: 'Energy' },
  { name: 'Power Grid Corporation', ticker: 'POWERGRID.NS', sector: 'Energy' },
  { name: 'Coal India', ticker: 'COALINDIA.NS', sector: 'Energy' },
  { name: 'Adani Green Energy', ticker: 'ADANIGREEN.NS', sector: 'Energy' },
  { name: 'Tata Power', ticker: 'TATAPOWER.NS', sector: 'Energy' },

  // Banking & Financial Services
  { name: 'HDFC Bank', ticker: 'HDFCBANK.NS', sector: 'Financial Services' },
  { name: 'ICICI Bank', ticker: 'ICICIBANK.NS', sector: 'Financial Services' },
  { name: 'State Bank of India', ticker: 'SBIN.NS', sector: 'Financial Services' },
  { name: 'Kotak Mahindra Bank', ticker: 'KOTAKBANK.NS', sector: 'Financial Services' },
  { name: 'Axis Bank', ticker: 'AXISBANK.NS', sector: 'Financial Services' },
  { name: 'IndusInd Bank', ticker: 'INDUSINDBK.NS', sector: 'Financial Services' },
  { name: 'Bajaj Finance', ticker: 'BAJFINANCE.NS', sector: 'Financial Services' },
  { name: 'Bajaj Finserv', ticker: 'BAJAJFINSV.NS', sector: 'Financial Services' },
  { name: 'HDFC Life Insurance', ticker: 'HDFCLIFE.NS', sector: 'Financial Services' },
  { name: 'SBI Life Insurance', ticker: 'SBILIFE.NS', sector: 'Financial Services' },
  { name: 'ICICI Prudential Life', ticker: 'ICICIPRULI.NS', sector: 'Financial Services' },
  { name: 'ICICI Lombard General Insurance', ticker: 'ICICIGI.NS', sector: 'Financial Services' },
  { name: 'Bank of Baroda', ticker: 'BANKBARODA.NS', sector: 'Financial Services' },
  { name: 'Punjab National Bank', ticker: 'PNB.NS', sector: 'Financial Services' },
  { name: 'Shriram Finance', ticker: 'SHRIRAMFIN.NS', sector: 'Financial Services' },
  { name: 'Cholamandalam Investment', ticker: 'CHOLAFIN.NS', sector: 'Financial Services' },
  { name: 'Muthoot Finance', ticker: 'MUTHOOTFIN.NS', sector: 'Financial Services' },

  // Information Technology
  { name: 'Tata Consultancy Services', ticker: 'TCS.NS', sector: 'Information Technology' },
  { name: 'Infosys', ticker: 'INFY.NS', sector: 'Information Technology' },
  { name: 'HCL Technologies', ticker: 'HCLTECH.NS', sector: 'Information Technology' },
  { name: 'Wipro', ticker: 'WIPRO.NS', sector: 'Information Technology' },
  { name: 'Tech Mahindra', ticker: 'TECHM.NS', sector: 'Information Technology' },
  { name: 'LTIMindtree', ticker: 'LTIM.NS', sector: 'Information Technology' },
  { name: 'Persistent Systems', ticker: 'PERSISTENT.NS', sector: 'Information Technology' },
  { name: 'Coforge', ticker: 'COFORGE.NS', sector: 'Information Technology' },
  { name: 'Mphasis', ticker: 'MPHASIS.NS', sector: 'Information Technology' },

  // Consumer Goods / FMCG
  { name: 'Hindustan Unilever', ticker: 'HINDUNILVR.NS', sector: 'FMCG' },
  { name: 'ITC', ticker: 'ITC.NS', sector: 'FMCG' },
  { name: 'Nestle India', ticker: 'NESTLEIND.NS', sector: 'FMCG' },
  { name: 'Britannia Industries', ticker: 'BRITANNIA.NS', sector: 'FMCG' },
  { name: 'Dabur India', ticker: 'DABUR.NS', sector: 'FMCG' },
  { name: 'Tata Consumer Products', ticker: 'TATACONSUM.NS', sector: 'FMCG' },
  { name: 'Godrej Consumer Products', ticker: 'GODREJCP.NS', sector: 'FMCG' },
  { name: 'Marico', ticker: 'MARICO.NS', sector: 'FMCG' },
  { name: 'Varun Beverages', ticker: 'VBL.NS', sector: 'FMCG' },
  { name: 'United Spirits', ticker: 'MCDOWELL-N.NS', sector: 'FMCG' },

  // Automobile
  { name: 'Maruti Suzuki India', ticker: 'MARUTI.NS', sector: 'Automobile' },
  { name: 'Tata Motors', ticker: 'TATAMOTORS.NS', sector: 'Automobile' },
  { name: 'Mahindra & Mahindra', ticker: 'M&M.NS', sector: 'Automobile' },
  { name: 'Bajaj Auto', ticker: 'BAJAJ-AUTO.NS', sector: 'Automobile' },
  { name: 'Hero MotoCorp', ticker: 'HEROMOTOCO.NS', sector: 'Automobile' },
  { name: 'Eicher Motors', ticker: 'EICHERMOT.NS', sector: 'Automobile' },
  { name: 'TVS Motor Company', ticker: 'TVSMOTOR.NS', sector: 'Automobile' },
  { name: 'Ashok Leyland', ticker: 'ASHOKLEY.NS', sector: 'Automobile' },
  { name: 'Bharat Forge', ticker: 'BHARATFORG.NS', sector: 'Automobile' },

  // Pharma & Healthcare
  { name: 'Sun Pharmaceutical Industries', ticker: 'SUNPHARMA.NS', sector: 'Healthcare' },
  { name: 'Dr Reddys Laboratories', ticker: 'DRREDDY.NS', sector: 'Healthcare' },
  { name: 'Cipla', ticker: 'CIPLA.NS', sector: 'Healthcare' },
  { name: 'Divis Laboratories', ticker: 'DIVISLAB.NS', sector: 'Healthcare' },
  { name: 'Apollo Hospitals Enterprise', ticker: 'APOLLOHOSP.NS', sector: 'Healthcare' },
  { name: 'Lupin', ticker: 'LUPIN.NS', sector: 'Healthcare' },
  { name: 'Aurobindo Pharma', ticker: 'AUROPHARMA.NS', sector: 'Healthcare' },
  { name: 'Zydus Lifesciences', ticker: 'ZYDUSLIFE.NS', sector: 'Healthcare' },
  { name: 'Max Healthcare Institute', ticker: 'MAXHEALTH.NS', sector: 'Healthcare' },

  // Metals & Mining
  { name: 'Tata Steel', ticker: 'TATASTEEL.NS', sector: 'Metals & Mining' },
  { name: 'JSW Steel', ticker: 'JSWSTEEL.NS', sector: 'Metals & Mining' },
  { name: 'Hindalco Industries', ticker: 'HINDALCO.NS', sector: 'Metals & Mining' },
  { name: 'Vedanta', ticker: 'VEDL.NS', sector: 'Metals & Mining' },
  { name: 'JSW Energy', ticker: 'JSWENERGY.NS', sector: 'Metals & Mining' },
  { name: 'Jindal Steel & Power', ticker: 'JINDALSTEL.NS', sector: 'Metals & Mining' },

  // Cement & Construction
  { name: 'UltraTech Cement', ticker: 'ULTRACEMCO.NS', sector: 'Cement & Construction' },
  { name: 'Grasim Industries', ticker: 'GRASIM.NS', sector: 'Cement & Construction' },
  { name: 'Ambuja Cements', ticker: 'AMBUJACEM.NS', sector: 'Cement & Construction' },
  { name: 'Shree Cement', ticker: 'SHREECEM.NS', sector: 'Cement & Construction' },
  { name: 'Larsen & Toubro', ticker: 'LT.NS', sector: 'Cement & Construction' },

  // Telecom
  { name: 'Bharti Airtel', ticker: 'BHARTIARTL.NS', sector: 'Telecom' },
  { name: 'Vodafone Idea', ticker: 'IDEA.NS', sector: 'Telecom' },
  { name: 'Indus Towers', ticker: 'INDUSTOWER.NS', sector: 'Telecom' },

  // Consumer Durables & Retail
  { name: 'Titan Company', ticker: 'TITAN.NS', sector: 'Consumer Durables' },
  { name: 'Asian Paints', ticker: 'ASIANPAINT.NS', sector: 'Consumer Durables' },
  { name: 'Havells India', ticker: 'HAVELLS.NS', sector: 'Consumer Durables' },
  { name: 'Voltas', ticker: 'VOLTAS.NS', sector: 'Consumer Durables' },
  { name: 'Trent', ticker: 'TRENT.NS', sector: 'Retail' },
  { name: 'Avenue Supermarts (DMart)', ticker: 'DMART.NS', sector: 'Retail' },

  // Diversified / Conglomerate
  { name: 'Adani Enterprises', ticker: 'ADANIENT.NS', sector: 'Diversified' },
  { name: 'Adani Ports & SEZ', ticker: 'ADANIPORTS.NS', sector: 'Infrastructure' },
  { name: 'Siemens', ticker: 'SIEMENS.NS', sector: 'Capital Goods' },
  { name: 'ABB India', ticker: 'ABB.NS', sector: 'Capital Goods' },
  { name: 'Cummins India', ticker: 'CUMMINSIND.NS', sector: 'Capital Goods' },

  // Media & Entertainment
  { name: 'Zee Entertainment Enterprises', ticker: 'ZEEL.NS', sector: 'Media & Entertainment' },
  { name: 'PVR Inox', ticker: 'PVRINOX.NS', sector: 'Media & Entertainment' },
];
