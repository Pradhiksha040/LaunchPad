'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Network,
  Server,
  ArrowLeft,
  RefreshCw,
  Users,
  Briefcase,
  Calendar,
  FileText,
  CheckCircle2,
  ArrowRight,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HrmsIntegrationDemoPage() {
  const [employees, setEmployees] = useState([
    { id: 'EMP-101', name: 'Dr. Evelyn Reed', dept: 'Engineering', role: 'Staff Architect', leavesUsed: 4, status: 'Active' },
    { id: 'EMP-102', name: 'Julian Thorne', dept: 'Product Design', role: 'Lead Designer', leavesUsed: 2, status: 'Active' },
    { id: 'EMP-103', name: 'Sofia Martinez', dept: 'Human Resources', role: 'HR Business Partner', leavesUsed: 6, status: 'On Leave' },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner */}
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
              People OS connected to Existing Python Django HRMS
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[#173C2D] bg-white px-3 py-1.5 rounded-lg border border-[#E8DCB8]">
          <Server size={14} className="text-blue-600" /> Existing Python Backend is Source of Truth
        </div>
      </div>

      {/* Architecture Trace */}
      <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-[#3F7659] uppercase tracking-wider">
          Integration Hub Python Connector Trace
        </h3>

        <div className="p-4 bg-[#F3F9F5] border border-[#DDEEDF] rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono font-bold text-[#173C2D]">
          <div className="flex items-center gap-2 p-2 bg-white rounded border border-[#E2ECE5]">
            <span className="text-[#3F7659]">People OS UI</span>
          </div>
          <ArrowRight size={16} className="text-[#3F7659]" />

          <div className="flex items-center gap-2 p-2 bg-[#173C2D] text-white rounded">
            <Network size={14} /> Integration Hub
          </div>
          <ArrowRight size={16} className="text-[#3F7659]" />

          <div className="flex items-center gap-2 p-2 bg-blue-100 text-blue-900 rounded border border-blue-200">
            <Server size={14} /> Python HRMS Connector (OAuth 2.0)
          </div>
          <ArrowRight size={16} className="text-[#3F7659]" />

          <div className="flex items-center gap-2 p-2 bg-white rounded border border-[#E2ECE5]">
            <Database size={14} className="text-emerald-700" /> Django Postgres DB
          </div>
        </div>
      </div>

      {/* Employee Roster */}
      <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#173C2D]">Employee Directory & Leave Balance Sync</h2>
            <p className="text-xs text-[#5A7165]">
              Target Endpoint: <code className="font-mono text-[#3F7659]">https://hrms.enterprise.net/api/v1/employees</code>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F9F5] border-b border-[#E2ECE5] text-[#173C2D] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Emp ID</th>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Role</th>
                <th className="p-3">Leaves Used</th>
                <th className="p-3 text-right">Python Sync Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F9F5]">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#F3F9F5] transition-colors">
                  <td className="p-3 font-mono font-bold text-[#3F7659]">{emp.id}</td>
                  <td className="p-3 font-bold text-[#173C2D]">{emp.name}</td>
                  <td className="p-3 font-medium text-[#173C2D]">{emp.dept}</td>
                  <td className="p-3 text-[#5A7165]">{emp.role}</td>
                  <td className="p-3 font-bold text-[#173C2D]">{emp.leavesUsed} / 24 days</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded">
                      Synced from Django
                    </span>
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
