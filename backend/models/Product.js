const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Approved", "Rejected"],
    },
    image: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    imageName: { type: String, default: "" },
    features: { type: [String], default: [] },
    supplierName: { type: String, default: "" },
  },
  { timestamps: true }
);

productSchema.index({ ownerId: 1, createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
