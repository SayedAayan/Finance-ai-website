import React from 'react';
import { Trophy, Award, Sparkles, CheckCircle2, Flame, Star, Shield } from 'lucide-react';
import BuzzyMascot from '../components/BuzzyMascot';

export default function JuniorMissions({ account }) {
  const allMissions = [
    {
      id: 'm1',
      title: 'Join StockBuzz Junior',
      desc: 'Create your account and explore the dashboard',
      points: 50,
      badge: 'Junior Pioneer',
      completed: true
    },
    {
      id: 'm2',
      title: 'The Great Pizza Slice',
      desc: 'Complete Track 2 interactive pizza slice activity',
      points: 100,
      badge: 'Slice Master',
      completed: account?.completedLessons?.includes('lesson-2-1') || false
    },
    {
      id: 'm3',
      title: 'First Virtual Trade',
      desc: 'Buy 1 share in any brand card and explain why you like it',
      points: 150,
      badge: 'First Market Trade',
      completed: (account?.ledger?.length || 0) > 1
    },
    {
      id: 'm4',
      title: 'Golden Egg Rule (Diversification)',
      desc: 'Hold shares in at least 2 different companies',
      points: 200,
      badge: 'Guardian Shield',
      completed: (account?.portfolio?.holdings?.length || 0) >= 2
    },
    {
      id: 'm5',
      title: '3-Day Wisdom Streak',
      desc: 'Visit StockBuzz Junior 3 days in a row to check on your companies',
      points: 250,
      badge: 'Patience Master',
      completed: (account?.streakDays || 1) >= 3
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 text-slate-950 shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-wider bg-black/15 px-3 py-1 rounded-full text-slate-950">
            Missions & Rewards
          </span>
          <h1 className="text-2xl font-extrabold junior-font-heading mt-2">
            Junior Trophy Room 🏆
          </h1>
          <p className="text-xs md:text-sm font-semibold opacity-90">
            Complete milestones to level up your Investor Rank and earn badges!
          </p>
        </div>
        <BuzzyMascot size={64} mood="celebrate" />
      </div>

      {/* Missions Checklist */}
      <div className="junior-card p-6 bg-white">
        <h2 className="text-base font-extrabold text-slate-900 junior-font-heading mb-4">
          Active Missions
        </h2>

        <div className="space-y-4">
          {allMissions.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all ${
                m.completed
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg ${
                    m.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {m.completed ? '✓' : '★'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900">{m.title}</h3>
                    {m.completed && (
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        Done
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex-shrink-0">
                <Sparkles size={14} className="text-amber-500" /> +{m.points} pts
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
