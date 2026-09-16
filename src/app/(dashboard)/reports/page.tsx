'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, FileText, CheckCircle2, RefreshCw, Filter } from 'lucide-react';
import { analyticsService, ReportItem } from '@/services/analyticsService';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      const list = await analyticsService.getReportsList();
      setReports(list);
      setLoading(false);
    }
    loadReports();
  }, []);

  const handleDownloadReport = (reportId: string, title: string) => {
    setExportingId(reportId);
    const exportUrl = analyticsService.getReportExportUrl(reportId, format, timeframe);

    // Trigger browser download via anchor element
    const link = document.createElement('a');
    link.href = exportUrl;
    link.setAttribute('download', `${reportId}_export.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setExportingId(null), 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
            <FileSpreadsheet size={14} /> Data Exports & Compliance Reports
          </div>
          <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Enterprise Platform Reports</h1>
          <p className="text-xs text-[#5A7165]">Export real-time application metadata, integration telemetry logs, and workflow execution audit trails.</p>
        </div>

        {/* Format & Timeframe Export Controls */}
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-[#E2ECE5]">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-[#5A7165] uppercase px-1">Format:</span>
            <button
              onClick={() => setFormat('csv')}
              className={cn(
                'px-2.5 py-1 text-xs font-bold rounded-lg transition-all',
                format === 'csv' ? 'bg-[#3F7659] text-white shadow-2xs' : 'text-[#5A7165] hover:bg-[#F3F9F5]'
              )}
            >
              CSV
            </button>
            <button
              onClick={() => setFormat('json')}
              className={cn(
                'px-2.5 py-1 text-xs font-bold rounded-lg transition-all',
                format === 'json' ? 'bg-[#3F7659] text-white shadow-2xs' : 'text-[#5A7165] hover:bg-[#F3F9F5]'
              )}
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Reports Catalog */}
      {loading ? (
        <div className="p-12 text-center text-[#5A7165]">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#3F7659]" />
          Loading report catalog...
        </div>
      ) : (
        <div className="bg-white border border-[#E2ECE5] rounded-2xl shadow-xs divide-y divide-[#F3F9F5]">
          {reports.map((rep) => (
            <div key={rep.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F3F9F5] transition-colors text-xs">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#DDEEDF] text-[#173C2D] rounded-xl font-bold shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-white border border-[#E2ECE5] text-[#3F7659] rounded">
                      {rep.category}
                    </span>
                    <h4 className="font-extrabold text-[#173C2D] text-sm">{rep.title}</h4>
                  </div>
                  <p className="text-xs text-[#5A7165] mt-1 leading-relaxed max-w-xl">
                    {rep.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDownloadReport(rep.id, rep.title)}
                disabled={exportingId === rep.id}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all shrink-0 self-start sm:self-center"
              >
                {exportingId === rep.id ? (
                  <span className="flex items-center gap-1.5 text-emerald-100">
                    <CheckCircle2 size={15} /> Exporting...
                  </span>
                ) : (
                  <>
                    <Download size={15} /> Export {format.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
