const API_BASE = (import.meta as any).env.VITE_API_BASE || "http://localhost:4000";

export const investorApi = {
  async getFeedback(ideaId?: string) {
    const url = ideaId
      ? `${API_BASE}/api/investor/feedback?ideaId=${encodeURIComponent(ideaId)}`
      : `${API_BASE}/api/investor/feedback`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch feedback");
    return res.json();
  },
  async createFeedback(payload: { ideaId: string; investorName?: string; rating: number; comment?: string }) {
    const res = await fetch(`${API_BASE}/api/investor/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create feedback");
    return res.json();
  },
  async updateFeedback(id: string, payload: { rating?: number; comment?: string }) {
    const res = await fetch(`${API_BASE}/api/investor/feedback/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update feedback");
    return res.json();
  },
  async deleteFeedback(id: string) {
    const res = await fetch(`${API_BASE}/api/investor/feedback/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete feedback");
    return res.json();
  },
};
