'use client';

import React, { useState } from 'react';
import {
  QrCode,
  UserCheck,
  Clock,
  Car,
  Flame,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  Users,
  AlertTriangle,
  Server,
  Layers,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function VmsFeaturePreview() {
  const [activeTab, setActiveTab] = useState<'kiosk' | 'badge' | 'visitors' | 'parking' | 'evacuation' | 'api'>('kiosk');

  // Kiosk demo state
  const [guestName, setGuestName] = useState('Sarah Jenkins');
  const [guestCompany, setGuestCompany] = useState('Nexus Innovations');
  const [hostName, setHostName] = useState('Alexander Wright');
  const [visitPurpose, setVisitPurpose] = useState('Executive Architecture Review');
  const [vehicleNo, setVehicleNo] = useState('KA-01-MJ-4092');
  const [kioskStatus, setKioskStatus] = useState<'idle' | 'success'>('idle');

  // Visitors table demo state
  const [visitorsList, setVisitorsList] = useState([
    { id: 'vis-101', name: 'Devon Vance', company: 'Acme Cloud', host: 'Alexander Wright', time: '09:45 AM', status: 'checked_in', badge: 'SP-9921', parking: 'Zone A-12' },
    { id: 'vis-102', name: 'Priya Sharma', company: 'Tata Tech', host: 'Marcus Chen', time: '10:30 AM', status: 'expected', badge: 'SP-9922', parking: 'Zone B-04' },
    { id: 'vis-103', name: 'Robert Chen', company: 'Global Logistics', host: 'Sarah Jenkins', time: '08:15 AM', status: 'checked_out', badge: 'SP-9918', parking: 'Zone A-01' },
    { id: 'vis-104', name: 'Elena Rostova', company: 'CyberSec Labs', host: 'Alexander Wright', time: '11:00 AM', status: 'checked_in', badge: 'SP-9925', parking: 'Zone VIP-02' },
  ]);

  const [filterSearch, setFilterSearch] = useState('');

  // Handle Kiosk Check-in submission
  const handleKioskCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const newVis = {
      id: `vis-${Date.now()}`,
      name: guestName,
      company: guestCompany || 'Independent Guest',
      host: hostName,
      time: 'Just now',
      status: 'checked_in',
      badge: `SP-${Math.floor(Math.random() * 8000) + 1000}`,
      parking: vehicleNo ? 'Zone A-18' : 'None',
    };

    setVisitorsList([newVis, ...visitorsList]);
    setKioskStatus('success');
    setTimeout(() => {
      setKioskStatus('idle');
    }, 3500);
  };

  const toggleVisitorStatus = (id: string) => {
    setVisitorsList((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const next = v.status === 'checked_in' ? 'checked_out' : 'checked_in';
          return { ...v, status: next };
        }
        return v;
      })
    );
  };

  const checkedInCount = visitorsList.filter((v) => v.status === 'checked_in').length;

  return (
    <div className="bg-white border border-[#E2ECE5] rounded-2xl shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="px-6 py-4 bg-[#F3F9F5] border-b border-[#E2ECE5] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#DDEEDF] text-[#173C2D] text-[10px] font-extrabold uppercase rounded border border-[#C5E2C8]">
              Live Feature Simulation
            </span>
            <span className="text-xs font-semibold text-[#5A7165]">SecurePass VMS Core v2.4.0</span>
          </div>
          <h3 className="text-base font-bold text-[#173C2D] mt-1">
            Interactive Visitor Management System Preview
          </h3>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'kiosk', label: 'Check-in Kiosk', icon: QrCode },
            { id: 'badge', label: 'Credential Badge', icon: Printer },
            { id: 'visitors', label: 'Today\'s Visitors', icon: Users, badge: checkedInCount },
            { id: 'parking', label: 'Parking Allocation', icon: Car },
            { id: 'evacuation', label: 'Emergency Muster', icon: Flame },
            { id: 'api', label: 'Architecture & API', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-[#3F7659] text-white font-bold shadow-xs'
                    : 'text-[#173C2D] hover:bg-[#DDEEDF] bg-white border border-[#E2ECE5]'
                )}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded-full text-[10px] font-bold ml-0.5',
                      isActive ? 'bg-white/20 text-white' : 'bg-[#DDEEDF] text-[#173C2D]'
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Areas */}
      <div className="p-6">
        {/* 1. CHECK-IN KIOSK */}
        {activeTab === 'kiosk' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#173C2D]">Self-Service Reception Kiosk</h4>
                  <p className="text-xs text-[#5A7165]">
                    Simulate how unscheduled walk-in or expected visitors register at your reception lobby.
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded">
                  Touchless Enabled
                </span>
              </div>

              {kioskStatus === 'success' ? (
                <div className="p-6 bg-[#F3F9F5] border border-[#C5E2C8] rounded-xl text-center space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-[#3F7659] text-white flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h5 className="text-sm font-extrabold text-[#173C2D]">Check-in Successful!</h5>
                    <p className="text-xs text-[#5A7165] mt-0.5">
                      Visitor pass generated & instant SMS/Email notification sent to host <strong>{hostName}</strong>.
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-[#E2ECE5] rounded-lg inline-flex items-center gap-3 text-xs text-[#173C2D] font-mono">
                    <QrCode size={18} className="text-[#3F7659]" />
                    <span>Pass ID: SP-9926 | Assigned Bay: Zone A-18</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleKioskCheckin} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#173C2D] uppercase tracking-wider mb-1">
                        Visitor Full Name *
                      </label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs border border-[#E2ECE5] rounded-lg focus:outline-none focus:border-[#3F7659]"
                        placeholder="e.g. Sarah Jenkins"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#173C2D] uppercase tracking-wider mb-1">
                        Organization / Company
                      </label>
                      <input
                        type="text"
                        value={guestCompany}
                        onChange={(e) => setGuestCompany(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#E2ECE5] rounded-lg focus:outline-none focus:border-[#3F7659]"
                        placeholder="e.g. Nexus Innovations"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#173C2D] uppercase tracking-wider mb-1">
                        Meeting Host *
                      </label>
                      <select
                        value={hostName}
                        onChange={(e) => setHostName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#E2ECE5] rounded-lg focus:outline-none focus:border-[#3F7659]"
                      >
                        <option value="Alexander Wright">Alexander Wright (Engineering VP)</option>
                        <option value="Sarah Jenkins">Sarah Jenkins (Procurement)</option>
                        <option value="Marcus Chen">Marcus Chen (Operations)</option>
                        <option value="Security Desk">Security Desk (General Check)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#173C2D] uppercase tracking-wider mb-1">
                        Vehicle Number (Optional Parking)
                      </label>
                      <input
                        type="text"
                        value={vehicleNo}
                        onChange={(e) => setVehicleNo(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#E2ECE5] rounded-lg focus:outline-none focus:border-[#3F7659]"
                        placeholder="e.g. KA-01-MJ-4092"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#173C2D] uppercase tracking-wider mb-1">
                      Visit Purpose
                    </label>
                    <input
                      type="text"
                      value={visitPurpose}
                      onChange={(e) => setVisitPurpose(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E2ECE5] rounded-lg focus:outline-none focus:border-[#3F7659]"
                      placeholder="e.g. Vendor consultation, Interview, Delivery"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <CheckCircle2 size={16} /> Complete Check-in & Print Pass
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Live Kiosk Terminal Preview */}
            <div className="lg:col-span-5 bg-[#173C2D] text-white rounded-xl p-5 flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-300">
                      Terminal #01 Online
                    </span>
                  </div>
                  <span className="text-[10px] text-white/60 font-mono">10:14:22 AM</span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="text-center py-4 bg-white/5 rounded-lg border border-white/10">
                    <QrCode size={64} className="mx-auto text-emerald-300" />
                    <span className="block text-[11px] font-bold mt-2 text-white/90">
                      Scan Visitor Invitation QR
                    </span>
                    <span className="text-[10px] text-white/60">
                      Hold dynamic wallet pass against camera
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-white/70">
                      <span>Lobby:</span>
                      <span className="text-white font-bold">Main Tower - Gate 1</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Occupancy:</span>
                      <span className="text-emerald-300 font-bold">{checkedInCount} Active Visitors</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Printer:</span>
                      <span className="text-white">Brother QL-820NWB (Ready)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-[10px] text-white/50 text-center">
                Powered by SecurePass VMS Engine • Managed via LaunchPad Core
              </div>
            </div>
          </div>
        )}

        {/* 2. CREDENTIAL BADGE */}
        {activeTab === 'badge' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div>
                <span className="px-2 py-0.5 bg-[#DDEEDF] text-[#173C2D] text-[10px] font-bold uppercase rounded">
                  Badge Studio Layout
                </span>
                <h4 className="text-base font-bold text-[#173C2D] mt-1">
                  High-Security Dynamic Credential Badge
                </h4>
                <p className="text-xs text-[#5A7165] leading-relaxed mt-1">
                  SecurePass automatically generates physical adhesive badge labels and mobile wallet passes with tamper-evident cryptographic QR codes, facility zones, and parking validation.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#173C2D]">
                  <CheckCircle2 size={14} className="text-[#3F7659]" />
                  <span><strong>Dynamic QR verification:</strong> Expiry timestamps prevent pass reuse.</span>
                </div>
                <div className="flex items-center gap-2 text-[#173C2D]">
                  <CheckCircle2 size={14} className="text-[#3F7659]" />
                  <span><strong>Multi-printer support:</strong> Zebra, Dymo, Brother thermal roll printers.</span>
                </div>
                <div className="flex items-center gap-2 text-[#173C2D]">
                  <CheckCircle2 size={14} className="text-[#3F7659]" />
                  <span><strong>Parking & Zone clearance:</strong> Automatic visual indicator on face of badge.</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => alert('Badge rendering demo: Real thermal PDF generated via jsPDF.')}
                  className="px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Printer size={14} /> Print Sample Badge
                </button>
                <span className="text-[11px] text-[#5A7165]">Dimensions: 4&quot; x 3&quot; Standard Pass</span>
              </div>
            </div>

            {/* Credential Badge Visualizer (Matches inspected PDF!) */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-80 bg-white border-2 border-slate-900 rounded-2xl shadow-xl overflow-hidden font-sans">
                {/* Badge Header */}
                <div className="bg-[#173C2D] text-white p-4 text-center">
                  <div className="text-[10px] font-mono tracking-widest uppercase text-emerald-300">
                    ★ S E C U R E P A S S ★
                  </div>
                  <div className="text-sm font-extrabold tracking-wide mt-0.5">
                    OFFICIAL VISITOR CREDENTIAL
                  </div>
                  <div className="text-[10px] text-white/70">ZOHO CORP PRIMARY HQ - BLDG 4</div>
                </div>

                {/* Badge Body */}
                <div className="p-5 text-center space-y-3 bg-[#FCFBF8]">
                  <div className="w-20 h-20 rounded-full bg-[#E2ECE5] border-2 border-[#3F7659] mx-auto flex items-center justify-center text-2xl font-bold text-[#173C2D] shadow-inner">
                    {guestName.charAt(0)}
                  </div>

                  <div>
                    <h5 className="text-base font-extrabold text-slate-900 leading-tight">{guestName}</h5>
                    <p className="text-xs font-semibold text-[#3F7659]">{guestCompany}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded uppercase">
                      General Visitor
                    </span>
                  </div>

                  <div className="py-2 border-y border-dashed border-slate-300 grid grid-cols-2 text-left text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Host:</span>
                      <span className="font-bold text-slate-800 truncate block">{hostName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Parking / Bay:</span>
                      <span className="font-bold text-emerald-800 block">ZONE A-18 ✓</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-left font-mono text-[10px]">
                      <span className="text-slate-400 block">PASS ID:</span>
                      <span className="font-bold text-slate-900">ORG-GEN-9926</span>
                      <span className="text-[9px] text-slate-500 block">VALID: TODAY ONLY</span>
                    </div>
                    <div className="p-1.5 bg-white border border-slate-300 rounded-lg shadow-xs">
                      <QrCode size={48} className="text-slate-900" />
                    </div>
                  </div>
                </div>

                {/* Badge Footer */}
                <div className="bg-slate-100 px-4 py-2 text-center text-[9px] font-mono text-slate-500 border-t border-slate-200">
                  SECURITY CLEARANCE VERIFIED • SECUREPASS 2026
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. TODAY'S VISITORS */}
        {activeTab === 'visitors' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-[#173C2D]">Today&apos;s Visitor Log & Check-in Desk</h4>
                <p className="text-xs text-[#5A7165]">
                  Real-time registry of all expected, active, and departed guests with instant status toggle.
                </p>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-[#5A7165]" />
                <input
                  type="text"
                  placeholder="Filter by guest, host, or pass..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-[#E2ECE5] rounded-lg focus:outline-none focus:border-[#3F7659] w-64"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-[#E2ECE5] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3F9F5] border-b border-[#E2ECE5] text-[#173C2D] font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Visitor & Company</th>
                    <th className="py-2.5 px-3">Meeting Host</th>
                    <th className="py-2.5 px-3">Pass & Bay</th>
                    <th className="py-2.5 px-3">Check-in Time</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2ECE5]">
                  {visitorsList
                    .filter(
                      (v) =>
                        v.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
                        v.company.toLowerCase().includes(filterSearch.toLowerCase()) ||
                        v.badge.toLowerCase().includes(filterSearch.toLowerCase())
                    )
                    .map((vis) => (
                      <tr key={vis.id} className="hover:bg-[#F3F9F5]/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-[#173C2D]">
                          <div className="font-bold">{vis.name}</div>
                          <div className="text-[11px] text-[#5A7165]">{vis.company}</div>
                        </td>
                        <td className="py-3 px-3 text-[#173C2D] font-medium">{vis.host}</td>
                        <td className="py-3 px-3 font-mono text-[11px]">
                          <span className="font-bold text-[#173C2D]">{vis.badge}</span>
                          <span className="block text-[10px] text-[#5A7165]">{vis.parking}</span>
                        </td>
                        <td className="py-3 px-3 text-[#5A7165]">{vis.time}</td>
                        <td className="py-3 px-3">
                          <span
                            className={cn(
                              'px-2 py-0.5 text-[10px] font-bold rounded-full uppercase',
                              vis.status === 'checked_in'
                                ? 'bg-[#DDEEDF] text-emerald-800'
                                : vis.status === 'expected'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            )}
                          >
                            {vis.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => toggleVisitorStatus(vis.id)}
                            className={cn(
                              'px-2.5 py-1 text-[11px] font-bold rounded transition-colors',
                              vis.status === 'checked_in'
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-[#DDEEDF] text-[#173C2D] hover:bg-[#3F7659] hover:text-white'
                            )}
                          >
                            {vis.status === 'checked_in' ? 'Check Out' : 'Check In'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. PARKING ALLOCATION */}
        {activeTab === 'parking' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-[#173C2D]">Multi-Facility Parking Slot Allocator</h4>
              <p className="text-xs text-[#5A7165]">
                SecurePass manages visitor parking inventory with real-time zone occupancy and automated barrier gate QR code pass validations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { zone: 'Zone A - Visitor Core', occupied: 14, total: 20, color: 'emerald' },
                { zone: 'Zone B - Overflow & Vendors', occupied: 8, total: 15, color: 'blue' },
                { zone: 'Zone VIP - Executive Entry', occupied: 3, total: 5, color: 'purple' },
              ].map((zone) => (
                <div key={zone.zone} className="p-4 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#173C2D]">{zone.zone}</span>
                    <Car size={16} className="text-[#3F7659]" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#5A7165]">Occupancy:</span>
                      <span className="font-bold text-[#173C2D]">{zone.occupied} / {zone.total} Bays</span>
                    </div>
                    <div className="w-full bg-[#E2ECE5] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#3F7659] h-full rounded-full transition-all"
                        style={{ width: `${(zone.occupied / zone.total) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-[10px] text-emerald-800 font-semibold bg-[#DDEEDF] px-2 py-1 rounded text-center">
                    {zone.total - zone.occupied} Slots Available Now
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. EMERGENCY EVACUATION */}
        {activeTab === 'evacuation' && (
          <div className="p-5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <Flame size={18} className="text-rose-600" />
                  <span>Emergency Evacuation Roll-Call & Muster Station</span>
                </div>
                <p className="text-xs text-rose-700 mt-1">
                  In case of fire alarm or incident, generate an instantaneous digital headcount of all checked-in guests currently inside your building.
                </p>
              </div>
              <span className="px-3 py-1 bg-rose-600 text-white font-extrabold text-xs rounded-lg animate-pulse">
                {checkedInCount} On-Premise Visitors
              </span>
            </div>

            <div className="p-4 bg-white border border-rose-200 rounded-lg space-y-2">
              <div className="text-xs font-bold text-[#173C2D] uppercase tracking-wider">
                Active On-Site Headcount Summary
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Tower 1 Lobby</span>
                  <span className="font-bold text-slate-800">2 Visitors</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Floor 3 Conference</span>
                  <span className="font-bold text-slate-800">1 Visitor</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">R&D Annex</span>
                  <span className="font-bold text-slate-800">0 Visitors</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Evac Safety Status</span>
                  <span className="font-bold text-emerald-700">Audit Ready ✓</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-rose-800 font-medium">
                Mandatory for ISO 27001 & OSHA Physical Security Compliance
              </span>
              <button
                type="button"
                onClick={() => alert(`Evacuation Roll Call generated: ${checkedInCount} visitors on site.`)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Printer size={14} /> Export Emergency Roll Call PDF
              </button>
            </div>
          </div>
        )}

        {/* 6. ARCHITECTURE & API */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-[#173C2D]">Architecture & DRF API Connectivity</h4>
              <p className="text-xs text-[#5A7165]">
                LaunchPad connects directly to the production Django REST Framework backend without rewriting business logic.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Server size={14} /> Live Backend Target
                </div>
                <div className="text-slate-300">
                  <strong>Base URL:</strong> https://api-securepass.prajai.in/api/
                </div>
                <div className="text-slate-300">
                  <strong>Auth Method:</strong> JWT Bearer (`auth/login/`)
                </div>
                <div className="text-slate-300">
                  <strong>Tenant Scoping:</strong> `X-Organization-ID`, `X-Company-ID`
                </div>
                <div className="text-slate-400 text-[10px] pt-1 border-t border-slate-800">
                  Verified: Production DRF backend active and responding.
                </div>
              </div>

              <div className="p-4 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl space-y-2 font-sans">
                <div className="text-[11px] font-bold text-[#173C2D] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#3F7659]" /> Multi-Tenancy Guarantee
                </div>
                <p className="text-xs text-[#5A7165] leading-relaxed">
                  Every request dispatched to the VMS backend carries customer-scoped tokens and organization identification headers. Cross-tenant leakage is strictly blocked by the backend entity relationship model.
                </p>
                <div className="p-2 bg-white border border-[#DDEEDF] rounded text-[11px] text-emerald-800 font-semibold">
                  Status: Controlled Access Mode Active
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

