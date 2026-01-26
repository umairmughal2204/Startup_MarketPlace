import React from 'react';
import { Lightbulb, MessageSquare, Star, TrendingUp } from 'lucide-react';

export const InvestorHome = () => {
  const stats = [
    { label: 'Ideas Reviewed', value: '47', icon: <Lightbulb className="w-6 h-6" />, color: 'bg-[#0066cc]' },
    { label: 'Feedback Given', value: '32', icon: <MessageSquare className="w-6 h-6" />, color: 'bg-[#0099dd]' },
    { label: 'High Potential', value: '12', icon: <Star className="w-6 h-6" />, color: 'bg-[#0088dd]' },
    { label: 'Categories', value: '8', icon: <TrendingUp className="w-6 h-6" />, color: 'bg-[#00aaee]' },
  ];

  const topIdeas = [
    {
      id: '1',
      title: 'AI-Powered Fitness App',
      entrepreneur: 'John Doe',
      category: 'Technology',
      marketFit: 8.5,
      feasibility: 8.2,
      yourRating: 5,
    },
    {
      id: '2',
      title: 'Sustainable Packaging Solution',
      entrepreneur: 'Sarah Smith',
      category: 'Sustainability',
      marketFit: 9.2,
      feasibility: 7.8,
      yourRating: 5,
    },
    {
      id: '3',
      title: 'EdTech Platform for K-12',
      entrepreneur: 'Mike Johnson',
      category: 'Education',
      marketFit: 8.8,
      feasibility: 8.5,
      yourRating: 4,
    },
  ];

  const recentActivity = [
    { action: 'Reviewed "AI-Powered Fitness App"', time: '2 hours ago' },
    { action: 'Left feedback on "Sustainable Packaging Solution"', time: '5 hours ago' },
    { action: 'Rated "EdTech Platform for K-12"', time: '1 day ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} text-white p-3 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Rated Ideas */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">High Potential Ideas</h2>
          </div>
          <div className="p-6 space-y-4">
            {topIdeas.map((idea) => (
              <div
                key={idea.id}
                className="pb-4 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{idea.title}</h3>
                    <p className="text-sm text-gray-500">
                      by {idea.entrepreneur} • {idea.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                    <Star className="w-4 h-4 fill-[#0088dd] text-[#0088dd]" />
                    <span className="text-sm font-semibold text-[#0066cc]">
                      {idea.yourRating}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Market Fit:</span>{' '}
                    <span className="font-semibold text-[#0066cc]">
                      {idea.marketFit}/10
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Feasibility:</span>{' '}
                    <span className="font-semibold text-[#0099dd]">
                      {idea.feasibility}/10
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              {recentActivity.map((activity, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                >
                  <div className="w-2 h-2 bg-[#0066cc] rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-gray-900">{activity.action}</p>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#0066cc] to-[#0099dd] text-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-2 text-white">Discover New Ideas</h3>
          <p className="mb-4 text-blue-100">
            Browse the latest startup ideas and identify promising investment opportunities.
          </p>
          <button className="bg-white text-[#0066cc] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            Browse Ideas
          </button>
        </div>

        <div className="bg-white border-2 border-[#0066cc] rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-2">Share Your Expertise</h3>
          <p className="mb-4 text-gray-600">
            Provide valuable feedback to help entrepreneurs refine their concepts.
          </p>
          <button className="bg-[#0066cc] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#004080] transition">
            View My Feedback
          </button>
        </div>
      </div>
    </div>
  );
};