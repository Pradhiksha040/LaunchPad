'use client';

import React, { useState } from 'react';
import { Card, Button, ModeBadge } from '@launchpad/ui';
import { ConnectorType, OperatingMode } from '@launchpad/shared';
import { Cpu, Send, CheckCircle2, ArrowRightLeft, Code, Database, RefreshCw, Key } from 'lucide-react';

export default function IntegrationHubPage() {
  const [selectedConnector, setSelectedConnector] = useState<ConnectorType>(ConnectorType.SAP);
  const [endpoint, setEndpoint] = useState('https://sap.apollohospital.org/sap/bc/odata/sap/ZLAUNCHPAD_SRV');
  const [canonicalInput, setCanonicalInput] = useState(
    JSON.stringify(
      {
        firstName: 'Apollo',
        lastName: 'Patient',
        email: 'patient.care@apollo.org',
        companyName: 'Apollo Hospitals Ltd',
      },
      null,
      2
    )
  );
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setExecutionResult({
        success: true,
        statusCode: 200,
        connectorUsed: selectedConnector,
        durationMs: 48,
        traceId: `trace_hub_${Date.now()}`,
        transformedPayloadSentToEnterprise: {
          NAME_FIRST: 'Apollo',
          NAME_LAST: 'Patient',
          SMTP_ADDR: 'patient.care@apollo.org',
          SAP_CLIENT: '100',
        },
        enterpriseResponseReceived: {
          SAP_KUNNR: '100982',
          STATUS: 'CREATED',
          MESSAGE: 'Customer record successfully provisioned in SAP S/4HANA',
        },
      });
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FFFDF9] border border-[#D9CBB8] rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#2F241F]">Integration Hub Control Center</h1>
            <ModeBadge mode={OperatingMode.INTEGRATION_HUB} />
          </div>
          <p className="text-xs text-[#6C5A4E] mt-1">
            API Orchestration, Connector Selection, and Payload Schema Transformation Engine.
          </p>
        </div>
      </div>

      {/* Connector Selector Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { type: ConnectorType.SAP, name: 'SAP Enterprise', desc: 'OData / RFC BAPI' },
          { type: ConnectorType.SALESFORCE, name: 'Salesforce', desc: 'REST Composite API' },
          { type: ConnectorType.ORACLE, name: 'Oracle OIC', desc: 'Fusion ERP Cloud' },
          { type: ConnectorType.MICROSOFT_DYNAMICS, name: 'MS Dynamics 365', desc: 'Dataverse API' },
          { type: ConnectorType.GENERIC_REST, name: 'Generic REST', desc: 'JSON API Adapter' },
          { type: ConnectorType.GRAPHQL, name: 'GraphQL Endpoint', desc: 'Query & Mutation' },
          { type: ConnectorType.SOAP, name: 'SOAP Web Services', desc: 'XML WSDL Adapter' },
          { type: ConnectorType.CUSTOM, name: 'Custom Connector SDK', desc: 'SDK Interface' },
        ].map((c) => (
          <div
            key={c.type}
            onClick={() => setSelectedConnector(c.type)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedConnector === c.type
                ? 'bg-[#6F4E37] text-white border-[#6F4E37] shadow-md'
                : 'bg-[#FFFDF9] text-[#2F241F] border-[#D9CBB8] hover:bg-[#EFE6D8]'
            }`}
          >
            <div className="flex items-center justify-between">
              <Cpu className="w-5 h-5 mb-2" />
              {selectedConnector === c.type && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
            </div>
            <h3 className="font-bold text-sm">{c.name}</h3>
            <p className={`text-[10px] mt-1 ${selectedConnector === c.type ? 'text-[#D9CBB8]' : 'text-[#6C5A4E]'}`}>
              {c.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Dynamic Connector Configuration & Payload Transformer Playground */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card title="Connector Configuration" subtitle={`Active: ${selectedConnector}`}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2F241F] mb-1">Target Service Endpoint URL</label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8F4EF] border border-[#D9CBB8] text-[#2F241F] focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2F241F] mb-1">Client ID / SAP Client</label>
                <input
                  type="text"
                  defaultValue="100"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8F4EF] border border-[#D9CBB8] text-[#2F241F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#2F241F] mb-1">Authentication Type</label>
                <select className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8F4EF] border border-[#D9CBB8] text-[#2F241F]">
                  <option>OAuth 2.0 Client Credentials</option>
                  <option>SAP Basic Auth / RFC</option>
                  <option>API Key Header</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2F241F] mb-1">
                Canonical Payload Input (LaunchPad Customer Schema)
              </label>
              <textarea
                rows={6}
                value={canonicalInput}
                onChange={(e) => setCanonicalInput(e.target.value)}
                className="w-full p-3 font-mono text-xs rounded-xl bg-[#2F241F] text-[#FFFDF9] border border-[#D9CBB8] focus:outline-none focus:ring-2 focus:ring-[#A67C52]"
              />
            </div>

            <Button variant="primary" size="md" onClick={handleExecute} disabled={loading} className="w-full gap-2">
              <Send className="w-4 h-4" />
              {loading ? 'Orchestrating Request...' : `Execute ${selectedConnector} Connector`}
            </Button>
          </div>
        </Card>

        {/* Execution & Transformation Result */}
        <Card title="Payload Transformation Output" subtitle="2-Way Schema Mapping & Response">
          {executionResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Status: 200 OK | Duration: {executionResult.durationMs}ms
                </span>
                <span className="font-mono text-[10px]">{executionResult.traceId}</span>
              </div>

              <div>
                <span className="block text-xs font-bold text-[#2F241F] mb-1">
                  1. Transformed Payload Sent to Enterprise ({selectedConnector})
                </span>
                <pre className="p-3 rounded-xl bg-[#4E342E] text-[#FFFDF9] font-mono text-[11px] overflow-x-auto border border-[#3a2722]">
                  {JSON.stringify(executionResult.transformedPayloadSentToEnterprise, null, 2)}
                </pre>
              </div>

              <div>
                <span className="block text-xs font-bold text-[#2F241F] mb-1">
                  2. Enterprise Response Received & Mapped to Canonical Model
                </span>
                <pre className="p-3 rounded-xl bg-[#2F241F] text-[#FFFDF9] font-mono text-[11px] overflow-x-auto border border-[#D9CBB8]">
                  {JSON.stringify(executionResult.enterpriseResponseReceived, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border-2 border-dashed border-[#D9CBB8] rounded-xl text-[#6C5A4E]">
              <ArrowRightLeft className="w-8 h-8 mx-auto text-[#A67C52] mb-2" />
              <p className="text-xs">Click <strong>Execute Connector</strong> to test live payload transformation</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
