const router = require("express").Router();
const passport = require("passport");
const controller = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

// Register
router.post("/register", controller.register);

// Login
router.post("/login", controller.login);

// Forgot Password
router.post("/forgot-password", controller.forgotPassword);

// Reset Password
router.post("/reset-password", controller.resetPassword);

// Google OAuth — initiate authentication
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth — callback after user grants permission
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || "https://booking-behm.vercel.app"}/login?error=google_auth_failed`,
  }),
  controller.googleCallback
);

module.exports = router;