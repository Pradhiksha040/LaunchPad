'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Boxes,
  Server,
  Network,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Palette,
  Layers,
  FileCheck,
  Rocket,
  ShieldCheck,
  Check,
  Building,
  Users,
  Briefcase,
  FileText,
  Activity
} from 'lucide-react';
import { applicationService } from '@/services/applicationService';
import { MOCK_TEMPLATES } from '@/mock/data';
import { AppMode, BrandingConfig } from '@/types';
import { cn } from '@/lib/utils';

export default function CreateApplicationWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState('Visitor Pass OS');
  const [description, setDescription] = useState('Enterprise visitor check-in, QR badge printing, and host notifications.');
  const [industry, setIndustry] = useState('Real Estate & Facilities');
  const [appType, setAppType] = useState('Facilities & Security Management');
  const [mode, setMode] = useState<AppMode>('standalone');
  const [selectedTemplateId, setSelectedTemplateId] = useState('tpl-vms');
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'Visitor Registration',
    'Appointments',
    'Check-in/Out',
    'Host Alerts',
    'QR Badges'
  ]);

  // Integration Hub details if mode === 'integration_hub'
  const [targetSystemName, setTargetSystemName] = useState('Existing Enterprise PHP CRM');
  const [targetTechStack, setTargetTechStack] = useState('PHP 8.2 / Laravel');
  const [targetEndpointUrl, setTargetEndpointUrl] = useState('https://crm.company.com/api/v2');

  // Branding State
  const [branding, setBranding] = useState<BrandingConfig>({
    appName: 'VisitorPass OS',
    primaryColor: '#3F7659',
    secondaryColor: '#DDEEDF',
    font: 'Inter',
    buttonStyle: 'rounded',
    borderRadius: '0.625rem',
  });

  // Creation animation state
  const [creating, setCreating] = useState(false);
  const [creationStepIndex, setCreationStepIndex] = useState(0);
  const [createdAppId, setCreatedAppId] = useState<string | null>(null);

  const creationProgressSteps = [
    'Creating application structure...',
    'Injecting selected modules & schemas...',
    'Applying custom visual branding identity...',
    mode === 'standalone' ? 'Initializing LaunchPad Database & API...' : 'Binding Integration Hub Connector Gateway...',
    'Preparing application environment & deployment script...'
  ];

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
    else if (step === 6) {
      triggerCreation();
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const triggerCreation = async () => {
    setStep(7);
    setCreating(true);

    for (let i = 0; i < creationProgressSteps.length; i++) {
      setCreationStepIndex(i);
      await new Promise((r) => setTimeout(r, 600));
    }

    const created = await applicationService.createApplication({
      name,
      description,
      industry,
      type: appType,
      mode,
      templateId: selectedTemplateId,
      templateName: MOCK_TEMPLATES.find((t) => t.id === selectedTemplateId)?.name || 'Custom Template',
      modules: selectedModules,
      branding,
      targetBackend: mode === 'integration_hub' ? {
        systemName: targetSystemName,
        techStack: targetTechStack,
        connectorType: 'REST API Connector',
        endpointUrl: targetEndpointUrl,
      } : undefined,
    });

    setCreatedAppId(created.id);
    setCreating(false);
  };

  const toggleModule = (moduleName: string) => {
    if (selectedModules.includes(moduleName)) {
      setSelectedModules(selectedModules.filter((m) => m !== moduleName));
    } else {
      setSelectedModules([...selectedModules, moduleName]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#3F7659]">
            Wizard Engine • Step {step} of 7
          </span>
          <h1 className="text-2xl font-extrabold text-[#173C2D]">Create Application</h1>
        </div>
        <Link
          href="/applications"
          className="text-xs font-semibold text-[#5A7165] hover:text-[#173C2D]"
        >
          Cancel & Exit
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E2ECE5] h-2 rounded-full overflow-hidden">
        <div
          className="bg-[#3F7659] h-full transition-all duration-300 ease-out"
          style={{ width: `${(step / 7) * 100}%` }}
        />
      </div>

      {/* Wizard Step Containers */}
      <div className="bg-white border border-[#E2ECE5] rounded-2xl p-6 md:p-8 shadow-xs">
        {/* STEP 1: Basic Application Details */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-[#173C2D]">Step 1: Application Details</h2>
              <p className="text-xs text-[#5A7165]">Define basic information and metadata for your app.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#173C2D]">Application Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-[#173C2D] focus:outline-none focus:border-[#3F7659]"
                  placeholder="e.g. Visitor Pass OS, HR Portal"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#173C2D]">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-[#173C2D] focus:outline-none focus:border-[#3F7659]"
                  placeholder="Short summary of what this application handles..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#173C2D]">Industry Vertical</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-[#173C2D] focus:outline-none focus:border-[#3F7659]"
                >
                  <option value="Real Estate & Facilities">Real Estate & Facilities</option>
                  <option value="Sales & Customer Care">Sales & Customer Care</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Commerce">Commerce & D2C</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#173C2D]">Application Category</label>
                <input
                  type="text"
                  value={appType}
                  onChange={(e) => setAppType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-[#173C2D] focus:outline-none focus:border-[#3F7659]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Choose Mode (Standalone vs Integration Hub) */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-[#173C2D]">Step 2: Choose Operational Mode</h2>
              <p className="text-xs text-[#5A7165]">
                Select whether LaunchPad hosts the full infrastructure or acts as a modern UI connecting to an existing customer system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option 1: Standalone */}
              <div
                onClick={() => setMode('standalone')}
                className={cn(
                  'p-6 rounded-2xl border-2 cursor-pointer transition-all space-y-4 relative',
                  mode === 'standalone'
                    ? 'border-[#3F7659] bg-[#F3F9F5] shadow-md'
                    : 'border-[#E2ECE5] bg-white hover:border-[#DDEEDF]'
                )}
              >
                {mode === 'standalone' && (
                  <span className="absolute top-4 right-4 p-1 bg-[#3F7659] text-white rounded-full">
                    <Check size={14} />
                  </span>
                )}
                <div className="p-3 bg-[#DDEEDF] text-[#173C2D] w-fit rounded-xl">
                  <Server size={24} />
                </div>

                <div>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#3F7659] text-white rounded">
                    MODE 1
                  </span>
                  <h3 className="text-base font-bold text-[#173C2D] mt-1">Standalone Mode</h3>
                  <p className="text-xs text-[#5A7165] mt-1 leading-relaxed">
                    LaunchPad provides complete application infrastructure (Frontend, Backend, Database, Auth, Storage).
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#E2ECE5] text-[11px] font-mono text-[#173C2D] space-y-1">
                  <div>Customer → LaunchPad Frontend</div>
                  <div>→ LaunchPad Backend → Database</div>
                </div>
              </div>

              {/* Option 2: Integration Hub */}
              <div
                onClick={() => setMode('integration_hub')}
                className={cn(
                  'p-6 rounded-2xl border-2 cursor-pointer transition-all space-y-4 relative',
                  mode === 'integration_hub'
                    ? 'border-[#173C2D] bg-[#F3F9F5] shadow-md'
                    : 'border-[#E2ECE5] bg-white hover:border-[#DDEEDF]'
                )}
              >
                {mode === 'integration_hub' && (
                  <span className="absolute top-4 right-4 p-1 bg-[#173C2D] text-white rounded-full">
                    <Check size={14} />
                  </span>
                )}
                <div className="p-3 bg-[#F3EBDD] text-[#173C2D] w-fit rounded-xl">
                  <Network size={24} />
                </div>

                <div>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#173C2D] text-white rounded">
                    MODE 2
                  </span>
                  <h3 className="text-base font-bold text-[#173C2D] mt-1">Integration Hub Mode</h3>
                  <p className="text-xs text-[#5A7165] mt-1 leading-relaxed">
                    Connect LaunchPad UI to existing customer backends (PHP CRM, Python HRMS, Legacy VMS). Existing backend stays source of truth.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#E2ECE5] text-[11px] font-mono text-[#173C2D] space-y-1">
                  <div>LaunchPad Frontend → Integration Hub</div>
                  <div>→ Connector → Existing Customer Backend</div>
                </div>
              </div>
            </div>

            {/* Extra configuration fields if Integration Hub selected */}
            {mode === 'integration_hub' && (
              <div className="p-5 rounded-xl bg-[#F3F9F5] border border-[#DDEEDF] space-y-4 animate-in fade-in">
                <h4 className="text-xs font-bold text-[#173C2D] uppercase tracking-wider">
                  Target Customer System Metadata
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#173C2D]">System Name</label>
                    <input
                      type="text"
                      value={targetSystemName}
                      onChange={(e) => setTargetSystemName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E2ECE5] rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#173C2D]">Tech Stack</label>
                    <input
                      type="text"
                      value={targetTechStack}
                      onChange={(e) => setTargetTechStack(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E2ECE5] rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#173C2D]">API Base Endpoint</label>
                    <input
                      type="text"
                      value={targetEndpointUrl}
                      onChange={(e) => setTargetEndpointUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E2ECE5] rounded-md font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Choose Template */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-[#173C2D]">Step 3: Choose Template</h2>
              <p className="text-xs text-[#5A7165]">Start from a pre-configured enterprise starter or empty canvas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MOCK_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={cn(
                    'p-4 rounded-xl border cursor-pointer transition-all space-y-2 relative',
                    selectedTemplateId === tpl.id
                      ? 'border-[#3F7659] bg-[#F3F9F5] shadow-sm'
                      : 'border-[#E2ECE5] bg-white hover:border-[#DDEEDF]'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#3F7659] uppercase">{tpl.category}</span>
                    {selectedTemplateId === tpl.id && <Check size={14} className="text-[#3F7659]" />}
                  </div>
                  <h4 className="text-xs font-bold text-[#173C2D]">{tpl.name}</h4>
                  <p className="text-[11px] text-[#5A7165] line-clamp-2 leading-relaxed">{tpl.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Choose Modules */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-[#173C2D]">Step 4: Enable Core Modules</h2>
              <p className="text-xs text-[#5A7165]">Select modular capabilities to include in this application build.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'Visitor Registration',
                'Appointments',
                'Check-in/Out',
                'Host Alerts',
                'QR Badges',
                'Audit Reports',
                'Lead Pipeline',
                'Support Tickets',
                'Document Vault',
                'Payroll View',
                'Webhook Dispatcher',
                'SEO Tools'
              ].map((mod) => {
                const checked = selectedModules.includes(mod);
                return (
                  <div
                    key={mod}
                    onClick={() => toggleModule(mod)}
                    className={cn(
                      'p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs font-semibold',
                      checked
                        ? 'border-[#3F7659] bg-[#DDEEDF] text-[#173C2D]'
                        : 'border-[#E2ECE5] bg-white text-[#5A7165] hover:bg-[#F3F9F5]'
                    )}
                  >
                    <span>{mod}</span>
                    <span className={cn('w-4 h-4 rounded border flex items-center justify-center', checked ? 'bg-[#3F7659] text-white border-transparent' : 'border-[#E2ECE5]')}>
                      {checked && <Check size={12} />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Branding & Customization */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-[#173C2D]">Step 5: Application Branding</h2>
              <p className="text-xs text-[#5A7165]">Customize logos, primary theme colors, typography, and button styling.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#173C2D]">Display App Title</label>
                  <input
                    type="text"
                    value={branding.appName}
                    onChange={(e) => setBranding({ ...branding, appName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#173C2D]">Primary Color</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded border border-[#E2ECE5] cursor-pointer"
                      />
                      <span className="text-xs font-mono">{branding.primaryColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#173C2D]">Pistachio Secondary</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                        className="w-8 h-8 rounded border border-[#E2ECE5] cursor-pointer"
                      />
                      <span className="text-xs font-mono">{branding.secondaryColor}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#173C2D]">Button Corner Style</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(['sharp', 'rounded', 'pill'] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setBranding({ ...branding, buttonStyle: style })}
                        className={cn(
                          'py-1.5 text-xs font-medium capitalize rounded border',
                          branding.buttonStyle === style ? 'bg-[#3F7659] text-white border-transparent' : 'bg-white text-[#173C2D] border-[#E2ECE5]'
                        )}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-5 rounded-xl border border-[#E2ECE5] bg-[#F3F9F5] space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7165]">Real-time Component Preview</span>
                <div className="p-4 bg-white rounded-xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: branding.primaryColor }}>
                      {branding.appName}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded" style={{ backgroundColor: branding.secondaryColor, color: '#173C2D' }}>
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A7165]">Welcome to the custom branded application header preview.</p>
                  <button
                    className={cn('w-full py-2 text-xs font-bold text-white transition-all')}
                    style={{
                      backgroundColor: branding.primaryColor,
                      borderRadius: branding.buttonStyle === 'pill' ? '9999px' : branding.buttonStyle === 'sharp' ? '0px' : '8px',
                    }}
                  >
                    Action Button
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Final Review */}
        {step === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-[#173C2D]">Step 6: Review Application Blueprint</h2>
              <p className="text-xs text-[#5A7165]">Verify configuration before triggering the automated build engine.</p>
            </div>

            <div className="p-5 bg-[#F3F9F5] border border-[#DDEEDF] rounded-xl space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#5A7165]">Application Name</span>
                  <div className="font-bold text-[#173C2D] text-sm">{name}</div>
                </div>
                <div>
                  <span className="text-[#5A7165]">Operational Mode</span>
                  <div className="font-bold text-[#173C2D] capitalize flex items-center gap-1">
                    {mode === 'standalone' ? 'Standalone' : 'Integration Hub'}
                  </div>
                </div>
                <div>
                  <span className="text-[#5A7165]">Industry</span>
                  <div className="font-bold text-[#173C2D]">{industry}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2ECE5]">
                <span className="text-xs text-[#5A7165]">Selected Modules ({selectedModules.length})</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedModules.map((m) => (
                    <span key={m} className="px-2.5 py-1 text-[11px] font-semibold bg-white text-[#173C2D] rounded border border-[#E2ECE5]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Animated Creation & Success */}
        {step === 7 && (
          <div className="py-8 space-y-6 text-center animate-in fade-in duration-300">
            {creating ? (
              <div className="space-y-6 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-[#DDEEDF] text-[#3F7659] flex items-center justify-center mx-auto animate-bounce">
                  <Rocket size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#173C2D]">Building Application...</h3>
                  <p className="text-xs text-[#5A7165] mt-1">Generating platform workspace and binding services</p>
                </div>

                <div className="space-y-2 text-left bg-[#F3F9F5] p-4 rounded-xl border border-[#DDEEDF]">
                  {creationProgressSteps.map((stepText, idx) => (
                    <div key={stepText} className="flex items-center gap-3 text-xs font-semibold">
                      {idx < creationStepIndex ? (
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      ) : idx === creationStepIndex ? (
                        <span className="w-4 h-4 rounded-full border-2 border-[#3F7659] border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-gray-200 shrink-0" />
                      )}
                      <span className={idx <= creationStepIndex ? 'text-[#173C2D]' : 'text-gray-400'}>
                        {stepText}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={44} />
                </div>
                <div>
                  <span className="px-3 py-1 text-xs font-bold bg-[#DDEEDF] text-[#173C2D] rounded-full">
                    Build Complete
                  </span>
                  <h3 className="text-2xl font-black text-[#173C2D] mt-2">Application Created Successfully!</h3>
                  <p className="text-xs text-[#5A7165] mt-1">
                    Your app <strong className="text-[#173C2D]">{name}</strong> is live and ready in Development environment.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <Link
                    href={`/applications/${createdAppId || 'app-vms-01'}`}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Open Application Details
                  </Link>
                  <Link
                    href="/demos/vms"
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#F3F9F5] hover:bg-[#DDEEDF] text-[#173C2D] font-bold text-xs rounded-xl border border-[#DDEEDF] transition-all"
                  >
                    Preview App UI
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Wizard Buttons */}
      {step < 7 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#173C2D] bg-white border border-[#E2ECE5] rounded-lg disabled:opacity-40"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#3F7659] hover:bg-[#173C2D] rounded-lg shadow-sm transition-all"
          >
            {step === 6 ? 'Create Application' : 'Continue'} <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
