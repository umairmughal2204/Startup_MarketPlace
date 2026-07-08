import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Pencil, Save, Star, Trash2, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { investorApi } from '../../api/investorApi';
import { useConfirm } from '../../context/ConfirmContext';
import { ApiError } from '../../api/apiError';

const MAX_COMMENT_LENGTH = 2000;

interface Feedback {
  id: string;
  ideaId: string;
  ideaTitle: string;
  rating: number;
  comment: string;
  category: string;
  createdAt?: string;
  investorName?: string;
}

export const MyFeedback = () => {
  const confirm = useConfirm();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    investorApi
      .getFeedback()
      .then((data) => {
        if (!isMounted) return;
        setFeedbacks(data);
        setError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Failed to load feedback');
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
    const total = feedbacks.length;
    const average = total
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1)
      : '0.0';
    const categories = new Set(feedbacks.map((f) => f.category).filter(Boolean));
    return { total, average, categories: categories.size };
  }, [feedbacks]);

  const startEdit = (feedback: Feedback) => {
    setEditingId(feedback.id);
    setEditRating(feedback.rating);
    setEditComment(feedback.comment || '');
    setRatingError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRating(0);
    setEditComment('');
    setRatingError(null);
  };

  const saveEdit = async (feedbackId: string) => {
    if (editRating === 0) {
      setRatingError('Please select a rating.');
      return;
    }
    setRatingError(null);
    setIsSaving(true);
    try {
      const updated = await investorApi.updateFeedback(feedbackId, {
        rating: editRating,
        comment: editComment,
      });
      setFeedbacks((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast.success('Feedback updated.');
      cancelEdit();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update feedback');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    const confirmDelete = await confirm({
      title: 'Delete feedback',
      description: 'Delete this feedback? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (!confirmDelete) return;
    setIsSaving(true);
    try {
      await investorApi.deleteFeedback(feedbackId);
      setFeedbacks((prev) => prev.filter((item) => item.id !== feedbackId));
      toast.success('Feedback deleted.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete feedback');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/90 rounded-2xl border border-violet-100 shadow-sm p-6">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600">Total Feedback Given</div>
        </div>
        <div className="bg-white/90 rounded-2xl border border-violet-100 shadow-sm p-6">
          <div className="text-3xl font-bold text-yellow-600 mb-1 flex items-center gap-2">
            {stats.average}
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          </div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
        <div className="bg-white/90 rounded-2xl border border-violet-100 shadow-sm p-6">
          <div className="text-3xl font-bold text-violet-600 mb-1">
            {stats.categories}
          </div>
          <div className="text-sm text-gray-600">Categories Covered</div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {isLoading && (
          <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 text-gray-500">Loading feedback...</div>
        )}
        {!isLoading && error && (
          <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 text-red-600">{error}</div>
        )}
        {!isLoading && !error && feedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2">{feedback.ideaTitle}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{feedback.investorName || 'Investor'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {feedback.createdAt
                        ? new Date(feedback.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded-full text-xs">
                    {feedback.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-lg">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-yellow-700">{feedback.rating}/5</span>
              </div>
            </div>

            {editingId === feedback.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setEditRating(star);
                          setRatingError(null);
                        }}
                        className="focus:outline-none transition"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= editRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {ratingError && <p className="text-xs text-red-600 mt-2">{ratingError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Comment</label>
                  <textarea
                    value={editComment}
                    onChange={(event) => setEditComment(event.target.value.slice(0, MAX_COMMENT_LENGTH))}
                    rows={4}
                    maxLength={MAX_COMMENT_LENGTH}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{editComment.length}/{MAX_COMMENT_LENGTH}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={cancelEdit}
                    className="flex-1 px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={() => saveEdit(feedback.id)}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-aurora-investor text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{feedback.comment}</p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => startEdit(feedback)}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteFeedback(feedback.id)}
                    className="px-4 py-2 border border-red-200 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {!isLoading && !error && feedbacks.length === 0 && (
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-12 text-center">
          <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="font-semibold text-lg mb-2">No Feedback Yet</h3>
          <p className="text-gray-500 mb-4">
            Start reviewing startup ideas to build your feedback history.
          </p>
          <button className="bg-gradient-aurora-investor text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition">
            Browse Ideas
          </button>
        </div>
      )}
    </div>
  );
};
