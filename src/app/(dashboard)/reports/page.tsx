'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Download, FileText, CheckCircle2 } from 'lucide-react';

export default function ReportsPage() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const reports = [
    { id: 'rep-1', title: 'Application Ecosystem Audit Report', type: 'PDF', size: '2.4 MB', date: 'Sep 08, 2026' },
    { id: 'rep-2', title: 'Integration Hub Latency & Connector Log', type: 'CSV', size: '8.1 MB', date: 'Sep 07, 2026' },
    { id: 'rep-3', title: 'User Access & Permission Matrix Export', type: 'CSV', size: '1.2 MB', date: 'Sep 05, 2026' },
    { id: 'rep-4', title: 'Platform Security & SOC2 Compliance Log', type: 'PDF', size: '4.8 MB', date: 'Sep 01, 2026' },
  ];

  const triggerExport = (id: string) => {
    setDownloadingId(id);
    setTimeout(() => setDownloadingId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
          <FileSpreadsheet size={14} /> Data Exports
        </div>
        <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Platform Reports</h1>
        <p className="text-xs text-[#5A7165]">Export system logs, usage metrics, and audit reports.</p>
      </div>

      <div className="bg-white border border-[#E2ECE5] rounded-2xl shadow-xs divide-y divide-[#F3F9F5]">
        {reports.map((rep) => (
          <div key={rep.id} className="p-4 flex items-center justify-between hover:bg-[#F3F9F5] transition-colors text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#DDEEDF] text-[#173C2D] rounded-xl font-bold">
                <FileText size={18} />
              </div>
              <div>
                <h4 className="font-bold text-[#173C2D] text-sm">{rep.title}</h4>
                <p className="text-[11px] text-[#5A7165]">
                  Format: <strong>{rep.type}</strong> • Size: {rep.size} • Generated: {rep.date}
                </p>
              </div>
            </div>

            <button
              onClick={() => triggerExport(rep.id)}
              disabled={downloadingId === rep.id}
              className="flex items-center gap-2 px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              {downloadingId === rep.id ? (
                <span className="flex items-center gap-1.5 text-emerald-100">
                  <CheckCircle2 size={14} /> Downloading...
                </span>
              ) : (
                <>
                  <Download size={14} /> Export {rep.type}
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
