import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

const AnomalyAlert = ({ anomalies = [] }) => {
  if (!anomalies || anomalies.length === 0) return null;

  return (
    <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 md:p-5 shadow-xl">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-200">
            Statistical Risk Intelligence: Outlier Disbursement Detected
          </h3>
          <p className="text-[11px] text-amber-400/80">
            Real-time Z-score dispersion engine flagged {anomalies.length} transaction(s) deviating from historical expense distributions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {anomalies.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-950/70 border border-amber-500/20 rounded-xl p-3.5 flex flex-col justify-between space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-bold text-slate-200">
                  {item.reference_id}
                </span>
                <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
              </div>
              <span className="text-sm font-black text-rose-400 font-mono flex-shrink-0">
                £{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-400">{item.account_name}</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold font-mono">
                Z-Score: +{item.z_score}σ
              </span>
            </div>
            
            <p className="text-[10px] text-slate-500 italic">
              {item.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnomalyAlert;