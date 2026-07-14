import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, Sparkles, RefreshCw, Clock, ExternalLink, X, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';

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
    setModal(a); setBody(''); setBodyLoading(true);
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
      setBody('<p style="line-height:1.8;font-size:1rem">' + (a.description || 'No preview.') + '</p>'
        + '<p style="margin-top:14px;font-size:.85rem;color:#888">Full article may be restricted by the publisher.</p>');
    } finally { setBodyLoading(false); }
  }

  const featured = articles.length > 0 ? getFeatured(articles) : null;
  const rest = featured ? articles.filter(a => a.link !== featured.link) : articles;
  const visible = rest.slice(0, visibleCount);
  const hasMore = visibleCount < rest.length;

  return (
    <div style={{ background: 'var(--bg-subtle)', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 60%,#0f172a 100%)', padding: '2.5rem 0 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position:'absolute',top:'-80px',right:'-80px',width:'320px',height:'320px',borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 70%)',pointerEvents:'none' }}/>
        <div style={{ position:'absolute',bottom:'-50px',left:'8%',width:'240px',height:'240px',borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,.12) 0%,transparent 70%)',pointerEvents:'none' }}/>
        <div className="container" style={{ position:'relative',zIndex:1,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'16px' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'14px' }}>
            <div style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)',padding:'11px',borderRadius:'14px',color:'white',boxShadow:'0 8px 24px rgba(99,102,241,.35)',display:'flex' }}>
              <Newspaper size={24}/>
            </div>
            <div>
              <h1 style={{ fontSize:'2rem',fontWeight:900,margin:0,color:'white',letterSpacing:'-0.02em' }}>Market Pulse</h1>
              <p style={{ color:'rgba(255,255,255,.48)',margin:'3px 0 0',fontSize:'0.87rem' }}>Live financial headlines · Refreshes every 15 min</p>
            </div>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
            {lastFetched && <span style={{ display:'flex',alignItems:'center',gap:'5px',fontSize:'0.75rem',color:'rgba(255,255,255,.38)' }}><Clock size={12}/> {timeAgo(lastFetched.toISOString())}</span>}
            <button onClick={() => fetchNews(true)} disabled={loading}
              style={{ display:'flex',alignItems:'center',gap:'6px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',color:'white',padding:'8px 16px',borderRadius:'10px',cursor:loading?'not-allowed':'pointer',fontSize:'0.8rem',fontWeight:700,boxShadow:'0 4px 14px rgba(99,102,241,.35)' }}>
              <RefreshCw size={13} style={{ animation:loading?'spin 1s linear infinite':'none' }}/> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container" style={{ padding:'2rem 0 5rem' }}>
        {loading && articles.length === 0 && (
          <div style={{ textAlign:'center',padding:'5rem 0',color:'var(--text-3)' }}>Loading latest market news…</div>
        )}
        {error && articles.length === 0 && (
          <div style={{ display:'flex',alignItems:'center',gap:'10px',background:'rgba(239,68,68,.08)',color:'var(--red)',padding:'1rem 1.5rem',borderRadius:'12px',border:'1px solid rgba(239,68,68,.15)',fontWeight:500 }}>
            <AlertCircle size={16}/> {error}
          </div>
        )}

        {/* ── Featured ── */}
        {featured && (
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
              <h2 style={{ fontSize:'1.28rem',fontWeight:800,margin:0,color:'var(--text-1)',lineHeight:'1.32',letterSpacing:'-0.015em',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden' }}>{featured.title}</h2>
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
        {rest.length > 0 && (
          <>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:'1rem' }}>
              <span style={{ fontSize:'0.72rem',fontWeight:800,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.09em' }}>Latest Headlines</span>
              <div style={{ flex:1,height:1,background:'var(--neutral-200)' }}/>
            </div>
            <div className="news-more-grid" style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.1rem' }}>
              {visible.map(a => (
                <div key={a.link}
                  style={{ borderRadius:16,border:'1px solid var(--neutral-200)',background:'var(--bg-card)',boxShadow:'0 1px 4px rgba(0,0,0,.05)',padding:'1.25rem 1.35rem',display:'flex',flexDirection:'column',gap:10,cursor:'pointer',transition:'box-shadow .2s,transform .2s,border-color .2s' }}
                  onClick={() => openModal(a)}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow='0 12px 28px rgba(0,0,0,.09)'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='rgba(26,86,219,.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.05)'; e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='var(--neutral-200)'; }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <span style={{ fontSize:'0.72rem',fontWeight:700,color:'var(--blue)',background:'var(--blue-light)',padding:'3px 9px',borderRadius:20 }}>{a.source}</span>
                    <span style={{ fontSize:'0.7rem',color:'var(--text-3)' }}>{timeAgo(a.publishedAt)}</span>
                  </div>
                  <h3 style={{ fontSize:'0.96rem',fontWeight:700,margin:0,color:'var(--text-1)',lineHeight:'1.42',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden' }}>{a.title}</h3>
                  {a.description && <p style={{ fontSize:'0.8rem',color:'var(--text-3)',margin:0,lineHeight:1.6,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>{a.description}</p>}
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
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20,backdropFilter:'blur(6px)' }}
          onClick={() => setModal(null)}>
          <div style={{ background:'var(--bg-card)',borderRadius:20,width:'100%',maxWidth:820,maxHeight:'92vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,.28)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding:'20px 24px 16px',borderBottom:'1px solid var(--neutral-200)',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16 }}>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
                  <span style={{ fontSize:'0.72rem',fontWeight:700,color:'var(--text-2)' }}>{modal.source}</span>
                  <span style={{ width:3,height:3,borderRadius:'50%',background:'var(--text-3)' }}/>
                  <span style={{ fontSize:'0.72rem',color:'var(--text-3)' }}>{timeAgo(modal.publishedAt)}</span>
                </div>
                <h2 style={{ margin:0,fontSize:'1.18rem',fontWeight:800,color:'var(--text-1)',lineHeight:'1.4' }}>{modal.title}</h2>
              </div>
              <button onClick={() => setModal(null)} style={{ background:'var(--bg-subtle)',border:'none',borderRadius:10,padding:8,cursor:'pointer',color:'var(--text-2)',flexShrink:0 }}>
                <X size={18}/>
              </button>
            </div>
            <div style={{ padding:24,overflowY:'auto',flex:1,lineHeight:1.8,fontSize:'0.95rem',color:'var(--text-1)' }}>
              {bodyLoading
                ? <div style={{ display:'flex',flexDirection:'column',gap:13 }}>
                    {[100,100,95,70,100,60].map((w,i) => <div key={i} style={{ height:14,background:'var(--bg-subtle)',borderRadius:8,width:w+'%',opacity:.7 }}/>)}
                  </div>
                : <div dangerouslySetInnerHTML={{ __html: body }} style={{ maxWidth:700 }}/>
              }
            </div>
            <div style={{ padding:'14px 24px',borderTop:'1px solid var(--neutral-200)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <button onClick={() => triggerAI(modal)} style={{ display:'flex',alignItems:'center',gap:6,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',border:'none',borderRadius:10,padding:'8px 18px',cursor:'pointer',fontWeight:700,fontSize:'0.82rem',boxShadow:'0 4px 14px rgba(99,102,241,.3)' }}>
                <Sparkles size={13}/> Ask AI Impact
              </button>
              <a href={modal.link} target="_blank" rel="noopener noreferrer" style={{ display:'flex',alignItems:'center',gap:5,fontSize:'0.79rem',fontWeight:600,color:'var(--text-3)',textDecoration:'none' }}>
                <ExternalLink size={13}/> View on {modal.source}
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
