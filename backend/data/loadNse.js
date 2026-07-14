import fetch from 'node-fetch';

const NSE_EQUITY_CSV = 'https://archives.nseindia.com/content/equities/EQUITY_L.csv';
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/csv,*/*'
};

function parseCsvLine(line) {
  return line.split(',').map(f => f.trim());
}

// Loads every NSE-listed equity from the official archive CSV.
// Columns: SYMBOL, NAME OF COMPANY, SERIES, DATE OF LISTING, PAID UP VALUE, MARKET LOT, ISIN NUMBER, FACE VALUE
export async function loadNseCompanies() {
  const res = await fetch(NSE_EQUITY_CSV, { headers: BROWSER_HEADERS });
  if (!res.ok) throw new Error(`NSE equity list HTTP ${res.status}`);
  const text = await res.text();
  const lines = text.split('\n').filter(Boolean);
  const [header, ...rows] = lines;
  const cols = parseCsvLine(header).map(c => c.toUpperCase());

  const symbolIdx = cols.indexOf('SYMBOL');
  const nameIdx = cols.indexOf('NAME OF COMPANY');
  const isinIdx = cols.indexOf('ISIN NUMBER');

  const companies = [];
  for (const row of rows) {
    const fields = parseCsvLine(row);
    const symbol = fields[symbolIdx];
    const name = fields[nameIdx];
    if (!symbol || !name) continue;
    companies.push({
      id: `NSE:${symbol}`,
      name,
      symbol,
      ticker: `${symbol}.NS`,
      exchange: 'NSE',
      isin: fields[isinIdx] || null,
      country: 'India',
      sector: null,
      industry: null
    });
  }
  return companies;
}
