import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, ArrowLeft, CheckCircle2, AlertCircle, CreditCard, Lock, Zap } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useCms } from '../../context/CmsContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.png';

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'plan_pro';

  const { formatPrice } = useCurrency();
  const { cmsConfig } = useCms();
  const { updateUserPlan } = useAuth();

  const plans = cmsConfig?.pricing?.plans || [];
  const selectedPlan = plans.find(p => p.id === planId) || plans[0];
  const siteName = cmsConfig?.global?.siteName || 'StockBuzz';

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Controlled Inputs for Card Information
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Numbers only
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Numbers only
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setExpiry(value.substring(0, 5));
  };

  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Numbers only
    setCvc(value.substring(0, 4)); // Max 4 digits
  };

  const handleApplyPromo = async () => {
    setPromoError('');
    try {
      const res = await fetch('/api/promo-codes');
      const codes = await res.json();
      const code = codes.find(c => c.code.toUpperCase() === promoCodeInput.toUpperCase());

      if (!code) {
        setPromoError('Invalid promo code');
        return;
      }
      if (code.status !== 'Active') {
        setPromoError('This promo code is no longer active');
        return;
      }
      setAppliedPromo(code);
    } catch (err) {
      setPromoError('Failed to verify promo code');
    }
  };

  const getDiscountedPrice = () => {
    if (!selectedPlan) return 0;
    const orig = Number(selectedPlan.price);
    if (!appliedPromo) return orig;
    const dText = String(appliedPromo.discount).toUpperCase();
    if (dText.includes('%')) {
      const pct = parseFloat(dText);
      return Math.max(0, orig * (1 - pct / 100));
    } else if (dText.includes('$') || dText.includes('₹')) {
      const amt = parseFloat(dText.replace(/[^0-9.]/g, ''));
      return Math.max(0, orig - amt);
    } else {
      const amt = parseFloat(dText.replace(/[^0-9.]/g, ''));
      if (!isNaN(amt)) {
        return Math.max(0, orig - amt);
      }
      return orig;
    }
  };

  const handlePaymentSuccess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      updateUserPlan(selectedPlan.id);
      setIsProcessing(false);
      navigate('/settings');
    }, 1500);
  };

  if (!selectedPlan) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-gray-900 dark:text-white">Plan not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-gray-950 font-sans selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-100">

      {/* Left Column: Order Summary */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-16 bg-white dark:bg-gray-950 justify-start">
        <div className="max-w-md w-full mx-auto flex flex-col justify-start">

          {/* Back button and title aligned on same row */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/settings" className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-colors shrink-0">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <img src="/favicon.png" alt="StockBuzz Logo" className="w-9 h-9 object-contain" />
              <span>{siteName} {selectedPlan.name}</span>
            </h1>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-6 text-base">
            Unlock premium features and accelerate your investing journey.
          </p>

          <div className="bg-violet-100/40 dark:bg-violet-950/20 rounded-2xl p-6 mb-6 border border-violet-200/50 dark:border-violet-800/30 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none">
            <div className="flex justify-between items-end mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Total Due</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{formatPrice(getDiscountedPrice())}</span>
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">/ {selectedPlan.billingCycle === 'Monthly' ? 'month' : 'year'}</span>
                </div>
              </div>
              {appliedPromo && (
                <div className="text-right">
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">Discount Applied</span>
                  <span className="text-lg font-bold text-gray-400 dark:text-gray-500 line-through decoration-red-500/50">{formatPrice(Number(selectedPlan.price))}</span>
                </div>
              )}
            </div>

            <ul className="space-y-3.5">
              {selectedPlan.features?.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full p-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 shrink-0">
                    <CheckCircle2 size={12} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 justify-center mt-2">
            <Shield size={14} /> Secure AES-256 Encryption
          </div>
        </div>
      </div>

      {/* Right Column: Checkout Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-16 bg-white dark:bg-gray-950 justify-between">
        <div className="max-w-md w-full mx-auto flex flex-col justify-start">
          <div className="mb-6 flex items-center gap-3">
            <div className="p-3 bg-violet-600 rounded-xl text-white shadow-lg shadow-violet-500/30">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Secure Checkout</h2>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Complete your {selectedPlan.name} upgrade</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-full mb-4 border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${paymentMethod === 'card' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              Card
            </button>
            <button
              onClick={() => setPaymentMethod('upi')}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${paymentMethod === 'upi' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              UPI
            </button>
          </div>

          {/* Payment Form Fields */}
          <motion.div
            key={paymentMethod}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {paymentMethod === 'card' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Card Number</label>
                  <div className="relative">
                    <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      autoComplete="cc-number"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm font-medium"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Expiry</label>
                    <input
                      type="text"
                      autoComplete="cc-exp"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm font-medium text-center"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">CVC</label>
                    <input
                      type="text"
                      autoComplete="cc-csc"
                      placeholder="•••"
                      value={cvc}
                      onChange={handleCvcChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm font-medium text-center"
                      style={{ WebkitTextSecurity: 'disc' }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">UPI ID / VPA</label>
                <input
                  type="text"
                  placeholder="username@upi"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm font-medium"
                />
                <p className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                  A payment request will be sent to your UPI app. Please approve it to complete the upgrade.
                </p>
              </div>
            )}
          </motion.div>

          <hr className="my-4 border-gray-100 dark:border-gray-800" />

          {/* Promo Code Section */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Have a Promo Code?</label>
            <div className="relative flex items-center group">
              <input
                type="text"
                value={promoCodeInput}
                onChange={e => setPromoCodeInput(e.target.value)}
                disabled={!!appliedPromo}
                placeholder="ENTER CODE"
                className="w-full pl-4 pr-[100px] py-3 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm font-bold uppercase shadow-sm group-hover:border-gray-300 dark:group-hover:border-gray-700 disabled:opacity-70 disabled:bg-gray-50 dark:disabled:bg-gray-900"
              />
              <button
                onClick={appliedPromo ? () => { setAppliedPromo(null); setPromoCodeInput(''); } : handleApplyPromo}
                className={`absolute right-1.5 top-1.5 bottom-1.5 px-5 rounded-full text-xs font-extrabold uppercase tracking-wide transition-all flex items-center justify-center ${appliedPromo ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20' : 'bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'}`}
              >
                {appliedPromo ? 'Remove' : 'Apply'}
              </button>
            </div>
            {promoError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-1.5 mt-2.5 text-xs font-bold text-red-500">
                <AlertCircle size={14} /> {promoError}
              </motion.div>
            )}
            {appliedPromo && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-1.5 mt-2.5 text-xs font-bold text-emerald-500">
                <CheckCircle2 size={14} /> Discount applied: {appliedPromo.discount}
              </motion.div>
            )}
          </div>

          {/* Submit button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handlePaymentSuccess}
              disabled={isProcessing}
              className="w-full py-3.5 px-8 rounded-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-extrabold text-sm tracking-wide transition-all shadow-lg shadow-violet-600/20 flex justify-between items-center disabled:opacity-80 disabled:cursor-not-allowed uppercase"
            >
              <span>{isProcessing ? 'Processing...' : 'Subscribe'}</span>
              {!isProcessing && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold transition-colors">
                  {formatPrice(getDiscountedPrice())}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-center items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500">
          <Shield size={14} /> Payments are secure and encrypted.
        </div>
      </div>

    </div>
  );
}
