const express = require("express");
const Feedback = require("../models/Feedback");
const Idea = require("../models/Idea");

const router = express.Router();

const toFeedbackResponse = (doc) => {
  const data = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ideaId, ...rest } = data;
  const ideaDoc = ideaId && ideaId.title ? ideaId : null;
  const ideaIdValue = ideaDoc ? ideaDoc._id.toString() : ideaId?.toString?.() || ideaId;
  return {
    id: _id.toString(),
    ideaId: ideaIdValue,
    ideaTitle: ideaDoc ? ideaDoc.title : undefined,
    category: ideaDoc ? ideaDoc.category : undefined,
    ...rest,
  };
};

// Feedback CRUD
router.get("/feedback", async (req, res) => {
  try {
    const { ideaId } = req.query || {};
    const query = ideaId ? { ideaId } : {};
    const feedback = await Feedback.find(query)
      .populate("ideaId", "title category")
      .sort({ createdAt: -1 });
    res.json(feedback.map(toFeedbackResponse));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

router.post("/feedback", async (req, res) => {
  try {
    const { ideaId, investorName, rating, comment } = req.body || {};
    if (!ideaId || !rating) {
      return res.status(400).json({ message: "ideaId and rating are required" });
    }

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    const feedback = await Feedback.create({
      ideaId,
      investorName: investorName || "",
      rating,
      comment: comment || "",
    });

    await Idea.findByIdAndUpdate(ideaId, { $inc: { feedbackCount: 1 } });

    const populated = await Feedback.findById(feedback._id).populate("ideaId", "title category");
    res.status(201).json(toFeedbackResponse(populated));
  } catch (error) {
    res.status(400).json({ message: "Failed to create feedback" });
  }
});

router.put("/feedback/:id", async (req, res) => {
  try {
    const updates = {};
    const { rating, comment } = req.body || {};
    if (rating !== undefined) updates.rating = rating;
    if (comment !== undefined) updates.comment = comment;

    const feedback = await Feedback.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("ideaId", "title category");

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json(toFeedbackResponse(feedback));
  } catch (error) {
    res.status(400).json({ message: "Failed to update feedback" });
  }
});

router.delete("/feedback/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const updatedIdea = await Idea.findByIdAndUpdate(
      feedback.ideaId,
      { $inc: { feedbackCount: -1 } },
      { new: true }
    );
    if (updatedIdea && updatedIdea.feedbackCount < 0) {
      await Idea.findByIdAndUpdate(updatedIdea._id, { feedbackCount: 0 });
    }

    res.json(toFeedbackResponse(feedback));
  } catch (error) {
    res.status(400).json({ message: "Failed to delete feedback" });
  }
});

module.exports = router;
