const express = require("express");
const cors = require("cors");
const path = require("path");

// Load .env FIRST before any module that depends on env vars
// override: true ensures fresh values from .env replace stale shell-inherited values
require("dotenv").config({ override: true });

// ================= PASSPORT (shared instance with server's config/passport) =================
// Try the server's local node_modules first (local dev), then fall back to hoisted root (Railway).
let passport;
try {
  passport = require("./travel-booking-app/server/node_modules/passport");
} catch {
  passport = require("passport");
}
require("./travel-booking-app/server/config/passport");
const { apiLimiter, authLimiter, aiLimiter, paymentLimiter, faqLimiter } = require("./travel-booking-app/server/middleware/rateLimiter");

// ================= SHARED MONGOOSE INSTANCE =================
// Try the server's local node_modules first (local dev), then fall back to hoisted root (Railway).
// This ensures models compiled via require("mongoose") in server/ resolve to the same instance
// that opens the connection in this file.
let mongoose;
try {
  mongoose = require("./travel-booking-app/server/node_modules/mongoose");
} catch {
  mongoose = require("mongoose");
}

// ================= LOAD ROUTES & MODELS BEFORE CONNECTION =================
// Models MUST be compiled before mongoose.connect() so that their
// NativeCollection.onOpen() is called when the connection opens.
const userRoutes = require("./travel-booking-app/server/routes/userRoutes");
const destinationRoutes = require("./travel-booking-app/server/routes/destinationRoutes");
const bookingRoutes = require("./travel-booking-app/server/routes/bookingRoutes");
const aiRoutes = require("./travel-booking-app/server/routes/aiRoutes");
const paymentRoutes = require("./travel-booking-app/server/routes/paymentRoutes");
const noteRoutes = require("./travel-booking-app/server/routes/noteRoutes");
const faqRoutes = require("./travel-booking-app/server/routes/faqRoutes");

// ================= MONGOOSE CONNECTION OPTIONS =================
const mongooseOptions = {
  maxPoolSize: 100,
  minPoolSize: 10,
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
};

async function startServer() {
  const app = express();
  const startTime = Date.now();

  console.log("🚀 TravelBook server starting...");

  // ================= GLOBAL MIDDLEWARE =================
  const explicitOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
    : ["https://booking-behm.vercel.app"];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, health checks)
      if (!origin) {
        return callback(null, true);
      }
      // Strip trailing slash for consistent matching
      const normalized = origin.replace(/\/+$/, "");
      // Allow any localhost or 127.0.0.1 origin regardless of port (Vite uses dynamic ports)
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized)) {
        return callback(null, true);
      }
      // Allow explicitly configured origins via CORS_ORIGIN env var
      if (explicitOrigins.includes(normalized)) {
        return callback(null, true);
      }
      console.warn("⚠️ CORS blocked origin:", origin);
      callback(null, false);
    },
    credentials: true,
  }));
  app.use(express.json({ limit: "1mb" }));

  // ================= PASSPORT INITIALIZATION =================
  app.use(passport.initialize());

  // ================= RATE LIMITING =================
  app.use("/api", apiLimiter);
  app.use("/api/auth", authLimiter);
  app.use("/api/ai", aiLimiter);
  app.use("/api/payment", paymentLimiter);
  app.use("/api/faq", faqLimiter);

  // ================= CONNECTION STATE =================
  let dbReady = false;

  // Connection event logging
  mongoose.connection.on("connected", () => {
    console.log(`🔌 MongoDB driver connected (${Date.now() - startTime}ms)`);
  });
  mongoose.connection.on("disconnected", () => {
    console.log("⚠️ MongoDB disconnected");
    dbReady = false;
  });
  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err.message || err);
  });

  // Connect to MongoDB — reduced timeouts for faster local feedback
  // IMPORTANT: Connection failure is NON-FATAL. The server starts anyway;
  // DB-dependent routes will return 503 until the database becomes available.
  console.log(`⏳ Connecting to MongoDB at ${process.env.MONGO_URI}...`);
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      ...mongooseOptions,
      serverSelectionTimeoutMS: 8000,  // faster failure: 8s instead of 15s
      connectTimeoutMS: 5000,          // faster failure: 5s instead of 10s
    });
    dbReady = true;
    console.log(`✅ MongoDB connected (${Date.now() - startTime}ms)`);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("   ⚠️ Server will start WITHOUT database access.");
    console.error("   ⚠️ DB-dependent routes (/api/destinations, /api/bookings, etc.) will return 503.");
    console.error("   ⚠️ Make sure MONGO_URI is set correctly in Railway dashboard.");
    dbReady = false;
  }

  // Ensure DB is connected before every request (handles connection drops)
  app.use(async (req, res, next) => {
    if (dbReady && mongoose.connection.readyState === 1) {
      return next();
    }
    try {
      await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
      dbReady = true;
      next();
    } catch (err) {
      console.error("❌ Database middleware error:", err.message);
      res.status(500).json({ message: "Database connection failed" });
    }
  });

  // ================= SERVE FRONTEND (production) =================
  const clientDist = path.join(__dirname, "travel-booking-app", "client", "dist");
  if (process.env.NODE_ENV === "production") {
    // Serve the built frontend as static files
    app.use(express.static(clientDist));
    console.log("📦 Serving frontend from:", clientDist);
  }

  // ================= HEALTH CHECK =================
  app.get("/api/health", async (req, res) => {
    let dbTest = "not tested";
    try {
      // Run a real query to verify the connection works end-to-end
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      const hasUsersCollection = collectionNames.includes("users");
      if (hasUsersCollection) {
        const userCount = await mongoose.connection.db.collection("users").countDocuments();
        dbTest = `collections=[${collectionNames.join(",")}], users=${userCount}`;
      } else {
        dbTest = `collections=[${collectionNames.join(",")}], no-users-collection`;
      }
    } catch (err) {
      dbTest = `error: ${err.message}`;
    }

    res.json({
      status: "ok",
      mongodb: {
        state: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown",
        readyState: mongoose.connection.readyState,
        hasDb: !!mongoose.connection.db,
        dbReady,
        dbTest,
      },
      timestamp: new Date().toISOString(),
    });
  });

  // ================= ROUTES =================
  app.use("/api/auth", userRoutes);
  app.use("/api/destinations", destinationRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/notes", noteRoutes);
  app.use("/api/faq", faqRoutes);

  // ================= SPA FALLBACK (production) =================
  // For any non-API route, serve index.html (enables React Router client-side routing)
  if (process.env.NODE_ENV === "production") {
    app.get("*", (req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  } else {
    // Dev: simple home route
    app.get("/", (req, res) => {
      res.json({ message: "TravelBook API is running 🚀", version: "1.0.0" });
    });
  }

  // ================= 404 HANDLER =================
  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  // ================= GLOBAL ERROR HANDLER =================
  app.use((err, req, res, next) => {
    console.error("❌ Unhandled error:", err.message || err);
    if (process.env.NODE_ENV !== "production") {
      console.error(err.stack);
    }
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
  });

  // ================= START SERVER =================
  const PORT = process.env.FORCE_PORT || process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch((err) => {
  console.error("❌ Server failed to start:", err.message || err);
  process.exit(1);
});

// Handle unhandled promise rejections globally (safety net)
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message || err);
});
