'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  GitFork,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Pause,
  RefreshCw,
  ArrowDown,
  Terminal,
  ShieldCheck,
  Bell,
  Network,
  FileCode,
  ArrowLeft
} from 'lucide-react';
import { workflowService } from '@/services/workflowService';
import { Workflow, WorkflowExecution } from '@/types';
import { cn, formatDate } from '@/lib/utils';

export default function WorkflowDetailPage() {
  const params = useParams();
  const wfId = (params?.id as string) || '';

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [testResult, setTestResult] = useState<WorkflowExecution | null>(null);

  const loadWorkflowData = async () => {
    if (!wfId) return;
    setLoading(true);
    const [wf, execs] = await Promise.all([
      workflowService.getWorkflowById(wfId),
      workflowService.getExecutions(wfId),
    ]);
    if (wf) setWorkflow(wf);
    if (Array.isArray(execs)) setExecutions(execs);
    setLoading(false);
  };

  useEffect(() => {
    loadWorkflowData();
  }, [wfId]);

  const handleRunNow = async (isTest = false) => {
    if (!workflow) return;
    setRunning(true);
    setTestResult(null);

    try {
      const res = isTest
        ? await workflowService.testWorkflow(workflow.id)
        : await workflowService.runWorkflow(workflow.id);
      setTestResult(res);
      await loadWorkflowData();
    } catch (e: any) {
      alert(`Workflow execution error: ${e.message}`);
    }
    setRunning(false);
  };

  const handleToggleActivate = async () => {
    if (!workflow) return;
    if (workflow.status === 'active') {
      await workflowService.pauseWorkflow(workflow.id);
    } else {
      await workflowService.activateWorkflow(workflow.id);
    }
    await loadWorkflowData();
  };

  if (loading && !workflow) {
    return (
      <div className="p-12 text-center text-[#5A7165]">
        <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#3F7659]" />
        Loading workflow details...
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="p-12 text-center text-[#5A7165] space-y-3">
        <AlertTriangle size={32} className="mx-auto text-amber-600" />
        <h3 className="text-base font-bold text-[#173C2D]">Workflow Not Found</h3>
        <Link href="/workflows" className="text-xs font-bold text-[#3F7659] underline">
          Return to Workflows Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header Banner */}
      <div className="p-6 md:p-8 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Link
              href="/workflows"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#3F7659] hover:underline mb-1"
            >
              <ArrowLeft size={13} /> Back to Workflows
            </Link>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'px-2.5 py-0.5 text-[10px] font-extrabold rounded-full flex items-center gap-1',
                  workflow.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                )}
              >
                {workflow.status === 'active' ? <CheckCircle2 size={10} /> : <Pause size={10} />}
                {workflow.status.toUpperCase()}
              </span>
              <span className="text-xs text-[#5A7165]">• Application: <strong>{workflow.applicationName}</strong></span>
            </div>
            <h1 className="text-2xl font-black text-[#173C2D]">{workflow.name}</h1>
            <p className="text-xs text-[#5A7165] max-w-2xl">{workflow.description}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleToggleActivate}
              className="px-4 py-2.5 bg-[#F3F9F5] hover:bg-[#DDEEDF] text-[#173C2D] font-bold text-xs rounded-xl transition-all"
            >
              {workflow.status === 'active' ? 'Pause Pipeline' : 'Activate Pipeline'}
            </button>

            <button
              onClick={() => handleRunNow(true)}
              disabled={running}
              className="px-4 py-2.5 bg-[#F3F9F5] border border-[#E2ECE5] hover:border-[#3F7659] text-[#173C2D] font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Zap size={14} className="text-[#3F7659]" /> Run Test
            </button>

            <button
              onClick={() => handleRunNow(false)}
              disabled={running}
              className="px-5 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              {running ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
              {running ? 'Executing...' : 'Run Pipeline'}
            </button>
          </div>
        </div>
      </div>

      {/* Test Execution Result Toast Banner */}
      {testResult && (
        <div
          className={cn(
            'p-5 rounded-2xl border text-xs space-y-2 animate-in fade-in',
            testResult.status === 'success'
              ? 'bg-[#DDEEDF] border-[#C5E2C8] text-[#173C2D]'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          )}
        >
          <div className="font-extrabold text-sm flex items-center gap-2">
            {testResult.status === 'success' ? <CheckCircle2 size={18} className="text-emerald-800" /> : <AlertTriangle size={18} />}
            Pipeline Execution {testResult.status.toUpperCase()} (Retries: {testResult.retryCount})
          </div>
          <div className="text-xs">
            {testResult.error || 'All workflow action steps completed successfully.'}
          </div>
        </div>
      )}

      {/* Grid Layout: Visual Blueprint vs History */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Visual Workflow Pipeline Blueprint */}
        <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-6">
          <h3 className="text-sm font-extrabold text-[#173C2D] border-b border-[#E2ECE5] pb-3">
            Workflow Architecture Blueprint
          </h3>

          <div className="space-y-4 text-center">
            {/* Trigger Node */}
            <div className="p-4 bg-[#F3F9F5] border border-[#3F7659] rounded-xl space-y-1">
              <span className="px-2 py-0.5 text-[9px] font-extrabold bg-[#3F7659] text-white rounded">
                TRIGGER: {workflow.triggerType}
              </span>
              <h4 className="text-xs font-bold text-[#173C2D] mt-1">
                {workflow.trigger?.eventName || 'visitor.approved'}
              </h4>
            </div>

            <div className="text-[#3F7659] flex justify-center">
              <ArrowDown size={18} className="animate-bounce" />
            </div>

            {/* Conditions Node */}
            <div className="p-4 bg-white border border-[#E2ECE5] rounded-xl space-y-1 text-left">
              <span className="px-2 py-0.5 text-[9px] font-extrabold bg-[#DDEEDF] text-[#173C2D] rounded">
                CONDITIONS ({workflow.conditions.length})
              </span>
              <div className="pt-2 space-y-1 font-mono text-[11px] text-[#5A7165]">
                {workflow.conditions.map((c, i) => (
                  <div key={i}>
                    IF <strong className="text-[#173C2D]">{c.field}</strong> {c.operator} {c.value || ''}
                  </div>
                ))}
                {workflow.conditions.length === 0 && <div>Unconditional Pass</div>}
              </div>
            </div>

            <div className="text-[#3F7659] flex justify-center">
              <ArrowDown size={18} className="animate-bounce" />
            </div>

            {/* Actions Pipeline Nodes */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-[#5A7165]">Action Execution Chain</span>
              {workflow.actions.map((act, i) => (
                <div key={i} className="p-3 bg-[#173C2D] text-white rounded-xl text-xs font-bold shadow-xs text-left flex items-center justify-between">
                  <span>▶ {i + 1}. {act.type}</span>
                  <span className="text-[10px] text-[#DDEEDF]">Order {act.order || i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Execution Telemetry Logs */}
        <div className="md:col-span-2 p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
            <h3 className="text-sm font-extrabold text-[#173C2D] flex items-center gap-2">
              <Terminal size={16} className="text-[#3F7659]" /> Execution History Telemetry Logs
            </h3>
            <span className="text-xs text-[#5A7165]">{executions.length} Executions Logged</span>
          </div>

          <div className="space-y-3">
            {executions.map((exec) => (
              <div key={exec.id} className="p-4 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2.5 py-0.5 text-[10px] font-extrabold rounded-full',
                        exec.status === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      )}
                    >
                      {exec.status.toUpperCase()}
                    </span>
                    {exec.isTest && (
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-purple-100 text-purple-800 rounded">
                        TEST RUN
                      </span>
                    )}
                    <span className="font-mono text-[#5A7165] text-[11px]">{formatDate(exec.startedAt)}</span>
                  </div>

                  <span className="text-[11px] font-semibold text-[#5A7165]">
                    Retries: <strong>{exec.retryCount}</strong>
                  </span>
                </div>

                {/* Steps List */}
                {exec.steps && exec.steps.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[#E2ECE5]">
                    {exec.steps.map((st) => (
                      <div key={st.id} className="flex items-center justify-between text-[11px] bg-white px-3 py-1.5 rounded border border-[#E2ECE5]">
                        <span className="font-bold text-[#173C2D] flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-700" /> {st.actionType}
                        </span>
                        <span className="font-mono text-[10px] text-[#5A7165]">{st.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {executions.length === 0 && (
              <div className="p-8 text-center text-[#5A7165] text-xs">
                No executions recorded yet. Click <strong>Run Pipeline</strong> to trigger an execution.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
