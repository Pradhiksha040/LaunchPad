'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Search,
  Filter,
  Boxes,
  GitFork,
  Layers,
  Sparkles,
  Download,
  CheckCircle2,
  ExternalLink,
  Plus,
  Building2,
  Tag,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { marketplaceService, MarketplaceAsset } from '@/services/marketplaceService';

export default function MarketplacePage() {
  const [assets, setAssets] = useState<MarketplaceAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPricing, setSelectedPricing] = useState('All');

  // Publisher Registration Modal
  const [showPublisherModal, setShowPublisherModal] = useState(false);
  const [pubName, setPubName] = useState('');
  const [pubDesc, setPubDesc] = useState('');
  const [pubMsg, setPubMsg] = useState<string | null>(null);

  const categories = ['All', 'Operations', 'CRM', 'HRMS', 'Finance', 'General'];
  const assetTypes = ['All', 'APPLICATION', 'MODULE', 'WORKFLOW'];
  const pricingTypes = ['All', 'FREE', 'ONE_TIME', 'SUBSCRIPTION'];

  useEffect(() => {
    loadCatalog();
  }, [selectedCategory, selectedType, selectedPricing]);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const data = await marketplaceService.getPublicAssets({
        search: searchQuery,
        category: selectedCategory,
        type: selectedType,
        pricingType: selectedPricing,
      });
      setAssets(data);
    } catch (err) {
      console.error('Failed to load marketplace assets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCatalog();
  };

  const handleRegisterPublisher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubName.trim()) return;
    try {
      await marketplaceService.registerPublisher({
        publisherName: pubName,
        description: pubDesc,
      });
      setPubMsg(`Organization registered as Publisher '${pubName}'!`);
      setTimeout(() => {
        setShowPublisherModal(false);
        setPubMsg(null);
      }, 2000);
    } catch (err) {
      setPubMsg('Publisher registration failed.');
    }
  };

  const filteredAssets = assets.filter((ast) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ast.name.toLowerCase().includes(q) ||
        ast.description.toLowerCase().includes(q) ||
        ast.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#173C2D] via-[#2D5B46] to-[#3F7659] text-white rounded-2xl shadow-sm">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C5E2C8] uppercase tracking-wider">
            <Store size={14} /> Partner Ecosystem & App Store
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">LaunchPad App Marketplace</h1>
          <p className="text-xs text-[#DDEEDF] leading-relaxed">
            Discover, review, and deploy certified applications, dynamic modules, and automated workflows across your multi-tenant organization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPublisherModal(true)}
            className="px-4 py-2 bg-[#DDEEDF] hover:bg-white text-[#173C2D] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus size={14} /> Become a Publisher
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 bg-white border border-[#E2ECE5] rounded-2xl space-y-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-[#5A7165]" />
            <input
              type="text"
              placeholder="Search apps, modules, workflows, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F3F9F5] border border-[#E2ECE5] focus:border-[#3F7659] rounded-xl text-xs font-medium text-[#173C2D] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#E2ECE5] text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#173C2D]">Category:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all text-xs ${
                    selectedCategory === cat
                      ? 'bg-[#3F7659] text-white'
                      : 'bg-[#F3F9F5] text-[#5A7165] hover:text-[#173C2D] border border-[#E2ECE5]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Type Filter */}
          <div className="flex items-center gap-2 border-l border-[#E2ECE5] pl-4">
            <span className="font-bold text-[#173C2D]">Asset Type:</span>
            <div className="flex items-center gap-1.5">
              {assetTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all text-xs ${
                    selectedType === t
                      ? 'bg-[#173C2D] text-white'
                      : 'bg-[#F3F9F5] text-[#5A7165] hover:text-[#173C2D] border border-[#E2ECE5]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Grid Catalog */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#5A7165]">Loading Marketplace Ecosystem...</div>
      ) : filteredAssets.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E2ECE5] rounded-2xl space-y-3">
          <Store size={32} className="mx-auto text-[#5A7165]" />
          <h3 className="text-sm font-bold text-[#173C2D]">No Marketplace Assets Found</h3>
          <p className="text-xs text-[#5A7165]">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((ast) => (
            <div
              key={ast.id}
              className="p-5 bg-white border border-[#E2ECE5] hover:border-[#3F7659] rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-[#F3F9F5] text-[#3F7659] font-bold text-[10px] rounded-md border border-[#E2ECE5] uppercase tracking-wider flex items-center gap-1">
                    {ast.type === 'APPLICATION' ? (
                      <Boxes size={12} />
                    ) : ast.type === 'WORKFLOW' ? (
                      <GitFork size={12} />
                    ) : (
                      <Layers size={12} />
                    )}
                    {ast.type}
                  </span>

                  <span className="px-2 py-0.5 bg-[#DDEEDF] text-emerald-800 text-[10px] font-extrabold rounded-md">
                    {ast.pricingType === 'FREE' ? 'FREE' : `$${ast.price}`}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-extrabold text-[#173C2D] group-hover:text-[#3F7659] transition-colors truncate">
                    {ast.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#5A7165] mt-0.5">
                    <Building2 size={12} />
                    <span>{ast.authorName}</span>
                    <span>•</span>
                    <span>v{ast.version}</span>
                  </div>
                  <p className="text-xs text-[#5A7165] mt-2 line-clamp-2 leading-relaxed">
                    {ast.description}
                  </p>
                </div>

                {/* Tags */}
                {ast.tags && Array.isArray(ast.tags) && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ast.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-[#F3F9F5] text-[#173C2D] text-[10px] font-semibold rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#E2ECE5] flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-[#5A7165] font-semibold">
                  <Download size={13} className="text-[#3F7659]" />
                  <span>{ast.installationsCount} installs</span>
                </div>

                <Link
                  href={`/marketplace/${ast.slug}`}
                  className="px-3.5 py-1.5 bg-[#F3F9F5] hover:bg-[#3F7659] text-[#173C2D] hover:text-white text-xs font-bold rounded-lg border border-[#E2ECE5] hover:border-transparent transition-all flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publisher Modal */}
      {showPublisherModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E2ECE5] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E2ECE5] pb-3">
              <h3 className="text-sm font-bold text-[#173C2D] flex items-center gap-2">
                <Building2 size={16} className="text-[#3F7659]" /> Become a Marketplace Publisher
              </h3>
              <button onClick={() => setShowPublisherModal(false)} className="text-xs font-bold text-[#5A7165]">
                ✕
              </button>
            </div>

            {pubMsg && (
              <div className="p-3 bg-[#DDEEDF] text-[#173C2D] font-bold text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-700" />
                <span>{pubMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegisterPublisher} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#173C2D]">Publisher / Vendor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Enterprise Labs"
                  value={pubName}
                  onChange={(e) => setPubName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-xs font-medium text-[#173C2D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#173C2D]">Publisher Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of your software solutions and enterprise apps..."
                  value={pubDesc}
                  onChange={(e) => setPubDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F3F9F5] border border-[#E2ECE5] rounded-lg text-xs font-medium text-[#173C2D]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPublisherModal(false)}
                  className="px-4 py-2 bg-[#F3F9F5] text-[#173C2D] text-xs font-bold rounded-lg border border-[#E2ECE5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3F7659] hover:bg-[#173C2D] text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Register Publisher Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
