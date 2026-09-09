'use client';

import React, { useState } from 'react';
import { Card, Button } from '@launchpad/ui';
import { Shield, Key, Flag, Building2, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'secrets' | 'flags'>('roles');

  const roles = [
    { name: 'SUPER_ADMIN', desc: 'Full tenant & platform control', count: 2, permissions: ['*'] },
    { name: 'ORG_ADMIN', desc: 'Organization management & connectors', count: 5, permissions: ['org:write', 'connectors:manage', 'users:manage'] },
    { name: 'MANAGER', desc: 'Read & write canonical entities', count: 18, permissions: ['canonical:read', 'canonical:write'] },
    { name: 'MEMBER', desc: 'Standard platform user access', count: 124, permissions: ['canonical:read'] },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-[#FFFDF9] border border-[#D9CBB8] rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#2F241F]">Organization & Security Settings</h1>
          <p className="text-xs text-[#6C5A4E] mt-1">Configure RBAC Roles, Encrypted API Secrets, and Feature Flags.</p>
        </div>
      </div>

      <div className="flex border-b border-[#D9CBB8] gap-4">
        {[
          { id: 'roles', name: 'RBAC Roles & Permissions', icon: Shield },
          { id: 'secrets', name: 'Encrypted Secrets', icon: Key },
          { id: 'flags', name: 'Feature Flags', icon: Flag },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 pb-3 px-2 font-semibold text-sm border-b-2 transition-all ${
                activeTab === t.id
                  ? 'border-[#6F4E37] text-[#6F4E37]'
                  : 'border-transparent text-[#6C5A4E] hover:text-[#2F241F]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.name}
            </button>
          );
        })}
      </div>

      {activeTab === 'roles' && (
        <div className="grid gap-4">
          {roles.map((role, idx) => (
            <Card key={idx} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#2F241F] text-base">{role.name}</h3>
                  <p className="text-xs text-[#6C5A4E] mt-0.5">{role.desc}</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-[#EFE6D8] text-[#6F4E37] rounded-full">
                  {role.count} Users Assigned
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {role.permissions.map((p, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-[#F8F4EF] border border-[#D9CBB8] text-[10px] font-mono text-[#2F241F]">
                    {p}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'secrets' && (
        <Card title="Secrets & Enterprise Credentials Manager">
          <div className="space-y-4">
            <div className="p-4 bg-[#F8F4EF] border border-[#D9CBB8] rounded-xl flex items-center justify-between">
              <div>
                <span className="block font-bold text-xs text-[#2F241F]">SAP_ODATA_CLIENT_SECRET</span>
                <span className="block text-[10px] text-[#6C5A4E]">Encrypted with AES-256 GCM</span>
              </div>
              <span className="font-mono text-xs text-[#6C5A4E]">••••••••••••••••</span>
            </div>
            <div className="p-4 bg-[#F8F4EF] border border-[#D9CBB8] rounded-xl flex items-center justify-between">
              <div>
                <span className="block font-bold text-xs text-[#2F241F]">SALESFORCE_CLIENT_ID</span>
                <span className="block text-[10px] text-[#6C5A4E]">Encrypted with AES-256 GCM</span>
              </div>
              <span className="font-mono text-xs text-[#6C5A4E]">3MV9G738192837••••</span>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'flags' && (
        <Card title="Tenant Feature Flags">
          <div className="space-y-4">
            {[
              { name: 'enable_ai_setup_wizard', label: 'AI Setup Wizard Integration', enabled: true },
              { name: 'enable_sap_bapi_direct', label: 'Direct SAP BAPI RFC Calls', enabled: true },
              { name: 'enable_audit_request_logging', label: 'Enterprise Compliance Request Logger', enabled: true },
            ].map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-[#F8F4EF] border border-[#D9CBB8] rounded-xl">
                <div>
                  <span className="block font-bold text-xs text-[#2F241F]">{f.label}</span>
                  <span className="block font-mono text-[10px] text-[#6C5A4E]">{f.name}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {f.enabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
