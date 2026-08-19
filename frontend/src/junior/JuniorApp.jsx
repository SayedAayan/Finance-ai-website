import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, TrendingUp, Trophy, Shield, ArrowLeft, Sparkles, Flame, Zap, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './junior-styles.css';
import JuniorOnboarding from './pages/JuniorOnboarding';
import JuniorHome from './pages/JuniorHome';
import JuniorLearn from './pages/JuniorLearn';
import JuniorTrade from './pages/JuniorTrade';
import JuniorMissions from './pages/JuniorMissions';
import JuniorParent from './pages/JuniorParent';
import { BullMascot, BearMascot } from './components/BuzzyMascot';
import JuniorAvatar from './components/JuniorAvatar';

export const DEFAULT_JUNIOR_ACCOUNT = {
  id: 'demo_jr_1',
  nickname: 'Junior Rocket',
  avatar: 'rocket',
  age: 12,
  mode: 'explorer',
  parentEmail: 'parent@stockbuzz.in',
  currency: 'INR',
  currencySymbol: '₹',
  streakDays: 3,
  totalPoints: 350,
  level: 2,
  levelTitle: 'Market Explorer',
  nextLevelPoints: 500,
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
        currentPrice: 3950,
        reason: 'They build great software for the whole world!'
      }
    ]
  },
  tracksProgress: {
    'track-1': { completed: true, score: 100 },
    'track-2': { completed: false, score: 0 },
    'track-3': { completed: false, score: 0 }
  },
  completedLessons: ['lesson-1-1', 'lesson-1-2'],
  badges: ['badge-first-step', 'badge-streak-3'],
  ledger: [
    {
      id: 'tx-0',
      type: 'DEPOSIT',
      amount: 100000,
      description: 'Starter virtual piggy bank',
      timestamp: Date.now() - 86400000 * 2
    },
    {
      id: 'tx-1',
      type: 'BUY',
      symbol: 'TCS.NS',
      name: 'Tata Consultancy Services',
      shares: 1,
      price: 3890,
      reason: 'They build great software for the whole world!',
      timestamp: Date.now() - 86400000
    }
  ],
  controls: {
    maxDailyTrades: 3,
    maxSingleStockPct: 25,
    allowSelling: true
  }
};

export default function JuniorApp() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [account, setAccount] = useState(DEFAULT_JUNIOR_ACCOUNT);

  const accountId = localStorage.getItem('stockbuzz_junior_account_id') || 'demo_jr_1';

  const fetchAccount = async () => {
    try {
      const res = await fetch(`/api/junior/accounts/${accountId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.account) {
          setAccount(data.account);
        }
      }
    } catch (err) {
      console.warn('Junior account fetch error, using default account:', err);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const isOnboarding = loc.pathname === '/junior/onboarding';

  if (isOnboarding) {
    return <JuniorOnboarding onFinish={(newAcc) => setAccount(newAcc)} />;
  }

  const currentAcc = account || DEFAULT_JUNIOR_ACCOUNT;
  const points = currentAcc.totalPoints || 350;
  const nextPoints = currentAcc.nextLevelPoints || 500;
  const xpPercent = Math.min(100, Math.round((points / nextPoints) * 100));

  const navTabs = [
    { path: '/junior/home', label: 'Dashboard', icon: Home },
    { path: '/junior/learn', label: 'Academy', icon: BookOpen },
    { path: '/junior/trade', label: 'Paper Market', icon: TrendingUp },
    { path: '/junior/missions', label: 'Trophy Room', icon: Trophy },
    { path: '/junior/parent', label: 'Parent Hub', icon: Shield }
  ];

  return (
    <div className="junior-body min-h-screen flex flex-col pb-28 md:pb-16 selection:bg-blue-200">
      {/* Top Junior Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-blue-100/80 px-4 md:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            to="/"
            className="flex items-center justify-center w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all shadow-xs"
            title="Back to StockBuzz Adult Website"
          >
            <ArrowLeft size={18} />
          </Link>

          <Link to="/junior/home" className="flex items-center gap-2.5 select-none group">
            <BullMascot size={36} className="group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl text-blue-600 junior-font-heading tracking-tight">
                  StockBuzz
                </span>
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-lg tracking-wide uppercase shadow-xs">
                  Junior
                </span>
              </div>
              <span className="block text-[10px] font-bold text-slate-400 -mt-0.5 uppercase tracking-widest">
                Safe Learning Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Level XP Bar & Coins & Parent Hub */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* XP Level Pill */}
          <div className="hidden md:flex items-center gap-2.5 bg-blue-50/80 border border-blue-200/80 px-3.5 py-1.5 rounded-2xl">
            <div className="w-6 h-6 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              ⚡
            </div>
            <div>
              <div className="flex items-center justify-between text-[10px] font-extrabold text-blue-900 -mb-0.5">
                <span>Level {currentAcc.level || 2}</span>
                <span className="text-blue-600">{points}/{nextPoints} XP</span>
              </div>
              <div className="w-24 h-1.5 bg-blue-200 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Streak Flame */}
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-2xl text-xs font-black text-amber-900 shadow-xs">
            <Flame size={15} className="text-amber-500 animate-pulse" />
            <span>{currentAcc.streakDays || 1}d</span>
          </div>

          {/* Piggy Bank Balance */}
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-2xl text-xs font-black text-emerald-950 shadow-xs">
            <Sparkles size={14} className="text-emerald-500" />
            <span>{currentAcc.currencySymbol}{(currentAcc.portfolio.cash + (currentAcc.portfolio.investedValue || 0)).toLocaleString('en-IN')}</span>
          </div>

          {/* User Anime Avatar Pill */}
          <Link
            to="/junior/home"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 pl-1 pr-3 py-1 rounded-2xl hover:border-blue-400 shadow-xs transition-all group"
            title="Your Anime Avatar Persona (Click to switch)"
          >
            <JuniorAvatar avatarId={currentAcc.avatar || 'ren'} size={30} />
            <span className="text-xs font-black text-slate-800 group-hover:text-blue-600 hidden sm:inline truncate max-w-[90px]">
              {currentAcc.nickname || 'Explorer'}
            </span>
          </Link>

          {/* Parent Mode Link */}
          <Link
            to="/junior/parent"
            className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-2xl transition-all shadow-xs"
          >
            <Shield size={14} className="text-blue-600" />
            <span className="hidden sm:inline">Parent Hub</span>
          </Link>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={<JuniorHome account={currentAcc} onUpdateAccount={setAccount} />} />
          <Route path="/home" element={<JuniorHome account={currentAcc} onUpdateAccount={setAccount} />} />
          <Route path="/learn" element={<JuniorLearn account={currentAcc} onUpdateAccount={setAccount} />} />
          <Route path="/trade" element={<JuniorTrade account={currentAcc} onUpdateAccount={setAccount} />} />
          <Route path="/missions" element={<JuniorMissions account={currentAcc} />} />
          <Route path="/parent" element={<JuniorParent account={currentAcc} onUpdateAccount={setAccount} />} />
          <Route path="/junior" element={<JuniorHome account={currentAcc} onUpdateAccount={setAccount} />} />
          <Route path="/junior/home" element={<JuniorHome account={currentAcc} onUpdateAccount={setAccount} />} />
          <Route path="/junior/learn" element={<JuniorLearn account={currentAcc} onUpdateAccount={setAccount} />} />
          <Route path="/junior/trade" element={<JuniorTrade account={currentAcc} onUpdateAccount={setAccount} />} />
          <Route path="/junior/missions" element={<JuniorMissions account={currentAcc} />} />
          <Route path="/junior/parent" element={<JuniorParent account={currentAcc} onUpdateAccount={setAccount} />} />
          <Route path="*" element={<JuniorHome account={currentAcc} onUpdateAccount={setAccount} />} />
        </Routes>
      </main>

      {/* Modern Floating Bottom Dock */}
      <nav className="fixed bottom-3 left-4 right-4 z-40 max-w-lg mx-auto bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-full px-4 py-2 flex items-center justify-around shadow-[0_20px_50px_rgba(30,58,138,0.16)]">
        {navTabs.map((tab) => {
          const isActive = loc.pathname === tab.path || (tab.path === '/junior/home' && (loc.pathname === '/junior' || loc.pathname === '/junior/'));
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`relative flex flex-col items-center gap-1 py-1.5 px-3.5 rounded-full transition-all ${
                isActive
                  ? 'text-white font-extrabold'
                  : 'text-slate-400 font-bold hover:text-slate-700'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="jr-dock-active"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-md -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span className="text-[10px] junior-font-heading leading-tight">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
