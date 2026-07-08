const express = require("express");
const ChatThread = require("../models/ChatThread");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const normalizeParticipants = (participants = []) =>
  participants
    .filter((p) => p && p.id && p.name && p.role)
    .map((p) => ({ id: String(p.id), name: String(p.name), role: String(p.role) }));

const normalizeUser = (user) => ({
  id: String(user._id || user.id),
  name: String(user.name || ""),
  role: String(user.role || ""),
});

// Every other route in this codebase normalizes _id -> id before responding
// (toIdeaResponse, toProductResponse, etc.). chat.js previously sent raw Mongoose
// documents straight to res.json()/socket.emit() — JSON.stringify on a Mongoose doc
// does NOT include the `id` virtual, only `_id`, so the REST and socket payloads had
// different shapes. That caused the frontend's socket-delivered messages to have
// `id: undefined`, breaking client-side dedupe and producing duplicate messages.
const toMessageResponse = (doc) => {
  const data = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = data;
  return { id: _id.toString(), ...rest };
};

const toThreadResponse = (doc) => {
  const data = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = data;
  return { id: _id.toString(), ...rest };
};

const canAccessThread = (thread, user) => {
  if (!thread || !user) return false;
  const userId = String(user._id);
  if (user.role === "Admin") return true;
  if (thread.type === "direct") {
    return Array.isArray(thread.participantIds) && thread.participantIds.includes(userId);
  }
  if (thread.type === "role") {
    return thread.role === user.role;
  }
  if (thread.type === "idea") {
    return ["Entrepreneur", "Investor"].includes(user.role) || thread.createdBy === userId;
  }
  return false;
};

// GET /api/chat/contacts - minimal list of other users the current user can start a
// direct conversation with. Deliberately narrower than /api/auth/users (which returns
// full profiles and is Admin-only for user management) — this only exposes what the
// chat UI needs to show a contact list.
router.get("/contacts", async (req, res) => {
  try {
    // Admin needs full reach for support/oversight, so it keeps seeing everyone.
    // Everyone else previously saw the entire user directory here too, which meant any
    // user could cold-DM any other user in the system with zero relationship between
    // them. Non-admins now only see: Admin (always reachable for support) + anyone they
    // already have an existing direct thread with (created the moment they used a
    // contextual entry point like "Message Supplier", Co-Founder Connect, or Book
    // Session — those flows are unaffected since they create the thread directly and
    // never go through this list).
    if (req.user.role === "Admin") {
      const users = await User.find(
        { _id: { $ne: req.user._id }, status: "Active" },
        "name role"
      ).sort({ name: 1 });
      return res.json(users.map((user) => ({ id: user._id.toString(), name: user.name, role: user.role })));
    }

    const requesterId = String(req.user._id);
    const existingThreads = await ChatThread.find(
      { type: "direct", participantIds: requesterId },
      "participantIds"
    );
    const knownIds = new Set();
    existingThreads.forEach((thread) => {
      (thread.participantIds || []).forEach((id) => {
        if (id !== requesterId) knownIds.add(id);
      });
    });

    const admins = await User.find({ role: "Admin", status: "Active" }, "_id");
    admins.forEach((admin) => knownIds.add(admin._id.toString()));

    if (knownIds.size === 0) {
      return res.json([]);
    }

    const users = await User.find(
      { _id: { $in: Array.from(knownIds) }, status: "Active" },
      "name role"
    ).sort({ name: 1 });
    res.json(users.map((user) => ({ id: user._id.toString(), name: user.name, role: user.role })));
  } catch (error) {
    res.status(500).json({ message: "Failed to load contacts" });
  }
});

router.get("/threads", async (req, res) => {
  try {
    const userId = String(req.user._id);
    const role = String(req.user.role);
    const conditions = [
      { participantIds: userId },
      { type: "role", role },
    ];
    if (["Admin", "Investor", "Entrepreneur"].includes(role)) {
      conditions.push({ type: "idea" });
    }
    const query = { $or: conditions };
    const threads = await ChatThread.find(query).sort({ updatedAt: -1 });
    res.json(threads.map(toThreadResponse));
  } catch (error) {
    res.status(500).json({ message: "Failed to load threads" });
  }
});

router.post("/threads", async (req, res) => {
  const { type, role, ideaId, ideaTitle, productId, productTitle, participants, title } = req.body || {};
  try {
    if (!type) {
      return res.status(400).json({ message: "Thread type is required" });
    }

    if (type === "role") {
      if (!role) {
        return res.status(400).json({ message: "Role is required for role threads" });
      }
      // A role room is only meant for people who share that role (Admin can see/join
      // any room for oversight). Without this check, any authenticated user could open
      // (and the UI would show a button for) every other role's room, even though they
      // could never actually send/read messages there once canAccessThread kicked in.
      if (String(role) !== req.user.role && req.user.role !== "Admin") {
        return res.status(403).json({ message: "You do not have access to this role room" });
      }
      const existing = await ChatThread.findOne({ type: "role", role: String(role) });
      if (existing) return res.json(toThreadResponse(existing));
      const thread = await ChatThread.create({
        type: "role",
        role: String(role),
        title: title || `${role} Room`,
        createdBy: String(req.user._id),
        participantIds: [String(req.user._id)],
        participants: [normalizeUser(req.user)],
      });
      return res.json(toThreadResponse(thread));
    }

    if (type === "idea") {
      if (!ideaId) {
        return res.status(400).json({ message: "Idea ID is required for idea threads" });
      }
      const existing = await ChatThread.findOne({ type: "idea", ideaId: String(ideaId) });
      if (existing) return res.json(toThreadResponse(existing));
      const thread = await ChatThread.create({
        type: "idea",
        ideaId: String(ideaId),
        ideaTitle: ideaTitle || "Idea Discussion",
        title: title || ideaTitle || "Idea Discussion",
        createdBy: String(req.user._id),
        participantIds: [String(req.user._id)],
        participants: [normalizeUser(req.user)],
      });
      return res.json(toThreadResponse(thread));
    }

    if (type === "direct") {
      const normalized = normalizeParticipants(participants);
      const currentUser = normalizeUser(req.user);
      const otherParticipants = normalized.filter((participant) => participant.id !== currentUser.id);
      if (otherParticipants.length < 1) {
        return res.status(400).json({ message: "Direct threads need two participants" });
      }
      const ids = [currentUser.id, otherParticipants[0].id].sort();
      const existing = await ChatThread.findOne({
        type: "direct",
        participantIds: { $all: ids, $size: ids.length },
      });
      if (existing) {
        // Tag the thread with whichever product prompted this conversation, so the
        // header can show "regarding <product>" even when reopening a past thread
        // (e.g. the same entrepreneur/supplier pair discussing a different product).
        if (productId && existing.productId !== String(productId)) {
          existing.productId = String(productId);
          existing.productTitle = productTitle || existing.productTitle;
          await existing.save();
        }
        return res.json(toThreadResponse(existing));
      }
      const thread = await ChatThread.create({
        type: "direct",
        participantIds: ids,
        participants: [currentUser, otherParticipants[0]],
        createdBy: currentUser.id,
        title: title || [currentUser.name, otherParticipants[0].name].join(" & "),
        productId: productId ? String(productId) : "",
        productTitle: productTitle || "",
      });
      return res.json(toThreadResponse(thread));
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
    const thread = await ChatThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }
    if (!canAccessThread(thread, req.user)) {
      return res.status(403).json({ message: "You do not have access to this thread" });
    }
    const messages = await ChatMessage.find({ threadId: String(threadId) }).sort({ createdAt: 1 });
    res.json(messages.map(toMessageResponse));
  } catch (error) {
    res.status(500).json({ message: "Failed to load messages" });
  }
});

router.post("/messages", async (req, res) => {
  const { threadId, content } = req.body || {};
  if (!threadId || !content) {
    return res.status(400).json({ message: "threadId and content are required" });
  }

  try {
    const thread = await ChatThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }
    if (!canAccessThread(thread, req.user)) {
      return res.status(403).json({ message: "You do not have access to this thread" });
    }

    const sender = normalizeUser(req.user);
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

    const responseMessage = toMessageResponse(message);

    const io = req.app.get("io");
    if (io) {
      // Broadcast to the thread room (for anyone with it open right now) AND to each
      // participant's personal room / role room, so the recipient still gets the
      // message even if they aren't currently viewing this exact thread. Chaining
      // .to() calls before a single .emit() lets Socket.IO dedupe automatically, so a
      // socket that's in more than one of these rooms only receives the event once.
      // Emitting the same normalized shape as the REST response (with a plain `id`
      // field instead of a raw `_id`) is what makes the frontend's dedupe-by-id work.
      let emitter = io.to(`thread:${threadId}`);
      if (thread.type === "direct" && Array.isArray(thread.participantIds)) {
        thread.participantIds.forEach((id) => {
          emitter = emitter.to(`user:${id}`);
        });
      } else if (thread.type === "role" && thread.role) {
        emitter = emitter.to(`role:${thread.role}`);
      }
      emitter.emit("message:new", responseMessage);
    }

    res.json(responseMessage);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message" });
  }
});

module.exports = router;
