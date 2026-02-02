const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();
const entrepreneurRoutes = require("./routes/entrepreneur");

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/entrepreneur", entrepreneurRoutes);

// Simple health check route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

const startServer = async () => {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing. Add it to backend/.env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

startServer();
