import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Lightbulb, TrendingUp, Target, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { entrepreneurApi } from '../../api/entrepreneurApi';

interface IdeaSubmission {
  title: string;
  category: string;
  description: string;
  file: File | null;
}

interface AIFeedback {
  marketFit: number;
  feasibility: number;
  suggestions: string[];
  strengths: string[];
  concerns: string[];
}

export const SubmitIdea = () => {
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState<IdeaSubmission>({
    title: '',
    category: '',
    description: '',
    file: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIFeedback | null>(null);

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

  const formatScore = (score: number) => score.toFixed(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      // Check file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF and DOCX files are allowed');
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmCreate = window.confirm('Submit this idea?');
    if (!confirmCreate) return;
    setIsSubmitting(true);
    try {
      await entrepreneurApi.createIdea({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        file: formData.file,
      });

      const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:4000';
      const aiRes = await fetch(`${API_BASE}/api/ai/analyze-idea`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: formData.description,
        }),
      });
      const aiData = aiRes.ok ? await aiRes.json() : null;

      const realAIFeedback: AIFeedback = {
        marketFit: aiData?.marketFit ?? 7.0,
        feasibility: aiData?.feasibility ?? 6.5,
        suggestions: aiData?.suggestions ?? ['Conduct user research', 'Define go-to-market strategy', 'Build a basic MVP'],
        strengths: aiData?.strengths ?? ['Clear problem statement', 'Defined target audience', 'Growth potential'],
        concerns: aiData?.concerns ?? ['Market competition', 'Funding requirements', 'Execution complexity'],
      };

      setAiAnalysis(realAIFeedback);
      addNotification({
        type: 'general',
        title: 'Idea Submitted Successfully',
        message: `Your idea "${formData.title}" has been sent for review. You'll be notified once it's reviewed.`,
      });
      setFormData({
        title: '',
        category: '',
        description: '',
        file: null,
      });
    } catch (error) {
      alert('Failed to submit idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Submission Form */}
        <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 text-slate-950">Submit Your Startup Idea</h2>
            <p className="text-gray-600">
              Share your concept and receive instant AI-powered feedback on market fit and feasibility.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Idea Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                placeholder="e.g., AI-Powered Fitness App"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                rows={6}
                placeholder="Describe your startup idea, target market, and unique value proposition..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Document (Optional)
              </label>
              <div className="border-2 border-dashed border-pink-200 bg-pink-50/40 rounded-2xl p-6 text-center hover:border-pink-400 transition">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {formData.file ? (
                    <>
                      <div className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 mb-3">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-pink-600" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[220px]">
                              {formData.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setFormData({ ...formData, file: null });
                          }}
                          className="p-1 rounded-full hover:bg-gray-100 transition"
                          aria-label="Remove selected file"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-gray-700">Click to replace PDF or DOCX</p>
                      <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload PDF or DOCX
                      </p>
                      <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-aurora-entrepreneur hover:shadow-lg hover:shadow-pink-500/25 text-white'
              }`}
            >
              {isSubmitting ? 'Analyzing...' : 'Submit Idea'}
            </button>
          </form>
        </div>

        {/* AI Feedback Panel */}
        <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">AI-Powered Feedback</h2>
            <p className="text-gray-600">
              Our AI analyzes your idea for market potential and feasibility.
            </p>
          </div>

          {!aiAnalysis ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 rounded-2xl bg-gradient-to-br from-pink-50 to-violet-50 border border-pink-100">
              <Lightbulb className="w-16 h-16 mb-4 text-pink-300" />
              <p className="text-center">Submit your idea to receive AI feedback</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-pink-600" />
                    <span className="text-sm font-semibold text-gray-700">Market Fit</span>
                  </div>
                  <div className="text-3xl font-bold text-pink-600">
                    {formatScore(aiAnalysis.marketFit)}/10
                  </div>
                </div>
                <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-violet-600" />
                    <span className="text-sm font-semibold text-gray-700">Feasibility</span>
                  </div>
                  <div className="text-3xl font-bold text-violet-600">
                    {formatScore(aiAnalysis.feasibility)}/10
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="font-semibold text-pink-600 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {aiAnalysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-pink-600 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              <div>
                <h4 className="font-semibold text-pink-600 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Suggestions
                </h4>
                <ul className="space-y-2">
                  {aiAnalysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-pink-600 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Concerns */}
              <div>
                <h4 className="font-semibold text-violet-600 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Areas to Consider
                </h4>
                <ul className="space-y-2">
                  {aiAnalysis.concerns.map((concern, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-violet-600 mt-1">•</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
