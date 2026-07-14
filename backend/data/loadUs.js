import fetch from 'node-fetch';

const NASDAQ_LISTED_URL = 'https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt';
const OTHER_LISTED_URL = 'https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt';

const EXCHANGE_NAMES = { N: 'NYSE', A: 'NYSE American', P: 'NYSE Arca', Z: 'Cboe BZX' };

function parseRows(text) {
  return text.split('\n').filter(l => l && !l.startsWith('File Creation Time'));
}

async function loadNasdaqListed() {
  const res = await fetch(NASDAQ_LISTED_URL);
  if (!res.ok) throw new Error(`NASDAQ listed HTTP ${res.status}`);
  const text = await res.text();
  const [, ...rows] = parseRows(text);

  const companies = [];
  for (const row of rows) {
    const [symbol, name, , testIssue, , , etf] = row.split('|');
    if (!symbol || !name || testIssue === 'Y') continue;
    companies.push({
      id: `NASDAQ:${symbol}`,
      name: name.trim(),
      symbol,
      ticker: symbol,
      exchange: 'NASDAQ',
      isin: null,
      country: 'United States',
      sector: etf === 'Y' ? 'ETF' : null,
      industry: null
    });
  }
  return companies;
}

async function loadOtherListed() {
  const res = await fetch(OTHER_LISTED_URL);
  if (!res.ok) throw new Error(`Other listed HTTP ${res.status}`);
  const text = await res.text();
  const [, ...rows] = parseRows(text);

  const companies = [];
  for (const row of rows) {
    const [actSymbol, name, exchangeCode, , etf, , testIssue] = row.split('|');
    if (!actSymbol || !name || testIssue === 'Y') continue;
    const exchange = EXCHANGE_NAMES[exchangeCode] || exchangeCode || 'Other US';
    companies.push({
      id: `${exchange.replace(/\s+/g, '')}:${actSymbol}`,
      name: name.trim(),
      symbol: actSymbol,
      ticker: actSymbol,
      exchange,
      isin: null,
      country: 'United States',
      sector: etf === 'Y' ? 'ETF' : null,
      industry: null
    });
  }
  return companies;
}

// Loads every NASDAQ + NYSE/NYSE American/Arca listed security from NASDAQ Trader's
// free public symbol directory files (updated daily, no auth required).
export async function loadUsCompanies() {
  const [nasdaq, other] = await Promise.all([loadNasdaqListed(), loadOtherListed()]);
  return [...nasdaq, ...other];
}
