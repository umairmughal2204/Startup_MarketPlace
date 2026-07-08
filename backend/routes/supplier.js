const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { requireAuth } = require("../middleware/auth");
const { validateBody, isOneOf, isPositiveNumber, isMeaningfulText } = require("../utils/validate");

const router = express.Router();
router.use(requireAuth);

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered"];

const productValidationRules = {
  name: { required: true, minLength: 2, maxLength: 150 },
  description: {
    required: true,
    minLength: 10,
    minLengthMessage: "Description must be at least 10 characters",
    check: isMeaningfulText,
    checkMessage: "Please enter a valid, meaningful description written in full sentences",
  },
  price: { required: true, check: isPositiveNumber, message: "Price must be a positive number" },
  category: { required: true },
};

const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, or WEBP images are allowed"));
  }
};

const upload = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const toProductResponse = (doc) => {
  const data = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = data;
  return { id: _id.toString(), ...rest };
};

const toOrderResponse = (doc) => {
  const data = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = data;
  return { id: _id.toString(), ...rest };
};

const isOwnerOrAdmin = (user, ownerId) => user && (user.role === "Admin" || String(user._id) === String(ownerId));

// Products CRUD
router.get("/products", async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "Admin") {
      query = {};
    } else if (req.user.role === "Supplier") {
      query = { ownerId: req.user._id };
    } else {
      // Entrepreneurs/Investors browsing the marketplace only ever see approved listings.
      query = { status: "Approved" };
    }
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products.map(toProductResponse));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.post("/products", upload.single("image"), validateBody(productValidationRules), async (req, res) => {
  try {
    const { name, description, price, category, image, features, supplierName, status } = req.body || {};

    const imageName = req.file ? req.file.originalname : "";
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (image || "");
    let parsedFeatures = [];
    if (typeof features === "string") {
      try {
        parsedFeatures = JSON.parse(features);
      } catch (e) {
        parsedFeatures = features.split(",").map((f) => f.trim()).filter(Boolean);
      }
    } else if (Array.isArray(features)) {
      parsedFeatures = features;
    }

    const newProduct = await Product.create({
      ownerId: req.user._id,
      name,
      description,
      price,
      category,
      status: status || "Pending",
      image: image || "",
      imageName,
      imageUrl,
      features: parsedFeatures,
      supplierName: supplierName || "",
    });

    res.status(201).json(toProductResponse(newProduct));
  } catch (error) {
    res.status(500).json({ message: "Failed to create product" });
  }
});

router.put("/products/:id", upload.single("image"), validateBody(productValidationRules), async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (!isOwnerOrAdmin(req.user, existing.ownerId)) {
      return res.status(403).json({ message: "You can only edit your own products" });
    }

    const updates = {};
    const { name, description, price, category, image, features, supplierName, status } = req.body || {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (status !== undefined) updates.status = status;
    if (image !== undefined) updates.image = image;
    if (req.file) {
      updates.imageName = req.file.originalname;
      updates.imageUrl = `/uploads/${req.file.filename}`;
    }
    if (features !== undefined) {
      if (typeof features === "string") {
        try {
          updates.features = JSON.parse(features);
        } catch (e) {
          updates.features = features.split(",").map((f) => f.trim()).filter(Boolean);
        }
      } else if (Array.isArray(features)) {
        updates.features = features;
      }
    }
    if (supplierName !== undefined) updates.supplierName = supplierName;

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(toProductResponse(product));
  } catch (error) {
    res.status(400).json({ message: "Failed to update product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (!isOwnerOrAdmin(req.user, product.ownerId)) {
      return res.status(403).json({ message: "You can only delete your own products" });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json(toProductResponse(product));
  } catch (error) {
    res.status(400).json({ message: "Invalid product id" });
  }
});

// Orders (list + status update)
router.get("/orders", async (req, res) => {
  try {
    const query = req.user.role === "Admin" ? {} : { supplier: req.user.professionalDetails?.businessName || req.user.name };
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders.map(toOrderResponse));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.put(
  "/orders/:id",
  validateBody({
    status: { required: true, check: isOneOf(ORDER_STATUSES), message: "Please select a valid order status" },
  }),
  async (req, res) => {
  try {
    const { status } = req.body || {};

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const supplierName = req.user.professionalDetails?.businessName || req.user.name;
    if (req.user.role !== "Admin" && order.supplier !== supplierName) {
      return res.status(403).json({ message: "You can only update orders linked to your supplier profile" });
    }

    order.status = status;
    await order.save();

    res.json(toOrderResponse(order));
  } catch (error) {
    res.status(400).json({ message: "Failed to update order" });
  }
  }
);

module.exports = router;
