import React from 'react';
import { motion } from 'framer-motion';

export default function BuzzyMascot({ size = 80, mood = 'happy', dialog = '', className = '' }) {
  // Premium Modern Geometric 3D Bull & Bear Mascot Duo
  const isCompact = size <= 50;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        animate={
          mood === 'celebrate'
            ? { y: [0, -6, 0], scale: [1, 1.03, 1] }
            : mood === 'thinking'
            ? { rotate: [-2, 2, -2] }
            : { y: [0, -3, 0] }
        }
        transition={{ repeat: Infinity, duration: mood === 'celebrate' ? 1.5 : 3.5, ease: 'easeInOut' }}
        style={{ width: size, height: size * (isCompact ? 1 : 0.88) }}
        className="flex-shrink-0 relative select-none"
      >
        <svg viewBox="0 0 160 110" className="w-full h-full drop-shadow-md overflow-visible">
          <defs>
            {/* Bull 3D Gradient */}
            <linearGradient id="bullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="60%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>

            {/* Bull Horn Metallic Gold */}
            <linearGradient id="goldHorns" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Bear 3D Gradient */}
            <linearGradient id="bearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="60%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#9A3412" />
            </linearGradient>

            {/* Glass Highlights */}
            <linearGradient id="glassLight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* ══════════════════════════════════════════
              BULL (GROWTH & OPTIMISM) - LEFT
             ══════════════════════════════════════════ */}
          <g transform="translate(8, 6)">
            {/* Sleek Golden Horns */}
            <path
              d="M18 24 C10 10 18 2 28 6 C24 14 26 20 22 24 Z"
              fill="url(#goldHorns)"
              filter="drop-shadow(0 2px 4px rgba(180,83,9,0.3))"
            />
            <path
              d="M58 24 C66 10 58 2 48 6 C52 14 50 20 54 24 Z"
              fill="url(#goldHorns)"
              filter="drop-shadow(0 2px 4px rgba(180,83,9,0.3))"
            />

            {/* Ears */}
            <ellipse cx="14" cy="36" rx="7" ry="4" fill="#1D4ED8" transform="rotate(-20 14 36)" />
            <ellipse cx="62" cy="36" rx="7" ry="4" fill="#1D4ED8" transform="rotate(20 62 36)" />

            {/* Bull Body Sphere */}
            <circle cx="38" cy="48" r="26" fill="url(#bullGrad)" />
            <ellipse cx="38" cy="32" rx="18" ry="10" fill="url(#glassLight)" opacity="0.4" />

            {/* Bull Snout */}
            <ellipse cx="38" cy="58" rx="15" ry="10" fill="#93C5FD" />
            <circle cx="32" cy="57" r="1.8" fill="#1E3A8A" />
            <circle cx="44" cy="57" r="1.8" fill="#1E3A8A" />
            {/* Modern Gold Ring */}
            <path d="M34 62 C34 67 42 67 42 62" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Confident Friendly Eyes */}
            <circle cx="28" cy="42" r="4.5" fill="#0F172A" />
            <circle cx="48" cy="42" r="4.5" fill="#0F172A" />
            <circle cx="29.5" cy="40.5" r="1.5" fill="#FFFFFF" />
            <circle cx="49.5" cy="40.5" r="1.5" fill="#FFFFFF" />

            {/* Cheeks */}
            <circle cx="20" cy="50" r="3" fill="#F43F5E" fillOpacity="0.3" />
            <circle cx="56" cy="50" r="3" fill="#F43F5E" fillOpacity="0.3" />
          </g>

          {/* ══════════════════════════════════════════
              BEAR (WISDOM & PATIENCE) - RIGHT
             ══════════════════════════════════════════ */}
          <g transform="translate(82, 10)">
            {/* Bear Ears */}
            <circle cx="18" cy="18" r="9" fill="url(#bearGrad)" />
            <circle cx="54" cy="18" r="9" fill="url(#bearGrad)" />
            <circle cx="18" cy="18" r="5" fill="#FED7AA" />
            <circle cx="54" cy="18" r="5" fill="#FED7AA" />

            {/* Bear Body Sphere */}
            <circle cx="36" cy="44" r="25" fill="url(#bearGrad)" />
            <ellipse cx="36" cy="30" rx="16" ry="9" fill="url(#glassLight)" opacity="0.4" />

            {/* Bear Muzzle */}
            <ellipse cx="36" cy="52" rx="13" ry="10" fill="#FED7AA" />
            <ellipse cx="36" cy="47" rx="4" ry="3" fill="#0F172A" />
            <circle cx="37" cy="46" r="0.9" fill="#FFFFFF" />

            {/* Calm Smile */}
            <path d="M31 53 Q36 58 41 53" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" fill="none" />

            {/* Bear Eyes */}
            <circle cx="26" cy="36" r="4.2" fill="#0F172A" />
            <circle cx="46" cy="36" r="4.2" fill="#0F172A" />
            <circle cx="27.5" cy="34.5" r="1.5" fill="#FFFFFF" />
            <circle cx="47.5" cy="34.5" r="1.5" fill="#FFFFFF" />

            {/* Cheeks */}
            <circle cx="18" cy="44" r="3" fill="#FB7185" fillOpacity="0.3" />
            <circle cx="54" cy="44" r="3" fill="#FB7185" fillOpacity="0.3" />
          </g>

          {/* Center Connection Star */}
          {mood === 'celebrate' && (
            <g transform="translate(73, 14)">
              <circle cx="7" cy="7" r="10" fill="#FEF08A" fillOpacity="0.4" />
              <path d="M7 0 L9 5 L14 7 L9 9 L7 14 L5 9 L0 7 L5 5 Z" fill="#F59E0B" />
            </g>
          )}
        </svg>
      </motion.div>

      {dialog && (
        <div className="bg-white border-2 border-blue-100 rounded-2xl px-4 py-2.5 shadow-sm text-xs font-bold text-slate-800 relative max-w-xs leading-relaxed">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-white" />
          {dialog}
        </div>
      )}
    </div>
  );
}
