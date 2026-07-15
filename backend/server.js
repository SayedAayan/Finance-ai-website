import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import Parser from 'rss-parser';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const AI_PROVIDERS = [
  { name: 'OpenRouter', url: 'https://openrouter.ai/api/v1/chat/completions', key: process.env.OPENROUTER_API_KEY, model: 'google/gemini-2.5-pro' },
  { name: 'xAI', url: 'https://api.x.ai/v1/chat/completions', key: process.env.XAI_API_KEY, model: 'grok-beta' },
  { name: 'DeepSeek', url: 'https://api.deepseek.com/chat/completions', key: process.env.DEEPSEEK_API_KEY, model: 'deepseek-chat' },
  { name: 'Groq', url: 'https://api.groq.com/openai/v1/chat/completions', key: process.env.GROQ_API_KEY, model: 'meta-llama/llama-4-scout-17b-16e-instruct' }
].filter(p => p.key);

// ─── Yahoo Finance v8 chart API ───────────────────────────────────────────────
// Uses browser User-Agent + chart endpoint — no auth/crumb needed
const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://finance.yahoo.com/',
  'Cache-Control': 'no-cache'
};

async function yfQuoteRaw(symbol) {
  // v8 chart endpoint — works without cookie/crumb
  const encoded = encodeURIComponent(symbol);
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=1d&includePrePost=false`;
  const res = await fetch(url, { headers: YF_HEADERS });
  if (!res.ok) throw new Error(`Yahoo chart HTTP ${res.status} for ${symbol}`);
  const json = await res.json();
  const result = json.chart?.result?.[0];
  if (!result) throw new Error(`No chart data for ${symbol}`);
  const meta = result.meta;

  const prev = meta.previousClose || meta.chartPreviousClose || 0;
  const cur = meta.regularMarketPrice || 0;
  const change = prev ? (cur - prev).toFixed(2) : null;
  const changePct = prev ? (((cur - prev) / prev) * 100).toFixed(2) : null;

  return {
    symbol: meta.symbol,
    name: meta.longName || meta.shortName || symbol,
    currency: meta.currency,
    exchange: meta.exchangeName,
    quoteType: meta.instrumentType,
    marketState: meta.marketState,
    currentPrice: cur,
    previousClose: prev,
    open: meta.regularMarketOpen,
    dayHigh: meta.regularMarketDayHigh,
    dayLow: meta.regularMarketDayLow,
    change,
    changePercent: changePct,
    volume: meta.regularMarketVolume,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
    source: 'yahoo'
  };
}

// ─── Finnhub fallback (US/global tickers; limited Indian coverage) ──────────
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

async function finnhubQuote(symbol) {
  if (!FINNHUB_KEY) throw new Error('Finnhub key not configured');
  // Finnhub doesn't understand .NS/.BO suffixes — strip for a best-effort lookup
  const bareSymbol = symbol.replace(/\.(NS|BO)$/i, '');
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(bareSymbol)}&token=${FINNHUB_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub HTTP ${res.status} for ${symbol}`);
  const q = await res.json();
  if (!q || typeof q.c !== 'number' || q.c === 0) throw new Error(`No Finnhub data for ${symbol}`);

  const change = q.d;
  const changePct = q.dp;
  return {
    symbol,
    name: symbol,
    currency: 'USD',
    exchange: null,
    quoteType: null,
    marketState: null,
    currentPrice: q.c,
    previousClose: q.pc,
    open: q.o,
    dayHigh: q.h,
    dayLow: q.l,
    change: change?.toFixed ? change.toFixed(2) : change,
    changePercent: changePct?.toFixed ? changePct.toFixed(2) : changePct,
    volume: null,
    fiftyTwoWeekHigh: null,
    fiftyTwoWeekLow: null,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
    source: 'finnhub'
  };
}

// ─── Alpha Vantage fallback (last resort — strict 25 req/day free tier) ─────
const ALPHAVANTAGE_KEY = process.env.ALPHAVANTAGE_API_KEY;

async function alphaVantageQuote(symbol) {
  if (!ALPHAVANTAGE_KEY) throw new Error('Alpha Vantage key not configured');
  const bareSymbol = symbol.replace(/\.(NS|BO)$/i, '');
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(bareSymbol)}&apikey=${ALPHAVANTAGE_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Alpha Vantage HTTP ${res.status} for ${symbol}`);
  const json = await res.json();
  const q = json['Global Quote'];
  const price = q && parseFloat(q['05. price']);
  if (!price) throw new Error(`No Alpha Vantage data for ${symbol}`);

  const prevClose = parseFloat(q['08. previous close']);
  const change = parseFloat(q['09. change']);
  const changePct = parseFloat((q['10. change percent'] || '0%').replace('%', ''));

  return {
    symbol,
    name: symbol,
    currency: 'USD',
    exchange: null,
    quoteType: null,
    marketState: null,
    currentPrice: price,
    previousClose: prevClose,
    open: parseFloat(q['02. open']),
    dayHigh: parseFloat(q['03. high']),
    dayLow: parseFloat(q['04. low']),
    change: change.toFixed(2),
    changePercent: changePct.toFixed(2),
    volume: parseInt(q['06. volume'], 10) || null,
    fiftyTwoWeekHigh: null,
    fiftyTwoWeekLow: null,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
    source: 'alphavantage'
  };
}

// ─── Unified quote with automatic fallback across providers ────────────────
async function yfQuote(symbol) {
  const providers = [yfQuoteRaw, finnhubQuote, alphaVantageQuote];
  let lastErr;
  for (const provider of providers) {
    try {
      return await provider(symbol);
    } catch (err) {
      lastErr = err;
      console.log(`  ⚠ quote provider ${provider.name} failed for ${symbol}: ${err.message}`);
    }
  }
  throw lastErr;
}

async function yfHistory(symbol, range, interval) {
  const encoded = encodeURIComponent(symbol);
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encoded}?interval=${interval}&range=${range}&includePrePost=false`;
  const res = await fetch(url, { headers: YF_HEADERS });
  if (!res.ok) throw new Error(`Yahoo chart HTTP ${res.status} for ${symbol}`);
  const json = await res.json();
  const result = json.chart?.result?.[0];
  if (!result) throw new Error(`No chart data for ${symbol}`);

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];
  const points = timestamps
    .map((t, i) => ({ time: t * 1000, price: closes[i] }))
    .filter(p => typeof p.price === 'number');

  return {
    symbol: result.meta.symbol,
    currency: result.meta.currency,
    points
  };
}

// ─── Company & mutual fund search database (NSE + BSE + US + AMFI) ─────────
import { ensureIndexReady, scheduleIndexRefresh, search as searchDatabase, getCompanyById, getSchemeById } from './data/searchIndex.js';

async function getAmfiData() {
  const { amcs, schemes, fetchedAt } = await ensureIndexReady();
  return { amcs, schemes, fetchedAt };
}

// ─── Financial news (NewsAPI.org primary, Google News RSS fallback) ─────────
const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
let newsCache = { fetchedAt: 0, articles: [] };
const NEWS_CACHE_MS = 15 * 60 * 1000; // 15 min

async function getNewsFromNewsApi() {
  if (!NEWSAPI_KEY) throw new Error('NewsAPI key not configured');
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent('(Nifty OR Sensex OR "Indian stock market" OR "mutual fund" OR NSE OR BSE OR RBI OR SEBI) AND (India OR finance)')}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${NEWSAPI_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NewsAPI HTTP ${res.status}`);
  const json = await res.json();
  if (json.status !== 'ok') throw new Error(`NewsAPI error: ${json.message || 'unknown'}`);

  const seen = new Set();
  const articles = [];
  for (const item of json.articles || []) {
    const key = (item.title || '').trim().toLowerCase();
    if (!key || seen.has(key) || key === '[removed]') continue;
    seen.add(key);
    articles.push({
      title: item.title,
      description: item.description || '',
      source: item.source?.name || 'News',
      link: item.url,
      image: item.urlToImage || null,
      publishedAt: item.publishedAt,
      publishedMs: item.publishedAt ? new Date(item.publishedAt).getTime() : 0
    });
  }
  articles.sort((a, b) => b.publishedMs - a.publishedMs);
  return articles.slice(0, 12);
}

async function getNewsFromGoogleRss() {
  const queries = [
    'Indian stock market Nifty Sensex',
    'mutual fund India AMFI NAV',
    'NSE BSE India company results',
    'RBI SEBI markets India'
  ];

  const settled = await Promise.allSettled(
    queries.map(q => rssParser.parseURL(
      `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' finance')}&hl=en-IN&gl=IN&ceid=IN:en`
    ))
  );

  const seen = new Set();
  const articles = [];
  for (const result of settled) {
    if (result.status !== 'fulfilled') continue;
    for (const item of result.value.items) {
      const key = (item.title || '').trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const sourceMatch = item.title?.match(/ - ([^-]+)$/);
      articles.push({
        title: item.title?.replace(/ - [^-]+$/, '').trim(),
        description: '',
        source: sourceMatch ? sourceMatch[1].trim() : (item.creator || 'Google News'),
        link: item.link,
        image: null,
        publishedAt: item.pubDate,
        publishedMs: item.pubDate ? new Date(item.pubDate).getTime() : 0
      });
    }
  }

  articles.sort((a, b) => b.publishedMs - a.publishedMs);
  return articles.slice(0, 10);
}

async function getTopNews() {
  const isStale = Date.now() - newsCache.fetchedAt > NEWS_CACHE_MS;
  if (!isStale && newsCache.articles.length > 0) return newsCache;

  let articles;
  try {
    articles = await getNewsFromNewsApi();
    console.log(`  📰 News refreshed via NewsAPI: ${articles.length} articles`);
  } catch (err) {
    console.log(`  ⚠ NewsAPI failed (${err.message}), falling back to Google News RSS`);
    articles = await getNewsFromGoogleRss();
    console.log(`  📰 News refreshed via Google RSS: ${articles.length} articles`);
  }

  newsCache = { fetchedAt: Date.now(), articles };
  return newsCache;
}

// ─── System prompt ────────────────────────────────────────────────────────────
const APP_CONTEXT = `
You are Stockbuzz AI, an expert AI-powered financial research assistant for StockBuzz — India's leading financial intelligence platform.

You have access to REAL-TIME live market data through four specialized tools. You MUST use these tools whenever a user asks about any price, NAV, news, or market data.

TOOLS AVAILABLE:
1. search_ticker(query)       - Find the correct Yahoo Finance symbol for any stock, fund, or company
2. get_stock_data(symbol)     - Live price, NAV, change, 52-week range, volume
3. get_market_overview()      - Live Nifty 50, Sensex, Nifty Bank, USD/INR
4. get_financial_news(query)  - Latest market and company news headlines

MANDATORY RULES:
- ALWAYS call a tool for any price, NAV, index level, or news question. Never answer from memory.
- If you do not know the exact ticker symbol, call search_ticker FIRST then get_stock_data.
- For Indian stocks use NSE suffix .NS (e.g., RELIANCE.NS, TCS.NS, HDFCBANK.NS)
- For Indian mutual funds: Use search_ticker first. If it fails, rely on the common funds listed below. NEVER say you can't find a fund without checking the list below.
- For market indices, use get_market_overview()
- Never give Buy/Sell/Hold recommendations.
- Respond in clear, simple language with bullet points or tables.
- When asked to analyze a specific news article, structure your answer in two clear parts: "What happened" (a plain-language summary of the news) and "Market impact" (which sectors, companies, or indices could be affected, and why — pull live prices with get_stock_data if relevant to ground the impact).

COMMON INDIAN STOCK SYMBOLS (NSE):
Reliance Industries - RELIANCE.NS
Tata Consultancy Services - TCS.NS
HDFC Bank - HDFCBANK.NS
Infosys - INFY.NS
ICICI Bank - ICICIBANK.NS
State Bank of India - SBIN.NS

COMMON INDIAN MUTUAL FUND SYMBOLS (Use these EXACT symbols for get_stock_data):
HDFC Flexi Cap Fund - 0P0000XW8F.BO
Parag Parikh Flexi Cap Fund - 0P0000YWL1.BO
Kotak Flexicap Fund - 0P00005V1U.BO
Kotak Mahindra Liquid Fund - 0P00005V4Z.BO
SBI Equity Hybrid Fund - 0P00005WLZ.BO
ICICI Prudential Bluechip Fund - 0P00005WMI.BO
Axis Bluechip Fund - 0P0000XW8J.BO
Nippon India Small Cap Fund - 0P0000YWL2.BO
Wipro - WIPRO.NS
Bajaj Finance - BAJFINANCE.NS
Kotak Mahindra Bank - KOTAKBANK.NS
Axis Bank - AXISBANK.NS
Sun Pharma - SUNPHARMA.NS
Maruti Suzuki - MARUTI.NS
ITC - ITC.NS
HCL Technologies - HCLTECH.NS
Tata Motors - TATAMOTORS.NS
Adani Enterprises - ADANIENT.NS
Hero MotoCorp - HEROMOTOCO.NS
Bajaj Auto - BAJAJ-AUTO.NS
Titan Company - TITAN.NS
Asian Paints - ASIANPAINT.NS
Dr Reddys - DRREDDY.NS
Cipla - CIPLA.NS
NTPC - NTPC.NS
Coal India - COALINDIA.NS
Apollo Hospitals - APOLLOHOSP.NS
JSW Steel - JSWSTEEL.NS
Tech Mahindra - TECHM.NS
L&T - LT.NS

MARKET INDICES: Nifty 50 = ^NSEI, Sensex = ^BSESN, Nifty Bank = ^NSEBANK, Nifty IT = ^CNXIT
FOR MUTUAL FUNDS: Always use search_ticker to find the correct symbol first.
`;

// ─── Tool schemas ─────────────────────────────────────────────────────────────
const tools = [
  {
    type: 'function',
    function: {
      name: 'search_ticker',
      description: 'Search Yahoo Finance for the correct ticker symbol by company or fund name. Use this FIRST when unsure of the exact symbol, especially for mutual funds.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Company or fund name to search. E.g. HDFC Flexi Cap Fund, Parag Parikh, Reliance Industries' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_stock_data',
      description: 'Fetch live real-time data for any stock, ETF, mutual fund, or index using its Yahoo Finance symbol. Returns current price/NAV, change, 52-week range, volume.',
      parameters: {
        type: 'object',
        properties: {
          symbol: { type: 'string', description: 'Yahoo Finance symbol. E.g. RELIANCE.NS, TCS.NS, ^NSEI, AAPL' }
        },
        required: ['symbol']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_market_overview',
      description: 'Get live data for all major Indian market indices: Nifty 50, Sensex, Nifty Bank, Nifty IT, and USD/INR. Use when user asks how the market is doing.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_financial_news',
      description: 'Fetch latest live financial news headlines from Google News. Use when user asks about news, developments, or current events.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query. E.g. Reliance Industries, Nifty 50, RBI, mutual funds India. Leave empty for top market news.' }
        }
      }
    }
  }
];

// ─── Tool execution ───────────────────────────────────────────────────────────
const rssParser = new Parser();

async function handleToolCall(toolCall) {
  const name = toolCall.function.name;
  let args = {};
  try { args = JSON.parse(toolCall.function.arguments || '{}'); } catch { /* ignore */ }
  console.log(`  🔧 ${name}(${JSON.stringify(args)})`);

  if (name === 'search_ticker') {
    try {
      const { stocks, funds } = await searchDatabase(args.query, { limit: 8 });
      const results = [
        ...stocks.map(c => ({ symbol: c.ticker, name: c.name, type: 'EQUITY', exchange: c.exchange })),
        ...funds.map(f => ({ symbol: f.isin || f.schemeCode, name: f.name, type: 'MUTUALFUND', exchange: 'AMFI' }))
      ];
      return JSON.stringify({
        query: args.query,
        results,
        tip: results.length > 0
          ? `Use symbol "${results[0].symbol}" with get_stock_data`
          : 'No results found. Try a different search term.'
      });
    } catch (err) {
      return JSON.stringify({ error: `Search failed: ${err.message}` });
    }
  }

  if (name === 'get_stock_data') {
    try {
      const data = await yfQuote(args.symbol);
      return JSON.stringify(data);
    } catch (err) {
      return JSON.stringify({
        error: `Could not fetch "${args.symbol}": ${err.message}`,
        tip: 'Symbol may be wrong. Use search_ticker to find the correct symbol first.'
      });
    }
  }

  if (name === 'get_market_overview') {
    const indices = [
      { symbol: '^NSEI', label: 'Nifty 50' },
      { symbol: '^BSESN', label: 'Sensex (BSE)' },
      { symbol: '^NSEBANK', label: 'Nifty Bank' },
      { symbol: '^CNXIT', label: 'Nifty IT' },
      { symbol: 'USDINR=X', label: 'USD/INR' }
    ];
    const settled = await Promise.allSettled(indices.map(i => yfQuote(i.symbol)));
    const overview = {};
    settled.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        const q = result.value;
        overview[indices[i].label] = {
          value: q.currentPrice,
          change: q.change,
          changePercent: q.changePercent,
          dayHigh: q.dayHigh,
          dayLow: q.dayLow,
          open: q.open
        };
      } else {
        console.log(`  ⚠ ${indices[i].label}: ${result.reason?.message}`);
        overview[indices[i].label] = { error: 'Temporarily unavailable' };
      }
    });
    return JSON.stringify({
      marketOverview: overview,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'
    });
  }

  if (name === 'get_financial_news') {
    const query = (args.query || 'India stock market BSE NSE Nifty').trim();
    try {
      if (NEWSAPI_KEY) {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query + ' finance')}&language=en&sortBy=publishedAt&pageSize=8&apiKey=${NEWSAPI_KEY}`;
        const res = await fetch(url);
        const json = await res.json();
        if (res.ok && json.status === 'ok') {
          const news = json.articles.slice(0, 8).map(item => ({
            title: item.title,
            source: item.source?.name || 'News',
            published: item.publishedAt,
            link: item.url,
            image: item.urlToImage || null
          }));
          return JSON.stringify({ query, news, fetchedAt: new Date().toISOString() });
        }
      }
      throw new Error('NewsAPI unavailable, using RSS fallback');
    } catch (err) {
      try {
        const feed = await rssParser.parseURL(
          `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' finance')}&hl=en-IN&gl=IN&ceid=IN:en`
        );
        const news = feed.items.slice(0, 8).map(item => ({
          title: item.title,
          source: item.creator || 'News',
          published: item.pubDate,
          link: item.link
        }));
        return JSON.stringify({ query, news, fetchedAt: new Date().toISOString() });
      } catch (rssErr) {
        return JSON.stringify({ error: `News fetch failed: ${rssErr.message}` });
      }
    }
  }

  return JSON.stringify({ error: `Unknown tool: ${name}` });
}

function parseRetryDelayMs(errText) {
  const match = errText.match(/try again in ([\d.]+)s/i);
  return match ? Math.ceil(parseFloat(match[1]) * 1000) + 250 : 2000;
}

async function callAIWithFallback(apiMessages, providerIndex = 0, retriesLeft = 2) {
  if (providerIndex >= AI_PROVIDERS.length) {
    throw new Error('All AI providers failed.');
  }

  const provider = AI_PROVIDERS[providerIndex];

  try {
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.key}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: apiMessages,
        temperature: 0.1,
        max_tokens: 1024,
        tools,
        tool_choice: 'auto'
      })
    });

    if (response.status === 429 && retriesLeft > 0) {
      const errText = await response.text();
      const delay = parseRetryDelayMs(errText);
      console.log(`  ⏳ Rate limited by ${provider.name}, retrying in ${delay}ms (${retriesLeft} left)`);
      await new Promise(r => setTimeout(r, delay));
      return callAIWithFallback(apiMessages, providerIndex, retriesLeft - 1);
    }

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`${provider.name} API ${response.status}: ${err}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ ${provider.name} failed:`, error.message);
    console.log(`🔄 Switching to next provider...`);
    return callAIWithFallback(apiMessages, providerIndex + 1, 2);
  }
}

// ─── Agentic loop ─────────────────────────────────────────────────────────────
async function runAgentLoop(apiMessages) {
  for (let i = 0; i < 8; i++) {
    const data = await callAIWithFallback(apiMessages);
    const message = data.choices?.[0]?.message;
    if (!message) throw new Error('No message in Groq response');

    if (message.tool_calls && message.tool_calls.length > 0) {
      apiMessages.push(message);
      console.log(`  ↻ Iter ${i + 1}: ${message.tool_calls.length} tool call(s)`);
      const results = await Promise.all(message.tool_calls.map(tc => handleToolCall(tc)));
      message.tool_calls.forEach((tc, idx) => {
        apiMessages.push({ role: 'tool', tool_call_id: tc.id, name: tc.function.name, content: results[idx] });
      });
      continue;
    }

    if (message.content) {
      console.log(`  ✅ Done on iter ${i + 1}`);
      return message.content;
    }

    throw new Error('Empty Groq response');
  }

  throw new Error('Max iterations reached');
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', models: AI_PROVIDERS.map(p => p.model), apiKeyLoaded: AI_PROVIDERS.length > 0 });
});

// ─── Chat Database Setup ──────────────────────────────────────────────────────
const DB_FILE = join(__dirname, 'db.json');

async function readDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    const db = JSON.parse(data);
    if (!db.watchlist) db.watchlist = [];
    if (!db.trending) db.trending = {};
    return db;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { chats: {}, watchlist: [], trending: {} };
    }
    throw err;
  }
}

async function writeDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/api/chats', async (req, res) => {
  try {
    const db = await readDB();
    const chats = Object.values(db.chats || {}).map(c => ({
      id: c.id,
      title: c.title,
      updatedAt: c.updatedAt
    })).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/chats/:id', async (req, res) => {
  try {
    const db = await readDB();
    const chat = db.chats?.[req.params.id];
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json({ chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chats', async (req, res) => {
  try {
    const db = await readDB();
    if (!db.chats) db.chats = {};

    const id = Date.now().toString();
    const { title = 'New Chat', messages = [] } = req.body || {};

    db.chats[id] = {
      id,
      title,
      messages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await writeDB(db);
    res.json({ chat: db.chats[id] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/chats/:id', async (req, res) => {
  try {
    const db = await readDB();
    const chat = db.chats?.[req.params.id];
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    const { messages, title } = req.body || {};
    if (messages) chat.messages = messages;
    if (title) chat.title = title;
    chat.updatedAt = new Date().toISOString();

    await writeDB(db);
    res.json({ chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/chats/:id', async (req, res) => {
  try {
    const db = await readDB();
    if (db.chats && db.chats[req.params.id]) {
      delete db.chats[req.params.id];
      await writeDB(db);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Watchlist ────────────────────────────────────────────────────────────────
app.get('/api/watchlist', async (req, res) => {
  try {
    const db = await readDB();
    res.json({ watchlist: db.watchlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/watchlist', async (req, res) => {
  try {
    const db = await readDB();
    const { type, id, name, ticker, pe, mcap } = req.body || {};
    if (!type || !id || !name || !ticker) {
      return res.status(400).json({ error: 'type, id, name, and ticker are required' });
    }
    if (db.watchlist.some(item => item.id === id)) {
      return res.status(409).json({ error: 'Item already in watchlist' });
    }
    const item = { type, id, name, ticker, pe: pe ?? '-', mcap: mcap ?? '-', alert: null };
    db.watchlist.push(item);
    await writeDB(db);
    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/watchlist/:id', async (req, res) => {
  try {
    const db = await readDB();
    const item = db.watchlist.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const { alert } = req.body || {};
    item.alert = alert || null;
    await writeDB(db);
    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/watchlist/:id', async (req, res) => {
  try {
    const db = await readDB();
    db.watchlist = db.watchlist.filter(i => i.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const HISTORY_PRESETS = {
  '1D': { range: '1d', interval: '5m' },
  '1W': { range: '5d', interval: '15m' },
  '1M': { range: '1mo', interval: '1d' },
  '1Y': { range: '1y', interval: '1wk' },
  '5Y': { range: '5y', interval: '1mo' },
  'MAX': { range: 'max', interval: '3mo' }
};

app.get('/api/history', async (req, res) => {
  const symbol = req.query.symbol;
  const preset = HISTORY_PRESETS[req.query.range] || HISTORY_PRESETS['1Y'];
  if (!symbol) {
    return res.status(400).json({ error: 'symbol query param is required, e.g. ?symbol=RELIANCE.NS&range=1Y' });
  }
  try {
    const data = await yfHistory(symbol, preset.range, preset.interval);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/quotes', async (req, res) => {
  const symbols = (req.query.symbols || '').split(',').map(s => s.trim()).filter(Boolean);
  if (symbols.length === 0) {
    return res.status(400).json({ error: 'symbols query param is required, e.g. ?symbols=RELIANCE.NS,TCS.NS' });
  }
  const settled = await Promise.allSettled(symbols.map(yfQuote));
  const quotes = settled.map((r, i) => r.status === 'fulfilled' ? r.value : { symbol: symbols[i], error: r.reason?.message || 'fetch failed' });
  res.json({ quotes });
});

app.get('/api/market-overview', async (req, res) => {
  const indices = [
    { symbol: '^NSEI', label: 'NIFTY 50' },
    { symbol: '^BSESN', label: 'SENSEX' },
    { symbol: '^NSEBANK', label: 'NIFTY BANK' },
    { symbol: 'USDINR=X', label: 'USD/INR' }
  ];
  const settled = await Promise.allSettled(indices.map(i => yfQuote(i.symbol)));
  const results = settled.map((r, i) => ({
    label: indices[i].label,
    ...(r.status === 'fulfilled' ? r.value : { error: r.reason?.message || 'fetch failed' })
  }));
  res.json({ indices: results });
});

// ─── AMC & Scheme database (live from AMFI) ──────────────────────────────────
app.get('/api/amcs', async (req, res) => {
  try {
    const { amcs, fetchedAt } = await getAmfiData();
    res.json({ amcs, count: amcs.length, fetchedAt: new Date(fetchedAt).toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function handleSchemesRequest(req, res) {
  try {
    const { schemes, fetchedAt } = await getAmfiData();
    const { amc, q, limit = '50' } = req.query;
    let filtered = schemes;
    if (amc) filtered = filtered.filter(s => s.amc.toLowerCase() === String(amc).toLowerCase());
    if (q) {
      const needle = String(q).toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(needle));
    }
    const capped = filtered.slice(0, Math.min(parseInt(limit, 10) || 50, 500));
    res.json({ schemes: capped, total: filtered.length, fetchedAt: new Date(fetchedAt).toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
app.get('/api/schemes', handleSchemesRequest);
app.get('/api/funds', handleSchemesRequest);

// ─── Company database (NSE + BSE + US, live from official exchange feeds) ───
async function handleCompaniesRequest(req, res) {
  try {
    const { exchange, q, live, limit = '50', page = '1' } = req.query;
    const { companies } = await ensureIndexReady();
    let list = companies;
    if (exchange) list = list.filter(c => c.exchange.toLowerCase() === String(exchange).toLowerCase());
    if (q) {
      const needle = String(q).toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(needle) || c.symbol.toLowerCase().includes(needle));
    }

    const pageSize = Math.min(parseInt(limit, 10) || 50, 200);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const start = (pageNum - 1) * pageSize;
    const paged = list.slice(start, start + pageSize);

    if (live === 'true') {
      const settled = await Promise.allSettled(paged.map(c => yfQuote(c.ticker)));
      const enriched = paged.map((c, i) => {
        const r = settled[i];
        return r.status === 'fulfilled'
          ? { ...c, price: r.value.currentPrice, changePercent: r.value.changePercent, currency: r.value.currency }
          : { ...c, price: null, changePercent: null, error: 'quote unavailable' };
      });
      return res.json({ companies: enriched, count: enriched.length, total: list.length, page: pageNum, pageSize, exchanges: [...new Set(companies.map(c => c.exchange))].sort() });
    }

    res.json({ companies: paged, count: paged.length, total: list.length, page: pageNum, pageSize, exchanges: [...new Set(companies.map(c => c.exchange))].sort() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
app.get('/api/companies', handleCompaniesRequest);
app.get('/api/stocks', handleCompaniesRequest);

app.get('/api/company/:id', async (req, res) => {
  try {
    const company = await getCompanyById(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json({ company });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mutual-fund/:id', async (req, res) => {
  try {
    const scheme = await getSchemeById(req.params.id);
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
    res.json({ scheme });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Stock stats: 1Y price history → day range, 52w range, volume, period returns ──
function pickReturn(closes, dates, daysAgo) {
  if (!closes.length) return null;
  const targetTime = Date.now() - daysAgo * 86400000;
  let idx = dates.findIndex(t => t * 1000 >= targetTime);
  if (idx === -1) idx = 0;
  const past = closes[idx];
  const latest = closes[closes.length - 1];
  if (past == null || latest == null || past === 0) return null;
  return Number((((latest - past) / past) * 100).toFixed(2));
}

app.get('/api/stock-stats/:ticker', async (req, res) => {
  try {
    const ticker = req.params.ticker;
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1y`;
    const r = await fetch(url, { headers: YF_HEADERS });
    if (!r.ok) throw new Error(`Yahoo chart HTTP ${r.status}`);
    const json = await r.json();
    const result = json.chart?.result?.[0];
    if (!result) throw new Error('No chart data');
    const closes = (result.indicators?.quote?.[0]?.close || []).filter(c => c != null);
    const dates = result.timestamp || [];
    res.json({
      ticker,
      return1M: pickReturn(closes, dates, 30),
      return3M: pickReturn(closes, dates, 91),
      return6M: pickReturn(closes, dates, 182),
      return1Y: pickReturn(closes, dates, 365),
      fiftyTwoWeekHigh: result.meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: result.meta.fiftyTwoWeekLow,
      volume: result.meta.regularMarketVolume
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Fund stats: historical NAV series (mfapi.in, keyed by AMFI scheme code) ──
app.get('/api/fund-stats/:schemeCode', async (req, res) => {
  try {
    const r = await fetch(`https://api.mfapi.in/mf/${encodeURIComponent(req.params.schemeCode)}`);
    if (!r.ok) throw new Error(`mfapi HTTP ${r.status}`);
    const json = await r.json();
    const rows = json.data || [];
    if (!rows.length) throw new Error('No NAV history');

    const parsed = rows.map(row => {
      const [d, m, y] = row.date.split('-');
      return { time: new Date(`${y}-${m}-${d}`).getTime(), nav: parseFloat(row.nav) };
    }).filter(p => !isNaN(p.nav)).sort((a, b) => a.time - b.time);

    const latest = parsed[parsed.length - 1]?.nav ?? null;
    function returnSince(daysAgo) {
      const targetTime = Date.now() - daysAgo * 86400000;
      const past = parsed.find(p => p.time >= targetTime);
      if (!past || latest == null || past.nav === 0) return null;
      return Number((((latest - past.nav) / past.nav) * 100).toFixed(2));
    }

    res.json({
      schemeCode: req.params.schemeCode,
      fundHouse: json.meta?.fund_house,
      schemeType: json.meta?.scheme_type,
      return1M: returnSince(30),
      return3M: returnSince(91),
      return6M: returnSince(182),
      return1Y: returnSince(365),
      return3Y: returnSince(1095)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Unified search: stocks (NSE/BSE/US) + mutual funds + AMCs ──────────────
function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

async function logSearchQuery(q, topResult) {
  const query = q.trim();
  if (!query || query.length < 2) return;
  try {
    const db = await readDB();
    const day = todayKey();
    if (!db.trending[day]) db.trending[day] = {};
    // Keep only the last 3 days of buckets so db.json doesn't grow unbounded
    for (const key of Object.keys(db.trending)) {
      if (key !== day) {
        const age = (new Date(day) - new Date(key)) / 86400000;
        if (age > 3) delete db.trending[key];
      }
    }
    const label = topResult?.name || query;
    const bucket = db.trending[day];
    if (!bucket[label]) bucket[label] = { label, type: topResult?.type || null, route: topResult?.route || null, count: 0 };
    bucket[label].count += 1;
    await writeDB(db);
  } catch { /* trending is best-effort, never block search */ }
}

app.get('/api/search', async (req, res) => {
  try {
    const { q, limit = '8' } = req.query;
    const results = await searchDatabase(q, { limit: Math.min(parseInt(limit, 10) || 8, 25) });
    const topStock = results.stocks?.[0];
    const topFund = results.funds?.[0];
    const topAmc = results.amcs?.[0];
    const top = topStock
      ? { name: topStock.name, type: 'stock', route: `/stock/${topStock.id}` }
      : topFund
      ? { name: topFund.name, type: 'fund', route: `/fund/${topFund.id}` }
      : topAmc
      ? { name: topAmc.name, type: 'amc', route: `/amcs` }
      : null;
    logSearchQuery(q, top);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Trending searches: aggregated from today's /api/search queries ─────────
app.get('/api/trending', async (req, res) => {
  try {
    const db = await readDB();
    const limit = Math.min(parseInt(req.query.limit, 10) || 4, 10);
    const bucket = db.trending[todayKey()] || {};
    const top = Object.values(bucket).sort((a, b) => b.count - a.count).slice(0, limit);
    res.json({ trending: top, date: todayKey() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Currency FX rates (Yahoo FX pairs primary, Alpha Vantage fallback) ─────
const SUPPORTED_CURRENCIES = ['INR', 'USD', 'AED', 'GBP', 'EUR', 'SAR', 'KWD'];
let fxCache = { fetchedAt: 0, rates: {} };
const FX_CACHE_MS = 30 * 60 * 1000; // 30 min

async function getFxRates() {
  const isStale = Date.now() - fxCache.fetchedAt > FX_CACHE_MS;
  if (!isStale && Object.keys(fxCache.rates).length > 0) return fxCache;

  // Rates are expressed as 1 INR -> target currency
  const rates = { INR: 1 };
  const targets = SUPPORTED_CURRENCIES.filter(c => c !== 'INR');

  const settled = await Promise.allSettled(
    targets.map(c => yfQuoteRaw(`INR${c}=X`))
  );
  settled.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value.currentPrice) {
      rates[targets[i]] = r.value.currentPrice;
    }
  });

  // Cross-compute via USD for currencies Yahoo has no direct INR pair for (e.g. SAR, KWD)
  let missing = targets.filter(c => !rates[c]);
  if (missing.length > 0) {
    try {
      const usdInr = await yfQuoteRaw('USDINR=X');
      const crossSettled = await Promise.allSettled(missing.map(c => yfQuoteRaw(`USD${c}=X`)));
      crossSettled.forEach((r, i) => {
        if (r.status === 'fulfilled' && r.value.currentPrice && usdInr.currentPrice) {
          rates[missing[i]] = r.value.currentPrice / usdInr.currentPrice;
        }
      });
    } catch { /* leave missing */ }
  }

  // Alpha Vantage fallback for any currency still unresolved
  missing = targets.filter(c => !rates[c]);
  if (missing.length > 0 && ALPHAVANTAGE_KEY) {
    for (const c of missing) {
      try {
        const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=INR&to_currency=${c}&apikey=${ALPHAVANTAGE_KEY}`;
        const res = await fetch(url);
        const json = await res.json();
        const rate = parseFloat(json['Realtime Currency Exchange Rate']?.['5. Exchange Rate']);
        if (rate) rates[c] = rate;
      } catch { /* leave missing */ }
    }
  }

  fxCache = { fetchedAt: Date.now(), rates };
  console.log(`  💱 FX rates refreshed: ${Object.keys(rates).join(', ')}`);
  return fxCache;
}

app.get('/api/fx-rates', async (req, res) => {
  try {
    const { rates, fetchedAt } = await getFxRates();
    res.json({ base: 'INR', rates, fetchedAt: new Date(fetchedAt).toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Live financial news ─────────────────────────────────────────────────────
app.get('/api/news', async (req, res) => {
  try {
    const { articles, fetchedAt } = await getTopNews();
    res.json({ articles, count: articles.length, fetchedAt: new Date(fetchedAt).toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/read-article', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'url is required' });
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' } });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    const doc = new JSDOM(html, { url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();
    res.json({ article });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat', async (req, res) => {
  const body = req.body || {};
  const rawMessages = body.messages ?? body.conversation ?? null;
  const singleMessage = typeof body.message === 'string' ? [{ role: 'user', content: body.message }] : null;
  const messages = rawMessages || singleMessage;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }
  if (AI_PROVIDERS.length === 0) {
    return res.status(503).json({ error: 'AI service is unavailable', detail: 'No API keys configured' });
  }

  const apiMessages = [{ role: 'system', content: APP_CONTEXT }, ...messages];
  console.log(`\n📨 "${messages.at(-1)?.content?.slice(0, 60)}..."`);

  try {
    const reply = await runAgentLoop(apiMessages);
    res.json({ reply, model: 'fallback', provider: 'fallback' });
  } catch (err) {
    console.error('❌', err.message);
    res.status(500).json({ error: 'Stockbuzz AI error', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅  Stockbuzz AI Backend ready at http://localhost:${PORT}`);
  console.log(`   Providers: ${AI_PROVIDERS.map(p => p.name).join(', ')}`);
  console.log(`   API Key: ${AI_PROVIDERS.length > 0 ? '✓ Loaded' : '✗ MISSING'}`);
  console.log(`   Data   : Yahoo Finance v8 chart API, NSE/BSE/NASDAQ/NYSE listings, AMFI NAV feed, Google News RSS`);
  console.log(`   Tools  : search_ticker | get_stock_data | get_market_overview | get_financial_news`);
  console.log(`   Routes : /api/search | /api/company/:id | /api/mutual-fund/:id | /api/amcs | /api/schemes | /api/companies | /api/news\n`);
  scheduleIndexRefresh();
});
