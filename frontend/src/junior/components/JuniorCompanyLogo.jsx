import React, { useState } from 'react';

const JUNIOR_COMPANY_DOMAINS = {
  'RELIANCE': 'ril.com',
  'TCS': 'tcs.com',
  'HDFCBANK': 'hdfcbank.com',
  'INFY': 'infosys.com',
  'TATAMOTORS': 'tatamotors.com',
  'AAPL': 'apple.com',
  'DIS': 'disney.com',
  'MSFT': 'microsoft.com',
  'GOOGL': 'google.com',
  'AMZN': 'amazon.com',
  'TSLA': 'tesla.com',
  'NKE': 'nike.com'
};

const JUNIOR_COMPANY_THEMES = {
  'RELIANCE': { bg: 'bg-gradient-to-br from-amber-500 to-red-600', label: 'R', color: '#ffffff' },
  'TCS': { bg: 'bg-gradient-to-br from-blue-700 to-indigo-900', label: 'TCS', color: '#ffffff' },
  'HDFCBANK': { bg: 'bg-gradient-to-br from-red-600 to-red-800', label: 'HDFC', color: '#ffffff' },
  'INFY': { bg: 'bg-gradient-to-br from-cyan-600 to-blue-700', label: 'INFY', color: '#ffffff' },
  'TATAMOTORS': { bg: 'bg-gradient-to-br from-slate-700 to-slate-900', label: 'TATA', color: '#ffffff' },
  'AAPL': { bg: 'bg-gradient-to-br from-neutral-800 to-black', label: '', color: '#ffffff' },
  'DIS': { bg: 'bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800', label: '🏰', color: '#ffffff' },
  'MSFT': { bg: 'bg-gradient-to-br from-sky-600 to-blue-700', label: 'MS', color: '#ffffff' },
  'GOOGL': { bg: 'bg-gradient-to-br from-emerald-500 via-blue-500 to-red-500', label: 'G', color: '#ffffff' },
  'TSLA': { bg: 'bg-gradient-to-br from-rose-600 to-red-700', label: 'TESLA', color: '#ffffff' },
  'AMZN': { bg: 'bg-gradient-to-br from-amber-600 to-orange-700', label: 'a', color: '#ffffff' }
};

export default function JuniorCompanyLogo({ ticker, symbol, name, size = 48 }) {
  const [imgFailed, setImgFailed] = useState(false);

  const clean = (ticker || symbol || name || '')
    .toUpperCase()
    .replace(/\.(NS|BO|L|US)$/i, '')
    .trim();

  const domain = JUNIOR_COMPANY_DOMAINS[clean];
  const logoDevKey = import.meta.env.VITE_LOGO_DEV_KEY;
  const theme = JUNIOR_COMPANY_THEMES[clean] || {
    bg: 'bg-gradient-to-br from-blue-600 to-indigo-700',
    label: clean.slice(0, 3) || '★',
    color: '#ffffff'
  };

  if (domain && logoDevKey && !imgFailed) {
    return (
      <div
        className="rounded-2xl bg-white border border-slate-200/80 p-1.5 flex items-center justify-center shadow-xs flex-shrink-0 overflow-hidden"
        style={{ width: size, height: size }}
      >
        <img
          src={`https://img.logo.dev/${domain}?token=${logoDevKey}&size=${size * 3}&retina=true`}
          alt={clean}
          width={size}
          height={size}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain rounded-xl"
        />
      </div>
    );
  }

  const fontSize = theme.label.length > 3 ? size * 0.22 : theme.label.length >= 2 ? size * 0.28 : size * 0.45;

  return (
    <div
      className={`rounded-2xl ${theme.bg} text-white font-black flex items-center justify-center shadow-xs flex-shrink-0 tracking-wider select-none border border-white/20`}
      style={{ width: size, height: size, fontSize }}
    >
      {theme.label}
    </div>
  );
}
