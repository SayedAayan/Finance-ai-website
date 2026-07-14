import fetch from 'node-fetch';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/csv,*/*'
};

function formatDdmmyyyy(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${yyyy}${mm}${dd}`;
}

function parseCsvLine(line) {
  return line.split(',').map(f => f.trim());
}

async function fetchBhavcopyForDate(dateStr) {
  const url = `https://www.bseindia.com/download/BhavCopy/Equity/BhavCopy_BSE_CM_0_0_0_${dateStr}_F_0000.CSV`;
  const res = await fetch(url, { headers: BROWSER_HEADERS });
  if (!res.ok) return null;
  const text = await res.text();
  if (!text.startsWith('TradDt')) return null; // holiday/weekend returns an HTML page
  return text;
}

// BSE has no clean public "all listed companies" CSV, but every trading day's
// bhavcopy (official settlement file) includes ISIN, ticker and company name
// for every traded security — walk back up to 10 days to find the last trading day.
export async function loadBseCompanies() {
  let text = null;
  const today = new Date();
  for (let daysBack = 0; daysBack < 10 && !text; daysBack++) {
    const d = new Date(today);
    d.setDate(d.getDate() - daysBack);
    text = await fetchBhavcopyForDate(formatDdmmyyyy(d));
  }
  if (!text) throw new Error('Could not find a recent BSE bhavcopy (last 10 days)');

  const lines = text.split('\n').filter(Boolean);
  const [header, ...rows] = lines;
  const cols = parseCsvLine(header);
  const isinIdx = cols.indexOf('ISIN');
  const symbolIdx = cols.indexOf('TckrSymb');
  const nameIdx = cols.indexOf('FinInstrmNm');
  const segIdx = cols.indexOf('Sgmt');

  const companies = [];
  const seen = new Set();
  for (const row of rows) {
    const fields = parseCsvLine(row);
    if (fields[segIdx] !== 'CM') continue; // Capital Market segment = equities
    const symbol = fields[symbolIdx];
    const name = fields[nameIdx];
    const isin = fields[isinIdx];
    if (!symbol || !name || seen.has(symbol)) continue;
    seen.add(symbol);
    companies.push({
      id: `BSE:${symbol}`,
      name,
      symbol,
      ticker: `${symbol}.BO`,
      exchange: 'BSE',
      isin: isin || null,
      country: 'India',
      sector: null,
      industry: null
    });
  }
  return companies;
}
