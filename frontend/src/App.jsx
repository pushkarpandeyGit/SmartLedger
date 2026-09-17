import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import AnomalyAlert from './components/AnomalyAlert';
import ExpenseBreakdown from './components/ExpenseBreakdown';
import LedgerTable from './components/LedgerTable';
import PostTransactionModal from './components/PostTransactionModal';
import { ShieldCheck, Cpu, Database, Activity, RefreshCw } from 'lucide-react';

export default function App() {
  const [summary, setSummary] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPostOpen, setIsPostOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, accRes, ledRes, anoRes] = await Promise.all([
        fetch('/api/v1/analytics/summary'),
        fetch('/api/v1/accounts'),
        fetch('/api/v1/ledger'),
        fetch('/api/v1/analytics/anomalies')
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (accRes.ok) setAccounts(await accRes.json());
      if (ledRes.ok) setLedgerEntries(await ledRes.json());
      if (anoRes.ok) setAnomalies(await anoRes.json());
    } catch (err) {
      console.warn('Dashboard fetch fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 pb-16">
      {/* Navigation */}
      <Navbar
        onOpenPostModal={() => setIsPostOpen(true)}
        onRefresh={fetchDashboardData}
        loading={loading}
      />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 space-y-6">
        {/* Core Banking Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-cyan-950/40 border border-slate-800 p-6 md:p-8 shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Banking Core & Risk Intelligence Platform
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              High-Integrity{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Double-Entry Ledger
              </span>{' '}
              with Real-Time Reconciliation
            </h1>

            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Designed according to GAAP/IFRS accounting standards for enterprise banking portfolios. 
              Enforces atomic balance reconciliation across debit and credit legs with Redis caching and real-time statistical outlier detection.
            </p>

            {/* Architecture Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Invariant Rule</div>
                  <div className="text-xs font-bold text-slate-200">Î₹ Debits == Î₹ Credits</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
                <Database className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Balance Cache</div>
                  <div className="text-xs font-bold text-slate-200">Redis 60s TTL</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
                <Cpu className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Risk Engine</div>
                  <div className="text-xs font-bold text-slate-200">Z-Score Dispersion</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Schema Guard</div>
                  <div className="text-xs font-bold text-slate-200">Pydantic v2</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Key Financial Balance Cards */}
        <MetricCards summary={summary} />

        {/* 2. Statistical Anomaly Alerts */}
        <AnomalyAlert anomalies={anomalies} />

        {/* 3. Middle Split: Expense Distribution + Chart of Accounts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ExpenseBreakdown
              breakdown={summary?.expense_breakdown}
              totalExpenses={summary?.total_expenses}
            />
          </div>

          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">
                Chart of Accounts & Live Reconciled Balances
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {accounts.length} Active Ledgers
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-cyan-400">{acc.code}</span>
                      <span className="text-xs font-medium text-slate-200 truncate max-w-[140px]">{acc.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{acc.account_type}</span>
                  </div>
                  <div className="text-right font-mono text-xs font-bold text-white">
                    ₹{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. General Ledger Transactions Table */}
        <LedgerTable entries={ledgerEntries} accounts={accounts} />
      </main>

      {/* Post Transaction Modal */}
      <PostTransactionModal
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        accounts={accounts}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}