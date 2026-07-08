const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
import { getAuthHeaders } from './authHeaders';
import { parseApiError } from './apiError';

export const entrepreneurApi = {
  async getIdeas() {
    const res = await fetch(`${API_BASE}/api/entrepreneur/ideas`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, "Failed to fetch ideas");
    return res.json();
  },
  async createIdea(payload: { title: string; category: string; description: string; file?: File | null }) {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("category", payload.category);
    formData.append("description", payload.description);
    if (payload.file) {
      formData.append("document", payload.file);
    }

    const res = await fetch(`${API_BASE}/api/entrepreneur/ideas`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) throw await parseApiError(res, "Failed to create idea");
    return res.json();
  },
  async updateIdea(
    id: string,
    payload: { title: string; category: string; description: string; status: string; file?: File | null }
  ) {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("category", payload.category);
    formData.append("description", payload.description);
    formData.append("status", payload.status);
    if (payload.file) {
      formData.append("document", payload.file);
    }

    const res = await fetch(`${API_BASE}/api/entrepreneur/ideas/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) throw await parseApiError(res, "Failed to update idea");
    return res.json();
  },
  async deleteIdea(id: string) {
    const res = await fetch(`${API_BASE}/api/entrepreneur/ideas/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, "Failed to delete idea");
    return res.json();
  },
  async getOrders() {
    const res = await fetch(`${API_BASE}/api/entrepreneur/orders`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, "Failed to fetch orders");
    return res.json();
  },
  async getFeedback() {
    const res = await fetch(`${API_BASE}/api/entrepreneur/feedback`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw await parseApiError(res, "Failed to fetch feedback");
    return res.json();
  },
  async createOrder(payload: {
    productName: string;
    supplier: string;
    quantity: number;
    price: number;
    entrepreneurName?: string;
    entrepreneurEmail?: string;
  }) {
    const res = await fetch(`${API_BASE}/api/entrepreneur/orders`, {
      method: "POST",
      headers: getAuthHeaders("application/json"),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw await parseApiError(res, "Failed to create order");
    return res.json();
  },
};
