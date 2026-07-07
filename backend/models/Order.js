const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productName: { type: String, required: true, trim: true },
    supplier: { type: String, required: true, trim: true },
    entrepreneurName: { type: String, default: "" },
    entrepreneurEmail: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Processing", "Shipped", "Delivered"],
    },
    orderDate: { type: String, required: true },
    estimatedDelivery: { type: String, required: true },
  },
  { timestamps: true }
);

orderSchema.index({ ownerId: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
