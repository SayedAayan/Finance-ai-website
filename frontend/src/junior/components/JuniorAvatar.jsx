import React from 'react';

export const JUNIOR_AVATARS = [
  {
    id: 'ninja',
    name: 'Shadow Ninja',
    category: 'Action & Stealth',
    bgColor: '#EA580C',
    bgSecondary: '#C2410C'
  },
  {
    id: 'pirate',
    name: 'Pirate Captain',
    category: 'Adventure & Treasure',
    bgColor: '#0D9488',
    bgSecondary: '#115E59'
  },
  {
    id: 'wizard',
    name: 'Mystic Wizard',
    category: 'Magic & Lore',
    bgColor: '#7C3AED',
    bgSecondary: '#5B21B6'
  },
  {
    id: 'robot',
    name: 'Retro Robot',
    category: 'Sci-Fi & Tech',
    bgColor: '#0284C7',
    bgSecondary: '#0369A1'
  },
  {
    id: 'spaceship',
    name: 'Starfighter',
    category: 'Space & Cosmos',
    bgColor: '#1E1B4B',
    bgSecondary: '#312E81'
  },
  {
    id: 'scientist',
    name: 'Mad Scientist',
    category: 'Genius & Labs',
    bgColor: '#4F46E5',
    bgSecondary: '#3730A3'
  },
  {
    id: 'queen',
    name: 'Royal Sovereign',
    category: 'Kingdom & Strategy',
    bgColor: '#BE123C',
    bgSecondary: '#9F1239'
  },
  {
    id: 'dragon',
    name: 'Crimson Dragon',
    category: 'Mythic & Power',
    bgColor: '#991B1B',
    bgSecondary: '#7F1D1D'
  },
  {
    id: 'archer',
    name: 'Ranger Archer',
    category: 'Focus & Aim',
    bgColor: '#047857',
    bgSecondary: '#065F46'
  },
  {
    id: 'sword',
    name: 'Legend Sword',
    category: 'Champion & Valor',
    bgColor: '#374151',
    bgSecondary: '#1F2937'
  },
  {
    id: 'car',
    name: 'Vintage Racer',
    category: 'Speed & Drive',
    bgColor: '#E11D48',
    bgSecondary: '#BE123C'
  },
  {
    id: 'astrocat',
    name: 'Cosmic Astro-Cat',
    category: 'Fun & Discovery',
    bgColor: '#0369A1',
    bgSecondary: '#075985'
  },
  {
    id: 'map',
    name: 'Treasure Scroll',
    category: 'Explorer & Quests',
    bgColor: '#B45309',
    bgSecondary: '#92400E'
  },
  {
    id: 'burger',
    name: 'Mega Burger',
    category: 'Fun & Casual',
    bgColor: '#D97706',
    bgSecondary: '#B45309'
  },
  {
    id: 'potion',
    name: 'Magic Elixir',
    category: 'Alchemist & Craft',
    bgColor: '#6B21A8',
    bgSecondary: '#581C87'
  },
  {
    id: 'skull',
    name: 'Raider Skull',
    category: 'Bravery & Grit',
    bgColor: '#18181B',
    bgSecondary: '#27272A'
  }
];

export default function JuniorAvatar({ avatarId = 'ninja', size = 48, className = '' }) {
  const av = JUNIOR_AVATARS.find(a => a.id === avatarId) || JUNIOR_AVATARS[0];

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative select-none flex-shrink-0 flex items-center justify-center rounded-full overflow-hidden shadow-md border-2 border-white/80 hover:scale-105 transition-all ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background Circle */}
        <circle cx="50" cy="50" r="50" fill={av.bgColor} />
        {/* Dual-tone Bottom Half Shadow */}
        <path d="M 0 50 Q 50 65 100 50 L 100 100 L 0 100 Z" fill={av.bgSecondary} opacity="0.4" />

        {/* ══════════════════════════════════════════
            1. SHADOW NINJA
           ══════════════════════════════════════════ */}
        {av.id === 'ninja' && (
          <g>
            {/* Katana on Back */}
            <line x1="72" y1="20" x2="88" y2="4" stroke="#F1F5F9" strokeWidth="4" strokeLinecap="round" />
            <rect x="70" y="18" width="8" height="3" fill="#F59E0B" rx="1" transform="rotate(-45 74 19)" />
            {/* Head Silhouette */}
            <circle cx="50" cy="46" r="28" fill="#1E293B" />
            <path d="M 22 46 C 22 75 35 88 50 92 C 65 88 78 75 78 46 Z" fill="#0F172A" />
            {/* Ninja Mask Visor Opening */}
            <path d="M 32 44 Q 50 40 68 44 Q 68 56 50 56 Q 32 56 32 44 Z" fill="#FED7AA" />
            {/* Fierce Anime/Flat Eyes */}
            <path d="M 36 49 L 45 47 L 44 51 Z" fill="#0F172A" />
            <path d="M 64 49 L 55 47 L 56 51 Z" fill="#0F172A" />
            <circle cx="41" cy="49" r="1.5" fill="#38BDF8" />
            <circle cx="59" cy="49" r="1.5" fill="#38BDF8" />
            {/* Headband with Gold Emblem */}
            <path d="M 23 36 Q 50 30 77 36 L 76 42 Q 50 36 24 42 Z" fill="#DC2626" />
            <circle cx="50" cy="36" r="4" fill="#FBBF24" />
          </g>
        )}

        {/* ══════════════════════════════════════════
            2. PIRATE CAPTAIN
           ══════════════════════════════════════════ */}
        {av.id === 'pirate' && (
          <g>
            {/* Pirate Tricorn Hat */}
            <path d="M 12 40 C 25 18 75 18 88 40 C 70 34 30 34 12 40 Z" fill="#0F172A" />
            <path d="M 40 28 L 50 20 L 60 28 Z" fill="#F59E0B" />
            <circle cx="50" cy="28" r="3.5" fill="#DC2626" />
            {/* Face */}
            <circle cx="50" cy="54" r="22" fill="#FDBA74" />
            {/* Black Beard */}
            <path d="M 28 54 C 28 82 50 88 50 88 C 50 88 72 82 72 54 C 68 62 60 66 50 66 C 40 66 32 62 28 54 Z" fill="#1E293B" />
            {/* Eyepatch Left */}
            <circle cx="41" cy="50" r="5.5" fill="#0F172A" />
            <line x1="28" y1="42" x2="52" y2="58" stroke="#0F172A" strokeWidth="2.5" />
            {/* Good Eye Right */}
            <circle cx="59" cy="50" r="3.5" fill="#0F172A" />
            <circle cx="60" cy="49" r="1.2" fill="#FFFFFF" />
            {/* Smirk & Moustache */}
            <path d="M 38 60 Q 50 65 62 60" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="28" cy="58" r="3" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
          </g>
        )}

        {/* ══════════════════════════════════════════
            3. MYSTIC WIZARD
           ══════════════════════════════════════════ */}
        {av.id === 'wizard' && (
          <g>
            {/* Crystal Staff (Left) */}
            <line x1="20" y1="90" x2="20" y2="30" stroke="#D97706" strokeWidth="4" />
            <circle cx="20" cy="24" r="7" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
            <circle cx="18" cy="22" r="2" fill="#FFFFFF" />
            {/* Wizard Robe & Face */}
            <circle cx="54" cy="52" r="20" fill="#FFEDD5" />
            {/* Long Silver Beard */}
            <path d="M 36 54 C 36 86 54 94 54 94 C 54 94 72 86 72 54 C 64 62 54 64 54 64 C 54 64 44 62 36 54 Z" fill="#E2E8F0" />
            {/* Wise Eyes */}
            <path d="M 44 50 Q 48 47 52 50" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 58 50 Q 62 47 66 50" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Pointed Wizard Hat */}
            <path d="M 18 42 Q 54 36 90 42 L 68 8 Q 50 4 36 20 Z" fill="#4C1D95" />
            <path d="M 26 42 Q 54 37 82 42 L 80 46 Q 54 41 28 46 Z" fill="#F59E0B" />
            <polygon points="54,20 57,26 63,27 58,31 60,37 54,34 48,37 50,31 45,27 51,26" fill="#FEF08A" />
          </g>
        )}

        {/* ══════════════════════════════════════════
            4. RETRO TIN ROBOT
           ══════════════════════════════════════════ */}
        {av.id === 'robot' && (
          <g>
            {/* Robot Straw/Fedora Hat */}
            <ellipse cx="50" cy="24" rx="34" ry="7" fill="#CA8A04" />
            <path d="M 32 24 L 35 12 Q 50 10 65 12 L 68 24 Z" fill="#EAB308" />
            <rect x="34" y="20" width="32" height="4" fill="#DC2626" />
            {/* Metallic Head Block */}
            <rect x="30" y="32" width="40" height="38" rx="8" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
            {/* Ear Bolts */}
            <rect x="24" y="44" width="6" height="12" rx="2" fill="#CBD5E1" />
            <rect x="70" y="44" width="6" height="12" rx="2" fill="#CBD5E1" />
            {/* Round Gauge Eyes */}
            <circle cx="42" cy="46" r="6.5" fill="#FEF08A" stroke="#0F172A" strokeWidth="2" />
            <circle cx="58" cy="46" r="6.5" fill="#FEF08A" stroke="#0F172A" strokeWidth="2" />
            <circle cx="43" cy="45" r="2.5" fill="#0F172A" />
            <circle cx="59" cy="45" r="2.5" fill="#0F172A" />
            {/* Grid Teeth Mouth */}
            <rect x="38" y="58" width="24" height="6" rx="3" fill="#1E293B" />
            <line x1="44" y1="58" x2="44" y2="64" stroke="#64748B" strokeWidth="1.5" />
            <line x1="50" y1="58" x2="50" y2="64" stroke="#64748B" strokeWidth="1.5" />
            <line x1="56" y1="58" x2="56" y2="64" stroke="#64748B" strokeWidth="1.5" />
          </g>
        )}

        {/* ══════════════════════════════════════════
            5. LASER STARFIGHTER
           ══════════════════════════════════════════ */}
        {av.id === 'spaceship' && (
          <g>
            {/* Cosmic Stars Background */}
            <circle cx="20" cy="20" r="1.5" fill="#FFFFFF" />
            <circle cx="80" cy="25" r="2" fill="#FEF08A" />
            <circle cx="30" cy="75" r="1.5" fill="#FFFFFF" />
            <circle cx="85" cy="70" r="1" fill="#FFFFFF" />
            {/* Thruster Jet Flame */}
            <polygon points="50,96 42,75 58,75" fill="#EF4444" />
            <polygon points="50,90 45,75 55,75" fill="#FBBF24" />
            {/* Starfighter Wings */}
            <polygon points="50,25 15,70 30,75 50,65" fill="#0284C7" stroke="#0369A1" strokeWidth="1.5" />
            <polygon points="50,25 85,70 70,75 50,65" fill="#0284C7" stroke="#0369A1" strokeWidth="1.5" />
            {/* Wing Laser Blasters */}
            <rect x="12" y="60" width="5" height="16" rx="2" fill="#F59E0B" />
            <rect x="83" y="60" width="5" height="16" rx="2" fill="#F59E0B" />
            {/* Fuselage Hull */}
            <path d="M 50 14 L 38 72 L 62 72 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
            {/* Cockpit Canopy */}
            <ellipse cx="50" cy="45" rx="6" ry="14" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
            <ellipse cx="49" cy="42" rx="2" ry="6" fill="#FFFFFF" />
          </g>
        )}

        {/* ══════════════════════════════════════════
            6. MAD SCIENTIST
           ══════════════════════════════════════════ */}
        {av.id === 'scientist' && (
          <g>
            {/* Wild Orange/Red Hair Cloud */}
            <circle cx="28" cy="38" r="16" fill="#EA580C" />
            <circle cx="72" cy="38" r="16" fill="#EA580C" />
            <circle cx="50" cy="24" r="18" fill="#EA580C" />
            <circle cx="38" cy="20" r="14" fill="#F97316" />
            <circle cx="62" cy="20" r="14" fill="#F97316" />
            {/* Face */}
            <circle cx="50" cy="52" r="22" fill="#FED7AA" />
            {/* Lab Coat V */}
            <path d="M 32 74 L 50 88 L 68 74 L 80 100 L 20 100 Z" fill="#F8FAFC" />
            <polygon points="50,78 46,90 54,90" fill="#10B981" />
            {/* Big Round Glasses */}
            <circle cx="41" cy="48" r="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
            <circle cx="59" cy="48" r="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
            <line x1="49" y1="48" x2="51" y2="48" stroke="#0F172A" strokeWidth="2.5" />
            {/* Crazy Swirl Pupils */}
            <circle cx="41" cy="48" r="3.5" fill="#10B981" />
            <circle cx="59" cy="48" r="3.5" fill="#10B981" />
            {/* Wacky Teeth Smile */}
            <path d="M 40 64 Q 50 72 60 64 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          </g>
        )}

        {/* ══════════════════════════════════════════
            7. ROYAL QUEEN
           ══════════════════════════════════════════ */}
        {av.id === 'queen' && (
          <g>
            {/* Golden Flowing Hair */}
            <path d="M 24 45 C 18 70 30 90 32 95 L 68 95 C 70 90 82 70 76 45 Z" fill="#F59E0B" />
            {/* Face */}
            <circle cx="50" cy="52" r="20" fill="#FFEDD5" />
            {/* Royal Crown */}
            <polygon points="32,32 36,16 43,26 50,14 57,26 64,16 68,32" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
            <circle cx="50" cy="14" r="2.5" fill="#EF4444" />
            <circle cx="36" cy="16" r="2" fill="#3B82F6" />
            <circle cx="64" cy="16" r="2" fill="#3B82F6" />
            {/* Royal Robe & Jewels */}
            <path d="M 30 76 Q 50 88 70 76 L 78 100 L 22 100 Z" fill="#BE123C" />
            <circle cx="50" cy="80" r="4" fill="#FBBF24" />
            <circle cx="50" cy="80" r="2" fill="#3B82F6" />
            {/* Elegant Face Details */}
            <circle cx="43" cy="50" r="2.5" fill="#0F172A" />
            <circle cx="57" cy="50" r="2.5" fill="#0F172A" />
            <path d="M 46 62 Q 50 65 54 62" stroke="#BE123C" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* ══════════════════════════════════════════
            8. CRIMSON DRAGON
           ══════════════════════════════════════════ */}
        {av.id === 'dragon' && (
          <g>
            {/* Dragon Horns */}
            <path d="M 32 30 C 20 12 12 16 10 8 C 18 10 26 20 28 28 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
            <path d="M 68 30 C 80 12 88 16 90 8 C 82 10 74 20 72 28 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
            {/* Dragon Head */}
            <path d="M 26 40 Q 50 28 74 40 L 78 68 Q 50 84 22 68 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
            {/* Snout scales */}
            <path d="M 34 56 Q 50 50 66 56 L 68 74 Q 50 82 32 74 Z" fill="#EF4444" />
            {/* Glowing Golden Reptile Eyes */}
            <polygon points="34,44 44,40 42,48" fill="#FBBF24" />
            <line x1="39" y1="41" x2="39" y2="47" stroke="#0F172A" strokeWidth="2" />
            <polygon points="66,44 56,40 58,48" fill="#FBBF24" />
            <line x1="61" y1="41" x2="61" y2="47" stroke="#0F172A" strokeWidth="2" />
            {/* Sharp Dragon Fangs */}
            <polygon points="40,68 43,76 46,68" fill="#FFFFFF" />
            <polygon points="54,68 57,76 60,68" fill="#FFFFFF" />
          </g>
        )}

        {/* ══════════════════════════════════════════
            9. RANGER ARCHER
           ══════════════════════════════════════════ */}
        {av.id === 'archer' && (
          <g>
            {/* Quiver of Arrows behind shoulder */}
            <line x1="72" y1="36" x2="88" y2="12" stroke="#92400E" strokeWidth="3" />
            <polygon points="86,10 92,14 88,18" fill="#10B981" />
            <line x1="68" y1="40" x2="84" y2="16" stroke="#92400E" strokeWidth="3" />
            <polygon points="82,14 88,18 84,22" fill="#F59E0B" />
            {/* Archer Green Hood */}
            <path d="M 22 46 C 22 18 50 14 50 14 C 50 14 78 18 78 46 C 78 78 68 84 50 88 C 32 84 22 78 22 46 Z" fill="#047857" />
            {/* Face in Hood shadow */}
            <ellipse cx="50" cy="52" rx="18" ry="19" fill="#FED7AA" />
            {/* Hood Trim */}
            <path d="M 28 42 Q 50 32 72 42 Q 50 38 28 42 Z" fill="#065F46" />
            {/* Focused Eyes */}
            <circle cx="43" cy="50" r="2.5" fill="#0F172A" />
            <circle cx="57" cy="50" r="2.5" fill="#0F172A" />
            {/* Determined Brow */}
            <line x1="38" y1="46" x2="47" y2="47" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="62" y1="46" x2="53" y2="47" stroke="#0F172A" strokeWidth="1.5" />
          </g>
        )}

        {/* ══════════════════════════════════════════
            10. LEGEND SWORD IN STONE
           ══════════════════════════════════════════ */}
        {av.id === 'sword' && (
          <g>
            {/* Lightning bolt behind */}
            <polygon points="68,8 54,32 64,32 48,58 54,42 44,42" fill="#FEF08A" />
            {/* Mountain Stone */}
            <polygon points="15,95 38,62 62,62 85,95" fill="#4B5563" />
            <polygon points="38,62 50,70 62,62 70,95 30,95" fill="#374151" />
            {/* Sword Blade */}
            <polygon points="48,22 52,22 51,70 49,70" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
            <line x1="50" y1="22" x2="50" y2="68" stroke="#CBD5E1" strokeWidth="1" />
            {/* Sword Crossguard */}
            <rect x="36" y="20" width="28" height="4.5" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            {/* Sword Hilt & Pommel */}
            <rect x="47" y="10" width="6" height="10" fill="#DC2626" rx="1" />
            <circle cx="50" cy="8" r="4.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            <circle cx="50" cy="8" r="2" fill="#38BDF8" />
          </g>
        )}

        {/* ══════════════════════════════════════════
            11. VINTAGE RACER #53
           ══════════════════════════════════════════ */}
        {av.id === 'car' && (
          <g>
            {/* Car Wheels */}
            <circle cx="30" cy="74" r="10" fill="#0F172A" />
            <circle cx="30" cy="74" r="5" fill="#CBD5E1" />
            <circle cx="70" cy="74" r="10" fill="#0F172A" />
            <circle cx="70" cy="74" r="5" fill="#CBD5E1" />
            {/* Retro Buggy Body */}
            <path d="M 18 64 C 18 48 30 36 50 36 C 70 36 82 48 82 64 L 84 72 L 16 72 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
            {/* Racing Stripes */}
            <rect x="45" y="36" width="4" height="36" fill="#2563EB" />
            <rect x="51" y="36" width="3" height="36" fill="#DC2626" />
            {/* Front Headlights */}
            <circle cx="28" cy="58" r="5.5" fill="#FEF08A" stroke="#64748B" strokeWidth="1.5" />
            <circle cx="72" cy="58" r="5.5" fill="#FEF08A" stroke="#64748B" strokeWidth="1.5" />
            {/* Number 53 Badge */}
            <circle cx="50" cy="56" r="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
            <text x="50" y="60" fontSize="9" fontWeight="900" textAnchor="middle" fill="#0F172A">53</text>
          </g>
        )}

        {/* ══════════════════════════════════════════
            12. COSMIC ASTRO-CAT
           ══════════════════════════════════════════ */}
        {av.id === 'astrocat' && (
          <g>
            {/* Space Helmet Outer Ring */}
            <circle cx="50" cy="50" r="32" fill="#E0F2FE" stroke="#0284C7" strokeWidth="3" />
            {/* Helmet Visor Reflection */}
            <path d="M 30 30 Q 50 22 70 30" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Orange Cat Head Inside */}
            <circle cx="50" cy="54" r="18" fill="#F97316" />
            {/* Cat Ears */}
            <polygon points="36,44 32,32 44,38" fill="#F97316" />
            <polygon points="35,42 34,35 41,39" fill="#FECDD3" />
            <polygon points="64,44 68,32 56,38" fill="#F97316" />
            <polygon points="65,42 66,35 59,39" fill="#FECDD3" />
            {/* Cat Eyes */}
            <ellipse cx="44" cy="53" rx="2.5" ry="3.5" fill="#0F172A" />
            <ellipse cx="56" cy="53" rx="2.5" ry="3.5" fill="#0F172A" />
            <circle cx="45" cy="52" r="1" fill="#FFFFFF" />
            <circle cx="57" cy="52" r="1" fill="#FFFFFF" />
            {/* Cat Nose & Whiskers */}
            <polygon points="49,58 51,58 50,60" fill="#FECDD3" />
            <line x1="36" y1="58" x2="44" y2="59" stroke="#0F172A" strokeWidth="1" />
            <line x1="64" y1="58" x2="56" y2="59" stroke="#0F172A" strokeWidth="1" />
          </g>
        )}

        {/* ══════════════════════════════════════════
            13. TREASURE MAP SCROLL
           ══════════════════════════════════════════ */}
        {av.id === 'map' && (
          <g>
            {/* Rolled Parchment Scroll */}
            <rect x="22" y="24" width="56" height="52" rx="6" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
            {/* Scroll Rolled Ends */}
            <ellipse cx="22" cy="50" rx="4" ry="26" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
            <ellipse cx="78" cy="50" rx="4" ry="26" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
            {/* Dotted Treasure Path */}
            <path d="M 32 62 Q 44 42 54 52 T 66 38" stroke="#DC2626" strokeWidth="2.5" strokeDasharray="3 3" fill="none" />
            {/* Red X Marks the Spot */}
            <line x1="62" y1="34" x2="70" y2="42" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="70" y1="34" x2="62" y2="42" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" />
            {/* Compass Star */}
            <polygon points="36,32 38,36 42,36 39,39 40,43 36,40 32,43 33,39 30,36 34,36" fill="#0D9488" />
          </g>
        )}

        {/* ══════════════════════════════════════════
            14. MEGA BURGER
           ══════════════════════════════════════════ */}
        {av.id === 'burger' && (
          <g>
            {/* Top Sesame Bun */}
            <path d="M 20 44 C 20 22 80 22 80 44 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            {/* Sesame Seeds */}
            <ellipse cx="38" cy="30" rx="2" ry="1" fill="#FEF3C7" transform="rotate(-15 38 30)" />
            <ellipse cx="50" cy="26" rx="2" ry="1" fill="#FEF3C7" />
            <ellipse cx="62" cy="32" rx="2" ry="1" fill="#FEF3C7" transform="rotate(15 62 32)" />
            {/* Green Lettuce Wave */}
            <path d="M 18 46 Q 26 42 34 46 Q 42 42 50 46 Q 58 42 66 46 Q 74 42 82 46 L 82 50 L 18 50 Z" fill="#10B981" />
            {/* Red Tomato Slice */}
            <rect x="20" y="50" width="60" height="5" fill="#EF4444" rx="2" />
            {/* Melted Yellow Cheese */}
            <polygon points="20,55 80,55 74,62 64,55 54,64 44,55 34,63 26,55" fill="#FBBF24" />
            {/* Juicy Meat Patty */}
            <rect x="18" y="58" width="64" height="9" fill="#78350F" rx="4" />
            {/* Bottom Bun */}
            <rect x="22" y="68" width="56" height="10" rx="5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          </g>
        )}

        {/* ══════════════════════════════════════════
            15. MAGIC ELIXIR POTION
           ══════════════════════════════════════════ */}
        {av.id === 'potion' && (
          <g>
            {/* Glass Bottle Neck & Cork */}
            <rect x="42" y="16" width="16" height="8" rx="2" fill="#D97706" />
            <rect x="40" y="24" width="20" height="12" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
            {/* Round Bottle Body */}
            <circle cx="50" cy="60" r="26" fill="#F8FAFC" stroke="#64748B" strokeWidth="2.5" />
            {/* Glowing Purple Liquid */}
            <path d="M 26 60 Q 50 52 74 60 C 74 74 64 84 50 84 C 36 84 26 74 26 60 Z" fill="#A855F7" />
            {/* Bubble Sparkles */}
            <circle cx="44" cy="66" r="3" fill="#F0ABFC" />
            <circle cx="56" cy="72" r="2.5" fill="#F0ABFC" />
            <circle cx="40" cy="74" r="1.5" fill="#FFFFFF" />
            {/* Glass Highlight */}
            <path d="M 32 46 Q 40 40 48 42" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* ══════════════════════════════════════════
            16. RAIDER SKULL
           ══════════════════════════════════════════ */}
        {av.id === 'skull' && (
          <g>
            {/* Crossed Bones */}
            <line x1="22" y1="22" x2="78" y2="78" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
            <line x1="78" y1="22" x2="22" y2="78" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
            {/* Skull Cranium */}
            <circle cx="50" cy="46" r="22" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Skull Jaw */}
            <rect x="40" y="58" width="20" height="12" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Black Eye Sockets */}
            <circle cx="42" cy="46" r="5.5" fill="#0F172A" />
            <circle cx="58" cy="46" r="5.5" fill="#0F172A" />
            {/* Glowing Eye Spark */}
            <circle cx="43" cy="45" r="1.8" fill="#38BDF8" />
            {/* Nose Hole */}
            <polygon points="50,52 48,56 52,56" fill="#0F172A" />
            {/* Teeth */}
            <line x1="45" y1="60" x2="45" y2="68" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="50" y1="60" x2="50" y2="68" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="55" y1="60" x2="55" y2="68" stroke="#0F172A" strokeWidth="1.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
