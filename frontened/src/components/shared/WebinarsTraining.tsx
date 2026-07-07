import React, { useEffect, useState } from 'react';
import { Play, Clock, Users, Star, Calendar, Search, BookOpen, Plus, X } from 'lucide-react';
import { webinarApi } from '../../api/featuresApi';
import { useAuth } from '../../context/AuthContext';
import { isBlank, parseValidatedNumber } from '../../utils/validation';

interface Webinar {
  _id: string;
  title: string;
  instructor: string;
  instructorId?: { name: string };
  category: string;
  duration: string;
  level: string;
  enrolledUsers: string[];
  rating: number;
  description: string;
  tags: string[];
  status: string;
  date: string;
  recordingUrl: string;
  maxParticipants: number;
}

const CATEGORIES = ['Product', 'Fundraising', 'Marketing', 'Legal', 'Technology', 'Operations', 'Finance', 'Strategy'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LEVEL_COLORS: Record<string, string> = { Beginner: 'bg-green-100 text-green-700', Intermediate: 'bg-blue-100 text-blue-700', Advanced: 'bg-purple-100 text-purple-700' };

export const WebinarsTraining = () => {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    instructor: '',
    category: 'Product',
    level: 'Beginner',
    duration: '60 min',
    date: '',
    tags: '',
    maxParticipants: 100,
  });

  const fetchWebinars = async () => {
    setIsLoading(true);
    try {
      const data = await webinarApi.getWebinars({
        category: filterCategory,
        level: filterLevel,
        status: filterStatus,
      });
      setWebinars(data);
      // Check which webinars user is enrolled in
      const myWebinars = await webinarApi.getMyEnrolledWebinars();
      setEnrolledIds(new Set(myWebinars.map((w: Webinar) => w._id)));
    } catch {
      setWebinars([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebinars();
  }, [filterCategory, filterLevel, filterStatus]);

  const filtered = webinars.filter((w) => {
    const q = search.toLowerCase();
    const matchSearch = !q || w.title.toLowerCase().includes(q) || w.instructor.toLowerCase().includes(q) || w.description.toLowerCase().includes(q);
    return matchSearch;
  });

  const isUpcoming = (webinar: Webinar) => new Date(webinar.date) > new Date();
  const isRecorded = (webinar: Webinar) => webinar.recordingUrl && webinar.status === 'Completed';

  const handleEnroll = async (webinarId: string) => {
    try {
      await webinarApi.enroll(webinarId);
      setEnrolledIds((prev) => new Set(prev).add(webinarId));
      fetchWebinars();
    } catch (err: any) {
      alert(err.message || 'Failed to enroll');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const participants = parseValidatedNumber(form.maxParticipants, {
      min: 1,
      max: 10000,
      integer: true,
      label: 'Maximum participants',
    });
    if (
      isBlank(form.title) ||
      isBlank(form.instructor) ||
      isBlank(form.description) ||
      isBlank(form.category) ||
      isBlank(form.level) ||
      isBlank(form.duration) ||
      isBlank(form.date) ||
      participants.error
    ) {
      alert(participants.error || 'Please complete all required webinar fields.');
      return;
    }
    if (new Date(form.date) <= new Date()) {
      alert('Webinar date must be in the future.');
      return;
    }
    setIsSubmitting(true);
    try {
      await webinarApi.createWebinar({
        ...form,
        title: form.title.trim(),
        instructor: form.instructor.trim(),
        description: form.description.trim(),
        duration: form.duration.trim(),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setShowCreate(false);
      fetchWebinars();
      alert('Webinar created successfully!');
    } catch {
      alert('Failed to create webinar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-pink-600" />
              <h2 className="text-2xl font-bold text-slate-950">Webinars & Training</h2>
            </div>
            <p className="text-gray-600">Online courses and live sessions to develop your business skills and knowledge.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-semibold hover:shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Host Webinar
          </button>
        </div>
      </div>

      {/* Create Webinar Modal */}
      {showCreate && (
        <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Create Webinar</h3>
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
                type="text" placeholder="Instructor Name" value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm" required
              />
            </div>
            <textarea
              placeholder="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm" rows={3} required
            />
            <div className="grid grid-cols-4 gap-4">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-4 py-3 border border-gray-300 rounded-xl text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="px-4 py-3 border border-gray-300 rounded-xl text-sm">
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="px-4 py-3 border border-gray-300 rounded-xl text-sm" required />
              <input type="text" placeholder="Duration (e.g., 60 min)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="px-4 py-3 border border-gray-300 rounded-xl text-sm" required />
            </div>
            <input type="text" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm" />
            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-semibold disabled:opacity-50">
              {isSubmitting ? 'Creating...' : 'Create Webinar'}
            </button>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Webinars', value: webinars.length, icon: <BookOpen className="w-5 h-5 text-pink-500" /> },
          { label: 'Upcoming Live', value: webinars.filter((w) => isUpcoming(w)).length, icon: <Calendar className="w-5 h-5 text-violet-500" /> },
          { label: 'On-Demand', value: webinars.filter((w) => isRecorded(w)).length, icon: <Play className="w-5 h-5 text-blue-500" /> },
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
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search webinars..." className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm" />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-xl text-sm">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-xl text-sm">
            <option value="">All Levels</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-xl text-sm">
            <option value="">All Status</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Live">Live</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Webinar Cards */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading webinars...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No webinars found. Create the first one!</p></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((webinar) => {
            const enrolled = enrolledIds.has(webinar._id);
            const upcoming = isUpcoming(webinar);
            const recorded = isRecorded(webinar);
            const enrollmentCount = webinar.enrolledUsers?.length || 0;
            const isFull = enrollmentCount >= webinar.maxParticipants;

            return (
              <div key={webinar._id} className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {upcoming ? (
                        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(webinar.date).toLocaleDateString()}</span>
                      ) : recorded ? (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Play className="w-3 h-3" /> Recording</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">Completed</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[webinar.level] || 'bg-gray-100 text-gray-600'}`}>{webinar.level}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{webinar.title}</h3>
                    <p className="text-xs text-pink-600 font-medium mt-0.5">by {webinar.instructor}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 flex-1">{webinar.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {webinar.tags?.map((tag) => <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>)}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{webinar.duration}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{enrollmentCount}/{webinar.maxParticipants}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{(webinar.rating || 0).toFixed(1)}</span>
                </div>
                {upcoming && !isFull && !enrolled && (
                  <button onClick={() => handleEnroll(webinar._id)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-md transition">
                    <Calendar className="w-4 h-4" /> Enroll Now
                  </button>
                )}
                {upcoming && isFull && !enrolled && (
                  <button disabled className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-500 cursor-not-allowed">Full</button>
                )}
                {enrolled && (
                  <button disabled className="w-full py-2.5 rounded-xl font-semibold text-sm bg-green-100 text-green-700 cursor-default">✓ Enrolled</button>
                )}
                {recorded && (
                  <button onClick={() => window.open(webinar.recordingUrl, '_blank')} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-blue-100 text-blue-700 hover:shadow-md transition">
                    <Play className="w-4 h-4" /> Watch Recording
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
