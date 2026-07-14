import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, Sparkles, RefreshCw, Clock, ExternalLink } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const AUTO_REFRESH_MS = 15 * 60 * 1000; // 15 minutes

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchNews = useCallback(async (isManual = false) => {
    if (isManual) setLoading(true);
    try {
      const res = await fetch(`${API_URL}/news`);
      if (!res.ok) throw new Error('Failed to fetch news');
      const data = await res.json();
      setArticles(data.articles || []);
      setLastFetched(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(), AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const triggerAIChatWithArticle = (title) => {
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <p style={{ color: 'var(--text-3)', margin: '4px 0 0 0', fontSize: '0.95rem' }}>Top 10 live headlines on stocks, mutual funds, AMCs &amp; markets.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {lastFetched && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-3)' }}>
                <Clock size={13} /> Updated {timeAgo(lastFetched.toISOString())}
              </span>
            )}
            <button
              onClick={() => fetchNews(true)}
              disabled={loading}
              className="btn btn-outline btn-sm"
              style={{ gap: '6px', borderRadius: '8px' }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {loading && articles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-3)' }}>
            Loading latest market news…
          </div>
        )}

        {error && articles.length === 0 && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            color: 'var(--red)',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            fontWeight: 500
          }}>
            Error: {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {articles.map((article, i) => (
            <div
              key={`${article.link}-${i}`}
              className="glass-panel"
              style={{
                borderRadius: '16px',
                border: '1px solid var(--neutral-200)',
                background: 'var(--bg-card)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {article.image && (
                <div style={{ width: '100%', height: '160px', overflow: 'hidden', background: 'var(--bg-subtle)' }}>
                  <img
                    src={article.image}
                    alt=""
                    onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-3)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>{article.source}</span>
                    <span>•</span>
                    <span>{timeAgo(article.publishedAt)}</span>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 9px',
                    borderRadius: '20px',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em'
                  }}>
                    #{i + 1}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-1)', lineHeight: '1.4' }}>
                  {article.title}
                </h3>

                {article.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', margin: 0, lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {article.description}
                  </p>
                )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--neutral-100)', flexWrap: 'wrap', gap: '10px' }}>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--blue)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  Read full article <ExternalLink size={12} />
                </a>

                <button
                  onClick={() => triggerAIChatWithArticle(article.title)}
                  className="btn btn-violet btn-sm"
                  style={{ gap: '6px', borderRadius: '8px' }}
                >
                  <Sparkles size={13} /> Ask AI Impact
                </button>
              </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
