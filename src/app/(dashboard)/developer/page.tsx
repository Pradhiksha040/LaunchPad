'use client';

import React from 'react';
import { Code2, BookOpen, Terminal, FileCode, ExternalLink } from 'lucide-react';

export default function DeveloperPortalPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
          <Code2 size={14} /> Developer Hub
        </div>
        <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Developer Portal</h1>
        <p className="text-xs text-[#5A7165]">SDKs, OpenAPI Specs, Webhook Guides, and Custom Connector Development.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-[#E2ECE5] hover:border-[#3F7659] rounded-2xl shadow-xs transition-all space-y-3">
          <div className="p-3 bg-[#F3F9F5] text-[#3F7659] w-fit rounded-xl">
            <BookOpen size={24} />
          </div>
          <h3 className="text-base font-bold text-[#173C2D]">REST API Documentation</h3>
          <p className="text-xs text-[#5A7165] leading-relaxed">
            Complete OpenAPI 3.0 specification for LaunchPad OS endpoints and hub routers.
          </p>
        </div>

        <div className="p-6 bg-white border border-[#E2ECE5] hover:border-[#3F7659] rounded-2xl shadow-xs transition-all space-y-3">
          <div className="p-3 bg-[#F3F9F5] text-[#3F7659] w-fit rounded-xl">
            <Terminal size={24} />
          </div>
          <h3 className="text-base font-bold text-[#173C2D]">Node & Python SDKs</h3>
          <p className="text-xs text-[#5A7165] leading-relaxed">
            Official client libraries for rapid connector development and event dispatching.
          </p>
        </div>

        <div className="p-6 bg-white border border-[#E2ECE5] hover:border-[#3F7659] rounded-2xl shadow-xs transition-all space-y-3">
          <div className="p-3 bg-[#F3F9F5] text-[#3F7659] w-fit rounded-xl">
            <FileCode size={24} />
          </div>
          <h3 className="text-base font-bold text-[#173C2D]">Custom Connector Blueprint</h3>
          <p className="text-xs text-[#5A7165] leading-relaxed">
            Build custom connectors for legacy ERPs, internal microservices, and databases.
          </p>
        </div>
      </div>
    </div>
  );
}
