'use client';

import React, { useState } from 'react';
import { GitFork, Zap, CheckCircle2, ArrowDown, ShieldCheck, Mail, Send, Play, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WorkflowBuilderPage() {
  const [nodes, setNodes] = useState([
    { id: 'n-1', type: 'Trigger', title: 'Application Created Event', desc: 'Fires whenever a new app is created in Standalone Mode', icon: Zap },
    { id: 'n-2', type: 'Condition', title: 'Check Tenant Tier', desc: 'Evaluate if customer plan is Enterprise OS', icon: GitFork },
    { id: 'n-3', type: 'Approval', title: 'Manager Approval Required', desc: 'Send notification link to Super Admin for sign-off', icon: ShieldCheck },
    { id: 'n-[#]', type: 'Action', title: 'Webhook API Dispatch', desc: 'POST payload to customer EventBus endpoint', icon: Send },
    { id: 'n-5', type: 'End', title: 'Deploy & Complete', desc: 'Promote build to production cluster', icon: CheckCircle2 },
  ]);

  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
            <GitFork size={14} /> Automation Workflow Engine
          </div>
          <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Visual Workflow Builder</h1>
          <p className="text-xs text-[#5A7165]">Design automated event triggers, approval chains, and webhook flows.</p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-xl shadow-xs transition-all">
          <Play size={14} /> Test Workflow Execution
        </button>
      </div>

      {/* Visual Vertical Node Pipeline Canvas */}
      <div className="max-w-2xl mx-auto p-8 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-6">
        <div className="text-center pb-4 border-b border-[#E2ECE5]">
          <h3 className="text-sm font-bold text-[#173C2D]">Active Workflow Blueprint: App Lifecycle Automation</h3>
          <p className="text-xs text-[#5A7165]">5-Step Event Processing Diagram</p>
        </div>

        <div className="space-y-4 flex flex-col items-center">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <React.Fragment key={node.id}>
                <div
                  onClick={() => setActiveStep(index)}
                  className={cn(
                    'w-full max-w-md p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-1 relative',
                    activeStep === index
                      ? 'border-[#3F7659] bg-[#F3F9F5] shadow-sm'
                      : 'border-[#E2ECE5] bg-white hover:border-[#DDEEDF]'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-[#DDEEDF] text-[#173C2D] rounded">
                      Step {index + 1}: {node.type}
                    </span>
                    <Icon size={18} className="text-[#3F7659]" />
                  </div>
                  <h4 className="text-sm font-bold text-[#173C2D]">{node.title}</h4>
                  <p className="text-xs text-[#5A7165]">{node.desc}</p>
                </div>

                {index < nodes.length - 1 && (
                  <div className="flex items-center justify-center text-[#3F7659] my-1">
                    <ArrowDown size={20} className="animate-bounce" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
