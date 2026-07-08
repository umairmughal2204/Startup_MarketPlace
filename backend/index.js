const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const entrepreneurRoutes = require("./routes/entrepreneur");
const supplierRoutes = require("./routes/supplier");
const investorRoutes = require("./routes/investor");
const chatRoutes = require("./routes/chat");
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const featureRoutes = require("./routes/features");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/entrepreneur", entrepreneurRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/investor", investorRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/features", featureRoutes);

// Simple health check route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

// Catch-all error handler: ensures errors thrown by middleware (e.g. multer file
// filters/size limits) reach the client as JSON instead of Express's default HTML page,
// which would otherwise fail to parse on the frontend and surface a generic error.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error("Unhandled request error:", error);
  const status = error.status || error.statusCode || (error.code === "LIMIT_FILE_SIZE" ? 413 : 400);
  res.status(status).json({ message: error.message || "Something went wrong" });
});

const startServer = async () => {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing. Add it to backend/.env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    if (ADMIN_EMAIL && ADMIN_PASSWORD) {
      const normalizedEmail = String(ADMIN_EMAIL).toLowerCase();
      const existingAdmin = await User.findOne({ role: "Admin" });

      if (existingAdmin) {
        existingAdmin.name = ADMIN_NAME;
        existingAdmin.email = normalizedEmail;
        existingAdmin.password = ADMIN_PASSWORD;
        existingAdmin.isVerified = true;
        existingAdmin.status = "Active";
        await existingAdmin.save();
        console.log(`Admin account refreshed from env for ${normalizedEmail}`);
      } else {
        await User.create({
          name: ADMIN_NAME,
          email: normalizedEmail,
          password: ADMIN_PASSWORD,
          role: "Admin",
          isVerified: true,
          status: "Active",
        });
        console.log(`Admin account created from env for ${normalizedEmail}`);
      }
    }

    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      const user = socket.handshake.auth?.user;
      if (user?.id && user?.role) {
        socket.join(`user:${user.id}`);
        socket.join(`role:${user.role}`);
      }

      socket.on("thread:join", (payload) => {
        if (payload?.threadId) {
          socket.join(`thread:${payload.threadId}`);
        }
      });

      socket.on("thread:leave", (payload) => {
        if (payload?.threadId) {
          socket.leave(`thread:${payload.threadId}`);
        }
      });
    });

    app.set("io", io);

    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

startServer();
