const express = require("express");
const path = require("path");
const multer = require("multer");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const uploadsDir = path.join(__dirname, "..", "uploads");
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

// Products CRUD
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products.map(toProductResponse));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, image, features, supplierName, status } = req.body || {};
    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({ message: "name, description, price, and category are required" });
    }

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

router.put("/products/:id", upload.single("image"), async (req, res) => {
  try {
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

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(toProductResponse(product));
  } catch (error) {
    res.status(400).json({ message: "Failed to update product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(toProductResponse(product));
  } catch (error) {
    res.status(400).json({ message: "Invalid product id" });
  }
});

// Orders (list + status update)
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders.map(toOrderResponse));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.put("/orders/:id", async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(toOrderResponse(order));
  } catch (error) {
    res.status(400).json({ message: "Failed to update order" });
  }
});

module.exports = router;
