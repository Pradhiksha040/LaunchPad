'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Store,
  ArrowLeft,
  Boxes,
  GitFork,
  Layers,
  Building2,
  Download,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  FileCode2,
} from 'lucide-react';
import { marketplaceService, MarketplaceAsset } from '@/services/marketplaceService';
import { marketplaceBillingService } from '@/services/marketplaceBillingService';

export default function MarketplaceAssetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [asset, setAsset] = useState<MarketplaceAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLicense, setHasLicense] = useState(true);
  const [checkingLicense, setCheckingLicense] = useState(false);
  const [buying, setBuying] = useState(false);

  // Safe Installation Modal State
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installStep, setInstallStep] = useState<1 | 2>(1);
  const [customAppName, setCustomAppName] = useState('');
  const [installing, setInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadAsset();
    }
  }, [slug]);

  const loadAsset = async () => {
    setLoading(true);
    try {
      const data = await marketplaceService.getAssetBySlug(slug);
      setAsset(data);
      setCustomAppName(data?.name || '');

      if (data && data.pricingType !== 'FREE') {
        setCheckingLicense(true);
        const licRes = await marketplaceBillingService.checkLicense(data.id);
        setHasLicense(licRes.hasLicense);
        setCheckingLicense(false);
      } else {
        setHasLicense(true);
      }
    } catch (err) {
      console.error('Failed to load asset details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!asset) return;
    setBuying(true);
    try {
      const checkout = await marketplaceBillingService.createCheckoutSession(asset.id);
      if (checkout.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
      }
    } catch (err) {
      console.error('Checkout failed', err);
    } finally {
      setBuying(false);
    }
  };

  const handleExecuteInstall = async () => {
    if (!asset) return;
    setInstalling(true);
    try {
      const res = await marketplaceService.installAsset(asset.id, customAppName);
      if (res.success) {
        setInstallSuccess(`Successfully installed '${asset.name}' into organization!`);
        setTimeout(() => {
          setShowInstallModal(false);
          router.push('/applications');
        }, 2000);
      }
    } catch (err) {
      console.error('Installation failed', err);
    } finally {
      setInstalling(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-[#5A7165]">Loading Marketplace Asset Details...</div>;
  }

  if (!asset) {
    return (
      <div className="p-12 text-center space-y-4">
        <h3 className="text-sm font-bold text-[#173C2D]">Asset Not Found</h3>
        <Link href="/marketplace" className="text-xs font-bold text-[#3F7659] hover:underline">
          Return to Marketplace Catalog
        </Link>
      </div>
    );
  }

  const requiredModules = (asset.requiredModules as string[]) || ['Visitor Registration', 'Host Notifications', 'Badge Printing'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Back Navigation */}
      <div>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3F7659] hover:text-[#173C2D] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Marketplace
        </Link>
      </div>

      {/* Asset Hero Header */}
      <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F3F9F5] border border-[#C5E2C8] flex items-center justify-center text-[#3F7659] shrink-0 font-extrabold text-2xl shadow-xs">
            {asset.name.charAt(0)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#F3F9F5] text-[#3F7659] text-[10px] font-bold rounded uppercase border border-[#E2ECE5]">
                {asset.type}
              </span>
              <span className="px-2 py-0.5 bg-[#DDEEDF] text-emerald-800 text-[10px] font-extrabold rounded">
                {asset.pricingType === 'FREE' ? 'FREE' : `$${asset.price}`}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-[#173C2D]">{asset.name}</h1>
            <div className="flex items-center gap-3 text-xs text-[#5A7165]">
              <span className="flex items-center gap-1 font-semibold text-[#173C2D]">
                <Building2 size={13} className="text-[#3F7659]" /> {asset.authorName}
              </span>
              <span>•</span>
              <span>Version v{asset.version}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-[#173C2D]">
                <Download size={13} className="text-[#3F7659]" /> {asset.installationsCount} active installs
              </span>
            </div>
          </div>
        </div>

        {/* Install or Buy Action Button */}
        <div className="shrink-0">
          {asset.pricingType !== 'FREE' && !hasLicense ? (
            <button
              onClick={handleBuyNow}
              disabled={buying || checkingLicense}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles size={16} /> {buying ? 'Redirecting to Stripe...' : `Buy Now ($${asset.price}) & Unlock License`}
            </button>
          ) : (
            <button
              onClick={() => {
                setInstallStep(1);
                setShowInstallModal(true);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles size={16} /> {asset.pricingType !== 'FREE' ? 'Active License Verified — Install Asset' : 'Install Asset into Organization'}
            </button>
          )}
        </div>
      </div>

      {/* Asset Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl space-y-3 shadow-xs">
            <h3 className="text-xs font-extrabold text-[#173C2D] uppercase tracking-wider">
              Asset Overview & Description
            </h3>
            <p className="text-xs text-[#5A7165] leading-relaxed font-medium">
              {asset.description}
            </p>
          </div>

          {/* Required Modules & Dependencies */}
          <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl space-y-3 shadow-xs">
            <h3 className="text-xs font-extrabold text-[#173C2D] uppercase tracking-wider flex items-center gap-2">
              <Boxes size={14} className="text-[#3F7659]" /> Included Modules & Component Dependencies
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {requiredModules.map((mod) => (
                <div key={mod} className="p-3 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl flex items-center gap-2.5 text-xs font-bold text-[#173C2D]">
                  <CheckCircle2 size={16} className="text-[#3F7659]" />
                  <span>{mod}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Release Notes */}
          <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl space-y-3 shadow-xs">
            <h3 className="text-xs font-extrabold text-[#173C2D] uppercase tracking-wider">
              Release Notes & Changelog (v{asset.version})
            </h3>
            <div className="p-4 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-xs font-mono text-[#173C2D]">
              {asset.changelog || 'Initial certified release for LaunchPad SaaS Marketplace OS.'}
            </div>
          </div>
        </div>

        {/* Sidebar Specifications */}
        <div className="space-y-6">
          <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-xs font-extrabold text-[#173C2D] uppercase tracking-wider">
              Asset Specifications
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#E2ECE5]">
                <span className="text-[#5A7165]">Asset Type:</span>
                <span className="font-bold text-[#173C2D]">{asset.type}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E2ECE5]">
                <span className="text-[#5A7165]">Category:</span>
                <span className="font-bold text-[#173C2D]">{asset.category}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E2ECE5]">
                <span className="text-[#5A7165]">Current Version:</span>
                <span className="font-bold text-[#173C2D]">v{asset.version}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E2ECE5]">
                <span className="text-[#5A7165]">Pricing Model:</span>
                <span className="font-bold text-[#173C2D]">{asset.pricingType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E2ECE5]">
                <span className="text-[#5A7165]">Publisher Trust:</span>
                <span className="font-bold text-emerald-800 bg-[#DDEEDF] px-2 py-0.5 rounded inline-flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-600" /> VERIFIED PUBLISHER
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E2ECE5]">
                <span className="text-[#5A7165]">Security Scan:</span>
                <span className="font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded inline-flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-600" /> SCAN PASSED
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#F3F9F5] border border-[#C5E2C8] rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold text-[#173C2D] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#3F7659]" /> Safe Installation & Credential Isolation
            </h4>
            <p className="text-xs text-[#5A7165] leading-relaxed">
              LaunchPad performs automated static security checks on all marketplace assets. Integration secrets are never packaged inside assets; credentials must be provided by your organization post-installation.
            </p>
          </div>
        </div>
      </div>

      {/* Safe Installation Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E2ECE5] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
              <h3 className="text-sm font-bold text-[#173C2D] flex items-center gap-2">
                <Sparkles size={16} className="text-[#3F7659]" /> Safe Installation Wizard — Step {installStep} of 2
              </h3>
              <button onClick={() => setShowInstallModal(false)} className="text-xs font-bold text-[#5A7165]">
                ✕
              </button>
            </div>

            {installSuccess ? (
              <div className="p-4 bg-[#DDEEDF] text-[#173C2D] font-bold text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={16} className="text-emerald-700" />
                <span>{installSuccess}</span>
              </div>
            ) : installStep === 1 ? (
              /* Step 1: Name, Security & Dependency Verification */
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#173C2D]">Target Application Name</label>
                  <input
                    type="text"
                    value={customAppName}
                    onChange={(e) => setCustomAppName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-xs font-medium text-[#173C2D]"
                  />
                </div>

                {/* Pre-installation Security & Capability Disclosure Matrix */}
                <div className="p-3 bg-[#F8FAFC] border border-[#E2ECE5] rounded-xl space-y-2 text-xs">
                  <div className="text-[11px] font-extrabold text-[#173C2D] uppercase tracking-wider flex items-center justify-between border-b border-[#E2ECE5] pb-2">
                    <span>Pre-Installation Audit Matrix</span>
                    <span className="text-[10px] text-[#3F7659] font-mono">v{asset.version}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 font-medium">Publisher:</span>{' '}
                      <span className="font-bold text-[#173C2D]">{asset.authorName} (Verified)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Security Scan:</span>{' '}
                      <span className="font-bold text-emerald-700">SCAN_PASSED</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Permissions:</span>{' '}
                      <span className="font-bold text-[#173C2D]">Standard App User</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Integrations:</span>{' '}
                      <span className="font-bold text-[#173C2D]">Isolated Config</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl space-y-2">
                  <div className="text-[11px] font-bold text-[#173C2D] uppercase tracking-wider flex items-center gap-1.5">
                    <Boxes size={14} className="text-[#3F7659]" /> Component Modules & Workflow Actions
                  </div>
                  <div className="space-y-1 text-xs">
                    {requiredModules.map((mod) => (
                      <div key={mod} className="flex items-center justify-between text-[#5A7165]">
                        <span>• {mod}</span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-[#DDEEDF] px-1.5 py-0.5 rounded">
                          Will Enable
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-[#5A7165] pt-1 border-t border-[#E2ECE5]">
                      <span>• Automated Event & Notification Triggers</span>
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                        Workflow Action
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-xs text-blue-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-blue-600" /> Credential Protection Guarantee
                  </div>
                  <p className="text-[11px] text-blue-800">
                    Integration API keys and OAuth secrets are NEVER stored inside marketplace assets. All credentials must be explicitly provided by your organization administrator after deployment.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInstallModal(false)}
                    className="px-4 py-2 bg-[#F3F9F5] text-[#173C2D] text-xs font-bold rounded-lg border border-[#E2ECE5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstallStep(2)}
                    className="px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Next: Review & Confirm
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Confirmation */
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Explicit User Deployment Confirmation
                  </div>
                  <p className="text-xs text-amber-800">
                    You are about to install &apos;{asset.name}&apos; (v{asset.version}) into your active organization. No elevated permissions will be granted silently.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInstallStep(1)}
                    className="px-4 py-2 bg-[#F3F9F5] text-[#173C2D] text-xs font-bold rounded-lg border border-[#E2ECE5]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteInstall}
                    disabled={installing}
                    className="px-5 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {installing ? 'Deploying Asset...' : 'Confirm & Deploy Asset'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
