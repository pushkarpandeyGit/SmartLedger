import React from 'react';
import { BookOpen, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const LedgerTable = ({ entries = [], accounts = [] }) => {
  const getAccountName = (id) => {
    const acc = accounts.find((a) => a.id === id);
    return acc ? `${acc.code} - ${acc.name}` : `Account #${id}`;
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          General Ledger Journal History
        </h3>
        <span className="text-xs text-slate-500 font-mono">
          Strict Debit == Credit Invariant
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Reference</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3">Account</th>
              <th className="py-2.5 px-3 text-right">Debit (£)</th>
              <th className="py-2.5 px-3 text-right">Credit (£)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No journal postings recorded yet.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <React.Fragment key={entry.id}>
                  {entry.legs.map((leg, legIdx) => (
                    <tr
                      key={leg.id}
                      className={legIdx === 0 ? 'bg-slate-950/20' : 'hover:bg-slate-800/30'}
                    >
                      {/* Only show ref & description on first leg */}
                      {legIdx === 0 ? (
                        <>
                          <td
                            rowSpan={entry.legs.length}
                            className="py-2.5 px-3 font-mono font-bold text-cyan-400 align-top border-r border-slate-800/40"
                          >
                            {entry.reference_id}
                          </td>
                          <td
                            rowSpan={entry.legs.length}
                            className="py-2.5 px-3 text-slate-200 font-medium align-top border-r border-slate-800/40 max-w-[200px] truncate"
                          >
                            {entry.description}
                          </td>
                        </>
                      ) : null}

                      {/* Leg Account */}
                      <td className="py-2 px-3 text-slate-300 font-medium">
                        {getAccountName(leg.account_id)}
                      </td>

                      {/* Debit Column */}
                      <td className="py-2 px-3 text-right font-mono">
                        {leg.entry_type === 'DEBIT' ? (
                          <span className="text-emerald-400 font-semibold inline-flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                            £{leg.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Credit Column */}
                      <td className="py-2 px-3 text-right font-mono">
                        {leg.entry_type === 'CREDIT' ? (
                          <span className="text-blue-400 font-semibold inline-flex items-center gap-0.5">
                            <ArrowDownLeft className="w-3 h-3 text-blue-500" />
                            £{leg.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LedgerTable;