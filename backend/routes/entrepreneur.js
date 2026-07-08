const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Idea = require("../models/Idea");
const Order = require("../models/Order");
const Feedback = require("../models/Feedback");
const { requireAuth } = require("../middleware/auth");
const { validateBody, isOneOf, isPositiveNumber, isIntInRange, isMeaningfulText } = require("../utils/validate");

const router = express.Router();
router.use(requireAuth);

const IDEA_CATEGORIES = [
  "Technology",
  "Healthcare",
  "Education",
  "E-commerce",
  "Finance",
  "Sustainability",
  "Entertainment",
  "Other",
];

const ideaValidationRules = {
  title: { required: true, minLength: 3, maxLength: 150 },
  category: { required: true, check: isOneOf(IDEA_CATEGORIES), message: "Please select a valid category" },
  description: {
    required: true,
    minLength: 20,
    minLengthMessage: "Description must be at least 20 characters",
    check: isMeaningfulText,
    checkMessage: "Please enter a valid, meaningful description written in full sentences",
  },
};

const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files are allowed"));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

const toIdeaResponse = (doc) => {
  const data = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = data;
  return { id: _id.toString(), ...rest };
};

const toOrderResponse = (doc) => {
  const data = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = data;
  return { id: _id.toString(), ...rest };
};

const toFeedbackResponse = (doc) => {
  const data = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ideaId, ...rest } = data;
  const ideaDoc = ideaId && ideaId.title ? ideaId : null;
  return {
    id: _id.toString(),
    ideaId: ideaDoc ? ideaDoc._id.toString() : ideaId?.toString?.() || ideaId,
    ideaTitle: ideaDoc ? ideaDoc.title : undefined,
    category: ideaDoc ? ideaDoc.category : undefined,
    ...rest,
  };
};

const isOwnerOrAdmin = (user, ownerId) => user && (user.role === "Admin" || String(user._id) === String(ownerId));

// Ideas CRUD
router.get("/ideas", async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "Admin") {
      query = {};
    } else if (req.user.role === "Investor") {
      query = { status: "Approved" };
    } else {
      query = { ownerId: req.user._id };
    }
    const ideas = await Idea.find(query).sort({ createdAt: -1 });
    res.json(ideas.map(toIdeaResponse));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch ideas" });
  }
});

router.get("/ideas/:id", async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }
    res.json(toIdeaResponse(idea));
  } catch (error) {
    res.status(400).json({ message: "Invalid idea id" });
  }
});

// Helper function to generate AI score based on idea content
const generateAIScore = (title, description) => {
  // Simulate AI scoring based on content quality indicators
  let score = 5.0; // Base score
  
  // Title quality factors
  if (title.length > 10) score += 0.5;
  if (title.length > 20) score += 0.5;
  
  // Description quality factors
  if (description.length > 50) score += 0.5;
  if (description.length > 100) score += 0.5;
  if (description.length > 200) score += 0.5;
  if (description.length > 500) score += 0.5;
  
  // Check for key business terms
  const businessTerms = ['market', 'customer', 'revenue', 'growth', 'solution', 'problem', 'target', 'value', 'innovation', 'scalable'];
  const descLower = description.toLowerCase();
  businessTerms.forEach(term => {
    if (descLower.includes(term)) score += 0.2;
  });
  
  // Add some randomness for variation (0 to 1)
  score += Math.random();
  
  // Cap between 1 and 10
  return Math.min(10, Math.max(1, parseFloat(score.toFixed(1))));
};

router.post("/ideas", upload.single("document"), validateBody(ideaValidationRules), async (req, res) => {
  try {
    const { title, category, description } = req.body || {};

    // Generate AI score based on idea content
    const aiScore = generateAIScore(title, description);

    const documentName = req.file ? req.file.originalname : null;
    const documentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newIdea = await Idea.create({
      ownerId: req.user._id,
      title,
      category,
      description,
      status: "Under Review",
      aiScore,
      documentName,
      documentUrl,
      feedbackCount: 0,
    });

    res.status(201).json(toIdeaResponse(newIdea));
  } catch (error) {
    console.error("POST /ideas failed:", error);
    res.status(500).json({ message: "Failed to create idea" });
  }
});

router.put("/ideas/:id", upload.single("document"), validateBody(ideaValidationRules), async (req, res) => {
  try {
    const existing = await Idea.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Idea not found" });
    }
    if (!isOwnerOrAdmin(req.user, existing.ownerId)) {
      return res.status(403).json({ message: "You can only edit your own ideas" });
    }

    const updates = {};
    const { title, category, description, status, aiScore, feedbackCount } = req.body || {};

    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (aiScore !== undefined) updates.aiScore = aiScore;
    if (feedbackCount !== undefined) updates.feedbackCount = feedbackCount;
    if (req.file) {
      updates.documentName = req.file.originalname;
      updates.documentUrl = `/uploads/${req.file.filename}`;
    }

    const idea = await Idea.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(toIdeaResponse(idea));
  } catch (error) {
    res.status(400).json({ message: "Failed to update idea" });
  }
});

router.delete("/ideas/:id", async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }
    if (!isOwnerOrAdmin(req.user, idea.ownerId)) {
      return res.status(403).json({ message: "You can only delete your own ideas" });
    }
    await Idea.findByIdAndDelete(req.params.id);
    res.json(toIdeaResponse(idea));
  } catch (error) {
    res.status(400).json({ message: "Invalid idea id" });
  }
});

// Orders (read/list + create)
router.get("/orders", async (req, res) => {
  try {
    const query = req.user.role === "Admin" ? {} : { ownerId: req.user._id };
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders.map(toOrderResponse));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(toOrderResponse(order));
  } catch (error) {
    res.status(400).json({ message: "Invalid order id" });
  }
});

router.post(
  "/orders",
  validateBody({
    productName: { required: true },
    supplier: { required: true },
    quantity: { required: true, check: isIntInRange(1, 999), message: "Quantity must be a whole number between 1 and 999" },
    price: { required: true, check: isPositiveNumber, message: "Price must be a positive number" },
  }),
  async (req, res) => {
  try {
    const { productName, supplier, quantity, price, entrepreneurName, entrepreneurEmail } = req.body || {};

    const orderDate = new Date().toISOString().slice(0, 10);
    const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const newOrder = await Order.create({
      ownerId: req.user._id,
      productName,
      supplier,
      entrepreneurName: entrepreneurName || "",
      entrepreneurEmail: entrepreneurEmail || "",
      quantity,
      price,
      status: "Pending",
      orderDate,
      estimatedDelivery,
    });

    res.status(201).json(toOrderResponse(newOrder));
  } catch (error) {
    res.status(500).json({ message: "Failed to create order" });
  }
  }
);

router.get("/feedback", async (req, res) => {
  try {
    let query = {};

    if (req.user.role !== "Admin") {
      const ownedIdeas = await Idea.find({ ownerId: req.user._id }).select("_id");
      const ideaIds = ownedIdeas.map((idea) => idea._id);
      if (ideaIds.length === 0) {
        return res.json([]);
      }
      query = { ideaId: { $in: ideaIds } };
    }

    const feedback = await Feedback.find(query)
      .populate("ideaId", "title category")
      .sort({ createdAt: -1 });

    res.json(feedback.map(toFeedbackResponse));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

module.exports = router;
