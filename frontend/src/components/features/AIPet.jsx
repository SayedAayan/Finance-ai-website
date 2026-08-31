import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import { Scan, MessageSquare, X } from 'lucide-react';

const STORAGE_KEY = 'stockbuzz-ai-pet-pos';
const SIZE = 56;
const MARGIN = 20;

function clampToViewport(x, y) {
  const maxX = window.innerWidth - SIZE - MARGIN;
  const maxY = window.innerHeight - SIZE - MARGIN;
  return {
    x: Math.min(Math.max(x, MARGIN), Math.max(maxX, MARGIN)),
    y: Math.min(Math.max(y, MARGIN), Math.max(maxY, MARGIN)),
  };
}

function defaultPosition() {
  return { x: MARGIN, y: window.innerHeight - SIZE - 110 };
}

export default function AIPet({ onOpenChat, onOpenVisualSearch, hidden }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [ready, setReady] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const draggedRef = useRef(false);
  const constraintsRef = useRef(null);

  // Periodic eye blink for a bit of life without moving the whole body
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 160);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Restore saved position (or default to bottom-left) once, after mount, so
  // window dimensions are available.
  useEffect(() => {
    let pos;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      pos = saved ? clampToViewport(saved.x, saved.y) : defaultPosition();
    } catch {
      pos = defaultPosition();
    }
    x.set(pos.x);
    y.set(pos.y);
    setReady(true);

    const handleResize = () => {
      const clamped = clampToViewport(x.get(), y.get());
      x.set(clamped.x);
      y.set(clamped.y);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragEnd = () => {
    const clamped = clampToViewport(x.get(), y.get());
    x.set(clamped.x);
    y.set(clamped.y);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clamped));
    // Prevent the click that fires right after a drag from opening the chat
    setTimeout(() => { draggedRef.current = false; }, 0);
  };

  if (!ready || hidden) return null;

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[999]" />
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={constraintsRef}
        onDragStart={() => { draggedRef.current = true; setIsMenuOpen(false); }}
        onDragEnd={handleDragEnd}
        style={{ x, y, width: SIZE, height: SIZE + 8 }}
        className="fixed top-0 left-0 z-[999] cursor-grab active:cursor-grabbing touch-none"
      >
        <div className="relative w-[56px] h-[56px]">
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute bottom-[calc(100%+12px)] -right-2 w-72 bg-slate-900 border border-violet-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto touch-auto"
                style={{ cursor: 'default' }}
              >
                <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 bg-black/20">
                  <span className="text-white font-bold text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" /> AI Assistant
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-2 flex flex-col gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onOpenVisualSearch(); }}
                    className="flex items-start gap-3 p-3 hover:bg-violet-900/40 rounded-xl transition-colors text-left group"
                  >
                    <div className="bg-violet-500/20 p-2 rounded-lg group-hover:bg-violet-500/40 text-violet-300">
                      <Scan size={18} />
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold mb-0.5">Visual Search</div>
                      <div className="text-xs text-gray-400">Take screenshot & ask about live data</div>
                    </div>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onOpenChat(); }}
                    className="flex items-start gap-3 p-3 hover:bg-violet-900/40 rounded-xl transition-colors text-left group"
                  >
                    <div className="bg-violet-500/20 p-2 rounded-lg group-hover:bg-violet-500/40 text-violet-300">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold mb-0.5">AI Chat</div>
                      <div className="text-xs text-gray-400">Ask about features, news, queries</div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => { 
              if (!draggedRef.current) {
                setIsMenuOpen(!isMenuOpen);
              }
            }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Open Stockbuzz AI Guardian"
            title="Stockbuzz AI Guardian (Vision & Analytics)"
            className="relative w-full h-full rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            {/* Antenna */}
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-[2px] h-3 bg-violet-200 rounded-full" />
            <motion.span
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-violet-200"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Side bolts */}
            <span className="absolute top-1/2 -translate-y-1/2 -left-[3px] w-1.5 h-1.5 rounded-full bg-indigo-300" />
            <span className="absolute top-1/2 -translate-y-1/2 -right-[3px] w-1.5 h-1.5 rounded-full bg-indigo-300" />

            {/* Visor / face panel */}
            <div className="relative w-[34px] h-[24px] rounded-lg bg-indigo-950/70 flex items-center justify-center gap-[5px] shadow-inner">
              <span
                className="w-[6px] rounded-[2px] bg-cyan-300 transition-all duration-100"
                style={{ height: blinking ? 1 : 9 }}
              />
              <span
                className="w-[6px] rounded-[2px] bg-cyan-300 transition-all duration-100"
                style={{ height: blinking ? 1 : 9 }}
              />
            </div>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
