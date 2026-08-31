import React, { useState } from 'react';
import { BookOpen, Target, Sparkles, TrendingUp, ShieldCheck, PieChart as PieChartIcon } from 'lucide-react';

export default function JuniorProBook() {
  const [goalAmount, setGoalAmount] = useState(10000);
  const [goalMonths, setGoalMonths] = useState(12);
  const [expectedReturn, setExpectedReturn] = useState(10); // 10% annual

  // Monthly return rate
  const monthlyRate = expectedReturn / 12 / 100;
  // SIP Formula
  const monthlySavings =
    monthlyRate === 0
      ? goalAmount / goalMonths
      : (goalAmount * monthlyRate) /
        ((Math.pow(1 + monthlyRate, goalMonths) - 1) * (1 + monthlyRate));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <Sparkles className="absolute right-10 top-10 opacity-20" size={100} />
        <div className="relative z-10">
          <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
            Junior Pro Book
          </span>
          <h1 className="text-3xl font-extrabold mt-3 junior-font-heading">
            Investment Strategy Playbook 📖
          </h1>
          <p className="text-indigo-100 font-medium mt-2 max-w-lg text-sm">
            Learn the secret rules of investing that billionaires use, and calculate how to reach your big money goals!
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strategies Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-blue-600" /> Pro Strategies
          </h2>

          <div className="bg-white rounded-3xl p-6 border-2 border-blue-100 shadow-sm hover:border-blue-300 transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">1. Buy and Hold Magic</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Also known as "Diamond Hands"! Instead of trading every day, you buy shares in a great company and keep them for years. Over time, good companies grow bigger, and your money grows with them!
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-sm hover:border-emerald-300 transition-all">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck className="text-emerald-600" size={24} />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">2. The Diversification Shield</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              "Don't put all your eggs in one basket!" If you invest all your money in just one company and it has a bad year, you lose out. But if you spread your money across Tech, Food, and Banks, you stay safe!
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-purple-100 shadow-sm hover:border-purple-300 transition-all">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
              <PieChartIcon className="text-purple-600" size={24} />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">3. SIP (Systematic Investment)</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Investing a small amount (like your pocket money) every single month, no matter what happens in the market. It's like planting a tiny seed every month to grow a massive money forest!
            </p>
          </div>
        </div>

        {/* Goal Calculator Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Target className="text-orange-500" /> Goal Calculator
          </h2>

          <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-orange-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-50 -z-10" />
            
            <p className="text-sm text-slate-600 font-medium mb-6">
              Want to buy a PS5, a new bike, or save for college? Find out how much you need to save each month!
            </p>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">My Big Goal Amount (₹)</label>
                <input
                  type="range"
                  min={1000}
                  max={100000}
                  step={500}
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="mt-2 text-right font-black text-slate-900 text-lg">
                  ₹{goalAmount.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">When do I want it? (Months)</label>
                <input
                  type="range"
                  min={3}
                  max={60}
                  step={1}
                  value={goalMonths}
                  onChange={(e) => setGoalMonths(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="mt-2 text-right font-black text-slate-900 text-lg">
                  {goalMonths} Months
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Expected Magic Return (% per year)</label>
                <input
                  type="range"
                  min={2}
                  max={20}
                  step={1}
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="mt-2 text-right font-black text-slate-900 text-lg">
                  {expectedReturn}%
                </div>
              </div>
            </div>

            <div className="mt-8 bg-orange-50 border border-orange-200 rounded-2xl p-5 text-center">
              <div className="text-xs font-black uppercase text-orange-600 tracking-wide mb-1">
                You Need To Save
              </div>
              <div className="text-3xl font-black text-orange-900">
                ₹{Math.ceil(monthlySavings).toLocaleString('en-IN')}
              </div>
              <div className="text-xs font-medium text-orange-700 mt-1">
                Every month to reach your goal!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
