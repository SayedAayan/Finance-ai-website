import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, BookOpen, TrendingUp, Trophy, ArrowRight, Shield, Zap, CheckCircle2, Award, PieChart, Coins, HelpCircle, Gift } from 'lucide-react';
import BuzzyMascot from '../components/BuzzyMascot';
import JuniorCompanyLogo from '../components/JuniorCompanyLogo';

export default function JuniorHome({ account, onUpdateAccount }) {
  const [dailyQuizAnswered, setDailyQuizAnswered] = useState(false);
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [claimedReward, setClaimedReward] = useState(false);

  const acc = account || {
    nickname: 'Junior Explorer',
    mode: 'explorer',
    currencySymbol: '₹',
    streakDays: 3,
    totalPoints: 350,
    level: 2,
    levelTitle: 'Market Explorer',
    portfolio: {
      cash: 95000,
      startingCash: 100000,
      investedValue: 5000,
      holdings: [
        {
          symbol: 'TCS.NS',
          name: 'Tata Consultancy Services',
          shares: 1,
          avgPrice: 3890,
          currentPrice: 3950
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

  const handleClaimDailyReward = () => {
    if (claimedReward) return;
    setClaimedReward(true);
    if (onUpdateAccount) {
      onUpdateAccount({
        ...acc,
        totalPoints: (acc.totalPoints || 350) + 50
      });
    }
  };

  const handleDailyQuizSubmit = (optIndex) => {
    setQuizSelectedOption(optIndex);
    setDailyQuizAnswered(true);
    if (optIndex === 1 && onUpdateAccount) {
      onUpdateAccount({
        ...acc,
        totalPoints: (acc.totalPoints || 350) + 25
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 p-6 md:p-8 text-white shadow-[0_20px_50px_rgba(37,99,235,0.22)] border-2 border-white/20"
      >
        {/* Glow Spheres */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 md:gap-5">
            <BuzzyMascot size={78} mood={claimedReward ? "celebrate" : "happy"} />
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/20">
                  ⚡ Level {acc.level || 2}: {acc.levelTitle || 'Market Explorer'}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-extrabold text-amber-200 bg-amber-950/40 backdrop-blur-md px-3 py-0.5 rounded-full border border-amber-400/30">
                  <Flame size={13} className="text-amber-400 animate-pulse" /> {acc.streakDays || 1}-Day Streak!
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black junior-font-heading tracking-tight text-white drop-shadow-xs">
                Welcome back, {acc.nickname}! 🚀
              </h1>
              <p className="text-blue-100 text-xs md:text-sm max-w-md font-medium leading-relaxed">
                You're building super smart money habits! Ready to discover today's secret?
              </p>
            </div>
          </div>

          {/* Daily Reward Box */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 flex items-center gap-4 self-stretch md:self-auto shadow-inner">
            <div>
              <div className="text-[11px] text-blue-200 font-bold uppercase tracking-wider">Daily Bonus</div>
              <div className="text-lg font-black text-amber-300 flex items-center gap-1.5 mt-0.5">
                <Coins size={18} className="text-amber-400" /> +50 XP
              </div>
            </div>
            <button
              onClick={handleClaimDailyReward}
              disabled={claimedReward}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                claimedReward
                  ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 cursor-default'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md hover:scale-105 active:scale-95'
              }`}
            >
              {claimedReward ? '✓ Claimed!' : '🎁 Open Chest'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* 3D Piggy Bank & Portfolio Vault */}
      <div className="jr-glass-card p-6 md:p-8 bg-white border-2 border-blue-100/90 rounded-[32px] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🐷</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Your Virtual Piggy Vault
              </span>
            </div>
            <div className="text-3xl md:text-4xl font-black text-slate-900 junior-font-heading mt-1 flex items-baseline gap-2">
              <span>{acc.currencySymbol}{totalWealth.toLocaleString('en-IN')}</span>
              <span className="text-xs font-bold text-slate-400">virtual funds</span>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs md:text-sm shadow-xs ${
            isUp
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/90'
              : 'bg-rose-50 text-rose-800 border border-rose-200/90'
          }`}>
            <span className="text-base">{isUp ? '🎉' : '💡'}</span>
            <span>
              {isUp
                ? `You grew your piggy bank by +${acc.currencySymbol}${growth.toLocaleString('en-IN')} (+${((growth / startingWealth) * 100).toFixed(1)}%)!`
                : `Dipped by ${acc.currencySymbol}${Math.abs(growth).toLocaleString('en-IN')}. Great investors stay calm!`}
            </span>
          </div>
        </div>

        {/* Vault Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 pt-6 text-sm">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-100 flex flex-col justify-between">
            <span className="text-xs text-slate-500 font-bold">Ready to Invest</span>
            <div className="text-lg font-black text-slate-900 mt-1">
              {acc.currencySymbol}{acc.portfolio.cash.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-100 flex flex-col justify-between">
            <span className="text-xs text-slate-500 font-bold">Invested in Companies</span>
            <div className="text-lg font-black text-emerald-800 mt-1">
              {acc.currencySymbol}{(acc.portfolio.investedValue || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-100 col-span-2 md:col-span-1 flex flex-col justify-between">
            <span className="text-xs text-slate-500 font-bold">Co-Ownership Slices</span>
            <div className="text-lg font-black text-blue-700 mt-1">
              {holdings.length} Companies Owned
            </div>
          </div>
        </div>

        {/* Active Holdings Slices Preview */}
        {holdings.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Your Company Co-Ownership Slices
              </span>
              <Link to="/junior/trade" className="text-xs font-extrabold text-blue-600 hover:underline">
                Explore More Brands →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {holdings.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 transition-all shadow-xs">
                  <div className="flex items-center gap-3">
                    <JuniorCompanyLogo ticker={h.symbol || h.name} size={42} />
                    <div>
                      <div className="text-xs font-black text-slate-900">{h.name || h.symbol}</div>
                      <div className="text-[11px] font-bold text-blue-600 mt-0.5">{h.shares} Share(s) Owned</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900">
                      {acc.currencySymbol}{((h.shares || 1) * (h.currentPrice || h.avgPrice || 1000)).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600">Active Slice</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Interactive Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Lesson Card (Interactive Pizza) */}
        <Link
          to="/junior/learn"
          className="jr-glass-card p-6 bg-gradient-to-br from-amber-500/10 via-amber-50/40 to-white border-2 border-amber-200 flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center font-black mb-4 shadow-md group-hover:scale-110 transition-transform">
              <BookOpen size={28} />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-full">
              Mission 2: Interactive Lab
            </span>
            <h2 className="text-xl font-black text-slate-900 junior-font-heading mt-2 mb-2">
              The Great Pizza Slice Secret 🍕
            </h2>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
              Slice a virtual pizza with your mouse and see how 1 share turns you into a real business co-owner!
            </p>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-amber-200/60">
            <span className="text-xs font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full">+100 XP Points</span>
            <span className="text-amber-900 font-black text-sm flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
              Start Lab <ArrowRight size={16} />
            </span>
          </div>
        </Link>

        {/* Paper Trade Card */}
        <Link
          to="/junior/trade"
          className="jr-glass-card p-6 bg-gradient-to-br from-blue-500/10 via-blue-50/40 to-white border-2 border-blue-200 flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black mb-4 shadow-md group-hover:scale-110 transition-transform">
              <TrendingUp size={28} />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-blue-900 bg-blue-100/80 px-2.5 py-1 rounded-full">
              Market Practice: 18,000+ Stocks
            </span>
            <h2 className="text-xl font-black text-slate-900 junior-font-heading mt-2 mb-2">
              Explore Popular Brands 🎮 🚗 🍎
            </h2>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
              Pick your favorite brands like Apple, Tata Motors, Disney, or Zomato and explain why you believe in them!
            </p>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-blue-200/60">
            <span className="text-xs font-black text-blue-700 bg-blue-100 px-3 py-1 rounded-full">Guardian Safety Shield</span>
            <span className="text-blue-900 font-black text-sm flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
              Open Market <ArrowRight size={16} />
            </span>
          </div>
        </Link>
      </div>

      {/* Daily Brain Teaser Widget */}
      <div className="jr-glass-card p-6 bg-white border-2 border-indigo-100 rounded-[32px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle size={22} className="text-indigo-600" />
            <h3 className="font-black text-base text-slate-900 junior-font-heading">
              Daily Brain Teaser (+25 XP) 🧠
            </h3>
          </div>
          <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Quick 30s Check
          </span>
        </div>

        <p className="text-xs md:text-sm text-slate-700 font-semibold mb-4">
          "If you buy 1 share in a toy company that sells 1,000,000 robotic dogs, what does that make you?"
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 0, text: 'A toy tester only' },
            { id: 1, text: 'A part-owner of the company! 🎉' },
            { id: 2, text: 'The security guard' }
          ].map(opt => {
            const isSelected = quizSelectedOption === opt.id;
            const isCorrect = opt.id === 1;
            return (
              <button
                key={opt.id}
                onClick={() => !dailyQuizAnswered && handleDailyQuizSubmit(opt.id)}
                disabled={dailyQuizAnswered}
                className={`p-3.5 rounded-2xl text-xs font-extrabold text-left transition-all border ${
                  dailyQuizAnswered
                    ? isCorrect
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                      : isSelected
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>

        {dailyQuizAnswered && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-black text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Spot on! When you own a share, you are an authentic co-owner of the company!</span>
          </div>
        )}
      </div>

      {/* Trophy Room Badge Showcase */}
      <div className="jr-glass-card p-6 bg-white border-2 border-slate-100 rounded-[32px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={22} className="text-amber-500" />
            <h2 className="font-black text-base text-slate-900 junior-font-heading">
              Trophy Showcase ({acc.badges?.length || 1} Badges)
            </h2>
          </div>
          <Link to="/junior/missions" className="text-xs font-black text-blue-600 hover:underline">
            View All Missions →
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          {(acc.badges || ['badge-first-step']).map((b, idx) => {
            const name = typeof b === 'string' ? b.replace('badge-', '').replace(/-/g, ' ').toUpperCase() : (b.name || 'Achievement');
            const desc = typeof b === 'object' ? b.description : 'Earned for taking the first step into smart investing!';
            return (
              <div key={idx} className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/80 rounded-2xl px-4 py-3 shadow-xs">
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="text-xs font-black text-amber-950">{name}</div>
                  <div className="text-[11px] font-medium text-amber-800/90">{desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
