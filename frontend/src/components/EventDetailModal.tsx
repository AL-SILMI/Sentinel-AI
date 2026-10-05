import React from 'react';
import { SecurityEvent } from '../types';
import { SeverityBadge, ActionBadge } from './StatusBadge';
import { RiskMeter } from './RiskMeter';
import { X, ShieldAlert, Cpu, Terminal, ArrowRight, AlertOctagon } from 'lucide-react';

interface EventDetailModalProps {
  event: SecurityEvent | null;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0b0f19]">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${event.decision === 'BLOCK' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-slate-200">{event.id}</span>
                <SeverityBadge severity={event.severity} />
                <ActionBadge action={event.decision} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Request: {event.requestId} • {new Date(event.timestamp).toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Risk & Category */}
          <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 block mb-1">Threat Category</span>
              <span className="font-mono text-sm font-semibold text-rose-400">{event.category}</span>
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 block mb-1">Defense Layer</span>
              <span className="font-mono text-sm font-semibold text-cyan-400">{event.layer} DEFENSE</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-800/80">
              <RiskMeter score={event.riskScore} />
            </div>
          </div>

          {/* Explanation */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              <span>Security Reasoning & Explanation</span>
            </h4>
            <div className="p-3.5 bg-slate-900/90 rounded-lg border border-slate-800 text-sm text-slate-300 leading-relaxed font-sans">
              {event.reason}
            </div>
          </div>

          {/* Input Summary */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Intercepted Content Summary</span>
            </h4>
            <pre className="p-3.5 bg-black/60 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap break-all">
              {event.inputSummary}
            </pre>
          </div>

          {/* Detected Signals */}
          {event.signals && event.signals.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Detected Threat Signals</h4>
              <div className="flex flex-wrap gap-2">
                {event.signals.map((sig, idx) => (
                  <span key={idx} className="px-2.5 py-1 text-xs font-mono rounded bg-rose-950/60 text-rose-300 border border-rose-800/60 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    <span>{sig}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Security Pipeline Flow */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Inspection Lifecycle</span>
            </h4>
            <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg border border-slate-800 text-xs font-mono text-slate-400">
              <span className="text-slate-300">User Input</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-cyan-400">Input Classifier</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span className={event.decision === 'BLOCK' ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                {event.decision === 'BLOCK' ? 'Threat Intercepted' : 'Clean / Sanitized'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-purple-400">Audit Trail</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0b0f19] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
