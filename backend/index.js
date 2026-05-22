const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const entrepreneurRoutes = require("./routes/entrepreneur");
const supplierRoutes = require("./routes/supplier");
const investorRoutes = require("./routes/investor");
const chatRoutes = require("./routes/chat");
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const resourceRoutes = require("./routes/resources");
const featureRoutes = require("./routes/features");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/entrepreneur", entrepreneurRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/investor", investorRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/features", featureRoutes);

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

    const adminEmail = "admin@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: "Admin",
        email: adminEmail,
        password: "admin123",
        role: "Admin",
        isVerified: true,
        status: "Active",
      });
      console.log("Default admin account created");
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
