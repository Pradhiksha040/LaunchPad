'use client';

import React, { useState } from 'react';
import { CreditCard, Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { MOCK_BILLING_PLANS } from '@/mock/data';
import { cn } from '@/lib/utils';

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState('plan-pro');
  const [upgraded, setUpgraded] = useState(false);

  const handleSelectPlan = (id: string) => {
    setCurrentPlan(id);
    setUpgraded(true);
    setTimeout(() => setUpgraded(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
            <CreditCard size={14} /> Subscription Management
          </div>
          <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Billing & Plans</h1>
          <p className="text-xs text-[#5A7165]">Manage your platform tier and application allocation limits.</p>
        </div>

        {/* Toggle monthly/yearly */}
        <div className="flex items-center gap-2 bg-[#F3F9F5] p-1.5 rounded-xl border border-[#E2ECE5] w-fit">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-3 py-1.5 text-xs font-bold rounded-lg transition-all',
              billingCycle === 'monthly' ? 'bg-[#3F7659] text-white shadow-2xs' : 'text-[#5A7165]'
            )}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              'px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1',
              billingCycle === 'yearly' ? 'bg-[#3F7659] text-white shadow-2xs' : 'text-[#5A7165]'
            )}
          >
            Yearly (Save 20%)
          </button>
        </div>
      </div>

      {upgraded && (
        <div className="p-4 bg-[#DDEEDF] text-[#173C2D] font-bold text-xs rounded-xl border border-[#C5E2C8] flex items-center gap-2 animate-in fade-in">
          <Sparkles size={16} className="text-[#3F7659]" /> Subscription Plan Updated Successfully!
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_BILLING_PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;

          return (
            <div
              key={plan.id}
              className={cn(
                'p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-6 relative bg-white',
                plan.isPopular ? 'border-[#3F7659] shadow-md ring-2 ring-[#3F7659]/20' : 'border-[#E2ECE5] shadow-xs'
              )}
            >
              {plan.isPopular && (
                <span className="absolute -top-3 right-6 px-3 py-1 text-[10px] font-extrabold bg-[#3F7659] text-white rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#173C2D]">{plan.name}</h3>
                  <p className="text-xs text-[#5A7165] mt-1 leading-relaxed">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#173C2D]">${price}</span>
                  <span className="text-xs text-[#5A7165]">/ month</span>
                </div>

                <div className="pt-4 border-t border-[#E2ECE5] space-y-2.5 text-xs">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check size={14} className="text-[#3F7659] shrink-0 mt-0.5" />
                      <span className="text-[#173C2D] font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCurrent}
                className={cn(
                  'w-full py-2.5 text-xs font-bold rounded-xl transition-all',
                  isCurrent
                    ? 'bg-[#DDEEDF] text-[#173C2D] cursor-default'
                    : 'bg-[#3F7659] hover:bg-[#173C2D] text-white shadow-xs'
                )}
              >
                {isCurrent ? 'Current Plan' : 'Switch to Plan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
