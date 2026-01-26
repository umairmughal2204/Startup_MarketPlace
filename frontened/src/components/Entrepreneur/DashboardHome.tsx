import React from 'react';
import { Lightbulb, ShoppingCart, MessageSquare, TrendingUp } from 'lucide-react';

export const DashboardHome = () => {
  const stats = [
    { label: 'Ideas Submitted', value: '3', icon: <Lightbulb className="w-6 h-6" />, color: 'bg-[#0066cc]' },
    { label: 'Products Ordered', value: '12', icon: <ShoppingCart className="w-6 h-6" />, color: 'bg-[#0088dd]' },
    { label: 'Investor Feedback', value: '8', icon: <MessageSquare className="w-6 h-6" />, color: 'bg-[#00aaee]' },
    { label: 'Market Score', value: '8.5/10', icon: <TrendingUp className="w-6 h-6" />, color: 'bg-[#0099dd]' },
  ];

  const recentIdeas = [
    { id: '1', title: 'AI-Powered Fitness App', status: 'Under Review', score: '8.5/10', feedback: 5 },
    { id: '2', title: 'Sustainable Packaging Solution', status: 'Approved', score: '9.2/10', feedback: 12 },
    { id: '3', title: 'EdTech Platform for K-12', status: 'Pending', score: '7.8/10', feedback: 3 },
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

      {/* Recent Ideas */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Recent Ideas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  AI Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Feedback
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentIdeas.map((idea) => (
                <tr key={idea.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{idea.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        idea.status === 'Approved'
                          ? 'bg-blue-100 text-[#0066cc]'
                          : idea.status === 'Under Review'
                          ? 'bg-blue-50 text-[#0088dd]'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {idea.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idea.score}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {idea.feedback} comments
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#0066cc] to-[#0088dd] text-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-2 text-white">Submit New Idea</h3>
          <p className="mb-4 text-blue-100">
            Have a brilliant startup concept? Submit it now and get AI-powered feedback instantly.
          </p>
          <button className="bg-white text-[#0066cc] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            Get Started
          </button>
        </div>

        <div className="bg-white border-2 border-[#0066cc] rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-2">Browse Marketplace</h3>
          <p className="mb-4 text-gray-600">
            Discover products and services from verified suppliers to bring your idea to life.
          </p>
          <button className="bg-[#0066cc] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#004080] transition">
            Explore Products
          </button>
        </div>
      </div>
    </div>
  );
};