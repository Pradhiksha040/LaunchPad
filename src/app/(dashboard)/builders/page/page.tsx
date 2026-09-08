'use client';

import React, { useState } from 'react';
import {
  FileCode2,
  Plus,
  Move,
  Trash2,
  Eye,
  Save,
  Send,
  Type,
  Square,
  BarChart2,
  Table as TableIcon,
  FormInput,
  Image as ImageIcon,
  Layout,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasItem {
  id: string;
  type: 'Heading' | 'Text' | 'Button' | 'Card' | 'Table' | 'Chart';
  title: string;
  props: { content: string; style: string };
}

export default function PageBuilderPage() {
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([
    { id: 'c-1', type: 'Heading', title: 'Header Banner', props: { content: 'Welcome to Enterprise Portal', style: 'text-2xl font-bold text-[#173C2D]' } },
    { id: 'c-2', type: 'Card', title: 'Stats Summary Card', props: { content: 'Displays key application KPIs and active metrics.', style: 'p-4 bg-white border border-[#E2ECE5] rounded-xl' } },
    { id: 'c-3', type: 'Table', title: 'Data Grid Component', props: { content: 'Renders connected dataset rows dynamically.', style: 'w-full text-xs' } },
  ]);

  const [selectedItemId, setSelectedItemId] = useState<string | null>('c-1');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const addComponent = (type: CanvasItem['type']) => {
    const newItem: CanvasItem = {
      id: `c-${Date.now()}`,
      type,
      title: `${type} Component`,
      props: { content: `New ${type} element`, style: 'text-xs text-[#173C2D]' },
    };
    setCanvasItems([...canvasItems, newItem]);
    setSelectedItemId(newItem.id);
  };

  const removeItem = (id: string) => {
    setCanvasItems(canvasItems.filter((item) => item.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const selectedItem = canvasItems.find((item) => item.id === selectedItemId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
            <FileCode2 size={14} /> Frontend Component Builder
          </div>
          <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Visual Page Builder</h1>
          <p className="text-xs text-[#5A7165]">Drag, compose, and layout UI components for generated applications.</p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <CheckCircle2 size={14} /> Layout Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Save size={14} /> Save Page Layout
          </button>
        </div>
      </div>

      {/* 3-Column Layout: Components Palette | Live Canvas | Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Column 1: Components Palette (3 cols) */}
        <div className="lg:col-span-3 p-5 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#173C2D] uppercase tracking-wider">
            Component Library
          </h3>
          <div className="space-y-2">
            {[
              { type: 'Heading', icon: Type, label: 'Heading Title' },
              { type: 'Text', icon: Square, label: 'Text Paragraph' },
              { type: 'Button', icon: Square, label: 'Action Button' },
              { type: 'Card', icon: Layout, label: 'Card Container' },
              { type: 'Table', icon: TableIcon, label: 'Data Table' },
              { type: 'Chart', icon: BarChart2, label: 'Analytics Chart' },
            ].map((comp) => {
              const Icon = comp.icon;
              return (
                <button
                  key={comp.type}
                  onClick={() => addComponent(comp.type as any)}
                  className="w-full p-3 rounded-xl bg-[#F3F9F5] border border-[#E2ECE5] hover:border-[#3F7659] text-xs font-bold text-[#173C2D] flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-[#3F7659]" />
                    <span>{comp.label}</span>
                  </div>
                  <Plus size={14} className="text-[#5A7165] group-hover:text-[#3F7659]" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Live Drag & Compose Canvas (6 cols) */}
        <div className="lg:col-span-6 p-6 bg-white border-2 border-dashed border-[#DDEEDF] rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE5] mb-4">
              <span className="text-xs font-bold text-[#173C2D] uppercase tracking-wider">
                Live Interactive Canvas ({canvasItems.length} elements)
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#DDEEDF] text-[#173C2D] rounded">
                Viewport Preview
              </span>
            </div>

            <div className="space-y-3">
              {canvasItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={cn(
                    'p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group',
                    selectedItemId === item.id
                      ? 'border-[#3F7659] bg-[#F3F9F5] shadow-xs'
                      : 'border-[#E2ECE5] bg-white hover:border-[#DDEEDF]'
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Move size={12} className="text-[#5A7165]" />
                      <span className="text-xs font-bold text-[#173C2D]">{item.title}</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#DDEEDF] text-[#173C2D] rounded">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A7165] pl-5">{item.props.content}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Inspector Properties Panel (3 cols) */}
        <div className="lg:col-span-3 p-5 bg-white border border-[#E2ECE5] rounded-2xl shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#173C2D] uppercase tracking-wider">
            Property Inspector
          </h3>

          {selectedItem ? (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#173C2D]">Component Label</label>
                <input
                  type="text"
                  value={selectedItem.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setCanvasItems(
                      canvasItems.map((i) => (i.id === selectedItem.id ? { ...i, title: newTitle } : i))
                    );
                  }}
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg mt-1"
                />
              </div>

              <div>
                <label className="font-bold text-[#173C2D]">Default Content Text</label>
                <textarea
                  value={selectedItem.props.content}
                  onChange={(e) => {
                    const newContent = e.target.value;
                    setCanvasItems(
                      canvasItems.map((i) =>
                        i.id === selectedItem.id ? { ...i, props: { ...i.props, content: newContent } } : i
                      )
                    );
                  }}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg mt-1"
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#5A7165]">Click any component on the canvas to inspect and modify properties.</p>
          )}
        </div>
      </div>
    </div>
  );
}
