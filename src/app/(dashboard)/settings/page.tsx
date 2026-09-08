'use client';

import React, { useState } from 'react';
import { Settings, Palette, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';
import { useBranding } from '@/context/BrandingContext';

export default function SettingsPage() {
  const { branding, updateBranding, resetBranding } = useBranding();
  const [saved, setSaved] = useState(false);

  const presetPalettes = [
    { name: 'LaunchPad Pistachio (Default)', primary: '#3F7659', secondary: '#DDEEDF' },
    { name: 'Deep Emerald Enterprise', primary: '#173C2D', secondary: '#C5E2C8' },
    { name: 'Sage & Forest Calm', primary: '#2D5B46', secondary: '#E3EFE6' },
    { name: 'Mint Modern Tech', primary: '#1E6B52', secondary: '#D5EBDD' },
  ];

  const handleApplyPreset = (p: typeof presetPalettes[0]) => {
    updateBranding({
      primaryColor: p.primary,
      secondaryColor: p.secondary,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
          <Settings size={14} /> Platform Configuration
        </div>
        <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Settings & Theme Builder</h1>
        <p className="text-xs text-[#5A7165]">Customize platform branding, colors, dynamic CSS custom properties, and organization defaults.</p>
      </div>

      {saved && (
        <div className="p-4 bg-[#DDEEDF] text-[#173C2D] font-bold text-xs rounded-xl border border-[#C5E2C8] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-700" /> CSS Custom Variables Updated Across Application Live!
        </div>
      )}

      {/* Theme Builder Controls */}
      <div className="p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#173C2D] flex items-center gap-2">
              <Palette size={16} className="text-[#3F7659]" /> Visual Branding & Color Token Editor
            </h3>
            <p className="text-xs text-[#5A7165]">Changes immediately reflect on the CSS root variables.</p>
          </div>

          <button
            onClick={resetBranding}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F9F5] hover:bg-[#DDEEDF] text-[#173C2D] text-xs font-bold rounded-lg border border-[#E2ECE5] transition-colors"
          >
            <RefreshCw size={12} /> Reset to Default
          </button>
        </div>

        {/* Preset Palettes */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#173C2D]">Curated Pistachio Presets</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {presetPalettes.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="p-3 bg-[#F3F9F5] border border-[#E2ECE5] hover:border-[#3F7659] rounded-xl text-left transition-all space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full border border-white shadow-xs" style={{ backgroundColor: p.primary }} />
                  <span className="w-5 h-5 rounded-full border border-white shadow-xs" style={{ backgroundColor: p.secondary }} />
                </div>
                <div className="text-xs font-bold text-[#173C2D] truncate">{p.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E2ECE5]">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#173C2D]">Primary Brand Green (--lp-primary)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-[#E2ECE5] cursor-pointer"
              />
              <input
                type="text"
                value={branding.primaryColor}
                onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                className="px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#173C2D]">Secondary Pistachio (--lp-pistachio)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.secondaryColor}
                onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-[#E2ECE5] cursor-pointer"
              />
              <input
                type="text"
                value={branding.secondaryColor}
                onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
                className="px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-xs font-mono font-bold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
