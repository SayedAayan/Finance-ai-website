import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Info, Scale, FileText, Lock, Mail, Trash2, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SEBI_MANDATORY_NOTICE = 
  "This platform is an educational paper-trading simulator. It does not execute real trades, accept investment funds, provide personalised investment advice, or guarantee returns. Market data is delayed and used only for educational purposes under SEBI Circular HO/47/17/12(11)2025-MRD-POD3/I/11107/2026. Virtual performance does not represent actual investment performance.";

export function JuniorSEBIBanner({ compact = false }) {
  const [showModal, setShowModal] = useState(false);

  if (compact) {
    return (
      <>
        <div className="bg-amber-500/10 border border-amber-500/25 text-amber-900 rounded-2xl px-3.5 py-2 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold truncate">
            <Scale size={15} className="text-amber-600 flex-shrink-0" />
            <span className="truncate">
              <strong>SEBI 2026 Educational Simulator:</strong> Virtual coins have ₹0 cash value. No real orders executed.
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-[11px] font-black text-amber-700 underline flex-shrink-0 hover:text-amber-900"
          >
            Regulatory Notice →
          </button>
        </div>
        <JuniorSEBIModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200/80 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
              <Scale size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-blue-900 uppercase tracking-wider">
                  SEBI 2026 Regulatory & Educational Compliance
                </span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-300">
                  Circular May 2026 Compliant
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed max-w-2xl">
                {SEBI_MANDATORY_NOTICE}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs font-black text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 px-4 py-2 rounded-2xl shadow-xs transition-all flex-shrink-0"
          >
            Full Disclosure & Disclaimers
          </button>
        </div>
      </div>
      <JuniorSEBIModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

export function JuniorSEBIFooter() {
  const [showModal, setShowModal] = useState(false);

  return (
    <footer className="mt-12 pb-24 pt-8 border-t border-slate-200 text-slate-500 text-xs">
      <div className="max-w-5xl mx-auto space-y-6 px-4">
        {/* Official Statutory Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 text-slate-700 space-y-3">
          <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span>StockBuzz Junior — Educational Simulation Charter (SEBI 2026)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            <strong>Mandatory Disclosure:</strong> {SEBI_MANDATORY_NOTICE}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[11px] text-slate-600 font-semibold border-t border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600">✔</span>
              <span>100% Virtual Practice (₹0 Monetary Value)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600">✔</span>
              <span>Zero Real Cash Deposits or Withdrawals</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600">✔</span>
              <span>Delayed Educational Market Price Feeds</span>
            </div>
          </div>
        </div>

        {/* Links & Legal Policies */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => setShowModal(true)} className="hover:text-blue-600 underline">
              SEBI 2026 Disclaimers
            </button>
            <button onClick={() => setShowModal(true)} className="hover:text-blue-600 underline">
              Simulated Risk Disclosure
            </button>
            <button onClick={() => setShowModal(true)} className="hover:text-blue-600 underline">
              DPDPA / COPPA Privacy Policy
            </button>
            <button onClick={() => setShowModal(true)} className="hover:text-blue-600 underline">
              Grievance Officer & Data Deletion
            </button>
          </div>
          <div className="text-[11px] text-slate-400">
            © 2026 StockBuzz Junior. Strictly for Financial Literacy & Educational Simulators.
          </div>
        </div>
      </div>
      <JuniorSEBIModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </footer>
  );
}

export function JuniorSEBIModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[32px] max-w-2xl w-full p-6 md:p-8 shadow-2xl border-2 border-slate-100 max-h-[85vh] overflow-y-auto space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Scale size={24} className="text-blue-600" />
              <div>
                <h3 className="text-lg font-black text-slate-900 junior-font-heading">
                  SEBI 2026 Educational & Regulatory Disclosures
                </h3>
                <span className="text-[11px] font-bold text-slate-400">
                  Circular Ref: HO/47/17/12(11)2025-MRD-POD3/I/11107/2026
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              <X size={18} />
            </button>
          </div>

          {/* Core Mandatory Statutory Clause */}
          <div className="bg-blue-50/80 border-2 border-blue-200 rounded-2xl p-4 text-xs font-semibold text-blue-950 leading-relaxed">
            <div className="font-black text-blue-900 mb-1 text-sm">📜 Statutory Notice:</div>
            “{SEBI_MANDATORY_NOTICE}”
          </div>

          {/* Key Compliance Policies */}
          <div className="space-y-4 text-xs text-slate-700 font-medium">
            <div className="space-y-1.5">
              <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-600" />
                1. Nature of the Simulator & Zero Monetary Value
              </h4>
              <p className="text-slate-600 leading-relaxed">
                StockBuzz Junior is exclusively a financial literacy simulator designed to teach youth basic budgeting, diversification, and market mechanics. All wallet balances, portfolio figures, coins, and rewards are 100% fictional virtual tokens with zero (₹0) cash or monetary value. No deposit or withdrawal of real fiat currency is ever accepted or permitted.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                <Info size={16} className="text-blue-600" />
                2. Market Data & Pricing Notice
              </h4>
              <p className="text-slate-600 leading-relaxed">
                In compliance with SEBI educational price-data norms, market prices displayed on this educational platform are delayed, historical, or simulated for instructional exercises. StockBuzz Junior does not provide tick-by-tick real-time exchange feeds.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                <AlertCircle size={16} className="text-amber-600" />
                3. No Investment Advice / No Research Analyst Services
              </h4>
              <p className="text-slate-600 leading-relaxed">
                StockBuzz Junior is not a SEBI-registered Investment Adviser or Research Analyst. The AI tutor and automated educational hints provide general explanatory tutorials only and will never issue buy, sell, target price, or personalized investment recommendations.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                <Lock size={16} className="text-purple-600" />
                4. Child Privacy (DPDPA 2023 & COPPA Certified)
              </h4>
              <p className="text-slate-600 leading-relaxed">
                StockBuzz Junior does not harvest biometric data or track behavioral profiling on minors. Accounts for users under 13 require verified parental oversight. All learning notes are accessible by parents via the Parent Hub.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                <Mail size={16} className="text-slate-700" />
                5. Grievance Redressal & Account Deletion
              </h4>
              <p className="text-slate-600 leading-relaxed">
                For any inquiries, data deletion requests, or regulatory grievances, please email our designated officer at <strong>support@stockbuzz.in</strong>. Accounts and all associated simulator logs can be permanently deleted upon request within 24 hours.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full junior-btn-primary py-3 text-xs font-black rounded-2xl"
          >
            I Understand & Agree
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
