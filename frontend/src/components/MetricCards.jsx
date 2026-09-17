import React from 'react';
import { Wallet, CreditCard, Scale, TrendingUp } from 'lucide-react';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2
  }).format(val || 0);
};

const MetricCards = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Assets */}
      <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Assets</span>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white">{formatCurrency(summary.total_assets)}</div>
        <p className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1 font-medium">
          Normal Balance: Debit
        </p>
      </div>

      {/* Total Liabilities */}
      <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Liabilities</span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white">{formatCurrency(summary.total_liabilities)}</div>
        <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 font-medium">
          Normal Balance: Credit
        </p>
      </div>

      {/* Net Worth */}
      <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Net Worth (Equity)</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white">{formatCurrency(summary.net_worth)}</div>
        <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
          Assets - Liabilities Reconciled
        </p>
      </div>

      {/* Net Operating Income */}
      <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Net Income</span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white">{formatCurrency(summary.net_income)}</div>
        <p className="text-[11px] text-blue-400 mt-1 flex items-center gap-1 font-medium">
          Revenue (£{summary.total_revenue?.toLocaleString()}) - Expenses (£{summary.total_expenses?.toLocaleString()})
        </p>
      </div>
    </div>
  );
};

export default MetricCards;