'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Palette,
  Globe,
  CheckCircle2,
  RefreshCw,
  Plus,
  ShieldCheck,
  ExternalLink,
  Copy,
  Trash2,
  AlertCircle,
  Sparkles,
  Lock,
  Layers,
} from 'lucide-react';
import { useBranding } from '@/context/BrandingContext';
import { domainService, TenantDomain } from '@/services/domainService';

export default function SettingsPage() {
  const { branding, updateBranding, resetBranding } = useBranding();
  const [activeTab, setActiveTab] = useState<'branding' | 'domains'>('branding');
  const [saved, setSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Domains state
  const [domains, setDomains] = useState<TenantDomain[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [selectedDomainForDns, setSelectedDomainForDns] = useState<TenantDomain | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // White-Label Branding state
  const [logoInput, setLogoInput] = useState(branding.logoUrl || '');
  const [appNameInput, setAppNameInput] = useState(branding.appName || 'LaunchPad OS');

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    setLoadingDomains(true);
    try {
      const data = await domainService.getDomains();
      setDomains(data);
    } catch (err) {
      console.error('Failed to load domains', err);
    } finally {
      setLoadingDomains(false);
    }
  };

  const handleApplyPreset = (p: { name: string; primary: string; secondary: string }) => {
    updateBranding({
      primaryColor: p.primary,
      secondaryColor: p.secondary,
    });
    showToast('Theme palette updated live!');
  };

  const handleSaveBranding = async () => {
    updateBranding({
      logoUrl: logoInput,
      appName: appNameInput,
    });
    await domainService.updateBranding({
      logoUrl: logoInput,
      appName: appNameInput,
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
    });
    showToast('White-label branding settings saved successfully!');
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput.trim()) return;

    const created = await domainService.createDomain(newDomainInput);
    setDomains((prev) => [created, ...prev]);
    setSelectedDomainForDns(created);
    setNewDomainInput('');
    setShowAddModal(false);
    showToast(`Domain '${created.domain}' added. Configure DNS records below.`);
  };

  const handleVerifyDns = async (dom: TenantDomain) => {
    setVerifyingId(dom.id);
    try {
      const res = await domainService.verifyDomain(dom.id);
      if (res.success) {
        showToast(`Success: Domain '${dom.domain}' verified and active!`);
        await loadDomains();
      }
    } catch {
      showToast(`Verification pending: DNS records not fully propagated yet.`);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleSetPrimary = async (dom: TenantDomain) => {
    const updated = await domainService.setPrimaryDomain(dom.id);
    showToast(`Domain '${updated.domain}' set as primary domain!`);
    await loadDomains();
  };

  const handleRemoveDomain = async (dom: TenantDomain) => {
    if (!confirm(`Are you sure you want to remove domain '${dom.domain}'?`)) return;
    await domainService.removeDomain(dom.id);
    setDomains((prev) => prev.filter((d) => d.id !== dom.id));
    if (selectedDomainForDns?.id === dom.id) setSelectedDomainForDns(null);
    showToast(`Domain '${dom.domain}' removed.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setToastMessage(null);
    }, 3500);
  };

  const presetPalettes = [
    { name: 'LaunchPad Pistachio (Default)', primary: '#3F7659', secondary: '#DDEEDF' },
    { name: 'Deep Emerald Enterprise', primary: '#173C2D', secondary: '#C5E2C8' },
    { name: 'Sage & Forest Calm', primary: '#2D5B46', secondary: '#E3EFE6' },
    { name: 'Mint Modern Tech', primary: '#1E6B52', secondary: '#D5EBDD' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
          <Settings size={14} /> Platform Configuration
        </div>
        <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Settings, White-Labeling & Custom Domains</h1>
        <p className="text-xs text-[#5A7165]">
          Manage multi-tenant custom domains, DNS verification records, visual theme branding, and white-label overrides.
        </p>
      </div>

      {/* Toast Alert */}
      {saved && toastMessage && (
        <div className="p-4 bg-[#DDEEDF] text-[#173C2D] font-bold text-xs rounded-xl border border-[#C5E2C8] flex items-center justify-between animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#E2ECE5]">
        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'branding'
              ? 'border-[#3F7659] text-[#173C2D] bg-[#F3F9F5]'
              : 'border-transparent text-[#5A7165] hover:text-[#173C2D]'
          }`}
        >
          <Palette size={14} /> White-Label & Theme Builder
        </button>
        <button
          onClick={() => setActiveTab('domains')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'domains'
              ? 'border-[#3F7659] text-[#173C2D] bg-[#F3F9F5]'
              : 'border-transparent text-[#5A7165] hover:text-[#173C2D]'
          }`}
        >
          <Globe size={14} /> Custom Domains & Multi-Tenancy ({domains.length})
        </button>
      </div>

      {/* Tab 1: White-Labeling & Theme Builder */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#173C2D] flex items-center gap-2">
                  <Palette size={16} className="text-[#3F7659]" /> Visual Branding & Color Token Editor
                </h3>
                <p className="text-xs text-[#5A7165]">
                  Color changes dynamically update root CSS variables across all tenant views.
                </p>
              </div>

              <button
                onClick={resetBranding}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F9F5] hover:bg-[#DDEEDF] text-[#173C2D] text-xs font-bold rounded-lg border border-[#E2ECE5] transition-colors"
              >
                <RefreshCw size={12} /> Reset to Default
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#173C2D]">Curated Pistachio Presets</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {presetPalettes.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="p-3 bg-[#F3F9F5] border border-[#E2ECE5] hover:border-[#3F7659] rounded-xl text-left transition-all space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full border border-white shadow-xs" style={{ backgroundColor: p.primary }} />
                      <span className="w-5 h-5 rounded-full border border-white shadow-xs" style={{ backgroundColor: p.secondary }} />
                    </div>
                    <div className="text-xs font-bold text-[#173C2D] truncate">{p.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Brand Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E2ECE5]">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#173C2D]">Primary Brand Green (--lp-primary)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-[#E2ECE5] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                    className="px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#173C2D]">Secondary Pistachio (--lp-pistachio)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-[#E2ECE5] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.secondaryColor}
                    onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
                    className="px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Branding Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E2ECE5]">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#173C2D]">Application Title Override</label>
                <input
                  type="text"
                  value={appNameInput}
                  onChange={(e) => setAppNameInput(e.target.value)}
                  placeholder="e.g. Acme Enterprise Portal"
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-xs font-medium text-[#173C2D]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#173C2D]">Tenant Logo Image URL</label>
                <input
                  type="text"
                  value={logoInput}
                  onChange={(e) => setLogoInput(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-xs font-medium text-[#173C2D]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveBranding}
                className="px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <Sparkles size={14} /> Save White-Label Branding
              </button>
            </div>
          </div>

          {/* Live White-Label Preview Card */}
          <div className="p-6 bg-[#F3F9F5] border border-[#C5E2C8] rounded-2xl space-y-4">
            <h4 className="text-xs font-extrabold text-[#173C2D] uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} className="text-[#3F7659]" /> Live White-Label UI Preview
            </h4>
            <div className="p-4 bg-white border border-[#E2ECE5] rounded-xl shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-extrabold"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  {appNameInput.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[#173C2D]">{appNameInput}</div>
                  <div className="text-xs text-[#5A7165]">Powered by LaunchPad SaaS Marketplace OS</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: branding.secondaryColor, color: branding.primaryColor }}
                >
                  Active Theme Token
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Custom Domains & Multi-Tenancy */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          {/* Domains Header & Action */}
          <div className="flex items-center justify-between p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-[#173C2D] flex items-center gap-2">
                <Globe size={16} className="text-[#3F7659]" /> Organization Custom Domains
              </h3>
              <p className="text-xs text-[#5A7165]">
                Configure subdomains or vanity custom domains (`portal.yourdomain.com`).
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Custom Domain
            </button>
          </div>

          {/* Domains Table */}
          <div className="bg-white border border-[#E2ECE5] rounded-2xl overflow-hidden shadow-xs">
            {loadingDomains ? (
              <div className="p-8 text-center text-xs text-[#5A7165]">Loading tenant domains...</div>
            ) : domains.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5A7165]">
                No custom domains registered yet. Click &quot;Add Custom Domain&quot; above to get started.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3F9F5] border-b border-[#E2ECE5] text-[#173C2D] font-bold">
                  <tr>
                    <th className="p-4">Domain Name</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Primary</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2ECE5]">
                  {domains.map((dom) => (
                    <tr key={dom.id} className="hover:bg-[#F9FCFA] transition-colors">
                      <td className="p-4 font-mono font-bold text-[#173C2D] flex items-center gap-2">
                        <Globe size={14} className="text-[#3F7659]" />
                        <span>{dom.domain}</span>
                        {dom.type === 'SUBDOMAIN' && (
                          <span className="text-[10px] bg-[#E2ECE5] text-[#173C2D] px-1.5 py-0.5 rounded font-sans">
                            Default
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-[#5A7165] font-semibold">{dom.type}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            dom.status === 'ACTIVE' || dom.status === 'VERIFIED'
                              ? 'bg-[#DDEEDF] text-emerald-800 border border-[#C5E2C8]'
                              : dom.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}
                        >
                          {dom.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {dom.isPrimary ? (
                          <span className="px-2 py-0.5 bg-[#3F7659] text-white text-[10px] font-bold rounded">
                            Primary
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetPrimary(dom)}
                            className="text-xs font-bold text-[#3F7659] hover:underline"
                          >
                            Make Primary
                          </button>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedDomainForDns(dom)}
                          className="px-2.5 py-1 bg-[#F3F9F5] hover:bg-[#DDEEDF] text-[#173C2D] text-xs font-bold rounded border border-[#E2ECE5]"
                        >
                          DNS Records
                        </button>

                        {dom.status !== 'ACTIVE' && (
                          <button
                            onClick={() => handleVerifyDns(dom)}
                            disabled={verifyingId === dom.id}
                            className="px-2.5 py-1 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded transition-colors disabled:opacity-50"
                          >
                            {verifyingId === dom.id ? 'Checking...' : 'Verify DNS'}
                          </button>
                        )}

                        {dom.type !== 'SUBDOMAIN' && (
                          <button
                            onClick={() => handleRemoveDomain(dom)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Domain"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* DNS Configuration Instructions Container */}
          {selectedDomainForDns && (
            <div className="p-6 bg-white border border-[#3F7659] rounded-2xl space-y-4 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
                <h4 className="text-xs font-extrabold text-[#173C2D] uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#3F7659]" /> DNS Configuration Records for `{selectedDomainForDns.domain}`
                </h4>
                <button
                  onClick={() => setSelectedDomainForDns(null)}
                  className="text-xs font-bold text-[#5A7165] hover:text-[#173C2D]"
                >
                  Close
                </button>
              </div>

              <p className="text-xs text-[#5A7165]">
                Add the following DNS records in your DNS provider (e.g. Cloudflare, Route53, GoDaddy) to verify ownership and route traffic.
              </p>

              <div className="space-y-3 font-mono text-xs">
                {/* TXT Verification Record */}
                <div className="p-3 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-[#3F7659] font-sans uppercase">Record 1: TXT Verification Record</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[#5A7165] font-sans">Type:</span> TXT
                    </div>
                    <div>
                      <span className="text-[#5A7165] font-sans">Name:</span> {selectedDomainForDns.verificationTxtRecord}
                    </div>
                    <div className="truncate">
                      <span className="text-[#5A7165] font-sans">Value:</span> {selectedDomainForDns.verificationToken}
                    </div>
                  </div>
                </div>

                {/* CNAME Routing Record */}
                <div className="p-3 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-[#3F7659] font-sans uppercase">Record 2: CNAME Routing Record</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[#5A7165] font-sans">Type:</span> CNAME
                    </div>
                    <div>
                      <span className="text-[#5A7165] font-sans">Name:</span> {selectedDomainForDns.domain}
                    </div>
                    <div>
                      <span className="text-[#5A7165] font-sans">Target:</span> cname.launchpad.app
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#5A7165]">
                  Verification status: <strong className="text-[#173C2D]">{selectedDomainForDns.status}</strong>
                </span>
                <button
                  onClick={() => handleVerifyDns(selectedDomainForDns)}
                  className="px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck size={14} /> Check & Verify DNS
                </button>
              </div>
            </div>
          )}

          {/* SSL / HTTPS Status Card */}
          <div className="p-6 bg-[#F3F9F5] border border-[#C5E2C8] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DDEEDF] text-emerald-800 flex items-center justify-center">
                <Lock size={18} />
              </div>
              <div>
                <div className="text-xs font-extrabold text-[#173C2D] uppercase tracking-wider flex items-center gap-2">
                  SSL / HTTPS Certificate Management
                  <span className="px-2 py-0.5 bg-[#3F7659] text-white text-[10px] rounded font-sans font-bold">
                    ARCHITECTURE-READY
                  </span>
                </div>
                <p className="text-xs text-[#5A7165] mt-0.5">
                  Automated TLS certificates via ACME / Cloudflare for SaaS Reverse Proxy integration architecture ready for production deployment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E2ECE5] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
              <h3 className="text-sm font-bold text-[#173C2D] flex items-center gap-2">
                <Globe size={16} className="text-[#3F7659]" /> Add Custom Domain
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs font-bold text-[#5A7165] hover:text-[#173C2D]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDomain} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#173C2D]">Custom Domain Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. portal.acme.com"
                  value={newDomainInput}
                  onChange={(e) => setNewDomainInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-xs font-mono font-bold text-[#173C2D]"
                />
                <p className="text-[11px] text-[#5A7165]">
                  Enter your vanity domain or subdomain without http:// or https://.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#F3F9F5] hover:bg-[#E2ECE5] text-[#173C2D] text-xs font-bold rounded-lg border border-[#E2ECE5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Generate DNS Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
