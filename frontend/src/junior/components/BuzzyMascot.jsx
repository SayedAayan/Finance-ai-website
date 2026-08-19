import React from 'react';
import { motion } from 'framer-motion';

export default function BuzzyMascot({ size = 48, className = '', animate = true }) {
  // Official StockBuzz Favicon Badge
  return (
    <motion.div
      animate={animate ? { y: [0, -3, 0] } : undefined}
      transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
      className={`relative select-none flex-shrink-0 flex items-center justify-center ${className}`}
    >
      <div className="w-full h-full rounded-2xl bg-white p-1.5 shadow-[0_8px_20px_-4px_rgba(134,59,255,0.25)] border-2 border-purple-100 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
        <img
          src="/favicon.svg"
          alt="StockBuzz Favicon"
          className="w-full h-full object-contain drop-shadow-xs"
          onError={(e) => {
            e.target.src = '/favicon.png';
          }}
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
