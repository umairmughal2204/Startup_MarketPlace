import React, { useEffect, useState } from 'react';
import { Library, Search, Download, Clock, FileText, BookOpen, Lightbulb, Filter } from 'lucide-react';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:4000';

interface Resource {
  id: string;
  title: string;
  type: string;
  category: string;
  description: string;
  readTime: string;
  downloadUrl: string;
  tags: string[];
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Guide: <BookOpen className="w-4 h-4" />,
  Template: <FileText className="w-4 h-4" />,
  'Case Study': <Lightbulb className="w-4 h-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  Guide: 'bg-blue-100 text-blue-700',
  Template: 'bg-violet-100 text-violet-700',
  'Case Study': 'bg-amber-100 text-amber-700',
};

const CATEGORIES = ['Strategy', 'Planning', 'Finance', 'Product', 'Sales', 'Fundraising', 'Growth', 'Legal', 'Operations', 'Research'];
const TYPES = ['Guide', 'Template', 'Case Study'];

export const ResourceLibrary = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    fetch(`${API_BASE}/api/resources/library`)
      .then((r) => r.json())
      .then((data) => { if (mounted) setResources(data); })
      .catch(() => { if (mounted) setResources([]); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = resources.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q));
    const matchCategory = !filterCategory || r.category === filterCategory;
    const matchType = !filterType || r.type === filterType;
    return matchSearch && matchCategory && matchType;
  });

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const counts = TYPES.reduce((acc, t) => ({ ...acc, [t]: resources.filter((r) => r.type === t).length }), {} as Record<string, number>);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <Library className="w-6 h-6 text-pink-600" />
          <h2 className="text-2xl font-bold text-slate-950">Resource Library</h2>
        </div>
        <p className="text-gray-600">Guides, templates, and case studies to help you build and grow your startup.</p>
      </div>

      {/* Type Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(filterType === t ? '' : t)}
            className={`rounded-2xl border p-4 text-left transition ${filterType === t ? 'border-pink-400 bg-pink-50 shadow-md' : 'border-gray-200 bg-white/90 hover:border-pink-200'}`}
          >
            <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full mb-2 ${TYPE_COLORS[t]}`}>
              {TYPE_ICONS[t]} {t}
            </div>
            <p className="text-2xl font-bold text-slate-900">{counts[t] || 0}</p>
            <p className="text-xs text-gray-500">{t === 'Case Study' ? 'Case Studies' : `${t}s`}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-5">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
            />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400">
            <option value="">All Types</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1"><Filter className="w-3 h-3" />{filtered.length} of {resources.length} resources</p>
      </div>

      {/* Resource Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading resources...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><Library className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No resources match your search.</p></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((resource) => {
            const saved = savedIds.has(resource.id);
            return (
              <div key={resource.id} className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-5 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${TYPE_COLORS[resource.type] || 'bg-gray-100 text-gray-600'}`}>
                    {TYPE_ICONS[resource.type]} {resource.type}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{resource.category}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-600 mb-3 flex-1">{resource.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full border border-pink-100">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3 h-3" />{resource.readTime} read</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleSave(resource.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${saved ? 'border-pink-300 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-600 hover:border-pink-200'}`}
                    >
                      {saved ? '★ Saved' : '☆ Save'}
                    </button>
                    <a
                      href={resource.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium hover:shadow-sm transition"
                    >
                      <Download className="w-3 h-3" /> Download
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
