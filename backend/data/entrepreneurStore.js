const nowIso = () => new Date().toISOString();

const ideas = [
  {
    id: "idea_1",
    title: "AI-Powered Fitness App",
    category: "Technology",
    description: "Personalized fitness coaching using AI and wearables.",
    status: "Under Review",
    aiScore: 8.5,
    feedbackCount: 5,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "idea_2",
    title: "Sustainable Packaging Solution",
    category: "Sustainability",
    description: "Eco-friendly packaging for e-commerce brands.",
    status: "Approved",
    aiScore: 9.2,
    feedbackCount: 12,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "idea_3",
    title: "EdTech Platform for K-12",
    category: "Education",
    description: "Adaptive learning platform for schools.",
    status: "Pending",
    aiScore: 7.8,
    feedbackCount: 3,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

const orders = [
  {
    id: "ORD-001",
    productName: "Cloud Hosting Package",
    supplier: "TechSupply Co.",
    quantity: 1,
    price: 299,
    status: "Delivered",
    orderDate: "2026-01-10",
    estimatedDelivery: "2026-01-12",
  },
  {
    id: "ORD-002",
    productName: "Logo Design Service",
    supplier: "Creative Studio",
    quantity: 1,
    price: 499,
    status: "Processing",
    orderDate: "2026-01-13",
    estimatedDelivery: "2026-01-20",
  },
  {
    id: "ORD-003",
    productName: "SEO Optimization Package",
    supplier: "Digital Growth",
    quantity: 1,
    price: 899,
    status: "Pending",
    orderDate: "2026-01-15",
    estimatedDelivery: "2026-01-22",
  },
];

const generateId = (prefix = "idea") =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

module.exports = {
  ideas,
  orders,
  generateId,
  nowIso,
};
