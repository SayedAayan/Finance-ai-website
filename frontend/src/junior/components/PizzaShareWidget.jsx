import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2 } from 'lucide-react';

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
    <div className="bg-amber-50/70 border-2 border-amber-200/80 rounded-2xl p-5 my-4 text-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
          <Sparkles size={18} className="text-amber-500" />
          <span>Interactive Co-Ownership Lab: The 8-Slice Pizza Company</span>
        </div>
        <span className="bg-amber-200/80 text-amber-950 text-xs font-extrabold px-3 py-1 rounded-full">
          {selectedSlices} / {TOTAL_SLICES} Slices Owned ({percentage}%)
        </span>
      </div>

      <p className="text-xs text-amber-900/80 mb-4">
        Tap the slices to buy more shares. Watch how your co-ownership and profit share grow!
      </p>

      <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
        {/* Interactive Pizza Visual */}
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
            {/* Crust background */}
            <circle cx="100" cy="100" r="92" fill="#D97706" />
            <circle cx="100" cy="100" r="84" fill="#FEF3C7" />

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

              const p1 = polarToCartesian(100, 100, 82, startAngle);
              const p2 = polarToCartesian(100, 100, 82, endAngle);
              const pathData = `M 100 100 L ${p1.x} ${p1.y} A 82 82 0 0 1 ${p2.x} ${p2.y} Z`;

              return (
                <path
                  key={i}
                  d={pathData}
                  fill={isSelected ? '#12B76A' : '#FDE68A'}
                  stroke="#D97706"
                  strokeWidth="2"
                  className="cursor-pointer transition-colors hover:opacity-90"
                  onClick={() => handleSliceClick(i)}
                />
              );
            })}

            {/* Center Pepperoni Pin */}
            <circle cx="100" cy="100" r="14" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
          </svg>
        </div>

        {/* Dynamic Outcome Stats */}
        <div className="flex-1 space-y-2.5 w-full">
          <div className="bg-white rounded-xl p-3 border border-amber-200">
            <span className="text-xs text-slate-500 font-medium">Company Annual Profit:</span>
            <div className="text-base font-bold text-slate-900">₹8,000</div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
            <span className="text-xs text-emerald-700 font-semibold">Your Share of Company Profits ({percentage}%):</span>
            <div className="text-lg font-extrabold text-emerald-700">₹{yourShareProfit} 🎉</div>
          </div>

          {selectedSlices >= 2 && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-100/70 p-2 rounded-lg">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              Awesome! You now understand how shares make you a true co-owner!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
