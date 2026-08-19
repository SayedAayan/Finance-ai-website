import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, TrendingUp, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, Send, RefreshCw } from 'lucide-react';
import BuzzyMascot from '../components/BuzzyMascot';

export default function JuniorTrade({ account, onUpdateAccount }) {
  const [companies, setCompanies] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeShares, setTradeShares] = useState(1);
  const [reasonNote, setReasonNote] = useState('');
  const [actionType, setActionType] = useState('BUY');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'ledger'

  useEffect(() => {
    fetch(`/api/junior/companies?market=${account?.market || 'IN'}`)
      .then(res => res.json())
      .then(data => {
        if (data.companies) setCompanies(data.companies);
      })
      .catch(err => console.error('Error fetching junior companies:', err));
  }, [account?.market]);

  const handleOpenTrade = (company, type = 'BUY') => {
    setSelectedStock(company);
    setActionType(type);
    setTradeShares(1);
    setReasonNote('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleExecuteTrade = async () => {
    if (!selectedStock || !account) return;
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch(`/api/junior/accounts/${account.id}/trades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          shares: tradeShares,
          action: actionType,
          reasonNote: reasonNote.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Trade could not be executed');
      }

      setSuccessMsg(`Awesome! Successfully ${actionType === 'BUY' ? 'purchased' : 'sold'} ${tradeShares} shares of ${selectedStock.name}! 🎉`);
      if (onUpdateAccount && data.account) {
        onUpdateAccount(data.account);
      }
      setTimeout(() => {
        setSelectedStock(null);
        setSuccessMsg('');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalCost = selectedStock ? selectedStock.price * tradeShares : 0;
  const currentCash = account?.portfolio?.cash || 0;
  const currencySymbol = account?.currencySymbol || '₹';

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Safe Paper Market
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 junior-font-heading mt-2">
            Practice Trading & Brand Cards 🎮
          </h1>
          <p className="text-xs md:text-sm text-slate-600">
            Real prices with practice coins. Remember: explain why you believe in a brand!
          </p>
        </div>

        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
          <div>
            <div className="text-[11px] font-bold text-emerald-800 uppercase">Available Funds</div>
            <div className="text-lg font-extrabold text-emerald-900">
              {currencySymbol}{currentCash.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('explore')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'explore'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Explore Company Cards
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'ledger'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Trade Ledger & Notes ({account?.ledger?.length || 0})
        </button>
      </div>

      {activeTab === 'explore' ? (
        /* Company Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((company) => {
            const holding = account?.portfolio?.holdings?.find(h => h.symbol === company.symbol);
            return (
              <div key={company.symbol} className="junior-card p-5 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shadow-xs">
                      {company.emoji}
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {company.category}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 junior-font-heading">
                    {company.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {company.description}
                  </p>

                  <div className="flex items-baseline justify-between mt-4 pb-3 border-b border-slate-100">
                    <div className="text-lg font-extrabold text-slate-900">
                      {company.currency}{company.price.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {company.change}
                    </div>
                  </div>

                  {holding && (
                    <div className="mt-3 text-xs font-bold text-blue-700 bg-blue-50/70 p-2 rounded-xl">
                      You own: {holding.shares} shares ({company.currency}{(holding.shares * company.price).toLocaleString('en-IN')})
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-2">
                  <button
                    onClick={() => handleOpenTrade(company, 'BUY')}
                    className="flex-1 junior-btn-primary text-xs py-2 px-3 justify-center"
                  >
                    Buy Slices
                  </button>
                  {holding && holding.shares > 0 && (
                    <button
                      onClick={() => handleOpenTrade(company, 'SELL')}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                    >
                      Sell
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Immutable Ledger History */
        <div className="junior-card p-6 bg-white">
          <h3 className="text-base font-extrabold text-slate-900 junior-font-heading mb-4">
            Immutable Trade History & Reflection Notes
          </h3>

          <div className="space-y-3">
            {account?.ledger?.map((tx) => (
              <div key={tx.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-extrabold px-2 py-0.5 rounded-full ${
                      tx.type === 'BUY' ? 'bg-emerald-100 text-emerald-800' : tx.type === 'SELL' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tx.type}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{tx.name || tx.symbol}</span>
                    {tx.shares && <span>({tx.shares} shares @ {tx.currency}{tx.price})</span>}
                  </div>
                  {tx.reasonNote && (
                    <p className="text-slate-600 italic">
                      "Why: {tx.reasonNote}"
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-slate-900 text-sm">
                    {tx.type === 'BUY' ? '-' : '+'}{tx.currency}{tx.amount || tx.totalCost}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trade Modal */}
      <AnimatePresence>
        {selectedStock && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border-2 border-blue-200"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedStock.emoji}</span>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 junior-font-heading">
                      {actionType === 'BUY' ? 'Buy Shares in' : 'Sell Shares in'} {selectedStock.name}
                    </h3>
                    <span className="text-xs text-slate-500 font-bold">{selectedStock.symbol}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStock(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Shares selector */}
              <div className="bg-slate-50 p-4 rounded-2xl mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600">Quantity (Shares):</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTradeShares(Math.max(1, tradeShares - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-800"
                    >
                      -
                    </button>
                    <span className="text-base font-extrabold text-slate-900 w-6 text-center">{tradeShares}</span>
                    <button
                      type="button"
                      onClick={() => setTradeShares(tradeShares + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-800"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Total Virtual Cost:</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {selectedStock.currency}{totalCost.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Mandatory Reflection Note */}
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Mandatory Investor Rule: "Why am I doing this trade?"
                </label>
                <textarea
                  rows={2}
                  value={reasonNote}
                  onChange={(e) => setReasonNote(e.target.value)}
                  placeholder="e.g. I use this product every day and believe more people will buy it this year."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-600"
                />
              </div>

              {/* Guardian Safety Tip */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 mb-4 flex items-start gap-2">
                <ShieldAlert size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Diversification Cap:</strong> StockBuzz limits any single stock to max 25% of your portfolio so you never lose too much from one company!
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold mb-4">
                  ⚠️ {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold mb-4">
                  {successMsg}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedStock(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteTrade}
                  disabled={loading}
                  className="flex-2 junior-btn-primary text-xs py-3 font-bold"
                >
                  {loading ? 'Executing...' : `Confirm ${actionType}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
