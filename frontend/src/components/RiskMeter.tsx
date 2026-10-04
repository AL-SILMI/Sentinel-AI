import React from 'react';

interface RiskMeterProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, label = 'Risk Score', size = 'md' }) => {
  const getColors = () => {
    if (score >= 80) return { bar: 'bg-rose-500', text: 'text-rose-400', glow: 'shadow-[0_0_12px_rgba(244,63,94,0.3)]' };
    if (score >= 60) return { bar: 'bg-orange-500', text: 'text-orange-400', glow: 'shadow-[0_0_10px_rgba(249,115,22,0.3)]' };
    if (score >= 30) return { bar: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-[0_0_8px_rgba(245,158,11,0.2)]' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.2)]' };
  };

  const { bar, text, glow } = getColors();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs uppercase tracking-wider font-mono text-slate-400">{label}</span>
        <span className={`font-mono font-bold ${text} ${size === 'lg' ? 'text-xl' : 'text-sm'}`}>
          {score} <span className="text-slate-500 text-xs font-normal">/ 100</span>
        </span>
      </div>
      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ${bar} ${glow}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
};
