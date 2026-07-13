import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import Parser from 'rss-parser';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
    return db;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { chats: {}, watchlist: [] };
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
  console.log(`   Data   : Yahoo Finance v8 chart API`);
  console.log(`   Tools  : search_ticker | get_stock_data | get_market_overview | get_financial_news\n`);
});
