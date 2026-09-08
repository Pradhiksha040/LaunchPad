'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Plus, Copy, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import { APIKey } from '@/types';

export default function ApiManagementPage() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadKeys() {
      const data = await analyticsService.getAPIKeys();
      setKeys(data);
    }
    loadKeys();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
            <KeyRound size={14} /> Developer Access
          </div>
          <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">API Management</h1>
          <p className="text-xs text-[#5A7165]">Manage secret API credentials for Standalone & Connector integrations.</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl shadow-xs transition-all w-fit">
          <Plus size={16} /> Create New API Key
        </button>
      </div>

      <div className="bg-white border border-[#E2ECE5] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F3F9F5] border-b border-[#E2ECE5] text-[#173C2D] font-bold uppercase text-[10px]">
            <tr>
              <th className="p-4">Key Name</th>
              <th className="p-4">Secret Prefix</th>
              <th className="p-4">Rate Limit</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F9F5]">
            {keys.map((k) => (
              <tr key={k.id} className="hover:bg-[#F3F9F5] transition-colors">
                <td className="p-4 font-bold text-[#173C2D]">{k.name}</td>
                <td className="p-4 font-mono text-[11px] text-[#3F7659]">{k.keyMasked}</td>
                <td className="p-4 font-semibold text-[#173C2D]">{k.rateLimit}</td>
                <td className="p-4">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                    {k.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleCopy(k.id, k.keyMasked)}
                    className="p-1.5 text-[#5A7165] hover:text-[#173C2D] hover:bg-[#DDEEDF] rounded transition-colors"
                  >
                    {copiedId === k.id ? <CheckCircle2 size={14} className="text-emerald-700" /> : <Copy size={14} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
