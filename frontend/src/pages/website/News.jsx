import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, Sparkles, RefreshCw, Clock, ExternalLink, X, BookOpen, AlertCircle, ArrowRight, Maximize2, Minimize2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const AUTO_REFRESH_MS = 15 * 60 * 1000;

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

function getFeatured(articles) {
  const today = new Date().toDateString();
  let cached = {};
  try { cached = JSON.parse(localStorage.getItem('sb_featured_news') || '{}'); } catch { }
  if (cached.date === today && articles.find(a => a.link === cached.link))
    return articles.find(a => a.link === cached.link);
  const pick = articles.find(a => a.image) || articles[0];
  if (pick) {
    try { localStorage.setItem('sb_featured_news', JSON.stringify({ date: today, link: pick.link })); } catch { }
  }
  return pick;
}

const PAGE_SIZE = 8;

export default function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [modal, setModal] = useState(null);
  const [body, setBody] = useState('');
  const [bodyLoading, setBodyLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [fullscreen, setFullscreen] = useState(false);

  const defaultCms = {
    pages: { news: { features: { showGlobalNews: true, showMarketMovers: true, allowSearch: true } } }
  };
  const [cmsConfig, setCmsConfig] = useState(defaultCms);

  useEffect(() => {
    fetch('/api/cms')
      .then(res => res.json())
      .then(data => {
        if (data && data.pages) setCmsConfig(data);
      })
      .catch(err => console.error('Failed to load CMS config', err));
  }, []);

  const fetchNews = useCallback(async (manual = false) => {
    if (manual) setLoading(true);
    try {
      const r = await fetch(API_URL + '/news');
      if (!r.ok) throw new Error('Failed');
      const d = await r.json();
      setArticles(d.articles || []);
      setLastFetched(new Date());
      setError(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchNews();
    const iv = setInterval(() => fetchNews(), AUTO_REFRESH_MS);
    return () => clearInterval(iv);
  }, [fetchNews]);

  function triggerAI(a) {
    const displayMsg = `Analyze the AI Impact for: "${a.title}"`;
    const hiddenPrompt = `Please perform a detailed AI Impact Analysis for the following news:
News Title: "${a.title}"
Source: ${a.source}
Summary: ${a.description || 'No description available.'}

Please structure your response into the following sections:
1. 📈 MARKET & STOCK/FUND IMPACT: Explain what this is about, the company or fund's relevant history, and how this news affects the stock or mutual fund and the wider financial market (short-term and long-term implications).
2. ⚡ SWOT ANALYSIS:
   • STRENGTHS: Internal positive factors or competitive advantages highlighted or created by this event.
   • WEAKNESSES: Risks, costs, or vulnerabilities this development exposes.
   • OPPORTUNITIES: External growth opportunities, market expansions, or positive trends.
   • THREATS: Competitive risks, regulatory hurdles, or external macro pressures.`;

    window.dispatchEvent(new CustomEvent('open-ai-chat', {
      detail: {
        message: displayMsg,
        hiddenPrompt: hiddenPrompt
      }
    }));
  }

  async function openModal(a) {
    setModal(a); setBody(''); setBodyLoading(true); setFullscreen(false);
    try {
      const r = await fetch(API_URL + '/read-article?url=' + encodeURIComponent(a.link));
      const d = await r.json();
      if (!r.ok || d.error) throw new Error('err');
      const raw = d.article && (d.article.content || d.article.textContent);
      if (!raw) throw new Error('empty');
      if (d.article.content) { setBody(d.article.content); }
      else {
        const p = d.article.textContent.split(/\n\n+/).filter(t => t.trim().length > 40);
        setBody(p.map(t => '<p>' + t.trim() + '</p>').join(''));
      }
    } catch {
      setModal(null);
      window.open(a.link, '_blank', 'noopener,noreferrer');
      return;
    } finally { setBodyLoading(false); }
  }

  const featured = articles.length > 0 ? getFeatured(articles) : null;
  const rest = featured ? articles.filter(a => a.link !== featured.link) : articles;
  const visible = rest.slice(0, visibleCount);
  const hasMore = visibleCount < rest.length;

  return (
    <div className="news-page-root bg-[#F5F7FA] dark:bg-gray-950">


      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 60%,#0f172a 100%)', padding: '1.1rem 0', position: 'relative', overflow: 'hidden', zIndex: 3 }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '8%', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', padding: '8px', borderRadius: '11px', color: 'white', boxShadow: '0 6px 18px rgba(99,102,241,.35)', display: 'flex' }}>
              <Newspaper size={18} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'white', letterSpacing: '-0.01em' }}>Market Pulse</h1>
              <p style={{ color: 'rgba(255,255,255,.5)', margin: '1px 0 0', fontSize: '0.78rem' }}>Live financial headlines · Refreshes every 15 min</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {lastFetched && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'rgba(255,255,255,.38)' }}><Clock size={11} /> {timeAgo(lastFetched.toISOString())}</span>}
            <button onClick={() => fetchNews(true)} disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: 'white', padding: '7px 14px', borderRadius: '9px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.76rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(99,102,241,.3)' }}>
              <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container news-body-container">
        {loading && articles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-3)' }}>Loading latest market news…</div>
        )}
        {error && articles.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239,68,68,.08)', color: 'var(--red)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(239,68,68,.15)', fontWeight: 500 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* ── Featured ── */}
        {cmsConfig?.pages?.news?.features?.showMarketMovers && featured && (
          <div className="news-featured" onClick={() => openModal(featured)}>
            <div className="news-featured-img-wrap">
              {featured.image
                ? <img src={featured.image} alt="" onError={e => { e.target.style.display = 'none'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Newspaper size={40} style={{ color: 'rgba(255,255,255,.12)' }} /></div>
              }
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.35) 0%,transparent 45%)', pointerEvents: 'none' }} />
              <span style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(99,102,241,.92)', backdropFilter: 'blur(6px)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '5px 12px', borderRadius: 20, letterSpacing: '.07em', textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(99,102,241,.35)' }}>Top Story</span>
            </div>
            <div className="news-featured-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.73rem', fontWeight: 800, color: 'var(--blue)' }}>{featured.source}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-3)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.71rem', color: 'var(--text-3)' }}>{timeAgo(featured.publishedAt)}</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-1)', lineHeight: '1.32', letterSpacing: '-0.015em', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{featured.title}</h2>
              {featured.description && <p style={{ fontSize: '0.95rem', color: 'var(--text-3)', margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{featured.description}</p>}
              <div style={{ flexGrow: 1 }} />
              <div style={{ display: 'flex', gap: 10, paddingTop: 6 }} onClick={e => e.stopPropagation()}>
                <button onClick={() => openModal(featured)} style={{ fontSize: '0.78rem', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg,var(--blue),var(--blue-mid))', border: 'none', borderRadius: 10, padding: '8px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(26,86,219,.25)' }}>
                  <BookOpen size={13} /> Read article
                </button>
                <button onClick={() => triggerAI(featured)} style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--violet)', background: 'var(--violet-light)', border: 'none', borderRadius: 10, padding: '8px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={13} /> AI Impact
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Article list ── */}
        {cmsConfig?.pages?.news?.features?.showGlobalNews && rest.length > 0 && (
          <>
            <div className="news-dashboard-header">
              <span className="news-dashboard-title">LATEST HEADLINES</span>
              <div className="news-dashboard-divider" />
            </div>
            <div className="news-more-grid">
              {visible.map(a => (
                <div key={a.link} className="news-card" onClick={() => openModal(a)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--blue)', background: 'var(--blue-light)', padding: '3px 9px', borderRadius: 20 }}>{a.source}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>{timeAgo(a.publishedAt)}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-1)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</h3>
                  {a.description && <p style={{ fontSize: '0.79rem', color: 'var(--text-3)', margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.description}</p>}
                  <div style={{ flexGrow: 1 }} />
                  <div style={{ display: 'flex', gap: 10, paddingTop: 10, borderTop: '1px solid var(--neutral-100)' }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => openModal(a)} style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><BookOpen size={12} /> Read</button>
                    <button onClick={() => triggerAI(a)} style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--violet)', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><Sparkles size={12} /> AI Impact</button>
                  </div>
                </div>
              ))}
            </div>
            {rest.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
                <button onClick={() => setVisibleCount(c => c + PAGE_SIZE)} disabled={!hasMore}
                  style={{ fontSize: '0.9rem', fontWeight: 700, color: hasMore ? 'white' : 'var(--text-3)', background: hasMore ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--bg-subtle)', border: 'none', borderRadius: 12, padding: '12px 32px', cursor: hasMore ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8, boxShadow: hasMore ? '0 4px 14px rgba(99,102,241,.3)' : 'none' }}>
                  {hasMore ? 'Read more news' : 'No more news'} {hasMore && <ArrowRight size={16} />}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: fullscreen ? 0 : 20 }}
          onClick={() => setModal(null)}>
          <div className="bg-white dark:bg-gray-900 text-textMain dark:text-gray-100" style={fullscreen
            ? { borderRadius: 0, width: '100vw', height: '100vh', maxWidth: '100vw', maxHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }
            : { borderRadius: 20, width: '100%', maxWidth: 960, height: '94vh', maxHeight: '94vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.32)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 28px 18px', borderBottom: '1px solid var(--neutral-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--blue)', background: 'var(--blue-light)', padding: '3px 10px', borderRadius: 20 }}>{modal.source}</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>{timeAgo(modal.publishedAt)}</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: '1.38', letterSpacing: '-0.01em' }}>{modal.title}</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button onClick={() => setFullscreen(f => !f)} title={fullscreen ? 'Exit full screen' : 'Read in full screen'}
                  style={{ background: 'var(--bg-subtle)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-2)', display: 'flex' }}>
                  {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button onClick={() => setModal(null)} style={{ background: 'var(--bg-subtle)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-2)', display: 'flex' }}>
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="news-article-body" style={{ padding: '26px 28px', overflowY: 'auto', flex: 1 }}>
              {bodyLoading
                ? <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  {[100, 100, 95, 70, 100, 60].map((w, i) => <div key={i} style={{ height: 14, background: 'var(--bg-subtle)', borderRadius: 8, width: w + '%', opacity: .7 }} />)}
                </div>
                : <div dangerouslySetInnerHTML={{ __html: body }} style={{ maxWidth: fullscreen ? 760 : 680, margin: '0 auto' }} />
              }
            </div>
            <div style={{ padding: '16px 28px', borderTop: '1px solid var(--neutral-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => triggerAI(modal)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', boxShadow: '0 4px 14px rgba(99,102,241,.3)' }}>
                <Sparkles size={13} /> Ask AI Impact
              </button>
              <a href={modal.link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-3)', textDecoration: 'none' }}>
                <ExternalLink size={13} /> View on {modal.source}
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Solid Background Layer ── */
        .news-page-root {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden; /* Changed from overflow: hidden so you can scroll vertically */
        }


        /* ── Container Overrides ── */
        .news-body-container {
          position: relative;
          z-index: 2;
          padding-top: 40px !important; /* Fixed empty space above Top Story */
          padding-bottom: 80px !important;
          padding-left: clamp(24px, 6vw, 64px) !important;
          padding-right: clamp(24px, 6vw, 64px) !important;
        }
        
        /* ── Bloomberg News Grid and Spacing ── */
        .news-more-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 16px;
        }
        @media (min-width: 640px) {
          .news-more-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
          }
        }
        @media (min-width: 1024px) {
          .news-more-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 26px;
          }
        }
        @media (min-width: 1280px) {
          .news-more-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 32px; /* Gap between cards: 32px */
          }
        }

        /* ── Dashboard Headlines Divider Header ── */
        .news-dashboard-header {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-top: 4.5rem;
          margin-bottom: 2.5rem;
        }
        .news-dashboard-title {
          font-family: var(--font-display);
          font-size: 0.82rem;
          font-weight: 700; /* 700 weight */
          color: var(--blue);
          text-transform: uppercase; /* Uppercase */
          letter-spacing: 0.16em; /* Letter spacing */
          white-space: nowrap;
        }
        .news-dashboard-divider {
          flex: 1;
          height: 2px;
          background: rgba(37, 99, 235, 0.15); /* Blue divider extending across the page */
        }

        /* ── Featured Hero Card (Bloomberg Styling) ── */
        .news-featured {
          border-radius: 24px; /* Rounded 24px */
          overflow: hidden;
          border: 1px solid var(--neutral-200);
          background: #FFFFFF;
          box-shadow: 0 8px 32px rgba(15, 23, 42, 0.06);
          display: flex;
          flex-direction: row;
          cursor: pointer;
          transition: box-shadow 350ms cubic-bezier(0.16, 1, 0.3, 1),
                      transform 350ms cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 350ms cubic-bezier(0.16, 1, 0.3, 1);
          margin-bottom: 2.5rem;
          height: 320px; /* Optimized height to fit in one screen */
          box-sizing: border-box;
        }
        .dark .news-featured {
          background: #1E293B;
          border-color: #334155;
        }
        .news-featured:hover {
          box-shadow: 0 16px 40px rgba(37, 99, 235, 0.07); /* Shadow on hover */
          transform: translateY(-5px); /* Lift */
          border-color: rgba(37, 99, 235, 0.25); /* Border glow */
        }
        .news-featured-img-wrap {
          position: relative;
          width: 45%;
          height: 100%;
          overflow: hidden;
          background: linear-gradient(135deg,#1e1b4b,#312e81);
          flex-shrink: 0;
        }
        .news-featured-content {
          flex: 1;
          min-width: 0;
          padding: 1.25rem 2.25rem; /* Reduced vertical padding to prevent overflow */
          display: flex;
          flex-direction: column;
          gap: 12px;
          justify-content: center;
        }
        @media (max-width: 768px) {
          .news-featured {
            flex-direction: column;
            height: auto;
          }
          .news-featured-img-wrap {
            width: 100%;
            height: 220px;
          }
          .news-featured-content {
            padding: 2rem 1.5rem;
          }
        }

        /* ── Premium Equal Height Cards and Transitions ── */
        .news-card {
          border-radius: 24px; /* Rounded 24px */
          border: 1px solid var(--neutral-200);
          background: #FFFFFF;
          box-shadow: 0 8px 32px rgba(15, 23, 42, 0.06);
          padding: 2.5rem 2.25rem; /* Large spacing */
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          transition: box-shadow 350ms cubic-bezier(0.16, 1, 0.3, 1),
                      transform 350ms cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 350ms cubic-bezier(0.16, 1, 0.3, 1);
          min-width: 0;
          height: 100%;
          box-sizing: border-box;
        }
        .dark .news-card {
          background: #1E293B;
          border-color: #334155;
        }
        .news-card:hover {
          box-shadow: 0 16px 40px rgba(37, 99, 235, 0.07); /* Shadow on hover */
          transform: translateY(-5px); /* Lift */
          border-color: rgba(37, 99, 235, 0.25); /* Border glow */
        }

        .news-article-body {
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.75;
          color: var(--text-2);
        }
        .news-article-body p { margin: 0 0 1.1em; }
        .news-article-body p:last-child { margin-bottom: 0; }
        .news-article-body h1, .news-article-body h2, .news-article-body h3 {
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--text-1);
          margin: 1.4em 0 0.6em;
          line-height: 1.35;
        }
        .news-article-body a { color: var(--blue); text-decoration: underline; }
        .news-article-body img {
          max-width: 100%;
          max-height: 70vh;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 12px;
          margin: 1.2em auto;
          display: block;
        }
        .news-article-body ul, .news-article-body ol { margin: 0 0 1.1em 1.4em; }
        .news-article-body blockquote {
          margin: 1.2em 0;
          padding: 0.2em 1.2em;
          border-left: 3px solid var(--blue);
          color: var(--text-2);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
