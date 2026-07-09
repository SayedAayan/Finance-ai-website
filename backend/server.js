import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import Parser from 'rss-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// ─── Yahoo Finance v8 chart API ───────────────────────────────────────────────
// Uses browser User-Agent + chart endpoint — no auth/crumb needed
const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://finance.yahoo.com/',
  'Cache-Control': 'no-cache'
};

async function yfSearch(query) {
  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&enableFuzzyQuery=true`;
  const res = await fetch(url, { headers: YF_HEADERS });
  if (!res.ok) throw new Error(`Yahoo search HTTP ${res.status}`);
  const json = await res.json();
  return json.finance?.result?.[0]?.quotes || [];
}

async function yfQuote(symbol) {
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
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'
  };
}

// ─── System prompt ────────────────────────────────────────────────────────────
const APP_CONTEXT = `
You are FinPilot AI, an expert AI-powered financial research assistant for StockBuzz — India's leading financial intelligence platform.

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
- For Indian mutual funds: ALWAYS use search_ticker first
- For market indices, use get_market_overview()
- Never give Buy/Sell/Hold recommendations.
- Respond in clear, simple language with bullet points or tables.

COMMON INDIAN STOCK SYMBOLS (NSE):
Reliance Industries - RELIANCE.NS
Tata Consultancy Services - TCS.NS
HDFC Bank - HDFCBANK.NS
Infosys - INFY.NS
ICICI Bank - ICICIBANK.NS
State Bank of India - SBIN.NS
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
      const quotes = await yfSearch(args.query);
      const results = quotes.slice(0, 8).map(q => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        type: q.quoteType,
        exchange: q.exchange
      }));
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
      { symbol: '^NSEI',    label: 'Nifty 50' },
      { symbol: '^BSESN',   label: 'Sensex (BSE)' },
      { symbol: '^NSEBANK', label: 'Nifty Bank' },
      { symbol: '^CNXIT',   label: 'Nifty IT' },
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
    } catch (err) {
      return JSON.stringify({ error: `News fetch failed: ${err.message}` });
    }
  }

  return JSON.stringify({ error: `Unknown tool: ${name}` });
}

// ─── Agentic loop ─────────────────────────────────────────────────────────────
async function runAgentLoop(apiMessages) {
  for (let i = 0; i < 8; i++) {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: apiMessages,
        temperature: 0.1,
        max_tokens: 2048,
        tools,
        tool_choice: 'auto'
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API ${response.status}: ${err}`);
    }

    const data = await response.json();
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
  res.json({ status: 'ok', model: MODEL, apiKeyLoaded: !!GROQ_API_KEY });
});

app.post('/api/chat', async (req, res) => {
  const body = req.body || {};
  const rawMessages = body.messages ?? body.conversation ?? null;
  const singleMessage = typeof body.message === 'string' ? [{ role: 'user', content: body.message }] : null;
  const messages = rawMessages || singleMessage;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }
  if (!GROQ_API_KEY) {
    return res.status(503).json({ error: 'AI service is unavailable', detail: 'GROQ_API_KEY not configured' });
  }

  const apiMessages = [{ role: 'system', content: APP_CONTEXT }, ...messages];
  console.log(`\n📨 "${messages.at(-1)?.content?.slice(0, 60)}..."`);

  try {
    const reply = await runAgentLoop(apiMessages);
    res.json({ reply, model: MODEL, provider: 'groq' });
  } catch (err) {
    console.error('❌', err.message);
    res.status(500).json({ error: 'FinPilot AI error', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅  FinPilot AI Backend ready at http://localhost:${PORT}`);
  console.log(`   Model  : ${MODEL}`);
  console.log(`   API Key: ${GROQ_API_KEY ? '✓ Loaded' : '✗ MISSING'}`);
  console.log(`   Data   : Yahoo Finance v8 chart API`);
  console.log(`   Tools  : search_ticker | get_stock_data | get_market_overview | get_financial_news\n`);
});
