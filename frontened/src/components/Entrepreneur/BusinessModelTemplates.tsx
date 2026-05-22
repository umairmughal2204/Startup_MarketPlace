import React, { useState } from 'react';
import { FileText, Wand2, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:4000';

const CANVAS_FIELDS = [
  { key: 'customerSegments', label: 'Customer Segments', color: 'bg-pink-50 border-pink-200', textColor: 'text-pink-700' },
  { key: 'valuePropositions', label: 'Value Propositions', color: 'bg-violet-50 border-violet-200', textColor: 'text-violet-700' },
  { key: 'channels', label: 'Channels', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700' },
  { key: 'customerRelationships', label: 'Customer Relationships', color: 'bg-cyan-50 border-cyan-200', textColor: 'text-cyan-700' },
  { key: 'revenueStreams', label: 'Revenue Streams', color: 'bg-green-50 border-green-200', textColor: 'text-green-700' },
  { key: 'keyResources', label: 'Key Resources', color: 'bg-yellow-50 border-yellow-200', textColor: 'text-yellow-700' },
  { key: 'keyActivities', label: 'Key Activities', color: 'bg-orange-50 border-orange-200', textColor: 'text-orange-700' },
  { key: 'keyPartners', label: 'Key Partners', color: 'bg-rose-50 border-rose-200', textColor: 'text-rose-700' },
  { key: 'costStructure', label: 'Cost Structure', color: 'bg-slate-50 border-slate-200', textColor: 'text-slate-700' },
];

const STATIC_TEMPLATES = [
  {
    id: 'saas',
    name: 'SaaS Business',
    description: 'Software-as-a-service subscription model',
    canvas: {
      customerSegments: 'Small-to-medium businesses, tech teams, individual professionals needing productivity tools',
      valuePropositions: 'Saves time, reduces manual work, accessible anywhere via browser, scales with business growth',
      channels: 'Website SEO, Product Hunt, App stores, affiliate marketers, direct sales outreach',
      customerRelationships: 'Self-service onboarding, in-app tutorials, email support, community forum',
      revenueStreams: 'Monthly/annual subscriptions, freemium with paid upgrade, enterprise licensing',
      keyResources: 'Cloud infrastructure, engineering team, brand, proprietary software code',
      keyActivities: 'Software development, customer support, marketing content, product roadmap',
      keyPartners: 'AWS/GCP/Azure, payment processors (Stripe), integration partners',
      costStructure: 'Engineering salaries, cloud hosting, marketing, customer support, tools & subscriptions',
    },
  },
  {
    id: 'marketplace',
    name: 'Online Marketplace',
    description: 'Two-sided platform connecting buyers and sellers',
    canvas: {
      customerSegments: 'Buyers seeking convenience, sellers seeking wider audience, niche community members',
      valuePropositions: 'One-stop discovery, trusted transactions, wider selection for buyers, instant storefront for sellers',
      channels: 'SEO, social media, influencer marketing, seller referrals, paid advertising',
      customerRelationships: 'Automated matching, ratings system, customer service team, loyalty rewards',
      revenueStreams: 'Transaction commission, premium seller listings, advertising, subscription tiers',
      keyResources: 'Platform technology, seller/buyer network, brand trust, data analytics',
      keyActivities: 'Platform operations, fraud prevention, seller onboarding, marketing campaigns',
      keyPartners: 'Payment gateways, logistics/shipping providers, identity verification services',
      costStructure: 'Platform hosting, payment processing fees, marketing, support team, fraud management',
    },
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Brand',
    description: 'Direct-to-consumer product sales',
    canvas: {
      customerSegments: 'Online shoppers aged 18-45, niche hobbyists, gift buyers, brand-conscious consumers',
      valuePropositions: 'Unique products, fast delivery, brand story, sustainable sourcing, competitive pricing',
      channels: 'Shopify store, Instagram/TikTok shop, Amazon, physical pop-ups, email marketing',
      customerRelationships: 'Post-purchase emails, loyalty programs, social media engagement, influencer partnerships',
      revenueStreams: 'Product sales, bundles, subscriptions (replenishment), upsells and cross-sells',
      keyResources: 'Inventory, brand identity, supplier relationships, customer database, website',
      keyActivities: 'Inventory management, order fulfillment, digital marketing, product development',
      keyPartners: 'Manufacturers/suppliers, 3PL fulfillment centers, influencers, payment processors',
      costStructure: 'Product COGS, marketing (CAC), fulfillment/shipping, platform fees, returns handling',
    },
  },
];

interface CanvasData {
  customerSegments: string;
  valuePropositions: string;
  channels: string;
  customerRelationships: string;
  revenueStreams: string;
  keyResources: string;
  keyActivities: string;
  keyPartners: string;
  costStructure: string;
}

export const BusinessModelTemplates = () => {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [aiForm, setAiForm] = useState({ title: '', category: '', description: '' });
  const [aiCanvas, setAiCanvas] = useState<CanvasData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const categories = ['Technology', 'Healthcare', 'Education', 'E-commerce', 'Finance', 'Sustainability', 'Entertainment', 'Other'];

  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    if (!aiForm.title.trim()) errors.title = 'Business title is required';
    if (!aiForm.description.trim()) errors.description = 'Description is required - please describe your business idea';
    if (!aiForm.category) errors.category = 'Please select a category';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiError(null);
    setAiCanvas(null);
    setActiveTemplate(null);
    
    if (!validateForm()) return;
    
    setIsGenerating(true);
    try {
      console.log('Fetching:', `${API_BASE}/api/ai/business-model`);
      const res = await fetch(`${API_BASE}/api/ai/business-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiForm),
      });
      console.log('Response status:', res.status);
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'No error details');
        console.log('Error response:', errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      setAiCanvas(data);
    } catch (err: any) {
      console.error('Business Model API error:', err);
      setAiError(`Failed: ${err?.message || 'Unknown error'}. Check console for details.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedStatic = STATIC_TEMPLATES.find((t) => t.id === activeTemplate);
  const displayCanvas: CanvasData | null = aiCanvas || (selectedStatic?.canvas as CanvasData) || null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-6 h-6 text-pink-600" />
          <h2 className="text-2xl font-bold text-slate-950">Business Model Templates</h2>
        </div>
        <p className="text-gray-600">Choose a ready-made template or let AI generate a custom Business Model Canvas for your idea.</p>
      </div>

      {/* Static Templates */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Ready-Made Templates</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {STATIC_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTemplate(t.id); setAiCanvas(null); }}
              className={`text-left p-5 rounded-2xl border-2 transition-all ${activeTemplate === t.id ? 'border-pink-400 bg-pink-50 shadow-md' : 'border-gray-200 bg-white hover:border-pink-200 hover:shadow-sm'}`}
            >
              <div className="font-semibold text-slate-900 mb-1">{t.name}</div>
              <div className="text-sm text-gray-500">{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Generator */}
      <div className="bg-white/90 rounded-2xl border border-violet-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-5 h-5 text-violet-600" />
          <h3 className="text-lg font-semibold text-slate-800">AI-Generated Canvas</h3>
          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">AI Powered</span>
        </div>
        <form onSubmit={handleGenerate} className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <input
              type="text"
              placeholder="Your business title *"
              value={aiForm.title}
              onChange={(e) => {
                setAiForm({ ...aiForm, title: e.target.value });
                if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: '' });
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400 text-sm ${fieldErrors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            />
            {fieldErrors.title && <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>}
          </div>
          <div>
            <select
              value={aiForm.category}
              onChange={(e) => {
                setAiForm({ ...aiForm, category: e.target.value });
                if (fieldErrors.category) setFieldErrors({ ...fieldErrors, category: '' });
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400 text-sm ${fieldErrors.category ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            >
              <option value="">Select category *</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {fieldErrors.category && <p className="text-red-500 text-xs mt-1">{fieldErrors.category}</p>}
          </div>
          <button
            type="submit"
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition"
          >
            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate with AI</>}
          </button>
        </form>
        <div>
          <textarea
            placeholder="Brief description of your business idea *"
            value={aiForm.description}
            onChange={(e) => {
              setAiForm({ ...aiForm, description: e.target.value });
              if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: '' });
            }}
            rows={3}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400 text-sm ${fieldErrors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
          />
          {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>}
        </div>
        {aiError && <p className="text-red-500 text-sm mt-2 bg-red-50 p-2 rounded-lg">{aiError}</p>}
      </div>

      {/* Canvas Display */}
      {displayCanvas && (
        <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">
              {aiCanvas ? 'AI-Generated' : selectedStatic?.name} Business Model Canvas
            </h3>
            {aiCanvas && (
              <button onClick={() => setAiCanvas(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {CANVAS_FIELDS.map((field) => {
              const value = displayCanvas[field.key as keyof CanvasData];
              const isExpanded = expandedField === field.key;
              return (
                <div key={field.key} className={`rounded-xl border p-4 ${field.color}`}>
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedField(isExpanded ? null : field.key)}
                  >
                    <span className={`text-xs font-bold uppercase tracking-wide ${field.textColor}`}>{field.label}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                  <p className={`text-sm text-slate-700 mt-2 ${isExpanded ? '' : 'line-clamp-3'}`}>{value}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
