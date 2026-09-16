'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GitFork,
  Zap,
  Play,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Pause,
  Trash2,
  RefreshCw,
  Search,
  ChevronRight,
  Activity,
  Layers
} from 'lucide-react';
import { workflowService } from '@/services/workflowService';
import { Workflow } from '@/types';
import { cn, formatDate } from '@/lib/utils';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [runningWfId, setRunningWfId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await workflowService.getWorkflows();
    setWorkflows(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActivate = async (wf: Workflow) => {
    if (wf.status === 'active') {
      await workflowService.pauseWorkflow(wf.id);
    } else {
      await workflowService.activateWorkflow(wf.id);
    }
    await loadData();
  };

  const handleRunNow = async (wfId: string) => {
    setRunningWfId(wfId);
    try {
      const res = await workflowService.runWorkflow(wfId);
      alert(`Workflow Run Triggered!\nExecution Status: ${res.status.toUpperCase()}`);
    } catch (e: any) {
      alert(`Execution Error: ${e.message}`);
    }
    setRunningWfId(null);
    await loadData();
  };

  const handleDelete = async (wfId: string, name: string) => {
    if (confirm(`Are you sure you want to delete workflow '${name}'?`)) {
      await workflowService.deleteWorkflow(wfId);
      await loadData();
    }
  };

  const filteredWorkflows = workflows.filter((wf) =>
    wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (wf.applicationName && wf.applicationName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-[#173C2D] via-[#1F4A39] to-[#3F7659] text-white rounded-2xl shadow-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#DDEEDF]">
              <GitFork size={14} /> Application Automation Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Workflow Engine</h1>
            <p className="text-xs md:text-sm text-[#DDEEDF] max-w-2xl leading-relaxed">
              Design automated event triggers, condition evaluation, and action execution pipelines across your LaunchPad applications.
            </p>
          </div>

          <Link
            href="/workflows/create"
            className="flex items-center gap-2 px-5 py-3 bg-white text-[#173C2D] hover:bg-[#DDEEDF] text-xs font-extrabold rounded-xl shadow-md transition-all shrink-0 w-fit"
          >
            <Plus size={16} /> Create Workflow
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A7165]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workflows by name or application..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E2ECE5] rounded-xl text-[#173C2D] focus:outline-none focus:border-[#3F7659]"
          />
        </div>

        <div className="text-xs font-bold text-[#5A7165]">
          Total Workflows: <span className="text-[#173C2D]">{workflows.length}</span>
        </div>
      </div>

      {/* Workflow Directory Grid */}
      {loading ? (
        <div className="p-12 text-center text-[#5A7165]">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#3F7659]" />
          Loading workflows...
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-[#E2ECE5] rounded-2xl space-y-3">
          <GitFork size={36} className="mx-auto text-[#5A7165]" />
          <h3 className="text-sm font-bold text-[#173C2D]">No workflows found</h3>
          <p className="text-xs text-[#5A7165]">Create a workflow to automate event triggers and Integration Hub actions.</p>
          <Link
            href="/workflows/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3F7659] text-white text-xs font-bold rounded-xl"
          >
            <Plus size={14} /> Create First Workflow
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkflows.map((wf) => (
            <div
              key={wf.id}
              className="p-5 bg-white border border-[#E2ECE5] hover:border-[#3F7659] rounded-2xl shadow-xs transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      'px-2.5 py-0.5 text-[10px] font-extrabold rounded-full flex items-center gap-1',
                      wf.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : wf.status === 'paused'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {wf.status === 'active' ? <CheckCircle2 size={10} /> : <Pause size={10} />}
                    {wf.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-[#5A7165] bg-[#F3F9F5] px-2 py-0.5 rounded border border-[#E2ECE5]">
                    {wf.triggerType}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-[#173C2D]">{wf.name}</h3>
                  <p className="text-xs text-[#5A7165] mt-1 line-clamp-2 leading-relaxed">
                    {wf.description || 'Application automation pipeline'}
                  </p>
                </div>

                <div className="p-3 bg-[#F3F9F5] rounded-xl border border-[#E2ECE5] text-xs space-y-1">
                  <div className="flex justify-between text-[#173C2D]">
                    <span className="text-[#5A7165]">Application:</span>
                    <span className="font-bold">{wf.applicationName}</span>
                  </div>
                  <div className="flex justify-between text-[#173C2D]">
                    <span className="text-[#5A7165]">Trigger Event:</span>
                    <span className="font-mono text-[#3F7659] font-bold">{wf.trigger?.eventName || 'visitor.approved'}</span>
                  </div>
                  <div className="flex justify-between text-[#173C2D]">
                    <span className="text-[#5A7165]">Actions Configured:</span>
                    <span className="font-bold">{wf.actions?.length || 0} Actions</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#E2ECE5] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunNow(wf.id)}
                    disabled={runningWfId === wf.id}
                    className="px-3 py-1.5 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold rounded-lg transition-all flex items-center gap-1 shadow-2xs"
                  >
                    {runningWfId === wf.id ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Play size={12} />
                    )}
                    Run Now
                  </button>

                  <button
                    onClick={() => handleToggleActivate(wf)}
                    className="px-2.5 py-1.5 hover:bg-[#F3F9F5] text-[#5A7165] hover:text-[#173C2D] font-semibold rounded-lg transition-all"
                  >
                    {wf.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                </div>

                <Link
                  href={`/workflows/${wf.id}`}
                  className="text-[#3F7659] font-bold hover:underline flex items-center gap-0.5"
                >
                  Details <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
