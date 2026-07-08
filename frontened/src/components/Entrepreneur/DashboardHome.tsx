import React, { useEffect, useMemo, useState } from 'react';
import { Lightbulb, ShoppingCart, MessageSquare, TrendingUp, X, Target, CheckCircle, AlertCircle, FileText, Edit3, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { isBlank, validateMeaningfulDescription } from '../../utils/validation';
import { entrepreneurApi } from '../../api/entrepreneurApi';
import { ApiError } from '../../api/apiError';

interface IdeaItem {
  id: string;
  title: string;
  category: string;
  description: string;
  documentName?: string | null;
  documentUrl?: string | null;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  aiScore: number | null;
  feedbackCount: number;
}

interface FeedbackItem {
  id: string;
  ideaId: string;
  ideaTitle?: string;
  category?: string;
  rating: number;
  comment: string;
  investorName?: string;
  createdAt?: string;
}

interface DashboardHomeProps {
  onNavigate?: (pageId: string) => void;
}

export const DashboardHome = ({ onNavigate }: DashboardHomeProps) => {
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<IdeaItem | null>(null);
  const [showIdeaFeedback, setShowIdeaFeedback] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    description: '',
    status: 'Under Review',
    file: null as File | null,
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const categories = [
    'Technology',
    'Healthcare',
    'Education',
    'E-commerce',
    'Finance',
    'Sustainability',
    'Entertainment',
    'Other',
  ];

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

  const loadIdeas = (selectedId?: string | null) => {
    let isMounted = true;
    setIsLoading(true);
    Promise.all([entrepreneurApi.getIdeas(), entrepreneurApi.getFeedback()])
      .then(([ideasData, feedbackData]) => {
        if (isMounted) {
          setIdeas(ideasData);
          setFeedback(feedbackData);
          if (selectedId) {
            setSelectedIdea(ideasData.find((idea: IdeaItem) => idea.id === selectedId) || null);
          }
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
  };

  useEffect(() => {
    const cleanup = loadIdeas();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const stats = useMemo(() => {
    const totalIdeas = ideas.length;
    const feedbackTotal = ideas.reduce((sum, idea) => sum + (idea.feedbackCount || 0), 0);
    const averageScore = ideas.length
      ? (ideas.reduce((sum, idea) => sum + (idea.aiScore || 0), 0) / ideas.length).toFixed(1)
      : '0.0';

    return [
      { label: 'Ideas Submitted', value: String(totalIdeas), icon: <Lightbulb className="w-6 h-6" />, color: 'bg-gradient-aurora-entrepreneur' },
      { label: 'Products Ordered', value: '0', icon: <ShoppingCart className="w-6 h-6" />, color: 'bg-gradient-to-br from-violet-500 to-pink-500' },
      { label: 'Investor Feedback', value: String(feedbackTotal), icon: <MessageSquare className="w-6 h-6" />, color: 'bg-gradient-to-br from-pink-500 to-fuchsia-500' },
      { label: 'Market Score', value: `${averageScore}/10`, icon: <TrendingUp className="w-6 h-6" />, color: 'bg-gradient-to-br from-purple-600 to-pink-500' },
    ];
  }, [ideas]);

  const recentIdeas = ideas.slice(0, 5).map((idea) => ({
    id: idea.id,
    title: idea.title,
    category: idea.category,
    description: idea.description,
    documentName: idea.documentName,
    documentUrl: idea.documentUrl,
    status: idea.status,
    aiScore: idea.aiScore,
    score: idea.aiScore !== null && idea.aiScore !== undefined ? `${idea.aiScore}/10` : 'Analyzing...',
    feedback: idea.feedbackCount || 0,
  }));

  const recentFeedback = feedback.slice(0, 5);

  const openIdea = (ideaId: string) => {
    const idea = ideas.find((i) => i.id === ideaId) || null;
    setSelectedIdea(idea);
    setShowIdeaFeedback(false);
    setIsEditing(false);
  };

  const handleDownloadDocument = async (idea: IdeaItem) => {
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

  const startEditing = () => {
    if (!selectedIdea) return;
    setEditForm({
      title: selectedIdea.title,
      category: selectedIdea.category,
      description: selectedIdea.description,
      status: selectedIdea.status,
      file: null,
    });
    setEditErrors({});
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (!selectedIdea) return;

    const errors: Record<string, string> = {};
    if (isBlank(editForm.title)) {
      errors.title = 'Title is required.';
    } else if (editForm.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters.';
    }
    if (isBlank(editForm.category)) {
      errors.category = 'Please select a category.';
    }
    if (isBlank(editForm.description)) {
      errors.description = 'Description is required.';
    } else {
      const descriptionError = validateMeaningfulDescription(editForm.description);
      if (descriptionError) errors.description = descriptionError;
    }
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const confirmUpdate = window.confirm("Update this idea with the new changes?");
    if (!confirmUpdate) return;
    setIsSaving(true);
    try {
      const updated = await entrepreneurApi.updateIdea(selectedIdea.id, {
        title: editForm.title,
        category: editForm.category,
        description: editForm.description,
        status: editForm.status,
        file: editForm.file,
      });
      setIdeas((prev) => prev.map((idea) => (idea.id === updated.id ? updated : idea)));
      setSelectedIdea(updated);
      setIsEditing(false);
      setEditForm({ ...editForm, file: null });
      toast.success('Idea updated successfully.');
    } catch (err) {
      if (err instanceof ApiError && err.errors) setEditErrors(err.errors);
      const message = err instanceof ApiError ? err.message : 'Failed to update idea.';
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedIdea) return;
    const confirmDelete = window.confirm("Delete this idea? This action cannot be undone.");
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      await entrepreneurApi.deleteIdea(selectedIdea.id);
      setIdeas((prev) => prev.filter((idea) => idea.id !== selectedIdea.id));
      setSelectedIdea(null);
      setIsEditing(false);
      toast.success('Idea deleted.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete idea.');
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedIdeaFeedback = useMemo(() => {
    if (!selectedIdea) return [] as FeedbackItem[];
    return feedback.filter((item) => item.ideaId === selectedIdea.id);
  }, [feedback, selectedIdea]);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} text-white p-3 rounded-2xl shadow-lg shadow-pink-500/20`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-950 mb-1">{stat.value}</div>
            <div className="text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Ideas */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-pink-100">
          <h2 className="text-xl font-bold text-slate-950">Recent Ideas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pink-50/70">
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
                <tr 
                  key={idea.id} 
                  className="hover:bg-pink-50/50 cursor-pointer transition-colors"
                  onClick={() => openIdea(idea.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 hover:text-pink-600">{idea.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        idea.status === 'Approved'
                          ? 'bg-pink-100 text-pink-700'
                          : idea.status === 'Under Review'
                          ? 'bg-violet-100 text-violet-700'
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
        <div className="bg-gradient-aurora-entrepreneur text-white rounded-2xl shadow-lg shadow-pink-500/20 p-6">
          <h3 className="text-xl font-bold mb-2 text-white">Submit New Idea</h3>
          <p className="mb-4 text-white/80">
            Have a brilliant startup concept? Submit it now and get AI-powered feedback instantly.
          </p>
          <button
            onClick={() => onNavigate?.('submit-idea')}
            className="bg-white text-pink-600 px-6 py-2 rounded-xl font-semibold hover:bg-pink-50 transition"
          >
            Get Started
          </button>
        </div>

        <div className="bg-white/90 border border-pink-200 rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2 text-slate-950">Browse Marketplace</h3>
          <p className="mb-4 text-gray-600">
            Discover products and services from verified suppliers to bring your idea to life.
          </p>
          <button
            onClick={() => onNavigate?.('market')}
            className="bg-gradient-aurora-entrepreneur text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition"
          >
            Explore Products
          </button>
        </div>
      </div>

      {/* Recent Investor Feedback */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-pink-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Recent Investor Feedback</h2>
            <p className="text-sm text-slate-500">Comments on your ideas from approved investor reviews.</p>
          </div>
          <div className="text-sm font-semibold text-pink-600">
            {feedback.length} total
          </div>
        </div>
        <div className="p-6">
          {recentFeedback.length === 0 ? (
            <div className="text-sm text-gray-500">No feedback yet. Once investors review your approved ideas, it will appear here.</div>
          ) : (
            <div className="space-y-4">
              {recentFeedback.map((item) => (
                <div key={item.id} className="rounded-2xl border border-pink-100 bg-pink-50/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div>
                      <div className="font-semibold text-slate-950">{item.ideaTitle || 'Idea Feedback'}</div>
                      <div className="text-xs text-slate-500">
                        {item.category || 'General'} · {item.investorName || 'Investor'}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-pink-600">
                      {item.rating}/5
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {item.comment || 'No comment provided.'}
                  </p>
                  <div className="mt-2 text-xs text-slate-500">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Idea Detail Popup Modal */}
      {selectedIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{selectedIdea.title}</h2>
              <button
                onClick={() => setSelectedIdea(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status and Category */}
              <div className="flex flex-wrap gap-3">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedIdea.status === 'Approved'
                      ? 'bg-green-100 text-green-700'
                      : selectedIdea.status === 'Under Review'
                      ? 'bg-violet-100 text-violet-700'
                      : selectedIdea.status === 'Rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {selectedIdea.status === 'Approved' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                  {selectedIdea.status === 'Rejected' && <AlertCircle className="w-4 h-4 inline mr-1" />}
                  {selectedIdea.status}
                </span>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  {selectedIdea.category || 'Uncategorized'}
                </span>
              </div>

              {/* AI Score Section */}
              <div className="bg-gradient-aurora-entrepreneur rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-8 h-8" />
                  <h3 className="text-xl font-bold">AI Analysis Score</h3>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold">
                    {selectedIdea.aiScore !== null && selectedIdea.aiScore !== undefined 
                      ? selectedIdea.aiScore.toFixed(1) 
                      : 'N/A'}
                  </span>
                  <span className="text-2xl mb-1 opacity-80">/10</span>
                </div>
                {selectedIdea.aiScore !== null && selectedIdea.aiScore !== undefined && (
                  <div className="mt-4">
                    <div className="w-full bg-white/30 rounded-full h-3">
                      <div 
                        className="bg-white rounded-full h-3 transition-all duration-500"
                        style={{ width: `${(selectedIdea.aiScore / 10) * 100}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm opacity-90">
                      {selectedIdea.aiScore >= 8 ? 'Excellent potential! This idea shows strong market viability.' :
                       selectedIdea.aiScore >= 6 ? 'Good potential with room for improvement.' :
                       selectedIdea.aiScore >= 4 ? 'Moderate potential. Consider refining your concept.' :
                       'Needs significant improvement. Review the feedback and iterate.'}
                    </p>
                  </div>
                )}
                {(selectedIdea.aiScore === null || selectedIdea.aiScore === undefined) && (
                  <p className="mt-2 text-sm opacity-90">
                    AI analysis is being processed. Please check back later.
                  </p>
                )}
              </div>

              {/* Document */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-pink-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Document</h4>
                </div>
                {selectedIdea.documentUrl ? (
                  <button
                    onClick={() => handleDownloadDocument(selectedIdea)}
                    className="text-pink-600 hover:underline font-medium"
                  >
                    {selectedIdea.documentName || 'View Document'}
                  </button>
                ) : (
                  <p className="text-gray-600">No document uploaded.</p>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                {!isEditing ? (
                  <p className="text-gray-600 leading-relaxed">
                    {selectedIdea.description || 'No description provided.'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => {
                          setEditForm({ ...editForm, title: e.target.value });
                          if (editErrors.title) setEditErrors({ ...editErrors, title: '' });
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 ${
                          editErrors.title ? 'border-red-400' : 'border-gray-300'
                        }`}
                      />
                      {editErrors.title && <p className="text-xs text-red-600 mt-1">{editErrors.title}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => {
                          setEditForm({ ...editForm, category: e.target.value });
                          if (editErrors.category) setEditErrors({ ...editErrors, category: '' });
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 ${
                          editErrors.category ? 'border-red-400' : 'border-gray-300'
                        }`}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {editErrors.category && <p className="text-xs text-red-600 mt-1">{editErrors.category}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <span className="block text-xs text-gray-500 mb-2">Minimum 8 words</span>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => {
                          setEditForm({ ...editForm, description: e.target.value });
                          if (editErrors.description) setEditErrors({ ...editErrors, description: '' });
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400 ${
                          editErrors.description ? 'border-red-400' : 'border-gray-300'
                        }`}
                        rows={4}
                      />
                      {editErrors.description && <p className="text-xs text-red-600 mt-1">{editErrors.description}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Document</label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                        {selectedIdea.documentName && (
                          <p className="text-sm text-gray-600">
                            Current: <span className="font-medium">{selectedIdea.documentName}</span>
                          </p>
                        )}
                        {editForm.file ? (
                          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                            <span className="text-sm text-gray-700 font-medium truncate">
                              {editForm.file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditForm({ ...editForm, file: null })}
                              className="p-1 rounded-full hover:bg-gray-100 transition"
                              aria-label="Remove selected file"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No new file selected.</p>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.docx"
                          onChange={(e) => setEditForm({ ...editForm, file: e.target.files?.[0] || null })}
                          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback Count */}
              <button
                type="button"
                onClick={() => setShowIdeaFeedback((prev) => !prev)}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-lg text-left hover:bg-pink-50 transition"
              >
                <MessageSquare className="w-6 h-6 text-pink-600" />
                <div>
                  <span className="text-2xl font-bold text-gray-900">{selectedIdea.feedbackCount || 0}</span>
                  <span className="text-gray-600 ml-2">
                    Investor Feedback{selectedIdea.feedbackCount !== 1 ? 's' : ''}
                  </span>
                  <div className="text-xs text-pink-600 mt-1">
                    {showIdeaFeedback ? 'Hide feedback details' : 'Click to view feedback details'}
                  </div>
                </div>
              </button>

              {showIdeaFeedback && (
                <div className="space-y-3 rounded-2xl border border-pink-100 bg-pink-50/60 p-4">
                  {selectedIdeaFeedback.length === 0 ? (
                    <div className="text-sm text-gray-500">No feedback comments yet for this idea.</div>
                  ) : (
                    selectedIdeaFeedback.map((item) => (
                      <div key={item.id} className="rounded-xl border border-pink-100 bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                          <div>
                            <div className="font-semibold text-slate-950">{item.investorName || 'Investor'}</div>
                            <div className="text-xs text-slate-500">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                          <div className="text-sm font-bold text-pink-600">{item.rating}/5</div>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {item.comment || 'No comment provided.'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex flex-wrap justify-end gap-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={startEditing}
                    className="px-6 py-2 bg-gradient-aurora-entrepreneur text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Update
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-60"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleUpdate}
                    disabled={isSaving}
                    className="px-6 py-2 bg-gradient-aurora-entrepreneur text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition flex items-center gap-2 disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditErrors({});
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setSelectedIdea(null);
                  setIsEditing(false);
                  setEditErrors({});
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
