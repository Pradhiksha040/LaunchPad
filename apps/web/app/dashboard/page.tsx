'use client';

import React, { useState } from 'react';
import {
  StatCard,
  Card,
  Button,
  ModeBadge,
} from '@launchpad/ui';
import { OperatingMode, ConnectorType } from '@launchpad/shared';
import {
  Users,
  ShoppingCart,
  Calendar,
  Activity,
  Cpu,
  ArrowUpRight,
  CheckCircle2,
  Zap,
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage() {
  const [currentMode, setCurrentMode] = useState<OperatingMode>(OperatingMode.INTEGRATION_HUB);
  const [activeConnector, setActiveConnector] = useState<ConnectorType>(ConnectorType.SAP);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 800);
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FFFDF9] border border-[#D9CBB8] rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#2F241F]">Enterprise Command Center</h1>
            <ModeBadge mode={currentMode} />
          </div>
          <p className="text-xs text-[#6C5A4E] mt-1">
            Active Tenant: <strong>Apollo Enterprise</strong> | Selected Connector: <strong>{activeConnector}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            className="gap-2"
            disabled={isSyncing}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Schema'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              setCurrentMode(
                currentMode === OperatingMode.STANDALONE ? OperatingMode.INTEGRATION_HUB : OperatingMode.STANDALONE
              )
            }
          >
            Switch Operating Mode
          </Button>
        </div>
      </div>

      {/* Real-Time Executive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Canonical Customers"
          value="14,892"
          change="+12.4%"
          isPositive={true}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Total Orders"
          value="$1,480,250"
          change="+8.1%"
          isPositive={true}
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <StatCard
          title="Scheduled Appointments"
          value="1,240"
          change="+4.3%"
          isPositive={true}
          icon={<Calendar className="w-5 h-5" />}
        />
        <StatCard
          title="Integration API Latency"
          value="42 ms"
          change="-18%"
          isPositive={true}
          icon={<Activity className="w-5 h-5" />}
        />
      </div>

      {/* Integration Hub Live Orchestration Status */}
      <div className="grid lg:grid-cols-3 gap-8">
        <Card
          title="Active Operating Mode Architecture"
          subtitle="Real-time request routing diagram"
          className="lg:col-span-2"
        >
          <div className="p-6 bg-[#F8F4EF] border border-[#D9CBB8] rounded-xl space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#FFFDF9] border border-[#D9CBB8] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#6F4E37] text-white flex items-center justify-center text-xs font-bold">
                  UI
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#2F241F]">Next.js Frontend Request</span>
                  <span className="block text-[10px] text-[#6C5A4E]">POST /api/v1/canonical/orders</span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#8B5E3C]" />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#FFFDF9] border border-[#D9CBB8] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#8B5E3C] text-white flex items-center justify-center text-xs font-bold">
                  HUB
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#2F241F]">
                    {currentMode === OperatingMode.STANDALONE ? 'Prisma Postgres ORM' : `Integration Hub (${activeConnector})`}
                  </span>
                  <span className="block text-[10px] text-[#6C5A4E]">
                    {currentMode === OperatingMode.STANDALONE
                      ? 'Stored locally in launchpad_os database'
                      : 'Payload mapped to SAP VBELN / KUNNR schema'}
                  </span>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#FFFDF9] border border-[#D9CBB8] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#4E342E] text-white flex items-center justify-center text-xs font-bold">
                  DB
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#2F241F]">Target Backend Entity</span>
                  <span className="block text-[10px] text-[#6C5A4E]">
                    {currentMode === OperatingMode.STANDALONE ? 'Postgres Table: Order' : 'SAP S/4HANA OData Endpoint'}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-semibold">
                200 OK
              </span>
            </div>
          </div>
        </Card>

        {/* Live Connector Health */}
        <Card title="Connector Health Monitor" subtitle="Active Enterprise Adapters">
          <div className="space-y-3">
            {[
              { type: ConnectorType.SAP, name: 'SAP Enterprise (OData)', status: 'HEALTHY', latency: '42ms' },
              { type: ConnectorType.SALESFORCE, name: 'Salesforce Composite', status: 'HEALTHY', latency: '58ms' },
              { type: ConnectorType.GENERIC_REST, name: 'Generic REST Adapter', status: 'HEALTHY', latency: '24ms' },
              { type: ConnectorType.ORACLE, name: 'Oracle OIC ERP', status: 'HEALTHY', latency: '65ms' },
            ].map((conn, idx) => (
              <div
                key={idx}
                onClick={() => setActiveConnector(conn.type)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  activeConnector === conn.type
                    ? 'bg-[#EFE6D8] border-[#A67C52]'
                    : 'bg-[#FFFDF9] border-[#D9CBB8] hover:bg-[#F8F4EF]'
                }`}
              >
                <div>
                  <span className="block text-xs font-bold text-[#2F241F]">{conn.name}</span>
                  <span className="block text-[10px] text-[#6C5A4E]">{conn.type}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-emerald-700">{conn.status}</span>
                  <span className="block text-[10px] text-[#6C5A4E]">{conn.latency}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
