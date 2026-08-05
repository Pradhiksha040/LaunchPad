'use client';

import React, { useState } from 'react';
import { Card, Button } from '@launchpad/ui';
import { OperatingMode, IndustryType, ConnectorType } from '@launchpad/shared';
import { Sparkles, CheckCircle2, ArrowRight, Wand2 } from 'lucide-react';

export default function AIWizardPage() {
  const [orgName, setOrgName] = useState('Apollo Enterprise');
  const [industry, setIndustry] = useState<IndustryType>(IndustryType.HEALTHCARE);
  const [mode, setMode] = useState<OperatingMode>(OperatingMode.INTEGRATION_HUB);
  const [existingSystem, setExistingSystem] = useState('SAP');
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRecommendation({
        recommendedConnector: ConnectorType.SAP,
        suggestedModules: ['Authentication & RBAC', 'Organization', 'SAP Patient EHR Sync', 'Workflow Automation'],
        fieldMappings: {
          Customer: { firstName: 'NAME_FIRST', lastName: 'NAME_LAST', email: 'SMTP_ADDR' },
          Order: { orderNumber: 'VBELN', customerId: 'KUNNR', totalAmount: 'NETWR' },
        },
        explanation: `LaunchPad AI Assistant configured ${orgName} in ${mode} with ${existingSystem} Connector. Automatically mapped 2-way fields.`,
      });
    }, 700);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-[#FFFDF9] border border-[#D9CBB8] rounded-2xl p-6 shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#6F4E37] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-[#2F241F]">AI Setup Wizard</h1>
        <p className="text-xs text-[#6C5A4E] mt-1">
          Automated enterprise architecture generator. Recommends connectors, generates 2-way field mapping schemas, and provisions modules.
        </p>
      </div>

      <Card title="Enter Organization Profile">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2F241F] mb-1">Organization Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8F4EF] border border-[#D9CBB8] text-[#2F241F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2F241F] mb-1">Industry Sector</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as IndustryType)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8F4EF] border border-[#D9CBB8] text-[#2F241F]"
              >
                {Object.values(IndustryType).map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2F241F] mb-1">Operating Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as OperatingMode)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8F4EF] border border-[#D9CBB8] text-[#2F241F]"
              >
                <option value={OperatingMode.STANDALONE}>Standalone Mode (Complete Backend)</option>
                <option value={OperatingMode.INTEGRATION_HUB}>Integration Hub Mode (Extend ERP)</option>
              </select>
            </div>
          </div>

          {mode === OperatingMode.INTEGRATION_HUB && (
            <div>
              <label className="block text-xs font-semibold text-[#2F241F] mb-1">Existing Enterprise Backend System</label>
              <select
                value={existingSystem}
                onChange={(e) => setExistingSystem(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8F4EF] border border-[#D9CBB8] text-[#2F241F]"
              >
                <option value="SAP">SAP S/4HANA (OData / RFC)</option>
                <option value="Salesforce">Salesforce CRM</option>
                <option value="Oracle">Oracle Fusion ERP</option>
                <option value="Dynamics">Microsoft Dynamics 365</option>
                <option value="REST">Generic REST API</option>
              </select>
            </div>
          )}

          <Button variant="primary" size="md" onClick={handleGenerate} disabled={loading} className="w-full gap-2">
            <Wand2 className="w-4 h-4" />
            {loading ? 'Analyzing Architecture...' : 'Generate Configuration & Field Mappings'}
          </Button>
        </div>
      </Card>

      {recommendation && (
        <Card title="AI Recommended Configuration" className="bg-[#EFE6D8]/40 border-[#A67C52]">
          <div className="space-y-4">
            <p className="text-xs text-[#2F241F] font-semibold">{recommendation.explanation}</p>

            <div className="p-4 bg-[#FFFDF9] rounded-xl border border-[#D9CBB8]">
              <span className="block text-xs font-bold text-[#6F4E37] mb-2">Suggested Core & Domain Modules:</span>
              <div className="flex flex-wrap gap-2">
                {recommendation.suggestedModules.map((m: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-[#EFE6D8] text-[#6F4E37] text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {m}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold text-[#2F241F] mb-1">Generated 2-Way Field Mappings</span>
              <pre className="p-3 rounded-xl bg-[#2F241F] text-[#FFFDF9] font-mono text-[11px] overflow-x-auto">
                {JSON.stringify(recommendation.fieldMappings, null, 2)}
              </pre>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
