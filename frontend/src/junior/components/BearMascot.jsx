import React from 'react';
import { motion } from 'framer-motion';

export default function BearMascot({ size = 48, className = '', animate = true }) {
  // Sleek, Wise Modern 3D Bear (Represents Risk Management, Patience, and Safe Investing)
  return (
    <motion.div
      animate={animate ? { y: [0, -3, 0] } : undefined}
      transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
      className={`relative select-none flex-shrink-0 flex items-center justify-center ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          {/* Amber & Bronze Bear Gradient */}
          <linearGradient id="bearBody3D" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="50%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#7C2D12" />
          </linearGradient>

          {/* Warm Muzzle Gradient */}
          <linearGradient id="bearMuzzle3D" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFEDD5" />
            <stop offset="100%" stopColor="#FED7AA" />
          </linearGradient>

          {/* Luminous Specular Reflection */}
          <linearGradient id="bearSheen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Halo */}
        <circle cx="50" cy="50" r="46" fill="#FFF7ED" stroke="#FFEDD5" strokeWidth="1.5" />

        {/* ─── Round Bear Ears ─── */}
        <circle cx="30" cy="28" r="14" fill="url(#bearBody3D)" stroke="#9A3412" strokeWidth="1.5" />
        <circle cx="70" cy="28" r="14" fill="url(#bearBody3D)" stroke="#9A3412" strokeWidth="1.5" />
        <circle cx="30" cy="28" r="7" fill="#FED7AA" />
        <circle cx="70" cy="28" r="7" fill="#FED7AA" />

        {/* ─── Bear Head Shape ─── */}
        <ellipse cx="50" cy="54" rx="28" ry="26" fill="url(#bearBody3D)" stroke="#9A3412" strokeWidth="1.5" />

        {/* Forehead Highlight */}
        <ellipse cx="50" cy="40" rx="18" ry="10" fill="url(#bearSheen)" />

        {/* ─── Bear Muzzle ─── */}
        <ellipse cx="50" cy="62" rx="16" ry="13" fill="url(#bearMuzzle3D)" stroke="#FDBA74" strokeWidth="1.2" />

        {/* Shiny Black Button Nose */}
        <ellipse cx="50" cy="56" rx="5.5" ry="4" fill="#0F172A" />
        <circle cx="51.5" cy="55" r="1.2" fill="#FFFFFF" />

        {/* Calm Wise Smile */}
        <path d="M 44 64 Q 50 70 56 64" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* ─── Intelligent Friendly Eyes ─── */}
        <circle cx="38" cy="45" r="4.2" fill="#0F172A" />
        <circle cx="62" cy="45" r="4.2" fill="#0F172A" />
        <circle cx="39.5" cy="43.5" r="1.5" fill="#FFFFFF" />
        <circle cx="63.5" cy="43.5" r="1.5" fill="#FFFFFF" />

        {/* Subtle Cheeks */}
        <circle cx="28" cy="54" r="3.5" fill="#FB7185" fillOpacity="0.3" />
        <circle cx="72" cy="54" r="3.5" fill="#FB7185" fillOpacity="0.3" />
      </svg>
    </motion.div>
  );
}
