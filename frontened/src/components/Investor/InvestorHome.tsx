import React, { useEffect, useMemo, useState } from 'react';
import { Lightbulb, MessageSquare, Star, TrendingUp } from 'lucide-react';
import { entrepreneurApi } from '../../api/entrepreneurApi';
import { investorApi } from '../../api/investorApi';

interface IdeaItem {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  aiScore: number | null;
  feedbackCount: number;
  createdAt?: string;
}

interface FeedbackItem {
  id: string;
  ideaId: string;
  ideaTitle?: string;
  rating: number;
  comment: string;
  category?: string;
  createdAt?: string;
}

interface InvestorHomeProps {
  onNavigate?: (pageId: string) => void;
}

export const InvestorHome = ({ onNavigate }: InvestorHomeProps) => {
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    Promise.all([entrepreneurApi.getIdeas(), investorApi.getFeedback()])
      .then(([ideaData, feedbackData]) => {
        if (!isMounted) return;
        setIdeas(ideaData);
        setFeedback(feedbackData);
        setError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Failed to load dashboard data');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const approvedIdeas = ideas.filter((idea) => idea.status === 'Approved');
    const reviewed = feedback.length;
    const feedbackGiven = feedback.length;
    const highPotential = approvedIdeas.filter((idea) => (idea.aiScore || 0) >= 8.5).length;
    const categoryCount = new Set(approvedIdeas.map((idea) => idea.category).filter(Boolean)).size;
    return [
      { label: 'Ideas Reviewed', value: String(reviewed), icon: <Lightbulb className="w-6 h-6" />, color: 'bg-gradient-aurora-investor' },
      { label: 'Feedback Given', value: String(feedbackGiven), icon: <MessageSquare className="w-6 h-6" />, color: 'bg-gradient-to-br from-blue-500 to-violet-500' },
      { label: 'High Potential', value: String(highPotential), icon: <Star className="w-6 h-6" />, color: 'bg-gradient-to-br from-violet-500 to-pink-500' },
      { label: 'Categories', value: String(categoryCount), icon: <TrendingUp className="w-6 h-6" />, color: 'bg-gradient-to-br from-blue-500 to-pink-500' },
    ];
  }, [ideas, feedback]);

  const topIdeas = useMemo(() => {
    return ideas
      .filter((idea) => idea.status === 'Approved')
      .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
      .slice(0, 3);
  }, [ideas]);

  const recentActivity = useMemo(() => {
    return feedback
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 3)
      .map((item) => ({
        action: `Left feedback on "${item.ideaTitle || 'an idea'}"`,
        time: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent',
      }));
  }, [feedback]);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/90 rounded-2xl border border-violet-100 shadow-sm p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} text-white p-3 rounded-2xl shadow-lg shadow-violet-500/20`}>
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
        <div className="bg-white/90 rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-violet-100">
            <h2 className="text-xl font-bold">High Potential Ideas</h2>
          </div>
          <div className="p-6 space-y-4">
            {isLoading && (
              <div className="text-sm text-gray-500">Loading ideas...</div>
            )}
            {!isLoading && error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {!isLoading && !error && topIdeas.length === 0 && (
              <div className="text-sm text-gray-500">No ideas yet.</div>
            )}
            {!isLoading && !error && topIdeas.map((idea) => (
              <div
                key={idea.id}
                className="pb-4 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{idea.title}</h3>
                    <p className="text-sm text-gray-500">
                      {idea.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-violet-50 px-2 py-1 rounded-xl">
                    <Star className="w-4 h-4 fill-pink-400 text-pink-400" />
                    <span className="text-sm font-semibold text-violet-600">
                      {idea.aiScore !== null ? idea.aiScore : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">Feedback: {idea.feedbackCount || 0}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/90 rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-violet-100">
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              {isLoading && (
                <li className="text-sm text-gray-500">Loading activity...</li>
              )}
              {!isLoading && error && (
                <li className="text-sm text-red-600">{error}</li>
              )}
              {!isLoading && !error && recentActivity.length === 0 && (
                <li className="text-sm text-gray-500">No recent activity.</li>
              )}
              {!isLoading && !error && recentActivity.map((activity, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                >
                  <div className="w-2 h-2 bg-violet-600 rounded-full mt-2"></div>
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
        <div className="bg-gradient-aurora-investor text-white rounded-2xl shadow-lg shadow-violet-500/20 p-6">
          <h3 className="text-xl font-bold mb-2 text-white">Discover New Ideas</h3>
          <p className="mb-4 text-white/80">
            Browse the latest startup ideas and identify promising investment opportunities.
          </p>
          <button
            onClick={() => onNavigate?.('ideas')}
            className="bg-white text-violet-600 px-6 py-2 rounded-xl font-semibold hover:bg-violet-50 transition"
          >
            Browse Ideas
          </button>
        </div>

        <div className="bg-white/90 border border-violet-200 rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">Share Your Expertise</h3>
          <p className="mb-4 text-gray-600">
            Provide valuable feedback to help entrepreneurs refine their concepts.
          </p>
          <button
            onClick={() => onNavigate?.('feedback')}
            className="bg-gradient-aurora-investor text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition"
          >
            View My Feedback
          </button>
        </div>
      </div>
    </div>
  );
};
