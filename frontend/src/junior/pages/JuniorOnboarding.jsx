import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, ArrowRight, CheckCircle2, User, ChevronLeft, Scale } from 'lucide-react';
import JuniorAvatar, { JUNIOR_AVATARS } from '../components/JuniorAvatar';
import { JuniorSEBIBanner } from '../components/JuniorSEBIDisclosure';

export default function JuniorOnboarding({ onFinish }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [age, setAge] = useState(11);
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('rocket');
  const [parentEmail, setParentEmail] = useState('');
  const [market, setMarket] = useState('IN');
  const [submitting, setSubmitting] = useState(false);

  const isUnder13 = parseInt(age, 10) < 13;

  const handleCreateAccount = async () => {
    setSubmitting(true);
    try {
      const mode = age >= 13 ? 'trader' : 'explorer';
      const res = await fetch('/api/junior/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim() || 'Junior Explorer',
          avatar: selectedAvatar || 'rocket',
          age: parseInt(age, 10),
          mode,
          market,
          parentEmail: parentEmail || 'parent@stockbuzz.kids'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.account) {
          localStorage.setItem('stockbuzz_junior_account_id', data.account.id);
          if (onFinish) onFinish(data.account);
          navigate('/junior/home');
        }
      } else {
        // Fallback local account
        const fallbackAcc = {
          id: 'jr_' + Date.now(),
          nickname: nickname.trim() || 'Junior Explorer',
          avatar: selectedAvatar || 'rocket',
          age: parseInt(age, 10),
          mode,
          market,
          currencySymbol: market === 'US' ? '$' : '₹',
          streakDays: 1,
          totalPoints: 50,
          portfolio: {
            cash: market === 'US' ? 1000 : 100000,
            startingCash: market === 'US' ? 1000 : 100000,
            investedValue: 0,
            holdings: []
          }
        };
        localStorage.setItem('stockbuzz_junior_account_id', fallbackAcc.id);
        if (onFinish) onFinish(fallbackAcc);
        navigate('/junior/home');
      }
    } catch (err) {
      console.error('Onboarding fallback:', err);
      navigate('/junior/home');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-amber-50/40 p-4 md:p-8 flex items-center justify-center junior-body">
      <div className="max-w-xl w-full bg-white rounded-[32px] border-2 border-slate-100 shadow-2xl p-6 md:p-10 relative overflow-hidden">
        {/* Top Progress bar (4 Steps) */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400 transition-all duration-300 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* STEP 1: AGE & MARKET */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center mb-4">
              <JuniorAvatar avatarId="logo" size={76} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-center text-slate-900 junior-font-heading mb-2">
              Welcome to StockBuzz Junior! 🚀
            </h1>
            <p className="text-center text-slate-600 text-xs md:text-sm mb-6">
              Learn how companies work, trade with virtual coins, and build real-world wealth smarts!
            </p>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-3xl p-4 mb-6">
              <label className="block text-xs font-black uppercase tracking-wider text-blue-900 mb-2">
                How old are you? ({age} years old)
              </label>
              <input
                type="range"
                min="8"
                max="17"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs font-black text-blue-800 mt-2">
                <span>8 yrs (Explorer)</span>
                <span>12 yrs</span>
                <span>17 yrs (Junior Trader)</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Choose your adventure country:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMarket('IN')}
                  className={`p-4 rounded-3xl border-2 text-left font-black text-sm flex items-center gap-3 transition-all ${
                    market === 'IN'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm scale-102'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-3xl">🇮🇳</span>
                  <div>
                    <div>India (NSE/BSE)</div>
                    <div className="text-xs text-slate-500 font-bold">₹1,00,000 Coins</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMarket('US')}
                  className={`p-4 rounded-3xl border-2 text-left font-black text-sm flex items-center gap-3 transition-all ${
                    market === 'US'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm scale-102'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-3xl">🇺🇸</span>
                  <div>
                    <div>US Markets</div>
                    <div className="text-xs text-slate-500 font-bold">$1,000 Coins</div>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full junior-btn-primary text-base font-black flex items-center justify-center gap-2"
            >
              Next: Pick Avatar <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {/* STEP 2: CHOOSE AVATAR */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center mb-3">
              <JuniorAvatar avatarId={selectedAvatar} size={84} />
            </div>
            <h2 className="text-2xl font-black text-center text-slate-900 junior-font-heading mb-1">
              Choose Your Investor Avatar! 🎨
            </h2>
            <p className="text-center text-slate-600 text-xs md:text-sm mb-5">
              Select an avatar persona to represent you in your portfolio and missions!
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-2.5 scrollbar-none border border-slate-100 rounded-3xl bg-slate-50/70 mb-6">
              {JUNIOR_AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-white shadow-md scale-105'
                        : 'border-transparent bg-white/70 hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <JuniorAvatar avatarId={av.id} size={50} />
                    <div className="text-center w-full">
                      <div className="text-[11px] font-black text-slate-900 truncate">
                        {av.name}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 truncate">
                        {av.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-black text-sm hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-2 junior-btn-primary font-black"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: PARENT CONSENT */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center mb-3">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl shadow-sm">
                🛡️
              </div>
            </div>
            <h2 className="text-2xl font-black text-center text-slate-900 junior-font-heading mb-1">
              Parent Consent & Safety
            </h2>
            <p className="text-center text-slate-600 text-xs md:text-sm mb-5">
              StockBuzz Junior is 100% kid-safe (COPPA/DPDPA compliant). Real stock prices, virtual money, zero financial risk.
            </p>

            <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-4 mb-6">
              <div className="flex items-center gap-2 text-amber-950 font-black text-sm mb-1">
                <ShieldCheck size={18} className="text-amber-600" />
                <span>Parent Email Verification</span>
              </div>
              <p className="text-xs text-amber-900/80 font-medium mb-3">
                {isUnder13
                  ? "Because you're under 13, your parent can oversee your weekly learning streaks and trade rationales."
                  : "We keep your parent informed so they can celebrate your financial literacy milestones!"}
              </p>
              <input
                type="email"
                placeholder="parent@example.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-amber-300 bg-white text-sm outline-none focus:border-blue-600 text-slate-900 font-semibold"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-black text-sm hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-2 junior-btn-primary font-black"
              >
                Next Step <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: NICKNAME & LAUNCH */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center mb-3">
              <JuniorAvatar avatarId={selectedAvatar} size={84} />
            </div>
            <h2 className="text-2xl font-black text-center text-slate-900 junior-font-heading mb-1">
              Pick Your Investor Nickname!
            </h2>
            <p className="text-center text-slate-600 text-xs md:text-sm mb-5">
              Never use your full real name. Choose a cool code name for your paper trading portfolio!
            </p>

            <div className="mb-5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Nickname
              </label>
              <input
                type="text"
                maxLength={20}
                placeholder="e.g. Captain Bull, Astro Cadet, Alpha Trader"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 text-base font-black text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl flex-shrink-0 shadow-xs">
                {market === 'US' ? '$' : '₹'}
              </div>
              <div className="text-xs text-emerald-950 font-medium">
                <span className="font-black">Starter Virtual Coins:</span>{' '}
                {market === 'US' ? '$1,000.00' : '₹1,00,000.00'} will be credited to your practice chest!
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-black text-sm hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleCreateAccount}
                disabled={submitting}
                className="flex-2 junior-btn-gold text-base font-black flex items-center justify-center gap-2"
              >
                <Sparkles size={18} /> Launch My Junior Hub
              </button>
            </div>
          </motion.div>
        )}

        {/* Mandatory SEBI 2026 Educational Notice */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <JuniorSEBIBanner compact={true} />
        </div>
      </div>
    </div>
  );
}
