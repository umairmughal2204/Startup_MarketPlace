import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, Target, TrendingUp, User, Calendar } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

interface Idea {
  id: string;
  title: string;
  description: string;
  entrepreneur: string;
  entrepreneurEmail: string;
  category: string;
  marketFit: number;
  feasibility: number;
  submittedDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const ReviewIdeas = () => {
  const { addNotification } = useNotifications();
  const [ideas, setIdeas] = useState<Idea[]>([
    {
      id: '1',
      title: 'AI-Powered Fitness App',
      description: 'A mobile app that uses AI to create personalized workout plans based on user goals, fitness level, and available equipment. The app will include video tutorials, progress tracking, and nutrition recommendations.',
      entrepreneur: 'John Doe',
      entrepreneurEmail: 'john@example.com',
      category: 'Technology',
      marketFit: 8.5,
      feasibility: 8.2,
      submittedDate: new Date('2026-01-12'),
      status: 'Pending',
    },
    {
      id: '2',
      title: 'Sustainable Packaging Solution',
      description: 'Biodegradable packaging materials made from agricultural waste, targeting e-commerce and food delivery sectors. Cost-competitive alternative to plastic packaging.',
      entrepreneur: 'Sarah Smith',
      entrepreneurEmail: 'sarah@example.com',
      category: 'Sustainability',
      marketFit: 9.2,
      feasibility: 7.8,
      submittedDate: new Date('2026-01-14'),
      status: 'Pending',
    },
    {
      id: '3',
      title: 'EdTech Platform for K-12',
      description: 'Interactive learning platform with gamification elements designed to improve student engagement and learning outcomes. Includes teacher dashboard and parent portal.',
      entrepreneur: 'Mike Johnson',
      entrepreneurEmail: 'mike@example.com',
      category: 'Education',
      marketFit: 8.8,
      feasibility: 8.5,
      submittedDate: new Date('2026-01-10'),
      status: 'Approved',
    },
  ]);

  const handleApprove = (ideaId: string) => {
    setIdeas(ideas.map(idea => 
      idea.id === ideaId ? { ...idea, status: 'Approved' as const } : idea
    ));
    
    const idea = ideas.find(i => i.id === ideaId);
    addNotification({
      type: 'general',
      title: 'Idea Approved',
      message: `"${idea?.title}" has been approved and is now visible to investors.`,
    });
  };

  const handleReject = (ideaId: string) => {
    setIdeas(ideas.map(idea => 
      idea.id === ideaId ? { ...idea, status: 'Rejected' as const } : idea
    ));
    
    const idea = ideas.find(i => i.id === ideaId);
    addNotification({
      type: 'general',
      title: 'Idea Rejected',
      message: `"${idea?.title}" has been rejected.`,
    });
  };

  const pendingIdeas = ideas.filter(i => i.status === 'Pending');
  const reviewedIdeas = ideas.filter(i => i.status !== 'Pending');

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-yellow-600 mb-1">
            {pendingIdeas.length}
          </div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {ideas.filter(i => i.status === 'Approved').length}
          </div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-red-600 mb-1">
            {ideas.filter(i => i.status === 'Rejected').length}
          </div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Pending Ideas */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Pending Ideas</h2>
        <div className="space-y-4">
          {pendingIdeas.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No pending ideas to review</p>
            </div>
          ) : (
            pendingIdeas.map((idea) => (
              <div key={idea.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{idea.title}</h3>
                      <span className="bg-blue-100 text-[#0066cc] text-xs px-2 py-1 rounded">
                        {idea.category}
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        {idea.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{idea.entrepreneur}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{idea.submittedDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{idea.description}</p>

                {/* AI Scores */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-[#0066cc]" />
                      <span className="text-xs font-semibold text-gray-700">AI Market Fit Score</span>
                    </div>
                    <div className="text-2xl font-bold text-[#0066cc]">{idea.marketFit}/10</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-gray-700">AI Feasibility Score</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{idea.feasibility}/10</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(idea.id)}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Idea
                  </button>
                  <button
                    onClick={() => handleReject(idea.id)}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Idea
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reviewed Ideas */}
      {reviewedIdeas.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Reviewed Ideas</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Entrepreneur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviewedIdeas.map((idea) => (
                  <tr key={idea.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{idea.title}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{idea.entrepreneur}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-[#0066cc] text-xs px-2 py-1 rounded">
                        {idea.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        idea.status === 'Approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {idea.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {idea.submittedDate.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
