'use client';

import React, { useState, useEffect } from 'react';
import { History, Search, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { auditService } from '@/services/auditService';
import { AuditLog } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadLogs() {
      const data = await auditService.getAuditLogs();
      setLogs(data);
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    return (
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
          <History size={14} /> Security Compliance
        </div>
        <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Enterprise Audit Trail</h1>
        <p className="text-xs text-[#5A7165]">Comprehensive security audit events, user access records, and changes.</p>
      </div>

      <div className="p-4 bg-white border border-[#E2ECE5] rounded-xl flex items-center justify-between shadow-xs">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7165]" size={15} />
          <input
            type="text"
            placeholder="Search logs by action, user, or IP address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-[#173C2D]"
          />
        </div>
      </div>

      <div className="bg-white border border-[#E2ECE5] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F3F9F5] border-b border-[#E2ECE5] text-[#173C2D] font-bold uppercase text-[10px]">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">User</th>
              <th className="p-4">Action</th>
              <th className="p-4">Module</th>
              <th className="p-4">IP Address</th>
              <th className="p-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F9F5]">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#F3F9F5] transition-colors">
                <td className="p-4 font-mono text-[11px] text-[#5A7165]">{formatDate(log.timestamp)}</td>
                <td className="p-4 font-bold text-[#173C2D]">{log.user}</td>
                <td className="p-4 font-semibold text-[#3F7659]">{log.action}</td>
                <td className="p-4 text-[#5A7165]">{log.module}</td>
                <td className="p-4 font-mono text-[11px] text-[#5A7165]">{log.ip}</td>
                <td className="p-4 text-right text-[11px] text-[#173C2D] max-w-xs truncate">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
