import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, Activity, CreditCard, ArrowUpRight, Download, BarChart, Banknote, Search, X, Loader2, ArrowLeft, ArrowRight, Info, ChevronDown } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const TABS = [
  { id: 'sip', label: 'SIP Calculator', fullLabel: 'Systematic Investment Plan', icon: Activity, desc: 'Plan monthly investments into a mutual fund', accent: 'blue', category: 'grow', explainer: 'Estimates the maturity value of a fixed amount invested every month into a mutual fund, assuming a constant annual return.', formula: 'M = P × [((1 + r)ⁿ − 1) / r] × (1 + r), where P = monthly investment, r = monthly rate, n = number of months' },
  { id: 'stepup', label: 'Step-up SIP', fullLabel: 'Step-up SIP Calculator', icon: ArrowUpRight, desc: 'SIP returns with an annual investment step-up', accent: 'sky', category: 'grow', explainer: 'Like a regular SIP, but your monthly investment increases by a fixed percentage every year — matching rising income.', formula: 'Same as SIP, but the monthly installment is stepped up by a chosen % at the start of each year' },
  { id: 'lumpsum', label: 'Lumpsum Calculator', fullLabel: 'Lumpsum Investment Calculator', icon: PieChartIcon, desc: 'Returns on a one-time stock or fund investment', accent: 'violet', category: 'grow', explainer: 'Projects the future value of a single, one-time investment growing at a fixed annual rate over time.', formula: 'A = P × (1 + r)ⁿ, where P = principal, r = annual rate, n = years' },
  { id: 'compound', label: 'Compound Interest', fullLabel: 'Compound Interest Calculator', icon: TrendingUp, desc: 'How a stock or deposit compounds over time', accent: 'emerald', category: 'grow', explainer: 'Shows how a principal amount grows when interest is reinvested at a chosen compounding frequency.', formula: 'A = P × (1 + r/n)ⁿᵗ, where P = principal, r = annual rate, n = compounding frequency, t = years' },
  { id: 'swp', label: 'SWP Calculator', fullLabel: 'Systematic Withdrawal Plan', icon: Download, desc: 'Regular withdrawals from a mutual fund corpus', accent: 'orange', category: 'withdraw', explainer: 'Simulates withdrawing a fixed amount every month from an existing corpus that keeps earning returns, showing how long it lasts.', formula: 'Balance is recalculated monthly: Bₙ = Bₙ₋₁ × (1 + r) − withdrawal' },
  { id: 'emi', label: 'EMI Calculator', fullLabel: 'Loan EMI Calculator', icon: CreditCard, desc: 'Equated monthly installment for a loan', accent: 'rose', category: 'loans', explainer: 'Calculates the fixed monthly payment needed to repay a loan, plus total interest paid over the tenure.', formula: 'EMI = [P × r × (1 + r)ⁿ] / [(1 + r)ⁿ − 1], where P = loan amount, r = monthly rate, n = months' },
  { id: 'cagr', label: 'CAGR Calculator', fullLabel: 'Compound Annual Growth Rate', icon: BarChart, desc: 'Annualized growth rate between two values', accent: 'indigo', category: 'analyze', explainer: 'Works backwards from a starting and ending value to find the single annual growth rate that explains the change.', formula: 'CAGR = [(Final Value / Initial Value)^(1/years) − 1] × 100' },
  { id: 'inflation', label: 'Inflation Calculator', fullLabel: 'Inflation Impact Calculator', icon: Banknote, desc: 'Future cost of money adjusted for inflation', accent: 'red', category: 'analyze', explainer: 'Shows what an amount today will cost in the future once a chosen annual inflation rate erodes its value.', formula: 'Future Cost = Current Cost × (1 + inflation rate)ⁿ, where n = years' },
];

const CATEGORIES = [
  { id: 'grow', label: 'Grow Your Money', desc: 'Project how investments compound over time' },
  { id: 'withdraw', label: 'Plan Withdrawals', desc: 'Simulate drawing income from a corpus' },
  { id: 'loans', label: 'Loans', desc: 'Work out monthly repayments' },
  { id: 'analyze', label: 'Analyze', desc: 'Understand growth rates and inflation' },
];

const ACCENTS = {
  blue: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20', ring: 'focus-within:ring-blue-500/20 focus-within:border-blue-400', hex: '#3b82f6', chart: ['#94a3b8', '#3b82f6'], cardGrad: 'from-blue-500/10 via-blue-500/[0.03] to-transparent dark:from-blue-500/15 dark:via-blue-500/[0.04]', panelGrad: 'from-blue-50 via-white to-white dark:from-blue-500/10 dark:via-gray-900 dark:to-gray-900', ringHex: 'rgba(59,130,246,0.18)' },
  sky: { text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10', border: 'border-sky-100 dark:border-sky-500/20', ring: 'focus-within:ring-sky-500/20 focus-within:border-sky-400', hex: '#0ea5e9', chart: ['#94a3b8', '#0ea5e9'], cardGrad: 'from-sky-500/10 via-sky-500/[0.03] to-transparent dark:from-sky-500/15 dark:via-sky-500/[0.04]', panelGrad: 'from-sky-50 via-white to-white dark:from-sky-500/10 dark:via-gray-900 dark:to-gray-900', ringHex: 'rgba(14,165,233,0.18)' },
  violet: { text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-100 dark:border-violet-500/20', ring: 'focus-within:ring-violet-500/20 focus-within:border-violet-400', hex: '#8b5cf6', chart: ['#94a3b8', '#8b5cf6'], cardGrad: 'from-violet-500/10 via-violet-500/[0.03] to-transparent dark:from-violet-500/15 dark:via-violet-500/[0.04]', panelGrad: 'from-violet-50 via-white to-white dark:from-violet-500/10 dark:via-gray-900 dark:to-gray-900', ringHex: 'rgba(139,92,246,0.18)' },
  orange: { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-100 dark:border-orange-500/20', ring: 'focus-within:ring-orange-500/20 focus-within:border-orange-400', hex: '#f97316', chart: ['#3b82f6', '#f97316'], cardGrad: 'from-orange-500/10 via-orange-500/[0.03] to-transparent dark:from-orange-500/15 dark:via-orange-500/[0.04]', panelGrad: 'from-orange-50 via-white to-white dark:from-orange-500/10 dark:via-gray-900 dark:to-gray-900', ringHex: 'rgba(249,115,22,0.18)' },
  indigo: { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/20', ring: 'focus-within:ring-indigo-500/20 focus-within:border-indigo-400', hex: '#6366f1', chart: ['#94a3b8', '#6366f1'], cardGrad: 'from-indigo-500/10 via-indigo-500/[0.03] to-transparent dark:from-indigo-500/15 dark:via-indigo-500/[0.04]', panelGrad: 'from-indigo-50 via-white to-white dark:from-indigo-500/10 dark:via-gray-900 dark:to-gray-900', ringHex: 'rgba(99,102,241,0.18)' },
  rose: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-100 dark:border-rose-500/20', ring: 'focus-within:ring-rose-500/20 focus-within:border-rose-400', hex: '#f43f5e', chart: ['#94a3b8', '#f97316'], cardGrad: 'from-rose-500/10 via-rose-500/[0.03] to-transparent dark:from-rose-500/15 dark:via-rose-500/[0.04]', panelGrad: 'from-rose-50 via-white to-white dark:from-rose-500/10 dark:via-gray-900 dark:to-gray-900', ringHex: 'rgba(244,63,94,0.18)' },
  emerald: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20', ring: 'focus-within:ring-emerald-500/20 focus-within:border-emerald-400', hex: '#10b981', chart: ['#94a3b8', '#10b981'], cardGrad: 'from-emerald-500/10 via-emerald-500/[0.03] to-transparent dark:from-emerald-500/15 dark:via-emerald-500/[0.04]', panelGrad: 'from-emerald-50 via-white to-white dark:from-emerald-500/10 dark:via-gray-900 dark:to-gray-900', ringHex: 'rgba(16,185,129,0.18)' },
  red: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-100 dark:border-red-500/20', ring: 'focus-within:ring-red-500/20 focus-within:border-red-400', hex: '#ef4444', chart: ['#94a3b8', '#ef4444'], cardGrad: 'from-red-500/10 via-red-500/[0.03] to-transparent dark:from-red-500/15 dark:via-red-500/[0.04]', panelGrad: 'from-red-50 via-white to-white dark:from-red-500/10 dark:via-gray-900 dark:to-gray-900', ringHex: 'rgba(239,68,68,0.18)' },
};

// Which asset types are relevant to search for, per calculator. `null` = no asset picker at all.
const ASSET_SCOPE = {
  sip: ['fund'],
  stepup: ['fund'],
  swp: ['fund'],
  lumpsum: ['stock', 'fund'],
  compound: ['stock', 'fund'],
  cagr: null,
  emi: null,
  inflation: null,
};

const TAB_BY_ID = Object.fromEntries(TABS.map(t => [t.id, t]));

// Shown automatically when a calculator opens with no specific asset chosen, so the
// numbers reflect a real, well-known fund/stock rather than an arbitrary default rate.
const DEFAULT_FUND = { name: 'Axis ELSS Tax Saver Fund - Direct Plan - Growth Option', type: 'Mutual Fund', schemeCode: '120503' };
const DEFAULT_STOCK = { name: 'Reliance Industries Limited', type: 'Stock', ticker: 'RELIANCE.NS' };
const DEFAULT_ASSETS = {
  sip: DEFAULT_FUND,
  stepup: DEFAULT_FUND,
  swp: DEFAULT_FUND,
  lumpsum: DEFAULT_STOCK,
  compound: DEFAULT_STOCK,
};

export default function Calculators() {
  const [activeTab, setActiveTabState] = useState(null); // null = landing hub
  const { currency, currencies } = useCurrency();
  const symbol = currencies[currency]?.symbol || '₹';

  // --- SIP State ---
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(10);

  // --- Lumpsum State ---
  const [lumpAmount, setLumpAmount] = useState(100000);
  const [lumpRate, setLumpRate] = useState(12);
  const [lumpYears, setLumpYears] = useState(10);

  // --- EMI State ---
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [loanRate, setLoanRate] = useState(8.5);
  const [loanYears, setLoanYears] = useState(10);

  // --- Compound State ---
  const [principal, setPrincipal] = useState(100000);
  const [compoundRate, setCompoundRate] = useState(10);
  const [compoundYears, setCompoundYears] = useState(10);
  const [frequency, setFrequency] = useState(1); // 1 = yearly, 12 = monthly

  // --- Step-up SIP State ---
  const [stepupAmount, setStepupAmount] = useState(5000);
  const [stepupPercent, setStepupPercent] = useState(10);
  const [stepupRate, setStepupRate] = useState(12);
  const [stepupYears, setStepupYears] = useState(10);

  // --- SWP State ---
  const [swpTotal, setSwpTotal] = useState(5000000);
  const [swpWithdrawal, setSwpWithdrawal] = useState(25000);
  const [swpRate, setSwpRate] = useState(8);
  const [swpYears, setSwpYears] = useState(10);

  // --- CAGR State ---
  const [cagrInitial, setCagrInitial] = useState(100000);
  const [cagrFinal, setCagrFinal] = useState(200000);
  const [cagrYears, setCagrYears] = useState(5);

  // --- Inflation State ---
  const [infCurrentCost, setInfCurrentCost] = useState(50000);
  const [infRate, setInfRate] = useState(6);
  const [infYears, setInfYears] = useState(10);

  const [showFormula, setShowFormula] = useState(false);

  // --- Fund/Stock Search State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null); // { name, type, rate, subtitle }
  const [assetLoading, setAssetLoading] = useState(false);
  const [assetError, setAssetError] = useState('');
  const searchRef = useRef(null);
  const searchDebounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rateSetterMap = {
    sip: setSipRate,
    stepup: setStepupRate,
    lumpsum: setLumpRate,
    swp: setSwpRate,
    compound: setCompoundRate,
  };

  const assetScope = activeTab ? ASSET_SCOPE[activeTab] : null;

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();

        const stockResults = assetScope?.includes('stock')
          ? (data.stocks || []).map(s => ({
              key: `stock-${s.id}`,
              name: s.name,
              symbol: s.symbol,
              type: 'Stock',
              ticker: s.ticker,
              subtitle: s.exchange
            }))
          : [];

        const fundResults = assetScope?.includes('fund')
          ? (data.funds || []).map(f => ({
              key: `fund-${f.id}`,
              name: f.name,
              symbol: f.plan,
              type: 'Mutual Fund',
              schemeCode: f.schemeCode,
              subtitle: f.amc
            }))
          : [];

        setSearchResults([...stockResults, ...fundResults].slice(0, 8));
        setShowSuggestions(true);
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 300);
  };

  const handleSelectAsset = async (item, forTab) => {
    setShowSuggestions(false);
    setSearchQuery(item.name);
    setAssetError('');
    setAssetLoading(true);
    setSelectedAsset(null);
    try {
      let rate = null;
      let subtitle = '';
      if (item.type === 'Stock') {
        const res = await fetch(`/api/stock-stats/${encodeURIComponent(item.ticker)}`);
        const data = await res.json();
        rate = data.return1Y ?? data.return6M ?? data.return3M;
        subtitle = rate != null ? `1Y Return: ${rate}%` : 'Return data unavailable';
      } else {
        const res = await fetch(`/api/fund-stats/${encodeURIComponent(item.schemeCode)}`);
        const data = await res.json();
        rate = data.return3Y ?? data.return1Y;
        subtitle = rate != null ? `${data.return3Y != null ? '3Y' : '1Y'} Return: ${rate}%` : 'Return data unavailable';
      }

      if (rate == null || isNaN(rate)) {
        setAssetError('Could not fetch return data for this asset. Please enter the rate manually.');
        setAssetLoading(false);
        setSelectedAsset({ name: item.name, type: item.type, subtitle: item.subtitle });
        return;
      }

      // Use absolute value as an "expected rate" input; clamp to the slider's range
      const clampedRate = Math.min(Math.max(Math.abs(rate), 1), 50);
      const setter = rateSetterMap[forTab || activeTab];
      if (setter) setter(Number(clampedRate.toFixed(2)));

      setSelectedAsset({ name: item.name, type: item.type, rate, subtitle });
    } catch (err) {
      console.error('Asset fetch error:', err);
      setAssetError('Failed to fetch data for this asset. Please enter the rate manually.');
    } finally {
      setAssetLoading(false);
    }
  };

  const clearSelectedAsset = () => {
    setSelectedAsset(null);
    setAssetError('');
    setSearchQuery('');
    setSearchResults([]);
  };

  const setActiveTab = (tabId, opts = {}) => {
    setActiveTabState(tabId);
    clearSelectedAsset();
    setShowSuggestions(false);
    setShowFormula(false);
    if (opts.loadDefault !== false && DEFAULT_ASSETS[tabId]) {
      handleSelectAsset(DEFAULT_ASSETS[tabId], tabId);
    }
  };

  const goToHub = () => setActiveTab(null);

  // --- Deep-link from a stock/fund profile page: ?calc=sip&type=fund&name=...&schemeCode=... (or &ticker=...) ---
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const calc = searchParams.get('calc');
    if (!calc || !TAB_BY_ID[calc]) return;

    const type = searchParams.get('type'); // 'stock' | 'fund'
    const name = searchParams.get('name');
    const ticker = searchParams.get('ticker');
    const schemeCode = searchParams.get('schemeCode');
    const hasAsset = type && name && (ticker || schemeCode);

    setActiveTab(calc, { loadDefault: !hasAsset });

    if (hasAsset) {
      const item = type === 'stock'
        ? { name, type: 'Stock', ticker }
        : { name, type: 'Mutual Fund', schemeCode };
      handleSelectAsset(item, calc);
    }

    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Calculations ---
  const sipResult = useMemo(() => {
    const months = sipYears * 12;
    const monthlyRate = sipRate / 12 / 100;
    const invested = sipAmount * months;
    let maturity = 0;
    if (monthlyRate === 0) {
      maturity = invested;
    } else {
      maturity = sipAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    }
    return { invested, maturity, wealthGained: maturity - invested };
  }, [sipAmount, sipRate, sipYears]);

  const stepupResult = useMemo(() => {
    let invested = 0;
    let maturity = 0;
    let currentSip = stepupAmount;
    const monthlyRate = stepupRate / 12 / 100;

    for (let year = 1; year <= stepupYears; year++) {
      for (let month = 1; month <= 12; month++) {
        invested += currentSip;
        maturity = (maturity + currentSip) * (1 + monthlyRate);
      }
      currentSip += currentSip * (stepupPercent / 100);
    }
    return { invested, maturity, wealthGained: maturity - invested };
  }, [stepupAmount, stepupPercent, stepupRate, stepupYears]);

  const swpResult = useMemo(() => {
    let balance = swpTotal;
    const monthlyRate = swpRate / 12 / 100;
    const months = swpYears * 12;
    let totalWithdrawn = 0;

    for (let i = 1; i <= months; i++) {
      balance = balance * (1 + monthlyRate) - swpWithdrawal;
      totalWithdrawn += swpWithdrawal;
    }
    return { totalWithdrawn, finalBalance: Math.max(0, balance), initial: swpTotal };
  }, [swpTotal, swpWithdrawal, swpRate, swpYears]);

  const cagrResult = useMemo(() => {
    let cagr = 0;
    if (cagrInitial > 0 && cagrYears > 0) {
      cagr = (Math.pow(cagrFinal / cagrInitial, 1 / cagrYears) - 1) * 100;
    }
    return { cagr: cagr.toFixed(2) };
  }, [cagrInitial, cagrFinal, cagrYears]);

  const infResult = useMemo(() => {
    const futureCost = infCurrentCost * Math.pow(1 + infRate / 100, infYears);
    return { futureCost, diff: futureCost - infCurrentCost };
  }, [infCurrentCost, infRate, infYears]);

  const lumpResult = useMemo(() => {
    const invested = lumpAmount;
    const maturity = lumpAmount * Math.pow(1 + lumpRate / 100, lumpYears);
    return { invested, maturity, wealthGained: maturity - invested };
  }, [lumpAmount, lumpRate, lumpYears]);

  const emiResult = useMemo(() => {
    const months = loanYears * 12;
    const monthlyRate = loanRate / 12 / 100;
    let emi = 0;
    if (monthlyRate === 0) {
      emi = loanAmount / months;
    } else {
      emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    }
    const totalPayment = emi * months;
    const totalInterest = totalPayment - loanAmount;
    return { emi, totalInterest, totalPayment, principal: loanAmount };
  }, [loanAmount, loanRate, loanYears]);

  const compoundResult = useMemo(() => {
    const invested = principal;
    const maturity = principal * Math.pow(1 + (compoundRate / 100) / frequency, frequency * compoundYears);
    return { invested, maturity, wealthGained: maturity - invested };
  }, [principal, compoundRate, compoundYears, frequency]);

  // UI Helpers
  const formatNum = (val) => Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const renderTakeaway = (text, accentClass) => (
    <p className="text-sm text-textMuted dark:text-gray-400 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700 leading-relaxed">
      <span className={`font-semibold ${accentClass}`}>Takeaway: </span>{text}
    </p>
  );

  const renderSliderInput = (label, value, setter, min, max, step, unit, accentClass, accentHex) => (
    <div className="mb-7">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-semibold text-textMain dark:text-gray-200">{label}</label>
        <div className="bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-1 min-w-[120px]">
          {unit === 'currency' && <span className="text-textMuted dark:text-gray-500 font-medium">{symbol}</span>}
          <input
            type="number"
            value={value}
            onChange={(e) => setter(Number(e.target.value))}
            className={`w-full bg-transparent border-none outline-none text-right font-bold ${accentClass} focus:ring-0 p-0`}
          />
          {unit !== 'currency' && <span className="text-textMuted dark:text-gray-500 font-medium ml-1">{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setter(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        style={{ accentColor: accentHex }}
      />
    </div>
  );

  const renderChart = (data, colors) => (
    <div className="h-[280px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <RechartsTooltip
            formatter={(value) => `${symbol}${formatNum(value)}`}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const activeMeta = activeTab ? TAB_BY_ID[activeTab] : null;
  const accent = activeMeta ? ACCENTS[activeMeta.accent] : ACCENTS.blue;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-8 pb-20">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          {activeTab ? (
            <button
              onClick={goToHub}
              className="flex items-center gap-2 text-sm font-semibold text-textMuted dark:text-gray-400 hover:text-textMain dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              All Calculators
            </button>
          ) : null}
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-bold tracking-[0.2em] uppercase ${accent.text}`}>
              {activeMeta ? activeMeta.label.replace(' Calculator', '') : 'Tools'}
            </span>
            <span className={`h-px w-8 ${accent.text} opacity-40`} style={{ background: 'currentColor' }} />
          </div>
          <h1 className="text-[2.25rem] md:text-[3rem] font-semibold text-textMain dark:text-white tracking-tight leading-[1.05]">
            {activeMeta ? activeMeta.fullLabel : 'Financial Calculators'}
          </h1>
          <p className="text-textMuted dark:text-gray-400 mt-3 text-base md:text-lg max-w-2xl">
            {activeMeta ? activeMeta.desc : 'Smart tools to help you plan your investments, loans, and financial goals.'}
          </p>

          {activeMeta && (
            <div className="mt-5 max-w-3xl">
              <p className="text-sm text-textMain dark:text-gray-300 leading-relaxed flex items-start gap-2">
                <Info size={16} className={`${accent.text} flex-shrink-0 mt-0.5`} />
                <span>{activeMeta.explainer}</span>
              </p>
              <button
                onClick={() => setShowFormula(s => !s)}
                className={`flex items-center gap-1.5 text-xs font-semibold ${accent.text} mt-3 ml-6`}
              >
                How it's calculated
                <ChevronDown size={14} className={`transition-transform ${showFormula ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showFormula && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <code className={`block mt-2 ml-6 text-xs font-mono ${accent.bg} ${accent.text} border ${accent.border} rounded-lg px-3 py-2.5`}>
                      {activeMeta.formula}
                    </code>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {!activeTab && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const a = ACCENTS[tab.accent];
              const cat = CATEGORIES.find(c => c.id === tab.category);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative text-left overflow-hidden bg-gradient-to-br ${a.cardGrad} bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                >
                  <Icon size={80} strokeWidth={1} className={`absolute -right-3 -bottom-3 ${a.text} opacity-[0.08] group-hover:opacity-[0.14] group-hover:scale-110 transition-all duration-300`} />
                  <div className="flex items-center justify-between relative mb-6">
                    <div className={`w-12 h-12 rounded-xl ${a.bg} flex items-center justify-center`}>
                      <Icon size={24} className={a.text} />
                    </div>
                    <span className={`text-[0.65rem] font-bold tracking-wide uppercase ${a.text} ${a.bg} px-2 py-1 rounded-md`}>
                      {cat?.label}
                    </span>
                  </div>
                  <h3 className="font-bold text-textMain dark:text-white text-[1.05rem] relative">{tab.label}</h3>
                  <p className="text-sm text-textMuted dark:text-gray-500 mt-1.5 leading-snug relative pr-4">{tab.desc}</p>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${a.text} mt-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 relative`}>
                    Open calculator <ArrowRight size={13} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {activeTab && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {assetScope && (
                <div className="mb-6">
                  <div className={`relative max-w-xl`} ref={searchRef}>
                    <div className={`flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 h-12 shadow-sm focus-within:ring-2 ${accent.ring}`}>
                      <Search size={18} className="text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder={
                          assetScope.length === 1
                            ? 'Search a mutual fund to auto-fill expected return...'
                            : 'Search a stock or mutual fund to auto-fill expected return...'
                        }
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => { if (searchResults.length > 0) setShowSuggestions(true); }}
                        className="bg-transparent border-none outline-none text-sm text-textMain dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 w-full"
                      />
                      {assetLoading && <Loader2 size={16} className={`animate-spin ${accent.text} flex-shrink-0`} />}
                      {searchQuery && !assetLoading && (
                        <button onClick={clearSelectedAsset} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0">
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {showSuggestions && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-[calc(100%+8px)] left-0 w-full max-h-[300px] overflow-y-auto z-50 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-2"
                        >
                          {searchResults.length > 0 ? (
                            searchResults.map((result) => (
                              <div
                                key={result.key}
                                onClick={() => handleSelectAsset(result)}
                                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-textMain dark:text-gray-100 text-[0.9rem]">{result.name}</span>
                                  <span className={`text-[0.7rem] px-2 py-0.5 rounded font-semibold ${result.type === 'Stock' ? 'bg-blue-50 dark:bg-blue-500/10 text-primary' : 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'}`}>
                                    {result.type}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[0.75rem] text-textMuted dark:text-gray-500 mt-1">
                                  <span>{result.symbol}</span>
                                  <span>{result.subtitle}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-textMuted dark:text-gray-500 text-sm">
                              No results found for "{searchQuery}"
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {selectedAsset && (
                    <div className={`mt-3 max-w-xl flex items-center justify-between gap-3 ${accent.bg} border ${accent.border} rounded-xl px-4 py-2.5`}>
                      <div className="text-sm">
                        <span className="font-semibold text-textMain dark:text-white">{selectedAsset.name}</span>
                        <span className="text-textMuted dark:text-gray-400 ml-2">{selectedAsset.subtitle}</span>
                      </div>
                      <button onClick={clearSelectedAsset} className="text-textMuted dark:text-gray-400 hover:text-red-500 flex-shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  {assetError && (
                    <p className="mt-2 max-w-xl text-sm text-orange-500 dark:text-orange-400">{assetError}</p>
                  )}
                </div>
              )}

              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm">
                {/* SIP Calculator */}
                {activeTab === 'sip' && (
                  <div className="grid md:grid-cols-2 gap-10 items-start">
                    <div>
                      {renderSliderInput('Monthly Investment', sipAmount, setSipAmount, 500, 100000, 500, 'currency', accent.text, accent.hex)}
                      {renderSliderInput('Expected Return Rate (p.a)', sipRate, setSipRate, 1, 50, 0.5, '%', accent.text, accent.hex)}
                      {renderSliderInput('Time Period', sipYears, setSipYears, 1, 40, 1, 'Yr', accent.text, accent.hex)}
                    </div>
                    <div className={`bg-gradient-to-b ${accent.panelGrad} rounded-2xl p-6 border ${accent.border} shadow-sm lg:sticky lg:top-24`}>
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-textMuted dark:text-gray-400 font-medium">Invested Amount</span>
                          <span className="text-lg font-bold text-textMain dark:text-white">{symbol}{formatNum(sipResult.invested)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-textMuted dark:text-gray-400 font-medium">Est. Returns</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">{symbol}{formatNum(sipResult.wealthGained)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-textMain dark:text-white font-bold">Total Value</span>
                          <span className={`text-2xl font-bold ${accent.text}`}>{symbol}{formatNum(sipResult.maturity)}</span>
                        </div>
                      </div>
                      {renderChart([
                        { name: 'Invested Amount', value: sipResult.invested },
                        { name: 'Est. Returns', value: sipResult.wealthGained }
                      ], accent.chart)}
                      {renderTakeaway(
                        `Investing ${symbol}${formatNum(sipAmount)}/month for ${sipYears} years at ${sipRate}% could grow to ${symbol}${formatNum(sipResult.maturity)} — a gain of ${symbol}${formatNum(sipResult.wealthGained)} over what you put in.`,
                        accent.text
                      )}
                    </div>
                  </div>
                )}

                {/* Step-up SIP Calculator */}
                {activeTab === 'stepup' && (
                  <div className="grid md:grid-cols-2 gap-10 items-start">
                    <div>
                      {renderSliderInput('Initial Monthly Investment', stepupAmount, setStepupAmount, 500, 100000, 500, 'currency', accent.text, accent.hex)}
                      {renderSliderInput('Annual Step-up (%)', stepupPercent, setStepupPercent, 1, 50, 1, '%', accent.text, accent.hex)}
                      {renderSliderInput('Expected Return Rate (p.a)', stepupRate, setStepupRate, 1, 50, 0.5, '%', accent.text, accent.hex)}
                      {renderSliderInput('Time Period', stepupYears, setStepupYears, 1, 40, 1, 'Yr', accent.text, accent.hex)}
                    </div>
                    <div className={`bg-gradient-to-b ${accent.panelGrad} rounded-2xl p-6 border ${accent.border} shadow-sm lg:sticky lg:top-24`}>
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-textMuted dark:text-gray-400 font-medium">Total Invested</span>
                          <span className="text-lg font-bold text-textMain dark:text-white">{symbol}{formatNum(stepupResult.invested)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-textMuted dark:text-gray-400 font-medium">Est. Returns</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">{symbol}{formatNum(stepupResult.wealthGained)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-textMain dark:text-white font-bold">Total Value</span>
                          <span className={`text-2xl font-bold ${accent.text}`}>{symbol}{formatNum(stepupResult.maturity)}</span>
                        </div>
                      </div>
                      {renderChart([
                        { name: 'Invested Amount', value: stepupResult.invested },
                        { name: 'Est. Returns', value: stepupResult.wealthGained }
                      ], accent.chart)}
                      {renderTakeaway(
                        `Starting at ${symbol}${formatNum(stepupAmount)}/month with a ${stepupPercent}% yearly step-up over ${stepupYears} years at ${stepupRate}% could grow to ${symbol}${formatNum(stepupResult.maturity)} — ${symbol}${formatNum(stepupResult.wealthGained)} more than a flat SIP of the same starting amount would return.`,
                        accent.text
                      )}
                    </div>
                  </div>
                )}

                {/* Lumpsum Calculator */}
                {activeTab === 'lumpsum' && (
                  <div className="grid md:grid-cols-2 gap-10 items-start">
                    <div>
                      {renderSliderInput('Total Investment', lumpAmount, setLumpAmount, 5000, 10000000, 5000, 'currency', accent.text, accent.hex)}
                      {renderSliderInput('Expected Return Rate (p.a)', lumpRate, setLumpRate, 1, 50, 0.5, '%', accent.text, accent.hex)}
                      {renderSliderInput('Time Period', lumpYears, setLumpYears, 1, 40, 1, 'Yr', accent.text, accent.hex)}
                    </div>
                    <div className={`bg-gradient-to-b ${accent.panelGrad} rounded-2xl p-6 border ${accent.border} shadow-sm lg:sticky lg:top-24`}>
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-textMuted dark:text-gray-400 font-medium">Invested Amount</span>
                          <span className="text-lg font-bold text-textMain dark:text-white">{symbol}{formatNum(lumpResult.invested)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-textMuted dark:text-gray-400 font-medium">Est. Returns</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">{symbol}{formatNum(lumpResult.wealthGained)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-textMain dark:text-white font-bold">Total Value</span>
                          <span className={`text-2xl font-bold ${accent.text}`}>{symbol}{formatNum(lumpResult.maturity)}</span>
                        </div>
                      </div>
                      {renderChart([
                        { name: 'Invested Amount', value: lumpResult.invested },
                        { name: 'Est. Returns', value: lumpResult.wealthGained }
                      ], accent.chart)}
                      {renderTakeaway(
                        `A one-time investment of ${symbol}${formatNum(lumpAmount)} growing at ${lumpRate}% for ${lumpYears} years could be worth ${symbol}${formatNum(lumpResult.maturity)} — a gain of ${symbol}${formatNum(lumpResult.wealthGained)}.`,
                        accent.text
                      )}
                    </div>
                  </div>
                )}

                {/* SWP Calculator */}
                {activeTab === 'swp' && (
                  <div className="grid md:grid-cols-2 gap-10 items-start">
                    <div>
                      {renderSliderInput('Total Investment', swpTotal, setSwpTotal, 50000, 50000000, 10000, 'currency', accent.text, accent.hex)}
                      {renderSliderInput('Withdrawal Per Month', swpWithdrawal, setSwpWithdrawal, 1000, 500000, 1000, 'currency', accent.text, accent.hex)}
                      {renderSliderInput('Expected Return Rate (p.a)', swpRate, setSwpRate, 1, 50, 0.5, '%', accent.text, accent.hex)}
                      {renderSliderInput('Time Period', swpYears, setSwpYears, 1, 40, 1, 'Yr', accent.text, accent.hex)}
                    </div>
                    <div className={`bg-gradient-to-b ${accent.panelGrad} rounded-2xl p-6 border ${accent.border} shadow-sm lg:sticky lg:top-24`}>
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-textMuted dark:text-gray-400 font-medium">Total Investment</span>
                          <span className="text-lg font-bold text-textMain dark:text-white">{symbol}{formatNum(swpResult.initial)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-textMuted dark:text-gray-400 font-medium">Total Withdrawn</span>
                          <span className="text-lg font-bold text-orange-500 dark:text-orange-400">{symbol}{formatNum(swpResult.totalWithdrawn)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-textMain dark:text-white font-bold">Final Balance</span>
                          <span className={`text-2xl font-bold ${accent.text}`}>{symbol}{formatNum(swpResult.finalBalance)}</span>
                        </div>
                      </div>
                      {renderChart([
                        { name: 'Final Balance', value: swpResult.finalBalance },
                        { name: 'Total Withdrawn', value: swpResult.totalWithdrawn }
                      ], accent.chart)}
                      {renderTakeaway(
                        swpResult.finalBalance > 0
                          ? `Withdrawing ${symbol}${formatNum(swpWithdrawal)}/month from a ${symbol}${formatNum(swpTotal)} corpus at ${swpRate}% could still leave ${symbol}${formatNum(swpResult.finalBalance)} after ${swpYears} years.`
                          : `Withdrawing ${symbol}${formatNum(swpWithdrawal)}/month from a ${symbol}${formatNum(swpTotal)} corpus at ${swpRate}% would exhaust the corpus before ${swpYears} years are up — consider a lower withdrawal amount.`,
                        accent.text
                      )}
                    </div>
                  </div>
                )}

                {/* CAGR Calculator */}
                {activeTab === 'cagr' && (
                  <div className="grid md:grid-cols-2 gap-10 items-start">
                    <div>
                      {renderSliderInput('Initial Value', cagrInitial, setCagrInitial, 1000, 10000000, 1000, 'currency', accent.text, accent.hex)}
                      {renderSliderInput('Final Value', cagrFinal, setCagrFinal, 1000, 50000000, 1000, 'currency', accent.text, accent.hex)}
                      {renderSliderInput('Time Period', cagrYears, setCagrYears, 1, 40, 1, 'Yr', accent.text, accent.hex)}
                    </div>
                    <div className={`bg-gradient-to-b ${accent.panelGrad} rounded-2xl p-6 border ${accent.border} shadow-sm lg:sticky lg:top-24 flex flex-col justify-center items-center text-center`}>
                      <div className={`w-24 h-24 ${accent.bg} rounded-full flex items-center justify-center mb-6`}>
                        <BarChart className={accent.text} size={40} />
                      </div>
                      <h3 className="text-textMuted dark:text-gray-400 font-medium mb-2">Compound Annual Growth Rate</h3>
                      <div className={`text-5xl font-black ${accent.text}`}>
                        {cagrResult.cagr}%
                      </div>
                      <p className="text-sm text-textMuted dark:text-gray-500 mt-4 max-w-[250px]">
                        This is the annualized rate at which your investment has grown over the specified period.
                      </p>
                      <p className="text-sm text-textMuted dark:text-gray-400 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700 leading-relaxed max-w-[280px]">
                        <span className={`font-semibold ${accent.text}`}>Takeaway: </span>
                        Growing from {symbol}{formatNum(cagrInitial)} to {symbol}{formatNum(cagrFinal)} over {cagrYears} years is equivalent to compounding at {cagrResult.cagr}% every year.
                      </p>
                    </div>
                  </div>
                )}

                {/* EMI Calculator */}
                {activeTab === 'emi' && (
                  <div className="grid md:grid-cols-2 gap-10 items-start">
                    <div>
                      {renderSliderInput('Loan Amount', loanAmount, setLoanAmount, 10000, 50000000, 10000, 'currency', accent.text, accent.hex)}
                      {renderSliderInput('Interest Rate (p.a)', loanRate, setLoanRate, 1, 20, 0.1, '%', accent.text, accent.hex)}
                      {renderSliderInput('Loan Tenure', loanYears, setLoanYears, 1, 30, 1, 'Yr', accent.text, accent.hex)}
                    </div>
                    <div className={`bg-gradient-to-b ${accent.panelGrad} rounded-2xl p-6 border ${accent.border} shadow-sm lg:sticky lg:top-24`}>
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-textMain dark:text-white font-bold">Monthly EMI</span>
                          <span className={`text-2xl font-bold ${accent.text}`}>{symbol}{formatNum(emiResult.emi)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-textMuted dark:text-gray-400 font-medium">Principal Amount</span>
                          <span className="text-lg font-bold text-textMain dark:text-white">{symbol}{formatNum(emiResult.principal)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-textMuted dark:text-gray-400 font-medium">Total Interest</span>
                          <span className="text-lg font-bold text-orange-500 dark:text-orange-400">{symbol}{formatNum(emiResult.totalInterest)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-textMain dark:text-white font-bold">Total Amount Payable</span>
                          <span className="text-xl font-bold text-textMain dark:text-white">{symbol}{formatNum(emiResult.totalPayment)}</span>
                        </div>
                      </div>
                      {renderChart([
                        { name: 'Principal Loan Amount', value: emiResult.principal },
                        { name: 'Total Interest', value: emiResult.totalInterest }
                      ], accent.chart)}
                      {renderTakeaway(
                        `A ${symbol}${formatNum(loanAmount)} loan at ${loanRate}% over ${loanYears} years means paying ${symbol}${formatNum(emiResult.emi)}/month — ${symbol}${formatNum(emiResult.totalInterest)} in interest on top of the principal.`,
                        accent.text
                      )}
                    </div>
                  </div>
                )}

                {/* Compound Interest Calculator */}
                {activeTab === 'compound' && (
                  <div className="grid md:grid-cols-2 gap-10 items-start">
                    <div>
                      {renderSliderInput('Principal Amount', principal, setPrincipal, 1000, 10000000, 1000, 'currency', accent.text, accent.hex)}
                      {renderSliderInput('Interest Rate (p.a)', compoundRate, setCompoundRate, 1, 50, 0.5, '%', accent.text, accent.hex)}
                      {renderSliderInput('Time Period', compoundYears, setCompoundYears, 1, 40, 1, 'Yr', accent.text, accent.hex)}

                      <div className="mt-6">
                        <label className="text-sm font-semibold text-textMain dark:text-gray-200 block mb-3">Compounding Frequency</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {[
                            { label: 'Yearly', val: 1 },
                            { label: 'Half-yearly', val: 2 },
                            { label: 'Quarterly', val: 4 },
                            { label: 'Monthly', val: 12 },
                          ].map(opt => (
                            <button
                              key={opt.val}
                              onClick={() => setFrequency(opt.val)}
                              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors border ${
                                frequency === opt.val
                                  ? `${accent.bg} ${accent.border} ${accent.text}`
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-textMuted dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-500/50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={`bg-gradient-to-b ${accent.panelGrad} rounded-2xl p-6 border ${accent.border} shadow-sm lg:sticky lg:top-24`}>
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-textMuted dark:text-gray-400 font-medium">Principal Amount</span>
                          <span className="text-lg font-bold text-textMain dark:text-white">{symbol}{formatNum(compoundResult.invested)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-textMuted dark:text-gray-400 font-medium">Total Interest</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">{symbol}{formatNum(compoundResult.wealthGained)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-textMain dark:text-white font-bold">Total Amount</span>
                          <span className={`text-2xl font-bold ${accent.text}`}>{symbol}{formatNum(compoundResult.maturity)}</span>
                        </div>
                      </div>
                      {renderChart([
                        { name: 'Principal Amount', value: compoundResult.invested },
                        { name: 'Total Interest', value: compoundResult.wealthGained }
                      ], accent.chart)}
                      {renderTakeaway(
                        `${symbol}${formatNum(principal)} compounding at ${compoundRate}% for ${compoundYears} years could grow to ${symbol}${formatNum(compoundResult.maturity)} — ${symbol}${formatNum(compoundResult.wealthGained)} in interest earned.`,
                        accent.text
                      )}
                    </div>
                  </div>
                )}

                {/* Inflation Calculator */}
                {activeTab === 'inflation' && (
                  <div className="grid md:grid-cols-2 gap-10 items-start">
                    <div>
                      {renderSliderInput('Current Cost / Value', infCurrentCost, setInfCurrentCost, 1000, 10000000, 1000, 'currency', accent.text, accent.hex)}
                      {renderSliderInput('Expected Inflation Rate (p.a)', infRate, setInfRate, 1, 20, 0.5, '%', accent.text, accent.hex)}
                      {renderSliderInput('Time Period', infYears, setInfYears, 1, 40, 1, 'Yr', accent.text, accent.hex)}
                    </div>
                    <div className={`bg-gradient-to-b ${accent.panelGrad} rounded-2xl p-6 border ${accent.border} shadow-sm lg:sticky lg:top-24`}>
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-textMuted dark:text-gray-400 font-medium">Current Cost</span>
                          <span className="text-lg font-bold text-textMain dark:text-white">{symbol}{formatNum(infCurrentCost)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-textMuted dark:text-gray-400 font-medium">Increase in Cost</span>
                          <span className="text-lg font-bold text-orange-500 dark:text-orange-400">+{symbol}{formatNum(infResult.diff)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-textMain dark:text-white font-bold">Future Cost</span>
                          <span className={`text-2xl font-bold ${accent.text}`}>{symbol}{formatNum(infResult.futureCost)}</span>
                        </div>
                      </div>
                      {renderChart([
                        { name: 'Current Cost', value: infCurrentCost },
                        { name: 'Increase in Cost', value: infResult.diff }
                      ], accent.chart)}
                      {renderTakeaway(
                        `Something that costs ${symbol}${formatNum(infCurrentCost)} today could cost ${symbol}${formatNum(infResult.futureCost)} in ${infYears} years at ${infRate}% inflation — plan for ${symbol}${formatNum(infResult.diff)} more just to keep up.`,
                        accent.text
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
