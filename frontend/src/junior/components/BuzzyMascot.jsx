import React from 'react';
import BullMascot from './BullMascot';
import BearMascot from './BearMascot';

export default function BuzzyMascot({ size = 48, character = 'bull', mood = 'happy', dialog = '', className = '' }) {
  if (character === 'bear') {
    return <BearMascot size={size} className={className} />;
  }

  // Default clean Bull mascot
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <BullMascot size={size} />
      {dialog && (
        <div className="bg-white border-2 border-blue-100 rounded-2xl px-4 py-2 shadow-sm text-xs font-bold text-slate-800 relative max-w-xs leading-relaxed">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-white" />
          {dialog}
        </div>
      )}
    </div>
  );
}
export { BullMascot, BearMascot };
