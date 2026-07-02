import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, ArrowRight, BookOpen, AlertCircle, TrendingUp, BarChart2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = "http://localhost:3001/api/chat";

const APP_CONTEXT = `
You are FinPilot AI, powered by the Grok API from xAI.
Available Live Market Data in the StockBuzz Application (Treat this as the single source of truth):

STOCKS:
1. RELIANCE (Reliance Industries Ltd):
   - Price: ₹2,950.45 (Today's Change: +1.24%)
   - Market Cap: ₹19.8T
   - P/E Ratio: 28.5
   - P/B Ratio: 2.7
   - Div Yield: 0.35%
   - ROE: 9.8%
   - Debt/Equity: 0.42
   - Sector: Conglomerate

2. TCS (Tata Consultancy Services):
   - Price: ₹3,890.10 (Today's Change: -0.39%)
   - Market Cap: ₹14.2T
   - P/E Ratio: 30.2
   - P/B Ratio: 12.1
   - Div Yield: 1.85%
   - ROE: 47.2%
   - Debt/Equity: 0.08
   - Sector: IT Services

MUTUAL FUNDS:
3. HDFC Flexi Cap Fund:
   - NAV: ₹1,642.50 (Today's Change: +0.26%)
   - Plan: Direct Plan • Growth
   - Category: Flexi Cap
   - AUM: ₹45,230 Cr
   - Expense Ratio: 0.85%
   - Min SIP: ₹500
   - Exit Load: 1% within 1 year
   - Benchmark: NIFTY 500 TRI
   - Returns: 1Y (32.5%), 3Y (21.2%), 5Y (18.5%)
   - Benchmark Returns: 1Y (29.8%), 3Y (19.5%), 5Y (17.2%)
   - Fund Manager: Roshi Jain (since 2022)

4. Parag Parikh Flexi Cap Fund (PPFAS):
   - NAV: ₹74.85 (Today's Change: +0.20%)
   - Plan: Direct Plan • Growth
   - Category: Flexi Cap
   - AUM: ₹62,100 Cr
   - Expense Ratio: 0.65%
   - Exit Load: 2% within 1 year, 1% within 2 years
   - Benchmark: NIFTY 500 TRI
   - Returns: 1Y (30.1%), 3Y (22.8%), 5Y (20.4%)
   - Fund Manager: Rajeev Thakkar

System Rules:
1. Use ONLY the live market data, fundamentals, mutual fund data, and metrics provided above.
2. If the user asks about data not listed here, explicitly state what is missing instead of guessing or fabricating.
3. Adapt your explanations based on the user's apparent financial knowledge level (Beginner vs Advanced).
4. Separate your response clearly into sections: Verified Facts, Analysis, Risks, Opportunities, and Conclusion.
5. If the user asks for investment advice (e.g. "should I buy", "how much will I get"), explicitly state that you are a research assistant, not a SEBI-registered advisor, and cannot guarantee returns.
`;

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const q = typeof text === 'string' ? text : input;
    if (!q.trim()) return;

    // Add user message to UI
    const updatedMessages = [...messages, { id: Date.now(), type: 'user', text: q }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Build history array for backend
      const apiMessages = updatedMessages.map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `Backend Error: ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.reply;

      // Smart link detection
      let link = null;
      let linkText = null;
      const lower = q.toLowerCase();
      if (lower.includes('reliance')) {
        link = '/stock/RELIANCE';
        linkText = 'View Reliance Profile';
      } else if (lower.includes('tcs')) {
        link = '/stock/TCS';
        linkText = 'View TCS Profile';
      } else if (lower.includes('hdfc')) {
        link = '/fund/HDFC-FLEXI';
        linkText = 'View HDFC Flexi Cap Profile';
      } else if (lower.includes('parag') || lower.includes('ppfas')) {
        link = '/fund/PPFAS-FLEXI';
        linkText = 'View PPFAS Profile';
      } else if (lower.includes('compare') || lower.includes(' vs ')) {
        link = '/compare';
        linkText = 'Open Compare Tool';
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        text: aiText,
        source: 'FinPilot AI · Powered by Grok xAI',
        link,
        linkText
      }]);

    } catch (err) {
      console.error(err);
      // Graceful fallback UI in case of API Key / CORS issues
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        text: `### Connection Error\nCould not connect to Grok API directly from browser due to CORS or API key validation. \n\n**Here is the synthesis of your request based on local rules:**\n\n- **Question:** "${q}"\n- **Disclaimer:** Market investments are subject to risk. Past performance does not guarantee future results. Consult a SEBI-registered advisor for personal plans.`,
        source: 'FinPilot AI Local Fallback'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    { label: 'What is P/E ratio?', icon: <BookOpen size={16} /> },
    { label: 'Tell me about Reliance', icon: <TrendingUp size={16} /> },
    { label: 'HDFC Flexi Cap Fund', icon: <BarChart2 size={16} /> },
    { label: 'Compare TCS vs Reliance', icon: <BarChart2 size={16} /> },
  ];

  return (
    <div className="chat-container">
      {messages.length === 0 ? (
        <div className="empty-state anim">
          <Sparkles size={48} color="var(--blue)" style={{ marginBottom: '24px', opacity: 0.8 }} />
          <h1>What do you want to research?</h1>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '640px' }}>
            {suggestions.map((s, i) => (
              <button key={i} className="chip" onClick={() => sendMessage(s.label)} style={{ padding: '12px 20px', fontSize: '0.95rem', borderRadius: '16px' }}>
                {s.icon} <span style={{ marginLeft: '6px' }}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="chat-history">
          {messages.map((msg) => (
            <div key={msg.id} className={`msg-row ${msg.type === 'user' ? 'user' : ''}`}>
              {msg.type === 'ai' && (
                <div className="msg-ai-avatar">
                  <Sparkles size={16} color="var(--blue)" />
                </div>
              )}
              
              {msg.type === 'user' ? (
                <div className="msg-user-bubble">{msg.text}</div>
              ) : (
                <div className="msg-ai-content">
                  <div style={{ fontWeight: 700, color: 'var(--text-1)', marginBottom: '8px', fontSize: '1.1rem' }}>FinPilot AI</div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{msg.text}</div>
                  
                  {msg.link && (
                    <div style={{ marginTop: '16px' }}>
                      <button onClick={() => navigate(msg.link)} className="btn btn-outline" style={{ borderRadius: '12px' }}>
                        {msg.linkText} <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                  
                  {msg.source && (
                    <div className="ai-cite" style={{ marginTop: '20px', background: 'var(--bg-subtle)', padding: '6px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center' }}>
                      <AlertCircle size={12} style={{ marginRight: '6px' }} /> Engine: {msg.source}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="msg-row">
               <div className="msg-ai-avatar">
                  <Sparkles size={16} color="var(--blue)" />
                </div>
                <div className="msg-ai-content" style={{ display: 'flex', alignItems: 'center', height: '36px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', animation: 'pulse 1s infinite' }}></span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', animation: 'pulse 1s 0.2s infinite' }}></span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', animation: 'pulse 1s 0.4s infinite' }}></span>
                  </div>
                </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Modern Input */}
      <div className="chat-input-box anim anim-d1">
        <button style={{ padding: '8px', borderRadius: '50%', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={22} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && input.trim()) sendMessage(input);
          }}
          placeholder="Ask FinPilot AI about stocks, mutual funds, or finance..."
        />
        <button 
          className="send-btn" 
          onClick={() => sendMessage(input)}
          disabled={!input.trim()}
        >
          <Send size={18} style={{ marginLeft: '-2px' }} />
        </button>
      </div>
      <div className="anim anim-d2" style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-3)' }}>
        FinPilot AI is powered by Grok xAI. Always verify important financial information.
      </div>
    </div>
  );
}
