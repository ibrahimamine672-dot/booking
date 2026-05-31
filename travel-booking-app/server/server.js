const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { apiLimiter, authLimiter, aiLimiter, paymentLimiter } = require("./middleware/rateLimiter");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// ================= MONGOOSE CONNECTION OPTIONS =================
const mongooseOptions = {
  maxPoolSize: 100,            // Allow up to 100 concurrent database connections
  minPoolSize: 10,             // Keep at least 10 connections warm
  serverSelectionTimeoutMS: 5000,  // Fail fast if DB is unreachable (5s)
  socketTimeoutMS: 45000,      // Close idle sockets after 45s
  family: 4,                   // Prefer IPv4 (avoids IPv6 connection issues)
};

async function startServer() {
  const app = express();

  // ================= GLOBAL MIDDLEWARE =================
  app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }));
  app.use(express.json({ limit: "1mb" })); // Limit body size to prevent abuse

  // ================= RATE LIMITING =================
  app.use("/api", apiLimiter);                           // General: 100 req/15min
  app.use("/api/auth", authLimiter);                     // Auth: 10 req/15min
  app.use("/api/ai", aiLimiter);                         // AI: 20 req/min
  app.use("/api/payment", paymentLimiter);               // Payment: 5 req/min

  // ================= DATABASE CONNECTION =================
  await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
  console.log("MongoDB connected 🟢 (pool: 100)");

  // ================= ROUTES =================
  const userRoutes = require("./routes/userRoutes");
  const destinationRoutes = require("./routes/destinationRoutes");
  const bookingRoutes = require("./routes/bookingRoutes");
  const aiRoutes = require("./routes/aiRoutes");
  const paymentRoutes = require("./routes/paymentRoutes");

  // ================= USE ROUTES =================
  app.use("/api/auth", userRoutes);
  app.use("/api/destinations", destinationRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/payment", paymentRoutes);

  // ================= HOME ROUTE =================
  app.get("/", (req, res) => {
    res.send("API is running 🚀");
  });

  // ================= GLOBAL ERROR HANDLER =================
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
  });

  // ================= START SERVER =================
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
  });
}

startServer().catch((err) => {
  console.log("Server error ❌", err);
  process.exit(1);
});

// Handle unhandled promise rejections globally (safety net)
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});
