import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Lightbulb, TrendingUp, Target } from 'lucide-react';
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
    setIsSubmitting(true);
    try {
      await entrepreneurApi.createIdea({
        title: formData.title,
        category: formData.category,
        description: formData.description,
      });

      const mockAIFeedback: AIFeedback = {
        marketFit: 8.5,
        feasibility: 7.8,
        suggestions: [
          'Consider adding a mobile app component to increase market reach',
          'Partner with established brands to build credibility',
          'Conduct user surveys to validate core assumptions',
        ],
        strengths: [
          'Strong value proposition addressing a clear pain point',
          'Scalable business model with multiple revenue streams',
          'Large addressable market with growing demand',
        ],
        concerns: [
          'High competition in the selected category',
          'Initial customer acquisition costs may be significant',
          'Technology implementation complexity requires strong technical team',
        ],
      };

      setAiAnalysis(mockAIFeedback);
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Submit Your Startup Idea</h2>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                rows={6}
                placeholder="Describe your startup idea, target market, and unique value proposition..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Document (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0066cc] transition">
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
                      <FileText className="w-12 h-12 text-[#0066cc] mb-2" />
                      <p className="text-sm font-medium text-gray-900">{formData.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
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
                  : 'bg-[#0066cc] hover:bg-[#004080] text-white'
              }`}
            >
              {isSubmitting ? 'Analyzing...' : 'Submit Idea'}
            </button>
          </form>
        </div>

        {/* AI Feedback Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">AI-Powered Feedback</h2>
            <p className="text-gray-600">
              Our AI analyzes your idea for market potential and feasibility.
            </p>
          </div>

          {!aiAnalysis ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Lightbulb className="w-16 h-16 mb-4" />
              <p className="text-center">Submit your idea to receive AI feedback</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-[#0066cc]" />
                    <span className="text-sm font-semibold text-gray-700">Market Fit</span>
                  </div>
                  <div className="text-3xl font-bold text-[#0066cc]">
                    {aiAnalysis.marketFit}/10
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-[#0088dd]" />
                    <span className="text-sm font-semibold text-gray-700">Feasibility</span>
                  </div>
                  <div className="text-3xl font-bold text-[#0088dd]">
                    {aiAnalysis.feasibility}/10
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="font-semibold text-[#0066cc] mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {aiAnalysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-[#0066cc] mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              <div>
                <h4 className="font-semibold text-[#0066cc] mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Suggestions
                </h4>
                <ul className="space-y-2">
                  {aiAnalysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-[#0066cc] mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Concerns */}
              <div>
                <h4 className="font-semibold text-[#0088dd] mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Areas to Consider
                </h4>
                <ul className="space-y-2">
                  {aiAnalysis.concerns.map((concern, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-[#0088dd] mt-1">•</span>
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