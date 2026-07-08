const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
  },
  { _id: false }
);

const lastMessageSchema = new mongoose.Schema(
  {
    id: { type: String, default: null },
    content: { type: String, default: "" },
    senderId: { type: String, default: "" },
    senderName: { type: String, default: "" },
    createdAt: { type: Date, default: null },
  },
  { _id: false }
);

const chatThreadSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["role", "direct", "idea"],
      required: true,
    },
    createdBy: { type: String, default: "", index: true },
    title: { type: String, default: "" },
    role: { type: String, default: "" },
    ideaId: { type: String, default: "" },
    ideaTitle: { type: String, default: "" },
    productId: { type: String, default: "" },
    productTitle: { type: String, default: "" },
    participantIds: { type: [String], default: [] },
    participants: { type: [participantSchema], default: [] },
    lastMessage: { type: lastMessageSchema, default: () => ({}) },
  },
  { timestamps: true }
);

chatThreadSchema.index({ participantIds: 1, updatedAt: -1 });

module.exports = mongoose.model("ChatThread", chatThreadSchema);
