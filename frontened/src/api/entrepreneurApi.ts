const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export const entrepreneurApi = {
  async getIdeas() {
    const res = await fetch(`${API_BASE}/api/entrepreneur/ideas`);
    if (!res.ok) throw new Error("Failed to fetch ideas");
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
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to create idea");
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
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to update idea");
    return res.json();
  },
  async deleteIdea(id: string) {
    const res = await fetch(`${API_BASE}/api/entrepreneur/ideas/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete idea");
    return res.json();
  },
  async getOrders() {
    const res = await fetch(`${API_BASE}/api/entrepreneur/orders`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  },
  async createOrder(payload: {
    productName: string;
    supplier: string;
    quantity: number;
    price: number;
  }) {
    const res = await fetch(`${API_BASE}/api/entrepreneur/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create order");
    return res.json();
  },
};
