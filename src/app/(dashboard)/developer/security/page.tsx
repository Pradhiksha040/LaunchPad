'use client';

import React from 'react';
import { ShieldCheck, Lock, KeyRound, CheckCircle2 } from 'lucide-react';

export default function SecurityCenterPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
          <ShieldCheck size={14} /> Platform Trust
        </div>
        <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Security Center</h1>
        <p className="text-xs text-[#5A7165]">Enterprise authentication, active sessions, and compliance monitors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#173C2D]">Active Sessions & SSO</h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-[#F3F9F5] rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-[#173C2D]">Alexander Wright (Current)</div>
                <div className="text-[11px] text-[#5A7165]">Chrome 128 • Windows 11 • 192.168.1.104</div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                Active Now
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#173C2D]">Security Compliance Readiness</h3>
          <div className="space-y-2 text-xs">
            {['SOC2 Type II Controls Verified', 'HIPAA Data Encryption at Rest', 'OAuth 2.0 / SAML SSO Active'].map((c) => (
              <div key={c} className="flex items-center gap-2 text-[#173C2D] font-medium">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
