'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Eye,
  Check,
  X,
  Building2,
  Box,
  Layers,
  FileCode2,
  Lock,
  ExternalLink,
  Shield,
  Activity,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface SecurityFinding {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  findingType: string;
  description: string;
  location?: string;
  resolved: boolean;
  createdAt: string;
}

interface PendingAsset {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  type: string;
  version: string;
  authorName: string;
  publisherId: string;
  publisher?: {
    id: string;
    name: string;
    isPublisher: boolean;
    publisherStatus?: string;
  };
  iconUrl?: string;
  tags: string[];
  pricingType: string;
  price: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
  scanStatus: 'SCAN_PENDING' | 'SCAN_PASSED' | 'WARNINGS_FOUND' | 'SCAN_FAILED' | 'MANUAL_REVIEW';
  scannedAt?: string;
  requiredModules: string[];
  configuration?: any;
  changelog?: string;
  rejectionReason?: string;
  createdAt: string;
}

export default function MarketplaceReviewDashboard() {
  const [pendingAssets, setPendingAssets] = useState<PendingAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<PendingAsset | null>(null);
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const fetchPending = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/marketplace/review/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingAssets(data);
        if (data.length > 0 && !selectedAsset) {
          setSelectedAsset(data[0]);
          fetchFindings(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load pending marketplace reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFindings = async (assetId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/marketplace/assets/${assetId}/findings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFindings(data);
      }
    } catch (err) {
      console.error('Failed to load findings:', err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleSelectAsset = (asset: PendingAsset) => {
    setSelectedAsset(asset);
    fetchFindings(asset.id);
  };

  const handleRunScan = async (assetId: string) => {
    setScanningId(assetId);
    setActionStatus('Running automated security scan...');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/marketplace/assets/${assetId}/scan`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const scanRes = await res.json();
        setActionStatus(`Scan finished: ${scanRes.scanStatus}`);
        fetchPending();
        if (selectedAsset && selectedAsset.id === assetId) {
          fetchFindings(assetId);
        }
      }
    } catch (err) {
      setActionStatus('Security scan error');
    } finally {
      setScanningId(null);
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  const handleApprove = async () => {
    if (!selectedAsset) return;
    setActionStatus('Approving asset publication...');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/marketplace/assets/${selectedAsset.id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setActionStatus('Asset Approved successfully!');
        fetchPending();
        setSelectedAsset(null);
      } else {
        const errData = await res.json();
        setActionStatus(`Approval failed: ${errData.message}`);
      }
    } catch (err) {
      setActionStatus('Failed to approve asset');
    } finally {
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  const handleReject = async () => {
    if (!selectedAsset || !rejectionReason) return;
    setActionStatus('Rejecting asset...');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/marketplace/assets/${selectedAsset.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      if (res.ok) {
        setActionStatus('Asset Rejected with feedback.');
        setShowRejectModal(false);
        setRejectionReason('');
        fetchPending();
        setSelectedAsset(null);
      }
    } catch (err) {
      setActionStatus('Failed to reject asset');
    } finally {
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  const getScanBadge = (status: string) => {
    switch (status) {
      case 'SCAN_PASSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 size={13} className="text-emerald-600" /> SCAN PASSED
          </span>
        );
      case 'WARNINGS_FOUND':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle size={13} className="text-amber-600" /> WARNINGS FOUND
          </span>
        );
      case 'SCAN_FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <ShieldX size={13} className="text-red-600" /> SCAN FAILED (BLOCKED)
          </span>
        );
      case 'MANUAL_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <Eye size={13} className="text-purple-600" /> MANUAL REVIEW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Clock size={13} className="text-slate-500" /> SCAN PENDING
          </span>
        );
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-orange-500 text-white uppercase">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-white uppercase">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500 text-white uppercase">LOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-400 text-white uppercase">INFO</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
            <ShieldCheck size={14} /> Security & Governance / Marketplace
          </div>
          <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Marketplace Security Review Dashboard</h1>
          <p className="text-xs text-[#5A7165]">
            SuperAdmin review queue, static security validation results, and publisher verification controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {actionStatus && (
            <span className="px-3 py-1.5 text-xs font-bold text-[#173C2D] bg-[#E2ECE5] rounded-xl border border-[#3F7659]/20">
              {actionStatus}
            </span>
          )}
          <button
            onClick={fetchPending}
            className="px-3 py-2 bg-white border border-[#E2ECE5] hover:bg-[#F3F9F5] text-[#173C2D] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List: Pending Assets */}
        <div className="lg:col-span-4 bg-white border border-[#E2ECE5] rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
            <div className="flex items-center gap-2 text-[#173C2D] font-bold text-sm">
              <Clock size={16} className="text-[#3F7659]" /> Pending Submissions ({pendingAssets.length})
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#5A7165] flex flex-col items-center gap-2">
              <RefreshCw size={20} className="animate-spin text-[#3F7659]" /> Loading review queue...
            </div>
          ) : pendingAssets.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#5A7165] space-y-2">
              <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
              <p className="font-bold">No pending submissions</p>
              <p className="text-[11px]">All marketplace submissions have been reviewed or processed.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {pendingAssets.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id;
                return (
                  <button
                    key={asset.id}
                    onClick={() => handleSelectAsset(asset)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all space-y-2 ${
                      isSelected
                        ? 'border-[#3F7659] bg-[#F3F9F5] ring-2 ring-[#3F7659]/20'
                        : 'border-[#E2ECE5] bg-white hover:border-[#3F7659]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-[#173C2D] line-clamp-1">{asset.name}</div>
                        <div className="text-[11px] text-[#5A7165] flex items-center gap-1.5 mt-0.5">
                          <Building2 size={11} /> {asset.authorName} • v{asset.version}
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {asset.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {getScanBadge(asset.scanStatus)}
                      <span className="text-[11px] text-[#3F7659] font-bold flex items-center gap-0.5">
                        Inspect <ChevronRight size={12} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Details & Security Findings */}
        <div className="lg:col-span-8 space-y-6">
          {selectedAsset ? (
            <>
              {/* Asset Header Card */}
              <div className="bg-white border border-[#E2ECE5] rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2ECE5] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-[#173C2D]">{selectedAsset.name}</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E2ECE5] text-[#173C2D]">
                        v{selectedAsset.version}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A7165] mt-1">{selectedAsset.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunScan(selectedAsset.id)}
                      disabled={scanningId === selectedAsset.id}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <RefreshCw size={13} className={scanningId === selectedAsset.id ? 'animate-spin' : ''} />
                      Re-run Security Scan
                    </button>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-[#F8FAFC] rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Publisher</div>
                    <div className="font-extrabold text-[#173C2D] flex items-center gap-1">
                      <Building2 size={13} className="text-[#3F7659]" /> {selectedAsset.authorName}
                    </div>
                  </div>
                  <div className="p-3 bg-[#F8FAFC] rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Category & Type</div>
                    <div className="font-extrabold text-[#173C2D]">{selectedAsset.category} • {selectedAsset.type}</div>
                  </div>
                  <div className="p-3 bg-[#F8FAFC] rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Security Status</div>
                    <div>{getScanBadge(selectedAsset.scanStatus)}</div>
                  </div>
                  <div className="p-3 bg-[#F8FAFC] rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Required Modules</div>
                    <div className="font-extrabold text-[#173C2D]">{selectedAsset.requiredModules?.length || 0} Modules</div>
                  </div>
                </div>

                {/* Required Modules & Config */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#173C2D] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-[#3F7659]" /> Declarative Required Capabilities
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedAsset.requiredModules?.map((mod, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-[#F3F9F5] text-[#173C2D] rounded-lg border border-[#E2ECE5] text-xs font-semibold">
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Security Action Bar */}
                <div className="pt-4 border-t border-[#E2ECE5] flex items-center justify-between">
                  <div className="text-xs text-[#5A7165]">
                    {selectedAsset.scanStatus === 'SCAN_FAILED' ? (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <ShieldX size={14} /> Critical findings detected — Approval is blocked by gate.
                      </span>
                    ) : (
                      <span>Asset passed minimum static security criteria. Ready for SuperAdmin verdict.</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <XCircle size={14} /> Reject Asset
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={selectedAsset.scanStatus === 'SCAN_FAILED'}
                      className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        selectedAsset.scanStatus === 'SCAN_FAILED'
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-[#173C2D] hover:bg-[#3F7659] text-white shadow-xs'
                      }`}
                    >
                      <CheckCircle2 size={14} /> Approve & Publish
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Findings Detail Table */}
              <div className="bg-white border border-[#E2ECE5] rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
                  <div className="flex items-center gap-2 text-[#173C2D] font-bold text-sm">
                    <ShieldAlert size={16} className="text-[#3F7659]" /> Automated Security Inspection Report ({findings.length} findings)
                  </div>
                  <span className="text-xs font-bold text-[#5A7165]">Static & Heuristic Scanner v1.0</span>
                </div>

                {findings.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#5A7165] space-y-1">
                    <ShieldCheck size={28} className="mx-auto text-emerald-500" />
                    <p className="font-bold text-[#173C2D]">No Security Vulnerabilities Detected</p>
                    <p className="text-[11px]">No hardcoded secrets, unsafe URLs, or dangerous code patterns were flagged.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {findings.map((f) => (
                      <div key={f.id} className="p-4 rounded-xl border border-[#E2ECE5] bg-[#F8FAFC] space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {getSeverityBadge(f.severity)}
                            <span className="font-bold text-xs text-[#173C2D]">{f.findingType}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{new Date(f.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-mono">{f.description}</p>
                        {f.location && (
                          <div className="text-[11px] text-[#3F7659] font-mono bg-white px-2.5 py-1 rounded border border-[#E2ECE5]">
                            Reference: {f.location}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-[#E2ECE5] rounded-2xl p-12 text-center text-xs text-[#5A7165] space-y-3 shadow-xs">
              <Box size={32} className="mx-auto text-slate-300" />
              <p className="font-bold text-sm text-[#173C2D]">Select an Asset to Inspect</p>
              <p className="max-w-md mx-auto">
                Choose a pending submission from the left queue to review its automated security findings, static scanner reports, and publisher information.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E2ECE5]">
            <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
              <h3 className="text-base font-extrabold text-[#173C2D]">Reject Marketplace Asset</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[#5A7165]">
              Provide constructive rejection feedback for <strong>{selectedAsset?.name}</strong>. The publisher will receive this in their audit log and version details.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Hardcoded credentials found in workflow configuration or missing required module mappings."
              rows={4}
              className="w-full text-xs p-3 rounded-xl border border-[#E2ECE5] focus:outline-none focus:ring-2 focus:ring-[#3F7659]"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-300 rounded-xl shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
