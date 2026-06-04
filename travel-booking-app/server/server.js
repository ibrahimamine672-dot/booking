const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const passport = require("passport");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

require("./config/passport");
const { apiLimiter, authLimiter, aiLimiter, paymentLimiter, faqLimiter } = require("./middleware/rateLimiter");

const app = express();

// ================= GLOBAL MONGOOSE SETTINGS =================
// Disable query buffering — fail fast instead of silently timing out
mongoose.set("bufferCommands", false);

// ================= MONGOOSE CONNECTION OPTIONS =================
const mongooseOptions = {
  maxPoolSize: 100,            // Allow up to 100 concurrent database connections
  minPoolSize: 10,             // Keep at least 10 connections warm
  serverSelectionTimeoutMS: 15000,  // Timeout for server selection
  connectTimeoutMS: 10000,     // Timeout for initial connection
  socketTimeoutMS: 45000,      // Close idle sockets after 45s
  family: 4,                   // Prefer IPv4 (avoids IPv6 connection issues)
};

// ================= CACHED DB CONNECTION (Serverless-safe) =================
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  cachedDb = await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
  console.log("MongoDB connected 🟢 (pool: 100)");
  return cachedDb;
}

// ================= GLOBAL MIDDLEWARE =================
const explicitOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : ["https://booking-v3u2.vercel.app"];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, health checks)
    if (!origin) return callback(null, true);      // Allow any localhost or 127.0.0.1 origin regardless of port (Vite uses dynamic ports)
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    // Allow explicitly configured origins via CORS_ORIGIN env var
    if (explicitOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn("CORS blocked origin:", origin);
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" })); // Limit body size to prevent abuse

// ================= PASSPORT INITIALIZATION =================
app.use(passport.initialize());

// ================= RATE LIMITING =================
app.use("/api", apiLimiter);                           // General: 100 req/15min
app.use("/api/auth", authLimiter);                     // Auth: 10 req/15min
app.use("/api/ai", aiLimiter);                         // AI: 20 req/min
app.use("/api/payment", paymentLimiter);               // Payment: 5 req/min
app.use("/api/faq", faqLimiter);                         // FAQ: 5 req/15min

// ================= DB CONNECTION MIDDLEWARE (required for serverless) =================
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// ================= ROUTES =================
const userRoutes = require("./routes/userRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const aiRoutes = require("./routes/aiRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const noteRoutes = require("./routes/noteRoutes");
const faqRoutes = require("./routes/faqRoutes");

// ================= USE ROUTES =================
app.use("/api/auth", userRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/faq", faqRoutes);

// ================= HOME ROUTE =================
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// ================= START SERVER (local development only) =================
if (process.env.NODE_ENV !== "production") {
  connectToDatabase()
    .then(() => {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} 🚀`);
      });
    })
    .catch((err) => {
      console.log("Server error ❌", err);
      process.exit(1);
    });
}

// ================= EXPORT FOR SERVERLESS (Vercel) =================
module.exports = app;

// Handle unhandled promise rejections globally (safety net)
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});
