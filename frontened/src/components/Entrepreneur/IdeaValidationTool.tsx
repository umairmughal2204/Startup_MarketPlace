import React, { useState } from 'react';
import { Target, Wand2, Loader2, AlertCircle, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:4000';

interface ValidationResult {
  validationScore: number;
  marketDemand: string;
  tam: string;
  sam: string;
  som: string;
  verdict: string;
  insights: string[];
  risks: string[];
  nextSteps: string[];
}

const VERDICT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Not Viable':  { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
  'Needs Work':  { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  'Promising':   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  'Strong':      { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
};

const DEMAND_COLOR: Record<string, string> = {
  'Low': 'text-red-600', 'Medium': 'text-yellow-600', 'Medium-High': 'text-blue-600', 'High': 'text-green-600',
};

export const IdeaValidationTool = () => {
  const [form, setForm] = useState({
    title: '', targetAudience: '', problem: '', solution: '', competitors: '', uniqueValue: '',
  });
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    if (!form.title.trim()) errors.title = 'Business idea title is required';
    if (!form.targetAudience.trim()) errors.targetAudience = 'Target audience is required';
    if (!form.problem.trim()) errors.problem = 'Please describe the problem you are solving';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/validate-idea`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Validation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const scoreColor = (s: number) => s >= 8 ? 'text-green-600' : s >= 6 ? 'text-blue-600' : s >= 4 ? 'text-yellow-600' : 'text-red-600';
  const scoreArc = (s: number) => Math.round((s / 10) * 283);
  const verdictStyle = result ? (VERDICT_STYLES[result.verdict] || VERDICT_STYLES['Promising']) : VERDICT_STYLES['Promising'];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-6 h-6 text-pink-600" />
          <h2 className="text-2xl font-bold text-slate-950">Idea Validation Tool</h2>
          <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-medium">AI Powered</span>
        </div>
        <p className="text-gray-600">Answer a few questions about your idea and get an AI-powered market validation report.</p>
      </div>

      {/* Form */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Idea Title *</label>
              <input
                type="text" value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: '' });
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 text-sm ${fieldErrors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                placeholder="e.g., AI-Powered Tutoring Platform"
              />
              {fieldErrors.title && <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience *</label>
              <input
                type="text" value={form.targetAudience}
                onChange={(e) => {
                  setForm({ ...form, targetAudience: e.target.value });
                  if (fieldErrors.targetAudience) setFieldErrors({ ...fieldErrors, targetAudience: '' });
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 text-sm ${fieldErrors.targetAudience ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                placeholder="e.g., High school students aged 14-18"
              />
              {fieldErrors.targetAudience && <p className="text-red-500 text-xs mt-1">{fieldErrors.targetAudience}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Problem You're Solving *</label>
            <textarea
              value={form.problem} rows={3}
              onChange={(e) => {
                setForm({ ...form, problem: e.target.value });
                if (fieldErrors.problem) setFieldErrors({ ...fieldErrors, problem: '' });
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 text-sm ${fieldErrors.problem ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              placeholder="Describe the pain point your target audience faces..."
            />
            {fieldErrors.problem && <p className="text-red-500 text-xs mt-1">{fieldErrors.problem}</p>}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Solution</label>
              <textarea
                value={form.solution} rows={3}
                onChange={(e) => setForm({ ...form, solution: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 text-sm"
                placeholder="How does your product/service solve the problem?"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unique Value Proposition</label>
              <textarea
                value={form.uniqueValue} rows={3}
                onChange={(e) => setForm({ ...form, uniqueValue: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 text-sm"
                placeholder="What makes you different from existing solutions?"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Known Competitors</label>
            <input
              type="text" value={form.competitors}
              onChange={(e) => setForm({ ...form, competitors: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 text-sm"
              placeholder="e.g., Khan Academy, Coursera, Duolingo"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !form.title || !form.targetAudience || !form.problem}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Validating...</> : <><Wand2 className="w-4 h-4" /> Validate My Idea</>}
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
          {/* Score + Verdict */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6 flex flex-col items-center">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#grad)" strokeWidth="10"
                  strokeDasharray={`${scoreArc(result.validationScore)} 283`}
                  strokeLinecap="round" transform="rotate(-90 50 50)" />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <p className={`text-3xl font-bold mt-2 ${scoreColor(result.validationScore)}`}>{result.validationScore}/10</p>
              <p className="text-xs text-gray-500 mt-1">Validation Score</p>
            </div>
            <div className={`rounded-2xl border p-6 flex flex-col items-center justify-center ${verdictStyle.bg} ${verdictStyle.border}`}>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Verdict</p>
              <p className={`text-2xl font-bold ${verdictStyle.text}`}>{result.verdict}</p>
              <p className="text-xs mt-2 text-center text-gray-600">Market Demand: <span className={`font-semibold ${DEMAND_COLOR[result.marketDemand] || 'text-blue-600'}`}>{result.marketDemand}</span></p>
            </div>
            <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6 space-y-3">
              <div><p className="text-xs font-bold uppercase tracking-wide text-gray-500">TAM</p><p className="text-sm font-semibold text-slate-800">{result.tam}</p></div>
              <div><p className="text-xs font-bold uppercase tracking-wide text-gray-500">SAM</p><p className="text-sm font-semibold text-slate-800">{result.sam}</p></div>
              <div><p className="text-xs font-bold uppercase tracking-wide text-gray-500">SOM</p><p className="text-sm font-semibold text-slate-800">{result.som}</p></div>
            </div>
          </div>

          {/* Insights, Risks, Next Steps */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/90 rounded-2xl border border-blue-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-blue-600" /><h4 className="font-semibold text-slate-800 text-sm">Market Insights</h4></div>
              <ul className="space-y-2">{result.insights.map((item, i) => <li key={i} className="text-xs text-gray-700 flex gap-2"><span className="text-blue-500 mt-0.5">•</span>{item}</li>)}</ul>
            </div>
            <div className="bg-white/90 rounded-2xl border border-yellow-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3"><AlertCircle className="w-4 h-4 text-yellow-600" /><h4 className="font-semibold text-slate-800 text-sm">Key Risks</h4></div>
              <ul className="space-y-2">{result.risks.map((item, i) => <li key={i} className="text-xs text-gray-700 flex gap-2"><span className="text-yellow-500 mt-0.5">•</span>{item}</li>)}</ul>
            </div>
            <div className="bg-white/90 rounded-2xl border border-green-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3"><ArrowRight className="w-4 h-4 text-green-600" /><h4 className="font-semibold text-slate-800 text-sm">Next Steps</h4></div>
              <ul className="space-y-2">{result.nextSteps.map((item, i) => <li key={i} className="text-xs text-gray-700 flex gap-2"><span className="flex-shrink-0 w-4 h-4 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>{item}</li>)}</ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
