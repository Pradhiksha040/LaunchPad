'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, Boxes, ExternalLink, Globe, RefreshCw, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { userService } from '@/services/userService';
import { Organization } from '@/types';
import { formatDate } from '@/lib/utils';

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add Organization Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgIndustry, setNewOrgIndustry] = useState('Enterprise Software & Cloud Services');
  const [newOrgDomain, setNewOrgDomain] = useState('');
  const [newOrgPlan, setNewOrgPlan] = useState('Enterprise');
  const [submitting, setSubmitting] = useState(false);

  const loadOrgs = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await userService.getOrganizations();
      setOrgs(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch organizations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const created = await userService.createOrganization({
        name: newOrgName.trim(),
        industry: newOrgIndustry.trim() || undefined,
        domain: newOrgDomain.trim() || undefined,
        plan: newOrgPlan,
      });

      setSuccessMsg(`Organization '${created.name}' created successfully.`);
      setShowAddModal(false);
      setNewOrgName('');
      setNewOrgDomain('');
      await loadOrgs();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create organization. Check permissions.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
            <Building2 size={14} /> Multi-Tenant Workspace
          </div>
          <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Organizations & Tenants</h1>
          <p className="text-xs text-[#5A7165]">Manage customer organization tenants, domain names, and plans.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl shadow-xs transition-all w-fit"
        >
          <Plus size={16} /> Add Organization
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-[#5A7165] bg-white border border-[#E2ECE5] rounded-2xl shadow-xs">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#3F7659]" />
          <p className="text-xs font-semibold">Loading organization tenants...</p>
        </div>
      ) : orgs.length === 0 ? (
        <div className="p-12 text-center text-[#5A7165] bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-3">
          <Building2 size={32} className="mx-auto text-[#5A7165]" />
          <h3 className="font-bold text-[#173C2D]">No Organizations Found</h3>
          <p className="text-xs">Create your first tenant organization to begin provisioning isolated customer workspaces.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#3F7659] text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Create Organization
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {orgs.map((org) => (
            <div key={org.id} className="p-6 bg-white border border-[#E2ECE5] hover:border-[#3F7659] rounded-2xl shadow-xs transition-all space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#5A7165] uppercase">{org.industry}</span>
                  <h3 className="text-base font-bold text-[#173C2D] mt-0.5">{org.name}</h3>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-extrabold bg-[#DDEEDF] text-[#173C2D] rounded-full">
                  {org.plan}
                </span>
              </div>

              <div className="p-3 bg-[#F3F9F5] rounded-xl border border-[#E2ECE5] text-xs font-mono text-[#3F7659] flex items-center gap-1.5">
                <Globe size={14} /> {org.domain || (org.slug ? `${org.slug}.launchpad.app` : 'launchpad.app')}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-2.5 bg-[#F3F9F5] rounded-lg">
                  <span className="text-[#5A7165]">Applications</span>
                  <div className="text-base font-bold text-[#173C2D] mt-0.5">{org.applicationsCount ?? 1}</div>
                </div>
                <div className="p-2.5 bg-[#F3F9F5] rounded-lg">
                  <span className="text-[#5A7165]">Total Users</span>
                  <div className="text-base font-bold text-[#173C2D] mt-0.5">{org.usersCount ?? 1}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Organization Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2ECE5] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE5]">
              <div className="flex items-center gap-2 font-bold text-[#173C2D] text-sm">
                <Building2 size={16} className="text-[#3F7659]" /> Create Organization Tenant
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#5A7165] hover:text-[#173C2D]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#173C2D] block mb-1">Organization Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Dynamics Ltd"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] focus:outline-none focus:border-[#3F7659]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#173C2D] block mb-1">Industry Sector</label>
                <input
                  type="text"
                  placeholder="e.g. Financial Services & FinTech"
                  value={newOrgIndustry}
                  onChange={(e) => setNewOrgIndustry(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] focus:outline-none focus:border-[#3F7659]"
                />
              </div>

              <div>
                <label className="font-bold text-[#173C2D] block mb-1">Custom Domain Name</label>
                <input
                  type="text"
                  placeholder="e.g. apexdynamics.io"
                  value={newOrgDomain}
                  onChange={(e) => setNewOrgDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] focus:outline-none focus:border-[#3F7659]"
                />
              </div>

              <div>
                <label className="font-bold text-[#173C2D] block mb-1">Subscription Plan</label>
                <select
                  value={newOrgPlan}
                  onChange={(e) => setNewOrgPlan(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] font-bold focus:outline-none focus:border-[#3F7659]"
                >
                  <option value="Starter">Starter</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#E2ECE5] rounded-xl text-[#5A7165] hover:bg-[#F3F9F5] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newOrgName.trim()}
                  className="px-5 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
