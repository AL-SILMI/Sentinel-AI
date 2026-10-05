import React from 'react';
import {
  Network,
  Cpu,
  Lock,
  Terminal,
  ArrowRight,
  History,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const SystemArchitecture: React.FC = () => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900/90 via-[#0e1628] to-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1.5">
            <Network className="w-3.5 h-3.5" />
            <span>ENTERPRISE ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">System Architecture & Threat Defense Flow</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            SentinelAI acts as a transparent, model-agnostic security proxy layer. LLMs are never exposed directly to unfiltered user input or autonomous unrestricted tool execution.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400 text-xs font-mono">
          Model-Agnostic Reverse Proxy
        </div>
      </div>

      {/* Main Visual Flow Diagram */}
      <div className="bg-[#0b101d] border border-slate-800/80 rounded-2xl p-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">Pipeline Flow Diagram</span>
          <h3 className="text-base font-bold text-white">End-to-End Request Inspection Lifecycle</h3>
        </div>

        {/* Diagram Card */}
        <div className="p-6 bg-[#070b14] border border-slate-800 rounded-xl space-y-8">
          {/* Main User -> SentinelAI -> LLM -> Output Flow */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {/* Step 1: User Input */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="w-9 h-9 mx-auto rounded-lg bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center font-bold">
                U
              </div>
              <h4 className="text-xs font-mono font-bold text-slate-200">1. User Request</h4>
              <p className="text-[11px] text-slate-400">Incoming prompt payload</p>
            </div>

            {/* Arrow 1 */}
            <div className="flex flex-col items-center justify-center text-cyan-400">
              <span className="text-[10px] font-mono text-slate-500 mb-1">Intercept</span>
              <ArrowRight className="w-5 h-5" />
            </div>

            {/* Step 2: Input Defense */}
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800 text-center space-y-2 relative shadow-lg shadow-cyan-950/40">
              <div className="w-9 h-9 mx-auto rounded-lg bg-cyan-900/60 border border-cyan-700 text-cyan-300 flex items-center justify-center">
                <Terminal className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-mono font-bold text-cyan-300">2. Input Defense</h4>
              <p className="text-[11px] text-cyan-200/80">Prompt injection & role override scan</p>
              <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Score & Gate
              </span>
            </div>

            {/* Arrow 2 */}
            <div className="flex flex-col items-center justify-center text-emerald-400">
              <span className="text-[10px] font-mono text-slate-500 mb-1">Clean Only</span>
              <ArrowRight className="w-5 h-5" />
            </div>

            {/* Step 3: Sandboxed LLM */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="w-9 h-9 mx-auto rounded-lg bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-mono font-bold text-slate-200">3. Sandboxed LLM</h4>
              <p className="text-[11px] text-slate-400">OpenAI / Claude / Local LLM</p>
            </div>
          </div>

          {/* Parallel Flow: Tool Execution & Output Defense */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
            {/* Tool Gateway Route */}
            <div className="p-5 rounded-xl bg-purple-950/20 border border-purple-900/60 space-y-3">
              <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs font-bold">
                <Cpu className="w-4 h-4" />
                <span>Action Defense (Tool Gateway)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                If the model requests execution of external tools (e.g. <code>issue_refund</code>, <code>export_customer_data</code>), SentinelAI intercepts the invocation and validates caller credentials against RBAC policy before dispatching.
              </p>
              <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 pt-1">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">ALLOW (Authorized)</span>
                <span>or</span>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">BLOCK (Unprivileged)</span>
              </div>
            </div>

            {/* Output Defense Route */}
            <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-900/60 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold">
                <Lock className="w-4 h-4" />
                <span>Output Defense (PII & Secret Redaction)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every token generated by the model passes through regex and entropy detectors. API keys, JWTs, phone numbers, and confidential prompts are replaced inline with <code>[REDACTED BY SENTINELAI]</code>.
              </p>
              <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 pt-1">
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">SANITIZE Inline</span>
                <span>Safe to return to client</span>
              </div>
            </div>
          </div>

          {/* Centralized Audit Stream */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-200">Centralized Audit Trail & Telemetry</h4>
                <p className="text-[11px] text-slate-400">All layer decisions feed asynchronously into SQLite audit tables and live SOC dashboards.</p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 shrink-0">
              <CheckCircle2 className="w-4 h-4" /> Real-Time Telemetry
            </span>
          </div>
        </div>
      </div>

      {/* Layer Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold">
            <Terminal className="w-4 h-4" />
            <span>Layer 1: Input Defense</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Multi-stage heuristic and pattern classification that prevents direct jailbreaks, role overrides, instruction resets, and payload obfuscation before touching model context windows.
          </p>
        </div>

        <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold">
            <Lock className="w-4 h-4" />
            <span>Layer 2: Output Defense</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Pre-flight response filter neutralizing accidental or prompted leakage of credentials, API keys, passwords, and sensitive PII (emails, phone numbers, credit card tokens).
          </p>
        </div>

        <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs font-bold">
            <Cpu className="w-4 h-4" />
            <span>Layer 3: Action Defense</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A zero-trust execution sandbox ensuring agentic tools and function calls are authorized against the authenticated user's role before any side-effect or data retrieval occurs.
          </p>
        </div>
      </div>
    </div>
  );
};
