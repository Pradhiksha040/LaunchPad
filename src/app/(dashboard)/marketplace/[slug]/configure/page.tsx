'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Check,
  ShieldCheck,
  Sliders,
  Palette,
  Server,
  Layers,
  Sparkles,
  QrCode,
  Users,
  Car,
  Flame,
  Printer,
  AlertTriangle,
  Info
} from 'lucide-react';
import { marketplaceService, MarketplaceAsset } from '@/services/marketplaceService';
import { applicationService } from '@/services/applicationService';
import { authService } from '@/services/authService';
import { VMS_MODULES } from '@/data/modules/vms';
import { cn } from '@/lib/utils';

export default function VmsConfigurationWizardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || 'visitor-management-system';

  const [asset, setAsset] = useState<MarketplaceAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  // Step 1: Org & Facility
  const [orgName, setOrgName] = useState('Acme Corporation');
  const [facilityName, setFacilityName] = useState('Global Tech Park - Tower 2');
  const [portalMode, setPortalMode] = useState<'ORGANIZATION' | 'EVENT'>('ORGANIZATION');
  const [adminEmail, setAdminEmail] = useState('admin@acme.com');
  const [securityDeskPhone, setSecurityDeskPhone] = useState('+91 98765 43210');

  // Step 2: Modules
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([
    'vms-visitor-registration',
    'vms-visitor-checkin',
    'vms-visitor-checkout',
    'vms-qr-badges',
    'vms-badge-printing',
    'vms-host-directory',
    'vms-host-notifications',
    'vms-parking-allocation',
    'vms-emergency-evacuation',
    'vms-visitor-reports',
    'vms-audit-reports',
  ]);

  // Step 3: Default vs Custom Requirements
  const [customizationType, setCustomizationType] = useState<'default' | 'customized'>('default');
  const [customFields, setCustomFields] = useState('Government ID Number, NDA Acceptance, Equipment Serial Number');
  const [approvalWorkflow, setApprovalWorkflow] = useState<'auto' | 'host_only' | 'security_and_host'>('host_only');
  const [customNotes, setCustomNotes] = useState('');

  // Step 4: Branding
  const [appName, setAppName] = useState('Acme SecurePass OS');
  const [primaryColor, setPrimaryColor] = useState('#3F7659'); // LaunchPad Pistachio Green
  const [secondaryColor, setSecondaryColor] = useState('#DDEEDF');
  const [buttonStyle, setButtonStyle] = useState<'rounded' | 'square' | 'pill'>('rounded');

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [authenticatedOrgId, setAuthenticatedOrgId] = useState<string | null>(null);

  useEffect(() => {
    loadAsset();
    // Load authenticated organization context
    const user = authService.getCurrentUserFromStorage();
    if (user) {
      const rawOrg = (user as any).organization;
      const orgObj = typeof rawOrg === 'object' && rawOrg !== null ? rawOrg : null;
      const orgNameStr = orgObj?.name || (typeof rawOrg === 'string' ? rawOrg : '') || user.organizationName;
      if (orgNameStr) {
        setOrgName(orgNameStr);
      }
      if (user.email) {
        setAdminEmail(user.email);
      }
      const orgId = user.organizationId || orgObj?.id;
      if (orgId) {
        setAuthenticatedOrgId(orgId);
      }
    }
  }, [slug]);

  const loadAsset = async () => {
    setLoading(true);
    try {
      const data = await marketplaceService.getAssetBySlug(slug);
      setAsset(data);
    } catch (err) {
      console.error('Failed to load asset', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (id: string, isRequired?: boolean) => {
    if (isRequired) return; // Cannot toggle mandatory modules
    if (selectedModuleIds.includes(id)) {
      setSelectedModuleIds(selectedModuleIds.filter((m) => m !== id));
    } else {
      setSelectedModuleIds([...selectedModuleIds, id]);
    }
  };

  const handleCompleteConfiguration = async () => {
    setSubmitting(true);
    setSubmitError(null);

    // Verify user is authenticated
    const currentUser = authService.getCurrentUserFromStorage();
    const rawOrg = (currentUser as any)?.organization;
    const orgObj = typeof rawOrg === 'object' && rawOrg !== null ? rawOrg : null;
    const effectiveOrgId = authenticatedOrgId || currentUser?.organizationId || orgObj?.id;

    if (!currentUser || !effectiveOrgId) {
      setSubmitError('Authentication required: You must be logged in with a valid organization account to provision applications.');
      setSubmitting(false);
      return;
    }

    try {
      const selectedModulesData = VMS_MODULES.filter((m) => selectedModuleIds.includes(m.id));

      const payload = {
        name: appName || `${orgName} Visitor Management`,
        description: `Enterprise VMS for ${facilityName} (${portalMode === 'ORGANIZATION' ? 'Corporate Office' : 'Event / Expo'} Portal)`,
        industry: 'Facilities & Security',
        type: 'Visitor Management System',
        mode: 'standalone' as const,
        templateId: 'tpl-vms',
        templateName: 'Visitor Management System',
        modules: selectedModulesData,
        branding: {
          appName: appName || 'SecurePass VMS',
          primaryColor,
          secondaryColor,
          font: 'Inter',
          buttonStyle,
          borderRadius: '0.625rem',
        },
        targetBackend: {
          systemName: 'SecurePass Django REST Framework Backend',
          techStack: 'Python Django 5.x / DRF / PostgreSQL',
          connectorType: 'REST_MANAGED_SCOPED',
          endpointUrl: 'https://api-securepass.prajai.in/api/',
        },
        // Verified Customer Tenant Isolation Profile
        configuration: {
          portalMode,
          facilityName,
          adminEmail,
          securityDeskPhone,
          isCustomized: customizationType === 'customized',
          customizationVersion: customizationType === 'customized' ? '2.4.0-custom' : '2.4.0-default',
          customFields: customizationType === 'customized' ? customFields : null,
          approvalWorkflow,
          isolationMode: 'shared_tenant_scoped',
          organizationScopeId: effectiveOrgId, // Authentic organization ID from verified session
          deployedAt: new Date().toISOString(),
          status: 'CONFIGURED',
        },
      };

      const created = await applicationService.createApplication(payload as any);
      if (!created || !created.id) {
        throw new Error('Application creation did not return a valid persistent ID.');
      }
      router.push(`/applications/${created.id}`);
    } catch (err: any) {
      console.error('Failed to register application', err);
      setSubmitError(err.message || 'Failed to save application configuration to database. Please check your credentials and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#5A7165]">
        Loading VMS Configuration Wizard...
      </div>
    );
  }

  const steps = [
    { num: 1, title: 'Facility & Portal', desc: 'Organization profile' },
    { num: 2, title: 'Module Selection', desc: 'Feature catalog' },
    { num: 3, title: 'Custom Requirements', desc: 'Default vs Customized' },
    { num: 4, title: 'Branding & Theme', desc: 'Visual identity' },
    { num: 5, title: 'Review & Register', desc: 'Launch readiness' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href={`/marketplace/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3F7659] hover:text-[#173C2D] transition-colors"
        >
          <ArrowLeft size={14} /> Back to VMS Details
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#DDEEDF] text-[#173C2D] text-[10px] font-extrabold uppercase rounded border border-[#C5E2C8]">
              Application Provisioning Wizard
            </span>
            <span className="text-xs font-semibold text-[#5A7165]">Pre-Built VMS Module v2.4.0</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#173C2D] mt-1">
            Configure Visitor Management System for Your Organization
          </h2>
          <p className="text-xs text-[#5A7165] mt-1">
            Configure organization parameters, select active modules, and connect to the verified SecurePass backend.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#173C2D]">Step {currentStep} of 5</span>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-5 gap-2">
        {steps.map((s) => (
          <div
            key={s.num}
            onClick={() => s.num < currentStep && setCurrentStep(s.num)}
            className={cn(
              'p-3 rounded-xl border text-left transition-all',
              s.num === currentStep
                ? 'bg-[#F3F9F5] border-[#3F7659] shadow-xs'
                : s.num < currentStep
                ? 'bg-white border-[#C5E2C8] cursor-pointer'
                : 'bg-white/60 border-[#E2ECE5] opacity-60'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#5A7165]">0{s.num}</span>
              {s.num < currentStep && <Check size={12} className="text-[#3F7659]" />}
            </div>
            <div className="text-xs font-bold text-[#173C2D] mt-1 truncate">{s.title}</div>
            <div className="text-[10px] text-[#5A7165] truncate">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Wizard Step 1: Org & Facility */}
      {currentStep === 1 && (
        <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-6">
          <div className="border-b border-[#E2ECE5] pb-4">
            <h3 className="text-sm font-bold text-[#173C2D] flex items-center gap-2">
              <Building2 size={16} className="text-[#3F7659]" /> Organization & Facility Setup
            </h3>
            <p className="text-xs text-[#5A7165] mt-0.5">
              Specify your tenant details and choose between Corporate Office or Event Conference mode.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#173C2D] uppercase tracking-wider mb-1">
                Customer Organization Name *
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-[#E2ECE5] rounded-lg focus:outline-none focus:border-[#3F7659]"
                placeholder="e.g. Acme Corporation"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#173C2D] uppercase tracking-wider mb-1">
                Facility / Site Name *
              </label>
              <input
                type="text"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-[#E2ECE5] rounded-lg focus:outline-none focus:border-[#3F7659]"
                placeholder="e.g. Headquarters Tower 2, North Campus"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#173C2D] uppercase tracking-wider mb-1">
                Administrator Email *
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-[#E2ECE5] rounded-lg focus:outline-none focus:border-[#3F7659]"
                placeholder="admin@yourcompany.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#173C2D] uppercase tracking-wider mb-1">
                Security Desk Phone / Hotline
              </label>
              <input
                type="text"
                value={securityDeskPhone}
                onChange={(e) => setSecurityDeskPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E2ECE5] rounded-lg focus:outline-none focus:border-[#3F7659]"
                placeholder="+1 555-0199 or +91 98765 43210"
              />
            </div>
          </div>

          {/* Portal Selection */}
          <div className="pt-2">
            <label className="block text-[11px] font-bold text-[#173C2D] uppercase tracking-wider mb-2">
              Select Primary Operating Portal
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setPortalMode('ORGANIZATION')}
                className={cn(
                  'p-4 rounded-xl border-2 cursor-pointer transition-all',
                  portalMode === 'ORGANIZATION'
                    ? 'border-[#3F7659] bg-[#F3F9F5] shadow-xs'
                    : 'border-[#E2ECE5] hover:border-[#C5E2C8] bg-white'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-[#3F7659]" />
                    <span className="text-xs font-bold text-[#173C2D]">Corporate Office VMS</span>
                  </div>
                  {portalMode === 'ORGANIZATION' && (
                    <span className="w-2 h-2 rounded-full bg-[#3F7659]" />
                  )}
                </div>
                <p className="text-[11px] text-[#5A7165] mt-2 leading-relaxed">
                  Tailored for corporate campuses, head offices, multi-tenant commercial buildings. Includes employee directory, reception desk, and vehicle parking.
                </p>
              </div>

              <div
                onClick={() => setPortalMode('EVENT')}
                className={cn(
                  'p-4 rounded-xl border-2 cursor-pointer transition-all',
                  portalMode === 'EVENT'
                    ? 'border-[#3F7659] bg-[#F3F9F5] shadow-xs'
                    : 'border-[#E2ECE5] hover:border-[#C5E2C8] bg-white'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#3F7659]" />
                    <span className="text-xs font-bold text-[#173C2D]">Event & Expo VMS</span>
                  </div>
                  {portalMode === 'EVENT' && <span className="w-2 h-2 rounded-full bg-[#3F7659]" />}
                </div>
                <p className="text-[11px] text-[#5A7165] mt-2 leading-relaxed">
                  Tailored for conferences, exhibitions, and summits. Includes exhibition halls, booth management, exhibitor staff passes, and session attendance tracking.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              Continue to Modules <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Wizard Step 2: Module Selection */}
      {currentStep === 2 && (
        <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-6">
          <div className="border-b border-[#E2ECE5] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#173C2D] flex items-center gap-2">
                <Sliders size={16} className="text-[#3F7659]" /> Pre-Built VMS Module Catalog
              </h3>
              <p className="text-xs text-[#5A7165] mt-0.5">
                Select which ready-to-use business modules will be activated in your application.
              </p>
            </div>
            <span className="text-xs font-bold text-[#3F7659]">
              {selectedModuleIds.length} of {VMS_MODULES.length} Modules Selected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {VMS_MODULES.map((mod) => {
              const isSelected = selectedModuleIds.includes(mod.id);
              const isRequired = mod.required || mod.isRequired;

              return (
                <div
                  key={mod.id}
                  onClick={() => toggleModule(mod.id, isRequired)}
                  className={cn(
                    'p-3.5 rounded-xl border transition-all select-none',
                    isRequired ? 'opacity-90 cursor-default' : 'cursor-pointer',
                    isSelected
                      ? 'bg-[#F3F9F5] border-[#3F7659] shadow-xs'
                      : 'bg-white border-[#E2ECE5] hover:border-[#C5E2C8]'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-[#173C2D]">{mod.name}</span>
                    <div
                      className={cn(
                        'w-4 h-4 rounded flex items-center justify-center shrink-0 text-white text-[10px] font-bold',
                        isSelected ? 'bg-[#3F7659]' : 'border border-slate-300'
                      )}
                    >
                      {isSelected && <Check size={10} />}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#5A7165] mt-1.5 leading-relaxed line-clamp-2">
                    {mod.description}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-mono uppercase">{mod.category}</span>
                    {isRequired && (
                      <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        Mandatory
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E2ECE5]">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 bg-[#F3F9F5] text-[#173C2D] text-xs font-bold rounded-lg border border-[#E2ECE5]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              Continue to Custom Requirements <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Wizard Step 3: Default vs Custom Requirements */}
      {currentStep === 3 && (
        <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-6">
          <div className="border-b border-[#E2ECE5] pb-4">
            <h3 className="text-sm font-bold text-[#173C2D] flex items-center gap-2">
              <Layers size={16} className="text-[#3F7659]" /> Default VMS vs. Custom Requirements
            </h3>
            <p className="text-xs text-[#5A7165] mt-0.5">
              Choose whether to deploy the verified standard application or configure customer-specific extensions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setCustomizationType('default')}
              className={cn(
                'p-5 rounded-2xl border-2 cursor-pointer transition-all',
                customizationType === 'default'
                  ? 'border-[#3F7659] bg-[#F3F9F5] shadow-xs'
                  : 'border-[#E2ECE5] bg-white hover:border-[#C5E2C8]'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#173C2D] uppercase tracking-wide">
                  Option A: Default VMS Module
                </span>
                <span className="px-2 py-0.5 bg-[#DDEEDF] text-[#173C2D] text-[10px] font-extrabold rounded">
                  Recommended
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#173C2D] mt-1.5">
                Standard Verified Application
              </h4>
              <p className="text-xs text-[#5A7165] mt-2 leading-relaxed">
                Uses the 100% pre-built, tested SecurePass VMS application. Avoids developing from scratch, activates instantly with customer configuration, and preserves the shared core.
              </p>
              <div className="mt-4 space-y-1.5 text-xs text-[#173C2D]">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 size={13} className="text-[#3F7659]" /> Instant deployment readiness
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 size={13} className="text-[#3F7659]" /> Zero custom code maintenance
                </div>
              </div>
            </div>

            <div
              onClick={() => setCustomizationType('customized')}
              className={cn(
                'p-5 rounded-2xl border-2 cursor-pointer transition-all',
                customizationType === 'customized'
                  ? 'border-[#3F7659] bg-[#F3F9F5] shadow-xs'
                  : 'border-[#E2ECE5] bg-white hover:border-[#C5E2C8]'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#173C2D] uppercase tracking-wide">
                  Option B: Customized VMS Variant
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded">
                  Isolated Extension
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#173C2D] mt-1.5">
                Customer-Specific Requirements
              </h4>
              <p className="text-xs text-[#5A7165] mt-2 leading-relaxed">
                For organizations that require additional custom visitor fields, multi-level approval hierarchies, or custom notifications. Does NOT modify the shared default module for other tenants.
              </p>
              <div className="mt-4 space-y-1.5 text-xs text-[#173C2D]">
                <div className="flex items-center gap-1.5 text-blue-800">
                  <CheckCircle2 size={13} className="text-blue-600" /> Isolated versioning (e.g. v2.4.0-custom)
                </div>
                <div className="flex items-center gap-1.5 text-blue-800">
                  <CheckCircle2 size={13} className="text-blue-600" /> Independent configuration overrides
                </div>
              </div>
            </div>
          </div>

          {/* Customization Details Form (if Option B) */}
          {customizationType === 'customized' && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-4 animate-in fade-in duration-200">
              <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Info size={14} className="text-blue-700" /> Specify Your Custom Requirements
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-blue-950 uppercase mb-1">
                    Custom Visitor Registration Fields (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={customFields}
                    onChange={(e) => setCustomFields(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                    placeholder="e.g. Government ID Number, Vehicle Emission Cert, NDA E-Sign"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-blue-950 uppercase mb-1">
                    Approval Workflow Policy
                  </label>
                  <select
                    value={approvalWorkflow}
                    onChange={(e) => setApprovalWorkflow(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="host_only">Host Approval Required (Default)</option>
                    <option value="security_and_host">2-Tier: Security Desk Pre-Screen + Host Approval</option>
                    <option value="auto">Auto-Approve for Pre-Registered Guests</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-blue-950 uppercase mb-1">
                    Additional Integration Notes
                  </label>
                  <textarea
                    rows={2}
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                    placeholder="Describe any special webhook notification or ERP/HRMS sync requirements..."
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#E2ECE5]">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 bg-[#F3F9F5] text-[#173C2D] text-xs font-bold rounded-lg border border-[#E2ECE5]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              Continue to Branding <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Wizard Step 4: Branding */}
      {currentStep === 4 && (
        <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-6">
          <div className="border-b border-[#E2ECE5] pb-4">
            <h3 className="text-sm font-bold text-[#173C2D] flex items-center gap-2">
              <Palette size={16} className="text-[#3F7659]" /> Visual Identity & Custom Branding
            </h3>
            <p className="text-xs text-[#5A7165] mt-0.5">
              Tailor the colors, application title, and aesthetic of your visitor check-in kiosk and passes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#173C2D] uppercase tracking-wider mb-1">
                  Application Display Title
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E2ECE5] rounded-lg focus:outline-none focus:border-[#3F7659]"
                  placeholder="e.g. Acme Visitor Pass OS"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#173C2D] uppercase tracking-wider mb-1">
                  Primary Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded border border-[#E2ECE5] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-32 px-3 py-2 text-xs font-mono border border-[#E2ECE5] rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setPrimaryColor('#3F7659')}
                    className="text-xs font-bold text-[#3F7659] hover:underline"
                  >
                    Reset to LaunchPad Pistachio
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#173C2D] uppercase tracking-wider mb-1">
                  Button Corner Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['rounded', 'pill', 'square'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setButtonStyle(style)}
                      className={cn(
                        'py-2 text-xs font-bold capitalize border transition-all',
                        buttonStyle === style
                          ? 'border-[#3F7659] bg-[#F3F9F5] text-[#173C2D]'
                          : 'border-[#E2ECE5] text-[#5A7165]',
                        style === 'pill' ? 'rounded-full' : style === 'rounded' ? 'rounded-lg' : 'rounded-none'
                      )}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Branding Preview Card */}
            <div className="p-5 bg-[#FCFBF8] border border-[#E2ECE5] rounded-2xl shadow-inner space-y-4">
              <span className="text-[10px] font-bold text-[#5A7165] uppercase tracking-wider block">
                Live Theme Preview
              </span>
              <div className="p-4 bg-white border border-[#E2ECE5] rounded-xl shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE5]">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {appName.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-[#173C2D]">{appName}</span>
                  </div>
                  <span className="text-[10px] text-[#5A7165] font-mono">LIVE PREVIEW</span>
                </div>

                <p className="text-xs text-[#5A7165]">
                  Welcome to {facilityName}. Please enter your visitor information below.
                </p>

                <button
                  type="button"
                  style={{ backgroundColor: primaryColor }}
                  className={cn(
                    'w-full py-2 text-white text-xs font-bold shadow-xs',
                    buttonStyle === 'pill' ? 'rounded-full' : buttonStyle === 'rounded' ? 'rounded-lg' : 'rounded-none'
                  )}
                >
                  Start Visitor Check-in
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E2ECE5]">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 bg-[#F3F9F5] text-[#173C2D] text-xs font-bold rounded-lg border border-[#E2ECE5]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="px-5 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              Continue to Review <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Wizard Step 5: Review & Register */}
      {currentStep === 5 && (
        <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-6">
          <div className="border-b border-[#E2ECE5] pb-4">
            <h3 className="text-sm font-bold text-[#173C2D] flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#3F7659]" /> Review & Register Application
            </h3>
            <p className="text-xs text-[#5A7165] mt-0.5">
              Review your configuration summary before saving and establishing connection to the VMS backend.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl space-y-2">
              <div className="font-bold text-[#173C2D] uppercase text-[11px]">Facility & Portal</div>
              <div className="text-[#5A7165]">Organization: <strong className="text-[#173C2D]">{orgName}</strong></div>
              <div className="text-[#5A7165]">Facility: <strong className="text-[#173C2D]">{facilityName}</strong></div>
              <div className="text-[#5A7165]">Portal Mode: <strong className="text-[#173C2D]">{portalMode}</strong></div>
              <div className="text-[#5A7165]">Admin Email: <strong className="text-[#173C2D]">{adminEmail}</strong></div>
            </div>

            <div className="p-4 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl space-y-2">
              <div className="font-bold text-[#173C2D] uppercase text-[11px]">Deployment & Isolation Profile</div>
              <div className="text-[#5A7165]">Module Type: <strong className="text-[#173C2D]">Visitor Management System (VMS)</strong></div>
              <div className="text-[#5A7165]">Version Profile: <strong className="text-[#173C2D]">{customizationType === 'customized' ? 'v2.4.0-custom' : 'v2.4.0-default'}</strong></div>
              <div className="text-[#5A7165]">Backend: <strong className="text-[#173C2D]">https://api-securepass.prajai.in/api/</strong></div>
              <div className="text-[#5A7165]">Tenant Isolation: <strong className="text-[#173C2D]">Controlled Multi-Tenant Scoping</strong></div>
            </div>
          </div>

          {/* Transparent Status Box */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-emerald-950">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <ShieldCheck size={16} className="text-emerald-700" /> Controlled Application Access Disclosure
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Registering this application creates a customer-isolated configuration in LaunchPad Core and establishes controlled access to the verified SecurePass backend. Full independent container provisioning remains in architectural validation.
            </p>
          </div>

          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#E2ECE5]">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 bg-[#F3F9F5] text-[#173C2D] text-xs font-bold rounded-lg border border-[#E2ECE5]"
            >
              Back
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleCompleteConfiguration}
              className="px-6 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Registering Application...' : 'Save & Register VMS Application'}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

