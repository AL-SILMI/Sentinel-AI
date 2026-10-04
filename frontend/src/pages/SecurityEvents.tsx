import React, { useState, useEffect } from 'react';
import { SecurityEvent } from '../types';
import { fetchSecurityEvents } from '../services/api';
import { SeverityBadge, ActionBadge } from '../components/StatusBadge';
import { EventDetailModal } from '../components/EventDetailModal';
import {
  History,
  Filter,
  Search,
  ExternalLink,
  RefreshCw,
  Download,
  ShieldAlert
} from 'lucide-react';

export const SecurityEvents: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [layerFilter, setLayerFilter] = useState<string>('ALL');
  const [decisionFilter, setDecisionFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchSecurityEvents(100);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = events.filter((evt) => {
    if (layerFilter !== 'ALL' && evt.layer !== layerFilter) return false;
    if (decisionFilter !== 'ALL' && evt.decision !== decisionFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        evt.id.toLowerCase().includes(q) ||
        evt.category.toLowerCase().includes(q) ||
        evt.inputSummary.toLowerCase().includes(q) ||
        evt.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-[#0e1628] to-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1.5">
            <History className="w-3.5 h-3.5" />
            <span>AUDIT TRAIL & COMPLIANCE LOGS</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Security Events & Audit Log</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Immutable log of all SentinelAI inspection decisions across Input Defense, Output Defense, and Action Defense.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadEvents}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center space-x-2 border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Logs</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, category, or keyword..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Layer Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-mono text-slate-400">Layer:</span>
            <select
              value={layerFilter}
              onChange={(e) => setLayerFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Layers</option>
              <option value="INPUT">Input Defense</option>
              <option value="OUTPUT">Output Defense</option>
              <option value="ACTION">Action Defense</option>
            </select>
          </div>

          {/* Decision Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-mono text-slate-400">Decision:</span>
            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Decisions</option>
              <option value="BLOCK">BLOCK</option>
              <option value="WARN">WARN</option>
              <option value="ALLOW">ALLOW</option>
              <option value="SANITIZE">SANITIZE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-[#080c16] text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Layer</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Caller Role</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 text-slate-300 font-bold">{evt.id}</td>
                    <td className="py-3 px-4 text-slate-400">{new Date(evt.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {evt.layer}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-semibold">{evt.category}</td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={evt.severity} />
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200">{evt.riskScore}</td>
                    <td className="py-3 px-4">
                      <ActionBadge action={evt.decision} />
                    </td>
                    <td className="py-3 px-4 text-slate-400">{evt.userRole}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-950/60 hover:text-cyan-400 text-slate-300 border border-slate-700/60 transition inline-flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-mono">
                    No security events matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};
