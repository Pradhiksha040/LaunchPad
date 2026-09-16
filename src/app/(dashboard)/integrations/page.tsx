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
  Terminal,
  X,
  Settings,
  Trash2,
  Power
} from 'lucide-react';
import { integrationService } from '@/services/integrationService';
import { Connector, IntegrationLog } from '@/types';
import { cn, formatDate } from '@/lib/utils';

export default function IntegrationHubPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Integration Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [integName, setIntegName] = useState('Prajai CRM Connector');
  const [integUrl, setIntegUrl] = useState('https://crm.customer-domain.com/api/v2');
  const [integAuthType, setIntegAuthType] = useState('API Key');
  const [integSecret, setIntegSecret] = useState('sk_live_99418292010');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string; details?: string } | null>(null);

  // Logs modal state
  const [selectedLogsModalIntegId, setSelectedLogsModalIntegId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [connData, logData] = await Promise.all([
      integrationService.getConnectors(),
      integrationService.getLogs(),
    ]);
    setConnectors(connData);
    setLogs(logData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTestInModal = async () => {
    setTesting(true);
    setTestResult(null);

    const res = await integrationService.testConnection({
      name: integName,
      baseUrl: integUrl,
      authType: integAuthType,
      apiKey: integAuthType === 'API Key' ? integSecret : undefined,
      bearerToken: integAuthType === 'Bearer Token' ? integSecret : undefined,
      jwtToken: integAuthType === 'JWT' ? integSecret : undefined,
    });

    setTestResult(res);
    setTesting(false);
  };

  const handleSaveIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    await integrationService.createConnector({
      name: integName,
      baseUrl: integUrl,
      authType: integAuthType,
      apiKey: integAuthType === 'API Key' ? integSecret : undefined,
      bearerToken: integAuthType === 'Bearer Token' ? integSecret : undefined,
      jwtToken: integAuthType === 'JWT' ? integSecret : undefined,
      category: 'CRM',
      targetSystem: 'External System API',
      targetTech: 'PHP',
    });

    setAddModalOpen(false);
    setTestResult(null);
    await loadData();
  };

  const handleTestExisting = async (connId: string) => {
    const res = await integrationService.testConnection({
      id: connId,
      baseUrl: integUrl,
      authType: integAuthType,
    });
    alert(`${res.message}\n${res.details}`);
    await loadData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-[#173C2D] via-[#1F4A39] to-[#3F7659] text-white rounded-2xl shadow-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#DDEEDF]">
              <Network size={14} /> Core Platform Integration Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Integration Hub</h1>
            <p className="text-xs md:text-sm text-[#DDEEDF] max-w-2xl leading-relaxed">
              Connect LaunchPad OS with the enterprise backends your business already uses (PHP CRM, Python HRMS). Preserve existing systems as the source of truth without rewrite.
            </p>
          </div>

          <button
            onClick={() => {
              setTestResult(null);
              setAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-white text-[#173C2D] hover:bg-[#DDEEDF] text-xs font-extrabold rounded-xl shadow-md transition-all shrink-0 w-fit"
          >
            <Plus size={16} /> Add Integration
          </button>
        </div>
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
            onClick={() => {
              setTestResult(null);
              setAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Zap size={14} /> Test Generic REST Connector
          </button>
        </div>

        {/* Visual Topology Diagram */}
        <div className="p-6 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Node 1: LaunchPad UI */}
          <div className="p-4 bg-white border-2 border-[#3F7659] rounded-xl shadow-sm space-y-1 w-full md:w-52">
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#DDEEDF] text-[#173C2D] rounded">
              LAUNCHPAD FRONTEND
            </span>
            <h4 className="text-xs font-bold text-[#173C2D]">Unified Application OS</h4>
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
            <h4 className="text-xs font-bold">Generic REST Connector</h4>
            <p className="text-[10px] text-[#DDEEDF]">AES-256 Auth & Transformation</p>
          </div>

          <div className="text-[#3F7659] font-bold text-xs flex items-center gap-1">
            <span>⇄ External REST API ⇄</span>
          </div>

          {/* Node 3: Existing Customer Backends */}
          <div className="space-y-2 w-full md:w-64">
            <div className="p-2.5 bg-white border border-[#E2ECE5] rounded-lg text-xs font-bold text-[#173C2D] flex items-center justify-between">
              <span>Existing PHP CRM API</span>
              <span className="px-1.5 py-0.5 text-[9px] bg-purple-100 text-purple-800 rounded font-mono">PHP</span>
            </div>
            <div className="p-2.5 bg-white border border-[#E2ECE5] rounded-lg text-xs font-bold text-[#173C2D] flex items-center justify-between">
              <span>Existing Python HRMS API</span>
              <span className="px-1.5 py-0.5 text-[9px] bg-blue-100 text-blue-800 rounded font-mono">Python</span>
            </div>
            <div className="p-2.5 bg-white border border-[#E2ECE5] rounded-lg text-xs font-bold text-[#173C2D] flex items-center justify-between">
              <span>Generic REST Endpoint</span>
              <span className="px-1.5 py-0.5 text-[9px] bg-amber-100 text-amber-800 rounded font-mono">REST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Connectors Registry List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#173C2D]">Connected Integrations ({connectors.length})</h2>
          <span className="text-xs font-semibold text-[#5A7165]">
            Application & Tenant Scoped APIs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {connectors.map((conn) => (
            <div
              key={conn.id}
              className="p-5 bg-white border border-[#E2ECE5] hover:border-[#3F7659] rounded-xl shadow-xs transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#F3F9F5] text-[#3F7659] rounded border border-[#DDEEDF]">
                      {conn.category}
                    </span>
                    <h3 className="text-sm font-extrabold text-[#173C2D] mt-1">{conn.name}</h3>
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
                  <div className="flex justify-between text-[#5A7165] truncate">
                    <span>Base URL:</span>
                    <span className="font-mono text-[10px] text-[#173C2D] truncate max-w-[140px]">{conn.baseUrl}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#5A7165]">
                  <span>Latency: <strong className="text-[#173C2D]">{conn.latencyMs}ms</strong></span>
                  <span>Last Sync: {conn.lastSync}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E2ECE5] flex items-center justify-between text-xs">
                <button
                  onClick={() => handleTestExisting(conn.id)}
                  className="px-2.5 py-1.5 bg-[#F3F9F5] hover:bg-[#DDEEDF] text-[#173C2D] font-bold rounded-lg transition-all flex items-center gap-1"
                >
                  <Zap size={12} className="text-[#3F7659]" /> Test
                </button>
                <button
                  onClick={() => setSelectedLogsModalIntegId(conn.id)}
                  className="px-2.5 py-1.5 hover:bg-[#F3F9F5] text-[#5A7165] font-semibold rounded-lg transition-all flex items-center gap-1"
                >
                  <Terminal size={12} /> View Logs
                </button>
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
          <span className="text-xs text-[#5A7165]">Safe sanitized logs (No secrets logged)</span>
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
                  {log.requestPayload && (
                    <div className="text-[11px] text-[#5A7165]">
                      Payload: <code className="font-mono bg-[#F3F9F5] px-1 py-0.5 rounded text-[10px]">{log.requestPayload}</code>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-right shrink-0">
                <span
                  className={cn(
                    'font-semibold px-2 py-0.5 rounded border text-[11px]',
                    log.statusCode < 400
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-amber-800 bg-amber-50 border-amber-200'
                  )}
                >
                  {log.statusCode} {log.statusCode < 400 ? 'OK' : 'Error'} ({log.durationMs}ms)
                </span>
                <span className="text-[11px] font-mono text-[#5A7165]">{formatDate(log.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Integration / Test Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-[#E2ECE5] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
              <h3 className="text-base font-bold text-[#173C2D] flex items-center gap-2">
                <Plus size={18} className="text-[#3F7659]" /> Add Integration — Generic REST Connector
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="text-xs font-bold text-[#5A7165]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveIntegration} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#173C2D]">Integration Name</label>
                <input
                  type="text"
                  required
                  value={integName}
                  onChange={(e) => setIntegName(e.target.value)}
                  placeholder="e.g. Existing PHP CRM Integration"
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg mt-1 text-[#173C2D]"
                />
              </div>

              <div>
                <label className="font-bold text-[#173C2D]">Target API Base URL</label>
                <input
                  type="text"
                  required
                  value={integUrl}
                  onChange={(e) => setIntegUrl(e.target.value)}
                  placeholder="https://customer-api.example.com"
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg mt-1 font-mono text-[#173C2D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#173C2D]">Authentication Type</label>
                  <select
                    value={integAuthType}
                    onChange={(e) => setIntegAuthType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg mt-1 text-[#173C2D]"
                  >
                    <option value="API Key">API Key</option>
                    <option value="Bearer Token">Bearer Token</option>
                    <option value="JWT">JWT Token</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#173C2D]">Secret Credential</label>
                  <input
                    type="password"
                    required
                    value={integSecret}
                    onChange={(e) => setIntegSecret(e.target.value)}
                    placeholder="Enter API Key or Token..."
                    className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg mt-1 font-mono text-[#173C2D]"
                  />
                </div>
              </div>

              {/* Test Result Display Banner */}
              {testResult && (
                <div
                  className={cn(
                    'p-4 rounded-xl border text-[#173C2D] space-y-1 animate-in fade-in',
                    testResult.success
                      ? 'bg-[#DDEEDF] border-[#C5E2C8]'
                      : 'bg-amber-50 border-amber-200'
                  )}
                >
                  <div
                    className={cn(
                      'font-bold flex items-center gap-1.5',
                      testResult.success ? 'text-emerald-800' : 'text-amber-800'
                    )}
                  >
                    {testResult.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    {testResult.message} ({testResult.latencyMs}ms latency)
                  </div>
                  <div className="text-[11px] leading-relaxed">{testResult.details}</div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-[#E2ECE5]">
                <button
                  type="button"
                  onClick={handleTestInModal}
                  disabled={testing}
                  className="px-4 py-2 text-xs font-bold text-[#3F7659] bg-[#F3F9F5] hover:bg-[#DDEEDF] rounded-lg flex items-center gap-1.5"
                >
                  {testing ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                  {testing ? 'Testing...' : 'Test Connection'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#5A7165] hover:bg-[#F3F9F5] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#3F7659] hover:bg-[#173C2D] rounded-lg shadow-xs"
                  >
                    Save Integration
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
