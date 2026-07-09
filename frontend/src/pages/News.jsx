import React from 'react';
import { Newspaper, MessageSquare, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

const NEWS_ARTICLES = [
  {
    id: 1,
    title: 'Reliance Industries Invests ₹75,000 Crore in New Energy Giga Factories',
    summary: 'Reliance Industries is expanding its green energy portfolio with four giga factories for solar panels, energy storage, electrolysers, and fuel cells in Gujarat.',
    source: 'Financial Express',
    time: '2 hours ago',
    sentiment: 'positive',
    impact: 'High',
    related: 'RELIANCE'
  },
  {
    id: 2,
    title: 'IT Sector Braces for Soft Q1 Earnings Amid Global Spending Slowdown',
    summary: 'Leading IT services firms including TCS are expected to report modest growth as enterprise clients in the US and Europe optimize their discretionary spending budgets.',
    source: 'Economic Times',
    time: '4 hours ago',
    sentiment: 'neutral',
    impact: 'Medium',
    related: 'TCS'
  },
  {
    id: 3,
    title: 'HDFC Mutual Fund Launches New Multi-Asset Allocation Scheme',
    summary: 'The fund house announces a new open-ended scheme investing in equity, debt, and gold, aimed at providing asset diversification for retail investors.',
    source: 'Moneycontrol',
    time: '1 day ago',
    sentiment: 'positive',
    impact: 'Low',
    related: 'HDFC-FLEXI'
  },
  {
    id: 4,
    title: 'SEBI Proposes Tighter Rules for Mutual Fund Expense Ratios',
    summary: 'The regulator aims to increase transparency by proposing unified expense ratios that include all transaction costs and brokerages, potentially lowering investor costs.',
    source: 'Mint',
    time: '2 days ago',
    sentiment: 'negative',
    impact: 'High',
    related: 'PPFAS-FLEXI'
  }
];

export default function News() {
  const triggerAIChatWithArticle = (title) => {
    // Dispatch a custom event to notify App.jsx / AIChatSidebar to open and start a discussion about this article
    const event = new CustomEvent('open-ai-chat', { 
      detail: { 
        message: `Can you analyze the news article: "${title}" and tell me how it impacts my portfolio?`
      } 
    });
    window.dispatchEvent(event);
  };

  return (
    <div style={{ padding: '2rem 0 4rem 0', background: 'var(--bg-subtle)', minHeight: '100vh' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--blue), var(--violet))', 
            padding: '10px', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white'
          }}>
            <Newspaper size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Market Pulse</h1>
            <p style={{ color: 'var(--text-3)', margin: '4px 0 0 0', fontSize: '0.95rem' }}>Stay informed with curated financial news and AI-assisted impact analysis.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {NEWS_ARTICLES.map((article) => (
            <div 
              key={article.id} 
              className="glass-panel" 
              style={{ 
                padding: '1.5rem', 
                borderRadius: '16px', 
                border: '1px solid var(--neutral-200)',
                background: 'white',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-3)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>{article.source}</span>
                  <span>•</span>
                  <span>{article.time}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    background: article.sentiment === 'positive' ? 'rgba(16, 185, 129, 0.1)' : article.sentiment === 'negative' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                    color: article.sentiment === 'positive' ? 'var(--green)' : article.sentiment === 'negative' ? 'var(--red)' : 'var(--text-2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {article.sentiment === 'positive' && <TrendingUp size={12} />}
                    {article.sentiment === 'negative' && <TrendingDown size={12} />}
                    {article.sentiment.toUpperCase()}
                  </span>
                  
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-2)'
                  }}>
                    Impact: {article.impact}
                  </span>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-1)', lineHeight: '1.4' }}>
                  {article.title}
                </h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', margin: 0, lineHeight: '1.6' }}>
                  {article.summary}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--neutral-100)' }}>
                <span style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: 600, 
                  color: 'var(--blue)',
                  background: 'rgba(59, 130, 246, 0.08)',
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}>
                  Ticker: {article.related}
                </span>

                <button 
                  onClick={() => triggerAIChatWithArticle(article.title)}
                  className="btn btn-violet btn-sm"
                  style={{ gap: '6px', borderRadius: '8px' }}
                >
                  <Sparkles size={13} /> Ask AI Impact
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
