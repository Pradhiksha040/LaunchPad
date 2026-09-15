'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Network,
  Plus,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Clock,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { applicationService } from '@/services/applicationService';
import { integrationService } from '@/services/integrationService';
import { Application, Connector, IntegrationLog } from '@/types';
import { cn, formatDate } from '@/lib/utils';

const CHART_DATA = [
  { time: '00:00', requests: 12400, latency: 120 },
  { time: '04:00', requests: 8900, latency: 110 },
  { time: '08:00', requests: 28400, latency: 135 },
  { time: '12:00', requests: 45200, latency: 152 },
  { time: '16:00', requests: 38900, latency: 140 },
  { time: '20:00', requests: 22100, latency: 125 },
  { time: '24:00', requests: 15800, latency: 118 },
];

import { userService } from '@/services/userService';
import { auditService } from '@/services/auditService';

export default function DashboardPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [orgsCount, setOrgsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [appsData, connectorsData, logsData, usersData, orgsData] = await Promise.all([
        applicationService.getApplications(),
        integrationService.getConnectors(),
        auditService.getAuditLogs(),
        userService.getUsers(),
        userService.getOrganizations(),
      ]);
      setApps(appsData);
      setConnectors(connectorsData);
      setAuditLogs(logsData);
      setUsersCount(usersData.length);
      setOrgsCount(orgsData.length);
      setLoading(false);
    }
    loadData();
  }, []);

  const standaloneCount = apps.filter((a) => (a.mode as string) === 'standalone').length;
  const hubCount = apps.filter((a) => (a.mode as string) === 'integration_hub' || (a.mode as string) === 'integration-hub').length;
  const totalModulesCount = apps.reduce((acc, app) => acc + (app.modules ? app.modules.length : 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Control Center Header Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#173C2D] via-[#1F4A39] to-[#3F7659] text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#DDEEDF]">
              <Sparkles size={14} className="text-[#DDEEDF]" /> LaunchPad Control Center v2.4
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Good morning, Admin
            </h1>
            <p className="text-xs md:text-sm text-[#DDEEDF] max-w-2xl leading-relaxed">
              Your enterprise application ecosystem is operating smoothly. Managing {apps.length} business applications across Standalone and Integration Hub modes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/applications/create"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#DDEEDF] text-[#173C2D] hover:bg-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105"
            >
              <Plus size={16} /> Create Application
            </Link>
            <Link
              href="/integrations"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all"
            >
              <Network size={16} /> Integration Hub
            </Link>
          </div>
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Platform Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-[#E2ECE5] rounded-xl shadow-xs hover:border-[#3F7659] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5A7165]">Total Applications</span>
            <div className="p-2 bg-[#F3F9F5] text-[#3F7659] rounded-lg">
              <Boxes size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#173C2D]">{apps.length}</span>
            <span className="text-[11px] font-semibold text-[#3F7659] bg-[#DDEEDF] px-2 py-0.5 rounded">
              Active Apps
            </span>
          </div>
          <p className="text-[11px] text-[#5A7165] mt-1">{standaloneCount} Standalone • {hubCount} Integration Hub</p>
        </div>

        <div className="p-5 bg-white border border-[#E2ECE5] rounded-xl shadow-xs hover:border-[#3F7659] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5A7165]">Active Platform Users</span>
            <div className="p-2 bg-[#F3F9F5] text-[#3F7659] rounded-lg">
              <Network size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#173C2D]">{usersCount}</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              {orgsCount} Organization(s)
            </span>
          </div>
          <p className="text-[11px] text-[#5A7165] mt-1">Managed RBAC Accounts</p>
        </div>

        <div className="p-5 bg-white border border-[#E2ECE5] rounded-xl shadow-xs hover:border-[#3F7659] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5A7165]">Total Active Modules</span>
            <div className="p-2 bg-[#F3F9F5] text-[#3F7659] rounded-lg">
              <Zap size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#173C2D]">{totalModulesCount}</span>
            <span className="text-[11px] font-semibold text-[#3F7659] bg-[#DDEEDF] px-2 py-0.5 rounded">
              Configured
            </span>
          </div>
          <p className="text-[11px] text-[#5A7165] mt-1">Across all applications</p>
        </div>

        <div className="p-5 bg-white border border-[#E2ECE5] rounded-xl shadow-xs hover:border-[#3F7659] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5A7165]">System Status</span>
            <div className="p-2 bg-[#F3F9F5] text-emerald-600 rounded-lg">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#173C2D]">100%</span>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Healthy
            </span>
          </div>
          <p className="text-[11px] text-[#5A7165] mt-1">API Connected to PostgreSQL</p>
        </div>
      </div>

      {/* Dual Operational Engine Banner (Explicit Standalone vs Integration Hub visualizer) */}
      <div className="p-6 bg-white border border-[#DDEEDF] rounded-2xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E2ECE5]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
              <Layers size={14} /> Core Architectural Capability
            </div>
            <h2 className="text-lg font-bold text-[#173C2D] mt-1">
              LaunchPad Dual Operational Engine
            </h2>
            <p className="text-xs text-[#5A7165] mt-0.5">
              LaunchPad creates new standalone applications or seamlessly connects to existing customer backends without forcing code replacement.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/demos/vms"
              className="px-3.5 py-2 bg-[#F3F9F5] hover:bg-[#DDEEDF] text-[#173C2D] text-xs font-semibold rounded-lg border border-[#DDEEDF] transition-all flex items-center gap-1.5"
            >
              <Server size={14} className="text-[#3F7659]" /> Demo Standalone VMS
            </Link>
            <Link
              href="/demos/crm"
              className="px-3.5 py-2 bg-[#F3F9F5] hover:bg-[#DDEEDF] text-[#173C2D] text-xs font-semibold rounded-lg border border-[#DDEEDF] transition-all flex items-center gap-1.5"
            >
              <Network size={14} className="text-[#3F7659]" /> Demo PHP CRM Hub
            </Link>
          </div>
        </div>

        {/* Visual Engine Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Mode 1: Standalone */}
          <div className="p-5 rounded-xl bg-[#F3F9F5] border border-[#DDEEDF] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-[11px] font-extrabold bg-[#3F7659] text-white rounded-md">
                  MODE 1
                </span>
                <h3 className="text-sm font-bold text-[#173C2D]">Standalone Platform</h3>
              </div>
              <span className="text-[11px] font-semibold text-[#3F7659] bg-white px-2.5 py-0.5 rounded border border-[#DDEEDF]">
                Built-in Infrastructure
              </span>
            </div>

            <p className="text-xs text-[#5A7165]">
              Full end-to-end application generated by LaunchPad. Provides complete frontend, database schema, authentication, and core business services.
            </p>

            <div className="p-3 bg-white rounded-lg border border-[#E2ECE5] flex items-center justify-between text-xs font-semibold text-[#173C2D]">
              <span className="flex items-center gap-1.5"><Boxes size={14} className="text-[#3F7659]" /> Customer</span>
              <span className="text-[#5A7165]">→</span>
              <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-[#3F7659]" /> LaunchPad UI</span>
              <span className="text-[#5A7165]">→</span>
              <span className="flex items-center gap-1.5"><Server size={14} className="text-[#3F7659]" /> LaunchPad DB</span>
            </div>
          </div>

          {/* Mode 2: Integration Hub */}
          <div className="p-5 rounded-xl bg-[#F3F9F5] border border-[#DDEEDF] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-[11px] font-extrabold bg-[#173C2D] text-white rounded-md">
                  MODE 2
                </span>
                <h3 className="text-sm font-bold text-[#173C2D]">Integration Hub</h3>
              </div>
              <span className="text-[11px] font-semibold text-[#173C2D] bg-[#F3EBDD] px-2.5 py-0.5 rounded border border-[#E2ECE5]">
                Existing System Source of Truth
              </span>
            </div>

            <p className="text-xs text-[#5A7165]">
              Connect LaunchPad modern frontend to customer&apos;s pre-existing backends (PHP CRM, Python HRMS, Legacy VMS). LaunchPad acts as the unified UI layer.
            </p>

            <div className="p-3 bg-white rounded-lg border border-[#E2ECE5] flex items-center justify-between text-xs font-semibold text-[#173C2D] overflow-x-auto">
              <span className="flex items-center gap-1"><Sparkles size={14} className="text-[#3F7659]" /> LaunchPad UI</span>
              <span className="text-[#5A7165]">→</span>
              <span className="flex items-center gap-1"><Network size={14} className="text-[#3F7659]" /> Hub Connector</span>
              <span className="text-[#5A7165]">→</span>
              <span className="flex items-center gap-1"><Server size={14} className="text-purple-600" /> Existing PHP/Python API</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Control Grid: Application Ecosystem */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#173C2D] tracking-tight">
              Application Ecosystem Control
            </h2>
            <p className="text-xs text-[#5A7165]">
              Live status and connector health across all generated & connected applications
            </p>
          </div>
          <Link
            href="/applications"
            className="text-xs font-bold text-[#3F7659] hover:text-[#173C2D] flex items-center gap-1"
          >
            View All Applications ({apps.length}) <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {apps.map((app) => (
            <div
              key={app.id}
              className="group p-5 bg-white border border-[#E2ECE5] hover:border-[#3F7659] rounded-xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7165]">
                      {app.industry}
                    </span>
                    <h3 className="text-sm font-bold text-[#173C2D] group-hover:text-[#3F7659] transition-colors">
                      {app.name}
                    </h3>
                  </div>

                  {/* Mode Badge */}
                  <span
                    className={cn(
                      'px-2.5 py-1 text-[10px] font-bold rounded-full border shrink-0',
                      app.mode === 'standalone'
                        ? 'bg-[#DDEEDF] text-[#173C2D] border-[#C5E2C8]'
                        : 'bg-[#F3EBDD] text-[#173C2D] border-[#E8DCB8]'
                    )}
                  >
                    {app.mode === 'standalone' ? 'Standalone' : 'Integration Hub'}
                  </span>
                </div>

                <p className="text-xs text-[#5A7165] line-clamp-2 leading-relaxed">
                  {app.description}
                </p>

                {/* Target backend info if Integration Hub */}
                {app.targetBackend && (
                  <div className="p-2.5 rounded-lg bg-[#F3F9F5] border border-[#DDEEDF] text-[11px] text-[#173C2D] space-y-1">
                    <div className="font-semibold flex items-center gap-1.5 text-[#3F7659]">
                      <Server size={12} /> {app.targetBackend.systemName}
                    </div>
                    <div className="text-[10px] text-[#5A7165]">
                      Stack: {app.targetBackend.techStack}
                    </div>
                  </div>
                )}

                {/* Modules Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {app.modules.slice(0, 3).map((m, idx) => {
                    const modName = typeof m === 'string' ? m : m.name;
                    return (
                      <span
                        key={typeof m === 'string' ? `${m}-${idx}` : m.id || `${m.name}-${idx}`}
                        className="px-2 py-0.5 text-[10px] font-medium bg-[#F3F9F5] text-[#173C2D] rounded border border-[#E2ECE5]"
                      >
                        {modName}
                      </span>
                    );
                  })}
                  {app.modules.length > 3 && (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-[#DDEEDF] text-[#173C2D] rounded">
                      +{app.modules.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E2ECE5] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#5A7165]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold capitalize text-[#173C2D] text-[11px]">
                    {app.environment}
                  </span>
                </div>

                <Link
                  href={`/applications/${app.id}`}
                  className="font-bold text-[#3F7659] hover:underline flex items-center gap-1"
                >
                  Manage <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Visualization & Connector Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Traffic Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#173C2D]">
                Platform API Traffic & Request Volume
              </h3>
              <p className="text-xs text-[#5A7165]">
                Real-time API requests handled by LaunchPad router across Standalone and Connector backends
              </p>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-bold bg-[#DDEEDF] text-[#173C2D] rounded-full">
              Live Stream
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3F7659" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3F7659" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F9F5" />
                <XAxis dataKey="time" stroke="#5A7165" fontSize={11} />
                <YAxis stroke="#5A7165" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#173C2D',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#3F7659"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRequests)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Integration Health Matrix (1 col) */}
        <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE5]">
              <h3 className="text-sm font-bold text-[#173C2D]">Integration Health</h3>
              <Link href="/integrations/connectors" className="text-[11px] font-bold text-[#3F7659] hover:underline">
                Registry →
              </Link>
            </div>

            <div className="space-y-3 mt-4">
              {connectors.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-lg bg-[#F3F9F5] border border-[#E2ECE5] flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#173C2D] flex items-center gap-1.5">
                      {c.name}
                    </div>
                    <div className="text-[10px] text-[#5A7165]">
                      {c.targetSystem} ({c.targetTech})
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full',
                        c.status === 'connected'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      )}
                    >
                      {c.status === 'connected' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                      {c.status}
                    </span>
                    <div className="text-[10px] text-[#5A7165] mt-1">{c.latencyMs}ms</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/integrations"
            className="w-full py-2.5 text-center text-xs font-bold text-[#173C2D] bg-[#DDEEDF] hover:bg-[#3F7659] hover:text-white rounded-lg transition-colors block mt-4"
          >
            Configure Connectors
          </Link>
        </div>
      </div>

      {/* Recent Platform Activity */}
      <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-4">
          <h3 className="text-sm font-bold text-[#173C2D] flex items-center gap-2">
            <Clock size={16} className="text-[#3F7659]" /> Recent Platform Activity Logs
          </h3>
          <Link href="/audit-logs" className="text-xs font-bold text-[#3F7659] hover:underline">
            View Audit Trail
          </Link>
        </div>

        <div className="divide-y divide-[#F3F9F5]">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="p-1.5 rounded-full bg-[#DDEEDF] text-[#173C2D]">
                  <CheckCircle2 size={14} />
                </span>
                <div>
                  <div className="font-bold text-[#173C2D]">
                    {log.action} <span className="font-mono text-[#3F7659] font-normal">({log.module})</span>
                  </div>
                  <div className="text-[11px] text-[#5A7165]">
                    By: {log.user} • {log.details}
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-[#5A7165] font-mono">
                {formatDate(log.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
