import React, { useEffect, useState } from 'react';
import { GraduationCap, Star, Clock, Search, MessageSquare, CheckCircle, Plus, X, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useChat } from '../../context/ChatContext';
import { useAuth, UserRole } from '../../context/AuthContext';
import { mentorshipApi } from '../../api/featuresApi';
import { isBlank, parseValidatedNumber, preventInvalidNumberKey, sanitizeNumberInput } from '../../utils/validation';
import { ApiError } from '../../api/apiError';

interface Mentor {
  _id: string;
  name: string;
  role: UserRole;
  expertise: string[];
  professionalDetails?: {
    industry?: string;
  };
  mentorBio: string;
  mentorAvailability: string;
  hourlyRate: number;
  mentorRating: number;
  mentorSessions: number;
}

export const MentorshipMarketplace = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterExpertise, setFilterExpertise] = useState('');
  const [bookedIds, setBookedIds] = useState<Set<string>>(new Set());
  const [showBecomeMentor, setShowBecomeMentor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { openChatWithContact } = useChat();
  const { user } = useAuth();

  const [mentorForm, setMentorForm] = useState({
    mentorBio: '',
    expertise: [] as string[],
    hourlyRate: 50,
    mentorAvailability: 'Flexible',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      const data = await mentorshipApi.getMentors();
      setMentors(data);
    } catch {
      setMentors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const allExpertise = [...new Set(mentors.flatMap((m) => m.expertise || []))].sort();

  const filtered = mentors.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.mentorBio?.toLowerCase().includes(q) || m.expertise?.some((e) => e.toLowerCase().includes(q));
    const matchExpertise = !filterExpertise || m.expertise?.includes(filterExpertise);
    return matchSearch && matchExpertise;
  });

  const handleBook = async (mentor: Mentor) => {
    try {
      await mentorshipApi.bookSession(mentor._id);
      setBookedIds((prev) => new Set(prev).add(mentor._id));
      toast.success(`Session requested with ${mentor.name}.`);
      openChatWithContact({ id: mentor._id, name: mentor.name, role: mentor.role || 'Entrepreneur' });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to book session. Please try again.');
    }
  };

  const handleBecomeMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseValidatedNumber(mentorForm.hourlyRate, { min: 0, max: 10000, integer: true, label: 'Hourly rate' });
    const errors: Record<string, string> = {};
    if (isBlank(mentorForm.mentorBio)) {
      errors.mentorBio = 'Bio is required.';
    } else if (mentorForm.mentorBio.trim().length < 20) {
      errors.mentorBio = 'Bio must be at least 20 characters.';
    }
    if (mentorForm.expertise.length === 0) {
      errors.expertise = 'Select at least one area of expertise.';
    }
    if (rate.error) errors.hourlyRate = rate.error;
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await mentorshipApi.becomeMentor(mentorForm);
      setShowBecomeMentor(false);
      setFormErrors({});
      fetchMentors();
      toast.success('You are now listed as a mentor!');
    } catch (err) {
      if (err instanceof ApiError && err.errors) setFormErrors(err.errors);
      toast.error(err instanceof ApiError ? err.message : 'Failed to become mentor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpertise = (skill: string) => {
    setMentorForm((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(skill)
        ? prev.expertise.filter((e) => e !== skill)
        : [...prev.expertise, skill],
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="w-6 h-6 text-pink-600" />
              <h2 className="text-2xl font-bold text-slate-950">Mentorship Marketplace</h2>
            </div>
            <p className="text-gray-600">Connect with experienced mentors who can guide you through your startup journey.</p>
          </div>
          <button
            onClick={() => {
              setFormErrors({});
              setShowBecomeMentor(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-semibold hover:shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Become a Mentor
          </button>
        </div>
      </div>

      {/* Become Mentor Modal */}
      {showBecomeMentor && (
        <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Become a Mentor</h3>
            <button onClick={() => setShowBecomeMentor(false)} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleBecomeMentor} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
              <textarea
                value={mentorForm.mentorBio}
                onChange={(e) => {
                  setMentorForm({ ...mentorForm, mentorBio: e.target.value });
                  if (formErrors.mentorBio) setFormErrors({ ...formErrors, mentorBio: '' });
                }}
                className={`w-full px-4 py-3 border rounded-xl text-sm ${formErrors.mentorBio ? 'border-red-400' : 'border-gray-300'}`}
                rows={3}
                placeholder="Describe your experience and what you can help with..."
              />
              {formErrors.mentorBio && <p className="text-xs text-red-600 mt-1">{formErrors.mentorBio}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Expertise</label>
              <div className="flex flex-wrap gap-2">
                {['Product Strategy', 'Fundraising', 'Marketing', 'Tech', 'Operations', 'Legal', 'Sales', 'Design'].map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => {
                      toggleExpertise(skill);
                      if (formErrors.expertise) setFormErrors({ ...formErrors, expertise: '' });
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      mentorForm.expertise.includes(skill)
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {formErrors.expertise && <p className="text-xs text-red-600 mt-1">{formErrors.expertise}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hourly Rate ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={mentorForm.hourlyRate}
                    onKeyDown={(e) => preventInvalidNumberKey(e)}
                    onChange={(e) => {
                      const value = sanitizeNumberInput(e.target.value, { maxLength: 5 });
                      setMentorForm({ ...mentorForm, hourlyRate: value ? Number(value) : 0 });
                      if (formErrors.hourlyRate) setFormErrors({ ...formErrors, hourlyRate: '' });
                    }}
                    className={`w-full pl-9 pr-4 py-3 border rounded-xl text-sm ${formErrors.hourlyRate ? 'border-red-400' : 'border-gray-300'}`}
                    min="0"
                  />
                </div>
                {formErrors.hourlyRate && <p className="text-xs text-red-600 mt-1">{formErrors.hourlyRate}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Availability</label>
                <select
                  value={mentorForm.mentorAvailability}
                  onChange={(e) => setMentorForm({ ...mentorForm, mentorAvailability: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                >
                  <option value="Weekdays">Weekdays</option>
                  <option value="Weekends">Weekends</option>
                  <option value="Evenings">Evenings</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || mentorForm.expertise.length === 0}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Become a Mentor'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, expertise..."
              className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
            />
          </div>
          <select value={filterExpertise} onChange={(e) => setFilterExpertise(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400">
            <option value="">All Expertise</option>
            {allExpertise.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <p className="text-xs text-gray-500 mt-3">{filtered.length} mentors available</p>
      </div>

      {/* Mentor Cards */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading mentors...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No mentors found. Be the first to sign up!</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((mentor) => {
            const booked = bookedIds.has(mentor._id);
            return (
              <div key={mentor._id} className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-5 flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {mentor.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{mentor.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mentor.expertise?.slice(0, 2).map((exp) => (
                        <span key={exp} className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{exp}</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{mentor.professionalDetails?.industry || 'General'}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 flex-1 line-clamp-3">{mentor.mentorBio || 'Experienced mentor ready to help.'}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{(mentor.mentorRating || 0).toFixed(1)} · {mentor.mentorSessions || 0} sessions</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mentor.mentorAvailability}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-800">${mentor.hourlyRate || 0}/hr</span>
                </div>
                <button
                  onClick={() => handleBook(mentor)}
                  disabled={booked}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition ${booked ? 'bg-green-100 text-green-700 cursor-default' : 'bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:shadow-md'}`}
                >
                  {booked ? <><CheckCircle className="w-4 h-4" /> Session Requested</> : <><MessageSquare className="w-4 h-4" /> Book Session</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
