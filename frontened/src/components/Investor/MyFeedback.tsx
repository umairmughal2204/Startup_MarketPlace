import React from 'react';
import { Star, Calendar, User } from 'lucide-react';

interface Feedback {
  id: string;
  ideaTitle: string;
  entrepreneur: string;
  rating: number;
  comment: string;
  date: Date;
  category: string;
}

export const MyFeedback = () => {
  const feedbacks: Feedback[] = [
    {
      id: '1',
      ideaTitle: 'AI-Powered Fitness App',
      entrepreneur: 'John Doe',
      rating: 5,
      comment: 'Excellent concept with strong market potential. The personalization aspect is particularly compelling. Consider partnering with fitness equipment manufacturers for better hardware integration.',
      date: new Date('2026-01-14'),
      category: 'Technology',
    },
    {
      id: '2',
      ideaTitle: 'Sustainable Packaging Solution',
      entrepreneur: 'Sarah Smith',
      rating: 5,
      comment: 'Outstanding solution to a critical environmental problem. The use of agricultural waste is innovative. Focus on cost competitiveness with traditional packaging to accelerate adoption.',
      date: new Date('2026-01-13'),
      category: 'Sustainability',
    },
    {
      id: '3',
      ideaTitle: 'EdTech Platform for K-12',
      entrepreneur: 'Mike Johnson',
      rating: 4,
      comment: 'Solid platform with good gamification elements. The market is crowded, so differentiation is key. Consider focusing on underserved subjects like STEM education for girls.',
      date: new Date('2026-01-12'),
      category: 'Education',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {feedbacks.length}
          </div>
          <div className="text-sm text-gray-600">Total Feedback Given</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-yellow-600 mb-1 flex items-center gap-2">
            {(feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)}
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          </div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-[#0066cc] mb-1">
            {new Set(feedbacks.map(f => f.category)).size}
          </div>
          <div className="text-sm text-gray-600">Categories Covered</div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2">{feedback.ideaTitle}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{feedback.entrepreneur}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{feedback.date.toLocaleDateString()}</span>
                  </div>
                  <span className="bg-blue-100 text-[#0066cc] px-2 py-1 rounded text-xs">
                    {feedback.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-lg">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-yellow-700">{feedback.rating}/5</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{feedback.comment}</p>
            </div>
          </div>
        ))}
      </div>

      {feedbacks.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="font-semibold text-lg mb-2">No Feedback Yet</h3>
          <p className="text-gray-500 mb-4">
            Start reviewing startup ideas to build your feedback history.
          </p>
          <button className="bg-[#0066cc] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#004080] transition">
            Browse Ideas
          </button>
        </div>
      )}
    </div>
  );
};
