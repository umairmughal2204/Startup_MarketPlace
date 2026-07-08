import React, { useEffect, useState } from 'react';
import { Users, Search, MessageSquare, Star, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useChat } from '../../context/ChatContext';
import { cofounderApi } from '../../api/featuresApi';
import { isBlank } from '../../utils/validation';
import { ApiError } from '../../api/apiError';

interface CoFounder {
  _id: string;
  name: string;
  coFounderBio: string;
  coFounderSkills: string[];
  equityExpectation: string;
  coFounderCommitment: string;
  professionalDetails?: {
    industry?: string;
  };
}

export const CoFounderFinder = () => {
  const [coFounders, setCoFounders] = useState<CoFounder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterCommitment, setFilterCommitment] = useState('');
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const [showBecomeCoFounder, setShowBecomeCoFounder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const { openChatWithContact } = useChat();

  const [form, setForm] = useState({
    coFounderBio: '',
    coFounderSkills: [] as string[],
    equityExpectation: '',
    coFounderCommitment: 'Full-time',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchCoFounders = async () => {
    setIsLoading(true);
    try {
      const data = await cofounderApi.getCoFounders({
        skills: filterSkill,
        industry: filterIndustry,
        commitment: filterCommitment,
      });
      setCoFounders(data);
    } catch {
      setCoFounders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const skills = await cofounderApi.getCoFounderSkills();
      setAllSkills(skills);
    } catch {
      setAllSkills([]);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const sent = await cofounderApi.getSentRequests();
      setRequestedIds(new Set(sent));
    } catch {
      // Non-critical: Connect buttons just won't show "Request Sent" until reload.
    }
  };

  useEffect(() => {
    fetchCoFounders();
    fetchSkills();
  }, [filterSkill, filterIndustry, filterCommitment]);

  useEffect(() => {
    fetchSentRequests();
  }, []);

  const filtered = coFounders.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.coFounderBio?.toLowerCase().includes(q) || p.coFounderSkills?.some((s) => s.toLowerCase().includes(q));
    return matchSearch;
  });

  const handleConnect = async (profile: CoFounder) => {
    try {
      await cofounderApi.connect(profile._id);
      setRequestedIds((prev) => new Set(prev).add(profile._id));
      openChatWithContact({ id: profile._id, name: profile.name, role: 'Entrepreneur' });
    } catch {
      toast.error('Failed to send connect request. Please try again.');
    }
  };

  const handleBecomeCoFounder = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (isBlank(form.coFounderBio)) {
      errors.coFounderBio = 'Bio is required.';
    } else if (form.coFounderBio.trim().length < 20) {
      errors.coFounderBio = 'Bio must be at least 20 characters.';
    }
    if (form.coFounderSkills.length === 0) {
      errors.coFounderSkills = 'Select at least one skill.';
    }
    if (isBlank(form.equityExpectation)) {
      errors.equityExpectation = 'Equity expectation is required.';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await cofounderApi.becomeCoFounder(form);
      setShowBecomeCoFounder(false);
      setFormErrors({});
      fetchCoFounders();
      toast.success('You are now listed as seeking a co-founder!');
    } catch (err) {
      if (err instanceof ApiError && err.errors) setFormErrors(err.errors);
      toast.error(err instanceof ApiError ? err.message : 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      coFounderSkills: prev.coFounderSkills.includes(skill)
        ? prev.coFounderSkills.filter((s) => s !== skill)
        : [...prev.coFounderSkills, skill],
    }));
  };

  const industries = [...new Set(coFounders.map((p) => p.professionalDetails?.industry).filter(Boolean))].sort();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-pink-600" />
              <h2 className="text-2xl font-bold text-slate-950">Co-Founder Finder</h2>
            </div>
            <p className="text-gray-600">Find the right co-founder with complementary skills to build your startup together.</p>
          </div>
          <button
            onClick={() => {
              setFormErrors({});
              setShowBecomeCoFounder(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-semibold hover:shadow-md transition"
          >
            <Plus className="w-4 h-4" /> List Me as Seeking
          </button>
        </div>
      </div>

      {/* Become Co-Founder Modal */}
      {showBecomeCoFounder && (
        <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">List Yourself as Seeking Co-Founder</h3>
            <button onClick={() => setShowBecomeCoFounder(false)} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleBecomeCoFounder} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Bio</label>
              <textarea
                value={form.coFounderBio}
                onChange={(e) => {
                  setForm({ ...form, coFounderBio: e.target.value });
                  if (formErrors.coFounderBio) setFormErrors({ ...formErrors, coFounderBio: '' });
                }}
                className={`w-full px-4 py-3 border rounded-xl text-sm ${
                  formErrors.coFounderBio ? 'border-red-400' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="Describe your background, what you bring, and what you're looking for..."
              />
              {formErrors.coFounderBio && <p className="text-xs text-red-600 mt-1">{formErrors.coFounderBio}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Skills</label>
              <div className="flex flex-wrap gap-2">
                {['React', 'Node.js', 'Python', 'Design', 'Marketing', 'Sales', 'Finance', 'Operations', 'Product', 'Business Dev'].map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => {
                      toggleSkill(skill);
                      if (formErrors.coFounderSkills) setFormErrors({ ...formErrors, coFounderSkills: '' });
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      form.coFounderSkills.includes(skill) ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {formErrors.coFounderSkills && <p className="text-xs text-red-600 mt-1">{formErrors.coFounderSkills}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Equity Expectation</label>
                <input
                  type="text"
                  value={form.equityExpectation}
                  onChange={(e) => {
                    setForm({ ...form, equityExpectation: e.target.value });
                    if (formErrors.equityExpectation) setFormErrors({ ...formErrors, equityExpectation: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-xl text-sm ${
                    formErrors.equityExpectation ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 20-40%"
                />
                {formErrors.equityExpectation && <p className="text-xs text-red-600 mt-1">{formErrors.equityExpectation}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Commitment</label>
                <select
                  value={form.coFounderCommitment}
                  onChange={(e) => setForm({ ...form, coFounderCommitment: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || form.coFounderSkills.length === 0}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'List My Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-5">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill..."
              className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
            />
          </div>
          <select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400">
            <option value="">All Skills</option>
            {allSkills.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400">
            <option value="">All Industries</option>
            {industries.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <select value={filterCommitment} onChange={(e) => setFilterCommitment(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400">
            <option value="">Any Commitment</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
          </select>
        </div>
        <p className="text-xs text-gray-500 mt-3">{filtered.length} co-founders found</p>
      </div>

      {/* Profile Cards */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No co-founders found. Be the first to list yourself!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((profile) => {
            const requested = requestedIds.has(profile._id);
            return (
              <div key={profile._id} className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-5 flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{profile.name}</h3>
                    <p className="text-xs text-gray-500">{profile.professionalDetails?.industry || 'Startup'} · {profile.coFounderCommitment}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 flex-1 line-clamp-3">{profile.coFounderBio || 'Looking for a co-founder opportunity.'}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {profile.coFounderSkills?.slice(0, 4).map((skill) => (
                    <span key={skill} className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full border border-pink-100">{skill}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{profile.coFounderCommitment}</span>
                  {profile.equityExpectation && (
                    <span className="bg-violet-50 text-violet-700 px-2 py-1 rounded-full">Equity: {profile.equityExpectation}</span>
                  )}
                </div>
                <button
                  onClick={() => handleConnect(profile)}
                  disabled={requested}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition ${requested ? 'bg-green-100 text-green-700 cursor-default' : 'bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-md'}`}
                >
                  {requested ? <><Star className="w-4 h-4" /> Request Sent</> : <><MessageSquare className="w-4 h-4" /> Connect</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
