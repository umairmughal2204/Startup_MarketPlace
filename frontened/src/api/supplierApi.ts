const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export const supplierApi = {
  async getProducts() {
    const res = await fetch(`${API_BASE}/api/supplier/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },
  async createProduct(payload: {
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    imageFile?: File | null;
    features?: string[];
    supplierName?: string;
  }) {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("description", payload.description);
    formData.append("price", String(payload.price));
    formData.append("category", payload.category);
    if (payload.image) formData.append("image", payload.image);
    if (payload.imageFile) formData.append("image", payload.imageFile);
    if (payload.features) formData.append("features", JSON.stringify(payload.features));
    if (payload.supplierName) formData.append("supplierName", payload.supplierName);

    const res = await fetch(`${API_BASE}/api/supplier/products`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
  },
  async updateProduct(
    id: string,
    payload: {
      name: string;
      description: string;
      price: number;
      category: string;
      image?: string;
      imageFile?: File | null;
      features?: string[];
      supplierName?: string;
    }
  ) {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("description", payload.description);
    formData.append("price", String(payload.price));
    formData.append("category", payload.category);
    if (payload.image) formData.append("image", payload.image);
    if (payload.imageFile) formData.append("image", payload.imageFile);
    if (payload.features) formData.append("features", JSON.stringify(payload.features));
    if (payload.supplierName) formData.append("supplierName", payload.supplierName);

    const res = await fetch(`${API_BASE}/api/supplier/products/${id}`, {
      method: "PUT",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
  },
  async deleteProduct(id: string) {
    const res = await fetch(`${API_BASE}/api/supplier/products/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete product");
    return res.json();
  },
  async getOrders() {
    const res = await fetch(`${API_BASE}/api/supplier/orders`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  },
  async updateOrderStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/api/supplier/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update order status");
    return res.json();
  },
};
