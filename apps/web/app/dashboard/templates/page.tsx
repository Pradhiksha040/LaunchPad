'use client';

import React, { useState } from 'react';
import { Card, Button } from '@launchpad/ui';
import { IndustryType } from '@launchpad/shared';
import { Boxes, CheckCircle2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function TemplatesPage() {
  const [deployed, setDeployed] = useState<string | null>(null);

  const templates = [
    { id: 'healthcare', name: 'Healthcare & EHR Portal', industry: IndustryType.HEALTHCARE, desc: 'Patient appointments, Doctor rosters, Medical history & SAP/Epic EHR connector.' },
    { id: 'crm', name: 'Enterprise CRM & Pipeline', industry: IndustryType.CRM, desc: 'Lead tracking, Opportunity stages, Account contacts & Salesforce sync.' },
    { id: 'hrms', name: 'Global HRMS & Payroll', industry: IndustryType.HRMS, desc: 'Employee onboarding, Attendance, Leave requests & Workday integration.' },
    { id: 'ecommerce', name: 'Multi-Tenant E-Commerce', industry: IndustryType.E_COMMERCE, desc: 'Product catalog, Order cart, Checkout, Payments & SAP SD order sync.' },
    { id: 'food-delivery', name: 'Food Delivery & Dispatch', industry: IndustryType.FOOD_DELIVERY, desc: 'Restaurant menus, Live driver dispatch, Geolocation & Order tracking.' },
    { id: 'real-estate', name: 'Real Estate & Property', industry: IndustryType.REAL_ESTATE, desc: 'Property listings, Tenant lease agreements, Maintenance tickets & Billing.' },
    { id: 'logistics', name: 'Logistics & Fleet Management', industry: IndustryType.LOGISTICS, desc: 'Shipment tracking, Warehouse inventory, Driver manifests & Oracle ERP.' },
    { id: 'education', name: 'EdTech & Student Portal', industry: IndustryType.EDUCATION, desc: 'Student enrollment, Course modules, Grades, Fee collection & Class schedules.' },
    { id: 'booking', name: 'Booking & Event Platform', industry: IndustryType.BOOKING, desc: 'Service slots, Calendar availability, Deposit payments & Notifications.' },
    { id: 'marketplace', name: 'Vendor Marketplace', industry: IndustryType.MARKETPLACE, desc: 'Vendor onboarding, Commission splits, Automated payouts & Storefronts.' },
    { id: 'rental', name: 'Equipment & Auto Rental', industry: IndustryType.RENTAL, desc: 'Fleet availability, Daily rental rates, Security deposit & Return checklist.' },
    { id: 'freelancer', name: 'Gig Economy Platform', industry: IndustryType.FREELANCER, desc: 'Job postings, Proposal submissions, Milestone payments & Escrow.' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FFFDF9] border border-[#D9CBB8] rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#2F241F]">Industry Starter Templates</h1>
          <p className="text-xs text-[#6C5A4E] mt-1">
            Pre-packaged enterprise solutions reusing core platform modules (Auth, RBAC, Connectors, Workflows).
          </p>
        </div>
      </div>

      {/* 12 Industry Starter Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <Card key={tpl.id} className="flex flex-col justify-between hover:border-[#A67C52]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#EFE6D8] text-[#6F4E37]">
                  {tpl.industry}
                </span>
                {deployed === tpl.id && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Deployed
                  </span>
                )}
              </div>
              <h3 className="font-bold text-[#2F241F] text-lg">{tpl.name}</h3>
              <p className="text-xs text-[#6C5A4E] mt-2 leading-relaxed">{tpl.desc}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#D9CBB8]/50 flex items-center justify-between">
              <span className="text-[10px] text-[#6C5A4E] font-medium">Includes 4 Reusable Modules</span>
              <Button
                variant={deployed === tpl.id ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => setDeployed(tpl.id)}
                className="gap-1.5"
              >
                {deployed === tpl.id ? 'Re-Deploy' : '1-Click Deploy'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
