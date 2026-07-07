const express = require("express");
const ChatThread = require("../models/ChatThread");
const ChatMessage = require("../models/ChatMessage");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const normalizeParticipants = (participants = []) =>
  participants
    .filter((p) => p && p.id && p.name && p.role)
    .map((p) => ({ id: String(p.id), name: String(p.name), role: String(p.role) }));

router.get("/threads", async (req, res) => {
  const { userId, role } = req.query;
  try {
    const conditions = [];
    if (userId) {
      conditions.push({ participantIds: String(userId) });
    }
    if (role) {
      conditions.push({ type: "role", role: String(role) });
      if (["Admin", "Investor", "Entrepreneur"].includes(String(role))) {
        conditions.push({ type: "idea" });
      }
    }
    const query = conditions.length ? { $or: conditions } : {};
    const threads = await ChatThread.find(query).sort({ updatedAt: -1 });
    res.json(threads);
  } catch (error) {
    res.status(500).json({ message: "Failed to load threads" });
  }
});

router.post("/threads", async (req, res) => {
  const { type, role, ideaId, ideaTitle, participants, title } = req.body || {};
  try {
    if (!type) {
      return res.status(400).json({ message: "Thread type is required" });
    }

    if (type === "role") {
      if (!role) {
        return res.status(400).json({ message: "Role is required for role threads" });
      }
      const existing = await ChatThread.findOne({ type: "role", role: String(role) });
      if (existing) return res.json(existing);
      const thread = await ChatThread.create({
        type: "role",
        role: String(role),
        title: title || `${role} Room`,
      });
      return res.json(thread);
    }

    if (type === "idea") {
      if (!ideaId) {
        return res.status(400).json({ message: "Idea ID is required for idea threads" });
      }
      const existing = await ChatThread.findOne({ type: "idea", ideaId: String(ideaId) });
      if (existing) return res.json(existing);
      const thread = await ChatThread.create({
        type: "idea",
        ideaId: String(ideaId),
        ideaTitle: ideaTitle || "Idea Discussion",
        title: title || ideaTitle || "Idea Discussion",
      });
      return res.json(thread);
    }

    if (type === "direct") {
      const normalized = normalizeParticipants(participants);
      if (normalized.length < 2) {
        return res.status(400).json({ message: "Direct threads need two participants" });
      }
      const ids = normalized.map((p) => p.id).sort();
      const existing = await ChatThread.findOne({
        type: "direct",
        participantIds: { $all: ids, $size: ids.length },
      });
      if (existing) return res.json(existing);
      const thread = await ChatThread.create({
        type: "direct",
        participantIds: ids,
        participants: normalized,
        title: title || normalized.map((p) => p.name).join(" & "),
      });
      return res.json(thread);
    }

    return res.status(400).json({ message: "Unsupported thread type" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create thread" });
  }
});

router.get("/messages", async (req, res) => {
  const { threadId } = req.query;
  if (!threadId) {
    return res.status(400).json({ message: "threadId is required" });
  }
  try {
    const messages = await ChatMessage.find({ threadId: String(threadId) }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to load messages" });
  }
});

router.post("/messages", async (req, res) => {
  const { threadId, sender, content } = req.body || {};
  if (!threadId || !sender || !content) {
    return res.status(400).json({ message: "threadId, sender, and content are required" });
  }

  try {
    const message = await ChatMessage.create({
      threadId,
      sender,
      content,
    });

    await ChatThread.findByIdAndUpdate(threadId, {
      lastMessage: {
        id: message.id,
        content: message.content,
        senderId: message.sender.id,
        senderName: message.sender.name,
        createdAt: message.createdAt,
      },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`thread:${threadId}`).emit("message:new", message);
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message" });
  }
});

module.exports = router;
