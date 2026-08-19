import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, TrendingUp, Trophy, Shield, ArrowLeft, Sparkles } from 'lucide-react';
import './junior-styles.css';
import JuniorOnboarding from './pages/JuniorOnboarding';
import JuniorHome from './pages/JuniorHome';
import JuniorLearn from './pages/JuniorLearn';
import JuniorTrade from './pages/JuniorTrade';
import JuniorMissions from './pages/JuniorMissions';
import JuniorParent from './pages/JuniorParent';
import BuzzyMascot from './components/BuzzyMascot';

export default function JuniorApp() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

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
      console.warn('Junior account fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const isOnboarding = loc.pathname === '/junior/onboarding';

  if (isOnboarding) {
    return <JuniorOnboarding onFinish={(newAcc) => setAccount(newAcc)} />;
  }

  const navTabs = [
    { path: '/junior/home', label: 'Home', icon: Home },
    { path: '/junior/learn', label: 'Learn', icon: BookOpen },
    { path: '/junior/trade', label: 'Trade', icon: TrendingUp },
    { path: '/junior/missions', label: 'Missions', icon: Trophy },
    { path: '/junior/parent', label: 'Parent Hub', icon: Shield }
  ];

  return (
    <div className="junior-body min-h-screen flex flex-col pb-24 md:pb-12">
      {/* Top Junior Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-blue-100 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-xl hover:bg-slate-100" title="Back to StockBuzz Adult App">
            <ArrowLeft size={20} />
          </Link>

          <Link to="/junior/home" className="flex items-center gap-2 select-none">
            <BuzzyMascot size={38} mood="happy" />
            <div>
              <span className="font-extrabold text-lg text-blue-600 junior-font-heading tracking-tight">
                StockBuzz <span className="text-amber-500">Junior</span>
              </span>
              <span className="block text-[10px] font-bold text-slate-400 -mt-1 uppercase tracking-wider">
                Safe Learning Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Right Info Chips */}
        <div className="flex items-center gap-3">
          {account && (
            <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-extrabold text-amber-900">
              <Sparkles size={14} className="text-amber-500" />
              <span>{account.currencySymbol}{(account.portfolio.cash + (account.portfolio.investedValue || 0)).toLocaleString('en-IN')}</span>
            </div>
          )}

          <Link
            to="/junior/parent"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full transition-colors"
          >
            <Shield size={14} className="text-blue-600" />
            <span>Parent Mode</span>
          </Link>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={<JuniorHome account={account} />} />
          <Route path="/home" element={<JuniorHome account={account} />} />
          <Route path="/learn" element={<JuniorLearn account={account} onUpdateAccount={setAccount} />} />
          <Route path="/trade" element={<JuniorTrade account={account} onUpdateAccount={setAccount} />} />
          <Route path="/missions" element={<JuniorMissions account={account} />} />
          <Route path="/parent" element={<JuniorParent account={account} onUpdateAccount={setAccount} />} />
        </Routes>
      </main>

      {/* Tablet-First Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-100 px-4 py-2 flex items-center justify-around shadow-lg">
        {navTabs.map((tab) => {
          const isActive = loc.pathname === tab.path || (tab.path === '/junior/home' && loc.pathname === '/junior');
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-blue-600 font-extrabold scale-105'
                  : 'text-slate-400 font-bold hover:text-slate-700'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
              <span className="text-[11px] junior-font-heading">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
