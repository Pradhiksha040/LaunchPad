'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  PieChart,
} from 'lucide-react';
import Link from 'next/link';
import {
  marketplaceBillingService,
  PublisherEarningsOverview,
} from '@/services/marketplaceBillingService';

export default function PublisherEarningsPage() {
  const [data, setData] = useState<PublisherEarningsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const overview = await marketplaceBillingService.getPublisherEarnings();
      setData(overview);
    } catch (err) {
      console.error('Failed to load publisher earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handleOnboardStripe = async () => {
    setOnboarding(true);
    setStatusMsg('Generating Stripe Express onboarding link...');
    try {
      const res = await marketplaceBillingService.onboardPublisher();
      setStatusMsg(`Stripe Connect Onboarded: Account ${res.stripeAccountId}`);
      fetchEarnings();
      if (res.onboardingUrl && res.onboardingUrl !== '#') {
        window.open(res.onboardingUrl, '_blank');
      }
    } catch (err) {
      setStatusMsg('Failed to initialize Stripe Connect onboarding');
    } finally {
      setOnboarding(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
            <DollarSign size={14} /> Publisher Financial Settlement
          </div>
          <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Publisher Revenue & Earnings</h1>
          <p className="text-xs text-[#5A7165]">
            Track marketplace asset sales, platform revenue sharing commissions, and Stripe Connect payout settlements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {statusMsg && (
            <span className="px-3 py-1.5 text-xs font-bold text-[#173C2D] bg-[#E2ECE5] rounded-xl border border-[#3F7659]/20">
              {statusMsg}
            </span>
          )}
          <button
            onClick={fetchEarnings}
            className="px-3 py-2 bg-white border border-[#E2ECE5] hover:bg-[#F3F9F5] text-[#173C2D] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Stripe Connect Account Card */}
      <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F3F9F5] border border-[#C5E2C8] flex items-center justify-center text-[#3F7659] shrink-0 font-bold">
            <CreditCard size={24} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#173C2D]">Stripe Connect Merchant Account</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {data?.stripeAccountStatus || 'CONNECTED'}
              </span>
            </div>
            <p className="text-xs text-[#5A7165]">
              Connected Account ID: <code className="font-mono text-[#173C2D]">{data?.stripeAccountId || 'acct_express_connected'}</code>
            </p>
          </div>
        </div>

        <button
          onClick={handleOnboardStripe}
          disabled={onboarding}
          className="px-5 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0"
        >
          <Sparkles size={14} /> Stripe Connect Dashboard <ExternalLink size={13} />
        </button>
      </div>

      {/* Financial KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white border border-[#E2ECE5] rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#5A7165]">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Marketplace Sales</span>
            <DollarSign size={18} className="text-[#3F7659]" />
          </div>
          <div className="text-2xl font-black text-[#173C2D]">
            ${(data?.grossSalesAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[#5A7165] font-semibold">Total gross volume from paid assets</p>
        </div>

        <div className="p-5 bg-white border border-[#E2ECE5] rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#5A7165]">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Fee Deducted</span>
            <PieChart size={18} className="text-[#3F7659]" />
          </div>
          <div className="text-2xl font-black text-amber-800">
            ${(data?.platformFeesDeducted || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[#5A7165] font-semibold">Configurable platform commission deducted</p>
        </div>

        <div className="p-5 bg-white border border-[#E2ECE5] rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#5A7165]">
            <span className="text-xs font-bold uppercase tracking-wider">Net Publisher Payouts</span>
            <TrendingUp size={18} className="text-[#3F7659]" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            ${(data?.netPublisherEarnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-600 font-bold">Settled to your Stripe Connect bank account</p>
        </div>
      </div>

      {/* Transaction & Settlement Table */}
      <div className="bg-white border border-[#E2ECE5] rounded-2xl overflow-hidden shadow-xs space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
          <div className="text-sm font-extrabold text-[#173C2D] flex items-center gap-2">
            <ArrowUpRight size={16} className="text-[#3F7659]" /> Recent Marketplace Sales Transactions ({data?.recentTransactions?.length || 0})
          </div>
          <span className="text-xs font-bold text-[#5A7165]">Dynamic Commission Deduction</span>
        </div>

        {data?.recentTransactions && data.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F9F5] border-b border-[#E2ECE5] text-[#173C2D] font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Asset</th>
                  <th className="p-3">Customer Org</th>
                  <th className="p-3">Gross Price</th>
                  <th className="p-3">Platform Fee</th>
                  <th className="p-3">Net Earnings</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2ECE5]">
                {data.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#F3F9F5] transition-colors">
                    <td className="p-3 font-bold text-[#173C2D]">{tx.asset?.name || tx.id}</td>
                    <td className="p-3 text-[#5A7165] flex items-center gap-1">
                      <Building2 size={12} className="text-[#3F7659]" /> {tx.buyerOrg?.name || 'Customer Org'}
                    </td>
                    <td className="p-3 font-mono font-bold text-[#173C2D]">${tx.amount.toFixed(2)}</td>
                    <td className="p-3 font-mono text-amber-800">-${tx.platformFee.toFixed(2)}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">${tx.publisherEarnings.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#5A7165] space-y-1">
            <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
            <p className="font-bold text-[#173C2D]">No transactions recorded yet</p>
            <p className="text-[11px]">When customers purchase your paid marketplace assets, earnings will settle here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
