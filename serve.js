const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const { apiLimiter, authLimiter, aiLimiter, paymentLimiter } = require("./travel-booking-app/server/middleware/rateLimiter");

// ================= MONGOOSE CONNECTION OPTIONS =================
const mongooseOptions = {
  maxPoolSize: 100,            // Allow up to 100 concurrent DB connections
  minPoolSize: 10,             // Keep at least 10 connections warm
  serverSelectionTimeoutMS: 5000,  // Fail fast if DB is unreachable (5s)
  socketTimeoutMS: 45000,      // Close idle sockets after 45s
  family: 4,                   // Prefer IPv4
};

async function startServer() {
  const app = express();

  // ================= GLOBAL MIDDLEWARE =================
  app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }));
  app.use(express.json({ limit: "1mb" }));

  // ================= RATE LIMITING =================
  app.use("/api", apiLimiter);                           // General: 100 req/15min
  app.use("/api/auth", authLimiter);                     // Auth: 10 req/15min
  app.use("/api/ai", aiLimiter);                         // AI: 20 req/min
  app.use("/api/payment", paymentLimiter);               // Payment: 5 req/min

  // ================= DATABASE CONNECTION =================
  await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
  console.log("✅ MongoDB connected (pool: 100)");

  // ================= ROUTES =================
  app.use("/api/auth", require("./travel-booking-app/server/routes/userRoutes"));
  app.use("/api/destinations", require("./travel-booking-app/server/routes/destinationRoutes"));
  app.use("/api/bookings", require("./travel-booking-app/server/routes/bookingRoutes"));
  app.use("/api/ai", require("./travel-booking-app/server/routes/aiRoutes"));
  app.use("/api/payment", require("./travel-booking-app/server/routes/paymentRoutes"));

  // ================= HOME ROUTE =================
  app.get("/", (req, res) => {
    res.send("API is running 🚀");
  });

  // ================= 404 HANDLER =================
  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  // ================= GLOBAL ERROR HANDLER =================
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
  });

  // ================= START SERVER =================
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("❌ Server failed to start:", err);
  process.exit(1);
});

// Handle unhandled promise rejections globally (safety net)
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});
