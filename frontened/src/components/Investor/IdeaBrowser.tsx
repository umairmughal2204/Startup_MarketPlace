import React, { useState } from 'react';
import { Search, Filter, Star, TrendingUp, Target, MessageSquare, X, FileText, Download, Eye } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

interface Idea {
  id: string;
  title: string;
  description: string;
  entrepreneur: string;
  category: string;
  marketFit: number;
  feasibility: number;
  submittedDate: Date;
  document?: {
    name: string;
    url: string;
    type: string;
  };
}

interface FeedbackModal {
  isOpen: boolean;
  ideaId: string | null;
  ideaTitle: string;
}

interface DetailModal {
  isOpen: boolean;
  idea: Idea | null;
}

export const IdeaBrowser = () => {
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModal>({
    isOpen: false,
    ideaId: null,
    ideaTitle: '',
  });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [detailModal, setDetailModal] = useState<DetailModal>({
    isOpen: false,
    idea: null,
  });

  const categories = ['All', 'Technology', 'Healthcare', 'Education', 'E-commerce', 'Finance', 'Sustainability'];

  const ideas: Idea[] = [
    {
      id: '1',
      title: 'AI-Powered Fitness App',
      description: 'A mobile app that uses AI to create personalized workout plans based on user goals, fitness level, and available equipment.',
      entrepreneur: 'John Doe',
      category: 'Technology',
      marketFit: 8.5,
      feasibility: 8.2,
      submittedDate: new Date('2026-01-12'),
      document: {
        name: 'AI_Fitness_Business_Plan.pdf',
        url: '#',
        type: 'PDF',
      },
    },
    {
      id: '2',
      title: 'Sustainable Packaging Solution',
      description: 'Biodegradable packaging materials made from agricultural waste, targeting e-commerce and food delivery sectors.',
      entrepreneur: 'Sarah Smith',
      category: 'Sustainability',
      marketFit: 9.2,
      feasibility: 7.8,
      submittedDate: new Date('2026-01-14'),
      document: {
        name: 'Sustainable_Packaging_Proposal.pdf',
        url: '#',
        type: 'PDF',
      },
    },
    {
      id: '3',
      title: 'EdTech Platform for K-12',
      description: 'Interactive learning platform with gamification elements designed to improve student engagement and learning outcomes.',
      entrepreneur: 'Mike Johnson',
      category: 'Education',
      marketFit: 8.8,
      feasibility: 8.5,
      submittedDate: new Date('2026-01-10'),
    },
    {
      id: '4',
      title: 'Telemedicine for Rural Areas',
      description: 'Platform connecting rural patients with healthcare providers via video consultations and mobile health units.',
      entrepreneur: 'Emily Chen',
      category: 'Healthcare',
      marketFit: 9.0,
      feasibility: 7.5,
      submittedDate: new Date('2026-01-13'),
      document: {
        name: 'Telemedicine_Platform_Detailed_Plan.docx',
        url: '#',
        type: 'DOCX',
      },
    },
    {
      id: '5',
      title: 'Blockchain Supply Chain Tracker',
      description: 'Transparent supply chain management using blockchain to verify product authenticity and ethical sourcing.',
      entrepreneur: 'David Lee',
      category: 'Technology',
      marketFit: 7.8,
      feasibility: 7.2,
      submittedDate: new Date('2026-01-11'),
    },
    {
      id: '6',
      title: 'Smart Home Energy Manager',
      description: 'IoT-based system to optimize home energy consumption and integrate renewable energy sources.',
      entrepreneur: 'Lisa Wang',
      category: 'Technology',
      marketFit: 8.3,
      feasibility: 8.0,
      submittedDate: new Date('2026-01-15'),
      document: {
        name: 'Smart_Energy_Technical_Specs.pdf',
        url: '#',
        type: 'PDF',
      },
    },
  ];

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.entrepreneur.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || idea.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openFeedbackModal = (idea: Idea) => {
    setFeedbackModal({
      isOpen: true,
      ideaId: idea.id,
      ideaTitle: idea.title,
    });
    setRating(0);
    setComment('');
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({
      isOpen: false,
      ideaId: null,
      ideaTitle: '',
    });
  };

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    addNotification({
      type: 'feedback',
      title: 'Feedback Submitted',
      message: `Your feedback for "${feedbackModal.ideaTitle}" has been sent to the entrepreneur.`,
    });

    closeFeedbackModal();
  };

  const openDetailModal = (idea: Idea) => {
    setDetailModal({
      isOpen: true,
      idea: idea,
    });
  };

  const closeDetailModal = () => {
    setDetailModal({
      isOpen: false,
      idea: null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ideas, entrepreneurs..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className="bg-white rounded-lg shadow hover:shadow-xl transition p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2">{idea.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-100 text-[#0066cc] text-xs px-2 py-1 rounded">
                    {idea.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    by {idea.entrepreneur}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-3">{idea.description}</p>

            {/* AI Scores */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-[#0066cc]" />
                  <span className="text-xs font-semibold text-gray-700">Market Fit</span>
                </div>
                <div className="text-2xl font-bold text-[#0066cc]">{idea.marketFit}/10</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#0099dd]" />
                  <span className="text-xs font-semibold text-gray-700">Feasibility</span>
                </div>
                <div className="text-2xl font-bold text-[#0099dd]">{idea.feasibility}/10</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Submitted {idea.submittedDate.toLocaleDateString()}</span>
            </div>

            <button
              onClick={() => openFeedbackModal(idea)}
              className="w-full bg-[#0066cc] text-white py-3 rounded-lg font-semibold hover:bg-[#004080] transition flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Provide Feedback
            </button>

            {idea.document && (
              <button
                onClick={() => openDetailModal(idea)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2 mt-2"
              >
                <FileText className="w-5 h-5" />
                View Document
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No ideas found matching your criteria.</p>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Provide Feedback</h2>
              <button
                onClick={closeFeedbackModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">{feedbackModal.ideaTitle}</h3>
                <p className="text-gray-600">Share your thoughts and rating for this startup idea.</p>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Overall Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    You rated this idea {rating} out of 5 stars
                  </p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Feedback (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                  rows={6}
                  placeholder="Share your insights, suggestions, or concerns about this idea..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={closeFeedbackModal}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  className="flex-1 bg-[#0066cc] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#004080] transition"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal.isOpen && detailModal.idea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Idea Details</h2>
              <button
                onClick={closeDetailModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title and Category */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-3xl font-bold text-gray-900">{detailModal.idea.title}</h3>
                  <span className="bg-blue-100 text-[#0066cc] px-3 py-1 rounded-full font-semibold">
                    {detailModal.idea.category}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Submitted by <span className="font-semibold text-gray-900">{detailModal.idea.entrepreneur}</span> on {detailModal.idea.submittedDate.toLocaleDateString()}
                </p>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-lg mb-3">Description</h4>
                <p className="text-gray-700 leading-relaxed">{detailModal.idea.description}</p>
              </div>

              {/* AI Scores */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Target className="w-6 h-6 text-[#0066cc]" />
                    </div>
                    <h4 className="font-bold text-lg">Market Fit Score</h4>
                  </div>
                  <div className="text-4xl font-bold text-[#0066cc]">{detailModal.idea.marketFit}/10</div>
                  <p className="text-sm text-gray-600 mt-2">AI-analyzed market potential</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-[#0099dd]" />
                    </div>
                    <h4 className="font-bold text-lg">Feasibility Score</h4>
                  </div>
                  <div className="text-4xl font-bold text-[#0099dd]">{detailModal.idea.feasibility}/10</div>
                  <p className="text-sm text-gray-600 mt-2">Implementation viability assessment</p>
                </div>
              </div>

              {/* Document Section */}
              {detailModal.idea.document && (
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[#0066cc]" />
                    </div>
                    <h4 className="font-bold text-lg">Attached Document</h4>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{detailModal.idea.document.name}</p>
                        <p className="text-sm text-gray-600">Type: {detailModal.idea.document.type}</p>
                      </div>
                      <span className="bg-blue-100 text-[#0066cc] px-3 py-1 rounded text-sm font-semibold">
                        {detailModal.idea.document.type}
                      </span>
                    </div>
                  </div>

                  <a
                    href={detailModal.idea.document.url}
                    download={detailModal.idea.document.name}
                    className="w-full bg-[#0066cc] text-white py-3 rounded-lg font-semibold hover:bg-[#004080] transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Document
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={closeDetailModal}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeDetailModal();
                    openFeedbackModal(detailModal.idea!);
                  }}
                  className="flex-1 bg-[#0066cc] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#004080] transition flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Provide Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};