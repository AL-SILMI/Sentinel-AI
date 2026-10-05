import React, { useState, useEffect } from 'react';
import { DetectionPolicy } from '../types';
import { fetchPolicies, updatePolicies } from '../services/api';
import {
  Sliders,
  Save,
  CheckCircle2
} from 'lucide-react';

export const DetectionPolicies: React.FC = () => {
  const [policy, setPolicy] = useState<DetectionPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchPolicies()
      .then((data) => setPolicy(data))
      .catch((err) => console.error('Failed to load policies:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key: keyof DetectionPolicy) => {
    if (!policy) return;
    setPolicy({
      ...policy,
      [key]: !policy[key]
    });
    setSaveSuccess(false);
  };

  const handleThresholdChange = (key: keyof DetectionPolicy, value: number) => {
    if (!policy) return;
    setPolicy({
      ...policy,
      [key]: value
    });
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!policy) return;
    try {
      setSaving(true);
      await updatePolicies(policy);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save policy:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !policy) {
    return (
      <div className="p-8 text-center text-xs font-mono text-cyan-400">
        Loading SentinelAI Detection Policies...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900/90 via-[#0e1628] to-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>POLICY CONFIGURATION</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Detection Rules & Thresholds</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Fine-tune active inspection engines and risk scoring boundaries. Changes take effect immediately in runtime middleware.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-mono text-xs font-bold flex items-center space-x-2 shadow-lg shadow-cyan-950/60 disabled:opacity-50 transition"
        >
          {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Applying...' : saveSuccess ? 'Policies Saved!' : 'Apply Policy Changes'}</span>
        </button>
      </div>

      {/* Rules Toggle Matrix */}
      <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-slate-200">Active Detection Modules</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Prompt Injection */}
          <div className="flex items-center justify-between p-4 bg-slate-900/70 border border-slate-800 rounded-lg">
            <div>
              <span className="text-xs font-mono font-bold text-slate-200 block">Prompt Injection Guard</span>
              <span className="text-[11px] text-slate-400">Direct instruction override & jailbreak filters</span>
            </div>
            <input
              type="checkbox"
              checked={policy.promptInjection}
              onChange={() => handleToggle('promptInjection')}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Role Override */}
          <div className="flex items-center justify-between p-4 bg-slate-900/70 border border-slate-800 rounded-lg">
            <div>
              <span className="text-xs font-mono font-bold text-slate-200 block">Role Override Interceptor</span>
              <span className="text-[11px] text-slate-400">Admin/system impersonation detection</span>
            </div>
            <input
              type="checkbox"
              checked={policy.roleOverride}
              onChange={() => handleToggle('roleOverride')}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Data Exfiltration */}
          <div className="flex items-center justify-between p-4 bg-slate-900/70 border border-slate-800 rounded-lg">
            <div>
              <span className="text-xs font-mono font-bold text-slate-200 block">Data Exfiltration Guard</span>
              <span className="text-[11px] text-slate-400">Detects extraction attempts for credentials & databases</span>
            </div>
            <input
              type="checkbox"
              checked={policy.dataExfiltration}
              onChange={() => handleToggle('dataExfiltration')}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Secret & API Key Detection */}
          <div className="flex items-center justify-between p-4 bg-slate-900/70 border border-slate-800 rounded-lg">
            <div>
              <span className="text-xs font-mono font-bold text-slate-200 block">Secret & API Key Redactor</span>
              <span className="text-[11px] text-slate-400">OpenAI, AWS, JWT, passwords in output</span>
            </div>
            <input
              type="checkbox"
              checked={policy.secretDetection}
              onChange={() => handleToggle('secretDetection')}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* PII Detection */}
          <div className="flex items-center justify-between p-4 bg-slate-900/70 border border-slate-800 rounded-lg">
            <div>
              <span className="text-xs font-mono font-bold text-slate-200 block">PII Redaction Engine</span>
              <span className="text-[11px] text-slate-400">Emails, phone numbers, credit card sanitization</span>
            </div>
            <input
              type="checkbox"
              checked={policy.piiDetection}
              onChange={() => handleToggle('piiDetection')}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Tool Enforcement */}
          <div className="flex items-center justify-between p-4 bg-slate-900/70 border border-slate-800 rounded-lg">
            <div>
              <span className="text-xs font-mono font-bold text-slate-200 block">Tool RBAC Enforcement</span>
              <span className="text-[11px] text-slate-400">Validate AI agent tool permissions before execution</span>
            </div>
            <input
              type="checkbox"
              checked={policy.toolEnforcement}
              onChange={() => handleToggle('toolEnforcement')}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Obfuscation */}
          <div className="flex items-center justify-between p-4 bg-slate-900/70 border border-slate-800 rounded-lg md:col-span-2">
            <div>
              <span className="text-xs font-mono font-bold text-slate-200 block">Obfuscation & Evasion Defense</span>
              <span className="text-[11px] text-slate-400">Base64 decoding, character padding, leetspeak normalization</span>
            </div>
            <input
              type="checkbox"
              checked={policy.obfuscationDetection}
              onChange={() => handleToggle('obfuscationDetection')}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Threshold Calibration Sliders */}
      <div className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-6 space-y-6">
        <h3 className="text-sm font-semibold text-slate-200">Risk Severity Thresholds</h3>

        <div className="space-y-6">
          {/* Low Threshold */}
          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
              <span className="text-blue-400 font-bold">LOW SEVERITY BOUNDARY</span>
              <span className="text-slate-200 font-bold">{policy.lowThreshold} / 100</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={policy.lowThreshold}
              onChange={(e) => handleThresholdChange('lowThreshold', Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Medium Threshold */}
          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
              <span className="text-amber-400 font-bold">MEDIUM SEVERITY (WARN) BOUNDARY</span>
              <span className="text-slate-200 font-bold">{policy.mediumThreshold} / 100</span>
            </div>
            <input
              type="range"
              min={40}
              max={75}
              value={policy.mediumThreshold}
              onChange={(e) => handleThresholdChange('mediumThreshold', Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* High Threshold */}
          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
              <span className="text-orange-400 font-bold">HIGH SEVERITY (BLOCK) BOUNDARY</span>
              <span className="text-slate-200 font-bold">{policy.highThreshold} / 100</span>
            </div>
            <input
              type="range"
              min={60}
              max={85}
              value={policy.highThreshold}
              onChange={(e) => handleThresholdChange('highThreshold', Number(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>

          {/* Critical Threshold */}
          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
              <span className="text-rose-400 font-bold">CRITICAL SEVERITY BOUNDARY</span>
              <span className="text-slate-200 font-bold">{policy.criticalThreshold} / 100</span>
            </div>
            <input
              type="range"
              min={75}
              max={95}
              value={policy.criticalThreshold}
              onChange={(e) => handleThresholdChange('criticalThreshold', Number(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
