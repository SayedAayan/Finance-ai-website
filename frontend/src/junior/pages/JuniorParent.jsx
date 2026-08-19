import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sliders, AlertTriangle, RotateCcw, CheckCircle2, Lock, Eye } from 'lucide-react';
import BuzzyMascot from '../components/BuzzyMascot';

export default function JuniorParent({ account, onUpdateAccount }) {
  const [parentData, setParentData] = useState(null);
  const [dailyLimit, setDailyLimit] = useState(5);
  const [maxStockPercent, setMaxStockPercent] = useState(25);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (account?.id) {
      fetch(`/api/junior/parent/${account.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.child) {
            setParentData(data);
            setDailyLimit(data.child.parentControls?.dailyTradeLimit || 5);
            setMaxStockPercent(data.child.parentControls?.maxSingleStockPercent || 25);
          }
        })
        .catch(err => console.error('Parent data fetch failed:', err));
    }
  }, [account?.id]);

  const handleSaveLimits = async () => {
    if (!account) return;
    try {
      const res = await fetch(`/api/junior/parent/${account.id}/limits`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyTradeLimit: dailyLimit,
          maxSingleStockPercent: maxStockPercent
        })
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Error saving limits:', err);
    }
  };

  const handleResetPortfolio = async () => {
    if (!window.confirm("Are you sure you want to reset your child's paper portfolio back to starter funds?")) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch(`/api/junior/accounts/${account.id}/reset`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (onUpdateAccount && data.account) {
          onUpdateAccount(data.account);
        }
        alert("Child's paper trading portfolio has been reset to starter funds!");
      }
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-emerald-400 font-bold text-xs">
            <ShieldCheck size={16} /> Parental Overseer Dashboard (COPPA / DPDPA Certified)
          </div>
          <h1 className="text-2xl font-extrabold junior-font-heading">
            Parent Controls & Learning Oversight 🛡️
          </h1>
          <p className="text-xs md:text-sm text-slate-300">
            Supervise {account?.nickname}'s progress, review their investment reason notes, and set risk limits.
          </p>
        </div>
        <BuzzyMascot size={64} mood="happy" />
      </div>

      {/* Safety Controls Card */}
      <div className="junior-card p-6 bg-white">
        <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-100 font-extrabold text-slate-900 junior-font-heading">
          <Sliders size={18} className="text-blue-600" />
          <span>Guardian Risk & Trading Guardrails</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Daily Practice Trade Limit ({dailyLimit} trades/day)
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[11px] text-slate-500 mt-2">
              Prevents over-trading and promotes deliberate thinking.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Max Single Stock Cap ({maxStockPercent}% of Portfolio)
            </label>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={maxStockPercent}
              onChange={(e) => setMaxStockPercent(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[11px] text-slate-500 mt-2">
              Enforces diversification so your child learns not to put all eggs in one basket.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleSaveLimits}
            className="junior-btn-primary text-xs py-2.5 px-5 font-bold"
          >
            Save Guardrail Limits
          </button>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={16} /> Limits Saved!
            </span>
          )}
        </div>
      </div>

      {/* Child Reflection Notes Audit */}
      <div className="junior-card p-6 bg-white">
        <h2 className="text-base font-extrabold text-slate-900 junior-font-heading mb-4">
          Recent Trade Rationale Audit (Child Notes)
        </h2>

        <div className="space-y-3">
          {account?.ledger?.filter(t => t.reasonNote)?.map((tx) => (
            <div key={tx.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-start justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="text-blue-600 font-extrabold">[{tx.type}]</span>
                  <span>{tx.name || tx.symbol}</span>
                  <span className="text-slate-500 font-normal">({tx.shares} shares @ {tx.currency}{tx.price})</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium">
                  💭 Child Note: "{tx.reasonNote}"
                </div>
              </div>
              <span className="text-[10px] text-slate-400 flex-shrink-0">
                {new Date(tx.timestamp).toLocaleDateString()}
              </span>
            </div>
          ))}

          {(!account?.ledger || account.ledger.length === 0) && (
            <p className="text-xs text-slate-400 text-center py-4">No trades executed yet.</p>
          )}
        </div>
      </div>

      {/* Emergency / Reset Card */}
      <div className="junior-card p-6 bg-rose-50/50 border-2 border-rose-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-sm text-rose-900 junior-font-heading">
            Reset Child Practice Portfolio
          </h3>
          <p className="text-xs text-rose-800/80 mt-0.5">
            Restores virtual coins back to initial seed balance (₹1,00,000 / $1,000) for a fresh start.
          </p>
        </div>
        <button
          onClick={handleResetPortfolio}
          disabled={resetting}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 flex-shrink-0 shadow-sm"
        >
          <RotateCcw size={14} /> Reset Practice Account
        </button>
      </div>
    </div>
  );
}
