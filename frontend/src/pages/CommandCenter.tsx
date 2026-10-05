import React, { useEffect, useState } from 'react';
import { AggregateStats, SecurityEvent } from '../types';
import { fetchStats, fetchSecurityEvents } from '../services/api';
import { SeverityBadge, ActionBadge } from '../components/StatusBadge';
import { EventDetailModal } from '../components/EventDetailModal';
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Lock,
  Radio,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const CommandCenter: React.FC = () => {
  const [stats, setStats] = useState<AggregateStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [s, evts] = await Promise.all([fetchStats(), fetchSecurityEvents(6)]);
      setStats(s);
      setRecentEvents(evts);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const SEVERITY_COLORS: Record<string, string> = {
    CRITICAL: '#f43f5e',
    HIGH: '#f97316',
    MEDIUM: '#f59e0b',
    LOW: '#3b82f6',
    SAFE: '#10b981'
  };

  const pieData = stats
    ? Object.entries(stats.severityBreakdown).map(([sev, count]) => ({
        name: sev,
        value: count,
        color: SEVERITY_COLORS[sev] || '#64748b'
      }))
    : [];

  const barData = stats?.categoryBreakdown.map((item) => ({
    name: item.category.replace(/_/g, ' ').toLowerCase(),
    count: item.count
  })) || [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-[#0e1628] to-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>REAL-TIME AI SECURITY GATEWAY</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Security Command Center</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live telemetry for Prompt Injection, Sensitive Data Leakage, and Tool Authorization across all chatbot interactions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PROTECTED: All 3 Defense Layers Active</span>
          </div>
          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Requests */}
        <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase text-slate-400">Total Requests</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-100">{stats?.totalRequests ?? 0}</span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Live
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1">Processed by SentinelAI</span>
        </div>

        {/* Threats Detected */}
        <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase text-slate-400">Threats Detected</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-400">{stats?.threatsDetected ?? 0}</span>
            <AlertTriangle className="w-4 h-4 text-amber-400/80" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1">All threat classes</span>
        </div>

        {/* Requests Blocked */}
        <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase text-slate-400">Requests Blocked</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-rose-400">{stats?.requestsBlocked ?? 0}</span>
            <ShieldAlert className="w-4 h-4 text-rose-400/80" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1">Intercepted at input</span>
        </div>

        {/* Tool Calls Blocked */}
        <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase text-slate-400">Tool Calls Blocked</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-purple-400">{stats?.toolCallsBlocked ?? 0}</span>
            <Cpu className="w-4 h-4 text-purple-400/80" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1">RBAC Action Defense</span>
        </div>

        {/* Sensitive Data Prevented */}
        <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase text-slate-400">Sensitive Data Prevented</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-cyan-400">{stats?.sensitiveDataPrevented ?? 0}</span>
            <Lock className="w-4 h-4 text-cyan-400/80" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1">Output redaction / leak</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Categories Distribution */}
        <div className="lg:col-span-2 bg-[#0b101d] border border-slate-800/80 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Threat Distribution by Attack Type</h3>
              <p className="text-xs text-slate-400">Frequency of categorized AI security events</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Real-time</span>
          </div>

          <div className="h-64 w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={130} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                No threat telemetry recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-slate-200">Severity Breakdown</h3>
            <p className="text-xs text-slate-400">Classification of logged security events</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 font-mono">No severity events</div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 pt-3 border-t border-slate-800/60 text-[11px] font-mono">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400">{item.name}:</span>
                <span className="font-bold text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Security Incidents Table */}
      <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Recent Security Activity Stream</h3>
            <p className="text-xs text-slate-400">Live feed of requests evaluated by SentinelAI middleware</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            Auto-Sync Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Layer</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-3">Decision</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {recentEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 text-slate-300 font-bold">{evt.id}</td>
                  <td className="py-2.5 px-3 text-slate-400">{new Date(evt.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {evt.layer}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{evt.category}</td>
                  <td className="py-2.5 px-3">
                    <SeverityBadge severity={evt.severity} />
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-200">{evt.riskScore}</td>
                  <td className="py-2.5 px-3">
                    <ActionBadge action={evt.decision} />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedEvent(evt)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-950/60 hover:text-cyan-400 text-slate-400 border border-slate-700/60 transition inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};
