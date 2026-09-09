'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Server,
  Network,
  ArrowUpRight,
  ExternalLink,
  Settings,
  MoreVertical,
  Layers,
  LayoutGrid,
  List
} from 'lucide-react';
import { applicationService } from '@/services/applicationService';
import { Application, AppMode } from '@/types';
import { cn, formatDate } from '@/lib/utils';

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | AppMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    async function fetchApps() {
      const data = await applicationService.getApplications();
      setApps(data);
    }
    fetchApps();
  }, []);

  const filteredApps = apps.filter((app) => {
    const matchesMode = filterMode === 'all' || app.mode === filterMode;
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMode && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
            <Boxes size={14} /> Application Ecosystem
          </div>
          <h1 className="text-2xl font-extrabold text-[#173C2D] mt-1">Applications Management</h1>
          <p className="text-xs text-[#5A7165]">
            Manage, configure, and deploy applications across Standalone and Integration Hub modes.
          </p>
        </div>

        <Link
          href="/applications/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl shadow-sm transition-all w-fit"
        >
          <Plus size={16} /> Create Application
        </Link>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 bg-white border border-[#E2ECE5] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7165]" size={15} />
            <input
              type="text"
              placeholder="Search applications by name or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-[#173C2D] focus:outline-none focus:border-[#3F7659]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F3F9F5] p-1 rounded-lg border border-[#E2ECE5]">
            <button
              onClick={() => setFilterMode('all')}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-md transition-all',
                filterMode === 'all' ? 'bg-white text-[#173C2D] shadow-2xs' : 'text-[#5A7165]'
              )}
            >
              All ({apps.length})
            </button>
            <button
              onClick={() => setFilterMode('standalone')}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-md transition-all',
                filterMode === 'standalone' ? 'bg-[#3F7659] text-white' : 'text-[#5A7165]'
              )}
            >
              Standalone
            </button>
            <button
              onClick={() => setFilterMode('integration_hub')}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-md transition-all',
                filterMode === 'integration_hub' ? 'bg-[#173C2D] text-white' : 'text-[#5A7165]'
              )}
            >
              Integration Hub
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-[#E2ECE5] pl-4">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-md transition-colors',
              viewMode === 'grid' ? 'bg-[#DDEEDF] text-[#173C2D]' : 'text-[#5A7165]'
            )}
            title="Grid View"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              'p-2 rounded-md transition-colors',
              viewMode === 'table' ? 'bg-[#DDEEDF] text-[#173C2D]' : 'text-[#5A7165]'
            )}
            title="Table View"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="group p-5 bg-white border border-[#E2ECE5] hover:border-[#3F7659] rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7165]">
                      {app.industry}
                    </span>
                    <h3 className="text-base font-bold text-[#173C2D] group-hover:text-[#3F7659] transition-colors">
                      {app.name}
                    </h3>
                  </div>

                  <span
                    className={cn(
                      'px-2.5 py-1 text-[10px] font-bold rounded-full border shrink-0',
                      app.mode === 'standalone'
                        ? 'bg-[#DDEEDF] text-[#173C2D] border-[#C5E2C8]'
                        : 'bg-[#F3EBDD] text-[#173C2D] border-[#E8DCB8]'
                    )}
                  >
                    {app.mode === 'standalone' ? 'Standalone' : 'Integration Hub'}
                  </span>
                </div>

                <p className="text-xs text-[#5A7165] line-clamp-2 leading-relaxed">
                  {app.description}
                </p>

                {app.targetBackend && (
                  <div className="p-2.5 rounded-lg bg-[#F3F9F5] border border-[#DDEEDF] text-[11px] text-[#173C2D] space-y-0.5">
                    <div className="font-semibold text-[#3F7659] flex items-center gap-1">
                      <Server size={12} /> {app.targetBackend.systemName}
                    </div>
                    <div className="text-[10px] text-[#5A7165]">
                      {app.targetBackend.techStack}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {app.modules.map((m, idx) => {
                    const modName = typeof m === 'string' ? m : m.name;
                    return (
                      <span
                        key={typeof m === 'string' ? `${m}-${idx}` : m.id || `${m.name}-${idx}`}
                        className="px-2 py-0.5 text-[10px] font-medium bg-[#F3F9F5] text-[#173C2D] rounded border border-[#E2ECE5]"
                      >
                        {modName}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E2ECE5] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#173C2D] capitalize flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {app.environment}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/applications/${app.id}`}
                    className="px-3 py-1.5 bg-[#F3F9F5] hover:bg-[#DDEEDF] text-[#173C2D] font-bold text-xs rounded-lg transition-all"
                  >
                    Configure
                  </Link>
                  <Link
                    href={app.id === 'app-vms-01' ? '/demos/vms' : '/demos/crm'}
                    className="px-3 py-1.5 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1"
                  >
                    Preview <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-[#E2ECE5] rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F3F9F5] border-b border-[#E2ECE5] text-[#173C2D] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Application</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Industry</th>
                <th className="p-4">Environment</th>
                <th className="p-4">Users</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F9F5]">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-[#F3F9F5] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#173C2D] text-xs">{app.name}</div>
                    <div className="text-[11px] text-[#5A7165]">{app.type}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        'px-2.5 py-1 text-[10px] font-bold rounded-full border',
                        app.mode === 'standalone'
                          ? 'bg-[#DDEEDF] text-[#173C2D] border-[#C5E2C8]'
                          : 'bg-[#F3EBDD] text-[#173C2D] border-[#E8DCB8]'
                      )}
                    >
                      {app.mode === 'standalone' ? 'Standalone' : 'Integration Hub'}
                    </span>
                  </td>
                  <td className="p-4 text-[#5A7165] font-medium">{app.industry}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 capitalize font-semibold text-[#173C2D]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {app.environment}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-[#173C2D]">{app.usersCount}</td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/applications/${app.id}`}
                      className="px-3 py-1.5 bg-[#3F7659] text-white rounded-md font-semibold hover:bg-[#173C2D] transition-colors"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
