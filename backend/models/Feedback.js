const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    investorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ideaId: { type: mongoose.Schema.Types.ObjectId, ref: "Idea", required: true },
    investorName: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

feedbackSchema.index({ investorId: 1, createdAt: -1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
