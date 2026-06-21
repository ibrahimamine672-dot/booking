// ================= 0.0 — DOTENV (MUST BE FIRST) =================
console.log("[DEBUG] 0.0 — server.js started");
const dotenv = require("dotenv");
dotenv.config();
console.log("[DEBUG] 0.1 — dotenv.config() completed — MONGO_URI present:", !!process.env.MONGO_URI);

// ================= 0.2 — MODULE IMPORTS =================
console.log("[DEBUG] 0.2 — importing modules...");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
console.log("[DEBUG] 0.3 — modules imported (express, mongoose, cors, passport)");

// ================= 0.4 — PASSPORT CONFIG =================
console.log("[DEBUG] 0.4 — loading passport config...");
require("./config/passport");
console.log("[DEBUG] 0.5 — passport config loaded");

// ================= 0.6 — RATE LIMITER IMPORTS =================
console.log("[DEBUG] 0.6 — loading rate limiters...");
const { apiLimiter, authLimiter, aiLimiter, paymentLimiter, faqLimiter } = require("./middleware/rateLimiter");
console.log("[DEBUG] 0.7 — rate limiters loaded");

// ================= 0.8 — EXPRESS APP =================
console.log("[DEBUG] 0.8 — creating Express app...");
const app = express();
console.log("[DEBUG] 0.9 — Express app created");

// ================= 1.0 — GLOBAL MONGOOSE SETTINGS =================
console.log("[DEBUG] 1.0 — configuring Mongoose settings...");
mongoose.set("bufferCommands", false);
console.log("[DEBUG] 1.1 — Mongoose bufferCommands disabled");

// ================= 2.0 — MONGOOSE CONNECTION OPTIONS =================
console.log("[DEBUG] 2.0 — defining Mongoose connection options...");
const mongooseOptions = {
  maxPoolSize: 100,
  minPoolSize: 10,
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
};
console.log("[DEBUG] 2.1 — Mongoose options defined:", JSON.stringify(mongooseOptions));

// ================= 3.0 — CACHED DB CONNECTION (Serverless-safe) =================
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log("[DEBUG] 3.1 — using cached DB connection");
    return cachedDb;
  }
  console.log("[DEBUG] 3.2 — attempting new MongoDB connection...");
  try {
    cachedDb = await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
    console.log("[DEBUG] 3.3 — MongoDB connected successfully 🟢 (pool: 100)");
  } catch (err) {
    console.error("[DEBUG] 3.3 — MongoDB connection FAILED ❌:", err.message);
    console.error("[DEBUG] 3.3 — Full error:", err);
    // Re-throw so the caller (middleware or startup) can handle it
    throw err;
  }
  return cachedDb;
}

// ================= 4.0 — GLOBAL MIDDLEWARE =================
console.log("[DEBUG] 4.0 — configuring CORS...");
const explicitOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : ["https://booking-v3u2.vercel.app"];
console.log("[DEBUG] 4.1 — CORS origins:", explicitOrigins);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    if (explicitOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn("CORS blocked origin:", origin);
    callback(null, false);
  },
  credentials: true,
}));
console.log("[DEBUG] 4.2 — CORS middleware registered");

console.log("[DEBUG] 4.3 — registering express.json...");
app.use(express.json({ limit: "1mb" }));
console.log("[DEBUG] 4.4 — express.json middleware registered");

// ================= 5.0 — PASSPORT INITIALIZATION =================
console.log("[DEBUG] 5.0 — initializing Passport...");
app.use(passport.initialize());
console.log("[DEBUG] 5.1 — Passport initialized");

// ================= 6.0 — RATE LIMITING =================
console.log("[DEBUG] 6.0 — registering rate limiters...");
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/ai", aiLimiter);
app.use("/api/payment", paymentLimiter);
app.use("/api/faq", faqLimiter);
console.log("[DEBUG] 6.1 — rate limiters registered");

// ================= 7.0 — DB CONNECTION MIDDLEWARE =================
console.log("[DEBUG] 7.0 — registering DB connection middleware...");
app.use(async (req, res, next) => {
  try {
    console.log("[DEBUG] 7.1 — DB middleware: ensuring connection...");
    await connectToDatabase();
    console.log("[DEBUG] 7.2 — DB middleware: connection ready, proceeding...");
    next();
  } catch (err) {
    console.error("[DEBUG] 7.3 — DB middleware: connection error:", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});
console.log("[DEBUG] 7.4 — DB connection middleware registered");

// ================= 8.0 — LOAD ROUTES =================
console.log("[DEBUG] 8.0 — loading route modules...");
const userRoutes = require("./routes/userRoutes");
console.log("[DEBUG] 8.1 — userRoutes loaded");
const destinationRoutes = require("./routes/destinationRoutes");
console.log("[DEBUG] 8.2 — destinationRoutes loaded");
const bookingRoutes = require("./routes/bookingRoutes");
console.log("[DEBUG] 8.3 — bookingRoutes loaded");
const aiRoutes = require("./routes/aiRoutes");
console.log("[DEBUG] 8.4 — aiRoutes loaded");
const paymentRoutes = require("./routes/paymentRoutes");
console.log("[DEBUG] 8.5 — paymentRoutes loaded");
const noteRoutes = require("./routes/noteRoutes");
console.log("[DEBUG] 8.6 — noteRoutes loaded");
const faqRoutes = require("./routes/faqRoutes");
console.log("[DEBUG] 8.7 — faqRoutes loaded");

// ================= 9.0 — USE ROUTES =================
console.log("[DEBUG] 9.0 — registering route handlers...");
app.use("/api/auth", userRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/faq", faqRoutes);
console.log("[DEBUG] 9.1 — all route handlers registered");

// ================= 10.0 — HOME ROUTE =================
console.log("[DEBUG] 10.0 — registering home route...");
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});
console.log("[DEBUG] 10.1 — home route registered");

// ================= 11.0 — GLOBAL ERROR HANDLER =================
console.log("[DEBUG] 11.0 — registering global error handler...");
app.use((err, req, res, next) => {
  console.error("[DEBUG] Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});
console.log("[DEBUG] 11.1 — global error handler registered");

// ================= 12.0 — START SERVER (local development only) =================
if (process.env.NODE_ENV !== "production") {
  console.log("[DEBUG] 12.0 — NODE_ENV is not 'production', starting server...");
  connectToDatabase()
    .then(() => {
      console.log("[DEBUG] 12.1 — DB connected, starting HTTP server...");
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log("[DEBUG] 12.2 — Server running on port " + PORT + " 🚀");
      });
    })
    .catch((err) => {
      console.error("[DEBUG] 12.3 — Server failed to start ❌:", err.message);
      console.error("[DEBUG] 12.3 — Full error:", err);
      process.exit(1);
    });
} else {
  console.log("[DEBUG] 12.0 — NODE_ENV is '" + process.env.NODE_ENV + "', skipping listen (serverless export)");
}

// ================= 13.0 — EXPORT FOR SERVERLESS =================
console.log("[DEBUG] 13.0 — exporting app...");
module.exports = app;
console.log("[DEBUG] 13.1 — app exported");

// ================= 14.0 — GLOBAL UNHANDLED REJECTION HANDLER =================
console.log("[DEBUG] 14.0 — registering unhandledRejection handler...");
process.on("unhandledRejection", (err) => {
  console.error("[DEBUG] ❌ Unhandled Rejection:", err);
});
console.log("[DEBUG] 15.0 — server.js boot sequence complete ✅");
