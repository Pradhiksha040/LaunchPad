'use client';

import React, { useState, useEffect } from 'react';
import {
  Code2,
  BookOpen,
  Webhook,
  Activity,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  Copy,
  Terminal,
  ShieldCheck,
  Zap,
  ExternalLink,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { developerService, WebhookSubscription, ApiEndpointCatalogItem } from '@/services/developerService';

export default function DeveloperPortalPage() {
  const [activeTab, setActiveTab] = useState<'docs' | 'webhooks' | 'telemetry'>('docs');
  
  // Endpoints Catalog State
  const [endpoints, setEndpoints] = useState<ApiEndpointCatalogItem[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointCatalogItem | null>(null);

  // Webhooks State
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
  const [loadingWebhooks, setLoadingWebhooks] = useState(false);
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'visitor.created',
    'workflow.execution.completed',
  ]);
  const [creatingWebhook, setCreatingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{ id: string; message: string } | null>(null);

  const availableEvents = [
    { id: 'visitor.created', label: 'Visitor Created' },
    { id: 'visitor.approved', label: 'Visitor Approved' },
    { id: 'appointment.created', label: 'Appointment Created' },
    { id: 'workflow.execution.completed', label: 'Workflow Execution Completed' },
    { id: 'workflow.execution.failed', label: 'Workflow Execution Failed' },
    { id: 'application.created', label: 'Application Created' },
  ];

  async function loadData() {
    const catalog = await developerService.getApiCatalog();
    setEndpoints(catalog);
    if (catalog.length > 0) setSelectedEndpoint(catalog[0]);

    setLoadingWebhooks(true);
    const hooks = await developerService.getWebhooks();
    setWebhooks(hooks);
    setLoadingWebhooks(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleEvent = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter((e) => e !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookName.trim() || !webhookUrl.trim()) return;

    setCreatingWebhook(true);
    try {
      await developerService.createWebhook({
        name: webhookName,
        targetUrl: webhookUrl,
        events: selectedEvents,
      });

      setShowCreateWebhook(false);
      setWebhookName('');
      setWebhookUrl('');
      const updated = await developerService.getWebhooks();
      setWebhooks(updated);
    } catch {
      alert('Failed to create webhook subscription');
    } finally {
      setCreatingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      await developerService.deleteWebhook(id);
      setWebhooks(webhooks.filter((w) => w.id !== id));
    } catch {
      alert('Failed to delete webhook');
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      const res = await developerService.testWebhook(id);
      setTestResult({
        id,
        message: `Test ping dispatched cleanly (Status ${res.statusCode})`,
      });
      setTimeout(() => setTestResult(null), 3000);
    } catch {
      alert('Failed to test webhook');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F7659] uppercase tracking-wider">
            <Code2 size={14} /> Developer Portal & Integration Services
          </div>
          <h1 className="text-2xl font-extrabold text-[#173C2D] mt-0.5">Developer Hub</h1>
          <p className="text-xs text-[#5A7165]">
            OpenAPI Specs, Public API Catalog, Webhook Subscriptions, and Rate Limit Telemetry.
          </p>
        </div>

        <a
          href="http://localhost:4000/api/docs"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl shadow-xs transition-all w-fit"
        >
          <ExternalLink size={14} /> Open Live Swagger UI
        </a>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E2ECE5] pb-px">
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'docs'
              ? 'border-[#3F7659] text-[#173C2D]'
              : 'border-transparent text-[#5A7165] hover:text-[#173C2D]'
          }`}
        >
          <BookOpen size={16} /> REST API Catalog & Docs
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'webhooks'
              ? 'border-[#3F7659] text-[#173C2D]'
              : 'border-transparent text-[#5A7165] hover:text-[#173C2D]'
          }`}
        >
          <Webhook size={16} /> Webhook Subscriptions
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'telemetry'
              ? 'border-[#3F7659] text-[#173C2D]'
              : 'border-transparent text-[#5A7165] hover:text-[#173C2D]'
          }`}
        >
          <Activity size={16} /> Telemetry & Rate Limits
        </button>
      </div>

      {/* TAB 1: REST API CATALOG */}
      {activeTab === 'docs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Endpoints Sidebar */}
          <div className="bg-white border border-[#E2ECE5] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#173C2D] uppercase tracking-wider">Available Endpoints</h3>
            <div className="space-y-1">
              {endpoints.map((ep) => (
                <button
                  key={`${ep.method}-${ep.path}`}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between text-xs ${
                    selectedEndpoint?.path === ep.path && selectedEndpoint?.method === ep.method
                      ? 'bg-[#F3F9F5] border border-[#3F7659]/30 text-[#173C2D] font-bold'
                      : 'hover:bg-[#F3F9F5] text-[#5A7165]'
                  }`}
                >
                  <div className="space-y-0.5 truncate">
                    <div className="font-semibold">{ep.name}</div>
                    <div className="font-mono text-[10px] text-[#5A7165]">{ep.path}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md font-mono ${
                      ep.method === 'GET'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {ep.method}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint Inspector */}
          {selectedEndpoint && (
            <div className="md:col-span-2 bg-white border border-[#E2ECE5] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-4">
                <div>
                  <span
                    className={`px-2.5 py-1 text-xs font-extrabold rounded-md font-mono mr-2 ${
                      selectedEndpoint.method === 'GET'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <span className="font-mono text-sm font-bold text-[#173C2D]">
                    {selectedEndpoint.path}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#F3F9F5] text-[#3F7659] font-mono text-xs rounded-lg font-bold">
                    Scope: {selectedEndpoint.requiredScope}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#173C2D] uppercase tracking-wider mb-1">Description</h4>
                <p className="text-xs text-[#5A7165] leading-relaxed">{selectedEndpoint.description}</p>
              </div>

              {/* Request Code Snippet */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#173C2D] uppercase tracking-wider">Example Request (cURL)</h4>
                <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl overflow-x-auto">
                  curl -X {selectedEndpoint.method} "http://localhost:4000{selectedEndpoint.path}" \<br />
                  &nbsp;&nbsp;-H "x-api-key: lp_live_98a7****************3b1f" \<br />
                  &nbsp;&nbsp;-H "Content-Type: application/json"
                </div>
              </div>

              {/* JS Snippet */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#173C2D] uppercase tracking-wider">Node.js / Fetch</h4>
                <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl overflow-x-auto">
                  const res = await fetch("http://localhost:4000{selectedEndpoint.path}", &#123;<br />
                  &nbsp;&nbsp;method: "{selectedEndpoint.method}",<br />
                  &nbsp;&nbsp;headers: &#123; "x-api-key": "lp_live_..." &#125;<br />
                  &#125;);<br />
                  const data = await res.json();
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WEBHOOK SUBSCRIPTIONS */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#173C2D]">Outbound Webhooks</h3>
              <p className="text-xs text-[#5A7165]">Configure HTTP push destinations for system events & workflows.</p>
            </div>

            <button
              onClick={() => setShowCreateWebhook(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              <Plus size={16} /> Add Webhook Subscription
            </button>
          </div>

          {testResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" /> {testResult.message}
            </div>
          )}

          <div className="bg-white border border-[#E2ECE5] rounded-2xl overflow-hidden shadow-xs">
            {loadingWebhooks ? (
              <div className="p-8 text-center text-xs text-[#5A7165] flex items-center justify-center gap-2">
                <RefreshCw size={16} className="animate-spin text-[#3F7659]" /> Loading webhooks...
              </div>
            ) : webhooks.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Webhook size={32} className="mx-auto text-[#5A7165]" />
                <h3 className="text-sm font-bold text-[#173C2D]">No Webhook Subscriptions</h3>
                <p className="text-xs text-[#5A7165]">Subscribe your external backend endpoints to LaunchPad events.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3F9F5] border-b border-[#E2ECE5] text-[#173C2D] font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Destination URL</th>
                    <th className="p-4">Subscribed Events</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F9F5]">
                  {webhooks.map((w) => (
                    <tr key={w.id} className="hover:bg-[#F3F9F5] transition-colors">
                      <td className="p-4 font-bold text-[#173C2D]">
                        {w.name}
                        <div className="text-[10px] font-mono text-[#5A7165]">{w.secret}</div>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-[#3F7659] font-semibold truncate max-w-xs">
                        {w.targetUrl}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {w.events.map((e) => (
                            <span key={e} className="px-2 py-0.5 bg-[#F3F9F5] text-[#3F7659] text-[10px] rounded-md font-mono">
                              {e}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                          {w.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleTestWebhook(w.id)}
                          className="px-2.5 py-1 bg-[#F3F9F5] hover:bg-[#3F7659] hover:text-white text-[#3F7659] font-bold text-[11px] rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Send size={12} /> Test Ping
                        </button>
                        <button
                          onClick={() => handleDeleteWebhook(w.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors inline-block"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TELEMETRY & RATE LIMITS */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 bg-white border border-[#E2ECE5] rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[#5A7165]">
                <span className="text-xs font-bold uppercase tracking-wider">Active API Keys</span>
                <ShieldCheck size={18} className="text-[#3F7659]" />
              </div>
              <div className="text-2xl font-extrabold text-[#173C2D]">2</div>
              <p className="text-[11px] text-[#5A7165]">Hashed SHA-256 tokens</p>
            </div>

            <div className="p-5 bg-white border border-[#E2ECE5] rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[#5A7165]">
                <span className="text-xs font-bold uppercase tracking-wider">Webhooks Active</span>
                <Webhook size={18} className="text-[#3F7659]" />
              </div>
              <div className="text-2xl font-extrabold text-[#173C2D]">{webhooks.length}</div>
              <p className="text-[11px] text-[#5A7165]">Event dispatch channels</p>
            </div>

            <div className="p-5 bg-white border border-[#E2ECE5] rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[#5A7165]">
                <span className="text-xs font-bold uppercase tracking-wider">Rate Limit Policy</span>
                <Zap size={18} className="text-[#3F7659]" />
              </div>
              <div className="text-2xl font-extrabold text-[#173C2D]">100 - 1K</div>
              <p className="text-[11px] text-[#5A7165]">Requests per 60-second window</p>
            </div>

            <div className="p-5 bg-white border border-[#E2ECE5] rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[#5A7165]">
                <span className="text-xs font-bold uppercase tracking-wider">Avg Latency</span>
                <Activity size={18} className="text-[#3F7659]" />
              </div>
              <div className="text-2xl font-extrabold text-[#173C2D]">38 ms</div>
              <p className="text-[11px] text-emerald-600 font-bold">100% gateway success rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Webhook */}
      {showCreateWebhook && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E2ECE5] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
              <h3 className="text-base font-extrabold text-[#173C2D] flex items-center gap-2">
                <Webhook size={18} className="text-[#3F7659]" /> New Webhook Subscription
              </h3>
              <button
                onClick={() => setShowCreateWebhook(false)}
                className="text-xs font-bold text-[#5A7165] hover:text-[#173C2D]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWebhook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#173C2D] mb-1">Webhook Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Visitor Sync Webhook"
                  value={webhookName}
                  onChange={(e) => setWebhookName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E2ECE5] rounded-xl focus:outline-hidden focus:border-[#3F7659]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#173C2D] mb-1">Destination Target URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.yourcompany.com/v1/webhooks"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E2ECE5] rounded-xl focus:outline-hidden focus:border-[#3F7659]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#173C2D] mb-2">Subscribed Event Triggers</label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-xl">
                  {availableEvents.map((evt) => (
                    <label key={evt.id} className="flex items-center gap-2 text-xs text-[#173C2D] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(evt.id)}
                        onChange={() => handleToggleEvent(evt.id)}
                        className="rounded border-[#E2ECE5] text-[#3F7659] focus:ring-0"
                      />
                      <span className="font-medium">{evt.label}</span>
                      <span className="text-[10px] font-mono text-[#5A7165] ml-auto">({evt.id})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2ECE5]">
                <button
                  type="button"
                  onClick={() => setShowCreateWebhook(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5A7165] hover:text-[#173C2D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingWebhook}
                  className="px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  {creatingWebhook ? 'Creating...' : 'Create Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
