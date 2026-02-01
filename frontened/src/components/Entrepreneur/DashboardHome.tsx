import React, { useEffect, useMemo, useState } from 'react';
import { Lightbulb, ShoppingCart, MessageSquare, TrendingUp } from 'lucide-react';
import { entrepreneurApi } from '../../api/entrepreneurApi';

interface IdeaItem {
  id: string;
  title: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  aiScore: number | null;
  feedbackCount: number;
}

export const DashboardHome = () => {
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    entrepreneurApi
      .getIdeas()
      .then((data) => {
        if (isMounted) {
          setIdeas(data);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Failed to load ideas');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalIdeas = ideas.length;
    const feedbackTotal = ideas.reduce((sum, idea) => sum + (idea.feedbackCount || 0), 0);
    const averageScore = ideas.length
      ? (ideas.reduce((sum, idea) => sum + (idea.aiScore || 0), 0) / ideas.length).toFixed(1)
      : '0.0';

    return [
      { label: 'Ideas Submitted', value: String(totalIdeas), icon: <Lightbulb className="w-6 h-6" />, color: 'bg-[#0066cc]' },
      { label: 'Products Ordered', value: '0', icon: <ShoppingCart className="w-6 h-6" />, color: 'bg-[#0088dd]' },
      { label: 'Investor Feedback', value: String(feedbackTotal), icon: <MessageSquare className="w-6 h-6" />, color: 'bg-[#00aaee]' },
      { label: 'Market Score', value: `${averageScore}/10`, icon: <TrendingUp className="w-6 h-6" />, color: 'bg-[#0099dd]' },
    ];
  }, [ideas]);

  const recentIdeas = ideas.slice(0, 5).map((idea) => ({
    id: idea.id,
    title: idea.title,
    status: idea.status,
    score: idea.aiScore ? `${idea.aiScore}/10` : 'N/A',
    feedback: idea.feedbackCount || 0,
  }));

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
              {isLoading && (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>
                    Loading ideas...
                  </td>
                </tr>
              )}
              {!isLoading && error && (
                <tr>
                  <td className="px-6 py-4 text-sm text-red-600" colSpan={4}>
                    {error}
                  </td>
                </tr>
              )}
              {!isLoading && !error && recentIdeas.length === 0 && (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>
                    No ideas yet. Submit your first idea to see it here.
                  </td>
                </tr>
              )}
              {!isLoading && !error && recentIdeas.map((idea) => (
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