import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import BuzzyMascot from '../components/BuzzyMascot';

export default function JuniorOnboarding({ onFinish }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [age, setAge] = useState(11);
  const [nickname, setNickname] = useState('');
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
          nickname: nickname.trim() || 'Junior Champ',
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
      }
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-amber-50/40 p-4 md:p-8 flex items-center justify-center junior-body">
      <div className="max-w-xl w-full bg-white rounded-3xl border-2 border-slate-100 shadow-2xl p-6 md:p-10 relative overflow-hidden">
        {/* Top Progress bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-amber-400 transition-all duration-300 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center mb-4">
              <BuzzyMascot size={90} mood="happy" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-center text-slate-900 junior-font-heading mb-2">
              Welcome to StockBuzz Junior! 🚀
            </h1>
            <p className="text-center text-slate-600 text-sm mb-6">
              Learn how the world builds companies, trade with virtual coins, and become money-smart!
            </p>

            <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
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
              <div className="flex justify-between text-xs font-bold text-blue-800 mt-2">
                <span>8 (Explorer)</span>
                <span>12</span>
                <span>17 (Junior Trader)</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Choose your adventure country:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMarket('IN')}
                  className={`p-3.5 rounded-2xl border-2 text-left font-bold text-sm flex items-center gap-3 transition-all ${
                    market === 'IN'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">🇮🇳</span>
                  <div>
                    <div>India (NSE/BSE)</div>
                    <div className="text-xs text-slate-500 font-normal">₹1,00,000 Coins</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMarket('US')}
                  className={`p-3.5 rounded-2xl border-2 text-left font-bold text-sm flex items-center gap-3 transition-all ${
                    market === 'US'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">🇺🇸</span>
                  <div>
                    <div>US Markets</div>
                    <div className="text-xs text-slate-500 font-normal">$1,000 Coins</div>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full junior-btn-primary text-base font-bold flex items-center justify-center gap-2"
            >
              Continue <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center mb-4">
              <BuzzyMascot size={80} mood="thinking" />
            </div>
            <h2 className="text-2xl font-extrabold text-center text-slate-900 junior-font-heading mb-2">
              Parent Consent & Safety
            </h2>
            <p className="text-center text-slate-600 text-sm mb-6">
              StockBuzz Junior is 100% kid-safe (COPPA/DPDPA compliant). Real stock prices, fake money, zero risk.
            </p>

            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                <ShieldCheck size={18} className="text-amber-600" />
                <span>Parent Email Verification</span>
              </div>
              <p className="text-xs text-amber-800/80 mb-3">
                {isUnder13
                  ? "Because you're under 13, your parent can view your weekly learning streaks and trade rationales."
                  : "We keep your parent in the loop so they can cheer on your money skills!"}
              </p>
              <input
                type="email"
                placeholder="parent@example.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-amber-300 bg-white text-sm outline-none focus:border-blue-600 text-slate-800"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-2 junior-btn-primary"
              >
                Next Step <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center mb-4">
              <BuzzyMascot size={80} mood="celebrate" />
            </div>
            <h2 className="text-2xl font-extrabold text-center text-slate-900 junior-font-heading mb-2">
              Pick Your Investor Nickname!
            </h2>
            <p className="text-center text-slate-600 text-sm mb-6">
              Never use your full real name. Choose a fun code name for your paper trading portfolio!
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Nickname
              </label>
              <input
                type="text"
                maxLength={20}
                placeholder="e.g. Captain Bull, Rocket Bee, Leo"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-base font-bold text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-extrabold text-lg flex-shrink-0">
                {market === 'US' ? '$' : '₹'}
              </div>
              <div className="text-xs text-emerald-950 font-medium">
                <span className="font-bold">Starter Virtual Coins:</span>{' '}
                {market === 'US' ? '$1,000.00' : '₹1,00,000.00'} has been credited to your practice chest!
              </div>
            </div>

            <button
              onClick={handleCreateAccount}
              disabled={submitting}
              className="w-full junior-btn-gold text-base font-extrabold flex items-center justify-center gap-2"
            >
              <Sparkles size={18} /> Launch My Junior Hub
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
