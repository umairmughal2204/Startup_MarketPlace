import React, { useState } from 'react';
import { DollarSign, Wand2, Loader2, TrendingDown, AlertCircle } from 'lucide-react';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:4000';

interface CostCategory {
  name: string;
  min: number;
  max: number;
  note: string;
}

interface CostResult {
  totalMin: number;
  totalMax: number;
  categories: CostCategory[];
  tips: string[];
}

const BUSINESS_TYPES = ['SaaS / Software', 'E-commerce / Retail', 'Marketplace', 'Mobile App', 'Healthcare', 'Education / EdTech', 'Food & Beverage', 'Consulting / Services', 'Manufacturing', 'Other'];
const STAGES = ['Idea / Pre-MVP', 'MVP / Prototype', 'Early Traction', 'Growth Stage'];

export const CostEstimationTool = () => {
  const [form, setForm] = useState({ businessType: '', stage: '', teamSize: '1-3', description: '' });
  const [result, setResult] = useState<CostResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/ai/estimate-cost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Failed to generate cost estimate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const getBarWidth = (val: number, max: number) => `${Math.min(100, (val / max) * 100)}%`;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-6 h-6 text-pink-600" />
          <h2 className="text-2xl font-bold text-slate-950">Cost Estimation Tool</h2>
          <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-medium">AI Powered</span>
        </div>
        <p className="text-gray-600">Get a realistic startup cost breakdown based on your business type and stage.</p>
      </div>

      {/* Form */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Type *</label>
              <select
                value={form.businessType}
                onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 text-sm"
                required
              >
                <option value="">Select type</option>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Stage *</label>
              <select
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 text-sm"
                required
              >
                <option value="">Select stage</option>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Team Size</label>
              <select
                value={form.teamSize}
                onChange={(e) => setForm({ ...form, teamSize: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 text-sm"
              >
                <option value="Solo founder">Solo founder</option>
                <option value="1-3">1–3 people</option>
                <option value="4-10">4–10 people</option>
                <option value="10+">10+ people</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Brief Description (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 text-sm"
              placeholder="Describe your business idea to get more accurate estimates..."
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !form.businessType || !form.stage}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Estimating...</> : <><Wand2 className="w-4 h-4" /> Generate Estimate</>}
          </button>
        </form>
        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-3 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Total */}
          <div className="bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl p-6 text-white">
            <p className="text-sm font-medium opacity-80 mb-1">Estimated Total Startup Cost</p>
            <p className="text-4xl font-bold">{formatCurrency(result.totalMin)} – {formatCurrency(result.totalMax)}</p>
            <p className="text-sm opacity-70 mt-1">Range based on {form.stage} stage, {form.teamSize} team</p>
          </div>

          {/* Categories */}
          <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-5">Cost Breakdown</h3>
            <div className="space-y-5">
              {result.categories.map((cat, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-semibold text-slate-800 text-sm">{cat.name}</span>
                      <span className="text-xs text-gray-500 ml-2">{cat.note}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{formatCurrency(cat.min)} – {formatCurrency(cat.max)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-violet-400 rounded-full transition-all duration-700"
                      style={{ width: getBarWidth(cat.max, result.totalMax) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white/90 rounded-2xl border border-green-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-800">Cost-Saving Tips</h3>
            </div>
            <ul className="space-y-3">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
