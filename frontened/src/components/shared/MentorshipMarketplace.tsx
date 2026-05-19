import React, { useEffect, useState } from 'react';
import { GraduationCap, Star, Clock, Search, MessageSquare, CheckCircle } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:4000';

interface Mentor {
  id: string;
  name: string;
  expertise: string;
  industry: string;
  experience: string;
  bio: string;
  availability: string;
  rating: number;
  sessions: number;
  image: string;
}

const EXPERTISE_LIST = ['Product Strategy', 'Fundraising & VC', 'Marketing & Growth', 'Operations & Scaling', 'Legal & Compliance', 'Tech Architecture'];

export const MentorshipMarketplace = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterExpertise, setFilterExpertise] = useState('');
  const [bookedIds, setBookedIds] = useState<Set<string>>(new Set());
  const { openChatWithContact } = useChat();

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    fetch(`${API_BASE}/api/resources/mentors`)
      .then((r) => r.json())
      .then((data) => { if (mounted) setMentors(data); })
      .catch(() => { if (mounted) setMentors([]); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = mentors.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.expertise.toLowerCase().includes(q) || m.bio.toLowerCase().includes(q);
    const matchExpertise = !filterExpertise || m.expertise === filterExpertise;
    return matchSearch && matchExpertise;
  });

  const handleBook = (mentor: Mentor) => {
    setBookedIds((prev) => new Set(prev).add(mentor.id));
    openChatWithContact({ id: mentor.id, name: mentor.name, role: 'Entrepreneur' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="w-6 h-6 text-pink-600" />
          <h2 className="text-2xl font-bold text-slate-950">Mentorship Marketplace</h2>
        </div>
        <p className="text-gray-600">Connect with experienced mentors who can guide you through your startup journey.</p>
      </div>

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
            {EXPERTISE_LIST.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {/* Mentor Cards */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading mentors...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No mentors found.</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((mentor) => {
            const booked = bookedIds.has(mentor.id);
            return (
              <div key={mentor.id} className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-5 flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {mentor.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{mentor.name}</h3>
                    <p className="text-xs text-violet-600 font-medium">{mentor.expertise}</p>
                    <p className="text-xs text-gray-500">{mentor.industry} · {mentor.experience}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 flex-1">{mentor.bio}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{mentor.rating} · {mentor.sessions} sessions</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mentor.availability}</span>
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
