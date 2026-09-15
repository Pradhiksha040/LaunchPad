'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Activity,
  Search,
  Plus,
  Settings,
  Info,
  X,
  Lock,
  Package,
  Sliders,
  Calendar,
  LogIn,
  LogOut,
  QrCode,
  BellRing,
  Building2,
  Printer,
  ShieldAlert,
  AlertTriangle,
  Flame,
  BarChart3,
  Tag,
  Target,
  BadgeDollarSign,
  Kanban,
  TrendingUp,
  Clock,
  Mail,
  MessageSquare,
  Ticket,
  Megaphone,
  CreditCard,
  GraduationCap,
  School,
  Bus,
  Utensils,
  Bike,
  HeartPulse,
  Stethoscope,
  Pill,
  TestTube,
  RotateCcw,
  Star,
  Database,
  UserPlus,
  UserCheck,
  History,
  UserX,
  CheckSquare
} from 'lucide-react';
import { applicationService } from '@/services/applicationService';
import { templateService } from '@/services/templateService';
import { MOCK_TEMPLATES } from '@/mock/data';
import { AppMode, BrandingConfig, AppModuleItem } from '@/types';
import { getModulesForTemplate, getTemplateDisplayName } from '@/data/moduleCatalog';
import { cn } from '@/lib/utils';

export default function CreateApplicationWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Form State
  const [name, setName] = useState('Visitor Pass OS');
  const [description, setDescription] = useState('Enterprise visitor check-in, QR badge printing, and host notifications.');
  const [industry, setIndustry] = useState('Real Estate & Facilities');
  const [appType, setAppType] = useState('Facilities & Security Management');

  // Step 2: Mode State
  const [mode, setMode] = useState<AppMode>('standalone');

  // Step 3: Template State
  const [selectedTemplateId, setSelectedTemplateId] = useState('template-vms-01');

  // Step 4: DYNAMIC MODULE SYSTEM STATE
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [customModules, setCustomModules] = useState<AppModuleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'recommended' | 'required' | 'selected' | 'custom'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dependencyNotice, setDependencyNotice] = useState<string | null>(null);

  // Modals state
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [newCustomModule, setNewCustomModule] = useState({
    name: '',
    description: '',
    category: 'Custom',
    icon: 'Package',
    type: 'Custom',
  });

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configuringModule, setConfiguringModule] = useState<AppModuleItem | null>(null);
  const [configuredModuleMap, setConfiguredModuleMap] = useState<Record<string, AppModuleItem>>({});

  // Integration Hub details if mode === 'integration_hub'
  const [targetSystemName, setTargetSystemName] = useState('Existing Enterprise PHP CRM');
  const [targetTechStack, setTargetTechStack] = useState('PHP 8.2 / Laravel');
  const [targetEndpointUrl, setTargetEndpointUrl] = useState('https://crm.company.com/api/v2');

  // Step 5: Branding State
  const [branding, setBranding] = useState<BrandingConfig>({
    appName: 'VisitorPass OS',
    primaryColor: '#3F7659',
    secondaryColor: '#DDEEDF',
    font: 'Inter',
    buttonStyle: 'rounded',
    borderRadius: '0.625rem',
  });

  // Step 7: Creation animation state
  const [creating, setCreating] = useState(false);
  const [creationStepIndex, setCreationStepIndex] = useState(0);

  // Dynamic API Template Catalog State
  const [apiModules, setApiModules] = useState<AppModuleItem[]>([]);

  useEffect(() => {
    async function fetchModules() {
      if (selectedTemplateId) {
        try {
          const fetched = await templateService.getTemplateModules(selectedTemplateId);
          if (Array.isArray(fetched) && fetched.length > 0) {
            setApiModules(fetched);
            return;
          }
        } catch {}
      }
      setApiModules([]);
    }
    fetchModules();
  }, [selectedTemplateId]);

  // Get catalog modules for currently selected template
  const templateCatalog = useMemo(() => {
    if (apiModules.length > 0) return apiModules;
    return getModulesForTemplate(selectedTemplateId || appType || name);
  }, [apiModules, selectedTemplateId, appType, name]);

  const templateDisplayName = useMemo(() => {
    return getTemplateDisplayName(selectedTemplateId || appType || name);
  }, [selectedTemplateId, appType, name]);

  // When template changes, auto-initialize required and default modules
  useEffect(() => {
    const defaultIds = templateCatalog
      .filter((m) => m.required || m.enabledByDefault || m.recommended)
      .map((m) => m.id);
    setSelectedModuleIds(defaultIds);
  }, [selectedTemplateId, templateCatalog]);

  // Combined module list (Template modules + User Custom modules)
  const allModules = useMemo(() => {
    return [...templateCatalog, ...customModules];
  }, [templateCatalog, customModules]);

  // Extract unique categories for current template
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    allModules.forEach((m) => set.add(m.category));
    return Array.from(set);
  }, [allModules]);

  // Filtered module list based on search, status filter, and category filter
  const filteredModules = useMemo(() => {
    return allModules.filter((mod) => {
      // Category check
      if (selectedCategory !== 'all' && mod.category !== selectedCategory) {
        return false;
      }
      // Status check
      if (statusFilter === 'recommended' && !mod.recommended) return false;
      if (statusFilter === 'required' && !mod.required) return false;
      if (statusFilter === 'selected' && !selectedModuleIds.includes(mod.id)) return false;
      if (statusFilter === 'custom' && !mod.custom) return false;

      // Search query check
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const nameMatch = mod.name.toLowerCase().includes(query);
        const descMatch = mod.description.toLowerCase().includes(query);
        const catMatch = mod.category.toLowerCase().includes(query);
        return nameMatch || descMatch || catMatch;
      }

      return true;
    });
  }, [allModules, selectedCategory, statusFilter, searchQuery, selectedModuleIds]);

  // Helper to toggle module selection with dependency auto-enable
  const toggleModuleSelection = (moduleItem: AppModuleItem) => {
    if (moduleItem.required && selectedModuleIds.includes(moduleItem.id)) {
      return; // Required modules cannot be disabled
    }

    if (selectedModuleIds.includes(moduleItem.id)) {
      setSelectedModuleIds((prev) => prev.filter((id) => id !== moduleItem.id));
    } else {
      let newSelected = [...selectedModuleIds, moduleItem.id];
      if (moduleItem.dependencies && moduleItem.dependencies.length > 0) {
        const missingDeps = moduleItem.dependencies.filter((depId) => !newSelected.includes(depId));
        if (missingDeps.length > 0) {
          newSelected = [...newSelected, ...missingDeps];
          setDependencyNotice(`Auto-enabled dependent module(s): ${missingDeps.join(', ')}`);
          setTimeout(() => setDependencyNotice(null), 4000);
        }
      }
      setSelectedModuleIds(newSelected);
    }
  };

  const openConfigModal = (moduleItem: AppModuleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const existingConfig = configuredModuleMap[moduleItem.id] || moduleItem;
    setConfiguringModule({ ...existingConfig });
    setIsConfigModalOpen(true);
  };

  const handleSaveModuleConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!configuringModule) return;
    setConfiguredModuleMap((prev) => ({
      ...prev,
      [configuringModule.id]: configuringModule,
    }));
    setIsConfigModalOpen(false);
    setConfiguringModule(null);
  };

  const handleCreateCustomModuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddCustomModule();
  };

  const handleAddCustomModule = () => {
    if (!newCustomModule.name.trim()) return;
    const customId = `custom-${Date.now()}`;
    const created: AppModuleItem = {
      id: customId,
      name: newCustomModule.name,
      description: newCustomModule.description || 'User-created custom application module.',
      category: newCustomModule.category || 'Custom',
      icon: newCustomModule.icon || 'Package',
      custom: true,
      enabledByDefault: true,
      order: 99,
    };
    setCustomModules((prev) => [...prev, created]);
    setSelectedModuleIds((prev) => [...prev, customId]);
    setNewCustomModule({
      name: '',
      description: '',
      category: 'Custom',
      icon: 'Package',
      type: 'Custom',
    });
    setIsCustomModalOpen(false);
  };

  // Progress steps for wizard
  const creationProgressSteps = [
    'Validating architecture topology & parameters...',
    'Creating application structure...',
    'Injecting selected dynamic modules & schemas...',
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

    const selectedModulesPayload = allModules
      .filter((m) => selectedModuleIds.includes(m.id))
      .map((m) => {
        const configured = configuredModuleMap[m.id];
        return {
          id: m.id,
          name: m.name,
          category: m.category,
          description: m.description,
          icon: m.icon,
          required: m.required,
          custom: m.custom,
          order: m.order,
          dependencies: m.dependencies,
          visibility: configured?.visibility || m.visibility,
          permissions: configured?.permissions || m.permissions,
          configuration: configured?.configuration || m.configuration,
        };
      });

    const created = await applicationService.createApplication({
      name,
      description,
      industry,
      type: appType,
      mode,
      templateId: selectedTemplateId,
      templateName: MOCK_TEMPLATES.find((t) => t.id === selectedTemplateId)?.name || templateDisplayName,
      modules: selectedModulesPayload,
      branding,
      targetBackend: mode === 'integration_hub' ? {
        systemName: targetSystemName,
        techStack: targetTechStack,
        connectorType: 'REST API Connector',
        endpointUrl: targetEndpointUrl,
      } : undefined,
    });

    setCreating(false);
    router.push(`/applications/${created.id}`);
  };

  // Calculate selected module breakdown for summary
  const moduleSummary = useMemo(() => {
    const selectedList = allModules.filter((m) => selectedModuleIds.includes(m.id));
    const requiredCount = selectedList.filter((m) => m.required).length;
    const optionalCount = selectedList.filter((m) => !m.required && !m.custom).length;
    const customCount = selectedList.filter((m) => m.custom).length;
    return {
      total: selectedList.length,
      required: requiredCount,
      optional: optionalCount,
      custom: customCount,
      list: selectedList,
    };
  }, [allModules, selectedModuleIds]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Wizard Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#3F7659]">
            Wizard Engine • Step {step} of 7
          </span>
          <h1 className="text-2xl font-extrabold text-[#173C2D]">Create Application</h1>
        </div>
        <Link
          href="/applications"
          className="text-xs font-semibold text-[#5A7165] hover:text-[#173C2D] transition-colors"
        >
          Cancel & Exit
        </Link>
      </div>

      {/* Progress Indicator */}
      <div className="w-full bg-[#E2ECE5] h-2 rounded-full overflow-hidden">
        <div
          className="bg-[#3F7659] h-full transition-all duration-300 ease-out"
          style={{ width: `${(step / 7) * 100}%` }}
        />
      </div>

      {/* Main Wizard Card Container */}
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
                  <option value="Media & Publishing">Media & Publishing</option>
                  <option value="Custom">Custom Enterprise</option>
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

        {/* STEP 2: Choose Mode */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-[#173C2D]">Step 2: Choose Operational Mode</h2>
              <p className="text-xs text-[#5A7165]">
                Select whether LaunchPad hosts the full infrastructure or acts as a modern UI connecting to an existing customer system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    LaunchPad hosts database, authentication, RBAC, API endpoints, and storage. Ideal for brand new modular applications.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setMode('integration_hub')}
                className={cn(
                  'p-6 rounded-2xl border-2 cursor-pointer transition-all space-y-4 relative',
                  mode === 'integration_hub'
                    ? 'border-[#3F7659] bg-[#F3F9F5] shadow-md'
                    : 'border-[#E2ECE5] bg-white hover:border-[#DDEEDF]'
                )}
              >
                {mode === 'integration_hub' && (
                  <span className="absolute top-4 right-4 p-1 bg-[#3F7659] text-white rounded-full">
                    <Check size={14} />
                  </span>
                )}
                <div className="p-3 bg-[#DDEEDF] text-[#173C2D] w-fit rounded-xl">
                  <Network size={24} />
                </div>
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#173C2D] text-white rounded">
                    MODE 2
                  </span>
                  <h3 className="text-base font-bold text-[#173C2D] mt-1">Integration Hub Mode</h3>
                  <p className="text-xs text-[#5A7165] mt-1 leading-relaxed">
                    Connect LaunchPad UI to existing customer backends (PHP CRM, Python HRMS, Legacy VMS).
                  </p>
                </div>
              </div>
            </div>

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
              <p className="text-xs text-[#5A7165]">Start from a pre-configured enterprise starter or custom canvas.</p>
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

              <div
                onClick={() => setSelectedTemplateId('custom')}
                className={cn(
                  'p-4 rounded-xl border cursor-pointer transition-all space-y-2 relative flex flex-col justify-between',
                  selectedTemplateId === 'custom'
                    ? 'border-[#3F7659] bg-[#F3F9F5] shadow-sm'
                    : 'border-[#E2ECE5] bg-white hover:border-[#DDEEDF]'
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#3F7659] uppercase">Custom</span>
                    {selectedTemplateId === 'custom' && <Check size={14} className="text-[#3F7659]" />}
                  </div>
                  <h4 className="text-xs font-bold text-[#173C2D]">Custom Application</h4>
                  <p className="text-[11px] text-[#5A7165] leading-relaxed mt-1">
                    Build your module set from scratch with fully configurable capabilities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: DYNAMIC APPLICATION MODULE SYSTEM */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Dynamic Application Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#E2ECE5]">
              <div>
                <h2 className="text-lg font-extrabold text-[#173C2D]">
                  {selectedTemplateId === 'custom'
                    ? 'Step 4: Build Your Module Set'
                    : `Step 4: Configure ${templateDisplayName} Modules`}
                </h2>
                <p className="text-xs text-[#5A7165]">
                  {selectedTemplateId === 'custom'
                    ? 'Select and customize the modular building blocks for your custom application.'
                    : `Select the modular capabilities your ${templateDisplayName} application needs.`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomModalOpen(true)}
                className="px-3.5 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 w-fit"
              >
                <Plus size={14} /> Create Custom Module
              </button>
            </div>

            {/* Dependency Notice Toast Banner */}
            {dependencyNotice && (
              <div className="p-3 bg-[#DDEEDF] border border-[#3F7659]/30 text-[#173C2D] rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Info size={16} className="text-[#3F7659] shrink-0" />
                <span>{dependencyNotice}</span>
              </div>
            )}

            {/* Search and Filters Toolbar */}
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7165]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search modules by name, description, or category..."
                    className="w-full pl-9 pr-4 py-2 text-xs bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] focus:outline-none focus:border-[#3F7659]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A7165] hover:text-[#173C2D]"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1 bg-[#F3F9F5] p-1 rounded-xl border border-[#E2ECE5] text-xs">
                  {(['all', 'recommended', 'required', 'selected', 'custom'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setStatusFilter(filter)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg font-bold text-[11px] capitalize transition-all',
                        statusFilter === filter
                          ? 'bg-[#3F7659] text-white shadow-xs'
                          : 'text-[#5A7165] hover:text-[#173C2D]'
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-[10px] font-extrabold uppercase text-[#5A7165] mr-1">Category:</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 transition-all',
                    selectedCategory === 'all'
                      ? 'bg-[#173C2D] text-white border-transparent'
                      : 'bg-white text-[#5A7165] border-[#E2ECE5] hover:border-[#DDEEDF]'
                  )}
                >
                  All ({allModules.length})
                </button>
                {availableCategories.map((cat) => {
                  const count = allModules.filter((m) => m.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 transition-all',
                        selectedCategory === cat
                          ? 'bg-[#173C2D] text-white border-transparent'
                          : 'bg-white text-[#5A7165] border-[#E2ECE5] hover:border-[#DDEEDF]'
                      )}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Module Cards Grid */}
            {filteredModules.length === 0 ? (
              <div className="p-8 text-center bg-[#F3F9F5] rounded-2xl border border-dashed border-[#E2ECE5] space-y-2">
                <Boxes size={32} className="mx-auto text-[#5A7165]" />
                <h4 className="text-sm font-bold text-[#173C2D]">No matching modules found</h4>
                <p className="text-xs text-[#5A7165]">Try adjusting your search query or filter selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredModules.map((mod) => {
                  const isEnabled = selectedModuleIds.includes(mod.id);
                  const isRequired = mod.required;
                  const isCustom = mod.custom;

                  return (
                    <div
                      key={mod.id}
                      className={cn(
                        'p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative group',
                        isEnabled
                          ? 'border-[#3F7659] bg-[#F3F9F5] shadow-xs'
                          : 'border-[#E2ECE5] bg-white hover:border-[#DDEEDF]'
                      )}
                    >
                      {/* Top Bar: Icon, Name, Checkbox */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'p-2 rounded-xl text-xs font-bold transition-all',
                              isEnabled ? 'bg-[#3F7659] text-white' : 'bg-[#F3F9F5] text-[#173C2D]'
                            )}>
                              <Boxes size={16} />
                            </div>
                            <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-white border border-[#E2ECE5] text-[#3F7659]">
                              {mod.category}
                            </span>
                          </div>

                          {/* Checkbox / Lock */}
                          <button
                            type="button"
                            onClick={() => toggleModuleSelection(mod)}
                            disabled={isRequired}
                            className={cn(
                              'w-5 h-5 rounded-lg border flex items-center justify-center transition-all',
                              isRequired
                                ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                                : isEnabled
                                ? 'bg-[#3F7659] border-[#3F7659] text-white shadow-xs'
                                : 'border-[#E2ECE5] bg-white hover:border-[#3F7659]'
                            )}
                          >
                            {isRequired ? <Lock size={11} /> : isEnabled && <Check size={12} />}
                          </button>
                        </div>

                        {/* Title & Description */}
                        <h4 className="text-xs font-extrabold text-[#173C2D] group-hover:text-[#3F7659] transition-colors">
                          {mod.name}
                        </h4>
                        <p className="text-[11px] text-[#5A7165] mt-1 leading-relaxed line-clamp-2">
                          {mod.description}
                        </p>
                      </div>

                      {/* Card Footer: Badges & Configure Button */}
                      <div className="pt-2 border-t border-[#E2ECE5]/60 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          {isRequired && (
                            <span className="font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Lock size={9} /> Required
                            </span>
                          )}
                          {isCustom && (
                            <span className="font-extrabold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                              Custom Module
                            </span>
                          )}
                          {isEnabled && !isRequired && (
                            <span className="font-bold text-[#3F7659] bg-[#DDEEDF] px-1.5 py-0.5 rounded">
                              ✓ Enabled
                            </span>
                          )}
                        </div>

                        {/* Configure Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfiguringModule({ ...mod });
                            setIsConfigModalOpen(true);
                          }}
                          className="px-2 py-1 hover:bg-white text-[#5A7165] hover:text-[#173C2D] font-bold rounded border border-transparent hover:border-[#E2ECE5] transition-all flex items-center gap-1"
                        >
                          <Settings size={11} /> Configure
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Module Summary Breakdown Bar */}
            <div className="p-4 bg-[#F3F9F5] border border-[#DDEEDF] rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#173C2D] flex items-center gap-2">
                  <Layers size={15} className="text-[#3F7659]" /> Selected Modules Summary
                </span>
                <span className="font-extrabold text-[#3F7659]">
                  {moduleSummary.required} Required • {moduleSummary.optional} Optional • {moduleSummary.custom} Custom (Total: {moduleSummary.total})
                </span>
              </div>

              {/* Module Chips */}
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                {moduleSummary.list.map((m) => (
                  <span
                    key={m.id}
                    className="px-2 py-1 bg-white border border-[#E2ECE5] text-[#173C2D] text-[10px] font-semibold rounded-lg flex items-center gap-1 shadow-2xs"
                  >
                    <Check size={10} className="text-[#3F7659]" /> {m.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Branding */}
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
                    <label className="text-xs font-bold text-[#173C2D]">Secondary Color</label>
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
                  <label className="text-xs font-bold text-[#173C2D]">Font Family</label>
                  <select
                    value={branding.font}
                    onChange={(e) => setBranding({ ...branding, font: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg mt-1"
                  >
                    <option value="Inter">Inter (Modern Clean)</option>
                    <option value="Roboto">Roboto (Enterprise)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (SaaS)</option>
                  </select>
                </div>
              </div>

              {/* Branding Live Preview Box */}
              <div className="p-6 bg-[#F3F9F5] rounded-2xl border border-[#E2ECE5] space-y-4 flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase text-[#3F7659]">Visual Identity Preview</span>
                <div
                  className="p-5 rounded-xl bg-white border shadow-md space-y-3"
                  style={{ borderRadius: branding.borderRadius }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      {branding.appName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#173C2D]">{branding.appName}</h4>
                      <span className="text-[10px] text-[#5A7165]">Enterprise Workspace</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{ backgroundColor: branding.primaryColor, borderRadius: branding.borderRadius }}
                    className="w-full py-2 text-white font-bold text-xs shadow-xs"
                  >
                    Action Button
                  </button>
                </div>
                <span className="text-[10px] text-[#5A7165] text-center">Real-time styling engine applied to generated web app.</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Final Confirm */}
        {step === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-[#173C2D]">Step 6: Review Application Configuration</h2>
              <p className="text-xs text-[#5A7165]">Verify build configuration before generating backend database & API schema.</p>
            </div>

            <div className="p-5 bg-[#F3F9F5] rounded-2xl border border-[#E2ECE5] space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[#5A7165]">Application Name:</span>
                  <p className="font-bold text-[#173C2D]">{name}</p>
                </div>
                <div>
                  <span className="text-[#5A7165]">Mode:</span>
                  <p className="font-bold text-[#173C2D] uppercase">{mode}</p>
                </div>
                <div>
                  <span className="text-[#5A7165]">Template:</span>
                  <p className="font-bold text-[#173C2D]">{templateDisplayName}</p>
                </div>
                <div>
                  <span className="text-[#5A7165]">Selected Modules:</span>
                  <p className="font-bold text-[#3F7659]">{moduleSummary.total} Modules Enabled</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Progress Animation */}
        {step === 7 && (
          <div className="py-12 text-center space-y-6 animate-in fade-in duration-300">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-[#E2ECE5]" />
              <div className="absolute inset-0 rounded-full border-4 border-[#3F7659] border-t-transparent animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-[#173C2D]">Generating Application...</h3>
              <p className="text-xs font-semibold text-[#3F7659]">
                {creationProgressSteps[creationStepIndex]}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 7 && (
          <div className="flex items-center justify-between pt-6 border-t border-[#E2ECE5] mt-8">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all',
                step === 1
                  ? 'opacity-40 cursor-not-allowed text-[#5A7165]'
                  : 'bg-[#F3F9F5] text-[#173C2D] hover:bg-[#DDEEDF]'
              )}
            >
              <ArrowLeft size={14} /> Previous
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              {step === 6 ? 'Create Application' : 'Continue'} <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* MODAL 1: Create Custom Module */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-[#E2ECE5] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
              <h3 className="text-base font-extrabold text-[#173C2D] flex items-center gap-2">
                <Plus size={18} className="text-[#3F7659]" /> Create Custom Module
              </h3>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1 hover:bg-[#F3F9F5] text-[#5A7165] rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomModuleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#173C2D]">Module Name *</label>
                <input
                  type="text"
                  required
                  value={newCustomModule.name}
                  onChange={(e) => setNewCustomModule({ ...newCustomModule, name: e.target.value })}
                  placeholder="e.g. Equipment Management"
                  className="w-full px-3.5 py-2.5 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] mt-1"
                />
              </div>

              <div>
                <label className="font-bold text-[#173C2D]">Description</label>
                <textarea
                  rows={2}
                  value={newCustomModule.description}
                  onChange={(e) => setNewCustomModule({ ...newCustomModule, description: e.target.value })}
                  placeholder="Describe module capabilities..."
                  className="w-full px-3.5 py-2 text-xs bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#173C2D]">Category</label>
                  <input
                    type="text"
                    value={newCustomModule.category}
                    onChange={(e) => setNewCustomModule({ ...newCustomModule, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] mt-1"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#173C2D]">Module Type</label>
                  <select
                    value={newCustomModule.type}
                    onChange={(e) => setNewCustomModule({ ...newCustomModule, type: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl text-[#173C2D] mt-1"
                  >
                    <option value="Data Management">Data Management</option>
                    <option value="Workflow">Workflow</option>
                    <option value="Communication">Communication</option>
                    <option value="Reports">Reports</option>
                    <option value="Content">Content</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2ECE5]">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 bg-[#F3F9F5] text-[#5A7165] font-bold rounded-xl hover:bg-[#DDEEDF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3F7659] text-white font-bold rounded-xl hover:bg-[#173C2D] shadow-xs"
                >
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Configure Module */}
      {isConfigModalOpen && configuringModule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-[#E2ECE5] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
              <h3 className="text-base font-extrabold text-[#173C2D] flex items-center gap-2">
                <Settings size={18} className="text-[#3F7659]" /> Configure {configuringModule.name}
              </h3>
              <button
                onClick={() => {
                  setIsConfigModalOpen(false);
                  setConfiguringModule(null);
                }}
                className="p-1 hover:bg-[#F3F9F5] text-[#5A7165] rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveModuleConfig} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#173C2D]">Display Name</label>
                <input
                  type="text"
                  value={configuringModule.name}
                  onChange={(e) => setConfiguringModule({ ...configuringModule, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl mt-1 text-[#173C2D]"
                />
              </div>

              <div>
                <label className="font-bold text-[#173C2D]">Visibility Options</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  <label className="flex items-center gap-1.5 p-2 bg-[#F3F9F5] rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configuringModule.visibility?.dashboard !== false}
                      onChange={(e) =>
                        setConfiguringModule({
                          ...configuringModule,
                          visibility: { ...configuringModule.visibility, dashboard: e.target.checked },
                        })
                      }
                    />
                    <span>Dashboard</span>
                  </label>
                  <label className="flex items-center gap-1.5 p-2 bg-[#F3F9F5] rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configuringModule.visibility?.sidebar !== false}
                      onChange={(e) =>
                        setConfiguringModule({
                          ...configuringModule,
                          visibility: { ...configuringModule.visibility, sidebar: e.target.checked },
                        })
                      }
                    />
                    <span>Sidebar</span>
                  </label>
                  <label className="flex items-center gap-1.5 p-2 bg-[#F3F9F5] rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configuringModule.visibility?.reports === true}
                      onChange={(e) =>
                        setConfiguringModule({
                          ...configuringModule,
                          visibility: { ...configuringModule.visibility, reports: e.target.checked },
                        })
                      }
                    />
                    <span>Reports</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#173C2D]">Role Permissions</label>
                <div className="grid grid-cols-4 gap-2 mt-1.5">
                  {(['view', 'create', 'edit', 'delete'] as const).map((perm) => (
                    <label key={perm} className="flex items-center gap-1 p-2 bg-[#F3F9F5] rounded-lg cursor-pointer capitalize">
                      <input
                        type="checkbox"
                        checked={configuringModule.permissions?.[perm] !== false}
                        onChange={(e) =>
                          setConfiguringModule({
                            ...configuringModule,
                            permissions: { ...configuringModule.permissions, [perm]: e.target.checked },
                          })
                        }
                      />
                      <span>{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2ECE5]">
                <button
                  type="button"
                  onClick={() => {
                    setIsConfigModalOpen(false);
                    setConfiguringModule(null);
                  }}
                  className="px-4 py-2 bg-[#F3F9F5] text-[#5A7165] font-bold rounded-xl hover:bg-[#DDEEDF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3F7659] text-white font-bold rounded-xl hover:bg-[#173C2D] shadow-xs"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
