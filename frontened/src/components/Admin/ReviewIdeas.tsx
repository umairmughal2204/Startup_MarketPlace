import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Edit, Save, X, XCircle, Target, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '../../context/NotificationContext';
import { useConfirm } from '../../context/ConfirmContext';
import { entrepreneurApi } from '../../api/entrepreneurApi';
import { isBlank, validateMeaningfulDescription } from '../../utils/validation';
import { ApiError } from '../../api/apiError';

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  aiScore: number | null;
  feedbackCount: number;
  createdAt?: string;
}

export const ReviewIdeas = () => {
  const { addNotification } = useNotifications();
  const confirm = useConfirm();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    description: '',
    status: 'Under Review' as Idea['status'],
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

  const updateIdeaStatus = async (idea: Idea, status: Idea['status']) => {
    try {
      const updated = await entrepreneurApi.updateIdea(idea.id, {
        title: idea.title,
        category: idea.category,
        description: idea.description,
        status,
      });
      setIdeas((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      const label = status === 'Approved' ? 'approved' : status === 'Rejected' ? 'rejected' : 'updated';
      toast.success(`"${idea.title}" has been ${label}.`);
      addNotification({
        type: 'general',
        title: status === 'Approved' ? 'Idea Approved' : status === 'Rejected' ? 'Idea Rejected' : 'Idea Status Updated',
        message: `"${idea.title}" has been ${label}.`,
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update idea status.');
    }
  };

  const handleApprove = (idea: Idea) => updateIdeaStatus(idea, 'Approved');
  const handleReject = (idea: Idea) => updateIdeaStatus(idea, 'Rejected');
  const handleStatusChange = async (idea: Idea, status: Idea['status']) => {
    if (status === idea.status) return;
    const confirmUpdate = await confirm({
      title: 'Update idea status',
      description: `Update status for "${idea.title}" to ${status}?`,
    });
    if (!confirmUpdate) return;
    updateIdeaStatus(idea, status);
  };

  const openEdit = (idea: Idea) => {
    setEditingIdea(idea);
    setEditForm({
      title: idea.title,
      category: idea.category,
      description: idea.description,
      status: idea.status,
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const closeEdit = () => {
    setShowEditModal(false);
    setEditingIdea(null);
    setEditErrors({});
  };

  const validateEditForm = () => {
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
    return errors;
  };

  const handleSaveEdit = async () => {
    if (!editingIdea) return;
    const errors = validateEditForm();
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const confirmUpdate = await confirm({
      title: 'Update idea',
      description: `Save changes to "${editForm.title.trim() || editingIdea.title}"?`,
    });
    if (!confirmUpdate) return;
    setIsSaving(true);
    try {
      const updated = await entrepreneurApi.updateIdea(editingIdea.id, {
        title: editForm.title.trim(),
        category: editForm.category,
        description: editForm.description.trim(),
        status: editForm.status,
      });
      setIdeas((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast.success(`"${updated.title}" has been updated.`);
      addNotification({
        type: 'general',
        title: 'Idea Updated',
        message: `"${updated.title}" has been updated.`,
      });
      closeEdit();
    } catch (err) {
      if (err instanceof ApiError && err.errors) setEditErrors(err.errors);
      toast.error(err instanceof ApiError ? err.message : 'Failed to update idea.');
    } finally {
      setIsSaving(false);
    }
  };

  const pendingIdeas = useMemo(
    () => ideas.filter((idea) => idea.status === 'Pending' || idea.status === 'Under Review'),
    [ideas]
  );
  const reviewedIdeas = useMemo(
    () => ideas.filter((idea) => idea.status === 'Approved' || idea.status === 'Rejected'),
    [ideas]
  );

  return (
    <>
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
          {isLoading && (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">Loading ideas...</div>
          )}
          {!isLoading && error && (
            <div className="bg-white rounded-lg shadow p-12 text-center text-red-600">{error}</div>
          )}
          {!isLoading && !error && pendingIdeas.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No pending ideas to review</p>
            </div>
          ) : (
            !isLoading && !error && pendingIdeas.map((idea) => (
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
                        <span>Entrepreneur</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{idea.description}</p>

                {/* AI Scores */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-[#0066cc]" />
                      <span className="text-xs font-semibold text-gray-700">AI Score</span>
                    </div>
                    <div className="text-2xl font-bold text-[#0066cc]">
                      {idea.aiScore !== null ? `${idea.aiScore}/10` : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => openEdit(idea)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleApprove(idea)}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Idea
                  </button>
                  <button
                    onClick={() => handleReject(idea)}
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
      {!isLoading && !error && reviewedIdeas.length > 0 && (
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
                    <td className="px-6 py-4 text-sm text-gray-700">Entrepreneur</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-[#0066cc] text-xs px-2 py-1 rounded">
                        {idea.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={idea.status}
                        onChange={(event) =>
                          handleStatusChange(idea, event.target.value as Idea['status'])
                        }
                        className="px-2 py-1 text-xs font-semibold rounded-full border border-gray-200 bg-white text-gray-700"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
      {showEditModal && editingIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Edit Idea</h2>
              <button onClick={closeEdit} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  value={editForm.title}
                  onChange={(event) => {
                    setEditForm({ ...editForm, title: event.target.value });
                    if (editErrors.title) setEditErrors({ ...editErrors, title: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent ${
                    editErrors.title ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {editErrors.title && <p className="text-xs text-red-600 mt-1">{editErrors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={editForm.category}
                  onChange={(event) => {
                    setEditForm({ ...editForm, category: event.target.value });
                    if (editErrors.category) setEditErrors({ ...editErrors, category: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent ${
                    editErrors.category ? 'border-red-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {editErrors.category && <p className="text-xs text-red-600 mt-1">{editErrors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(event) =>
                    setEditForm({ ...editForm, status: event.target.value as Idea['status'] })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(event) => {
                    setEditForm({ ...editForm, description: event.target.value });
                    if (editErrors.description) setEditErrors({ ...editErrors, description: '' });
                  }}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent ${
                    editErrors.description ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {editErrors.description && <p className="text-xs text-red-600 mt-1">{editErrors.description}</p>}
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={closeEdit}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 bg-[#0066cc] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#004080] transition flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
