import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

const GROK_API_KEY = "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";
const GROK_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

const APP_CONTEXT = `You are FinPilot AI, a financial research assistant for StockBuzz — an Indian retail investor platform. You NEVER give buy/sell/hold advice. You explain financial concepts clearly and cite sources.

LIVE DATA (treat as source of truth):
- RELIANCE: ₹2,950.45 (+1.24%) | MCap ₹19.8T | P/E 28.5 | P/B 2.7 | ROE 9.8% | Div 0.35% | D/E 0.42
- TCS: ₹3,890.10 (-0.39%) | MCap ₹14.2T | P/E 30.2 | P/B 12.1 | ROE 47.2% | Div 1.85% | D/E 0.08
- HDFC Flexi Cap (Direct): NAV ₹1,642.50 | AUM ₹45,230 Cr | ER 0.85% | 1Y 32.5% | 3Y 21.2% | 5Y 18.5% | Bench 1Y 29.8%
- PPFAS Flexi Cap (Direct): NAV ₹74.85 | AUM ₹62,100 Cr | ER 0.65% | 1Y 30.1% | 3Y 22.8% | 5Y 20.4%

RULES:
1. Only use the data above. If data is missing, say so explicitly.
2. For any question about returns or predictions, add: "This is for research only, not investment advice."
3. Structure deep-dive responses as: Verified Facts → Analysis → Risks → Conclusion.
4. Be beginner-friendly by default.`;
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'FinPilot API server is running' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const apiMessages = [
    { role: 'system', content: APP_CONTEXT },
    ...messages
  ];

  try {
    const grokRes = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: apiMessages,
        temperature: 0.2
      })
    });

    if (!grokRes.ok) {
      const errText = await grokRes.text();
      console.error('Grok API error:', grokRes.status, errText);
      return res.status(grokRes.status).json({ error: `Grok API error: ${grokRes.status}`, detail: errText });
    }

    const data = await grokRes.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: 'No reply from Grok API' });
    }

    res.json({ reply });

  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Server error calling Grok API', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅  FinPilot AI Backend running at http://localhost:${PORT}`);
  console.log(`   POST /api/chat  — sends messages to Grok`);
  console.log(`   GET  /health    — health check\n`);
});
