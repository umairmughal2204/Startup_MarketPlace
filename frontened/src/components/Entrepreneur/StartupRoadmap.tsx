import React, { useState } from 'react';
import { Map, Wand2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:4000';

interface Phase {
  phase: string;
  duration: string;
  tasks: string[];
}

const PHASE_COLORS = [
  'border-pink-300 bg-pink-50',
  'border-violet-300 bg-violet-50',
  'border-blue-300 bg-blue-50',
  'border-cyan-300 bg-cyan-50',
  'border-green-300 bg-green-50',
];

const PHASE_DOT_COLORS = ['bg-pink-500', 'bg-violet-500', 'bg-blue-500', 'bg-cyan-500', 'bg-green-500'];
const PHASE_TEXT_COLORS = ['text-pink-700', 'text-violet-700', 'text-blue-700', 'text-cyan-700', 'text-green-700'];

const categories = ['Technology', 'Healthcare', 'Education', 'E-commerce', 'Finance', 'Sustainability', 'Entertainment', 'Other'];
const stages = ['Idea / Pre-MVP', 'MVP / Prototype', 'Early Traction', 'Growth Stage'];

export const StartupRoadmap = () => {
  const [form, setForm] = useState({ title: '', category: '', stage: '' });
  const [phases, setPhases] = useState<Phase[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPhases(null);
    setCompletedTasks(new Set());
    try {
      const res = await fetch(`${API_BASE}/api/ai/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPhases(data.phases || []);
    } catch {
      setError('Failed to generate roadmap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = (key: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const totalTasks = phases ? phases.reduce((sum, p) => sum + p.tasks.length, 0) : 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks.size / totalTasks) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <Map className="w-6 h-6 text-pink-600" />
          <h2 className="text-2xl font-bold text-slate-950">Startup Roadmap Guide</h2>
          <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-medium">AI Powered</span>
        </div>
        <p className="text-gray-600">Get a personalized step-by-step roadmap from concept to launch tailored to your business.</p>
      </div>

      {/* Form */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <form onSubmit={handleGenerate} className="grid md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name *</label>
            <input
              type="text" value={form.title} required
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 text-sm"
              placeholder="Your startup name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 text-sm"
            >
              <option value="">Select</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Stage</label>
            <select
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 text-sm"
            >
              <option value="">Select</option>
              {stages.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading || !form.title}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition text-sm"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate Roadmap</>}
          </button>
        </form>
        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-3 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}
      </div>

      {/* Roadmap */}
      {phases && (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
              <span className="text-sm font-bold text-pink-600">{progress}% ({completedTasks.size}/{totalTasks} tasks)</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-violet-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Phases */}
          <div className="relative">
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-pink-300 to-green-300 hidden md:block" />
            <div className="space-y-6">
              {phases.map((phase, pi) => (
                <div key={pi} className="md:pl-16 relative">
                  <div className={`absolute left-3.5 top-6 w-5 h-5 rounded-full border-4 border-white shadow hidden md:block ${PHASE_DOT_COLORS[pi % PHASE_DOT_COLORS.length]}`} />
                  <div className={`rounded-2xl border-2 p-5 ${PHASE_COLORS[pi % PHASE_COLORS.length]}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className={`font-bold text-base ${PHASE_TEXT_COLORS[pi % PHASE_TEXT_COLORS.length]}`}>{phase.phase}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{phase.duration}</p>
                      </div>
                      <span className="text-xs font-medium text-gray-500 bg-white/70 px-2 py-1 rounded-full">
                        {phase.tasks.filter((_, ti) => completedTasks.has(`${pi}-${ti}`)).length}/{phase.tasks.length} done
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {phase.tasks.map((task, ti) => {
                        const key = `${pi}-${ti}`;
                        const done = completedTasks.has(key);
                        return (
                          <li
                            key={ti}
                            className="flex items-start gap-3 cursor-pointer group"
                            onClick={() => toggleTask(key)}
                          >
                            <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-colors ${done ? 'text-green-500' : 'text-gray-300 group-hover:text-gray-400'}`} />
                            <span className={`text-sm transition-colors ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
