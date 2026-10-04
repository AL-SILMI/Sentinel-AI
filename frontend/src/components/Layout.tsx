import React, { useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  MessageSquare,
  Zap,
  Cpu,
  History,
  Sliders,
  Network,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { resetDemo } from '../services/api';

interface LayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  children: React.ReactNode;
  onRefresh?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ currentTab, setCurrentTab, children, onRefresh }) => {
  const [resetting, setResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    try {
      setResetting(true);
      await resetDemo();
      setShowConfirm(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to reset demo:', err);
    } finally {
      setResetting(false);
    }
  };

  const navItems = [
    { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
    { id: 'protected-chat', label: 'Protected Chat', icon: MessageSquare },
    { id: 'attack-simulator', label: 'Attack Simulator', icon: Zap },
    { id: 'tool-gateway', label: 'Tool Gateway', icon: Cpu },
    { id: 'security-events', label: 'Security Events', icon: History },
    { id: 'detection-policies', label: 'Detection Policies', icon: Sliders },
    { id: 'system-architecture', label: 'System Architecture', icon: Network },
  ];

  return (
    <div className="flex h-screen bg-[#070b14] text-slate-100 overflow-hidden font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col justify-between select-none">
        <div>
          {/* Logo & Product Title */}
          <div className="p-5 border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white shadow-lg shadow-cyan-900/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  SentinelAI
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">2.0</span>
                </h1>
                <p className="text-[11px] text-slate-400 font-mono tracking-tight">AI Security Gateway</p>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-800/60 pt-2">
              <span>Team MSEC</span>
              <span className="text-slate-400">CRYPTAURA 2.0</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Status Indicators & Reset Button */}
        <div className="p-4 border-t border-slate-800/80 bg-[#080d19]/80 space-y-4">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span className="uppercase tracking-wider">System Status</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="space-y-1.5 text-[10px] font-mono text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>SentinelAI Middleware Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                <span>Detection Engine Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>Action & Policy Engine Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <span>Audit Trail Logging Active</span>
              </div>
            </div>
          </div>

          {/* Reset Demo button */}
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-mono font-medium bg-slate-800/70 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-800/50 border border-slate-700/60 text-slate-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#070b14]">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-800/80 bg-[#0a0f1d]/70 backdrop-blur-md px-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              PROTECTED ENVIRONMENT
            </span>
            <span className="text-xs text-slate-500 font-mono hidden md:inline">
              Real-Time Security Gateway Layer Active
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-400 block">Defense Mode</span>
              <span className="text-xs font-mono font-semibold text-cyan-400">Model-Agnostic Inline</span>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Reset Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-slate-100">Reset Demo Environment?</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              This will clear all runtime security logs and restore initial synthetic demo telemetry data.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-3 py-1.5 text-xs font-mono rounded-lg bg-rose-600 text-white hover:bg-rose-500 font-semibold"
              >
                {resetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
