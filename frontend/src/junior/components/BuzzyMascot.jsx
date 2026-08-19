import React from 'react';
import { motion } from 'framer-motion';

export default function BuzzyMascot({ size = 48, className = '', animate = true }) {
  // Futuristic 3D Cosmic Growth Rocket Emblem for StockBuzz Junior
  return (
    <motion.div
      animate={animate ? { y: [0, -4, 0], rotate: [0, 1.5, 0] } : undefined}
      transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
      className={`relative select-none flex-shrink-0 flex items-center justify-center ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg overflow-visible">
        <defs>
          {/* Main Hull 3D Gradient (Electric Sapphire & Indigo) */}
          <linearGradient id="rocketHull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="40%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          {/* Golden Nosecone & Trim Gradient */}
          <linearGradient id="rocketGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Jet Booster Flame Gradient */}
          <linearGradient id="rocketFlame" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="40%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>

          {/* Specular Glass Highlight */}
          <linearGradient id="hullGleam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Frosted Halo Circle */}
        <circle cx="50" cy="50" r="46" fill="#EFF6FF" stroke="#DBEAFE" strokeWidth="1.5" />

        {/* ─── Rocket Propulsion Flame ─── */}
        <path
          d="M 44 76 Q 50 96 50 96 Q 50 96 56 76 Q 50 82 44 76 Z"
          fill="url(#rocketFlame)"
        />
        <path
          d="M 46 76 Q 50 88 50 88 Q 50 88 54 76 Q 50 80 46 76 Z"
          fill="#FEF08A"
        />

        {/* ─── Rocket Fins (Aerodynamic Stabilizers) ─── */}
        {/* Left Fin */}
        <path
          d="M 36 60 L 22 74 C 20 78 28 80 34 74 L 38 68 Z"
          fill="url(#rocketGold)"
          stroke="#B45309"
          strokeWidth="1.2"
        />
        {/* Right Fin */}
        <path
          d="M 64 60 L 78 74 C 80 78 72 80 66 74 L 62 68 Z"
          fill="url(#rocketGold)"
          stroke="#B45309"
          strokeWidth="1.2"
        />

        {/* ─── Main Aerodynamic Fuselage / Rocket Body ─── */}
        <path
          d="M 50 14 C 38 32 34 52 36 74 Q 50 78 64 74 C 66 52 62 32 50 14 Z"
          fill="url(#rocketHull)"
          stroke="#1E40AF"
          strokeWidth="1.5"
        />

        {/* Specular Sleek Body Gleam */}
        <path
          d="M 50 16 C 42 32 38 48 40 68 C 42 66 46 42 50 16 Z"
          fill="url(#hullGleam)"
        />

        {/* Golden Nosecone Cap */}
        <path
          d="M 50 14 C 45 22 43 28 42 34 Q 50 36 58 34 C 57 28 55 22 50 14 Z"
          fill="url(#rocketGold)"
          stroke="#B45309"
          strokeWidth="1"
        />

        {/* ─── Glowing Round Observation Porthole ─── */}
        <circle cx="50" cy="46" r="10" fill="#0F172A" stroke="url(#rocketGold)" strokeWidth="2.5" />
        <circle cx="50" cy="46" r="7.5" fill="#38BDF8" />
        {/* Window Reflection Star */}
        <path
          d="M 48 43 L 49.5 45.5 L 52 46 L 49.5 46.5 L 48 49 L 46.5 46.5 L 44 46 L 46.5 45.5 Z"
          fill="#FFFFFF"
        />

        {/* Golden Base Engine Nozzle Ring */}
        <path
          d="M 39 74 Q 50 78 61 74 L 59 78 Q 50 82 41 78 Z"
          fill="url(#rocketGold)"
          stroke="#B45309"
          strokeWidth="1"
        />

        {/* ─── Sparkle Orbiting Stars ─── */}
        <g transform="translate(68, 22)">
          <path
            d="M 6 0 L 7.5 3.5 L 11 4.5 L 7.5 5.5 L 6 9 L 4.5 5.5 L 1 4.5 L 4.5 3.5 Z"
            fill="#F59E0B"
          />
        </g>
        <g transform="translate(18, 42)">
          <circle cx="3" cy="3" r="2.5" fill="#60A5FA" opacity="0.8" />
        </g>
      </svg>
    </motion.div>
  );
}

export function BullMascot(props) {
  return <BuzzyMascot {...props} />;
}

export function BearMascot({ size = 48, className = '' }) {
  // Sleek Golden Guardian Shield Emblem for Safety & Risk
  return (
    <div style={{ width: size, height: size }} className={`flex items-center justify-center flex-shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="60%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1.5" />
        <path
          d="M 50 20 L 74 30 C 74 54 62 72 50 80 C 38 72 26 54 26 30 Z"
          fill="url(#shieldGrad)"
          stroke="#92400E"
          strokeWidth="2"
        />
        <path
          d="M 50 28 L 66 35 C 66 52 56 65 50 71 C 44 65 34 52 34 35 Z"
          fill="#FEF3C7"
          opacity="0.9"
        />
        <path
          d="M 44 48 L 48 53 L 58 41"
          stroke="#B45309"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
