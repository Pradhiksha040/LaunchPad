'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, Boxes, ExternalLink, Globe } from 'lucide-react';
import { userService } from '@/services/userService';
import { Organization } from '@/types';
import { formatDate } from '@/lib/utils';

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);

  useEffect(() => {
    async function loadOrgs() {
      const data = await userService.getOrganizations();
      setOrgs(data);
    }
    loadOrgs();
  }, []);

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

        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl shadow-xs transition-all w-fit">
          <Plus size={16} /> Add Organization
        </button>
      </div>

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
              <Globe size={14} /> {org.domain}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              <div className="p-2.5 bg-[#F3F9F5] rounded-lg">
                <span className="text-[#5A7165]">Applications</span>
                <div className="text-base font-bold text-[#173C2D] mt-0.5">{org.applicationsCount}</div>
              </div>
              <div className="p-2.5 bg-[#F3F9F5] rounded-lg">
                <span className="text-[#5A7165]">Total Users</span>
                <div className="text-base font-bold text-[#173C2D] mt-0.5">{org.usersCount}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
