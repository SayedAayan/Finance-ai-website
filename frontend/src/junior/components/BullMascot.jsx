import React from 'react';
import { motion } from 'framer-motion';

export default function BullMascot({ size = 48, className = '', animate = true }) {
  // Sleek, Athletic Modern 3D Bull (Represents Growth, Buying, and Market Momentum)
  return (
    <motion.div
      animate={animate ? { y: [0, -3, 0] } : undefined}
      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
      className={`relative select-none flex-shrink-0 flex items-center justify-center ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          {/* Metallic Emerald & Azure Bull Gradient */}
          <linearGradient id="bullBody3D" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Majestic Gold Horns */}
          <linearGradient id="goldHorns3D" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="75%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#FFFBEB" />
          </linearGradient>

          {/* Luminous Specular Reflection */}
          <linearGradient id="bullSheen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Halo */}
        <circle cx="50" cy="50" r="46" fill="#EFF6FF" stroke="#DBEAFE" strokeWidth="1.5" />

        {/* ─── Powerful Curved Golden Horns ─── */}
        {/* Left Horn */}
        <path
          d="M 32 38 C 20 22 14 10 24 6 C 30 18 34 26 36 34 Z"
          fill="url(#goldHorns3D)"
          stroke="#B45309"
          strokeWidth="1.2"
        />
        {/* Right Horn */}
        <path
          d="M 68 38 C 80 22 86 10 76 6 C 70 18 66 26 64 34 Z"
          fill="url(#goldHorns3D)"
          stroke="#B45309"
          strokeWidth="1.2"
        />

        {/* ─── Bull Head Contour ─── */}
        <path
          d="M 32 36 Q 50 32 68 36 Q 76 56 66 74 Q 50 82 34 74 Q 24 56 32 36 Z"
          fill="url(#bullBody3D)"
          stroke="#1E3A8A"
          strokeWidth="1.5"
        />

        {/* Forehead Specular Highlight */}
        <path
          d="M 36 38 Q 50 35 64 38 Q 68 48 50 50 Q 32 48 36 38 Z"
          fill="url(#bullSheen)"
        />

        {/* ─── Ears ─── */}
        <path d="M 28 42 C 14 38 12 48 24 48 Z" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="1" />
        <path d="M 72 42 C 86 38 88 48 76 48 Z" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="1" />

        {/* ─── Snout & Nose ─── */}
        <path
          d="M 36 58 Q 50 56 64 58 Q 66 74 50 75 Q 34 74 36 58 Z"
          fill="#93C5FD"
          stroke="#60A5FA"
          strokeWidth="1.2"
        />
        {/* Nostrils */}
        <ellipse cx="44" cy="65" rx="2.5" ry="3.5" fill="#1E3A8A" />
        <ellipse cx="56" cy="65" rx="2.5" ry="3.5" fill="#1E3A8A" />

        {/* Golden Momentum Ring */}
        <path
          d="M 46 69 C 46 76 54 76 54 69"
          stroke="url(#goldHorns3D)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* ─── Confident Focused Eyes ─── */}
        <ellipse cx="39" cy="46" rx="4" ry="4.5" fill="#0F172A" />
        <ellipse cx="61" cy="46" rx="4" ry="4.5" fill="#0F172A" />
        <circle cx="40.5" cy="44.5" r="1.5" fill="#FFFFFF" />
        <circle cx="62.5" cy="44.5" r="1.5" fill="#FFFFFF" />
      </svg>
    </motion.div>
  );
}
