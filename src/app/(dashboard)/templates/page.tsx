'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Search,
  Sparkles,
  ArrowRight,
  Check,
  Building2,
  FileText,
  Users,
  Briefcase,
  GraduationCap,
  Calendar,
  Utensils,
  Activity,
  ShoppingBag,
  Clock,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { MOCK_TEMPLATES } from '@/mock/data';
import { cn } from '@/lib/utils';

export default function TemplateMarketplacePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<typeof MOCK_TEMPLATES[0] | null>(null);

  const categories = ['All', 'Healthcare', 'Education', 'Business', 'Commerce', 'Events', 'Services', 'Marketplace'];

  const filteredTemplates = MOCK_TEMPLATES.filter((tpl) => {
    const matchesCat = selectedCategory === 'All' || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return Building2;
      case 'FileText': return FileText;
      case 'Users': return Users;
      case 'Briefcase': return Briefcase;
      case 'GraduationCap': return GraduationCap;
      case 'Calendar': return Calendar;
      case 'Utensils': return Utensils;
      case 'Activity': return Activity;
      case 'ShoppingBag': return ShoppingBag;
      case 'Clock': return Clock;
      case 'Layers': return Layers;
      case 'ShieldCheck': return ShieldCheck;
      default: return LayoutGrid;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-[#173C2D] to-[#3F7659] text-white rounded-2xl shadow-md space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#DDEEDF]">
          <Sparkles size={14} /> Enterprise Marketplace
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Template Marketplace</h1>
        <p className="text-xs md:text-sm text-[#DDEEDF] max-w-2xl leading-relaxed">
          Pre-built enterprise application templates configured with modular data structures, workflows, and UI views.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-[#E2ECE5] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7165]" size={15} />
          <input
            type="text"
            placeholder="Search templates by industry or module..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-[#173C2D] focus:outline-none focus:border-[#3F7659]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap',
                selectedCategory === cat
                  ? 'bg-[#3F7659] text-white shadow-2xs'
                  : 'bg-[#F3F9F5] text-[#5A7165] hover:bg-[#DDEEDF] hover:text-[#173C2D]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tpl) => {
          const Icon = getTemplateIcon(tpl.iconName);
          return (
            <div
              key={tpl.id}
              className="group p-5 bg-white border border-[#E2ECE5] hover:border-[#3F7659] rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-[#F3F9F5] text-[#3F7659] group-hover:bg-[#DDEEDF] transition-colors">
                    <Icon size={24} />
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-extrabold bg-[#DDEEDF] text-[#173C2D] rounded-full">
                    {tpl.popularity}% popular
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#5A7165] uppercase tracking-wider">
                    {tpl.industry}
                  </span>
                  <h3 className="text-base font-bold text-[#173C2D] group-hover:text-[#3F7659] transition-colors mt-0.5">
                    {tpl.name}
                  </h3>
                </div>

                <p className="text-xs text-[#5A7165] line-clamp-3 leading-relaxed">
                  {tpl.description}
                </p>

                {/* Included Modules Badges */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {tpl.modules.slice(0, 4).map((mod) => (
                    <span
                      key={mod}
                      className="px-2 py-0.5 text-[10px] font-medium bg-[#F3F9F5] text-[#173C2D] rounded border border-[#E2ECE5]"
                    >
                      {mod}
                    </span>
                  ))}
                  {tpl.modules.length > 4 && (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-[#DDEEDF] text-[#173C2D] rounded">
                      +{tpl.modules.length - 4}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E2ECE5] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(tpl)}
                  className="px-3.5 py-2 text-xs font-bold text-[#173C2D] bg-[#F3F9F5] hover:bg-[#DDEEDF] rounded-lg transition-colors"
                >
                  Quick View
                </button>

                <Link
                  href={`/applications/create?template=${tpl.id}`}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3F7659] hover:bg-[#173C2D] rounded-lg shadow-2xs transition-all"
                >
                  Use Template <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2ECE5] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#3F7659]">
                  {previewTemplate.category} Template
                </span>
                <h3 className="text-lg font-bold text-[#173C2D]">{previewTemplate.name}</h3>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-xs font-bold text-[#5A7165] hover:text-[#173C2D]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#5A7165] leading-relaxed">{previewTemplate.description}</p>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#173C2D]">Bundled Core Modules:</span>
              <div className="flex flex-wrap gap-1.5">
                {previewTemplate.modules.map((m) => (
                  <span key={m} className="px-2.5 py-1 text-xs font-semibold bg-[#DDEEDF] text-[#173C2D] rounded-md">
                    ✓ {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2ECE5]">
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 text-xs font-semibold text-[#5A7165] hover:bg-[#F3F9F5] rounded-lg"
              >
                Close
              </button>
              <Link
                href={`/applications/create?template=${previewTemplate.id}`}
                className="px-5 py-2 text-xs font-bold text-white bg-[#3F7659] hover:bg-[#173C2D] rounded-lg shadow-xs"
              >
                Use Template Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
