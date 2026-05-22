import React, { useEffect, useState } from 'react';
import { Library, Search, Download, Clock, FileText, BookOpen, Lightbulb, Filter, Plus, X, Upload } from 'lucide-react';
import { resourceLibraryApi } from '../../api/featuresApi';

interface Resource {
  _id: string;
  title: string;
  type: string;
  category: string;
  description: string;
  readTime: string;
  fileUrl: string;
  fileName: string;
  downloads: number;
  savedBy: string[];
  tags: string[];
  uploadedBy?: { name: string };
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Guide: <BookOpen className="w-4 h-4" />,
  Template: <FileText className="w-4 h-4" />,
  'Case Study': <Lightbulb className="w-4 h-4" />,
  Video: <Upload className="w-4 h-4" />,
  Tool: <FileText className="w-4 h-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  Guide: 'bg-blue-100 text-blue-700',
  Template: 'bg-violet-100 text-violet-700',
  'Case Study': 'bg-amber-100 text-amber-700',
  Video: 'bg-red-100 text-red-700',
  Tool: 'bg-green-100 text-green-700',
};

const CATEGORIES = ['Strategy', 'Planning', 'Finance', 'Product', 'Sales', 'Fundraising', 'Growth', 'Legal', 'Operations', 'Research', 'Marketing', 'Technology'];
const TYPES = ['Guide', 'Template', 'Case Study', 'Video', 'Tool'];

export const ResourceLibrary = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'Guide',
    category: 'Strategy',
    fileUrl: '',
    fileName: '',
    readTime: '5 min',
    tags: '',
  });

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const data = await resourceLibraryApi.getResources({
        type: filterType,
        category: filterCategory,
      });
      setResources(data);
      // Get saved resources
      const saved = await resourceLibraryApi.getMySavedResources();
      setSavedIds(new Set(saved.map((r: Resource) => r._id)));
    } catch {
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [filterType, filterCategory]);

  const filtered = resources.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags?.some((t) => t.toLowerCase().includes(q));
    return matchSearch;
  });

  const handleToggleSave = async (id: string) => {
    try {
      const result = await resourceLibraryApi.toggleSave(id);
      if (result.saved) {
        setSavedIds((prev) => new Set(prev).add(id));
      } else {
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch {
      alert('Failed to save resource');
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      await resourceLibraryApi.trackDownload(resource._id);
      window.open(resource.fileUrl, '_blank');
    } catch {
      window.open(resource.fileUrl, '_blank');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await resourceLibraryApi.createResource({
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()),
      });
      setShowCreate(false);
      fetchResources();
      alert('Resource uploaded successfully!');
    } catch {
      alert('Failed to upload resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const counts = TYPES.reduce((acc, t) => ({ ...acc, [t]: resources.filter((r) => r.type === t).length }), {} as Record<string, number>);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Library className="w-6 h-6 text-pink-600" />
              <h2 className="text-2xl font-bold text-slate-950">Resource Library</h2>
            </div>
            <p className="text-gray-600">Guides, templates, and case studies to help you build and grow your startup.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-semibold hover:shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Upload Resource
          </button>
        </div>
      </div>

      {/* Create Resource Modal */}
      {showCreate && (
        <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Upload Resource</h3>
            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text" placeholder="Title" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm" required
              />
              <input
                type="text" placeholder="File URL" value={form.fileUrl}
                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm" required
              />
            </div>
            <textarea
              placeholder="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm" rows={3} required
            />
            <div className="grid grid-cols-3 gap-4">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-4 py-3 border border-gray-300 rounded-xl text-sm">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-4 py-3 border border-gray-300 rounded-xl text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="text" placeholder="Read time (e.g., 5 min)" value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} className="px-4 py-3 border border-gray-300 rounded-xl text-sm" />
            </div>
            <input type="text" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm" />
            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-semibold disabled:opacity-50">
              {isSubmitting ? 'Uploading...' : 'Upload Resource'}
            </button>
          </form>
        </div>
      )}

      {/* Type Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {TYPES.slice(0, 3).map((t) => (
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
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources..." className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm" />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-xl text-sm">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-xl text-sm">
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
        <div className="text-center py-16 text-gray-400"><Library className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No resources found. Upload the first one!</p></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((resource) => {
            const saved = savedIds.has(resource._id);
            return (
              <div key={resource._id} className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-5 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${TYPE_COLORS[resource.type] || 'bg-gray-100 text-gray-600'}`}>
                    {TYPE_ICONS[resource.type]} {resource.type}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{resource.category}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-600 mb-3 flex-1">{resource.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags?.map((tag) => <span key={tag} className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full border border-pink-100">{tag}</span>)}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{resource.readTime}</span>
                    <span className="flex items-center gap-1"><Download className="w-3 h-3" />{resource.downloads || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleSave(resource._id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${saved ? 'border-pink-300 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-600 hover:border-pink-200'}`}
                    >
                      {saved ? '★ Saved' : '☆ Save'}
                    </button>
                    <button
                      onClick={() => handleDownload(resource)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium hover:shadow-sm transition"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
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
