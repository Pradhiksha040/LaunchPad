'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Globe,
  Boxes,
  CheckCircle2,
  Sparkles,
  Server,
  Workflow,
  Code2,
} from 'lucide-react';
import { Button, ModeBadge } from '@launchpad/ui';
import { OperatingMode, ConnectorType } from '@launchpad/shared';

export default function LandingPage() {
  const [activeMode, setActiveMode] = useState<OperatingMode>(OperatingMode.INTEGRATION_HUB);

  return (
    <div className="min-h-screen bg-[#F8F4EF]">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#F8F4EF]/90 backdrop-blur-md border-b border-[#D9CBB8]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6F4E37] flex items-center justify-center text-white shadow-md">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-[#2F241F] tracking-tight">LaunchPad OS</span>
              <span className="block text-[10px] uppercase font-bold text-[#8B5E3C] tracking-widest">Enterprise Platform</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6C5A4E]">
            <a href="#modes" className="hover:text-[#2F241F] transition-colors">Dual Modes</a>
            <a href="#connectors" className="hover:text-[#2F241F] transition-colors">Integration Hub</a>
            <a href="#templates" className="hover:text-[#2F241F] transition-colors">Industry Starter Templates</a>
            <a href="#architecture" className="hover:text-[#2F241F] transition-colors">Architecture</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="primary" size="md" className="gap-2">
                Launch Platform
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFE6D8] border border-[#D9CBB8] text-xs font-semibold text-[#6F4E37] mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#A67C52]" />
            Enterprise White-Label Business Application Platform
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-[#2F241F] tracking-tight max-w-4xl mx-auto leading-tight">
            Build & Deploy Modern Business Apps for <span className="text-[#6F4E37]">Any Industry</span>
          </h1>

          <p className="mt-6 text-lg text-[#6C5A4E] max-w-3xl mx-auto leading-relaxed">
            Operate seamlessly in <strong>Standalone Mode</strong> as a complete backend or in <strong>Integration Hub Mode</strong> as an API Orchestration & Transformation layer over legacy ERPs (SAP, Oracle, Salesforce, Dynamics).
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="gap-2 shadow-lg">
                Enter Command Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard/integration-hub">
              <Button variant="outline" size="lg" className="gap-2">
                <Cpu className="w-5 h-5 text-[#8B5E3C]" />
                Explore Integration Hub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Dual Mode Switcher Demo */}
      <section id="modes" className="py-16 px-6 bg-[#EFE6D8]/50 border-y border-[#D9CBB8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2F241F]">Two Powerful Operating Modes</h2>
            <p className="text-[#6C5A4E] mt-2">Select a mode below to simulate how LaunchPad OS handles data routing</p>

            <div className="inline-flex p-1.5 rounded-2xl bg-[#FFFDF9] border border-[#D9CBB8] mt-6 shadow-sm">
              <button
                onClick={() => setActiveMode(OperatingMode.STANDALONE)}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeMode === OperatingMode.STANDALONE
                    ? 'bg-[#6F4E37] text-white shadow-md'
                    : 'text-[#6C5A4E] hover:text-[#2F241F]'
                }`}
              >
                Standalone Mode (Startups)
              </button>
              <button
                onClick={() => setActiveMode(OperatingMode.INTEGRATION_HUB)}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeMode === OperatingMode.INTEGRATION_HUB
                    ? 'bg-[#4E342E] text-white shadow-md'
                    : 'text-[#6C5A4E] hover:text-[#2F241F]'
                }`}
              >
                Integration Hub Mode (Enterprise)
              </button>
            </div>
          </div>

          <div className="bg-[#FFFDF9] border border-[#D9CBB8] rounded-3xl p-8 shadow-executive">
            <div className="flex items-center justify-between border-b border-[#D9CBB8]/60 pb-6 mb-8">
              <div>
                <ModeBadge mode={activeMode} />
                <h3 className="text-2xl font-bold text-[#2F241F] mt-2">
                  {activeMode === OperatingMode.STANDALONE ? 'Complete SaaS Application Backend' : 'API Orchestration & Transformation Hub'}
                </h3>
              </div>
              <span className="text-xs font-mono bg-[#EFE6D8] px-3 py-1.5 rounded-lg text-[#6F4E37] font-semibold">
                Status: ACTIVE
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-6 rounded-2xl bg-[#F8F4EF] border border-[#D9CBB8]">
                <div className="w-10 h-10 rounded-xl bg-[#6F4E37] text-white flex items-center justify-center mb-4">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-[#2F241F]">1. LaunchPad Frontend</h4>
                <p className="text-xs text-[#6C5A4E] mt-2">
                  Next.js 15 Web Portal, Mobile Apps, Dashboards, and Forms with Brown & Beige UI style.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F8F4EF] border border-[#D9CBB8]">
                <div className="w-10 h-10 rounded-xl bg-[#8B5E3C] text-white flex items-center justify-center mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-[#2F241F]">2. API & Transformation Engine</h4>
                <p className="text-xs text-[#6C5A4E] mt-2">
                  {activeMode === OperatingMode.STANDALONE
                    ? 'NestJS REST API managing local PostgreSQL tables, JWT auth & RBAC permissions.'
                    : 'Dynamic Connector Registry translating LaunchPad Canonical Models into SAP/Oracle/Salesforce schemas.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F8F4EF] border border-[#D9CBB8]">
                <div className="w-10 h-10 rounded-xl bg-[#4E342E] text-white flex items-center justify-center mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-[#2F241F]">3. Target Storage</h4>
                <p className="text-xs text-[#6C5A4E] mt-2">
                  {activeMode === OperatingMode.STANDALONE
                    ? 'Internal PostgreSQL Database with Prisma ORM.'
                    : "Client's existing SAP, Oracle DB, Salesforce Cloud, or Dynamics 365 server."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Connectors Suite */}
      <section id="connectors" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#2F241F]">Supported Enterprise Connectors</h2>
            <p className="text-[#6C5A4E] mt-2 max-w-2xl mx-auto">
              Dynamic Connector selection based on tenant configuration stored in the Master Database.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { type: 'SAP OData / RFC', name: 'SAP Enterprise Connector', desc: 'BAPI/RFC translation for SAP ERP & S/4HANA SD/MM/FI' },
              { type: 'Oracle OIC', name: 'Oracle Connector', desc: 'Integration Cloud REST adapter for EBS & Fusion ERP' },
              { type: 'Salesforce REST', name: 'Salesforce Connector', desc: 'Composite API mapping for Accounts, Leads & Opportunities' },
              { type: 'Dynamics 365', name: 'Microsoft Dynamics', desc: 'Dataverse Web API adapter for Finance & Operations' },
              { type: 'Generic REST', name: 'REST Connector', desc: 'Configurable header, path, and auth token REST connector' },
              { type: 'GraphQL API', name: 'GraphQL Connector', desc: 'Dynamic GraphQL query & mutation payload builder' },
              { type: 'SOAP Web Services', name: 'SOAP Connector', desc: 'XML Envelope generator with WSDL endpoint parsing' },
              { type: 'Custom SDK', name: 'Custom Connector SDK', desc: 'Open SDK interface to create custom enterprise connectors' },
            ].map((conn, idx) => (
              <div key={idx} className="bg-[#FFFDF9] border border-[#D9CBB8] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#EFE6D8] text-[#6F4E37]">
                    {conn.type}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-bold text-[#2F241F] text-lg">{conn.name}</h3>
                <p className="text-xs text-[#6C5A4E] mt-2 leading-relaxed">{conn.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4E342E] text-[#FFFDF9] py-12 px-6 border-t border-[#3a2722]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#A67C52] flex items-center justify-center text-white">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">LaunchPad OS</span>
          </div>
          <p className="text-xs text-[#D9CBB8]">
            © {new Date().getFullYear()} LaunchPad OS. Enterprise White-Label Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
