const express = require("express");
const Idea = require("../models/Idea");
const Order = require("../models/Order");

const router = express.Router();

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

// Ideas CRUD
router.get("/ideas", async (req, res) => {
  try {
    const ideas = await Idea.find().sort({ createdAt: -1 });
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

router.post("/ideas", async (req, res) => {
  try {
    const { title, category, description } = req.body || {};
    if (!title || !category || !description) {
      return res
        .status(400)
        .json({ message: "title, category, and description are required" });
    }

    const newIdea = await Idea.create({
      title,
      category,
      description,
      status: "Under Review",
      aiScore: null,
      feedbackCount: 0,
    });

    res.status(201).json(toIdeaResponse(newIdea));
  } catch (error) {
    res.status(500).json({ message: "Failed to create idea" });
  }
});

router.put("/ideas/:id", async (req, res) => {
  try {
    const updates = {};
    const { title, category, description, status, aiScore, feedbackCount } = req.body || {};

    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (aiScore !== undefined) updates.aiScore = aiScore;
    if (feedbackCount !== undefined) updates.feedbackCount = feedbackCount;

    const idea = await Idea.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    res.json(toIdeaResponse(idea));
  } catch (error) {
    res.status(400).json({ message: "Failed to update idea" });
  }
});

router.delete("/ideas/:id", async (req, res) => {
  try {
    const idea = await Idea.findByIdAndDelete(req.params.id);
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }
    res.json(toIdeaResponse(idea));
  } catch (error) {
    res.status(400).json({ message: "Invalid idea id" });
  }
});

// Orders (read/list + create)
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
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

router.post("/orders", async (req, res) => {
  try {
    const { productName, supplier, quantity, price } = req.body || {};
    if (!productName || !supplier || !quantity || !price) {
      return res
        .status(400)
        .json({ message: "productName, supplier, quantity, and price are required" });
    }

    const orderDate = new Date().toISOString().slice(0, 10);
    const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const newOrder = await Order.create({
      productName,
      supplier,
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
});

module.exports = router;
