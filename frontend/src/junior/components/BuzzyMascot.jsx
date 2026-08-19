import React from 'react';
import { motion } from 'framer-motion';

export default function BuzzyMascot({ size = 80, mood = 'happy', dialog = '', className = '' }) {
  // SVG illustration for Buzzy (Bee + Bull hybrid with friendly golden wings, cute horns, and cheerful smile)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        animate={
          mood === 'celebrate'
            ? { y: [0, -8, 0], rotate: [-2, 2, -2] }
            : mood === 'thinking'
            ? { rotate: [-4, 4, -4] }
            : { y: [0, -4, 0] }
        }
        transition={{ repeat: Infinity, duration: mood === 'celebrate' ? 1 : 2.5, ease: 'easeInOut' }}
        style={{ width: size, height: size }}
        className="flex-shrink-0 relative select-none"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Wings */}
          <ellipse cx="25" cy="35" rx="14" ry="9" fill="#93C5FD" fillOpacity="0.75" transform="rotate(-30 25 35)" />
          <ellipse cx="75" cy="35" rx="14" ry="9" fill="#93C5FD" fillOpacity="0.75" transform="rotate(30 75 35)" />

          {/* Body */}
          <circle cx="50" cy="55" r="32" fill="#FFB020" />
          
          {/* Bumble Stripes */}
          <path d="M26 48 Q50 56 74 48" stroke="#1A2340" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M24 60 Q50 68 76 60" stroke="#1A2340" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Cute Bull Horns (Golden/Bronze) */}
          <path d="M30 32 C26 20 20 22 18 26 C20 34 32 36 32 36" fill="#D97706" />
          <path d="M70 32 C74 20 80 22 82 26 C80 34 68 36 68 36" fill="#D97706" />

          {/* Cheerful Eyes */}
          <circle cx="40" cy="46" r="4.5" fill="#1A2340" />
          <circle cx="60" cy="46" r="4.5" fill="#1A2340" />
          <circle cx="42" cy="44" r="1.5" fill="#FFFFFF" />
          <circle cx="62" cy="44" r="1.5" fill="#FFFFFF" />

          {/* Rosy Cheeks */}
          <circle cx="34" cy="52" r="3.5" fill="#FF6B6B" fillOpacity="0.6" />
          <circle cx="66" cy="52" r="3.5" fill="#FF6B6B" fillOpacity="0.6" />

          {/* Smile */}
          {mood === 'celebrate' ? (
            <path d="M42 54 Q50 64 58 54 Z" fill="#1A2340" />
          ) : mood === 'thinking' ? (
            <ellipse cx="50" cy="55" rx="3" ry="2" fill="#1A2340" />
          ) : (
            <path d="M42 54 Q50 62 58 54" stroke="#1A2340" strokeWidth="3" strokeLinecap="round" fill="none" />
          )}

          {/* Sparkle on head */}
          <path d="M50 20 L51.5 24 L55.5 25.5 L51.5 27 L50 31 L48.5 27 L44.5 25.5 L48.5 24 Z" fill="#FBBF24" />
        </svg>
      </motion.div>

      {dialog && (
        <div className="bg-white border-2 border-amber-200 rounded-2xl px-4 py-2.5 shadow-sm text-sm font-semibold text-slate-800 relative max-w-xs">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-white" />
          {dialog}
        </div>
      )}
    </div>
  );
}
