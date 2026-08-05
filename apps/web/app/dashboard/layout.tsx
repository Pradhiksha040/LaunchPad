'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  LayoutDashboard,
  Cpu,
  Boxes,
  Workflow,
  Sparkles,
  Settings,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { OperatingMode } from '@launchpad/shared';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentMode, setCurrentMode] = useState<OperatingMode>(OperatingMode.INTEGRATION_HUB);
  const [activeTenant, setActiveTenant] = useState('Apollo Enterprise');

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Integration Hub', href: '/dashboard/integration-hub', icon: Cpu },
    { name: 'Industry Templates', href: '/dashboard/templates', icon: Boxes },
    { name: 'Workflows', href: '/dashboard/workflows', icon: Workflow },
    { name: 'AI Setup Wizard', href: '/dashboard/ai-wizard', icon: Sparkles },
    { name: 'Settings & RBAC', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F8F4EF] overflow-hidden">
      {/* Executive Dark Espresso Sidebar */}
      <aside className="w-64 bg-[#4E342E] text-[#FFFDF9] flex flex-col justify-between border-r border-[#3a2722] z-30">
        <div>
          {/* Logo & Platform Name */}
          <div className="p-6 border-b border-[#3a2722] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#A67C52] flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white">LaunchPad OS</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A67C52]">Enterprise Console</span>
            </div>
          </div>

          {/* Tenant / Organization Switcher */}
          <div className="px-4 py-4 border-b border-[#3a2722]">
            <div className="bg-[#3a2722] rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-[#32211d] transition-colors border border-[#6F4E37]/40">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Building2 className="w-4 h-4 text-[#A67C52] shrink-0" />
                <div className="truncate">
                  <span className="block text-xs font-semibold text-white truncate">{activeTenant}</span>
                  <span className="block text-[10px] text-[#D9CBB8]">Tenant ID: apollo_ent</span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#D9CBB8] shrink-0" />
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#6F4E37] text-white font-semibold shadow-md'
                      : 'text-[#D9CBB8] hover:text-white hover:bg-[#3a2722]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#A67C52]'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Operating Mode Indicator */}
        <div className="p-4 border-t border-[#3a2722]">
          <div className="p-3 rounded-xl bg-[#3a2722] border border-[#6F4E37]/30 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-[#D9CBB8]">Active Operating Mode</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <button
              onClick={() =>
                setCurrentMode(
                  currentMode === OperatingMode.STANDALONE ? OperatingMode.INTEGRATION_HUB : OperatingMode.STANDALONE
                )
              }
              className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-[#6F4E37] hover:bg-[#5a3f2c] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {currentMode === OperatingMode.STANDALONE ? <ShieldCheck className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5" />}
              {currentMode === OperatingMode.STANDALONE ? 'Standalone Mode' : 'Integration Hub Mode'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Top Header */}
        <header className="h-16 bg-[#FFFDF9] border-b border-[#D9CBB8] px-8 flex items-center justify-between z-20 shadow-sm">
          {/* Global Search Bar */}
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6C5A4E]" />
            <input
              type="text"
              placeholder="Search canonical entities, connectors, workflows..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-[#F8F4EF] border border-[#D9CBB8] focus:outline-none focus:ring-2 focus:ring-[#6F4E37] text-[#2F241F]"
            />
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl bg-[#F8F4EF] hover:bg-[#EFE6D8] border border-[#D9CBB8] text-[#6C5A4E] relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E76F51]"></span>
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-[#D9CBB8]">
              <div className="w-8 h-8 rounded-full bg-[#6F4E37] text-white font-bold flex items-center justify-center text-xs">
                EA
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-semibold text-[#2F241F]">Enterprise Admin</span>
                <span className="block text-[10px] text-[#6C5A4E]">admin@apollohospital.org</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
