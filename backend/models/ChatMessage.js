const mongoose = require("mongoose");

const senderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    threadId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatThread", required: true },
    sender: { type: senderSchema, required: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
