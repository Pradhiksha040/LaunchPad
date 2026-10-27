'use client';

import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Check, Search, Building2, UserPlus, Lock, RefreshCw, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { userService } from '@/services/userService';
import { User, Role } from '@/types';
import { cn, formatDate } from '@/lib/utils';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'matrix'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Invite User Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('DEVELOPER');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [uData, rData] = await Promise.all([userService.getUsers(), userService.getRoles()]);
      setUsers(uData);
      setRoles(rData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load users and roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim() || !newUserName.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const created = await userService.createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        role: newUserRole,
      });

      setSuccessMsg(`User '${created.name}' (${created.email}) invited successfully with role ${created.role}.`);
      setShowInviteModal(false);
      setNewUserName('');
      setNewUserEmail('');
      await loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to invite user.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.organization && u.organization.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

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

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl shadow-xs transition-all w-fit"
        >
          <UserPlus size={16} /> Invite User
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

      {loading ? (
        <div className="p-12 text-center text-[#5A7165] bg-white border border-[#E2ECE5] rounded-2xl shadow-xs">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#3F7659]" />
          <p className="text-xs font-semibold">Loading users and access control records...</p>
        </div>
      ) : (
        <>
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white border border-[#E2ECE5] rounded-2xl overflow-hidden shadow-xs space-y-4">
              <div className="p-4 border-b border-[#E2ECE5] flex items-center justify-between">
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7165]" size={14} />
                  <input
                    type="text"
                    placeholder="Search user by name, email, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-[#173C2D]"
                  />
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-[#5A7165] text-xs">
                  No users match your query &quot;{searchQuery}&quot;.
                </div>
              ) : (
                <div className="overflow-x-auto">
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
                      {filteredUsers.map((u) => (
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
            </div>
          )}

          {/* Roles Catalog Tab */}
          {activeTab === 'roles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((r) => (
                <div key={r.id} className="p-5 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2 bg-[#F3F9F5] text-[#3F7659] rounded-xl font-bold">
                      <Shield size={18} />
                    </span>
                    <span className="text-[10px] font-bold uppercase text-[#5A7165]">{r.userCount ?? 1} Users</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#173C2D]">{r.name}</h4>
                    <p className="text-xs text-[#5A7165] mt-1 leading-relaxed">{r.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#F3F9F5]">
                    {(Array.isArray(r.permissions) ? r.permissions : Object.keys(r.permissions || {})).slice(0, 4).map((p, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-[#F3F9F5] border border-[#E2ECE5] text-[10px] text-[#173C2D] rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
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
                        const hasAccess = r.name === 'Super Admin' || r.name === 'Organization Admin' || (r.name === 'Developer' && mod !== 'Billing');
                        return (
                          <td key={r.id} className="p-3 text-center">
                            {hasAccess ? (
                              <Check size={16} className="mx-auto text-emerald-600" />
                            ) : (
                              <span className="text-gray-300 font-bold">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2ECE5] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE5]">
              <div className="flex items-center gap-2 font-bold text-[#173C2D] text-sm">
                <UserPlus size={16} className="text-[#3F7659]" /> Invite New User
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-[#5A7165] hover:text-[#173C2D]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#173C2D] block mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Miller"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] focus:outline-none focus:border-[#3F7659]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#173C2D] block mb-1">Work Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. jordan@techsolutions.io"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] focus:outline-none focus:border-[#3F7659]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#173C2D] block mb-1">Assigned Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] font-bold focus:outline-none focus:border-[#3F7659]"
                >
                  <option value="DEVELOPER">Developer (App creation, integrations, workflows)</option>
                  <option value="USER">Standard User (App usage)</option>
                  <option value="VIEWER">Viewer (Read-only access)</option>
                  <option value="ORG_ADMIN">Organization Admin (Full tenant management)</option>
                </select>
              </div>

              <div className="p-3 bg-[#F3F9F5] rounded-xl border border-[#DDEEDF] text-[11px] text-[#5A7165]">
                Default temporary password: <code className="font-mono text-[#3F7659] font-bold">DemoPass123!</code>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-[#E2ECE5] rounded-xl text-[#5A7165] hover:bg-[#F3F9F5] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newUserName.trim() || !newUserEmail.trim()}
                  className="px-5 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Inviting...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
