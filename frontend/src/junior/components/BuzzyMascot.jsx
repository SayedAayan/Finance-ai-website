import React from 'react';
import { motion } from 'framer-motion';

export default function BuzzyMascot({ size = 48, className = '', animate = true }) {
  // Official StockBuzz Dual-Triangle Star Favicon Emblem
  return (
    <motion.div
      animate={animate ? { y: [0, -3, 0], scale: [1, 1.02, 1] } : undefined}
      transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
      className={`relative select-none flex-shrink-0 flex items-center justify-center ${className}`}
    >
      <div className="w-full h-full rounded-2xl bg-white/95 backdrop-blur-md p-1.5 shadow-[0_10px_25px_-5px_rgba(37,99,235,0.25)] border-2 border-blue-100 flex items-center justify-center overflow-hidden hover:scale-105 transition-all">
        <img
          src="/stockbuzz-logo-star.png"
          alt="StockBuzz Star Logo"
          className="w-full h-full object-contain drop-shadow-md"
        />
      </div>
    </motion.div>
  );
}

export function BullMascot(props) {
  return <BuzzyMascot {...props} />;
}

export function BearMascot(props) {
  return <BuzzyMascot {...props} />;
}
