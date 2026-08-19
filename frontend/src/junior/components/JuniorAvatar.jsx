import React from 'react';

export const JUNIOR_AVATARS = [
  {
    id: 'ren',
    name: 'Ren (Cyber Boy)',
    role: 'Tech & AI Trader',
    hairColor: '#3B82F6',
    skinColor: '#FED7AA',
    eyeColor: '#1D4ED8',
    headset: '#60A5FA',
    bg: 'from-blue-600 to-indigo-800',
    ring: 'border-blue-400'
  },
  {
    id: 'yuki',
    name: 'Yuki (Star Analyst)',
    role: 'Quant & Stats Genius',
    hairColor: '#8B5CF6',
    skinColor: '#FFEDD5',
    eyeColor: '#6D28D9',
    glasses: true,
    bg: 'from-purple-600 to-indigo-900',
    ring: 'border-purple-400'
  },
  {
    id: 'kai',
    name: 'Kai (Flame Scout)',
    role: 'Momentum Specialist',
    hairColor: '#F97316',
    skinColor: '#FED7AA',
    eyeColor: '#C2410C',
    goggles: true,
    bg: 'from-orange-500 to-amber-700',
    ring: 'border-orange-400'
  },
  {
    id: 'hana',
    name: 'Hana (Zen Strategist)',
    role: 'Long-term Compounding',
    hairColor: '#10B981',
    skinColor: '#FFEDD5',
    eyeColor: '#047857',
    earpiece: true,
    bg: 'from-emerald-500 to-teal-800',
    ring: 'border-emerald-400'
  },
  {
    id: 'ryu',
    name: 'Ryu (Shadow Ninja)',
    role: 'Market Timing Master',
    hairColor: '#1E293B',
    skinColor: '#FED7AA',
    eyeColor: '#38BDF8',
    mask: true,
    bg: 'from-slate-800 to-slate-950',
    ring: 'border-cyan-400'
  },
  {
    id: 'mia',
    name: 'Mia (Solar Pilot)',
    role: 'Global Market Captain',
    hairColor: '#FBBF24',
    skinColor: '#FFEDD5',
    eyeColor: '#D97706',
    aviator: true,
    bg: 'from-amber-400 to-orange-600',
    ring: 'border-yellow-300'
  },
  {
    id: 'jin',
    name: 'Jin (Mecha Leader)',
    role: 'Portfolio Commander',
    hairColor: '#E2E8F0',
    skinColor: '#FED7AA',
    eyeColor: '#0284C7',
    cyberMark: true,
    bg: 'from-slate-600 to-blue-900',
    ring: 'border-sky-400'
  },
  {
    id: 'sora',
    name: 'Sora (Cosmic Voyager)',
    role: 'Future Growth Hunter',
    hairColor: '#06B6D4',
    skinColor: '#FFEDD5',
    eyeColor: '#0891B2',
    starPin: true,
    bg: 'from-cyan-500 to-blue-700',
    ring: 'border-cyan-300'
  },
  {
    id: 'akira',
    name: 'Akira (Neon Hacker)',
    role: 'Algorithm Explorer',
    hairColor: '#EF4444',
    skinColor: '#FED7AA',
    eyeColor: '#B91C1C',
    headset: '#F87171',
    bg: 'from-red-500 to-rose-800',
    ring: 'border-rose-400'
  },
  {
    id: 'lin',
    name: 'Lin (Crystal Scholar)',
    role: 'Value Investor',
    hairColor: '#EC4899',
    skinColor: '#FFEDD5',
    eyeColor: '#BE185D',
    twinBuns: true,
    bg: 'from-pink-500 to-fuchsia-800',
    ring: 'border-pink-300'
  },
  {
    id: 'kenji',
    name: 'Kenji (Elite Investor)',
    role: 'CEO & Visionary',
    hairColor: '#334155',
    skinColor: '#FED7AA',
    eyeColor: '#2563EB',
    smartTie: true,
    bg: 'from-indigo-600 to-slate-900',
    ring: 'border-indigo-400'
  },
  {
    id: 'chiyo',
    name: 'Chiyo (Arcade Champion)',
    role: 'Gamefi & Tech Savvy',
    hairColor: '#A855F7',
    skinColor: '#FFEDD5',
    eyeColor: '#7E22CE',
    catHeadset: true,
    bg: 'from-purple-500 to-pink-700',
    ring: 'border-purple-300'
  }
];

export default function JuniorAvatar({ avatarId = 'ren', size = 48, className = '', showRole = false }) {
  const av = JUNIOR_AVATARS.find(a => a.id === avatarId) || JUNIOR_AVATARS[0];

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative select-none flex-shrink-0 flex items-center justify-center rounded-2xl md:rounded-3xl bg-gradient-to-br ${av.bg} border-2 ${av.ring} shadow-md overflow-hidden transition-all ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
        <defs>
          <linearGradient id={`skin_${av.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF7ED" />
            <stop offset="100%" stopColor={av.skinColor} />
          </linearGradient>
          <linearGradient id={`hair_${av.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
            <stop offset="10%" stopColor={av.hairColor} />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.65" />
          </linearGradient>
        </defs>

        {/* Ambient Halo */}
        <circle cx="50" cy="50" r="48" fill="#FFFFFF" fillOpacity="0.08" />

        {/* Anime Neck & Collar */}
        <path d="M 44 68 L 44 78 L 56 78 L 56 68 Z" fill={av.skinColor} />
        <path d="M 32 76 Q 50 86 68 76 L 76 100 L 24 100 Z" fill="#0F172A" />
        {/* Jacket V-Collar */}
        <path d="M 40 76 L 50 88 L 60 76" stroke={av.hairColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Anime Face Shape (Chin Point) */}
        <path
          d="M 32 40 C 32 60 40 74 50 78 C 60 74 68 60 68 40 C 68 28 32 28 32 40 Z"
          fill={`url(#skin_${av.id})`}
        />

        {/* Anime Ears */}
        <ellipse cx="30" cy="50" rx="3.5" ry="6" fill={av.skinColor} />
        <ellipse cx="70" cy="50" rx="3.5" ry="6" fill={av.skinColor} />

        {/* Anime Eyes */}
        <g>
          {/* Left Eye */}
          <ellipse cx="41" cy="50" rx="4.5" ry="6" fill="#0F172A" />
          <ellipse cx="41" cy="51" rx="3.5" ry="4.5" fill={av.eyeColor} />
          <circle cx="42.5" cy="48.5" r="1.8" fill="#FFFFFF" />
          <circle cx="39.5" cy="52.5" r="1" fill="#FFFFFF" />
          {/* Upper Eyelash line */}
          <path d="M 36 45 Q 42 43 47 46" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Right Eye */}
          <ellipse cx="59" cy="50" rx="4.5" ry="6" fill="#0F172A" />
          <ellipse cx="59" cy="51" rx="3.5" ry="4.5" fill={av.eyeColor} />
          <circle cx="60.5" cy="48.5" r="1.8" fill="#FFFFFF" />
          <circle cx="57.5" cy="52.5" r="1" fill="#FFFFFF" />
          {/* Upper Eyelash line */}
          <path d="M 53 46 Q 58 43 64 45" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>

        {/* Rosy Cheeks */}
        <ellipse cx="36" cy="57" rx="3.5" ry="2" fill="#FB7185" fillOpacity="0.4" />
        <ellipse cx="64" cy="57" rx="3.5" ry="2" fill="#FB7185" fillOpacity="0.4" />

        {/* Anime Nose & Smile */}
        <circle cx="50" cy="58" r="1" fill="#EA580C" opacity="0.6" />
        <path d="M 46 64 Q 50 67 54 64" stroke="#991B1B" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Ninja Mask Option */}
        {av.mask && (
          <path d="M 32 58 Q 50 68 68 58 L 68 76 Q 50 82 32 76 Z" fill="#0F172A" />
        )}

        {/* Glasses Option */}
        {av.glasses && (
          <g stroke="#F59E0B" strokeWidth="2" fill="none">
            <rect x="35" y="44" width="12" height="11" rx="3" fill="#FFFFFF" fillOpacity="0.2" />
            <rect x="53" y="44" width="12" height="11" rx="3" fill="#FFFFFF" fillOpacity="0.2" />
            <line x1="47" y1="49" x2="53" y2="49" />
          </g>
        )}

        {/* ─── Stylish Anime Hair (Layered Spikes & Bangs) ─── */}
        {/* Hair Back Volume */}
        <path
          d="M 28 42 C 20 25 32 10 50 10 C 68 10 80 25 72 42 Z"
          fill={`url(#hair_${av.id})`}
        />
        {/* Spiky Anime Bangs Over Forehead */}
        <path
          d="M 26 36 L 36 46 L 38 32 L 48 48 L 52 30 L 62 48 L 64 34 L 74 40 L 70 24 C 65 14 35 14 30 24 Z"
          fill={`url(#hair_${av.id})`}
        />
        {/* Hair Gloss Sheen Arc */}
        <path
          d="M 36 22 Q 50 16 64 22"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* Headset / Cat Ears / Accessories */}
        {av.headset && (
          <g>
            <path d="M 28 36 C 28 16 72 16 72 36" stroke={av.headset} strokeWidth="3.5" fill="none" />
            <ellipse cx="28" cy="46" rx="4" ry="7" fill={av.headset} />
            <ellipse cx="72" cy="46" rx="4" ry="7" fill={av.headset} />
            {/* Mic boom */}
            <path d="M 72 48 Q 65 62 56 60" stroke="#0F172A" strokeWidth="1.8" fill="none" />
            <circle cx="55" cy="60" r="2" fill="#EF4444" />
          </g>
        )}

        {av.catHeadset && (
          <g>
            <path d="M 28 36 C 28 16 72 16 72 36" stroke="#F43F5E" strokeWidth="3" fill="none" />
            {/* Cat Ears on Band */}
            <polygon points="32,20 40,8 44,22" fill="#F43F5E" />
            <polygon points="34,19 40,11 42,20" fill="#FECDD3" />
            <polygon points="68,20 60,8 56,22" fill="#F43F5E" />
            <polygon points="66,19 60,11 58,20" fill="#FECDD3" />
            <ellipse cx="28" cy="46" rx="4" ry="6" fill="#F43F5E" />
            <ellipse cx="72" cy="46" rx="4" ry="6" fill="#F43F5E" />
          </g>
        )}

        {av.goggles && (
          <g>
            <path d="M 26 28 Q 50 20 74 28" stroke="#D97706" strokeWidth="4" fill="none" />
            <circle cx="40" cy="24" r="7" fill="#FEF08A" stroke="#B45309" strokeWidth="2" />
            <circle cx="60" cy="24" r="7" fill="#FEF08A" stroke="#B45309" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
}
