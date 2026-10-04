import React from 'react';
import { SeverityLevel, SecurityAction } from '../types';

interface SeverityBadgeProps {
  severity: SeverityLevel;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const styles: Record<SeverityLevel, string> = {
    SAFE: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
    LOW: 'bg-blue-950/80 text-blue-400 border-blue-800/60',
    MEDIUM: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
    HIGH: 'bg-orange-950/80 text-orange-400 border-orange-800/60',
    CRITICAL: 'bg-rose-950/80 text-rose-400 border-rose-800/60'
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-mono font-semibold rounded border ${styles[severity] || styles.SAFE}`}>
      {severity}
    </span>
  );
};

interface ActionBadgeProps {
  action: SecurityAction | string;
}

export const ActionBadge: React.FC<ActionBadgeProps> = ({ action }) => {
  const act = action.toUpperCase();
  const styles: Record<string, string> = {
    ALLOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    WARN: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    BLOCK: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    SANITIZE: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
  };

  return (
    <span className={`px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider rounded border ${styles[act] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
      {act}
    </span>
  );
};
