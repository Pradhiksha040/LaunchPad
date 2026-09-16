'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Zap,
  Users,
  Network,
  Calendar,
  GitFork,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  ShieldCheck,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { analyticsService, AnalyticsOverview, IntegrationAnalytics, WorkflowAnalytics } from '@/services/analyticsService';
import { applicationService } from '@/services/applicationService';
import { Application } from '@/types';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'integrations' | 'workflows'>('overview');

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [integAnalytics, setIntegAnalytics] = useState<IntegrationAnalytics | null>(null);
  const [wfAnalytics, setWfAnalytics] = useState<WorkflowAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApps() {
      const appList = await applicationService.getApplications();
      setApplications(appList);
    }
    loadApps();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    const [ovData, inData, wfData] = await Promise.all([
      analyticsService.getOverview(timeframe, selectedAppId || undefined),
      analyticsService.getIntegrationAnalytics(timeframe, selectedAppId || undefined),
      analyticsService.getWorkflowAnalytics(timeframe, selectedAppId || undefined),
    ]);
    setOverview(ovData);
    setIntegAnalytics(inData);
    setWfAnalytics(wfData);
    setLoading(false);
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [timeframe, selectedAppId]);

  const COLORS = ['#3F7659', '#173C2D', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
            <BarChart3 size={14} /> Platform Telemetry & Intelligence
          </div>
          <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Enterprise Analytics</h1>
          <p className="text-xs text-[#5A7165]">Real-time operational metrics across Applications, Integration Hub, and Workflows.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Application Selector */}
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-[#E2ECE5] rounded-xl text-[#173C2D] font-bold"
          >
            <option value="">All Applications</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E2ECE5]">
            {(['today', '7d', '30d', '90d', 'all'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  'px-3 py-1.5 text-xs font-bold uppercase rounded-lg transition-all',
                  timeframe === tf ? 'bg-[#3F7659] text-white shadow-2xs' : 'text-[#5A7165] hover:bg-[#F3F9F5]'
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards Banner */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-[#5A7165]">Applications Count</span>
            <div className="text-2xl font-black text-[#173C2D]">{overview.totalApps}</div>
            <span className="text-[10px] text-[#3F7659] font-bold">{overview.activeApps} Active Systems</span>
          </div>

          <div className="p-4 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-[#5A7165]">API Success Rate</span>
            <div className="text-2xl font-black text-[#173C2D]">{overview.apiSuccessRate}%</div>
            <span className="text-[10px] text-emerald-700 font-bold">Avg Latency: {overview.avgLatencyMs}ms</span>
          </div>

          <div className="p-4 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-[#5A7165]">Workflow Success Rate</span>
            <div className="text-2xl font-black text-[#173C2D]">{overview.workflowSuccessRate}%</div>
            <span className="text-[10px] text-[#3F7659] font-bold">{overview.totalWorkflowRuns} Executions</span>
          </div>

          <div className="p-4 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-[#5A7165]">Active Connectors</span>
            <div className="text-2xl font-black text-[#173C2D]">{overview.activeConnectors}</div>
            <span className="text-[10px] text-[#5A7165]">Out of {overview.totalIntegrations} Total Integrations</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2ECE5] pb-2">
        {[
          { id: 'overview', label: 'Platform Overview & Traffic' },
          { id: 'integrations', label: 'Integration Hub Telemetry' },
          { id: 'workflows', label: 'Workflow Execution Analytics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-4 py-2 text-xs font-bold rounded-xl transition-all',
              activeTab === tab.id
                ? 'bg-[#173C2D] text-white shadow-xs'
                : 'text-[#5A7165] hover:bg-white hover:text-[#173C2D]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & TIME-SERIES */}
      {activeTab === 'overview' && overview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Bar Chart */}
          <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#173C2D]">Standalone vs Integration Hub Traffic</h3>
              <span className="text-xs text-[#5A7165]">Req / Day</span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.trafficTimeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F9F5" />
                  <XAxis dataKey="day" stroke="#5A7165" fontSize={11} />
                  <YAxis stroke="#5A7165" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#173C2D', borderRadius: '8px', color: '#FFF' }} />
                  <Bar dataKey="standalone" fill="#3F7659" name="Standalone Apps" />
                  <Bar dataKey="hub" fill="#173C2D" name="Integration Hub" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Workflow Runs Area Chart */}
          <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#173C2D]">Workflow Pipeline Executions</h3>
              <span className="text-xs font-bold text-[#3F7659]">{overview.totalWorkflowRuns} Total Runs</span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview.trafficTimeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F9F5" />
                  <XAxis dataKey="day" stroke="#5A7165" fontSize={11} />
                  <YAxis stroke="#5A7165" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#173C2D', borderRadius: '8px', color: '#FFF' }} />
                  <Area type="monotone" dataKey="workflowRuns" stroke="#3F7659" fill="#DDEEDF" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTEGRATION HUB TELEMETRY */}
      {activeTab === 'integrations' && integAnalytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-[#E2ECE5] rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#5A7165]">Total API Traffic</span>
              <div className="text-2xl font-black text-[#173C2D]">{integAnalytics.totalTraffic} Requests</div>
            </div>
            <div className="p-5 bg-white border border-[#E2ECE5] rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#5A7165]">Success Rate</span>
              <div className="text-2xl font-black text-emerald-800">{integAnalytics.overallSuccessRate}%</div>
            </div>
            <div className="p-5 bg-white border border-[#E2ECE5] rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#5A7165]">Avg Response Time</span>
              <div className="text-2xl font-black text-[#3F7659]">{integAnalytics.avgLatencyMs} ms</div>
            </div>
          </div>

          <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#173C2D]">Connector Telemetry Breakdown</h3>
            <div className="divide-y divide-[#F3F9F5] text-xs">
              {integAnalytics.connectorBreakdown.map((conn) => (
                <div key={conn.integrationId} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#173C2D]">{conn.name}</h4>
                    <p className="text-[11px] text-[#5A7165]">
                      App: {conn.applicationName} • System: {conn.targetSystem} ({conn.connectorType})
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <span className="font-bold text-[#173C2D]">{conn.totalRequests} reqs</span>
                      <div className="text-[10px] text-emerald-700 font-semibold">{conn.successRate}% Success</div>
                    </div>
                    <span className="font-mono bg-[#F3F9F5] px-2.5 py-1 rounded border border-[#E2ECE5] text-xs font-bold text-[#3F7659]">
                      {conn.avgLatencyMs}ms
                    </span>
                  </div>
                </div>
              ))}

              {integAnalytics.connectorBreakdown.length === 0 && (
                <div className="py-6 text-center text-[#5A7165]">
                  No integrations created yet. Create integrations in the Integration Hub.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WORKFLOW ANALYTICS */}
      {activeTab === 'workflows' && wfAnalytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-[#E2ECE5] rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#5A7165]">Total Executions</span>
              <div className="text-2xl font-black text-[#173C2D]">{wfAnalytics.totalExecutions}</div>
            </div>
            <div className="p-5 bg-white border border-[#E2ECE5] rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#5A7165]">Successful Runs</span>
              <div className="text-2xl font-black text-emerald-800">{wfAnalytics.successCount}</div>
            </div>
            <div className="p-5 bg-white border border-[#E2ECE5] rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#5A7165]">Failed Runs</span>
              <div className="text-2xl font-black text-amber-800">{wfAnalytics.failureCount}</div>
            </div>
            <div className="p-5 bg-white border border-[#E2ECE5] rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#5A7165]">Total Retries</span>
              <div className="text-2xl font-black text-[#3F7659]">{wfAnalytics.totalRetries} Retries</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
