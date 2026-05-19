import React, { useEffect, useState } from 'react';
import { Play, Clock, Users, Star, Calendar, Search, BookOpen } from 'lucide-react';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:4000';

interface Webinar {
  id: string;
  title: string;
  instructor: string;
  category: string;
  duration: string;
  level: string;
  enrolled: number;
  rating: number;
  description: string;
  tags: string[];
  upcoming: boolean;
  date?: string;
  recordingUrl: string;
}

const CATEGORIES = ['Product', 'Fundraising', 'Marketing', 'Legal', 'Technology', 'Operations', 'Finance'];
const LEVELS = ['Beginner', 'Intermediate'];
const LEVEL_COLORS: Record<string, string> = { Beginner: 'bg-green-100 text-green-700', Intermediate: 'bg-blue-100 text-blue-700' };

export const WebinarsTraining = () => {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'recorded'>('all');
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    fetch(`${API_BASE}/api/resources/webinars`)
      .then((r) => r.json())
      .then((data) => { if (mounted) setWebinars(data); })
      .catch(() => { if (mounted) setWebinars([]); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = webinars.filter((w) => {
    const q = search.toLowerCase();
    const matchSearch = !q || w.title.toLowerCase().includes(q) || w.instructor.toLowerCase().includes(q) || w.description.toLowerCase().includes(q) || w.tags.some((t) => t.toLowerCase().includes(q));
    const matchCategory = !filterCategory || w.category === filterCategory;
    const matchLevel = !filterLevel || w.level === filterLevel;
    const matchType = filterType === 'all' || (filterType === 'upcoming' && w.upcoming) || (filterType === 'recorded' && !w.upcoming);
    return matchSearch && matchCategory && matchLevel && matchType;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-pink-600" />
          <h2 className="text-2xl font-bold text-slate-950">Webinars & Training</h2>
        </div>
        <p className="text-gray-600">Online courses and live sessions to develop your business skills and knowledge.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Webinars', value: webinars.length, icon: <BookOpen className="w-5 h-5 text-pink-500" /> },
          { label: 'Upcoming Live', value: webinars.filter((w) => w.upcoming).length, icon: <Calendar className="w-5 h-5 text-violet-500" /> },
          { label: 'On-Demand', value: webinars.filter((w) => !w.upcoming).length, icon: <Play className="w-5 h-5 text-blue-500" /> },
        ].map((s, i) => (
          <div key={i} className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-4 flex items-center gap-3">
            {s.icon}
            <div>
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-5 space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search webinars..."
              className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
            />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400">
            <option value="">All Levels</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          {(['all', 'upcoming', 'recorded'] as const).map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filterType === t ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Webinar Cards */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading webinars...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No webinars found.</p></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((webinar) => {
            const enrolled = enrolledIds.has(webinar.id);
            return (
              <div key={webinar.id} className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {webinar.upcoming ? (
                        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> Live {webinar.date}</span>
                      ) : (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Play className="w-3 h-3" /> On-Demand</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[webinar.level] || 'bg-gray-100 text-gray-600'}`}>{webinar.level}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{webinar.title}</h3>
                    <p className="text-xs text-pink-600 font-medium mt-0.5">by {webinar.instructor}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 flex-1">{webinar.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {webinar.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{webinar.duration}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{webinar.enrolled.toLocaleString()} enrolled</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{webinar.rating}</span>
                </div>
                <button
                  onClick={() => {
                    if (!webinar.upcoming && webinar.recordingUrl && webinar.recordingUrl !== '#') {
                      window.open(webinar.recordingUrl, '_blank');
                    } else {
                      setEnrolledIds((prev) => new Set(prev).add(webinar.id));
                    }
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition ${enrolled ? 'bg-green-100 text-green-700' : 'bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-md'}`}
                >
                  {enrolled ? 'Enrolled ✓' : webinar.upcoming ? <><Calendar className="w-4 h-4" /> Register for Live Session</> : <><Play className="w-4 h-4" /> Watch Recording</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
