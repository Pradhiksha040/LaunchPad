'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  LayoutGrid,
  FileCode2,
  FormInput,
  GitFork,
  Users,
  Building2,
  Network,
  Plug,
  KeyRound,
  BarChart3,
  FileSpreadsheet,
  History,
  CreditCard,
  Settings,
  Code2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  ArrowUpRight,
  Server,
  Building,
  Store
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBranding } from '@/context/BrandingContext';

interface NavSection {
  title: string;
  items: {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    isDemo?: boolean;
  }[];
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { branding } = useBranding();

  const navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { name: 'Control Center', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Build',
      items: [
        { name: 'App Marketplace', href: '/marketplace', icon: Store, badge: 'Hub' },
        { name: 'Applications', href: '/applications', icon: Boxes, badge: '12' },
        { name: 'Workflows', href: '/workflows', icon: GitFork, badge: 'New' },
        { name: 'Templates', href: '/templates', icon: LayoutGrid, badge: 'Market' },
        { name: 'Page Builder', href: '/builders/page', icon: FileCode2 },
        { name: 'Form Builder', href: '/builders/form', icon: FormInput },
        { name: 'Workflow Builder', href: '/builders/workflow', icon: GitFork },
      ],
    },
    {
      title: 'Manage',
      items: [
        { name: 'Governance', href: '/governance', icon: ShieldCheck, badge: 'Admin' },
        { name: 'Marketplace Review', href: '/governance/marketplace-review', icon: ShieldCheck, badge: 'Sec' },
        { name: 'Users & Roles', href: '/users', icon: Users },
        { name: 'Organizations', href: '/organizations', icon: Building2 },
      ],
    },
    {
      title: 'Connect',
      items: [
        { name: 'Integration Hub', href: '/integrations', icon: Network, badge: 'Core' },
        { name: 'Connectors', href: '/integrations/connectors', icon: Plug },
        { name: 'API Management', href: '/api-management', icon: KeyRound },
      ],
    },
    {
      title: 'Interactive Demos',
      items: [
        { name: 'VMS (Standalone)', href: '/demos/vms', icon: Building, isDemo: true },
        { name: 'PHP CRM (Hub)', href: '/demos/crm', icon: Server, isDemo: true },
        { name: 'Python HRMS (Hub)', href: '/demos/hrms', icon: Layers, isDemo: true },
      ],
    },
    {
      title: 'Monitor',
      items: [
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Reports', href: '/reports', icon: FileSpreadsheet },
        { name: 'Audit Logs', href: '/audit-logs', icon: History },
      ],
    },
    {
      title: 'Business',
      items: [
        { name: 'Billing & Plans', href: '/billing', icon: CreditCard, badge: 'Pro' },
      ],
    },
    {
      title: 'System',
      items: [
        { name: 'Settings', href: '/settings', icon: Settings },
        { name: 'Developer Portal', href: '/developer', icon: Code2 },
        { name: 'Security Center', href: '/developer/security', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'relative z-30 flex flex-col h-screen bg-white border-r border-[#E2ECE5] transition-all duration-300 select-none shadow-sm',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#E2ECE5] bg-[#F3F9F5]">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#3F7659] text-white shrink-0 shadow-sm font-bold text-lg">
            L
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-[#173C2D] text-base leading-none">
                {branding.appName}
              </span>
              <span className="text-[10px] font-medium text-[#3F7659] uppercase tracking-wider mt-1">
                Enterprise OS
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 text-[#5A7165] hover:text-[#173C2D] hover:bg-[#DDEEDF] rounded-md transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[11px] font-semibold text-[#5A7165] uppercase tracking-wider mb-2">
                {section.title}
              </h3>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                    isActive
                      ? 'bg-[#3F7659] text-white shadow-sm font-semibold'
                      : item.isDemo
                      ? 'text-[#173C2D] bg-[#F3F9F5] hover:bg-[#DDEEDF]'
                      : 'text-[#173C2D] hover:bg-[#F3F9F5] hover:text-[#3F7659]'
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      size={18}
                      className={cn(
                        'shrink-0 transition-transform group-hover:scale-105',
                        isActive
                          ? 'text-white'
                          : item.isDemo
                          ? 'text-[#3F7659]'
                          : 'text-[#5A7165] group-hover:text-[#3F7659]'
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span
                      className={cn(
                        'px-2 py-0.5 text-[10px] font-bold rounded-full ml-2 shrink-0',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#DDEEDF] text-[#173C2D]'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Mode Status Footer Card */}
      {!collapsed && (
        <div className="p-3 border-t border-[#E2ECE5] bg-[#F3F9F5]">
          <div className="p-3 rounded-lg bg-white border border-[#DDEEDF] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#173C2D] flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#3F7659]" /> Core Platform Mode
              </span>
              <span className="w-2 h-2 rounded-full bg-[#3F7659] animate-pulse"></span>
            </div>
            <p className="text-[10px] text-[#5A7165] leading-relaxed">
              Standalone & Integration Hub Dual Operational Engine Ready.
            </p>
            <div className="pt-1 flex items-center justify-between text-[10px] font-semibold text-[#3F7659]">
              <span>API-Ready Frontend</span>
              <ArrowUpRight size={12} />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
