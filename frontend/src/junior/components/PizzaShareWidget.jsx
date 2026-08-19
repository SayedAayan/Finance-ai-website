import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, Award, Zap, Coins } from 'lucide-react';

export default function PizzaShareWidget({ onComplete }) {
  const TOTAL_SLICES = 8;
  const [selectedSlices, setSelectedSlices] = useState(1);
  const companyProfit = 8000;

  const percentage = ((selectedSlices / TOTAL_SLICES) * 100).toFixed(0);
  const yourShareProfit = ((selectedSlices / TOTAL_SLICES) * companyProfit).toLocaleString('en-IN');

  const handleSliceClick = (index) => {
    setSelectedSlices(index + 1);
    if (onComplete && index + 1 >= 2) {
      onComplete();
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50/50 border-2 border-amber-300/80 rounded-3xl p-6 my-5 text-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 font-black text-amber-950 text-base junior-font-heading">
          <Sparkles size={20} className="text-amber-500 animate-pulse" />
          <span>Interactive Co-Ownership Lab: The Pizza Company 🍕</span>
        </div>
        <span className="bg-amber-400/30 border border-amber-400 text-amber-950 text-xs font-black px-3.5 py-1.5 rounded-full self-start sm:self-auto shadow-xs">
          {selectedSlices} / {TOTAL_SLICES} Slices Owned ({percentage}%)
        </span>
      </div>

      <p className="text-xs md:text-sm text-amber-950/80 font-medium mb-5">
        Click or tap on the pizza slices below to acquire more shares. Notice how your ownership slice and profit dividend increase instantly!
      </p>

      <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
        {/* Interactive Pizza Graphic */}
        <div className="relative w-56 h-56 flex-shrink-0 select-none">
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
            {/* Crust Glow */}
            <circle cx="100" cy="100" r="95" fill="#D97706" />
            <circle cx="100" cy="100" r="88" fill="#FDE68A" />

            {/* 8 Slices */}
            {Array.from({ length: TOTAL_SLICES }).map((_, i) => {
              const startAngle = (i * 360) / TOTAL_SLICES;
              const endAngle = ((i + 1) * 360) / TOTAL_SLICES;
              const isSelected = i < selectedSlices;

              const polarToCartesian = (cx, cy, r, angleInDegrees) => {
                const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
                return {
                  x: cx + r * Math.cos(angleInRadians),
                  y: cy + r * Math.sin(angleInRadians)
                };
              };

              const p1 = polarToCartesian(100, 100, 86, startAngle);
              const p2 = polarToCartesian(100, 100, 86, endAngle);
              const pathData = `M 100 100 L ${p1.x} ${p1.y} A 86 86 0 0 1 ${p2.x} ${p2.y} Z`;

              const pMid = polarToCartesian(100, 100, 52, startAngle + 22.5);

              return (
                <g key={i} className="cursor-pointer group" onClick={() => handleSliceClick(i)}>
                  <path
                    d={pathData}
                    fill={isSelected ? '#10B981' : '#F59E0B'}
                    stroke="#B45309"
                    strokeWidth="2.5"
                    className="transition-all duration-200 group-hover:opacity-90"
                  />
                  {/* Pepperoni Topping */}
                  <circle
                    cx={pMid.x}
                    cy={pMid.y}
                    r="6.5"
                    fill={isSelected ? '#047857' : '#EF4444'}
                    stroke="#991B1B"
                    strokeWidth="1.5"
                    className="pointer-events-none"
                  />
                </g>
              );
            })}

            {/* Center Golden Pin */}
            <circle cx="100" cy="100" r="16" fill="#F59E0B" stroke="#92400E" strokeWidth="2.5" />
            <circle cx="100" cy="100" r="8" fill="#FEF3C7" />
          </svg>
        </div>

        {/* Dynamic Outcome Stats */}
        <div className="flex-1 space-y-3 w-full">
          <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Company Total Annual Profit:</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">₹8,000</div>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                Your Co-Owner Profit Share ({percentage}%):
              </span>
              <span className="text-xs bg-emerald-200 text-emerald-950 font-black px-2 py-0.5 rounded-md">
                +{percentage}% Slices
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1 flex items-center gap-1.5">
              <Coins size={22} className="text-emerald-600" />
              ₹{yourShareProfit}
            </div>
          </div>

          {selectedSlices >= 2 && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 text-xs text-emerald-900 font-black bg-emerald-100/90 p-3.5 rounded-2xl border border-emerald-300 shadow-xs"
            >
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              <span>You understand the core secret of the stock market: owning shares means owning a slice of real profits!</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
