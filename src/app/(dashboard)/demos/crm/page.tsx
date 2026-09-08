'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Network,
  Server,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Database,
  Code2,
  Users,
  DollarSign,
  Ticket,
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CrmIntegrationDemoPage() {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2 mins ago');
  const [contacts, setContacts] = useState([
    { id: 481, name: 'Eleanor Vance', email: 'eleanor@vancemedia.com', company: 'Vance Media', dealValue: '$45,000', status: 'Customer' },
    { id: 482, name: 'Marcus Brody', email: 'm.brody@museum-arch.org', company: 'Global Museum', dealValue: '$120,000', status: 'Opportunity' },
    { id: 483, name: 'Clara Oswald', email: 'clara@tardis-consulting.co.uk', company: 'TARDIS Labs', dealValue: '$88,000', status: 'Lead' },
  ]);

  const handleManualSync = async () => {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 900));
    setSyncing(false);
    setLastSyncTime('Just now');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner indicating Integration Hub Mode */}
      <div className="p-4 bg-[#F3EBDD] border border-[#E8DCB8] rounded-xl flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/applications" className="p-2 text-[#5A7165] hover:text-[#173C2D] hover:bg-white rounded-lg">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-[#173C2D] text-white rounded-full">
              MODE 2: INTEGRATION HUB DEMO
            </span>
            <h1 className="text-base font-bold text-[#173C2D] mt-0.5">
              Customer Portal connected to Existing PHP CRM
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[#173C2D] bg-white px-3 py-1.5 rounded-lg border border-[#E8DCB8]">
          <Server size={14} className="text-purple-600" /> Existing PHP Backend is Source of Truth
        </div>
      </div>

      {/* Explicit Architecture Flow Banner */}
      <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-[#3F7659] uppercase tracking-wider">
          Integration Data Pipeline Execution Trace
        </h3>

        <div className="p-4 bg-[#F3F9F5] border border-[#DDEEDF] rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono font-bold text-[#173C2D]">
          <div className="flex items-center gap-2 p-2 bg-white rounded border border-[#E2ECE5]">
            <span className="text-[#3F7659]">LaunchPad UI</span>
          </div>
          <ArrowRight size={16} className="text-[#3F7659]" />

          <div className="flex items-center gap-2 p-2 bg-[#173C2D] text-white rounded">
            <Network size={14} /> Integration Hub
          </div>
          <ArrowRight size={16} className="text-[#3F7659]" />

          <div className="flex items-center gap-2 p-2 bg-white rounded border border-[#E2ECE5]">
            <Zap size={14} className="text-purple-600" /> CRM Connector (REST)
          </div>
          <ArrowRight size={16} className="text-[#3F7659]" />

          <div className="flex items-center gap-2 p-2 bg-purple-100 text-purple-900 rounded border border-purple-200">
            <Server size={14} /> Existing PHP CRM API
          </div>
          <ArrowRight size={16} className="text-[#3F7659]" />

          <div className="flex items-center gap-2 p-2 bg-white rounded border border-[#E2ECE5]">
            <Database size={14} className="text-emerald-700" /> MySQL DB
          </div>
        </div>
      </div>

      {/* Customer CRM Data View */}
      <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2ECE5] pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#173C2D]">Live Customers & Deals (PHP Sync)</h2>
            <p className="text-xs text-[#5A7165]">
              Data fetched live from target endpoint: <code className="font-mono text-[#3F7659]">https://crm.company.com/api/v2/contacts</code>
            </p>
          </div>

          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl shadow-xs transition-all w-fit"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing with PHP CRM...' : `Trigger CRM Sync (${lastSyncTime})`}
          </button>
        </div>

        {/* Contacts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F9F5] border-b border-[#E2ECE5] text-[#173C2D] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">CRM ID</th>
                <th className="p-3">Contact Name</th>
                <th className="p-3">Company</th>
                <th className="p-3">Deal Value</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Source System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F9F5]">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-[#F3F9F5] transition-colors">
                  <td className="p-3 font-mono font-bold text-[#3F7659]">#{c.id}</td>
                  <td className="p-3">
                    <div className="font-bold text-[#173C2D]">{c.name}</div>
                    <div className="text-[11px] text-[#5A7165]">{c.email}</div>
                  </td>
                  <td className="p-3 font-medium text-[#173C2D]">{c.company}</td>
                  <td className="p-3 font-bold text-[#173C2D]">{c.dealValue}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#DDEEDF] text-[#173C2D] rounded-full">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono text-[11px] text-purple-700 font-semibold">
                    PHP CRM v2.4 API
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
