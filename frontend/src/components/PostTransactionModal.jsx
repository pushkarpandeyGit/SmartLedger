import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Scale, Plus } from 'lucide-react';

const PostTransactionModal = ({ isOpen, onClose, accounts = [], onSuccess }) => {
  const [description, setDescription] = useState('');
  const [debitAccountId, setDebitAccountId] = useState('');
  const [debitAmount, setDebitAmount] = useState('');
  const [creditAccountId, setCreditAccountId] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const dAmt = parseFloat(debitAmount) || 0;
  const cAmt = parseFloat(creditAmount) || 0;
  const isBalanced = dAmt > 0 && cAmt > 0 && Math.abs(dAmt - cAmt) < 0.001;
  const imbalance = Math.abs(dAmt - cAmt);

  // Quick transaction templates
  const applyTemplate = (type) => {
    if (type === 'saas_revenue') {
      setDescription('Enterprise Banking API Monthly License Fee');
      const cash = accounts.find((a) => a.code === '1010');
      const rev = accounts.find((a) => a.code === '4010');
      if (cash) setDebitAccountId(cash.id);
      if (rev) setCreditAccountId(rev.id);
      setDebitAmount('75000');
      setCreditAmount('75000');
    } else if (type === 'cloud_expense') {
      setDescription('AWS Kubernetes Cluster Monthly Compute');
      const cloud = accounts.find((a) => a.code === '5010');
      const cash = accounts.find((a) => a.code === '1010');
      if (cloud) setDebitAccountId(cloud.id);
      if (cash) setCreditAccountId(cash.id);
      setDebitAmount('25000');
      setCreditAmount('25000');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isBalanced) {
      setError('Cannot post unbalanced transaction. Total Debits must equal Total Credits.');
      return;
    }

    if (debitAccountId === creditAccountId) {
      setError('Debit and Credit cannot be applied to the identical account.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        description,
        legs: [
          { account_id: parseInt(debitAccountId), amount: dAmt, entry_type: 'DEBIT' },
          { account_id: parseInt(creditAccountId), amount: cAmt, entry_type: 'CREDIT' }
        ]
      };

      const res = await fetch('/api/v1/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Posting transaction failed');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to post transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">Post Double-Entry Transaction</h3>
            <p className="text-xs text-slate-400">Atomic journal entry with matching debit & credit legs</p>
          </div>
        </div>

        {/* Quick Templates */}
        <div className="flex items-center gap-2 mb-4 text-[11px]">
          <span className="text-slate-400 font-medium">Templates:</span>
          <button
            type="button"
            onClick={() => applyTemplate('saas_revenue')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition cursor-pointer"
          >
            + Client Revenue (₹3.5k)
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('cloud_expense')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 transition cursor-pointer"
          >
            + Cloud Hosting (₹25000)
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Transaction Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Q3 Commercial Software Retainer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Debit Leg */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-emerald-500/20 space-y-2">
              <span className="block text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                1. Debit Leg (Increases Assets/Expenses)
              </span>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Target Account</label>
                <select
                  required
                  value={debitAccountId}
                  onChange={(e) => setDebitAccountId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:border-emerald-500"
                >
                  <option value="">Select Account...</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.name} ({a.account_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Debit Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={debitAmount}
                  onChange={(e) => setDebitAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-emerald-300 font-mono font-bold focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Credit Leg */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-blue-500/20 space-y-2">
              <span className="block text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                2. Credit Leg (Increases Liab/Equity/Rev)
              </span>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Target Account</label>
                <select
                  required
                  value={creditAccountId}
                  onChange={(e) => setCreditAccountId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:border-blue-500"
                >
                  <option value="">Select Account...</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.name} ({a.account_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Credit Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-blue-300 font-mono font-bold focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Real-Time Balance Validation Bar */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400" />
              )}
              <div>
                <div className={`text-xs font-bold ${isBalanced ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {isBalanced ? 'Double-Entry Invariant Satisfied' : 'Ledger Out of Balance'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Debit: ₹{dAmt.toFixed(2)} | Credit: ₹{cAmt.toFixed(2)}
                </div>
              </div>
            </div>

            {!isBalanced && (
              <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                Imbalance: ₹{imbalance.toFixed(2)}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!isBalanced || submitting}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold rounded-lg text-sm transition shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            {submitting ? 'Committing Atomic Postings...' : 'Commit Journal Posting to Ledger'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostTransactionModal;