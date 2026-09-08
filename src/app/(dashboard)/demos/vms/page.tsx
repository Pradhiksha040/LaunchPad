'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building,
  UserCheck,
  UserX,
  QrCode,
  Bell,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  ShieldCheck,
  Server,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VmsDemoPage() {
  const [visitors, setVisitors] = useState([
    { id: 'v-1', name: 'Jonathan Davis', company: 'Acme Corp', host: 'Sarah Jenkins', time: '10:15 AM', status: 'checked_in', badge: 'QR-8841' },
    { id: 'v-2', name: 'Emily Watson', company: 'TechSolutions', host: 'Alexander Wright', time: '11:00 AM', status: 'expected', badge: 'QR-8842' },
    { id: 'v-3', name: 'Robert Chen', company: 'Global Logistics', host: 'Marcus Chen', time: '09:30 AM', status: 'checked_out', badge: 'QR-8839' },
  ]);

  const [newVisitorName, setNewVisitorName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [showCheckinSuccess, setShowCheckinSuccess] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitorName) return;

    const newV = {
      id: `v-${Date.now()}`,
      name: newVisitorName,
      company: newCompany || 'Independent Guest',
      host: 'Alexander Wright',
      time: 'Just now',
      status: 'checked_in',
      badge: `QR-${Math.floor(Math.random() * 8000) + 1000}`,
    };

    setVisitors([newV, ...visitors]);
    setNewVisitorName('');
    setNewCompany('');
    setShowCheckinSuccess(true);
    setTimeout(() => setShowCheckinSuccess(false), 3000);
  };

  const toggleCheckStatus = (id: string) => {
    setVisitors(
      visitors.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            status: v.status === 'checked_in' ? 'checked_out' : 'checked_in',
          };
        }
        return v;
      })
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner indicating Demo mode */}
      <div className="p-4 bg-white border border-[#DDEEDF] rounded-xl flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/applications" className="p-2 text-[#5A7165] hover:text-[#173C2D] hover:bg-[#F3F9F5] rounded-lg">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-[#DDEEDF] text-[#173C2D] rounded-full">
              MODE 1: STANDALONE APP DEMO
            </span>
            <h1 className="text-base font-bold text-[#173C2D] mt-0.5">Visitor Pass OS (Generated Application)</h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#3F7659] bg-[#F3F9F5] px-3 py-1.5 rounded-lg border border-[#DDEEDF]">
          <Server size={14} /> Full LaunchPad Managed Infrastructure
        </div>
      </div>

      {/* Simulated Application Canvas Header */}
      <div className="p-6 bg-gradient-to-r from-[#173C2D] to-[#3F7659] text-white rounded-2xl shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-[#DDEEDF] font-semibold">Facilities & Security Command Center</span>
            <h2 className="text-2xl font-black">Lobby Visitor Kiosk</h2>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20">
              <QrCode size={16} /> Scan Badge QR
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
          <div>
            <span className="text-[#DDEEDF]">Checked-in Now</span>
            <div className="text-xl font-bold mt-0.5">
              {visitors.filter((v) => v.status === 'checked_in').length}
            </div>
          </div>
          <div>
            <span className="text-[#DDEEDF]">Expected Today</span>
            <div className="text-xl font-bold mt-0.5">14</div>
          </div>
          <div>
            <span className="text-[#DDEEDF]">Total Processed</span>
            <div className="text-xl font-bold mt-0.5">142</div>
          </div>
        </div>
      </div>

      {/* Interactive Check-in Form & Live Visitor List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Visitor Registration Kiosk */}
        <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#173C2D] flex items-center gap-2">
            <Plus size={16} className="text-[#3F7659]" /> Express Visitor Registration
          </h3>

          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-[#173C2D]">Visitor Full Name</label>
              <input
                type="text"
                placeholder="e.g. David Miller"
                value={newVisitorName}
                onChange={(e) => setNewVisitorName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg mt-1"
                required
              />
            </div>

            <div>
              <label className="font-bold text-[#173C2D]">Company / Organization</label>
              <input
                type="text"
                placeholder="e.g. TechCorp"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg mt-1"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 mt-2"
            >
              <UserCheck size={16} /> Check-in & Print Badge
            </button>
          </form>

          {showCheckinSuccess && (
            <div className="p-3 bg-[#DDEEDF] text-[#173C2D] text-xs font-bold rounded-xl border border-[#C5E2C8] flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-700" /> Visitor Checked-in & Host Alert Sent!
            </div>
          )}
        </div>

        {/* Live Visitor Directory */}
        <div className="md:col-span-2 p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
            <h3 className="text-sm font-bold text-[#173C2D]">Live Lobby Visitor Register</h3>
            <span className="text-xs text-[#5A7165]">Real-time Status</span>
          </div>

          <div className="divide-y divide-[#F3F9F5]">
            {visitors.map((v) => (
              <div key={v.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-[#DDEEDF] text-[#173C2D] rounded-xl font-mono text-[10px] font-bold">
                    {v.badge}
                  </span>
                  <div>
                    <div className="font-bold text-[#173C2D] text-sm">{v.name}</div>
                    <div className="text-[11px] text-[#5A7165]">
                      {v.company} • Host: <strong>{v.host}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'px-2.5 py-1 text-[10px] font-bold rounded-full capitalize',
                      v.status === 'checked_in'
                        ? 'bg-emerald-100 text-emerald-800'
                        : v.status === 'checked_out'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-amber-100 text-amber-800'
                    )}
                  >
                    {v.status.replace('_', ' ')}
                  </span>

                  <button
                    onClick={() => toggleCheckStatus(v.id)}
                    className="px-3 py-1.5 bg-[#F3F9F5] hover:bg-[#DDEEDF] text-[#173C2D] font-semibold text-xs rounded-lg transition-colors"
                  >
                    {v.status === 'checked_in' ? 'Check Out' : 'Check In'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
