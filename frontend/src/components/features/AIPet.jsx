import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';

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

export default function AIPet({ onOpen, hidden }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [ready, setReady] = useState(false);
  const [blinking, setBlinking] = useState(false);
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
        onDragStart={() => { draggedRef.current = true; }}
        onDragEnd={handleDragEnd}
        style={{ x, y, width: SIZE, height: SIZE + 8 }}
        className="fixed top-0 left-0 z-[999] cursor-grab active:cursor-grabbing touch-none"
      >
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[56px] h-[56px]"
        >
          <motion.button
            onClick={() => { if (!draggedRef.current) onOpen(); }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Open Stockbuzz AI Assistant"
            title="Ask Stockbuzz AI"
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
        </motion.div>
      </motion.div>
    </>
  );
}
