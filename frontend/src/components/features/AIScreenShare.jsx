import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// "Circle to Search"-style overlay: freezes a screenshot of the page, lets the
// user drag a box around anything on it, then asks a vision-capable AI about
// just that region.
export default function AIScreenShare({ isOpen, onClose }) {
  const [screenshot, setScreenshot] = useState(null); // data URL of the full page
  const [capturing, setCapturing] = useState(false);
  const [selection, setSelection] = useState(null); // { x, y, w, h } in overlay-image space
  const [dragStart, setDragStart] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState('');

  const imgRef = useRef(null);
  const containerRef = useRef(null);

  const captureScreen = useCallback(async () => {
    setCapturing(true);
    setError('');
    try {
      // Scroll to top so the captured screenshot matches what the user was just
      // looking at without an awkward mid-scroll crop.
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: Math.min(window.devicePixelRatio || 1, 2),
        ignoreElements: (el) => el.dataset?.aiScreenshotIgnore === 'true'
      });
      setScreenshot(canvas.toDataURL('image/png'));
    } catch (err) {
      console.error('Screenshot capture failed:', err);
      setError('Could not capture the screen. Please try again.');
    } finally {
      setCapturing(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelection(null);
      setAnswer(null);
      setQuestion('');
      setError('');
      captureScreen();
    } else {
      setScreenshot(null);
    }
  }, [isOpen, captureScreen]);

  const getRelativePoint = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.min(Math.max(clientX - rect.left, 0), rect.width),
      y: Math.min(Math.max(clientY - rect.top, 0), rect.height),
    };
  };

  const handlePointerDown = (e) => {
    if (answer || asking) return;
    const p = getRelativePoint(e);
    setDragStart(p);
    setSelection({ x: p.x, y: p.y, w: 0, h: 0 });
  };

  const handlePointerMove = (e) => {
    if (!dragStart) return;
    const p = getRelativePoint(e);
    setSelection({
      x: Math.min(dragStart.x, p.x),
      y: Math.min(dragStart.y, p.y),
      w: Math.abs(p.x - dragStart.x),
      h: Math.abs(p.y - dragStart.y),
    });
  };

  const handlePointerUp = () => {
    setDragStart(null);
  };

  const resetSelection = () => {
    setSelection(null);
    setAnswer(null);
    setError('');
  };

  const cropSelectionToBase64 = () => {
    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const hasSelection = selection && selection.w > 12 && selection.h > 12;
    const sx = hasSelection ? selection.x * scaleX : 0;
    const sy = hasSelection ? selection.y * scaleY : 0;
    const sw = hasSelection ? selection.w * scaleX : img.naturalWidth;
    const sh = hasSelection ? selection.h * scaleY : img.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  const askAboutSelection = async () => {
    if (!screenshot) return;
    setAsking(true);
    setError('');
    setAnswer(null);
    try {
      const croppedBase64 = cropSelectionToBase64();
      const res = await fetch('/api/vision-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: croppedBase64, question: question.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Vision request failed');
      setAnswer(data.reply);
    } catch (err) {
      console.error('Vision ask error:', err);
      setError(err.message?.includes('unavailable') || err.message?.includes('API_KEY')
        ? 'Visual search isn\'t configured yet — a vision-capable API key is needed on the server.'
        : 'Something went wrong analyzing that. Please try again.');
    } finally {
      setAsking(false);
    }
  };

  if (!isOpen) return null;

  const hasSelection = selection && selection.w > 12 && selection.h > 12;

  return (
    <div
      className="fixed inset-0 z-[10001] bg-black flex flex-col"
      data-ai-screenshot-ignore="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2 text-white">
          <Sparkles size={18} className="text-violet-400" />
          <span className="font-semibold text-sm">Stockbuzz Visual Search</span>
        </div>
        <div className="flex items-center gap-2">
          {hasSelection && (
            <button
              onClick={resetSelection}
              className="flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <RotateCcw size={13} /> Reset
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close visual search"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Screenshot canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-auto flex items-start justify-center bg-neutral-950">
        {capturing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-3">
            <Loader2 size={28} className="animate-spin text-violet-400" />
            <span className="text-sm">Capturing the screen…</span>
          </div>
        )}

        {screenshot && !capturing && (
          <div className="relative select-none" style={{ touchAction: 'none' }}>
            <img
              ref={imgRef}
              src={screenshot}
              alt="Page screenshot"
              draggable={false}
              className="max-w-full block cursor-crosshair"
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            />

            {/* Dim everything except the selection */}
            {selection && (
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute border-2 border-violet-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] rounded-sm"
                  style={{ left: selection.x, top: selection.y, width: selection.w, height: selection.h }}
                />
              </div>
            )}

            {!selection && (
              <div className="absolute inset-0 pointer-events-none bg-black/20" />
            )}
          </div>
        )}

        {!screenshot && !capturing && (
          <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm">
            {error || 'Nothing captured yet.'}
          </div>
        )}
      </div>

      {/* Hint / answer / input bar */}
      <div className="flex-shrink-0 bg-black/90 backdrop-blur-sm border-t border-white/10 p-4">
        {!hasSelection && !answer && screenshot && (
          <p className="text-center text-white/50 text-xs mb-3">
            Drag a box around anything on screen, or just ask about the whole page below.
          </p>
        )}

        <AnimatePresence>
          {answer && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="max-w-2xl mx-auto mb-3 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white/90 max-h-[30vh] overflow-y-auto"
            >
              <div className="flex items-center gap-2 mb-2 text-violet-300 text-xs font-semibold">
                <Sparkles size={13} /> Stockbuzz AI
              </div>
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && !answer && (
          <p className="max-w-2xl mx-auto mb-3 text-center text-red-400 text-xs">{error}</p>
        )}

        <div className="max-w-2xl mx-auto flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !asking) askAboutSelection(); }}
            placeholder={hasSelection ? 'What is this?' : 'Ask about what\'s on screen…'}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-sm"
            disabled={!screenshot || asking}
          />
          <button
            onClick={askAboutSelection}
            disabled={!screenshot || asking}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-600 text-white disabled:opacity-40 flex-shrink-0"
          >
            {asking ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
