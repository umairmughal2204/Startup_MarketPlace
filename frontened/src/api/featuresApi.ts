const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:4000';
import { getAuthHeaders } from './authHeaders';
import { parseApiError } from './apiError';

const getHeaders = () => getAuthHeaders('application/json');

// ========== MENTORSHIP API ==========
export const mentorshipApi = {
  async getMentors() {
    const res = await fetch(`${API_BASE}/api/features/mentors`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to fetch mentors');
    return res.json();
  },

  async becomeMentor(data: {
    mentorBio: string;
    expertise: string[];
    hourlyRate: number;
    mentorAvailability: string;
  }) {
    const res = await fetch(`${API_BASE}/api/features/become-mentor`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to become mentor');
    return res.json();
  },

  async bookSession(mentorId: string) {
    const res = await fetch(`${API_BASE}/api/features/mentors/${mentorId}/book`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to book session');
    return res.json();
  },
};

// ========== CO-FOUNDER API ==========
export const cofounderApi = {
  async getCoFounders(filters?: { skills?: string; industry?: string; commitment?: string }) {
    const params = new URLSearchParams();
    if (filters?.skills) params.append('skills', filters.skills);
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.commitment) params.append('commitment', filters.commitment);

    const res = await fetch(`${API_BASE}/api/features/cofounders?${params}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to fetch co-founders');
    return res.json();
  },

  async becomeCoFounder(data: {
    coFounderBio: string;
    coFounderSkills: string[];
    equityExpectation: string;
    coFounderCommitment: string;
  }) {
    const res = await fetch(`${API_BASE}/api/features/become-cofounder`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to become co-founder seeker');
    return res.json();
  },

  async getCoFounderSkills() {
    const res = await fetch(`${API_BASE}/api/features/cofounder-skills`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to fetch skills');
    return res.json();
  },

  async connect(coFounderId: string) {
    const res = await fetch(`${API_BASE}/api/features/cofounders/${coFounderId}/connect`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to send connect request');
    return res.json();
  },

  async getSentRequests(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/api/features/my-sent-cofounder-requests`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to fetch sent requests');
    return res.json();
  },
};

// ========== WEBINAR API ==========
export const webinarApi = {
  async getWebinars(filters?: { category?: string; level?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.level) params.append('level', filters.level);
    if (filters?.status) params.append('status', filters.status);

    const res = await fetch(`${API_BASE}/api/features/webinars?${params}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to fetch webinars');
    return res.json();
  },

  async getWebinar(id: string) {
    const res = await fetch(`${API_BASE}/api/features/webinars/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to fetch webinar');
    return res.json();
  },

  async createWebinar(data: {
    title: string;
    description: string;
    instructor: string;
    category: string;
    level: string;
    duration: string;
    date: string;
    meetingUrl?: string;
    tags?: string[];
    maxParticipants?: number;
  }) {
    const res = await fetch(`${API_BASE}/api/features/webinars`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to create webinar');
    return res.json();
  },

  async enroll(webinarId: string) {
    const res = await fetch(`${API_BASE}/api/features/webinars/${webinarId}/enroll`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to enroll');
    return res.json();
  },

  async rateWebinar(webinarId: string, rating: number) {
    const res = await fetch(`${API_BASE}/api/features/webinars/${webinarId}/rate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rating }),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to rate webinar');
    return res.json();
  },

  async getMyEnrolledWebinars() {
    const res = await fetch(`${API_BASE}/api/features/my-enrolled-webinars`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to fetch enrolled webinars');
    return res.json();
  },
};

// ========== RESOURCE API ==========
export const resourceLibraryApi = {
  async getResources(filters?: { type?: string; category?: string }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.category) params.append('category', filters.category);

    const res = await fetch(`${API_BASE}/api/features/resources?${params}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to fetch resources');
    return res.json();
  },

  async getResource(id: string) {
    const res = await fetch(`${API_BASE}/api/features/resources/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to fetch resource');
    return res.json();
  },

  async createResource(data: {
    title: string;
    description: string;
    type: string;
    category: string;
    fileUrl: string;
    fileName: string;
    fileSize?: number;
    fileType?: string;
    readTime?: string;
    tags?: string[];
  }) {
    const res = await fetch(`${API_BASE}/api/features/resources`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to create resource');
    return res.json();
  },

  async trackDownload(resourceId: string) {
    const res = await fetch(`${API_BASE}/api/features/resources/${resourceId}/download`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to track download');
    return res.json();
  },

  async toggleSave(resourceId: string) {
    const res = await fetch(`${API_BASE}/api/features/resources/${resourceId}/save`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to save resource');
    return res.json();
  },

  async getMySavedResources() {
    const res = await fetch(`${API_BASE}/api/features/my-saved-resources`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, 'Failed to fetch saved resources');
    return res.json();
  },
};
