import React from 'react';
import { PieChart } from 'lucide-react';

const ExpenseBreakdown = ({ breakdown = [], totalExpenses = 0 }) => {
  if (!breakdown || breakdown.length === 0) return null;

  return (
    <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-cyan-400" />
          Operating Expense Distribution
        </h3>
        <span className="text-xs font-mono font-bold text-slate-400">
          Total: ₹{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="space-y-3">
        {breakdown.map((item) => {
          const pct = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
          return (
            <div key={item.account_id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">{item.name}</span>
                <span className="font-mono text-slate-400">
                  ₹{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({pct.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${Math.min(100, Math.max(3, pct))}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseBreakdown;