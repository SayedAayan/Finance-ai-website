import React from 'react';

export const JUNIOR_AVATARS = [
  { id: 'rocket', name: 'Cosmic Cadet', emoji: '🚀', bg: 'from-blue-500 to-indigo-600', ring: 'border-blue-400' },
  { id: 'crown', name: 'Future CEO', emoji: '👑', bg: 'from-amber-400 to-amber-600', ring: 'border-amber-400' },
  { id: 'spark', name: 'Speed Trader', emoji: '⚡', bg: 'from-yellow-400 to-amber-500', ring: 'border-yellow-400' },
  { id: 'diamond', name: 'Diamond Hands', emoji: '💎', bg: 'from-cyan-400 to-blue-600', ring: 'border-cyan-400' },
  { id: 'robot', name: 'Cyber Analyst', emoji: '🤖', bg: 'from-purple-500 to-indigo-700', ring: 'border-purple-400' },
  { id: 'game', name: 'Pixel Gamer', emoji: '🎮', bg: 'from-pink-500 to-rose-600', ring: 'border-pink-400' },
  { id: 'lion', name: 'Lion Investor', emoji: '🦁', bg: 'from-orange-400 to-red-600', ring: 'border-orange-400' },
  { id: 'owl', name: 'Wise Scholar', emoji: '🦉', bg: 'from-emerald-400 to-teal-600', ring: 'border-emerald-400' },
  { id: 'star', name: 'Star Leader', emoji: '🌟', bg: 'from-amber-300 to-yellow-500', ring: 'border-amber-300' },
  { id: 'shield', name: 'Risk Guardian', emoji: '🛡️', bg: 'from-blue-600 to-slate-800', ring: 'border-blue-500' },
  { id: 'ninja', name: 'Market Ninja', emoji: '🥷', bg: 'from-slate-700 to-slate-950', ring: 'border-slate-500' },
  { id: 'logo', name: 'StockBuzz Star', emoji: 'LOGO', bg: 'from-white to-blue-50', ring: 'border-blue-300' }
];

export default function JuniorAvatar({ avatarId = 'rocket', size = 48, className = '', showGlow = true }) {
  const avatar = JUNIOR_AVATARS.find(a => a.id === avatarId) || JUNIOR_AVATARS[0];

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative select-none flex-shrink-0 flex items-center justify-center rounded-2xl md:rounded-3xl bg-gradient-to-br ${avatar.bg} border-2 ${avatar.ring} shadow-md overflow-hidden transition-transform ${className}`}
    >
      {avatar.id === 'logo' ? (
        <img
          src="/stockbuzz-logo-star.png"
          alt="StockBuzz Star"
          className="w-3/4 h-3/4 object-contain drop-shadow-md"
        />
      ) : (
        <span
          style={{ fontSize: size * 0.52 }}
          className="filter drop-shadow-sm flex items-center justify-center"
        >
          {avatar.emoji}
        </span>
      )}
    </div>
  );
}
