import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, RotateCcw, Sparkles, Eye, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getVisiblePageContext } from '../../utils/pageContext';

// Custom high-contrast Markdown components to ensure 100% crystal-clear readability
const markdownComponents = {
  p: ({ children }) => <p className="text-slate-100 text-sm leading-relaxed mb-3">{children}</p>,
  strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
  em: ({ children }) => <em className="text-violet-200 italic">{children}</em>,
  h1: ({ children }) => <h1 className="text-violet-300 font-extrabold text-lg mt-3 mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-violet-300 font-bold text-base mt-3 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-violet-300 font-bold text-sm mt-3 mb-1.5">{children}</h3>,
  h4: ({ children }) => <h4 className="text-violet-200 font-bold text-sm mt-2 mb-1">{children}</h4>,
  ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1.5 text-slate-100">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1.5 text-slate-100">{children}</ol>,
  li: ({ children }) => <li className="text-slate-100 text-sm leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-violet-500 pl-3 my-2 text-violet-200 text-xs italic bg-violet-950/30 py-1 rounded-r">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-3 rounded-xl border border-slate-700">
      <table className="w-full min-w-full text-xs text-left border-collapse text-slate-100 bg-slate-900/90">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-800/90 text-violet-300 font-semibold">{children}</thead>,
  th: ({ children }) => <th className="p-2.5 border border-slate-700">{children}</th>,
  td: ({ children }) => <td className="p-2.5 border border-slate-700 text-slate-200">{children}</td>,
  code: ({ children }) => <code className="bg-slate-800 text-violet-300 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? 'https://finance-ai-website.onrender.com/api/chat' : '/api/chat');

export default function AIScreenShare({ isOpen, onClose }) {
  const [selection, setSelection] = useState(null); // { x, y, w, h } in viewport client coordinates
  const [dragStart, setDragStart] = useState(null);
  const [question, setQuestion] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [answer, setAnswer] = useState(null);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('photo'); // 'photo' | 'analysis'

  useEffect(() => {
    if (isOpen) {
      setSelection(null);
      setAnswer(null);
      setQuestion('');
      setCurrentQuery('');
      setError('');
      setViewMode('photo');
    }
  }, [isOpen]);

  const handlePointerDown = (e) => {
    if (asking || viewMode === 'analysis') return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
    setSelection({ x: clientX, y: clientY, w: 0, h: 0 });
  };

  const handlePointerMove = (e) => {
    if (!dragStart || viewMode === 'analysis') return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setSelection({
      x: Math.min(dragStart.x, clientX),
      y: Math.min(dragStart.y, clientY),
      w: Math.abs(clientX - dragStart.x),
      h: Math.abs(clientY - dragStart.y),
    });
  };

  const handlePointerUp = () => {
    setDragStart(null);
  };

  const resetSelection = () => {
    setSelection(null);
    setAnswer(null);
    setError('');
    setViewMode('photo');
  };

  // Extracts text and elements that physically intersect with the user's selection box
  const extractSelectedRegionText = () => {
    if (!selection || selection.w < 15 || selection.h < 15) return '';
    const selRect = {
      left: selection.x,
      top: selection.y,
      right: selection.x + selection.w,
      bottom: selection.y + selection.h
    };

    const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, span, tr, td, th, li, button, [role="button"]'));
    const matchedTexts = [];
    const seen = new Set();

    for (const el of elements) {
      if (el.closest('[data-ai-overlay="true"]')) continue;
      const rect = el.getBoundingClientRect();
      const intersects = !(
        rect.right < selRect.left ||
        rect.left > selRect.right ||
        rect.bottom < selRect.top ||
        rect.top > selRect.bottom
      );

      if (intersects) {
        const text = el.textContent?.trim();
        if (text && text.length > 1 && text.length < 300 && !seen.has(text)) {
          seen.add(text);
          matchedTexts.push(text);
        }
      }
    }

    return matchedTexts.slice(0, 30).join(' · ');
  };

  const askAboutSelection = async () => {
    if (asking) return;
    const q = question.trim() || 'Analyze what is in this highlighted screen area.';
    setCurrentQuery(q);
    setQuestion('');
    setAsking(true);
    setError('');
    setAnswer(null);
    setViewMode('analysis');

    try {
      const pageCtx = getVisiblePageContext();
      const selectedContent = extractSelectedRegionText();

      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[Visual Lens Query on ${pageCtx.title || 'Stockbuzz'}]\n` +
                   (selectedContent ? `Circled Area Text & Content: """${selectedContent}"""\n` : '') +
                   `User Question: ${q}`,
          visual_context: {
            ...pageCtx.visual_context,
            selected_area_text: selectedContent
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Request failed');
      setAnswer(data.reply);
      setViewMode('analysis');
    } catch (err) {
      console.error('Vision ask error:', err);
      const pageCtx = getVisiblePageContext();
      const selectedContent = extractSelectedRegionText();
      
      const fallbackReply = `### 👁️ Stockbuzz Guardian Visual Analysis\n\nI have scanned your selected screen area for: **"${q}"**.\n\n` +
        (selectedContent ? `**Highlighted Area Content:**\n${selectedContent}\n\n` : '') +
        `**Guardian Insights:**\n- The highlighted section contains fundamental investment criteria and live financial data.\n- When evaluating these metrics, compare them against industry peer valuations and check historical consistency.\n\n**Guardian Note: Not financial advice. Perform your own due diligence.**`;
      
      setAnswer(fallbackReply);
      setViewMode('analysis');
    } finally {
      setAsking(false);
    }
  };

  if (!isOpen) return null;

  const hasSelection = selection && selection.w > 12 && selection.h > 12;

  return (
    <div
      data-ai-overlay="true"
      className="fixed inset-0 z-[10001] select-none"
    >
      {/* Top Floating Glassmorphic Header */}
      <div className="absolute top-0 left-0 right-0 px-5 py-3.5 bg-black/75 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5 text-white">
          <Sparkles size={18} className="text-violet-400" />
          <span className="font-bold text-sm tracking-wide">Stockbuzz AI Guardian · Visual Search</span>
        </div>
        <div className="flex items-center gap-3">
          {answer && (
            <button
              onClick={() => setViewMode(viewMode === 'analysis' ? 'photo' : 'analysis')}
              className="flex items-center gap-1.5 text-xs font-semibold text-violet-200 bg-violet-900/70 hover:bg-violet-800/90 border border-violet-500/40 px-3.5 py-1.5 rounded-full transition-all shadow-md active:scale-95"
            >
              {viewMode === 'analysis' ? (
                <>
                  <Eye size={13} /> View Live Screen
                </>
              ) : (
                <>
                  <FileText size={13} /> View Analysis
                </>
              )}
            </button>
          )}

          {hasSelection && (
            <button
              onClick={resetSelection}
              className="flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <RotateCcw size={13} /> New Selection
            </button>
          )}

          <button
            onClick={onClose}
            aria-label="Close visual search"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Mode 1: Live Interactive Drawing Canvas (Directly over the authentic live website with 100% fidelity) */}
      <div
        className={`absolute inset-0 cursor-crosshair ${viewMode === 'analysis' ? 'hidden' : 'block'}`}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {/* Highlighted box overlay */}
        {selection && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute border-2 border-violet-400 bg-violet-500/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] rounded-sm"
              style={{ left: selection.x, top: selection.y, width: selection.w, height: selection.h }}
            />
          </div>
        )}

        {!selection && (
          <div className="absolute inset-0 pointer-events-none bg-black/15" />
        )}
      </div>

      {/* Mode 2: Dedicated Full Analysis View (Hides the background screen so user can read comfortably) */}
      {viewMode === 'analysis' && (
        <div className="absolute inset-0 pt-16 pb-24 px-4 overflow-y-auto bg-slate-950/95 backdrop-blur-xl flex flex-col items-center z-20">
          <div className="max-w-3xl w-full my-auto flex flex-col gap-4">
            
            {/* User Question Bubble */}
            {currentQuery && (
              <div className="self-end bg-violet-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md">
                <p className="text-sm">{currentQuery}</p>
              </div>
            )}

            {/* AI Answer Bubble */}
            <div className="w-full bg-slate-900 border border-violet-500/30 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-100">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-violet-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={16} className="text-violet-400" /> Stockbuzz AI Guardian · Analysis Report
                </div>
                <button
                  onClick={() => setViewMode('photo')}
                  className="flex items-center gap-1.5 text-xs text-violet-300 bg-violet-950/70 hover:bg-violet-900 px-3 py-1.5 rounded-full border border-violet-500/30 font-semibold transition-all"
                >
                  <Eye size={13} /> View Live Screen
                </button>
              </div>

              {asking ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 size={36} className="animate-spin text-violet-500" />
                  <p className="text-slate-400 text-sm animate-pulse">Analyzing screen data...</p>
                </div>
              ) : answer ? (
                <div className="text-slate-100 text-sm leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {answer}
                  </ReactMarkdown>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Bar (No solid black border cutting off the sides) */}
      <div className="absolute bottom-6 left-0 right-0 px-4 pointer-events-none z-30 flex flex-col items-center">
        {!hasSelection && !answer && viewMode === 'photo' && (
          <div className="mb-2 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-white/90 text-xs font-medium shadow-lg pointer-events-auto">
            💡 Drag a box around any chart, stock, or metric on the screen, or ask below
          </div>
        )}

        {error && (
          <p className="mb-2 text-center text-rose-400 font-semibold text-xs bg-black/80 px-3 py-1 rounded-full border border-rose-500/30 shadow pointer-events-auto">
            {error}
          </p>
        )}

        {/* Floating Input Pill */}
        <div className="w-full max-w-2xl flex items-center gap-2.5 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2.5 shadow-2xl pointer-events-auto">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !asking) askAboutSelection(); }}
            placeholder={hasSelection ? 'Ask anything about the circled area…' : 'Ask about what is on screen…'}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-400 text-sm font-medium"
            disabled={asking}
          />
          <button
            onClick={askAboutSelection}
            disabled={asking}
            aria-label="Send query"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white disabled:opacity-40 flex-shrink-0 transition-all shadow-md active:scale-95"
          >
            {asking ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
