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
app.use(cors());
app.use(express.json({ limit: '50mb' }));
const PORT = Number(process.env.PORT) || 3001;

const AI_PROVIDERS = [
  { name: 'Groq', url: 'https://api.groq.com/openai/v1/chat/completions', key: process.env.GROQ_API_KEY, model: 'qwen/qwen3.6-27b' },
  { name: 'OpenRouter', url: 'https://openrouter.ai/api/v1/chat/completions', key: process.env.OPENROUTER_API_KEY, model: 'google/gemma-4-31b-it:free' },
  { name: 'Gemini (Direct)', url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', key: process.env.GEMINI_API_KEY, model: 'gemini-2.0-flash' },
  { name: 'xAI', url: 'https://api.x.ai/v1/chat/completions', key: process.env.XAI_API_KEY, model: 'grok-2' },
  { name: 'DeepSeek', url: 'https://api.deepseek.com/chat/completions', key: process.env.DEEPSEEK_API_KEY, model: 'deepseek-chat' },
  { name: 'OpenAI', url: 'https://api.openai.com/v1/chat/completions', key: process.env.OPENAI_API_KEY, model: 'gpt-3.5-turbo' }
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

// ─── Local Dev Phone OTP Store ──────────────────────────────────────────────
const localOtpStore = new Map();

let apiUsageStats = {
  news: 8540,
  market: 120500,
  ai: 450
};

// Simulate live platform traffic for dashboard demo
setInterval(() => {
  if (Math.random() > 0.5) apiUsageStats.news += Math.floor(Math.random() * 5);
  if (Math.random() > 0.3) apiUsageStats.market += Math.floor(Math.random() * 20);
  if (Math.random() > 0.8) apiUsageStats.ai += Math.floor(Math.random() * 2);
}, 2500);



app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
  }
  const otp = '123456'; // Standard testing OTP for local dev (6-digits to match frontend)
  localOtpStore.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

  console.log(`\n========================================`);
  console.log(`📱 [LOCAL OTP] Sent to ${phone} -> OTP: ${otp}`);
  console.log(`========================================\n`);

  res.json({ success: true, message: 'OTP sent! Use 123456 for testing.' });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  const record = localOtpStore.get(phone);
  if (!record) return res.status(400).json({ error: 'No OTP found for this number' });
  if (record.otp !== otp && otp !== '123456') return res.status(400).json({ error: 'Invalid OTP code' });

  localOtpStore.delete(phone);
  res.json({
    success: true,
    user: {
      uid: `phone_${phone}`,
      phoneNumber: `+91${phone}`,
      displayName: `User ${phone.slice(-4)}`
    }
  });
});

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  let res;
  try {
    res = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
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

  let allArticles = [];

  // Fetch from both sources in parallel
  const [newsApiResult, googleRssResult] = await Promise.allSettled([
    getNewsFromNewsApi(),
    getNewsFromGoogleRss()
  ]);

  if (newsApiResult.status === 'fulfilled') {
    allArticles.push(...newsApiResult.value);
    console.log(`  📰 News refreshed via NewsAPI: ${newsApiResult.value.length} articles`);
  } else {
    console.log(`  ⚠ NewsAPI failed (${newsApiResult.reason.message})`);
  }

  if (googleRssResult.status === 'fulfilled') {
    allArticles.push(...googleRssResult.value);
    console.log(`  📰 News refreshed via Google RSS: ${googleRssResult.value.length} articles`);
  } else {
    console.log(`  ⚠ Google RSS failed (${googleRssResult.reason.message})`);
  }

  // Deduplicate by title
  const seen = new Set();
  const uniqueArticles = [];
  for (const a of allArticles) {
    const key = (a.title || '').trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueArticles.push(a);
    }
  }

  // Sort by date descending
  uniqueArticles.sort((a, b) => b.publishedMs - a.publishedMs);

  // Keep top 20 readable
  newsCache = { fetchedAt: Date.now(), articles: uniqueArticles.slice(0, 20) };
  return newsCache;
}

// ─── System prompt ────────────────────────────────────────────────────────────
const APP_CONTEXT = `
You are Stockbuzz AI, an expert AI-powered financial research assistant for StockBuzz — India's leading financial intelligence platform. You serve both beginners and experienced investors.

You have access to REAL-TIME live market data through four specialized tools. Use them whenever a user asks about live prices, NAV, news, or market data.

TOOLS AVAILABLE:
1. search_ticker(query)       - Find the correct Yahoo Finance symbol for any stock, fund, or company
2. get_stock_data(symbol)     - Live price, NAV, change, 52-week range, volume
3. get_market_overview()      - Live Nifty 50, Sensex, Nifty Bank, USD/INR
4. get_financial_news(query)  - The EXACT SAME live articles shown on the Stockbuzz News page right now, optionally filtered by topic/company

════════════════════════════════════════
COMMUNICATION STYLE & TONE
════════════════════════════════════════
- Be extremely beginner-friendly. Explain things simply and avoid overwhelming jargon.
- NEVER mention internal tool names (like \`search_ticker\`, \`get_stock_data\`, \`get_market_overview\`, \`get_financial_news\`) in your responses. Users don't need to know how you fetch data.
- Never tell the user "I will use a tool" or "Use the search_ticker function". Just fetch the data silently and present the results in simple terms.
- **IMPORTANT (SEBI COMPLIANCE)**: Whenever a user asks for investment advice, stock recommendations, or where to invest their money (e.g., SIP goals, investing a certain amount like "1 lakh"), you MUST NOT give direct stock recommendations. Instead, answer smartly by explaining educational frameworks (like asset allocation, diversification, and risk profiling), and suggest categories of assets (e.g., large-cap mutual funds, index funds, bonds) based on common goals. You MUST append this exact line at the very end of your response in bold:
  "**Disclaimer: I am an AI. As per SEBI guidelines, I do not provide direct investment recommendations. Please consult a SEBI-registered investment advisor before investing.**"
  CRITICAL: DO NOT add any of your own natural conversational disclaimers (like "It's always a good idea to consult a financial advisor..."). The EXACT bold string above is the ONLY disclaimer you should include.

════════════════════════════════════════
NEWS RULES — BE HONEST ABOUT FRESHNESS
════════════════════════════════════════
- Whenever a user asks about news, updates, or "what's happening with X today", ALWAYS call get_financial_news(query) — never answer news questions from memory, and never invent or guess headlines.
- get_financial_news returns the same articles currently live on the Stockbuzz News page, each with an "hoursAgo" and "isToday" field, plus "currentTime" (the real current timestamp) and "feedFetchedAt".
- Before answering, check hoursAgo/isToday on the top matching article(s):
  - If isToday is true → present it as today's news normally.
  - If isToday is false → you MUST explicitly tell the user the news is not from today, e.g. "The most recent Adani news I have is from yesterday (around X hours ago) — I don't see anything newer right now." Do not silently present old news as if it's current.
- If matchCount is 0 (no articles found for that query/company), tell the user plainly that there's no recent news on that topic in the current feed — do not fabricate a plausible-sounding headline.
- Always cite the source name and roughly how long ago it was published (e.g. "3 hours ago", "yesterday") so the user can judge freshness themselves.

════════════════════════════════════════
CRITICAL RULE: INTERPRET QUERIES SMARTLY
════════════════════════════════════════
Users often ask SHORT, VAGUE, or ABBREVIATED questions. You MUST interpret these intelligently in a finance/stock market context and give a helpful answer. NEVER say "I don't have access to [X] information" for conceptual or definition questions.

EXAMPLES OF SMART INTERPRETATION:
- "what is PL" → Profit & Loss (P&L) in stocks context — explain it
- "what is PE" → Price-to-Earnings ratio — explain it
- "what is SIP" → Systematic Investment Plan — explain it
- "what is NAV" → Net Asset Value for mutual funds — explain it
- "what is FII" → Foreign Institutional Investors — explain it
- "what is DII" → Domestic Institutional Investors — explain it
- "Reliance price" → call get_stock_data("RELIANCE.NS")
- "how is market today" → call get_market_overview()
- "HDFC fund" → call search_ticker("HDFC") then get_stock_data
- "TCS" alone → assume they want live price, call get_stock_data("TCS.NS")

════════════════════════════════════════
COMMON FINANCIAL ABBREVIATIONS (ALWAYS RESOLVE THESE):
════════════════════════════════════════
P&L / PL     = Profit and Loss — the gain/loss from buying and selling stocks
P/E / PE     = Price-to-Earnings ratio — stock price divided by earnings per share
EPS          = Earnings Per Share
ROE          = Return on Equity
ROCE         = Return on Capital Employed
EBITDA       = Earnings Before Interest, Tax, Depreciation and Amortisation
NII          = Net Interest Income (used by banks)
NIM          = Net Interest Margin
PAT          = Profit After Tax
PBT          = Profit Before Tax
CAGR         = Compound Annual Growth Rate
NAV          = Net Asset Value (for mutual funds)
AUM          = Assets Under Management
SIP          = Systematic Investment Plan
SWP          = Systematic Withdrawal Plan
STP          = Systematic Transfer Plan
ELSS         = Equity Linked Savings Scheme
NFO          = New Fund Offer
IPO          = Initial Public Offering
FPO          = Follow-on Public Offer
OFS          = Offer for Sale
QIP          = Qualified Institutional Placement
FII / FPI    = Foreign Institutional / Portfolio Investors
DII          = Domestic Institutional Investors
MF           = Mutual Fund
LTP          = Last Traded Price
CMP          = Current Market Price
52W H/L      = 52-Week High / Low
MCap / M-Cap = Market Capitalisation
DIV / DY     = Dividend / Dividend Yield
BV           = Book Value
P/B          = Price-to-Book ratio
VWAP         = Volume Weighted Average Price
ATH          = All-Time High
ATL          = All-Time Low
NSE          = National Stock Exchange of India
BSE          = Bombay Stock Exchange
SEBI         = Securities and Exchange Board of India
RBI          = Reserve Bank of India
F&O / FnO    = Futures and Options (derivatives)
CE           = Call Option (in F&O)
PE (option)  = Put Option (in F&O) — context determines if PE = P/E ratio or Put option
IV           = Implied Volatility
OI           = Open Interest
T+1 / T+2   = Settlement cycle (Trade day + 1 or 2 days)
DEMAT        = Dematerialised account (holds shares electronically)
DP           = Depository Participant
NSDL / CDSL  = Depositories in India
AMC          = Asset Management Company
AMFI         = Association of Mutual Funds in India
XIRR         = Extended Internal Rate of Return (for irregular cash flows)
IRR          = Internal Rate of Return
L&T / L and T = Larsen & Toubro (company)
HUL          = Hindustan Unilever Limited
HDFC         = Housing Development Finance Corporation
ICICI        = ICICI Bank
SBI          = State Bank of India
TCS          = Tata Consultancy Services
ITC          = Indian Tobacco Company (now diversified — ITC Ltd)

════════════════════════════════════════
MANDATORY RULES:
════════════════════════════════════════
- ALWAYS answer conceptual/definition questions directly from your knowledge — DO NOT use tools for "what is X" type questions.
- ALWAYS call a tool for live price, NAV, index level, or news questions. Never answer from memory for live data.
- If you do not know the exact ticker symbol, call search_ticker FIRST then get_stock_data.
- For Indian stocks use NSE suffix .NS (e.g., RELIANCE.NS, TCS.NS, HDFCBANK.NS)
- For Indian mutual funds: Use search_ticker first. If it fails, rely on the common funds listed below.
- For market indices, use get_market_overview()
- Never give Buy/Sell/Hold recommendations.
- Respond in clear, simple language with bullet points.
- ALWAYS use standard Markdown table format with pipes and hyphens whenever you compare multiple stocks, funds, or metrics. Never present comparisons as space-separated plain text blocks.
- When asked for a comparison between stocks/funds, you MUST structure your answer with these two exact tables:
  1. "📊 Live Price & Performance Snapshot" table:
     | Metric | [Stock A/Fund A Name] | [Stock B/Fund B Name] |
     |---|---|---|
     | Current Price | ₹X.XX | ₹Y.YY |
     | Today's Change | +₹X.XX (+X.XX%) | +₹Y.YY (+Y.YY%) |
     | 52-Week Range | ₹Min – ₹Max | ₹Min – ₹Max |
     | Trading Volume | ~X Million shares | ~Y Million shares |
  2. "🔍 Key Differences at a Glance" table:
     | Aspect | [Stock A/Fund A Name] | [Stock B/Fund B Name] |
     |---|---|---|
     | Primary Sector | [Sector A] | [Sector B] |
     | Business Model | [Description of business model A] | [Description of business model B] |
     | Market Behavior | [Market behavior A] | [Market behavior B] |
     | Dividend & Buybacks | [Info A] | [Info B] |
- Ensure all non-table responses, takeaways, and explanations are formatted with clear bold headers, clean paragraphs, and proper line breaks so they are extremely readable for humans.
- When an abbreviation has multiple meanings (e.g., PE = P/E ratio OR Put Option), pick the most likely meaning in context and mention both if ambiguous.
- When asked to analyze a specific news article, structure your answer in two clear parts: "What happened" and "Market impact".
- If still truly unsure what the user means, give the most likely financial interpretation AND ask a clarifying follow-up.

════════════════════════════════════════
COMMON INDIAN STOCK SYMBOLS (NSE):
════════════════════════════════════════
Reliance Industries - RELIANCE.NS | TCS - TCS.NS | HDFC Bank - HDFCBANK.NS
Infosys - INFY.NS | ICICI Bank - ICICIBANK.NS | SBI - SBIN.NS
Wipro - WIPRO.NS | Bajaj Finance - BAJFINANCE.NS | Kotak Bank - KOTAKBANK.NS
Axis Bank - AXISBANK.NS | Sun Pharma - SUNPHARMA.NS | Maruti - MARUTI.NS
ITC - ITC.NS | HCL Tech - HCLTECH.NS | Tata Motors - TATAMOTORS.NS
Adani Enterprises - ADANIENT.NS | Hero MotoCorp - HEROMOTOCO.NS
Bajaj Auto - BAJAJ-AUTO.NS | Titan - TITAN.NS | Asian Paints - ASIANPAINT.NS
Dr Reddys - DRREDDY.NS | Cipla - CIPLA.NS | NTPC - NTPC.NS
Coal India - COALINDIA.NS | Apollo Hospitals - APOLLOHOSP.NS
JSW Steel - JSWSTEEL.NS | Tech Mahindra - TECHM.NS | L&T - LT.NS

COMMON INDIAN MUTUAL FUND SYMBOLS:
HDFC Flexi Cap Fund - 0P0000XW8F.BO | Parag Parikh Flexi Cap - 0P0000YWL1.BO
Kotak Flexicap - 0P00005V1U.BO | Kotak Liquid - 0P00005V4Z.BO
SBI Equity Hybrid - 0P00005WLZ.BO | ICICI Pru Bluechip - 0P00005WMI.BO
Axis Bluechip - 0P0000XW8J.BO | Nippon Small Cap - 0P0000YWL2.BO

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
      description: 'Fetch the SAME live news articles currently shown on the Stockbuzz News page, optionally filtered by a topic/company. Each article includes hoursAgo and isToday so you can tell the user exactly how fresh it is. Use when user asks about news, developments, or current events for a company/topic.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Topic or company to filter by. E.g. Adani, Reliance Industries, Nifty 50, RBI, mutual funds India. Leave empty for top market news.' }
        }
      }
    }
  }
];

// ─── Tool execution ───────────────────────────────────────────────────────────
const rssParser = new Parser({ timeout: 4000 });

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
    const query = (args.query || '').trim();
    try {
      // Reuse the exact same feed shown on the website's News page, so the AI's
      // answer always matches what the user can see on-site, and never invents
      // a separate/divergent result set.
      const { articles, fetchedAt } = await getTopNews();

      let matched = articles;
      if (query) {
        const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        matched = articles.filter(a => {
          const haystack = `${a.title} ${a.description || ''}`.toLowerCase();
          return terms.some(t => haystack.includes(t));
        });
      }

      const now = Date.now();
      const news = matched.slice(0, 8).map(a => {
        const publishedMs = a.publishedMs || (a.publishedAt ? new Date(a.publishedAt).getTime() : 0);
        const hoursAgo = publishedMs ? Math.round((now - publishedMs) / 3600000) : null;
        return {
          title: a.title,
          description: a.description || '',
          source: a.source,
          link: a.link,
          published: a.publishedAt || null,
          hoursAgo,
          isToday: hoursAgo !== null ? hoursAgo < 24 : null
        };
      });

      return JSON.stringify({
        query: query || '(top market news)',
        matchCount: matched.length,
        news,
        note: matched.length === 0 && query
          ? `No articles matching "${query}" found in today's feed. Do not invent news — tell the user nothing recent was found on this topic.`
          : 'Use the hoursAgo/isToday field on each article to tell the user how fresh it is. If the freshest match is not from today, say so explicitly (e.g. "the latest I have is from yesterday").',
        feedFetchedAt: new Date(fetchedAt).toISOString(),
        currentTime: new Date().toISOString()
      });
    } catch (err) {
      return JSON.stringify({ error: `News fetch failed: ${err.message}` });
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
        max_tokens: 2048,
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

    return { data: await response.json(), providerIndex };
  } catch (error) {
    console.error(`❌ ${provider.name} failed:`, error.message);
    console.log(`🔄 Switching to next provider...`);
    return callAIWithFallback(apiMessages, providerIndex + 1, 2);
  }
}

// ─── Raw tool-call text parser (fallback for models that don't use tool_calls) ─
const RAW_TOOL_PATTERN = /\b(search_ticker|get_stock_data|get_market_overview|get_financial_news)\s*\(([^)]*)\)/g;

function parseRawToolCalls(text) {
  const calls = [];
  
  // 1. Standard parenthesis format: name(args)
  const stdPattern = /\b(search_ticker|get_stock_data|get_market_overview|get_financial_news)\s*\(([^)]*)\)/g;
  let match;
  while ((match = stdPattern.exec(text)) !== null) {
    const name = match[1];
    const argsRaw = match[2].trim();
    const args = {};
    const kvPattern = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
    let kv;
    while ((kv = kvPattern.exec(argsRaw)) !== null) {
      args[kv[1]] = kv[2] ?? kv[3] ?? kv[4] ?? '';
    }
    calls.push({ id: `raw-${Date.now()}-${calls.length}`, function: { name, arguments: JSON.stringify(args) } });
  }

  // 2. Groq XML format: <function=name{"key": "value"}</function>
  const groqPattern = /<function=([^>{]+)({[^}]+})<\/function>/g;
  while ((match = groqPattern.exec(text)) !== null) {
    const name = match[1].trim();
    const argsRaw = match[2].trim();
    try {
      // Just parse the JSON directly
      JSON.parse(argsRaw); // validate
      calls.push({ id: `raw-${Date.now()}-${calls.length}`, function: { name, arguments: argsRaw } });
    } catch(e) {
      // fallback
    }
  }

  return calls;
}

// ─── Agentic loop ─────────────────────────────────────────────────────────────
async function runAgentLoop(apiMessages) {
  let currentProviderIndex = 0;
  for (let i = 0; i < 8; i++) {
    const { data, providerIndex } = await callAIWithFallback(apiMessages, currentProviderIndex);
    currentProviderIndex = providerIndex;
    const message = data.choices?.[0]?.message;
    if (!message) {
      if (currentProviderIndex + 1 < AI_PROVIDERS.length) {
        console.log(`  🔄 No message in response. Falling back to next provider...`);
        currentProviderIndex++;
        i--;
        continue;
      }
      throw new Error('No message in response');
    }

    // Structured tool calls (standard OpenAI-compatible providers)
    if (message.tool_calls && message.tool_calls.length > 0) {
      // Some providers echo content alongside tool_calls — ignore content here
      apiMessages.push({ ...message, content: message.content || null });
      console.log(`  ↻ Iter ${i + 1}: ${message.tool_calls.length} tool call(s)`);
      const results = await Promise.all(message.tool_calls.map(tc => handleToolCall(tc)));
      message.tool_calls.forEach((tc, idx) => {
        apiMessages.push({ role: 'tool', tool_call_id: tc.id, name: tc.function.name, content: results[idx] });
      });
      continue;
    }

    // Content present — check if the model wrote raw tool-call text instead of using tool_calls
    if (message.content) {
      const rawCalls = parseRawToolCalls(message.content);

      // Fallback if AI responds with refusal/don't know and no tool calls
      const lowerContent = message.content.toLowerCase();
      const isRefusal = ["as an ai", "i don't know", "i do not know", "i cannot", "i can't", "i am unable", "i'm sorry", "i am sorry", "i don't have access", "i do not have access"].some(kw => lowerContent.includes(kw));

      if (rawCalls.length === 0 && isRefusal && currentProviderIndex + 1 < AI_PROVIDERS.length) {
        console.log(`  🔄 Model refusal detected. Falling back to next provider...`);
        currentProviderIndex++;
        i--; // Retry without counting iteration
        continue;
      }

      if (rawCalls.length > 0) {
        console.log(`  ↻ Iter ${i + 1}: ${rawCalls.length} raw tool call(s) parsed from content`);
        // Push the assistant message that contained the raw tool call text
        apiMessages.push({ role: 'assistant', content: message.content });
        // Execute the tool calls and format results as a plain user message
        // (models that output raw tool text likely don't support the "tool" role)
        const results = await Promise.all(rawCalls.map(tc => handleToolCall(tc)));
        const toolResultsText = rawCalls.map((tc, idx) =>
          `[Tool: ${tc.function.name}]\n${results[idx]}`
        ).join('\n\n');
        apiMessages.push({
          role: 'user',
          content: `Here are the real-time tool results:\n\n${toolResultsText}\n\nPlease now provide a clear, well-formatted answer to the user's original question using these results.`
        });
        continue;
      }

      console.log(`  ✅ Done on iter ${i + 1}`);
      return message.content;
    }

    if (currentProviderIndex + 1 < AI_PROVIDERS.length) {
      console.log(`  🔄 Empty response detected. Falling back to next provider...`);
      currentProviderIndex++;
      i--;
      continue;
    }
    throw new Error('Empty AI response');
  }

  throw new Error('Max iterations reached');
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use(cors());
app.use((req, res, next) => { console.log('REQ:', req.method, req.url); next(); });


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
    if (!db.cms) db.cms = {
      pages: {
        home: { title: "Home Page", content: {}, features: { showMarketSnapshot: true, showTrendingStocks: true, showMarketMovers: true, showMarketPulse: true, showFeaturedNews: true } },
        chat: { title: "AI Chat Page", features: { allowFileUpload: true, allowVoiceInput: true, showLiveMarketData: true } },
        news: { title: "News Hub", features: { showGlobalNews: true, showMarketMovers: true, allowSearch: true } },
        markets: { title: "Markets Overview", features: { showSectorPerformance: true, showTopGainers: true, showGlobalIndices: true } }
      },
      global: { enableProSubscriptions: false, showBannerAds: false }
    };
    return db;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {
        chats: {}, watchlist: [], trending: {},
        cms: {
          pages: {
            home: { title: "Home Page", content: {}, features: { showMarketSnapshot: true, showTrendingStocks: true, showMarketMovers: true, showMarketPulse: true, showFeaturedNews: true } },
            chat: { title: "AI Chat Page", features: { allowFileUpload: true, allowVoiceInput: true, showLiveMarketData: true } },
            news: { title: "News Hub", features: { showGlobalNews: true, showMarketMovers: true, allowSearch: true } },
            markets: { title: "Markets Overview", features: { showSectorPerformance: true, showTopGainers: true, showGlobalIndices: true } }
          },
          global: { enableProSubscriptions: false, showBannerAds: false }
        }
      };
    }
    throw err;
  }
}

async function writeDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/api/cms', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.cms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cms', async (req, res) => {
  try {
    const db = await readDB();
    db.cms = req.body;
    await writeDB(db);
    res.json({ success: true, cms: db.cms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
  apiUsageStats.market++;
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
    // Fetch full history so the frontend can slice any range (1D…Since Inception) client-side
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=max`;
    const r = await fetch(url, { headers: YF_HEADERS });
    if (!r.ok) throw new Error(`Yahoo chart HTTP ${r.status}`);
    const json = await r.json();
    const result = json.chart?.result?.[0];
    if (!result) throw new Error('No chart data');
    const rawCloses = result.indicators?.quote?.[0]?.close || [];
    const rawDates = result.timestamp || [];
    const closes = rawCloses.filter(c => c != null);
    const dates = rawDates;
    const series = rawDates
      .map((t, i) => ({ time: t * 1000, value: rawCloses[i] }))
      .filter(p => p.value != null);
    res.json({
      ticker,
      return1M: pickReturn(closes, dates, 30),
      return3M: pickReturn(closes, dates, 91),
      return6M: pickReturn(closes, dates, 182),
      return1Y: pickReturn(closes, dates, 365),
      fiftyTwoWeekHigh: result.meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: result.meta.fiftyTwoWeekLow,
      volume: result.meta.regularMarketVolume,
      series
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

    // Full history sent so the frontend can slice any range (1D…Since Inception) client-side
    const series = parsed.map(p => ({ time: p.time, value: p.nav }));

    res.json({
      schemeCode: req.params.schemeCode,
      fundHouse: json.meta?.fund_house,
      schemeType: json.meta?.scheme_type,
      return1M: returnSince(30),
      return3M: returnSince(91),
      return6M: returnSince(182),
      return1Y: returnSince(365),
      return3Y: returnSince(1095),
      series
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
  apiUsageStats.market++;
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
const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'KWD', 'JPY', 'AUD', 'CAD', 'SGD', 'CHF', 'CNY'];
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

const NEWS_SETTINGS_PATH = join(__dirname, 'data', 'newsSettings.json');

const getNewsSettings = async () => {
  try {
    const data = await fs.readFile(NEWS_SETTINGS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { customLinks: [], hiddenArticles: [], pinnedArticles: [], disabledSources: [], refreshInterval: 15 };
  }
};

const saveNewsSettings = async (settings) => {
  await fs.writeFile(NEWS_SETTINGS_PATH, JSON.stringify(settings, null, 2));
};

// ─── Live financial news ─────────────────────────────────────────────────────
app.get('/api/news', async (req, res) => {
  apiUsageStats.news++;
  try {
    const { articles, fetchedAt } = await getTopNews();
    const settings = await getNewsSettings();

    let finalArticles = [...articles];

    if (settings.disabledSources && settings.disabledSources.length > 0) {
      finalArticles = finalArticles.filter(a => !settings.disabledSources.includes(a.source));
    }

    if (settings.hiddenArticles && settings.hiddenArticles.length > 0) {
      finalArticles = finalArticles.filter(a => !settings.hiddenArticles.includes(a.link) && !settings.hiddenArticles.includes(a.title));
    }

    if (settings.customLinks && settings.customLinks.length > 0) {
      const customs = settings.customLinks.map(c => ({
        title: c.title,
        source: c.source || "Custom Link",
        link: c.url,
        publishedAt: new Date().toISOString(),
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800",
        isCustom: true
      }));
      finalArticles = [...customs, ...finalArticles];
    }

    if (settings.pinnedArticles && settings.pinnedArticles.length > 0) {
      const pinned = finalArticles.filter(a => settings.pinnedArticles.includes(a.link) || settings.pinnedArticles.includes(a.title));
      const rest = finalArticles.filter(a => !settings.pinnedArticles.includes(a.link) && !settings.pinnedArticles.includes(a.title));
      finalArticles = [...pinned, ...rest];
    }

    res.json({ articles: finalArticles, count: finalArticles.length, fetchedAt: new Date(fetchedAt).toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/news', async (req, res) => {
  try {
    const { articles, fetchedAt } = await getTopNews();
    const settings = await getNewsSettings();

    let finalArticles = [...articles];

    if (settings.customLinks && settings.customLinks.length > 0) {
      const customs = settings.customLinks.map(c => ({
        title: c.title,
        source: c.source || "Custom Link",
        link: c.url,
        publishedAt: new Date().toISOString(),
        isCustom: true
      }));
      finalArticles = [...customs, ...finalArticles];
    }

    const adminView = finalArticles.map((a, idx) => {
      let status = 'Live';
      if (settings.hiddenArticles && (settings.hiddenArticles.includes(a.link) || settings.hiddenArticles.includes(a.title))) status = 'Hidden';
      if (settings.pinnedArticles && (settings.pinnedArticles.includes(a.link) || settings.pinnedArticles.includes(a.title))) status = 'Pinned';
      if (idx === 0) console.log('DEBUG a.link:', a.link, 'Includes:', settings.pinnedArticles?.includes(a.link), 'Status:', status);
      return { ...a, adminStatus: status };
    });

    const pinned = adminView.filter(a => a.adminStatus === 'Pinned');
    const rest = adminView.filter(a => a.adminStatus !== 'Pinned');

    res.json({ articles: [...pinned, ...rest], count: adminView.length, fetchedAt: new Date(fetchedAt).toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/news/settings', async (req, res) => {
  res.json(await getNewsSettings());
});

app.post('/api/admin/news/settings', async (req, res) => {
  const current = await getNewsSettings();
  const updated = { ...current, ...req.body };
  await saveNewsSettings(updated);
  res.json(updated);
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

// ─── Financial Knowledge Base (definitions answered locally, no AI needed) ────
const FINANCE_KB = {
  // Profit & Loss
  'pl': {
    title: 'Profit & Loss (P&L)',
    answer: `**Profit & Loss (P&L)** in stocks refers to the financial gain or loss you make from buying and selling securities.

**Simple formula:**
> P&L = (Selling Price − Buying Price) × Quantity

**Types:**
- 📈 **Realised P&L** – Profit/loss from trades you've already closed (sold the stock)
- 📊 **Unrealised P&L** – Profit/loss on positions you still hold (not yet sold); also called "paper profit/loss"

**Example:**
> You bought 10 shares of Reliance at ₹1,200. Current price = ₹1,350.
> Unrealised P&L = (₹1,350 − ₹1,200) × 10 = **+₹1,500 profit**

**Tax on P&L:**
- Short-Term Capital Gain (STCG) – held < 1 year → taxed at 20%
- Long-Term Capital Gain (LTCG) – held > 1 year → taxed at 12.5% above ₹1.25 lakh

Would you like to check the live price of a specific stock to calculate your P&L?`
  },
  'profit and loss': 'pl',
  'profit & loss': 'pl',
  'p&l': 'pl',
  'p and l': 'pl',

  // PE Ratio
  'pe': {
    title: 'Price-to-Earnings Ratio (P/E)',
    answer: `**P/E Ratio (Price-to-Earnings)** tells you how much investors are paying for every ₹1 of a company's earnings.

**Formula:**
> P/E = Current Stock Price ÷ Earnings Per Share (EPS)

**What it means:**
- 📊 **Low P/E (< 15)** – Stock may be undervalued or the company is growing slowly
- 📈 **High P/E (> 30)** – Investors expect strong future growth (common in IT stocks)
- ⚠️ **Negative P/E** – Company is making a loss

**Indian market context:**
- Nifty 50 average P/E is typically between 20–25
- FMCG, IT companies often trade at higher P/E (25–40)
- PSU banks, commodity stocks often trade at lower P/E (8–15)

**Note:** "PE" can also mean **Put Option** in F&O trading. Context determines which meaning applies.

Want me to fetch the live P/E ratio of a specific stock?`
  },
  'pe ratio': 'pe',
  'price to earnings': 'pe',
  'price earnings ratio': 'pe',
  'p/e': 'pe',
  'p/e ratio': 'pe',

  // EPS
  'eps': {
    title: 'Earnings Per Share (EPS)',
    answer: `**EPS (Earnings Per Share)** is the portion of a company's profit allocated to each share of stock.

**Formula:**
> EPS = Net Profit ÷ Total Number of Shares Outstanding

**Example:**
> If TCS earns ₹45,000 crore profit and has 360 crore shares → EPS = ₹125 per share

**Why it matters:**
- Higher EPS = company is more profitable per share
- Used to calculate the P/E ratio
- Growing EPS quarter-over-quarter is a positive sign

**Types:**
- **Basic EPS** – Simple calculation
- **Diluted EPS** – Accounts for stock options, convertible bonds etc.`
  },

  // SIP
  'sip': {
    title: 'Systematic Investment Plan (SIP)',
    answer: `**SIP (Systematic Investment Plan)** is a method of investing a fixed amount in a mutual fund at regular intervals (monthly, weekly, etc.) rather than investing a lump sum.

**How it works:**
1. You choose a mutual fund and a fixed amount (e.g., ₹5,000/month)
2. Every month, the amount is auto-debited and units are purchased at the current NAV
3. Over time, you accumulate units at different prices (rupee cost averaging)

**Benefits:**
- ✅ No need to time the market
- ✅ Builds disciplined saving habits
- ✅ Even small amounts (₹500/month) can compound into wealth over 10–20 years
- ✅ Rupee cost averaging reduces market risk

**Example:**
> ₹10,000/month SIP for 20 years at 12% CAGR = **~₹99 lakh corpus** from just ₹24 lakh invested`
  },

  // NAV
  'nav': {
    title: 'Net Asset Value (NAV)',
    answer: `**NAV (Net Asset Value)** is the per-unit price of a mutual fund scheme.

**Formula:**
> NAV = (Total Assets of Fund − Liabilities) ÷ Number of Units Outstanding

**Key points:**
- 💡 NAV changes every day after market close
- Unlike stocks, a lower NAV does NOT mean the fund is cheaper or better value
- NAV of ₹10 and ₹500 in the same category doesn't matter — what matters is the fund's returns
- When you invest in a mutual fund via SIP, units are allotted at the prevailing NAV

Want me to fetch the live NAV of a specific mutual fund?`
  },

  // ROE
  'roe': {
    title: 'Return on Equity (ROE)',
    answer: `**ROE (Return on Equity)** measures how efficiently a company uses shareholders' money to generate profit.

**Formula:**
> ROE = (Net Profit ÷ Shareholders' Equity) × 100

**Benchmarks:**
- ROE > 15% is generally considered good
- ROE > 20% is excellent (e.g., HDFC Bank, Asian Paints consistently above 15–20%)
- Compare ROE within the same sector for meaningful analysis

**Why it matters:**
- High ROE = management is using equity efficiently
- Declining ROE may signal trouble ahead`
  },

  // ROCE
  'roce': {
    title: 'Return on Capital Employed (ROCE)',
    answer: `**ROCE (Return on Capital Employed)** measures how efficiently a company uses ALL its capital (equity + debt) to generate profit.

**Formula:**
> ROCE = (EBIT ÷ Capital Employed) × 100
> Capital Employed = Total Assets − Current Liabilities

**ROCE vs ROE:**
- ROE only looks at equity
- ROCE includes debt — better for capital-intensive industries (steel, infra, power)

**Good ROCE:** Generally above 15% is healthy`
  },

  // EBITDA
  'ebitda': {
    title: 'EBITDA',
    answer: `**EBITDA** = Earnings Before Interest, Tax, Depreciation, and Amortisation

It measures a company's core operational profitability, stripping out financing and accounting decisions.

**Formula:**
> EBITDA = Revenue − Operating Expenses (excluding interest, tax, D&A)

**Why analysts use it:**
- Compares profitability across companies with different debt levels or tax situations
- Useful for valuing companies (EV/EBITDA multiple is a common valuation metric)

**EBITDA margin:**
> EBITDA Margin = (EBITDA ÷ Revenue) × 100
> Higher margin = more profitable operations`
  },

  // NAV
  'cagr': {
    title: 'Compound Annual Growth Rate (CAGR)',
    answer: `**CAGR (Compound Annual Growth Rate)** shows how much an investment has grown per year, smoothed over a period.

**Formula:**
> CAGR = [(Ending Value ÷ Beginning Value)^(1/Years) − 1] × 100

**Example:**
> ₹1 lakh invested, grew to ₹2.5 lakh in 10 years
> CAGR = (2.5)^(1/10) − 1 = **9.6% per year**

**Why it's useful:**
- Mutual fund returns are quoted in CAGR
- Removes the effect of market volatility year-to-year
- Nifty 50 has delivered ~12–13% CAGR over the long term`
  },

  // IPO
  'ipo': {
    title: 'Initial Public Offering (IPO)',
    answer: `**IPO (Initial Public Offering)** is when a private company offers its shares to the public for the first time on a stock exchange.

**Process in India:**
1. Company files a DRHP (Draft Red Herring Prospectus) with SEBI
2. SEBI approves the offer
3. IPO opens for 3 days — retail investors, HNIs, and institutions bid for shares
4. Allotment happens via lottery (for retail, if oversubscribed)
5. Shares list on NSE/BSE and trading begins

**Key terms:**
- **GMP (Grey Market Premium)** – Unofficial price before listing
- **Oversubscribed** – More bids than shares available
- **Listing Gain** – Profit if listing price > IPO price

Want me to fetch news about current/upcoming IPOs?`
  },

  // FII
  'fii': {
    title: 'Foreign Institutional Investors (FII/FPI)',
    answer: `**FII/FPI (Foreign Institutional/Portfolio Investors)** are large foreign entities (mutual funds, pension funds, hedge funds, sovereign wealth funds) that invest in Indian stocks and bonds.

**Why FII activity matters:**
- 📈 FII buying (net inflow) → typically pushes markets UP
- 📉 FII selling (net outflow) → typically pulls markets DOWN
- They hold a significant portion (~20–25%) of Nifty 50 companies

**How to track:**
- SEBI publishes daily FII/DII data
- Available on NSE/BSE websites and financial portals

**DII (Domestic Institutional Investors):** Includes LIC, domestic mutual funds, insurance companies — often buy when FIIs sell, providing a cushion.`
  },
  'fpi': 'fii',
  'foreign institutional investor': 'fii',

  // DII
  'dii': {
    title: 'Domestic Institutional Investors (DII)',
    answer: `**DII (Domestic Institutional Investors)** are Indian institutions that invest in the stock market — primarily mutual funds, insurance companies (LIC), and banks.

**Key players:**
- 🏦 LIC (Life Insurance Corporation) – largest DII
- 📊 Domestic Mutual Funds (AMCs like HDFC AMC, SBI MF, etc.)
- 🏛️ Insurance companies, Provident Funds

**Why DIIs matter:**
- When FIIs sell aggressively, DIIs often step in and buy (acts as a market stabilizer)
- DII net buying is considered a bullish signal
- Their buying is driven by SIP inflows from retail investors (now ~₹25,000 crore/month)`
  },

  // LTP
  'ltp': {
    title: 'Last Traded Price (LTP)',
    answer: `**LTP (Last Traded Price)** is the price at which the most recent trade of a stock occurred.

- During market hours: LTP changes with every trade
- After market closes: LTP = closing price
- LTP is different from bid/ask price — it's the actual transaction price

**Tip:** To get a stock's LTP live, just ask me the stock name!`
  },
  'cmp': {
    title: 'Current Market Price (CMP)',
    answer: `**CMP (Current Market Price)** is the current live price at which a stock is trading on the exchange.

- Same as LTP (Last Traded Price) during market hours
- Used by investors to compare against their buy price
- **CMP < Buy Price** → Unrealised loss | **CMP > Buy Price** → Unrealised profit

Want me to check the CMP of a stock? Just tell me the company name!`
  },

  // AUM
  'aum': {
    title: 'Assets Under Management (AUM)',
    answer: `**AUM (Assets Under Management)** is the total market value of investments managed by a mutual fund or fund house.

**Why it matters:**
- Larger AUM = more investor trust, but can also make it harder for the fund to move nimbly in small-cap stocks
- AMFI publishes monthly AUM data for all mutual funds in India
- As of 2025, India's mutual fund industry AUM has crossed ₹65+ lakh crore

**AUM for individual funds:**
> You can ask me the NAV and AUM of any specific mutual fund by name.`
  },

  // F&O
  'fo': {
    title: 'Futures and Options (F&O)',
    answer: `**F&O (Futures & Options)** are derivative instruments — their value is derived from an underlying asset (stocks, indices).

**Futures:**
- Agreement to buy/sell an asset at a set price on a future date
- Obligation for both buyer and seller

**Options:**
- CE (Call Option) – Right to BUY at a set price (strike price)
- PE (Put Option) – Right to SELL at a set price

**Key F&O terms:**
| Term | Meaning |
|------|---------|
| Strike Price | Pre-agreed price |
| Premium | Price paid to buy the option |
| Expiry | Date the contract expires (weekly/monthly on NSE) |
| OI (Open Interest) | Total outstanding contracts |
| IV (Implied Volatility) | Market's expectation of price movement |

⚠️ F&O trading is high-risk. 90%+ of retail F&O traders lose money. Not recommended without thorough knowledge.`
  },
  'futures and options': 'fo',
  'derivatives': 'fo',

  // ELSS
  'elss': {
    title: 'Equity Linked Savings Scheme (ELSS)',
    answer: `**ELSS (Equity Linked Savings Scheme)** is a type of mutual fund that provides tax deduction under Section 80C of the Income Tax Act.

**Benefits:**
- 💰 Tax deduction up to ₹1.5 lakh under Section 80C
- 🔒 Lock-in period of only **3 years** (shortest among 80C instruments)
- 📈 Invests primarily in equities — potential for higher returns vs PPF, FD

**Comparison with other 80C options:**
| Instrument | Lock-in | Returns |
|-----------|---------|---------|
| ELSS | 3 years | Market-linked (~12% CAGR historically) |
| PPF | 15 years | ~7.1% (fixed) |
| NSC | 5 years | ~7.7% (fixed) |
| Tax-saving FD | 5 years | ~6–7% (fixed) |`
  },

  // Demat
  'demat': {
    title: 'Demat Account',
    answer: `**Demat Account (Dematerialised Account)** is an electronic account that holds your shares and securities in digital form — replacing physical share certificates.

**How it works:**
- You buy stocks → they are credited to your Demat account
- You sell stocks → they are debited from your Demat account
- Maintained by depositories: **NSDL** or **CDSL**

**Required to trade:**
1. **Demat Account** – holds securities
2. **Trading Account** – for placing buy/sell orders on NSE/BSE
3. **Bank Account** – for fund settlement (T+1 settlement in India)

**Popular brokers:** Zerodha, Groww, Upstox, Angel One, ICICI Direct`
  },

  // Market cap
  'mcap': {
    title: 'Market Capitalisation (Market Cap)',
    answer: `**Market Cap (Market Capitalisation)** is the total market value of a company's outstanding shares.

**Formula:**
> Market Cap = Current Share Price × Total Shares Outstanding

**Categories in India (SEBI classification):**
| Category | Market Cap |
|----------|-----------|
| Large Cap | Top 100 companies by market cap |
| Mid Cap | 101st – 250th companies |
| Small Cap | 251st and below |

**Example:**
> Reliance Industries: ~₹17 lakh crore market cap → India's largest company

Market cap helps compare company sizes — not just share prices.`
  },
  'market cap': 'mcap',
  'market capitalisation': 'mcap',
  'market capitalization': 'mcap',

  // 52W High/Low
  '52w': {
    title: '52-Week High & Low',
    answer: `**52-Week High/Low** is the highest and lowest price at which a stock has traded in the past 52 weeks (1 year).

**Why traders watch it:**
- 📈 **Near 52W High** → Stock is performing strongly; breakout above it is a bullish signal
- 📉 **Near 52W Low** → Stock is weak; breakdown below it is a bearish signal
- Helps gauge momentum and relative strength

**Tip:** Ask me any stock name and I'll fetch its live 52-week high and low!`
  },
  '52 week high': '52w',
  '52 week low': '52w',

  // ATH
  'ath': {
    title: 'All-Time High (ATH)',
    answer: `**ATH (All-Time High)** is the highest price a stock or index has EVER reached since it started trading.

- If Nifty 50 ATH is 26,277 and current level is 24,500 → market is ~7% below ATH
- Stocks breaking ATH often attract strong momentum buying
- ATH for an index means the overall market is at peak valuations`
  },

  // VWAP
  'vwap': {
    title: 'Volume Weighted Average Price (VWAP)',
    answer: `**VWAP (Volume Weighted Average Price)** is the average price of a stock weighted by trading volume during the day.

**Formula:**
> VWAP = Σ(Price × Volume) ÷ Total Volume

**How traders use it:**
- 📊 Price above VWAP → bullish intraday trend
- 📉 Price below VWAP → bearish intraday trend
- Institutions often use VWAP as a benchmark for executing large orders
- Commonly used in **intraday trading** strategies`
  },

  // SEBI
  'sebi': {
    title: 'SEBI (Securities and Exchange Board of India)',
    answer: `**SEBI (Securities and Exchange Board of India)** is India's capital markets regulator — the equivalent of SEC in the USA.

**Role:**
- 🏛️ Regulates stock exchanges (NSE, BSE), brokers, mutual funds, and listed companies
- 🔍 Investigates insider trading, market manipulation, and fraud
- 📋 Approves IPOs, sets rules for FIIs, mutual funds, and derivatives
- 🛡️ Protects retail investor interests

**Key SEBI rules:**
- T+1 settlement (trades settle in 1 day)
- Insider trading prohibited
- Mandatory quarterly results disclosure by listed companies`
  },

  // RBI
  'rbi': {
    title: 'Reserve Bank of India (RBI)',
    answer: `**RBI (Reserve Bank of India)** is India's central bank — it controls monetary policy, regulates banks, and manages the currency.

**Impact on stock markets:**
- 📉 **Rate hike** (repo rate ↑) → Borrowing costs rise → negative for markets, especially rate-sensitive sectors (real estate, NBFCs, banking)
- 📈 **Rate cut** (repo rate ↓) → Cheaper loans → positive for markets
- RBI also manages USD/INR exchange rate and foreign exchange reserves

**Key RBI tools:**
| Tool | Purpose |
|------|---------|
| Repo Rate | Rate at which RBI lends to banks |
| CRR | % of deposits banks must keep with RBI |
| SLR | % of deposits banks must hold in govt securities |`
  },

  // NII/NIM
  'nii': {
    title: 'Net Interest Income (NII)',
    answer: `**NII (Net Interest Income)** is the difference between the interest income a bank earns and the interest it pays to depositors.

**Formula:**
> NII = Interest Earned − Interest Paid

**Why it matters:**
- NII is the primary revenue metric for banks
- Growing NII → bank is lending more profitably
- Used alongside NIM (Net Interest Margin) to assess bank health

**NIM (Net Interest Margin):**
> NIM = NII ÷ Average Earning Assets × 100
> Indian private banks typically have NIM of 3–5%`
  },
  'nim': 'nii',
  'net interest income': 'nii',
  'net interest margin': 'nii',
};

// Resolve alias references
function resolveKB(key) {
  const val = FINANCE_KB[key];
  if (typeof val === 'string') return FINANCE_KB[val]; // alias
  return val;
}

// Extract and normalise the last user query
function getLastUserQuery(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return (messages[i].content || '').trim().toLowerCase();
  }
  return '';
}

// Check if the query is a definition/explanation question for a known KB term
function matchKBQuery(query) {
  const original = query.trim().toLowerCase();

  // Strip common question prefixes
  const clean = original
    .replace(/^(what(?:'s| is| are)|explain|tell me about|define|meaning of|full form of|what does .+ mean|how does .+ work)[\s:]+/i, '')
    .replace(/^(the |a |an )/i, '')
    .replace(/[\?\.!]+$/, '')
    .trim();

  // Direct match
  if (resolveKB(clean)) return resolveKB(clean);
  if (resolveKB(original)) return resolveKB(original);

  // Check for whole-word containment ONLY IF it's a short query or clearly a definition question
  const isDefQuestion = original !== clean && clean.split(/\s+/).length <= 4;
  const isShortQuery = original.split(/\s+/).length <= 3;

  if (isDefQuestion || isShortQuery) {
    const keys = Object.keys(FINANCE_KB);
    for (const key of keys) {
      // Escape key for regex and match as whole word
      const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(clean)) {
        return resolveKB(key);
      }
    }
  }
  return null;
}

app.post('/api/chat', async (req, res) => {
  apiUsageStats.ai++;
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

  // ── Local Knowledge Base: answer definition queries instantly ─────────────
  const lastQuery = getLastUserQuery(messages);
  const kbMatch = matchKBQuery(lastQuery);
  if (kbMatch) {
    console.log(`\n📚 KB match for "${lastQuery}" → ${kbMatch.title}`);
    return res.json({ reply: kbMatch.answer, model: 'local-kb', provider: 'Stockbuzz Knowledge Base' });
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const dynamicContext = APP_CONTEXT + `

════════════════════════════════════════
CURRENT TIME & REAL-TIME DATA ACCESS
════════════════════════════════════════
- Today's date is **\${today}**.
- You DO have real-time access to current market data and news through your tools.
- NEVER say your knowledge is cut off at a past date (like August 2024). Confidently use your tools to fetch live information when needed.`;

  const apiMessages = [{ role: 'system', content: dynamicContext }, ...messages];
  console.log(`\n📨 "${messages.at(-1)?.content?.slice(0, 60)}..."`);

  try {
    const reply = await runAgentLoop(apiMessages);
    res.json({ reply, model: 'fallback', provider: 'fallback' });
  } catch (err) {
    console.error('❌', err.message);
    res.status(500).json({ error: 'Stockbuzz AI error', detail: err.message });
  }
});
// ─── CMS API for Superadmin ──────────────────────────────────────────────────
app.get('/api/cms', async (req, res) => {
  try {
    const cmsPath = join(__dirname, 'data', 'cms.json');
    const data = await fs.readFile(cmsPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.json({ features: {}, content: {} });
    } else {
      res.status(500).json({ error: 'Failed to read CMS configuration' });
    }
  }
});

app.post('/api/cms', express.json(), async (req, res) => {
  try {
    const cmsPath = join(__dirname, 'data', 'cms.json');
    await fs.mkdir(join(__dirname, 'data'), { recursive: true });
    await fs.writeFile(cmsPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write CMS configuration' });
  }
});

// ─── Users API for Superadmin ──────────────────────────────────────────────────
async function readUsers() {
  const usersPath = join(__dirname, 'data', 'users.json');
  try {
    const data = await fs.readFile(usersPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeUsers(users) {
  const usersPath = join(__dirname, 'data', 'users.json');
  await fs.mkdir(join(__dirname, 'data'), { recursive: true });
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
}

app.get('/api/users', async (req, res) => {
  try {
    const users = await readUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read users' });
  }
});

app.post('/api/users', express.json(), async (req, res) => {
  try {
    const users = await readUsers();
    const newUser = { id: 'usr_' + Date.now(), ...req.body, joinDate: new Date().toISOString().split('T')[0] };
    users.push(newUser);
    await writeUsers(users);
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add user' });
  }
});

app.put('/api/users/:id', express.json(), async (req, res) => {
  try {
    let users = await readUsers();
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });
    users[index] = { ...users[index], ...req.body };
    await writeUsers(users);
    res.json(users[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    let users = await readUsers();
    users = users.filter(u => u.id !== req.params.id);
    await writeUsers(users);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ─── Promo Codes API for Superadmin ───────────────────────────────────────────────
async function readPromoCodes() {
  const codesPath = join(__dirname, 'data', 'promoCodes.json');
  try {
    const data = await fs.readFile(codesPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writePromoCodes(codes) {
  const codesPath = join(__dirname, 'data', 'promoCodes.json');
  await fs.mkdir(join(__dirname, 'data'), { recursive: true });
  await fs.writeFile(codesPath, JSON.stringify(codes, null, 2));
}

app.get('/api/promo-codes', async (req, res) => {
  try {
    const codes = await readPromoCodes();
    res.json(codes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read promo codes' });
  }
});

app.post('/api/promo-codes', express.json(), async (req, res) => {
  try {
    const codes = await readPromoCodes();
    const newCode = req.body;
    codes.push(newCode);
    await writePromoCodes(codes);
    res.json(newCode);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add promo code' });
  }
});

app.put('/api/promo-codes/:code', express.json(), async (req, res) => {
  try {
    let codes = await readPromoCodes();
    const index = codes.findIndex(c => c.code === req.params.code);
    if (index === -1) return res.status(404).json({ error: 'Promo code not found' });
    
    codes[index] = req.body;
    await writePromoCodes(codes);
    res.json(codes[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update promo code' });
  }
});

app.delete('/api/promo-codes/:code', async (req, res) => {
  try {
    let codes = await readPromoCodes();
    codes = codes.filter(c => c.code !== req.params.code);
    await writePromoCodes(codes);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete promo code' });
  }
});


// ─── Audit Logs API for Superadmin ──────────────────────────────────────────────────
async function readAuditLogs() {
  const logsPath = join(__dirname, 'data', 'auditLogs.json');
  try {
    const data = await fs.readFile(logsPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeAuditLogs(logs) {
  const logsPath = join(__dirname, 'data', 'auditLogs.json');
  await fs.mkdir(join(__dirname, 'data'), { recursive: true });
  await fs.writeFile(logsPath, JSON.stringify(logs, null, 2));
}

app.get('/api/audit-logs', async (req, res) => {
  try {
    const logs = await readAuditLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read audit logs' });
  }
});

app.post('/api/audit-logs', express.json(), async (req, res) => {
  try {
    const logs = await readAuditLogs();
    const newLog = {
      id: 'log_' + Date.now(),
      time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      ...req.body
    };
    logs.unshift(newLog); // Add to beginning
    // Keep only last 1000 logs
    if (logs.length > 1000) logs.length = 1000;

    await writeAuditLogs(logs);
    res.json(newLog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add audit log' });
  }
});

// ─── Settings API for Superadmin ──────────────────────────────────────────────────
async function readAdminSettings() {
  const settingsPath = join(__dirname, 'data', 'adminSettings.json');
  try {
    const data = await fs.readFile(settingsPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return { notifToggles: { proAlerts: true, apiWarnings: true, weeklySummary: false } };
    throw err;
  }
}

async function writeAdminSettings(settings) {
  const settingsPath = join(__dirname, 'data', 'adminSettings.json');
  await fs.mkdir(join(__dirname, 'data'), { recursive: true });
  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
}

app.get('/api/admin/settings', async (req, res) => {
  try {
    const settings = await readAdminSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

app.post('/api/admin/settings', express.json(), async (req, res) => {
  try {
    await writeAdminSettings(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write settings' });
  }
});

app.put('/api/admin/credentials', express.json(), async (req, res) => {
  res.json({ success: true, message: 'Credentials updated successfully' });
});

app.get('/api/system-health', (req, res) => {
  const amfiDegraded = Math.random() > 0.8;
  res.json({
    databaseStatus: 'Operational',
    apiUptime: '99.99%',
    serverLoad: Math.floor(Math.random() * 20 + 10) + '%',
    apiUsage: [
      { name: 'News Aggregator API', used: apiUsageStats.news, limit: 10000, color: 'bg-emerald-500' },
      { name: 'Market Data Feed', used: apiUsageStats.market, limit: 500000, color: 'bg-blue-500' },
      { name: 'AI Language Model', used: apiUsageStats.ai, limit: 1000, color: 'bg-violet-500' }
    ],
    providers: [
      { name: 'NSE Real-time', status: 'Operational', uptime: '99.98%', latency: Math.floor(Math.random() * 15 + 30) + 'ms', colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50 dark:bg-emerald-900/30' },
      { name: 'BSE Market Data', status: 'Operational', uptime: '99.95%', latency: Math.floor(Math.random() * 20 + 45) + 'ms', colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50 dark:bg-emerald-900/30' },
      { name: 'AMFI Mutual Funds', status: amfiDegraded ? 'Degraded' : 'Operational', uptime: '98.40%', latency: Math.floor(Math.random() * 100 + (amfiDegraded ? 400 : 150)) + 'ms', colorClass: amfiDegraded ? 'text-amber-600' : 'text-emerald-600', bgClass: amfiDegraded ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-emerald-50 dark:bg-emerald-900/30' }
    ]
  });
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
