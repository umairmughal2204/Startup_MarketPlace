import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Star, Target, MessageSquare, X, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '../../context/NotificationContext';
import { entrepreneurApi } from '../../api/entrepreneurApi';
import { investorApi } from '../../api/investorApi';
import { ApiError } from '../../api/apiError';

const MAX_COMMENT_LENGTH = 2000;

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  aiScore: number | null;
  feedbackCount: number;
  documentName?: string | null;
  documentUrl?: string | null;
  createdAt?: string;
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
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModal>({
    isOpen: false,
    ideaId: null,
    ideaTitle: '',
  });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<DetailModal>({
    isOpen: false,
    idea: null,
  });

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    entrepreneurApi
      .getIdeas()
      .then((data) => {
        if (!isMounted) return;
        setIdeas(data);
        setError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Failed to load ideas');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    ideas.forEach((idea) => {
      if (idea.category) unique.add(idea.category);
    });
    return ['All', ...Array.from(unique)];
  }, [ideas]);

  const filteredIdeas = ideas.filter((idea) => {
    if (idea.status !== 'Approved') return false;
    const matchesSearch =
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase());
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
    setRatingError(null);
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({
      isOpen: false,
      ideaId: null,
      ideaTitle: '',
    });
    setRatingError(null);
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      setRatingError('Please select a rating.');
      return;
    }
    setRatingError(null);

    if (!feedbackModal.ideaId) return;

    try {
      await investorApi.createFeedback({
        ideaId: feedbackModal.ideaId,
        rating,
        comment,
      });
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === feedbackModal.ideaId
            ? { ...idea, feedbackCount: (idea.feedbackCount || 0) + 1 }
            : idea
        )
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to submit feedback');
      return;
    }

    toast.success('Feedback submitted.');
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

  const handleDownloadDocument = async (idea: Idea) => {
    if (!idea.documentUrl) return;
    const url = `${API_BASE}${idea.documentUrl}`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (!res.ok) {
        toast.error('This document is no longer available on the server.');
        return;
      }
      const link = document.createElement('a');
      link.href = url;
      if (idea.documentName) link.download = idea.documentName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error('Failed to download document. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white/90 rounded-2xl border border-violet-100 shadow-sm p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ideas..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
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
        {!isLoading && !error && filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className="bg-white rounded-2xl border border-violet-100 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100 transition-all p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2">{idea.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-violet-100 text-violet-700 text-xs px-2 py-1 rounded-full">
                    {idea.category}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-3">{idea.description}</p>

            {/* AI Scores */}
            <div className="bg-violet-50 rounded-2xl border border-violet-100 p-3 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-violet-600" />
                <span className="text-xs font-semibold text-gray-700">AI Score</span>
              </div>
              <div className="text-2xl font-bold text-violet-600">
                {idea.aiScore !== null ? `${idea.aiScore}/10` : 'N/A'}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>
                Submitted{' '}
                {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <button
              onClick={() => openFeedbackModal(idea)}
              className="w-full bg-gradient-aurora-investor text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Provide Feedback
            </button>

            {idea.documentUrl && (
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

      {isLoading && (
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-12 text-center text-gray-500">
          Loading ideas...
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-12 text-center text-red-600">
          {error}
        </div>
      )}

      {!isLoading && !error && filteredIdeas.length === 0 && (
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-12 text-center">
          <p className="text-gray-500">No ideas found matching your criteria.</p>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="p-6 border-b border-violet-100 flex justify-between items-center">
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
                      onClick={() => {
                        setRating(star);
                        setRatingError(null);
                      }}
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
                {ratingError && <p className="text-xs text-red-600 mt-2">{ratingError}</p>}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Feedback (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                  rows={6}
                  maxLength={MAX_COMMENT_LENGTH}
                  placeholder="Share your insights, suggestions, or concerns about this idea..."
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/{MAX_COMMENT_LENGTH}</p>
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
                  className="flex-1 bg-gradient-aurora-investor text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition"
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
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-violet-100 flex justify-between items-center sticky top-0 bg-white">
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
                  <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-semibold">
                    {detailModal.idea.category}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Submitted on{' '}
                  {detailModal.idea.createdAt
                    ? new Date(detailModal.idea.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-lg mb-3">Description</h4>
                <p className="text-gray-700 leading-relaxed">{detailModal.idea.description}</p>
              </div>

              {/* AI Scores */}
              <div className="grid md:grid-cols-1 gap-6">
                <div className="bg-violet-50 rounded-2xl border border-violet-100 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-violet-600" />
                    </div>
                    <h4 className="font-bold text-lg">AI Score</h4>
                  </div>
                  <div className="text-4xl font-bold text-violet-600">
                    {detailModal.idea.aiScore !== null ? `${detailModal.idea.aiScore}/10` : 'N/A'}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">AI-analyzed market potential</p>
                </div>
              </div>

              {/* Document Section */}
              {detailModal.idea.documentUrl && (
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-violet-600" />
                    </div>
                    <h4 className="font-bold text-lg">Attached Document</h4>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {detailModal.idea.documentName || 'Document'}
                        </p>
                        <p className="text-sm text-gray-600">Type: Document</p>
                      </div>
                      <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded text-sm font-semibold">
                        Document
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadDocument(detailModal.idea!)}
                    className="w-full bg-gradient-aurora-investor text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Document
                  </button>
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
                  className="flex-1 bg-gradient-aurora-investor text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition flex items-center justify-center gap-2"
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
