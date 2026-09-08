'use client';

import React, { useState } from 'react';
import { FormInput, Plus, Trash2, Save, CheckCircle2, CheckSquare, Calendar, Mail, FileText, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'dropdown' | 'checkbox';
  placeholder: string;
  required: boolean;
}

export default function FormBuilderPage() {
  const [fields, setFields] = useState<FormField[]>([
    { id: 'f-1', label: 'Full Legal Name', type: 'text', placeholder: 'Enter full name', required: true },
    { id: 'f-2', label: 'Email Address', type: 'email', placeholder: 'name@company.com', required: true },
    { id: 'f-3', label: 'Department / Organization', type: 'dropdown', placeholder: 'Select department', required: false },
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const addField = (type: FormField['type']) => {
    const newF: FormField = {
      id: `f-${Date.now()}`,
      label: `New ${type.toUpperCase()} Field`,
      type,
      placeholder: `Enter ${type}...`,
      required: false,
    };
    setFields([...fields, newF]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
            <FormInput size={14} /> Form Composer Engine
          </div>
          <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Visual Form Builder</h1>
          <p className="text-xs text-[#5A7165]">Construct intake forms, surveys, and data input interfaces.</p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <CheckCircle2 size={14} /> Schema Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Save size={14} /> Save Form Schema
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Field Palette */}
        <div className="lg:col-span-4 p-5 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#173C2D] uppercase tracking-wider">Field Elements</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'text', label: 'Short Text', icon: FileText },
              { type: 'email', label: 'Email Input', icon: Mail },
              { type: 'number', label: 'Number', icon: FormInput },
              { type: 'date', label: 'Date Picker', icon: Calendar },
              { type: 'dropdown', label: 'Select Dropdown', icon: ChevronDown },
              { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.type}
                  onClick={() => addField(f.type as any)}
                  className="p-3 rounded-xl bg-[#F3F9F5] border border-[#E2ECE5] hover:border-[#3F7659] text-xs font-bold text-[#173C2D] flex items-center gap-2 transition-all"
                >
                  <Icon size={16} className="text-[#3F7659]" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Form Composer Preview */}
        <div className="lg:col-span-8 p-6 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
            <h3 className="text-xs font-bold text-[#173C2D] uppercase tracking-wider">Form Canvas Preview</h3>
            <span className="text-xs text-[#5A7165]">{fields.length} Fields Configured</span>
          </div>

          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id} className="p-4 rounded-xl bg-[#F3F9F5] border border-[#E2ECE5] space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => {
                      const newLabel = e.target.value;
                      setFields(fields.map((f) => (f.id === field.id ? { ...f, label: newLabel } : f)));
                    }}
                    className="font-bold text-xs text-[#173C2D] bg-transparent border-b border-transparent hover:border-[#3F7659] focus:outline-none"
                  />
                  <button onClick={() => removeField(field.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>

                <input
                  type={field.type === 'email' ? 'email' : 'text'}
                  placeholder={field.placeholder}
                  disabled
                  className="w-full px-3 py-2 bg-white border border-[#E2ECE5] rounded-lg text-xs text-[#5A7165]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
