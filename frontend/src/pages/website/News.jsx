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
  try { cached = JSON.parse(localStorage.getItem('sb_featured_news') || '{}'); } catch {}
  if (cached.date === today && articles.find(a => a.link === cached.link))
    return articles.find(a => a.link === cached.link);
  const pick = articles.find(a => a.image) || articles[0];
  if (pick) {
    try { localStorage.setItem('sb_featured_news', JSON.stringify({ date: today, link: pick.link })); } catch {}
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
    const msg = 'News: "' + a.title + '"\nSource: ' + a.source
      + (a.description ? '\nSummary: ' + a.description : '')
      + '\n\nExplain: (1) what this is about and (2) how it affects the stock market.';
    window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { message: msg } }));
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
      setBody('<p>' + (a.description || 'No preview available.') + '</p>'
        + '<p style="font-family:var(--font-body);font-size:0.85rem;color:var(--text-3)">Full article may be restricted by the publisher.</p>');
    } finally { setBodyLoading(false); }
  }

  const featured = articles.length > 0 ? getFeatured(articles) : null;
  const rest = featured ? articles.filter(a => a.link !== featured.link) : articles;
  const visible = rest.slice(0, visibleCount);
  const hasMore = visibleCount < rest.length;

  return (
    <div style={{ background: 'var(--bg-subtle)', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 60%,#0f172a 100%)', padding: '1.1rem 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position:'absolute',top:'-60px',right:'-60px',width:'220px',height:'220px',borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 70%)',pointerEvents:'none' }}/>
        <div style={{ position:'absolute',bottom:'-40px',left:'8%',width:'160px',height:'160px',borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,.12) 0%,transparent 70%)',pointerEvents:'none' }}/>
        <div className="container" style={{ position:'relative',zIndex:1,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'14px' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'11px' }}>
            <div style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)',padding:'8px',borderRadius:'11px',color:'white',boxShadow:'0 6px 18px rgba(99,102,241,.35)',display:'flex' }}>
              <Newspaper size={18}/>
            </div>
            <div>
              <h1 style={{ fontFamily:'var(--font-display)',fontSize:'1.3rem',fontWeight:800,margin:0,color:'white',letterSpacing:'-0.01em' }}>Market Pulse</h1>
              <p style={{ color:'rgba(255,255,255,.5)',margin:'1px 0 0',fontSize:'0.78rem' }}>Live financial headlines · Refreshes every 15 min</p>
            </div>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
            {lastFetched && <span style={{ display:'flex',alignItems:'center',gap:'5px',fontSize:'0.72rem',color:'rgba(255,255,255,.38)' }}><Clock size={11}/> {timeAgo(lastFetched.toISOString())}</span>}
            <button onClick={() => fetchNews(true)} disabled={loading}
              style={{ display:'flex',alignItems:'center',gap:'6px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',color:'white',padding:'7px 14px',borderRadius:'9px',cursor:loading?'not-allowed':'pointer',fontSize:'0.76rem',fontWeight:700,boxShadow:'0 4px 12px rgba(99,102,241,.3)' }}>
              <RefreshCw size={12} style={{ animation:loading?'spin 1s linear infinite':'none' }}/> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container" style={{ padding:'1.75rem 0 5rem' }}>
        {loading && articles.length === 0 && (
          <div style={{ textAlign:'center',padding:'5rem 0',color:'var(--text-3)' }}>Loading latest market news…</div>
        )}
        {error && articles.length === 0 && (
          <div style={{ display:'flex',alignItems:'center',gap:'10px',background:'rgba(239,68,68,.08)',color:'var(--red)',padding:'1rem 1.5rem',borderRadius:'12px',border:'1px solid rgba(239,68,68,.15)',fontWeight:500 }}>
            <AlertCircle size={16}/> {error}
          </div>
        )}

        {/* ── Featured ── */}
        {cmsConfig?.pages?.news?.features?.showMarketMovers && featured && (
          <div className="news-featured" style={{ borderRadius:18,overflow:'hidden',border:'1px solid var(--neutral-200)',background:'var(--bg-card)',boxShadow:'0 2px 12px rgba(0,0,0,.06)',display:'flex',cursor:'pointer',transition:'box-shadow .25s,transform .25s',marginBottom:'2rem',height:260 }}
            onClick={() => openModal(featured)}
            onMouseEnter={e => { e.currentTarget.style.boxShadow='0 12px 36px rgba(0,0,0,.12)'; e.currentTarget.style.transform='translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,.06)'; e.currentTarget.style.transform=''; }}>
            <div style={{ position:'relative',width:'42%',height:'100%',overflow:'hidden',background:'linear-gradient(135deg,#1e1b4b,#312e81)',flexShrink:0 }}>
              {featured.image
                ? <img src={featured.image} alt="" onError={e => { e.target.style.display='none'; }}
                    style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',display:'block' }}/>
                : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}><Newspaper size={40} style={{ color:'rgba(255,255,255,.12)' }}/></div>
              }
              <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.35) 0%,transparent 45%)',pointerEvents:'none' }}/>
              <span style={{ position:'absolute',top:12,left:12,background:'rgba(99,102,241,.92)',backdropFilter:'blur(6px)',color:'white',fontSize:'0.6rem',fontWeight:800,padding:'4px 11px',borderRadius:20,letterSpacing:'.07em',textTransform:'uppercase',boxShadow:'0 4px 12px rgba(99,102,241,.35)' }}>Top Story</span>
            </div>
            <div style={{ flex:1,minWidth:0,padding:'1.35rem 1.6rem',display:'flex',flexDirection:'column',gap:10,justifyContent:'center' }}>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <span style={{ fontSize:'0.73rem',fontWeight:800,color:'var(--blue)' }}>{featured.source}</span>
                <span style={{ width:3,height:3,borderRadius:'50%',background:'var(--text-3)',flexShrink:0 }}/>
                <span style={{ fontSize:'0.71rem',color:'var(--text-3)' }}>{timeAgo(featured.publishedAt)}</span>
              </div>
              <h2 style={{ fontFamily:'var(--font-display)',fontSize:'1.28rem',fontWeight:800,margin:0,color:'var(--text-1)',lineHeight:'1.32',letterSpacing:'-0.015em',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden' }}>{featured.title}</h2>
              {featured.description && <p style={{ fontSize:'0.85rem',color:'var(--text-3)',margin:0,lineHeight:1.6,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>{featured.description}</p>}
              <div style={{ display:'flex',gap:10,paddingTop:6 }} onClick={e => e.stopPropagation()}>
                <button onClick={() => openModal(featured)} style={{ fontSize:'0.78rem',fontWeight:700,color:'white',background:'linear-gradient(135deg,var(--blue),var(--blue-mid))',border:'none',borderRadius:10,padding:'8px 15px',cursor:'pointer',display:'flex',alignItems:'center',gap:6,boxShadow:'0 4px 12px rgba(26,86,219,.25)' }}>
                  <BookOpen size={13}/> Read article
                </button>
                <button onClick={() => triggerAI(featured)} style={{ fontSize:'0.78rem',fontWeight:700,color:'var(--violet)',background:'var(--violet-light)',border:'none',borderRadius:10,padding:'8px 15px',cursor:'pointer',display:'flex',alignItems:'center',gap:6 }}>
                  <Sparkles size={13}/> AI Impact
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Article list ── */}
        {cmsConfig?.pages?.news?.features?.showGlobalNews && rest.length > 0 && (
          <>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:'1rem' }}>
              <span style={{ fontSize:'0.72rem',fontWeight:800,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.09em' }}>Latest Headlines</span>
              <div style={{ flex:1,height:1,background:'var(--neutral-200)' }}/>
            </div>
            <div className="news-more-grid" style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:'1rem' }}>
              {visible.map(a => (
                <div key={a.link}
                  style={{ borderRadius:16,border:'1px solid var(--neutral-200)',background:'var(--bg-card)',boxShadow:'0 1px 4px rgba(0,0,0,.05)',padding:'1.15rem 1.25rem',display:'flex',flexDirection:'column',gap:10,cursor:'pointer',transition:'box-shadow .2s,transform .2s,border-color .2s',minWidth:0 }}
                  onClick={() => openModal(a)}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow='0 12px 28px rgba(0,0,0,.09)'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='rgba(26,86,219,.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.05)'; e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='var(--neutral-200)'; }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <span style={{ fontSize:'0.7rem',fontWeight:700,color:'var(--blue)',background:'var(--blue-light)',padding:'3px 9px',borderRadius:20 }}>{a.source}</span>
                    <span style={{ fontSize:'0.68rem',color:'var(--text-3)' }}>{timeAgo(a.publishedAt)}</span>
                  </div>
                  <h3 style={{ fontFamily:'var(--font-display)',fontSize:'0.95rem',fontWeight:700,margin:0,color:'var(--text-1)',lineHeight:'1.4',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden' }}>{a.title}</h3>
                  {a.description && <p style={{ fontSize:'0.79rem',color:'var(--text-3)',margin:0,lineHeight:1.6,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>{a.description}</p>}
                  <div style={{ display:'flex',gap:10,paddingTop:10,marginTop:'auto',borderTop:'1px solid var(--neutral-100)' }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => openModal(a)} style={{ fontSize:'0.73rem',fontWeight:700,color:'var(--blue)',background:'none',border:'none',cursor:'pointer',padding:'10px 0 0',display:'flex',alignItems:'center',gap:4 }}><BookOpen size={12}/> Read</button>
                    <button onClick={() => triggerAI(a)} style={{ fontSize:'0.73rem',fontWeight:700,color:'var(--violet)',background:'none',border:'none',cursor:'pointer',padding:'10px 0 0',display:'flex',alignItems:'center',gap:4 }}><Sparkles size={12}/> AI Impact</button>
                  </div>
                </div>
              ))}
            </div>
            {hasMore && (
              <div style={{ display:'flex',justifyContent:'center',marginTop:'1.5rem' }}>
                <button onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  style={{ fontSize:'0.85rem',fontWeight:700,color:'var(--text-1)',background:'var(--bg-card)',border:'1px solid var(--neutral-200)',borderRadius:12,padding:'11px 28px',cursor:'pointer',display:'flex',alignItems:'center',gap:8,boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
                  View more news <ArrowRight size={15}/>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(15,23,42,.65)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding: fullscreen ? 0 : 20,backdropFilter:'blur(6px)' }}
          onClick={() => setModal(null)}>
          <div style={ fullscreen
              ? { background:'var(--bg-card)',borderRadius:0,width:'100vw',height:'100vh',maxWidth:'100vw',maxHeight:'100vh',display:'flex',flexDirection:'column',overflow:'hidden' }
              : { background:'var(--bg-card)',borderRadius:20,width:'100%',maxWidth:960,height:'94vh',maxHeight:'94vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,.32)' } }
            onClick={e => e.stopPropagation()}>
            <div style={{ padding:'22px 28px 18px',borderBottom:'1px solid var(--neutral-200)',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16 }}>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:10 }}>
                  <span style={{ fontSize:'0.74rem',fontWeight:700,color:'var(--blue)',background:'var(--blue-light)',padding:'3px 10px',borderRadius:20 }}>{modal.source}</span>
                  <span style={{ fontSize:'0.74rem',color:'var(--text-3)' }}>{timeAgo(modal.publishedAt)}</span>
                </div>
                <h2 style={{ fontFamily:'var(--font-display)',margin:0,fontSize:'1.35rem',fontWeight:800,color:'var(--text-1)',lineHeight:'1.38',letterSpacing:'-0.01em' }}>{modal.title}</h2>
              </div>
              <div style={{ display:'flex',alignItems:'center',gap:8,flexShrink:0 }}>
                <button onClick={() => setFullscreen(f => !f)} title={fullscreen ? 'Exit full screen' : 'Read in full screen'}
                  style={{ background:'var(--bg-subtle)',border:'none',borderRadius:10,padding:8,cursor:'pointer',color:'var(--text-2)',display:'flex' }}>
                  {fullscreen ? <Minimize2 size={18}/> : <Maximize2 size={18}/>}
                </button>
                <button onClick={() => setModal(null)} style={{ background:'var(--bg-subtle)',border:'none',borderRadius:10,padding:8,cursor:'pointer',color:'var(--text-2)',display:'flex' }}>
                  <X size={18}/>
                </button>
              </div>
            </div>
            <div className="news-article-body" style={{ padding:'26px 28px',overflowY:'auto',flex:1 }}>
              {bodyLoading
                ? <div style={{ display:'flex',flexDirection:'column',gap:13 }}>
                    {[100,100,95,70,100,60].map((w,i) => <div key={i} style={{ height:14,background:'var(--bg-subtle)',borderRadius:8,width:w+'%',opacity:.7 }}/>)}
                  </div>
                : <div dangerouslySetInnerHTML={{ __html: body }} style={{ maxWidth: fullscreen ? 760 : 680, margin:'0 auto' }} />
              }
            </div>
            <div style={{ padding:'16px 28px',borderTop:'1px solid var(--neutral-200)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <button onClick={() => triggerAI(modal)} style={{ display:'flex',alignItems:'center',gap:6,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',border:'none',borderRadius:10,padding:'9px 18px',cursor:'pointer',fontWeight:700,fontSize:'0.82rem',boxShadow:'0 4px 14px rgba(99,102,241,.3)' }}>
                <Sparkles size={13}/> Ask AI Impact
              </button>
              <a href={modal.link} target="_blank" rel="noopener noreferrer" style={{ display:'flex',alignItems:'center',gap:5,fontSize:'0.8rem',fontWeight:600,color:'var(--text-3)',textDecoration:'none' }}>
                <ExternalLink size={13}/> View on {modal.source}
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
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
