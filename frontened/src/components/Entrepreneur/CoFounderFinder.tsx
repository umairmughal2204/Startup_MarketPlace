import React, { useState } from 'react';
import { Users, Search, MessageSquare, Star } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const COFOUNDER_PROFILES = [
  { id: 'cf1', name: 'Alex Rivera', role: 'Technical Co-Founder', skills: ['React', 'Node.js', 'AWS', 'Machine Learning'], industry: 'Technology', stage: 'Idea / Pre-MVP', bio: 'Full-stack engineer with 7 years of experience. Built 3 side projects. Looking to join a mission-driven startup as CTO.', commitment: 'Full-time', equity: '20-40%', location: 'Remote', avatar: 'AR' },
  { id: 'cf2', name: 'Mei Zhang', role: 'Business Co-Founder', skills: ['Sales', 'Marketing', 'Operations', 'Fundraising'], industry: 'E-commerce', stage: 'MVP / Prototype', bio: 'Ex-McKinsey consultant turned entrepreneur. Have a strong network in the e-commerce and retail space.', commitment: 'Full-time', equity: '25-35%', location: 'Remote / Hybrid', avatar: 'MZ' },
  { id: 'cf3', name: 'Jordan Smith', role: 'Design Co-Founder', skills: ['UI/UX', 'Figma', 'Branding', 'User Research'], industry: 'SaaS', stage: 'Idea / Pre-MVP', bio: 'Product designer with experience at two funded startups. Believe great design is a competitive advantage.', commitment: 'Part-time initially', equity: '15-25%', location: 'Remote', avatar: 'JS' },
  { id: 'cf4', name: 'Fatima Al-Rashid', role: 'Domain Expert Co-Founder', skills: ['Healthcare', 'Clinical Research', 'Regulatory', 'Partnerships'], industry: 'Healthcare', stage: 'Idea / Pre-MVP', bio: 'Medical doctor with 8 years clinical experience. Passionate about using technology to improve patient outcomes.', commitment: 'Part-time', equity: '20-30%', location: 'Hybrid', avatar: 'FA' },
  { id: 'cf5', name: 'Carlos Mendez', role: 'Finance Co-Founder', skills: ['Financial Modeling', 'Fundraising', 'Accounting', 'VC Relations'], industry: 'FinTech', stage: 'Early Traction', bio: 'Former investment banker with startup CFO experience. Helped raise $10M+ across multiple companies.', commitment: 'Full-time', equity: '20-35%', location: 'Remote / Onsite', avatar: 'CM' },
  { id: 'cf6', name: 'Nina Patel', role: 'Growth Co-Founder', skills: ['SEO', 'Performance Marketing', 'Content', 'Analytics'], industry: 'Education', stage: 'MVP / Prototype', bio: 'Growth hacker who scaled an EdTech startup to 50K users from zero. Obsessed with data-driven marketing.', commitment: 'Full-time', equity: '20-30%', location: 'Remote', avatar: 'NP' },
];

const ALL_SKILLS = [...new Set(COFOUNDER_PROFILES.flatMap((p) => p.skills))].sort();
const ALL_INDUSTRIES = [...new Set(COFOUNDER_PROFILES.map((p) => p.industry))].sort();

export const CoFounderFinder = () => {
  const [search, setSearch] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterCommitment, setFilterCommitment] = useState('');
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const { openChatWithContact } = useChat();

  const filtered = COFOUNDER_PROFILES.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.bio.toLowerCase().includes(q) || p.skills.some((s) => s.toLowerCase().includes(q)) || p.role.toLowerCase().includes(q);
    const matchSkill = !filterSkill || p.skills.includes(filterSkill);
    const matchIndustry = !filterIndustry || p.industry === filterIndustry;
    const matchCommitment = !filterCommitment || p.commitment.includes(filterCommitment);
    return matchSearch && matchSkill && matchIndustry && matchCommitment;
  });

  const handleConnect = (profile: typeof COFOUNDER_PROFILES[0]) => {
    setRequestedIds((prev) => new Set(prev).add(profile.id));
    openChatWithContact({ id: profile.id, name: profile.name, role: 'Entrepreneur' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-pink-600" />
          <h2 className="text-2xl font-bold text-slate-950">Co-Founder Finder</h2>
        </div>
        <p className="text-gray-600">Find the right co-founder with complementary skills to build your startup together.</p>
      </div>

      {/* Filters */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-5">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill, role..."
              className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
            />
          </div>
          <select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400">
            <option value="">All Skills</option>
            {ALL_SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-400">
            <option value="">All Industries</option>
            {ALL_INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
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
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No co-founders match your filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((profile) => {
            const requested = requestedIds.has(profile.id);
            return (
              <div key={profile.id} className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-5 flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {profile.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{profile.name}</h3>
                    <p className="text-xs text-pink-600 font-medium">{profile.role}</p>
                    <p className="text-xs text-gray-500">{profile.industry} · {profile.location}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 flex-1">{profile.bio}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full border border-pink-100">{skill}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{profile.commitment}</span>
                  <span className="bg-violet-50 text-violet-700 px-2 py-1 rounded-full">Equity: {profile.equity}</span>
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
