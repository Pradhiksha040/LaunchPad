'use client';

import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Check, Search, Building2, UserPlus, Lock } from 'lucide-react';
import { userService } from '@/services/userService';
import { User, Role } from '@/types';
import { cn, formatDate } from '@/lib/utils';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'matrix'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      const [uData, rData] = await Promise.all([userService.getUsers(), userService.getRoles()]);
      setUsers(uData);
      setRoles(rData);
    }
    loadData();
  }, []);

  const permissionsModules = ['Applications', 'Integrations', 'Users', 'Billing', 'Security'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
            <Users size={14} /> Identity & Access Management
          </div>
          <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Users & Role Permissions</h1>
          <p className="text-xs text-[#5A7165]">Manage platform users, organization memberships, and RBAC matrix.</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl shadow-xs transition-all w-fit">
          <UserPlus size={16} /> Invite User
        </button>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-[#E2ECE5] overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={cn(
            'px-4 py-2.5 text-xs font-bold border-b-2 transition-all',
            activeTab === 'users' ? 'border-[#3F7659] text-[#3F7659]' : 'border-transparent text-[#5A7165]'
          )}
        >
          Active Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={cn(
            'px-4 py-2.5 text-xs font-bold border-b-2 transition-all',
            activeTab === 'roles' ? 'border-[#3F7659] text-[#3F7659]' : 'border-transparent text-[#5A7165]'
          )}
        >
          Roles Catalog ({roles.length})
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={cn(
            'px-4 py-2.5 text-xs font-bold border-b-2 transition-all',
            activeTab === 'matrix' ? 'border-[#3F7659] text-[#3F7659]' : 'border-transparent text-[#5A7165]'
          )}
        >
          Permission Matrix
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white border border-[#E2ECE5] rounded-2xl overflow-hidden shadow-xs space-y-4">
          <div className="p-4 border-b border-[#E2ECE5] flex items-center justify-between">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7165]" size={14} />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-[#173C2D]"
              />
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F9F5] border-b border-[#E2ECE5] text-[#173C2D] font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Organization</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F9F5]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#F3F9F5] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#173C2D]">{u.name}</div>
                    <div className="text-[11px] text-[#5A7165]">{u.email}</div>
                  </td>
                  <td className="p-4 font-medium text-[#173C2D]">{u.organization}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#DDEEDF] text-[#173C2D] rounded-md">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn('px-2.5 py-0.5 text-[10px] font-bold rounded-full capitalize', u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700')}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono text-[11px] text-[#5A7165]">
                    {formatDate(u.lastLogin)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Permission Matrix Tab */}
      {activeTab === 'matrix' && (
        <div className="bg-white border border-[#E2ECE5] rounded-2xl overflow-x-auto shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#173C2D]">Role-Based Access Control (RBAC) Permission Matrix</h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F3F9F5] border-b border-[#E2ECE5] text-[#173C2D] font-bold text-[11px]">
              <tr>
                <th className="p-3">Module Resource</th>
                {roles.map((r) => (
                  <th key={r.id} className="p-3 text-center">{r.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F9F5]">
              {permissionsModules.map((mod) => (
                <tr key={mod} className="hover:bg-[#F3F9F5]">
                  <td className="p-3 font-bold text-[#173C2D]">{mod}</td>
                  {roles.map((r) => {
                    const perms = r.permissions[mod] || [];
                    return (
                      <td key={r.id} className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {perms.length > 0 ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#DDEEDF] text-[#173C2D] rounded">
                              {perms.join(', ')}
                            </span>
                          ) : (
                            <span className="text-gray-300 font-bold">—</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
