'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Network,
  Server,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Building2,
  Users,
  LayoutGrid,
  Check,
  ChevronDown,
  Layers,
  FileCode2,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_TEMPLATES, MOCK_BILLING_PLANS } from '@/mock/data';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Does LaunchPad OS replace our existing customer CRM or HRMS backend?',
      a: 'Not necessarily! In Integration Hub Mode, LaunchPad acts as a modern frontend OS while keeping your pre-existing PHP CRM, Python HRMS, or legacy database as the source of truth via high-performance connectors.'
    },
    {
      q: 'What is the difference between Standalone Mode and Integration Hub Mode?',
      a: 'Standalone Mode generates the complete application stack including database schemas and backend logic. Integration Hub Mode binds to existing APIs and endpoints without requiring backend code rewrites.'
    },
    {
      q: 'Can we customize branding and CSS theme variables per application?',
      a: 'Yes. LaunchPad OS features a real-time Theme Builder allowing each tenant or application to customize logos, primary/secondary colors, fonts, and border styles.'
    },
    {
      q: 'Is LaunchPad frontend API-ready for backend integration?',
      a: 'Fully API-ready. Every UI component consumes typed async services that can be seamlessly pointed to real NestJS or REST API endpoints.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F3F9F5] text-[#173C2D] font-sans selection:bg-[#DDEEDF]">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2ECE5]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3F7659] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
              L
            </div>
            <span className="font-black text-lg tracking-tight text-[#173C2D]">LaunchPad OS</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#5A7165]">
            <a href="#how-it-works" className="hover:text-[#3F7659] transition-colors">How It Works</a>
            <a href="#modes" className="hover:text-[#3F7659] transition-colors">Dual Operational Modes</a>
            <a href="#templates" className="hover:text-[#3F7659] transition-colors">Templates</a>
            <a href="#pricing" className="hover:text-[#3F7659] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#3F7659] transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-[#173C2D] hover:bg-[#F3F9F5] rounded-lg transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              Open Control Center <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-6 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DDEEDF] border border-[#C5E2C8] text-xs font-extrabold text-[#173C2D] shadow-xs">
          <Sparkles size={14} className="text-[#3F7659]" /> Enterprise Reusable Application Platform
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#173C2D] max-w-4xl mx-auto leading-tight">
          Build. Customize. Integrate. Deploy.
        </h1>

        <p className="text-sm md:text-lg text-[#5A7165] max-w-2xl mx-auto leading-relaxed">
          Build powerful business applications faster using reusable modules, templates, and dual-mode integration hub connectors.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/applications/create"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            Create Application <ArrowRight size={16} />
          </Link>
          <Link
            href="/templates"
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#F3F9F5] text-[#173C2D] font-bold text-sm rounded-xl border border-[#E2ECE5] shadow-xs transition-all flex items-center justify-center gap-2"
          >
            Explore Templates
          </Link>
        </div>

        {/* Hero Product Control Center Mockup Preview */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="p-4 bg-white border border-[#E2ECE5] rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between px-2 text-xs font-bold text-[#5A7165]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
                <span className="ml-2 font-mono text-[11px]">launchpad-os.internal/dashboard</span>
              </div>
              <span className="px-2.5 py-0.5 bg-[#DDEEDF] text-[#173C2D] rounded-full text-[10px] font-extrabold">
                Live Dual Engine Active
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-[#F3F9F5] border border-[#DDEEDF] text-left space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-[#E2ECE5] space-y-2">
                  <span className="text-[10px] font-extrabold bg-[#3F7659] text-white px-2 py-0.5 rounded">MODE 1</span>
                  <h4 className="text-sm font-bold text-[#173C2D]">Standalone VMS Pass App</h4>
                  <p className="text-xs text-[#5A7165]">LaunchPad generated infrastructure & database</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#E2ECE5] space-y-2">
                  <span className="text-[10px] font-extrabold bg-[#173C2D] text-white px-2 py-0.5 rounded">MODE 2</span>
                  <h4 className="text-sm font-bold text-[#173C2D]">Customer PHP CRM Hub</h4>
                  <p className="text-xs text-[#5A7165]">Existing PHP CRM is the source of truth</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Operational Modes Section */}
      <section id="modes" className="py-20 bg-white border-y border-[#E2ECE5] px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3F7659]">Architectural Differentiator</span>
            <h2 className="text-3xl font-extrabold text-[#173C2D]">Two Powerful Operating Modes</h2>
            <p className="text-xs md:text-sm text-[#5A7165]">
              Whether you need complete application infrastructure from scratch or a modern UI connected to your legacy system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-[#F3F9F5] border border-[#DDEEDF] space-y-6">
              <div className="p-3.5 bg-[#3F7659] text-white rounded-2xl w-fit">
                <Server size={28} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#3F7659]">MODE 1</span>
                <h3 className="text-2xl font-bold text-[#173C2D] mt-1">Standalone Platform</h3>
                <p className="text-xs text-[#5A7165] mt-2 leading-relaxed">
                  For businesses that don&apos;t already have a backend. LaunchPad provides the complete application infrastructure, database, authentication, and services.
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-[#E2ECE5] text-xs font-mono font-bold text-[#173C2D]">
                Customer → LaunchPad UI → LaunchPad Backend → LaunchPad DB
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#F3F9F5] border border-[#DDEEDF] space-y-6">
              <div className="p-3.5 bg-[#173C2D] text-white rounded-2xl w-fit">
                <Network size={28} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#173C2D]">MODE 2</span>
                <h3 className="text-2xl font-bold text-[#173C2D] mt-1">Integration Hub</h3>
                <p className="text-xs text-[#5A7165] mt-2 leading-relaxed">
                  For companies with existing backends (PHP CRM, Python HRMS, Legacy Java VMS). LaunchPad acts as the modern frontend while your existing system remains the source of truth.
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-[#E2ECE5] text-xs font-mono font-bold text-[#173C2D]">
                LaunchPad UI → Integration Hub → Connector → Existing Customer Backend
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3F7659]">Predictable SaaS Billing</span>
          <h2 className="text-3xl font-extrabold text-[#173C2D]">Simple Enterprise Plans</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MOCK_BILLING_PLANS.map((plan) => (
            <div key={plan.id} className="p-8 bg-white border border-[#E2ECE5] rounded-3xl shadow-xs space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#173C2D]">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#173C2D]">${plan.priceMonthly}</span>
                  <span className="text-xs text-[#5A7165]">/ mo</span>
                </div>
                <p className="text-xs text-[#5A7165]">{plan.description}</p>

                <div className="pt-4 border-t border-[#E2ECE5] space-y-2 text-xs">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check size={14} className="text-[#3F7659]" />
                      <span className="text-[#173C2D] font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/login"
                className="w-full py-3 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl text-center shadow-xs transition-all block"
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white border-t border-[#E2ECE5] px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-[#173C2D]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={faq.q}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="p-5 rounded-2xl bg-[#F3F9F5] border border-[#E2ECE5] cursor-pointer space-y-2 transition-all"
              >
                <div className="flex items-center justify-between font-bold text-sm text-[#173C2D]">
                  <span>{faq.q}</span>
                  <ChevronDown size={16} className={cn('transition-transform', activeFaq === idx ? 'rotate-180' : '')} />
                </div>
                {activeFaq === idx && (
                  <p className="text-xs text-[#5A7165] leading-relaxed pt-2 border-t border-[#E2ECE5]">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#173C2D] text-[#DDEEDF] text-xs border-t border-[#3F7659]/30 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3F7659] text-white flex items-center justify-center font-bold text-sm">
              L
            </div>
            <span className="font-bold text-white text-sm">LaunchPad OS</span>
          </div>

          <p>© 2026 LaunchPad OS. All rights reserved. Enterprise Reusable Application Platform.</p>
        </div>
      </footer>
    </div>
  );
}
