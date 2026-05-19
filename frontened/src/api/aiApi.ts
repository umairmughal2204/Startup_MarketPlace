const API_BASE = (import.meta as any).env.VITE_API_BASE || "http://localhost:4000";

export const aiApi = {
  async analyzeIdea(payload: { title: string; category: string; description: string }) {
    const res = await fetch(`${API_BASE}/api/ai/analyze-idea`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("AI analysis failed");
    return res.json();
  },

  async estimateCost(payload: { businessType: string; stage: string; teamSize?: string; description?: string }) {
    const res = await fetch(`${API_BASE}/api/ai/estimate-cost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Cost estimation failed");
    return res.json();
  },

  async validateIdea(payload: { title: string; targetAudience: string; problem: string; solution?: string; competitors?: string; uniqueValue?: string }) {
    const res = await fetch(`${API_BASE}/api/ai/validate-idea`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Idea validation failed");
    return res.json();
  },

  async generateBusinessModel(payload: { title: string; category?: string; description: string }) {
    const res = await fetch(`${API_BASE}/api/ai/business-model`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Business model generation failed");
    return res.json();
  },

  async generateRoadmap(payload: { title: string; category?: string; stage?: string }) {
    const res = await fetch(`${API_BASE}/api/ai/roadmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Roadmap generation failed");
    return res.json();
  },
};
