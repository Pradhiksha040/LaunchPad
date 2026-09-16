'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GitFork,
  Zap,
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Bell,
  FileCode,
  Network,
  ShieldCheck,
  FileText,
  Boxes,
  ArrowDown,
  Layers,
  Sparkles,
  Play
} from 'lucide-react';
import { workflowService } from '@/services/workflowService';
import { applicationService } from '@/services/applicationService';
import { Application, WorkflowCondition, WorkflowAction } from '@/types';
import { cn } from '@/lib/utils';

export default function CreateWorkflowWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [applications, setApplications] = useState<Application[]>([]);

  // Step 1: Basic Information State
  const [name, setName] = useState('Visitor Approval Workflow');
  const [description, setDescription] = useState('Automated visitor check-in notification, QR generation, and CRM sync pipeline.');
  const [applicationId, setApplicationId] = useState('app-vms-01');

  // Step 2: Trigger State
  const [triggerType, setTriggerType] = useState<'EVENT' | 'SCHEDULE' | 'WEBHOOK' | 'MANUAL'>('EVENT');
  const [eventName, setEventName] = useState('visitor.approved');

  // Step 3: Conditions State
  const [conditions, setConditions] = useState<WorkflowCondition[]>([
    { field: 'type', operator: 'EXISTS', value: '', logicalOperator: 'AND', order: 1 },
  ]);

  // Step 4: Actions State
  const [actions, setActions] = useState<WorkflowAction[]>([
    {
      type: 'SEND_NOTIFICATION',
      configuration: { recipient: 'host@company.com', message: 'Visitor check-in approved' },
      order: 1,
      enabled: true,
    },
    {
      type: 'GENERATE_FILE',
      configuration: { fileType: 'QR_CODE_PASS' },
      order: 2,
      enabled: true,
    },
    {
      type: 'CREATE_AUDIT_LOG',
      configuration: { action: 'Visitor Pass Approved', resource: 'VMS' },
      order: 3,
      enabled: true,
    },
  ]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadApps() {
      const appList = await applicationService.getApplications();
      setApplications(appList);
      if (appList.length > 0 && !applicationId) {
        setApplicationId(appList[0].id);
      }
    }
    loadApps();
  }, []);

  const handleAddCondition = () => {
    setConditions([
      ...conditions,
      {
        field: 'status',
        operator: 'EQUALS',
        value: 'APPROVED',
        logicalOperator: 'AND',
        order: conditions.length + 1,
      },
    ]);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleAddAction = (actionType: WorkflowAction['type']) => {
    let defaultConfig: Record<string, any> = {};
    if (actionType === 'SEND_NOTIFICATION') {
      defaultConfig = { recipient: 'host@company.com', message: 'Notification message' };
    } else if (actionType === 'CALL_API') {
      defaultConfig = { endpoint: '/api/v2/customers', method: 'POST' };
    } else if (actionType === 'GENERATE_FILE') {
      defaultConfig = { fileType: 'QR_CODE_PASS' };
    } else if (actionType === 'CREATE_AUDIT_LOG') {
      defaultConfig = { action: 'Workflow Action Executed', resource: 'System' };
    }

    setActions([
      ...actions,
      {
        type: actionType,
        configuration: defaultConfig,
        order: actions.length + 1,
        enabled: true,
      },
    ]);
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleSaveWorkflow = async (activate = false) => {
    setSaving(true);
    try {
      const created = await workflowService.createWorkflow({
        applicationId,
        name,
        description,
        status: activate ? 'active' : 'draft',
        triggerType,
        trigger: {
          type: triggerType,
          eventName,
        },
        conditions,
        actions,
      });

      if (activate) {
        await workflowService.activateWorkflow(created.id);
      }

      router.push(`/workflows/${created.id}`);
    } catch (e: any) {
      alert(`Failed to save workflow: ${e.message}`);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#3F7659]">
            Workflow Builder • Step {step} of 5
          </span>
          <h1 className="text-2xl font-extrabold text-[#173C2D]">Create Automation Workflow</h1>
        </div>
        <Link href="/workflows" className="text-xs font-semibold text-[#5A7165] hover:text-[#173C2D]">
          Cancel & Exit
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E2ECE5] h-2 rounded-full overflow-hidden">
        <div
          className="bg-[#3F7659] h-full transition-all duration-300 ease-out"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      {/* Main Builder Card */}
      <div className="bg-white border border-[#E2ECE5] rounded-2xl p-6 md:p-8 shadow-xs">
        {/* STEP 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-[#173C2D]">Step 1: Workflow Identity</h2>
              <p className="text-xs text-[#5A7165]">Define workflow name, target application, and description.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#173C2D]">Workflow Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] mt-1"
                />
              </div>

              <div>
                <label className="font-bold text-[#173C2D]">Target Application *</label>
                <select
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] mt-1"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.mode.toUpperCase()} Mode)
                    </option>
                  ))}
                  {applications.length === 0 && <option value="app-vms-01">Visitor Management System (VMS OS)</option>}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#173C2D]">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Trigger */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-[#173C2D]">Step 2: Choose Trigger</h2>
              <p className="text-xs text-[#5A7165]">Select what event or schedule initiates this workflow pipeline.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: 'EVENT', label: 'Application Event', icon: Zap, desc: 'Fires when an internal event occurs' },
                { type: 'SCHEDULE', label: 'Scheduled Cron', icon: Sparkles, desc: 'Runs on a recurring timer schedule' },
                { type: 'WEBHOOK', label: 'External Webhook', icon: Network, desc: 'Initiated via HTTP Webhook payload' },
                { type: 'MANUAL', label: 'Manual Trigger', icon: Play, desc: 'Triggered manually by users or API' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = triggerType === item.type;
                return (
                  <div
                    key={item.type}
                    onClick={() => setTriggerType(item.type as any)}
                    className={cn(
                      'p-4 rounded-xl border cursor-pointer transition-all space-y-2 relative',
                      isSelected ? 'border-[#3F7659] bg-[#F3F9F5] shadow-xs' : 'border-[#E2ECE5] bg-white hover:border-[#DDEEDF]'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <Icon size={18} className="text-[#3F7659]" />
                      {isSelected && <Check size={14} className="text-[#3F7659]" />}
                    </div>
                    <h4 className="text-xs font-bold text-[#173C2D]">{item.label}</h4>
                    <p className="text-[10px] text-[#5A7165]">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {triggerType === 'EVENT' && (
              <div className="p-4 bg-[#F3F9F5] rounded-xl border border-[#E2ECE5] space-y-2 text-xs">
                <label className="font-bold text-[#173C2D]">Application Event Name</label>
                <select
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2ECE5] rounded-lg font-mono text-[#173C2D]"
                >
                  <option value="visitor.created">visitor.created (Visitor Check-in Created)</option>
                  <option value="visitor.approved">visitor.approved (Visitor Approved by Host)</option>
                  <option value="appointment.created">appointment.created (Appointment Scheduled)</option>
                  <option value="employee.created">employee.created (Employee Onboarded)</option>
                  <option value="application.created">application.created (New App Created)</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Conditions */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#173C2D]">Step 3: Define Conditions (IF)</h2>
                <p className="text-xs text-[#5A7165]">Specify logical condition rules required for actions to execute.</p>
              </div>
              <button
                onClick={handleAddCondition}
                className="px-3 py-1.5 bg-[#3F7659] text-white text-xs font-bold rounded-lg flex items-center gap-1"
              >
                <Plus size={14} /> Add Condition
              </button>
            </div>

            <div className="space-y-3">
              {conditions.map((cond, idx) => (
                <div key={idx} className="p-4 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl flex items-center gap-3 text-xs">
                  {idx > 0 && (
                    <span className="font-extrabold text-[#3F7659] px-2 py-1 bg-white rounded border border-[#E2ECE5]">
                      {cond.logicalOperator || 'AND'}
                    </span>
                  )}
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Field (e.g. type, status)"
                      value={cond.field}
                      onChange={(e) => {
                        const copy = [...conditions];
                        copy[idx].field = e.target.value;
                        setConditions(copy);
                      }}
                      className="px-3 py-2 bg-white border border-[#E2ECE5] rounded-lg font-mono"
                    />

                    <select
                      value={cond.operator}
                      onChange={(e) => {
                        const copy = [...conditions];
                        copy[idx].operator = e.target.value as any;
                        setConditions(copy);
                      }}
                      className="px-3 py-2 bg-white border border-[#E2ECE5] rounded-lg font-semibold"
                    >
                      <option value="EQUALS">EQUALS (==)</option>
                      <option value="NOT_EQUALS">NOT_EQUALS (!=)</option>
                      <option value="CONTAINS">CONTAINS</option>
                      <option value="NOT_CONTAINS">NOT_CONTAINS</option>
                      <option value="GREATER_THAN">GREATER_THAN (&gt;)</option>
                      <option value="LESS_THAN">LESS_THAN (&lt;)</option>
                      <option value="EXISTS">EXISTS</option>
                      <option value="NOT_EXISTS">NOT_EXISTS</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Value (e.g. VIP, APPROVED)"
                      value={cond.value || ''}
                      onChange={(e) => {
                        const copy = [...conditions];
                        copy[idx].value = e.target.value;
                        setConditions(copy);
                      }}
                      className="px-3 py-2 bg-white border border-[#E2ECE5] rounded-lg font-mono"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveCondition(idx)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Actions */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-[#173C2D]">Step 4: Define Actions (THEN)</h2>
              <p className="text-xs text-[#5A7165]">Configure sequential actions executed when conditions pass.</p>
            </div>

            {/* Quick Add Action Toolbar */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="font-bold text-[#173C2D] self-center mr-2">+ Quick Add Action:</span>
              <button
                onClick={() => handleAddAction('SEND_NOTIFICATION')}
                className="px-3 py-1.5 bg-[#F3F9F5] border border-[#E2ECE5] hover:border-[#3F7659] text-[#173C2D] font-bold rounded-lg flex items-center gap-1"
              >
                <Bell size={13} className="text-[#3F7659]" /> Notification
              </button>
              <button
                onClick={() => handleAddAction('CALL_API')}
                className="px-3 py-1.5 bg-[#F3F9F5] border border-[#E2ECE5] hover:border-[#3F7659] text-[#173C2D] font-bold rounded-lg flex items-center gap-1"
              >
                <Network size={13} className="text-[#3F7659]" /> Call API (Hub)
              </button>
              <button
                onClick={() => handleAddAction('GENERATE_FILE')}
                className="px-3 py-1.5 bg-[#F3F9F5] border border-[#E2ECE5] hover:border-[#3F7659] text-[#173C2D] font-bold rounded-lg flex items-center gap-1"
              >
                <FileCode size={13} className="text-[#3F7659]" /> Generate File / QR
              </button>
              <button
                onClick={() => handleAddAction('CREATE_AUDIT_LOG')}
                className="px-3 py-1.5 bg-[#F3F9F5] border border-[#E2ECE5] hover:border-[#3F7659] text-[#173C2D] font-bold rounded-lg flex items-center gap-1"
              >
                <ShieldCheck size={13} className="text-[#3F7659]" /> Audit Log
              </button>
            </div>

            {/* Action Items List */}
            <div className="space-y-3">
              {actions.map((act, idx) => (
                <div key={idx} className="p-4 bg-white border-2 border-[#E2ECE5] rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-[#3F7659] text-white rounded">
                      Action {idx + 1}: {act.type}
                    </span>
                    <button onClick={() => handleRemoveAction(idx)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <pre className="p-2.5 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl font-mono text-[11px] text-[#173C2D]">
                    {JSON.stringify(act.configuration, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Review & Save */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-[#173C2D]">Step 5: Review & Topology Preview</h2>
              <p className="text-xs text-[#5A7165]">Review workflow execution pipeline before saving.</p>
            </div>

            {/* Visual Workflow Node Blueprint Canvas */}
            <div className="p-6 bg-[#F3F9F5] border border-[#E2ECE5] rounded-2xl space-y-4 text-center">
              <div className="p-3 bg-white border border-[#3F7659] rounded-xl font-bold text-xs text-[#173C2D] max-w-sm mx-auto shadow-xs">
                ⚡ TRIGGER: {triggerType} ({eventName})
              </div>

              <div className="text-[#3F7659] font-bold text-xs flex justify-center">
                <ArrowDown size={18} className="animate-bounce" />
              </div>

              <div className="p-3 bg-white border border-[#3F7659] rounded-xl font-bold text-xs text-[#173C2D] max-w-sm mx-auto shadow-xs">
                ⚖ CONDITIONS: {conditions.length} Condition Rule(s) Configured
              </div>

              <div className="text-[#3F7659] font-bold text-xs flex justify-center">
                <ArrowDown size={18} className="animate-bounce" />
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                {actions.map((a, i) => (
                  <div key={i} className="p-2.5 bg-[#173C2D] text-white rounded-xl text-xs font-bold shadow-xs">
                    ▶ ACTION {i + 1}: {a.type}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-[#E2ECE5] mt-8">
          <button
            type="button"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all',
              step === 1 ? 'opacity-40 cursor-not-allowed text-[#5A7165]' : 'bg-[#F3F9F5] text-[#173C2D] hover:bg-[#DDEEDF]'
            )}
          >
            <ArrowLeft size={14} /> Previous
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSaveWorkflow(false)}
                disabled={saving}
                className="px-4 py-2.5 bg-[#F3F9F5] hover:bg-[#DDEEDF] text-[#173C2D] text-xs font-bold rounded-xl"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={() => handleSaveWorkflow(true)}
                disabled={saving}
                className="px-6 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center gap-2"
              >
                <Check size={16} /> Activate Workflow
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
