const path = require("path");
const { execSync } = require("child_process");
const dotenv = require("dotenv");
// Load .env from the project root (two directories up from this file)
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
require("./config/passport");

const { apiLimiter, authLimiter, aiLimiter, paymentLimiter, faqLimiter } = require("./middleware/rateLimiter");

const app = express();

// ================= MONGOOSE SETTINGS =================
mongoose.set("bufferCommands", false);

// ================= MONGOOSE CONNECTION OPTIONS =================
const mongooseOptions = {
  maxPoolSize: 100,
  minPoolSize: 10,
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
};

// ================= CACHED DB CONNECTION =================
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  try {
    cachedDb = await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
    console.log("✅ MongoDB connected (pool: 100)");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    throw err;
  }
  return cachedDb;
}

// ================= GLOBAL MIDDLEWARE =================
const explicitOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : ["https://booking-v3u2.vercel.app", "https://booking-behm.vercel.app"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    if (explicitOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn("⚠️ CORS blocked origin:", origin);
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

// ================= PASSPORT =================
app.use(passport.initialize());

// ================= RATE LIMITING =================
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/ai", aiLimiter);
app.use("/api/payment", paymentLimiter);
app.use("/api/faq", faqLimiter);

// ================= DB CONNECTION MIDDLEWARE =================
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("❌ DB middleware error:", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// ================= LOAD ROUTES =================
const userRoutes = require("./routes/userRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const aiRoutes = require("./routes/aiRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const noteRoutes = require("./routes/noteRoutes");
const faqRoutes = require("./routes/faqRoutes");

// ================= REGISTER ROUTES =================
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
  console.error("❌ Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// ================= STALE PORT CLEANUP =================
function freePort(port) {
  try {
    const pid = execSync(`lsof -ti:${port} 2>/dev/null`, { encoding: "utf8", timeout: 5000 }).trim();
    if (pid) {
      console.log(`⚠️ Port ${port} is in use by PID ${pid}. Killing it...`);
      execSync(`kill -9 ${pid}`, { timeout: 3000 });
      console.log(`✅ Freed port ${port}`);
    }
  } catch (e) {
    // No process found on port — that's fine
  }
}

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;
freePort(PORT);

connectToDatabase()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
    // Handle server-level errors (e.g., EADDRINUSE from rapid restarts)
    server.on("error", (err) => {
      console.error("❌ Server error:", err.message);
      if (err.code === "EADDRINUSE") {
        console.error("   Port " + PORT + " is already in use. Try stopping other servers first.");
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("❌ Server failed to start:", err.message);
    process.exit(1);
  });

// ================= EXPORT (for testing / compatibility) =================
module.exports = app;

// ================= UNHANDLED REJECTION HANDLER =================
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});
