'use client';

import React, { useState, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { applicationService } from '@/services/applicationService';
import { Application, AppEnvironment } from '@/types';
import { cn, formatDate } from '@/lib/utils';

export default function ApplicationDetailPage() {
  const params = useParams();
  const appId = (params?.id as string) || 'app-vms-01';

  const [app, setApp] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'branding' | 'integrations' | 'deployment'>('overview');
  const [deploying, setDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);

  useEffect(() => {
    async function loadApp() {
      const data = await applicationService.getApplicationById(appId);
      if (data) setApp(data);
    }
    loadApp();
  }, [appId]);

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

  if (!app) {
    return (
      <div className="p-12 text-center text-[#5A7165]">
        <div className="w-8 h-8 rounded-full border-2 border-[#3F7659] border-t-transparent animate-spin mx-auto mb-2" />
        Loading application details...
      </div>
    );
  }

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

        {/* Environment Bar */}
        <div className="p-4 bg-[#F3F9F5] border border-[#DDEEDF] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#173C2D]">Active Target Environment:</span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#E2ECE5]">
              {(['development', 'staging', 'production'] as const).map((env) => (
                <button
                  key={env}
                  onClick={() => handleDeploy(env)}
                  disabled={deploying}
                  className={cn(
                    'px-3 py-1 text-xs font-bold capitalize rounded-md transition-all',
                    app.environment === env
                      ? 'bg-[#3F7659] text-white shadow-2xs'
                      : 'text-[#5A7165] hover:bg-[#F3F9F5]'
                  )}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          {deploySuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg animate-in fade-in">
              <CheckCircle2 size={14} /> Environment Promoted Successfully!
            </span>
          )}
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

      {activeTab === 'modules' && (
        <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#173C2D]">Active Application Modules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {app.modules.map((m) => (
              <div key={m} className="p-4 rounded-xl bg-[#F3F9F5] border border-[#DDEEDF] flex items-center justify-between">
                <span className="text-xs font-bold text-[#173C2D]">{m}</span>
                <span className="p-1 bg-[#3F7659] text-white rounded-full"><Check size={12} /></span>
              </div>
            ))}
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
