import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Flame, BookOpen, TrendingUp, Trophy, ArrowRight, Shield } from 'lucide-react';
import BuzzyMascot from '../components/BuzzyMascot';
import JuniorCompanyLogo from '../components/JuniorCompanyLogo';

export default function JuniorHome({ account }) {
  const acc = account || {
    nickname: 'Junior Explorer',
    mode: 'explorer',
    currencySymbol: '₹',
    streakDays: 3,
    totalPoints: 150,
    portfolio: {
      cash: 95000,
      startingCash: 100000,
      investedValue: 5000,
      holdings: [
        {
          symbol: 'RELIANCE.NS',
          name: 'Reliance Industries',
          shares: 2,
          currentPrice: 2780
        }
      ]
    },
    badges: ['badge-first-step', 'badge-streak-3']
  };

  const totalWealth = (acc.portfolio.cash + (acc.portfolio.investedValue || 0));
  const startingWealth = acc.portfolio.startingCash || 100000;
  const growth = totalWealth - startingWealth;
  const isUp = growth >= 0;
  const holdings = acc.portfolio.holdings || [];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <BuzzyMascot size={72} mood="happy" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  {acc.mode === 'trader' ? 'Junior Trader (13-17)' : 'Junior Explorer (8-12)'}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950/40 px-2.5 py-0.5 rounded-full">
                  <Flame size={13} className="text-amber-400" /> {acc.streakDays || 1}-Day Streak!
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold junior-font-heading">
                Hey {acc.nickname}! 👋
              </h1>
              <p className="text-blue-100 text-xs md:text-sm">
                Ready to learn something awesome about the money world today?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 self-stretch md:self-auto">
            <div>
              <div className="text-xs text-blue-200 font-semibold">Junior Score</div>
              <div className="text-xl font-extrabold text-amber-300 flex items-center gap-1.5">
                <Sparkles size={18} /> {acc.totalPoints || 50} pts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Big Plain-Language Portfolio Card */}
      <div className="junior-card p-6 md:p-8 bg-white border-2 border-blue-100 shadow-sm rounded-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Virtual Piggy Bank
            </span>
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900 junior-font-heading mt-1">
              {acc.currencySymbol}{totalWealth.toLocaleString('en-IN')}
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm ${
            isUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            <span>{isUp ? '🎉' : '💡'}</span>
            <span>
              {isUp
                ? `You have grown your funds by ${acc.currencySymbol}${growth.toLocaleString('en-IN')}!`
                : `Your funds dipped by ${acc.currencySymbol}${Math.abs(growth).toLocaleString('en-IN')}. Good time to learn patience!`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 text-sm">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Available to Invest</span>
            <div className="text-base font-bold text-slate-800 mt-0.5">
              {acc.currencySymbol}{acc.portfolio.cash.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Invested in Companies</span>
            <div className="text-base font-bold text-slate-800 mt-0.5">
              {acc.currencySymbol}{(acc.portfolio.investedValue || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2 md:col-span-1">
            <span className="text-xs text-slate-500 font-medium">Companies Owned</span>
            <div className="text-base font-bold text-slate-800 mt-0.5">
              {holdings.length} companies
            </div>
          </div>
        </div>

        {/* Active Holdings Preview with Logos */}
        {holdings.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Your Company Co-Ownership Slices
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {holdings.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
                  <div className="flex items-center gap-3">
                    <JuniorCompanyLogo ticker={h.symbol || h.name} size={36} />
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">{h.name || h.symbol}</div>
                      <div className="text-[11px] font-semibold text-blue-600">{h.shares} Shares Owned</div>
                    </div>
                  </div>
                  <div className="text-xs font-extrabold text-slate-800">
                    {acc.currencySymbol}{((h.shares || 1) * (h.currentPrice || h.avgPrice || 1000)).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Lesson Card */}
        <Link
          to="/junior/learn"
          className="junior-card p-6 bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white border-2 border-amber-200 flex flex-col justify-between group cursor-pointer shadow-sm rounded-3xl"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold mb-4 shadow-md group-hover:scale-105 transition-transform">
              <BookOpen size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Interactive Mission
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 junior-font-heading mt-1 mb-2">
              Track 2: The Great Pizza Slice Secret 🍕
            </h2>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
              Slice a virtual pizza and see how buying 1 share turns you into a real part-owner of a business!
            </p>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-amber-100">
            <span className="text-xs font-bold text-amber-700">+100 Points</span>
            <span className="text-amber-800 font-extrabold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Start Activity <ArrowRight size={16} />
            </span>
          </div>
        </Link>

        {/* Paper Trade Card */}
        <Link
          to="/junior/trade"
          className="junior-card p-6 bg-gradient-to-br from-blue-500/10 via-blue-50/50 to-white border-2 border-blue-200 flex flex-col justify-between group cursor-pointer shadow-sm rounded-3xl"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold mb-4 shadow-md group-hover:scale-105 transition-transform">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Practice Market
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 junior-font-heading mt-1 mb-2">
              Explore Popular Brands 🎮 🚗 🍎
            </h2>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
              Buy shares in Tata, Apple, Disney, or Reliance with your virtual coins and explain why you like them!
            </p>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-blue-100">
            <span className="text-xs font-bold text-blue-700">Safe Virtual Ledger</span>
            <span className="text-blue-800 font-extrabold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Brand Cards <ArrowRight size={16} />
            </span>
          </div>
        </Link>
      </div>

      {/* Badges unlocked */}
      <div className="junior-card p-6 bg-white border-2 border-slate-100 shadow-sm rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" />
            <h2 className="font-extrabold text-base text-slate-900 junior-font-heading">
              Your Trophy Room ({acc.badges?.length || 1} Badges)
            </h2>
          </div>
          <Link to="/junior/missions" className="text-xs font-bold text-blue-600 hover:underline">
            View All
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          {(acc.badges || ['badge-first-step']).map((b, idx) => {
            const name = typeof b === 'string' ? b.replace('badge-', '').replace(/-/g, ' ').toUpperCase() : (b.name || 'Achievement');
            const desc = typeof b === 'object' ? b.description : 'Earned for taking the first step into learning!';
            return (
              <div key={idx} className="flex items-center gap-2.5 bg-amber-50/80 border border-amber-200 rounded-2xl px-4 py-2.5">
                <span className="text-xl">🏆</span>
                <div>
                  <div className="text-xs font-bold text-amber-950">{name}</div>
                  <div className="text-[11px] text-amber-800/80">{desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
