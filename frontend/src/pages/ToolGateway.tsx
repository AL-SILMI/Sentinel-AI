import React, { useState } from 'react';
import { UserRole } from '../types';
import { checkToolPermission } from '../services/api';
import { SeverityBadge, ActionBadge } from '../components/StatusBadge';
import {
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Play,
  CheckCircle2,
  XCircle,
  Lock,
  ArrowRight,
  Database,
  Terminal,
  UserCheck
} from 'lucide-react';

interface ToolDefinition {
  name: string;
  description: string;
  requiredRole: UserRole;
  baseRisk: number;
  sampleArgs: Record<string, any>;
}

export const ToolGateway: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>('CUSTOMER');
  const [testingTool, setTestingTool] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);

  const tools: ToolDefinition[] = [
    {
      name: 'get_customer_profile',
      description: 'Fetches standard customer account information (name, tier, order count).',
      requiredRole: 'CUSTOMER',
      baseRisk: 15,
      sampleArgs: { customerId: 'CUST-9921' }
    },
    {
      name: 'get_order_status',
      description: 'Retrieves current delivery tracking and shipping state for orders.',
      requiredRole: 'CUSTOMER',
      baseRisk: 10,
      sampleArgs: { orderId: 'ORD-10231' }
    },
    {
      name: 'issue_refund',
      description: 'Authorizes financial refund and initiates bank reversal transactions.',
      requiredRole: 'SUPPORT_AGENT',
      baseRisk: 75,
      sampleArgs: { orderId: 'ORD-10231', amount: '$149.99' }
    },
    {
      name: 'update_customer_email',
      description: 'Modifies login credentials and primary account email address.',
      requiredRole: 'ADMIN',
      baseRisk: 65,
      sampleArgs: { customerId: 'CUST-9921', newEmail: 'alex.updated@corp.com' }
    },
    {
      name: 'export_customer_data',
      description: 'Generates a bulk database dump containing sensitive customer PII and records.',
      requiredRole: 'ADMIN',
      baseRisk: 95,
      sampleArgs: { format: 'csv', fullDump: true }
    }
  ];

  const handleSimulateTool = async (tool: ToolDefinition) => {
    setTestingTool(tool.name);
    setTestResult(null);

    try {
      const res = await checkToolPermission(tool.name, activeRole, tool.sampleArgs);
      setTestResult({
        tool,
        ...res
      });
    } catch (err) {
      console.error('Failed to evaluate tool:', err);
    } finally {
      setTestingTool(null);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900/90 via-[#0e1628] to-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs mb-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>ACTION DEFENSE LAYER</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Tool & API Security Gateway</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            SentinelAI enforces fine-grained Role-Based Access Control (RBAC) on autonomous AI agent function calls, preventing unauthorized tool execution before APIs are invoked.
          </p>
        </div>

        {/* Current Demo Role Switcher */}
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-700/80 flex flex-col space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-400">Caller Identity / Role:</span>
          <div className="inline-flex rounded-lg border border-slate-700/60 p-0.5 bg-black/40">
            {(['CUSTOMER', 'SUPPORT_AGENT', 'ADMIN'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                  activeRole === role
                    ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tool Registry Matrix (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
            Protected Tool & Function Registry
          </span>

          <div className="space-y-3">
            {tools.map((tool) => {
              const isSimulating = testingTool === tool.name;
              return (
                <div
                  key={tool.name}
                  className="bg-[#0b101d] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-bold text-slate-100">{tool.name}()</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          Risk: {tool.baseRisk}/100
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{tool.description}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-slate-500 block">Required Role</span>
                      <span className="text-xs font-mono font-bold text-purple-400">{tool.requiredRole}</span>
                    </div>
                  </div>

                  {/* Arguments Preview & Test Action */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      Caller context: <strong className="text-cyan-400">{activeRole}</strong>
                    </span>

                    <button
                      type="button"
                      disabled={isSimulating}
                      onClick={() => handleSimulateTool(tool)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-900/60 hover:text-purple-300 border border-slate-700 text-slate-200 font-mono text-xs font-semibold flex items-center space-x-1.5 transition"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isSimulating ? 'Validating...' : 'Simulate Call'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Defense Decision Panel (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 bg-[#0a0f1d] border border-slate-800 rounded-xl p-5 space-y-5 shadow-2xl">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-mono uppercase text-purple-400 tracking-wider block mb-1">
                Action Defense Gateway Telemetry
              </span>
              <h3 className="text-base font-bold text-white">Permission & Policy Verification</h3>
            </div>

            {testResult ? (
              <div className="space-y-4">
                {/* Decision Box */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    testResult.allowed
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {testResult.allowed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-400" />
                    )}
                    <div>
                      <span className="font-mono text-xs uppercase font-bold block text-slate-300">
                        Action Defense Result
                      </span>
                      <span className="text-lg font-mono font-bold">
                        {testResult.allowed ? 'EXECUTION PERMITTED' : 'EXECUTION INTERCEPTED'}
                      </span>
                    </div>
                  </div>
                  <ActionBadge action={testResult.action} />
                </div>

                {/* Scope Comparison */}
                <div className="grid grid-cols-2 gap-3 bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block">Current Role</span>
                    <span className="font-bold text-cyan-400">{testResult.currentRole}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block">Required Scope</span>
                    <span className="font-bold text-purple-400">{testResult.requiredPermission}</span>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5">
                    SentinelAI Policy Reason
                  </span>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-sans text-slate-300 leading-relaxed">
                    {testResult.reason}
                  </div>
                </div>

                {/* Simulated Payload Output (if allowed) */}
                {testResult.allowed && testResult.simulatedOutput && (
                  <div>
                    <span className="text-[11px] font-mono uppercase text-emerald-400 block mb-1.5 flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Returned Tool Execution Output</span>
                    </span>
                    <pre className="p-3 bg-black/60 rounded-lg border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                      {JSON.stringify(testResult.simulatedOutput, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Interception Pathway */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2">
                    Action Defense Pipeline
                  </span>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-300">LLM Tool Call</span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span className="text-purple-400">Action Defense</span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span className={testResult.allowed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {testResult.allowed ? 'Dispatched' : 'Blocked'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl space-y-2">
                <Database className="w-8 h-8 text-slate-600 mx-auto" />
                <p>Select a caller role above and click "Simulate Call" on any tool to test Action Defense enforcement.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
