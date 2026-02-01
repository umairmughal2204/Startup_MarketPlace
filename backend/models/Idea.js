const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      default: "Under Review",
      enum: ["Pending", "Under Review", "Approved", "Rejected"],
    },
    aiScore: { type: Number, default: null },
    feedbackCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Idea", ideaSchema);
