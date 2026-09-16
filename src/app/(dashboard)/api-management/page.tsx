'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Plus, Copy, Trash2, CheckCircle2, ShieldAlert, Lock, AlertCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { developerService } from '@/services/developerService';
import { APIKey } from '@/types';

export default function ApiManagementPage() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State for Key Creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [rateLimit, setRateLimit] = useState(100);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'apps:read',
    'integrations:read',
    'workflows:read',
    'analytics:read',
  ]);
  const [creating, setCreating] = useState(false);

  // Modal State for Secret Reveal (Shown ONLY ONCE upon creation)
  const [newRawSecret, setNewRawSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Modal State for Revocation
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const availableScopes = [
    { id: 'apps:read', label: 'Read Applications' },
    { id: 'apps:write', label: 'Manage Applications' },
    { id: 'integrations:read', label: 'Read Integrations' },
    { id: 'integrations:write', label: 'Manage Connectors' },
    { id: 'workflows:read', label: 'Read Workflows' },
    { id: 'workflows:execute', label: 'Execute Workflows' },
    { id: 'analytics:read', label: 'Read Telemetry & Analytics' },
  ];

  async function loadKeys() {
    setLoading(true);
    const data = await developerService.getApiKeys();
    setKeys(data);
    setLoading(false);
  }

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleScope = (scopeId: string) => {
    if (selectedScopes.includes(scopeId)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== scopeId));
    } else {
      setSelectedScopes([...selectedScopes, scopeId]);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    setCreating(true);
    try {
      const result = await developerService.createApiKey({
        name: keyName,
        scopes: selectedScopes,
        rateLimit,
      });

      setShowCreateModal(false);
      setKeyName('');
      setNewRawSecret(result.rawKeySecret);
      await loadKeys();
    } catch {
      alert('Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await developerService.revokeApiKey(id);
      setRevokingId(null);
      await loadKeys();
    } catch {
      alert('Failed to revoke key');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
            <KeyRound size={14} /> Developer Access & Security
          </div>
          <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">API Management</h1>
          <p className="text-xs text-[#5A7165]">
            Manage hashed API credentials, permission scopes, and request rate limits.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl shadow-xs transition-all w-fit"
        >
          <Plus size={16} /> Create New API Key
        </button>
      </div>

      {/* Secret Key Reveal Banner (Shown ONCE after key creation) */}
      {newRawSecret && (
        <div className="p-5 bg-emerald-50 border-2 border-emerald-500/30 rounded-2xl space-y-3 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
              <CheckCircle2 size={18} className="text-emerald-600" /> API Key Created Successfully!
            </div>
            <button
              onClick={() => setNewRawSecret(null)}
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              Done / Close
            </button>
          </div>
          <p className="text-xs text-emerald-800">
            <strong>Important:</strong> Save this API Key secret now. For security, it will <strong>never be shown again</strong>.
          </p>

          <div className="flex items-center gap-2 bg-white border border-emerald-300 rounded-xl p-2.5 font-mono text-xs text-emerald-950">
            <span className="flex-1 break-all font-bold">{newRawSecret}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newRawSecret);
                setCopiedSecret(true);
                setTimeout(() => setCopiedSecret(false), 2000);
              }}
              className="px-3 py-1.5 bg-[#3F7659] hover:bg-[#173C2D] text-white rounded-lg font-sans font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedSecret ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              {copiedSecret ? 'Copied!' : 'Copy Key'}
            </button>
          </div>
        </div>
      )}

      {/* Keys Table */}
      <div className="bg-white border border-[#E2ECE5] rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#5A7165] flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-[#3F7659]" /> Loading API credentials...
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <KeyRound size={32} className="mx-auto text-[#5A7165]" />
            <h3 className="text-sm font-bold text-[#173C2D]">No API Keys Configured</h3>
            <p className="text-xs text-[#5A7165]">Create your first API key to enable external developer & service access.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F9F5] border-b border-[#E2ECE5] text-[#173C2D] font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">Key Name</th>
                <th className="p-4">Secret Prefix</th>
                <th className="p-4">Rate Limit</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Used</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F9F5]">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-[#F3F9F5] transition-colors">
                  <td className="p-4 font-bold text-[#173C2D]">
                    {k.name}
                    <div className="text-[10px] text-[#5A7165] font-normal">ID: {k.id}</div>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-[#3F7659] font-bold">
                    {k.keyMasked}
                  </td>
                  <td className="p-4 font-semibold text-[#173C2D]">
                    <span className="px-2 py-0.5 bg-[#F3F9F5] text-[#3F7659] rounded-md font-mono text-[11px]">
                      {k.rateLimit}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        k.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {k.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-[#5A7165] font-mono text-[11px]">
                    {k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button
                      onClick={() => handleCopy(k.id, k.keyMasked)}
                      className="p-1.5 text-[#5A7165] hover:text-[#173C2D] hover:bg-[#DDEEDF] rounded transition-colors"
                      title="Copy Masked Key"
                    >
                      {copiedId === k.id ? (
                        <CheckCircle2 size={14} className="text-emerald-700" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    {k.status === 'active' && (
                      <button
                        onClick={() => setRevokingId(k.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                        title="Revoke Key"
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

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E2ECE5] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
              <h3 className="text-base font-extrabold text-[#173C2D] flex items-center gap-2">
                <KeyRound size={18} className="text-[#3F7659]" /> Create New API Key
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-xs font-bold text-[#5A7165] hover:text-[#173C2D]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#173C2D] mb-1">Key Name / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staging Integration Service"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E2ECE5] rounded-xl focus:outline-hidden focus:border-[#3F7659]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#173C2D] mb-1">
                  Rate Limit: <span className="text-[#3F7659] font-mono">{rateLimit} req/min</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(Number(e.target.value))}
                  className="w-full accent-[#3F7659]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#173C2D] mb-2">Permission Scopes</label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl">
                  {availableScopes.map((scope) => (
                    <label key={scope.id} className="flex items-center gap-2 text-xs text-[#173C2D] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(scope.id)}
                        onChange={() => handleToggleScope(scope.id)}
                        className="rounded border-[#E2ECE5] text-[#3F7659] focus:ring-0"
                      />
                      <span className="font-medium">{scope.label}</span>
                      <span className="text-[10px] font-mono text-[#5A7165] ml-auto">({scope.id})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2ECE5]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5A7165] hover:text-[#173C2D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  {creating ? 'Generating Key...' : 'Generate API Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revocation Confirmation Modal */}
      {revokingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-rose-200 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <ShieldAlert size={36} className="mx-auto text-rose-600" />
            <h3 className="text-base font-extrabold text-[#173C2D]">Revoke API Key?</h3>
            <p className="text-xs text-[#5A7165]">
              Any external developer or backend service using this API key will instantly lose access to LaunchPad OS endpoints.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setRevokingId(null)}
                className="px-4 py-2 text-xs font-bold text-[#5A7165] hover:text-[#173C2D]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevokeKey(revokingId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all"
              >
                Confirm Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
