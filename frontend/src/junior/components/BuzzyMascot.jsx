import React from 'react';
import { motion } from 'framer-motion';

export default function BuzzyMascot({ size = 80, mood = 'happy', dialog = '', className = '' }) {
  // Cartoon Bull (Bully) & Bear (Barry) Duo Mascot
  const isCompact = size <= 50;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        animate={
          mood === 'celebrate'
            ? { y: [0, -8, 0], rotate: [-2, 2, -2] }
            : mood === 'thinking'
            ? { rotate: [-3, 3, -3] }
            : { y: [0, -4, 0] }
        }
        transition={{ repeat: Infinity, duration: mood === 'celebrate' ? 1.2 : 3, ease: 'easeInOut' }}
        style={{ width: size, height: (size * (isCompact ? 1 : 0.85)) }}
        className="flex-shrink-0 relative select-none"
      >
        <svg viewBox="0 0 160 110" className="w-full h-full drop-shadow-lg overflow-visible">
          <defs>
            {/* Bull Gradients */}
            <linearGradient id="bullBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="bullHornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Bear Gradients */}
            <linearGradient id="bearBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="bearMuzzleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="100%" stopColor="#FDBA74" />
            </linearGradient>

            {/* Sparkle Gold */}
            <linearGradient id="goldStar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
          </defs>

          {/* ══════════════════════════════════════════
              BULLY THE CARTOON BULL (LEFT)
             ══════════════════════════════════════════ */}
          <g transform="translate(10, 8)">
            {/* Bull Horns */}
            <path
              d="M16 28 C8 12 18 2 28 8 C22 18 24 24 22 28 Z"
              fill="url(#bullHornGrad)"
              stroke="#B45309"
              strokeWidth="1.5"
            />
            <path
              d="M56 28 C64 12 54 2 44 8 C50 18 48 24 50 28 Z"
              fill="url(#bullHornGrad)"
              stroke="#B45309"
              strokeWidth="1.5"
            />

            {/* Bull Ears */}
            <ellipse cx="14" cy="38" rx="8" ry="5" fill="#1E40AF" transform="rotate(-20 14 38)" />
            <ellipse cx="58" cy="38" rx="8" ry="5" fill="#1E40AF" transform="rotate(20 58 38)" />
            <ellipse cx="14" cy="38" rx="5" ry="3" fill="#93C5FD" transform="rotate(-20 14 38)" />
            <ellipse cx="58" cy="38" rx="5" ry="3" fill="#93C5FD" transform="rotate(20 58 38)" />

            {/* Bull Head */}
            <circle cx="36" cy="50" r="26" fill="url(#bullBodyGrad)" stroke="#1E3A8A" strokeWidth="2" />

            {/* Bull Snout */}
            <ellipse cx="36" cy="62" rx="16" ry="11" fill="#93C5FD" stroke="#1E40AF" strokeWidth="1.5" />
            {/* Nostrils */}
            <circle cx="30" cy="61" r="2" fill="#1E3A8A" />
            <circle cx="42" cy="61" r="2" fill="#1E3A8A" />
            {/* Golden Nose Ring */}
            <path d="M32 66 C32 72 40 72 40 66" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Bull Eyes */}
            <circle cx="27" cy="44" r="5.5" fill="#0F172A" />
            <circle cx="45" cy="44" r="5.5" fill="#0F172A" />
            <circle cx="28.5" cy="42.5" r="2" fill="#FFFFFF" />
            <circle cx="46.5" cy="42.5" r="2" fill="#FFFFFF" />
            <circle cx="25.5" cy="45.5" r="1" fill="#FFFFFF" />
            <circle cx="43.5" cy="45.5" r="1" fill="#FFFFFF" />

            {/* Rosy Cheeks */}
            <circle cx="20" cy="52" r="4" fill="#F43F5E" fillOpacity="0.4" />
            <circle cx="52" cy="52" r="4" fill="#F43F5E" fillOpacity="0.4" />

            {/* Lucky Growth Star on Forehead */}
            <path
              d="M36 28 L37.5 32 L41.5 32.5 L38.5 35 L39.5 39 L36 37 L32.5 39 L33.5 35 L30.5 32.5 L34.5 32 Z"
              fill="url(#goldStar)"
              stroke="#B45309"
              strokeWidth="0.8"
            />
          </g>

          {/* ══════════════════════════════════════════
              BARRY THE CARTOON BEAR (RIGHT)
             ══════════════════════════════════════════ */}
          <g transform="translate(85, 12)">
            {/* Bear Round Fluffy Ears */}
            <circle cx="16" cy="20" r="11" fill="url(#bearBodyGrad)" stroke="#C2410C" strokeWidth="1.5" />
            <circle cx="56" cy="20" r="11" fill="url(#bearBodyGrad)" stroke="#C2410C" strokeWidth="1.5" />
            <circle cx="16" cy="20" r="6" fill="#FED7AA" />
            <circle cx="56" cy="20" r="6" fill="#FED7AA" />

            {/* Bear Head */}
            <circle cx="36" cy="46" r="25" fill="url(#bearBodyGrad)" stroke="#C2410C" strokeWidth="2" />

            {/* Bear Muzzle */}
            <ellipse cx="36" cy="54" rx="14" ry="11" fill="url(#bearMuzzleGrad)" stroke="#EA580C" strokeWidth="1.5" />
            {/* Cute Black Button Nose */}
            <ellipse cx="36" cy="49" rx="5" ry="3.5" fill="#0F172A" />
            <circle cx="37" cy="48" r="1" fill="#FFFFFF" />

            {/* Cheerful Smile */}
            {mood === 'celebrate' ? (
              <path d="M31 56 Q36 64 41 56 Z" fill="#991B1B" />
            ) : (
              <path d="M31 55 Q36 61 41 55" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
            )}

            {/* Bear Eyes */}
            <circle cx="26" cy="38" r="5" fill="#0F172A" />
            <circle cx="46" cy="38" r="5" fill="#0F172A" />
            <circle cx="27.5" cy="36.5" r="2" fill="#FFFFFF" />
            <circle cx="47.5" cy="36.5" r="2" fill="#FFFFFF" />

            {/* Bear Cheeks */}
            <circle cx="19" cy="47" r="4" fill="#FB7185" fillOpacity="0.5" />
            <circle cx="53" cy="47" r="4" fill="#FB7185" fillOpacity="0.5" />

            {/* Cozy Scarf Knot */}
            <path
              d="M22 68 Q36 76 50 68 Q44 76 36 78 Q28 76 22 68 Z"
              fill="#06B6D4"
              stroke="#0891B2"
              strokeWidth="1.5"
            />
          </g>

          {/* ══════════════════════════════════════════
              HIGH-FIVE SPARKLE & CELEBRATION STARS
             ══════════════════════════════════════════ */}
          {mood === 'celebrate' ? (
            <g transform="translate(74, 18)">
              <circle cx="6" cy="6" r="12" fill="#FEF08A" fillOpacity="0.5" />
              <path d="M6 0 L8 4 L12 6 L8 8 L6 12 L4 8 L0 6 L4 4 Z" fill="#EAB308" />
            </g>
          ) : (
            <g transform="translate(77, 26)">
              <circle cx="4" cy="4" r="3" fill="#FDE047" />
            </g>
          )}
        </svg>
      </motion.div>

      {dialog && (
        <div className="bg-white border-2 border-blue-200/90 rounded-2xl px-4 py-2.5 shadow-md text-xs font-black text-slate-800 relative max-w-xs leading-relaxed">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-white" />
          {dialog}
        </div>
      )}
    </div>
  );
}
