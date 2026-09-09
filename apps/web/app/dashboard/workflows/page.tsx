'use client';

import React, { useState } from 'react';
import { Card, Button } from '@launchpad/ui';
import { Workflow, Plus, Play, CheckCircle2, ArrowRight } from 'lucide-react';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([
    {
      id: 'wf_001',
      name: 'Order Created -> Transform to SAP VBELN -> Dispatch Email',
      trigger: 'order.created',
      status: 'ACTIVE',
      executions: 1420,
      steps: ['Payload Capture', 'Field Mapping (KUNNR/VBELN)', 'Invoke SAP Connector', 'Email Alert'],
    },
    {
      id: 'wf_002',
      name: 'Patient Appointment Scheduled -> SMS & EHR Sync',
      trigger: 'appointment.created',
      status: 'ACTIVE',
      executions: 840,
      steps: ['Check Doctor Schedule', 'Invoke Generic REST Connector', 'Dispatch SMS'],
    },
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-[#FFFDF9] border border-[#D9CBB8] rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#2F241F]">Workflow Automation Engine</h1>
          <p className="text-xs text-[#6C5A4E] mt-1">Configure event-driven triggers and multi-step enterprise orchestrations.</p>
        </div>
        <Button variant="primary" size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> New Workflow
        </Button>
      </div>

      <div className="grid gap-6">
        {workflows.map((wf) => (
          <Card key={wf.id} className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#D9CBB8]/50 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#2F241F] text-lg">{wf.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {wf.status}
                  </span>
                </div>
                <p className="text-xs text-[#6C5A4E] mt-1">
                  Trigger Event: <code className="bg-[#EFE6D8] px-1.5 py-0.5 rounded font-mono text-[10px]">{wf.trigger}</code> | Executions: <strong>{wf.executions}</strong>
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Play className="w-3.5 h-3.5 text-[#6F4E37]" /> Test Run Workflow
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {wf.steps.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F8F4EF] border border-[#D9CBB8] text-xs text-[#2F241F] font-medium">
                    <span className="w-4 h-4 rounded-full bg-[#6F4E37] text-white flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    {step}
                  </div>
                  {idx < wf.steps.length - 1 && <ArrowRight className="w-4 h-4 text-[#A67C52]" />}
                </React.Fragment>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
