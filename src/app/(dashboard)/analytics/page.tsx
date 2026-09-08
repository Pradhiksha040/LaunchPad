'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Zap, Users, Network, Calendar } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { cn } from '@/lib/utils';

const USER_GROWTH = [
  { month: 'Jan', users: 450 },
  { month: 'Feb', users: 620 },
  { month: 'Mar', users: 890 },
  { month: 'Apr', users: 1120 },
  { month: 'May', users: 1350 },
  { month: 'Jun', users: 1420 },
];

const API_TRAFFIC = [
  { day: 'Mon', standalone: 45000, hub: 32000 },
  { day: 'Tue', standalone: 52000, hub: 41000 },
  { day: 'Wed', standalone: 61000, hub: 48000 },
  { day: 'Thu', standalone: 58000, hub: 45000 },
  { day: 'Fri', standalone: 72000, hub: 59000 },
  { day: 'Sat', standalone: 31000, hub: 22000 },
  { day: 'Sun', standalone: 28000, hub: 19000 },
];

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d' | '90d'>('30d');

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
            <BarChart3 size={14} /> Telemetry & Intelligence
          </div>
          <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Enterprise Analytics</h1>
          <p className="text-xs text-[#5A7165]">Platform metrics across Standalone and Integration Hub deployments.</p>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E2ECE5] w-fit">
          {(['today', '7d', '30d', '90d'] as const).map((tf) => (
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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#173C2D]">User Base Expansion</h3>
            <span className="px-2.5 py-1 text-[10px] font-bold bg-[#DDEEDF] text-[#173C2D] rounded-full">
              +14% vs last month
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={USER_GROWTH}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F9F5" />
                <XAxis dataKey="month" stroke="#5A7165" fontSize={11} />
                <YAxis stroke="#5A7165" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#173C2D', borderRadius: '8px', color: '#FFF' }} />
                <Area type="monotone" dataKey="users" stroke="#3F7659" fill="#DDEEDF" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* API Traffic Comparison */}
        <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#173C2D]">Standalone vs Integration Hub API Traffic</h3>
            <span className="text-xs text-[#5A7165]">Req / Day</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={API_TRAFFIC}>
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
      </div>
    </div>
  );
}
