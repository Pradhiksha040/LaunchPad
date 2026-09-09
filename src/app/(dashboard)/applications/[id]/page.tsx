'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Boxes,
  Server,
  Network,
  CheckCircle2,
  Rocket,
  Palette,
  Users,
  BarChart3,
  History,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Check,
  RefreshCw,
  ExternalLink,
  Plus,
  Settings,
  Lock,
  Search
} from 'lucide-react';
import { applicationService } from '@/services/applicationService';
import { Application, AppEnvironment, AppModuleItem } from '@/types';
import { getModulesForTemplate, getTemplateDisplayName } from '@/data/moduleCatalog';
import { cn, formatDate } from '@/lib/utils';

export default function ApplicationDetailPage() {
  const params = useParams();
  const appId = (params?.id as string) || 'app-vms-01';

  const [app, setApp] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'branding' | 'integrations' | 'deployment'>('overview');
  const [deploying, setDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [moduleSearch, setModuleSearch] = useState('');

  useEffect(() => {
    async function loadApp() {
      const data = await applicationService.getApplicationById(appId);
      if (data) setApp(data);
    }
    loadApp();
  }, [appId]);

  // Load catalog for this specific app's template
  const templateCatalog = useMemo(() => {
    if (!app) return [];
    return getModulesForTemplate(app.templateId || app.type || app.name);
  }, [app]);

  const handleDeploy = async (env: AppEnvironment) => {
    if (!app) return;
    setDeploying(true);
    setDeploySuccess(false);

    await new Promise((r) => setTimeout(r, 1200));
    const updated = await applicationService.deployApplication(app.id, env);
    if (updated) setApp(updated);

    setDeploying(false);
    setDeploySuccess(true);
    setTimeout(() => setDeploySuccess(false), 3000);
  };

  const toggleAppModule = (moduleName: string) => {
    if (!app) return;
    const currentModules = app.modules.map((m) => (typeof m === 'string' ? m : m.name));
    let updated: string[];

    if (currentModules.includes(moduleName)) {
      updated = currentModules.filter((m) => m !== moduleName);
    } else {
      updated = [...currentModules, moduleName];
    }

    setApp({ ...app, modules: updated });
  };

  if (!app) {
    return (
      <div className="p-12 text-center text-[#5A7165]">
        <div className="w-8 h-8 rounded-full border-2 border-[#3F7659] border-t-transparent animate-spin mx-auto mb-2" />
        Loading application details...
      </div>
    );
  }

  const enabledModuleNames = app.modules.map((m) => (typeof m === 'string' ? m : m.name));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* App Header Banner */}
      <div className="p-6 md:p-8 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border',
                  app.mode === 'standalone'
                    ? 'bg-[#DDEEDF] text-[#173C2D] border-[#C5E2C8]'
                    : 'bg-[#F3EBDD] text-[#173C2D] border-[#E8DCB8]'
                )}
              >
                {app.mode === 'standalone' ? 'Standalone Mode' : 'Integration Hub Mode'}
              </span>
              <span className="text-xs font-semibold text-[#5A7165]">• {app.industry}</span>
            </div>
            <h1 className="text-2xl font-black text-[#173C2D]">{app.name}</h1>
            <p className="text-xs text-[#5A7165] max-w-2xl">{app.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={app.id === 'app-vms-01' ? '/demos/vms' : '/demos/crm'}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              Preview Generated UI <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E2ECE5] pt-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Health' },
            { id: 'modules', label: `Enabled Modules (${app.modules.length})` },
            { id: 'branding', label: 'Theme Branding' },
            { id: 'integrations', label: 'Target Connector' },
            { id: 'deployment', label: 'Deployment Pipeline' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-[#3F7659] text-[#3F7659]'
                  : 'border-transparent text-[#5A7165] hover:text-[#173C2D]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#173C2D]">Application Architecture Overview</h3>
              <p className="text-xs text-[#5A7165] leading-relaxed">
                This application is running in <strong className="text-[#173C2D] capitalize">{app.mode} Mode</strong>.
                {app.mode === 'standalone'
                  ? ' LaunchPad manages the underlying database schemas, microservice business logic, and web application routing directly.'
                  : ` LaunchPad acts as the modern frontend layer communicating directly with ${app.targetBackend?.systemName} via high-speed API connector.`}
              </p>

              {app.targetBackend && (
                <div className="p-4 rounded-xl bg-[#F3F9F5] border border-[#DDEEDF] space-y-2">
                  <span className="text-[10px] font-bold text-[#3F7659] uppercase tracking-wider">
                    Source of Truth Backend
                  </span>
                  <div className="text-xs font-bold text-[#173C2D]">{app.targetBackend.systemName}</div>
                  <div className="text-xs text-[#5A7165]">Stack: {app.targetBackend.techStack}</div>
                  <div className="text-[11px] font-mono text-[#3F7659] bg-white px-2.5 py-1 rounded border border-[#E2ECE5] w-fit">
                    {app.targetBackend.endpointUrl}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#173C2D]">Runtime Metrics</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[#F3F9F5]">
                <span className="text-[#5A7165]">Active End Users</span>
                <span className="font-bold text-[#173C2D]">{app.usersCount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F3F9F5]">
                <span className="text-[#5A7165]">Health Check</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">100% Passing</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F3F9F5]">
                <span className="text-[#5A7165]">Last Deployment</span>
                <span className="font-semibold text-[#173C2D]">{formatDate(app.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULES TAB */}
      {activeTab === 'modules' && (
        <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-[#173C2D]">
                {app.name} — Application Modules Catalog
              </h3>
              <p className="text-xs text-[#5A7165]">
                Manage active modular capabilities specific to this application build.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7165]" />
              <input
                type="text"
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
                placeholder="Search app modules..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D]"
              />
            </div>
          </div>

          {/* Active vs Available Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {templateCatalog
              .filter((m) =>
                moduleSearch.trim() === ''
                  ? true
                  : m.name.toLowerCase().includes(moduleSearch.toLowerCase()) ||
                    m.category.toLowerCase().includes(moduleSearch.toLowerCase())
              )
              .map((modItem) => {
                const isEnabled = enabledModuleNames.includes(modItem.name);
                return (
                  <div
                    key={modItem.id}
                    onClick={() => toggleAppModule(modItem.name)}
                    className={cn(
                      'p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 relative',
                      isEnabled
                        ? 'border-[#3F7659] bg-[#F3F9F5] shadow-xs'
                        : 'border-[#E2ECE5] bg-white opacity-70 hover:opacity-100 hover:border-[#DDEEDF]'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-white border border-[#E2ECE5] text-[#3F7659]">
                          {modItem.category}
                        </span>
                        <span
                          className={cn(
                            'w-5 h-5 rounded-lg border flex items-center justify-center text-xs font-bold transition-all',
                            isEnabled
                              ? 'bg-[#3F7659] text-white border-transparent'
                              : 'border-[#E2ECE5] bg-white'
                          )}
                        >
                          {isEnabled && <Check size={12} />}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#173C2D]">{modItem.name}</h4>
                      <p className="text-[11px] text-[#5A7165] mt-1 line-clamp-2 leading-relaxed">
                        {modItem.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-2 border-t border-[#E2ECE5]/60">
                      <span className={cn('font-bold', isEnabled ? 'text-[#3F7659]' : 'text-[#5A7165]')}>
                        {isEnabled ? '✓ Module Enabled' : 'Click to Enable'}
                      </span>
                      {modItem.required && (
                        <span className="font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Lock size={9} /> Core Required
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#173C2D]">Branding Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-[#F3F9F5] rounded-lg">
              <span className="text-[#5A7165]">App Title</span>
              <div className="font-bold text-[#173C2D] mt-1">{app.branding.appName}</div>
            </div>
            <div className="p-3 bg-[#F3F9F5] rounded-lg">
              <span className="text-[#5A7165]">Primary Color</span>
              <div className="flex items-center gap-2 font-bold text-[#173C2D] mt-1">
                <span className="w-4 h-4 rounded" style={{ backgroundColor: app.branding.primaryColor }} />
                {app.branding.primaryColor}
              </div>
            </div>
            <div className="p-3 bg-[#F3F9F5] rounded-lg">
              <span className="text-[#5A7165]">Secondary Color</span>
              <div className="flex items-center gap-2 font-bold text-[#173C2D] mt-1">
                <span className="w-4 h-4 rounded" style={{ backgroundColor: app.branding.secondaryColor }} />
                {app.branding.secondaryColor}
              </div>
            </div>
            <div className="p-3 bg-[#F3F9F5] rounded-lg">
              <span className="text-[#5A7165]">Button Corner Radius</span>
              <div className="font-bold text-[#173C2D] mt-1 capitalize">{app.branding.buttonStyle}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
