'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Network,
  Plug,
  Server,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  Plus,
  RefreshCw,
  Search,
  Code2,
  ShieldCheck,
  Activity,
  Terminal
} from 'lucide-react';
import { integrationService } from '@/services/integrationService';
import { Connector, IntegrationLog } from '@/types';
import { cn, formatDate } from '@/lib/utils';

export default function IntegrationHubPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Test Connection Modal state
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testUrl, setTestUrl] = useState('https://crm.customer-domain.com/api/v2');
  const [testAuthType, setTestAuthType] = useState('API Key');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string; details?: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      const [connData, logData] = await Promise.all([
        integrationService.getConnectors(),
        integrationService.getLogs(),
      ]);
      setConnectors(connData);
      setLogs(logData);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleRunTest = async () => {
    setTesting(true);
    setTestResult(null);

    const res = await integrationService.testConnection({
      name: 'Custom Endpoint Ping',
      baseUrl: testUrl,
      authType: testAuthType,
    });

    setTestResult(res);
    setTesting(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-[#173C2D] via-[#1F4A39] to-[#3F7659] text-white rounded-2xl shadow-md space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#DDEEDF]">
          <Network size={14} /> Core Platform Connector Hub
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Integration Hub</h1>
        <p className="text-xs md:text-sm text-[#DDEEDF] max-w-2xl leading-relaxed">
          Connect LaunchPad OS with the enterprise backends your business already uses. Preserve existing systems as the source of truth without rewrite.
        </p>
      </div>

      {/* Interactive Integration Hub Architecture Visualizer */}
      <div className="p-6 bg-white border border-[#DDEEDF] rounded-2xl shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-4">
          <div>
            <span className="text-[10px] font-bold text-[#3F7659] uppercase tracking-wider">
              Integration Architecture Topology
            </span>
            <h2 className="text-base font-bold text-[#173C2D] mt-0.5">
              Live Source-of-Truth Connector Mapping
            </h2>
          </div>
          <button
            onClick={() => setTestModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Zap size={14} /> Test Custom Endpoint
          </button>
        </div>

        {/* Visual Topology Diagram */}
        <div className="p-6 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Node 1: LaunchPad UI */}
          <div className="p-4 bg-white border-2 border-[#3F7659] rounded-xl shadow-sm space-y-1 w-full md:w-52">
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#DDEEDF] text-[#173C2D] rounded">
              LAUNCHPAD UI
            </span>
            <h4 className="text-xs font-bold text-[#173C2D]">Unified Frontend OS</h4>
            <p className="text-[10px] text-[#5A7165]">React / Next.js Canvas</p>
          </div>

          <div className="text-[#3F7659] font-bold text-xs flex items-center gap-1">
            <span>⇄ Hub Bus ⇄</span>
          </div>

          {/* Node 2: Integration Hub */}
          <div className="p-4 bg-[#173C2D] text-white rounded-xl shadow-sm space-y-1 w-full md:w-56 text-center">
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#DDEEDF] text-[#173C2D] rounded">
              INTEGRATION HUB
            </span>
            <h4 className="text-xs font-bold">Connector Pipeline</h4>
            <p className="text-[10px] text-[#DDEEDF]">Transformation & Auth</p>
          </div>

          <div className="text-[#3F7659] font-bold text-xs flex items-center gap-1">
            <span>⇄ REST / Webhooks ⇄</span>
          </div>

          {/* Node 3: Existing Customer Backends */}
          <div className="space-y-2 w-full md:w-64">
            <div className="p-2.5 bg-white border border-[#E2ECE5] rounded-lg text-xs font-bold text-[#173C2D] flex items-center justify-between">
              <span>Existing PHP CRM</span>
              <span className="px-1.5 py-0.5 text-[9px] bg-purple-100 text-purple-800 rounded font-mono">PHP</span>
            </div>
            <div className="p-2.5 bg-white border border-[#E2ECE5] rounded-lg text-xs font-bold text-[#173C2D] flex items-center justify-between">
              <span>Django HRMS API</span>
              <span className="px-1.5 py-0.5 text-[9px] bg-blue-100 text-blue-800 rounded font-mono">Python</span>
            </div>
            <div className="p-2.5 bg-white border border-[#E2ECE5] rounded-lg text-xs font-bold text-[#173C2D] flex items-center justify-between">
              <span>Legacy Building VMS</span>
              <span className="px-1.5 py-0.5 text-[9px] bg-amber-100 text-amber-800 rounded font-mono">Java</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Connectors Registry List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#173C2D]">Active Connector Registry</h2>
          <Link
            href="/integrations/connectors"
            className="text-xs font-bold text-[#3F7659] hover:underline"
          >
            Manage All Connectors ({connectors.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {connectors.map((conn) => (
            <div
              key={conn.id}
              className="p-5 bg-white border border-[#E2ECE5] hover:border-[#3F7659] rounded-xl shadow-xs transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#F3F9F5] text-[#3F7659] rounded border border-[#DDEEDF]">
                    {conn.category}
                  </span>
                  <h3 className="text-sm font-bold text-[#173C2D] mt-1">{conn.name}</h3>
                </div>
                <span
                  className={cn(
                    'px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1',
                    conn.status === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  )}
                >
                  {conn.status === 'connected' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                  {conn.status}
                </span>
              </div>

              <div className="p-3 bg-[#F3F9F5] rounded-lg border border-[#E2ECE5] text-xs space-y-1">
                <div className="flex justify-between text-[#173C2D] font-semibold">
                  <span>Target System:</span>
                  <span>{conn.targetSystem}</span>
                </div>
                <div className="flex justify-between text-[#5A7165]">
                  <span>Tech Stack:</span>
                  <span className="font-mono font-bold text-[#3F7659]">{conn.targetTech}</span>
                </div>
                <div className="flex justify-between text-[#5A7165]">
                  <span>Authentication:</span>
                  <span>{conn.authType}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-[#5A7165]">
                <span>Latency: <strong className="text-[#173C2D]">{conn.latencyMs}ms</strong></span>
                <span>Last Sync: {conn.lastSync}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Request Logs */}
      <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-4">
          <h3 className="text-sm font-bold text-[#173C2D] flex items-center gap-2">
            <Terminal size={16} className="text-[#3F7659]" /> Connector Telemetry & Traffic Logs
          </h3>
          <span className="text-xs text-[#5A7165]">Showing latest 100 API requests</span>
        </div>

        <div className="divide-y divide-[#F3F9F5]">
          {logs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'px-2 py-0.5 text-[10px] font-mono font-bold rounded',
                    log.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  )}
                >
                  {log.method}
                </span>
                <div>
                  <div className="font-bold text-[#173C2D] flex items-center gap-2">
                    {log.connectorName} <span className="font-mono text-[#3F7659] font-normal">{log.endpoint}</span>
                  </div>
                  <div className="text-[11px] text-[#5A7165]">
                    Payload: <code className="font-mono bg-[#F3F9F5] px-1 py-0.5 rounded text-[10px]">{log.requestPayload}</code>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right shrink-0">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {log.statusCode} OK ({log.durationMs}ms)
                </span>
                <span className="text-[11px] font-mono text-[#5A7165]">{formatDate(log.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Connection Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2ECE5] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
              <h3 className="text-base font-bold text-[#173C2D] flex items-center gap-2">
                <Zap size={18} className="text-[#3F7659]" /> Test Target Endpoint Connection
              </h3>
              <button onClick={() => setTestModalOpen(false)} className="text-xs font-bold text-[#5A7165]">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#173C2D]">Endpoint Base URL</label>
                <input
                  type="text"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg mt-1 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#173C2D]">Authentication Scheme</label>
                  <select
                    value={testAuthType}
                    onChange={(e) => setTestAuthType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg mt-1"
                  >
                    <option value="API Key">API Key</option>
                    <option value="Bearer Token">Bearer Token</option>
                    <option value="OAuth 2.0">OAuth 2.0</option>
                    <option value="JWT">JWT Token</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#173C2D]">Mock Secret Key</label>
                  <input
                    type="password"
                    value="sk_test_99418292010"
                    readOnly
                    className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg mt-1 font-mono"
                  />
                </div>
              </div>

              {testResult && (
                <div className="p-4 rounded-xl bg-[#DDEEDF] border border-[#C5E2C8] text-[#173C2D] space-y-1 animate-in fade-in">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 size={16} /> {testResult.message} ({testResult.latencyMs}ms latency)
                  </div>
                  <div className="text-[11px] leading-relaxed">{testResult.details}</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2ECE5]">
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#5A7165] hover:bg-[#F3F9F5] rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleRunTest}
                disabled={testing}
                className="px-5 py-2 text-xs font-bold text-white bg-[#3F7659] hover:bg-[#173C2D] rounded-lg shadow-xs flex items-center gap-2"
              >
                {testing ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                {testing ? 'Pinging Endpoint...' : 'Run Ping Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
