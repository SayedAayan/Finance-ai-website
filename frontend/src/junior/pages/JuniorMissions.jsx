import React from 'react';
import { Trophy, Award, Sparkles, CheckCircle2, Flame, Star, Shield, Zap, Lock, Compass, Coins, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import BuzzyMascot from '../components/BuzzyMascot';

export default function JuniorMissions({ account }) {
  const acc = account || {
    totalPoints: 350,
    streakDays: 3,
    level: 2,
    levelTitle: 'Market Explorer',
    nextLevelPoints: 500
  };

  const allMissions = [
    {
      id: 'm1',
      title: 'Join StockBuzz Junior',
      desc: 'Set up your virtual piggy bank and start your journey',
      points: 50,
      badge: 'Junior Pioneer',
      icon: '🚀',
      completed: true
    },
    {
      id: 'm2',
      title: 'The Great Pizza Slice Secret',
      desc: 'Slice the pizza in Track 2 and understand share co-ownership',
      points: 100,
      badge: 'Slice Master',
      icon: '🍕',
      completed: account?.completedLessons?.includes('lesson-2-1') || true
    },
    {
      id: 'm3',
      title: 'First Virtual Paper Trade',
      desc: 'Buy 1 share in a favorite brand card and write your reason note',
      points: 150,
      badge: 'First Market Trade',
      icon: '📈',
      completed: (account?.ledger?.length || 0) > 1
    },
    {
      id: 'm4',
      title: 'The Golden Egg Rule (Diversification)',
      desc: 'Spread your investments across 2 or more different companies',
      points: 200,
      badge: 'Guardian Shield',
      icon: '🛡️',
      completed: (account?.portfolio?.holdings?.length || 0) >= 2
    },
    {
      id: 'm5',
      title: '3-Day Wisdom Streak',
      desc: 'Visit StockBuzz Junior 3 days in a row to learn market trends',
      points: 250,
      badge: 'Patience Master',
      icon: '🔥',
      completed: (account?.streakDays || 1) >= 3
    },
    {
      id: 'm6',
      title: 'Global Explorer (US Stocks)',
      desc: 'Learn about currency conversion and explore US market stocks',
      points: 300,
      badge: 'Global Navigator',
      icon: '🌍',
      completed: account?.ledger?.some(t => t.symbol === 'AAPL' || t.symbol === 'MSFT' || t.symbol === 'DIS') || false
    }
  ];

  const completedCount = allMissions.filter(m => m.completed).length;
  const progressPct = Math.round((completedCount / allMissions.length) * 100);

  const RANKS = [
    { level: 1, title: 'Novice Saver', minXP: 0, icon: '🌱', color: 'from-emerald-400 to-teal-500' },
    { level: 2, title: 'Market Explorer', minXP: 250, icon: '⚡', color: 'from-blue-500 to-indigo-600' },
    { level: 3, title: 'Slice Investor', minXP: 600, icon: '🍕', color: 'from-amber-400 to-orange-500' },
    { level: 4, title: 'Portfolio Champion', minXP: 1200, icon: '👑', color: 'from-purple-500 to-pink-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 md:p-8 text-white shadow-[0_20px_50px_rgba(245,158,11,0.25)] border-2 border-white/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs font-black uppercase tracking-wider bg-black/20 backdrop-blur-md px-3.5 py-1 rounded-full text-amber-100 border border-white/20">
              Gamified Quests & Trophy Room
            </span>
            <h1 className="text-2xl md:text-3xl font-black junior-font-heading mt-2">
              Junior Trophy Room 🏆
            </h1>
            <p className="text-amber-100 text-xs md:text-sm font-medium mt-1">
              Complete missions, level up your rank, and collect shiny investor medals!
            </p>
          </div>
          <BuzzyMascot size={74} mood="celebrate" />
        </div>
      </div>

      {/* Ranks & Milestones Road */}
      <div className="jr-glass-card p-6 bg-white border-2 border-blue-100 rounded-[32px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target size={22} className="text-blue-600" />
            <h2 className="font-black text-base text-slate-900 junior-font-heading">
              Investor Rank Pathway
            </h2>
          </div>
          <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {acc.totalPoints || 350} Total XP Points
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-2">
          {RANKS.map((rk) => {
            const isReached = (acc.totalPoints || 350) >= rk.minXP;
            const isCurrent = acc.level === rk.level;
            return (
              <div
                key={rk.level}
                className={`p-4 rounded-3xl border-2 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50/70 shadow-md scale-105'
                    : isReached
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-100 bg-slate-50/70 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{rk.icon}</span>
                  {isReached ? (
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                      <Lock size={10} /> {rk.minXP} XP
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Level {rk.level}</span>
                  <div className="text-xs font-black text-slate-900">{rk.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missions Checklist */}
      <div className="jr-glass-card p-6 bg-white border-2 border-slate-100 rounded-[32px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900 junior-font-heading">
              Active Quests Progress ({completedCount}/{allMissions.length})
            </h2>
            <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-2xl self-start sm:self-auto">
            {progressPct}% Completed
          </span>
        </div>

        <div className="space-y-3.5">
          {allMissions.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-3xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all ${
                m.completed
                  ? 'border-emerald-200/90 bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200/80 bg-white hover:border-blue-200'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-xs ${
                    m.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {m.completed ? '✓' : m.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-slate-900">{m.title}</h3>
                    {m.completed && (
                      <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        Done
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{m.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-black text-amber-900 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl self-start sm:self-auto flex-shrink-0">
                <Sparkles size={14} className="text-amber-500" /> +{m.points} XP Points
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
