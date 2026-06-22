const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ================= NODEMAILER TRANSPORTER =================
const EMAIL_USER = process.env.EMAIL_USER || "mounadifibrahim1@gmail.com";
// Strip any whitespace from the app password — Gmail displays 16-char app passwords
// grouped in blocks of 4 for readability (e.g. "abcd efgh ijkl mnop"), but SMTP
// auth expects the raw 16 characters without spaces.
const EMAIL_PASS = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s/g, "") : "";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Note: transporter.verify() is intentionally omitted for production.
// Railway blocks outbound SMTP (port 465), causing ENETUNREACH on startup.
// Email errors are caught and logged at send-time in each route instead.
// To re-enable local verification, uncomment:
// transporter.verify((err) => {
//   if (err) {
//     console.error("❌ Nodemailer verification failed:", err.message);
//   } else {
//     console.log("✅ Nodemailer ready — can send emails from:", EMAIL_USER);
//   }
// });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const { password: pwd, ...userWithoutPassword } = user.toObject();
    res.status(201).json({
      message: "User created",
      user: userWithoutPassword
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account with that email address" });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before saving (security best practice)
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // Construct reset URL — frontend handles the form
    const resetUrl = `${process.env.CLIENT_URL || "https://booking-behm.vercel.app"}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"TravelBook Support" <${EMAIL_USER}>`,
      to: user.email,
      subject: "Your Password Reset Request — TravelBook",
      html: `
        <div style="max-width:480px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#333;">
          <div style="background:#1e3a5f;padding:24px 24px 16px;border-radius:8px 8px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:20px;">TravelBook</h1>
          </div>
          <div style="border:1px solid #e0e0e0;border-top:0;padding:32px 24px;border-radius:0 0 8px 8px;">
            <h2 style="margin:0 0 16px;font-size:18px;">Password Reset Request</h2>
            <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#555;">
              You recently requested to reset your password. Click the button below to set a new one.
              This link is valid for <strong>1 hour</strong>.
            </p>
            <a href="${resetUrl}"
               style="display:inline-block;background:#1e3a5f;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">
              Reset Password
            </a>
            <p style="margin:24px 0 0;font-size:13px;color:#888;">
              If you didn't request this, please ignore this email. No changes have been made to your account.
            </p>
            <hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />
            <p style="margin:0;font-size:12px;color:#aaa;">
              TravelBook Support &middot; Your AI-Powered Travel Companion
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: "Password reset email sent. Please check your inbox (and spam folder).",
    });
  } catch (err) {
    console.error("❌ Forgot password error:", err.message);
    console.error("   Stack:", err.stack);
    res.status(500).json({ message: "Failed to send reset email. Please try again later." });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Hash the incoming token to match what's stored
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash the new password and update
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully. You can now sign in with your new password." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Failed to reset password. Please try again." });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    // create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: pwd, ...userWithoutPassword } = user.toObject();
    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

// ================= GOOGLE OAUTH CALLBACK =================
exports.googleCallback = async (req, res) => {
  try {
    // passport.authenticate puts the user on req.user
    if (!req.user) {
      return res.redirect(
        `${process.env.CLIENT_URL || "https://booking-behm.vercel.app"}/login?error=google_auth_failed`
      );
    }

    const user = req.user;

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Encode minimal user data into the redirect URL
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    const encodedUser = encodeURIComponent(JSON.stringify(userData));
    const redirectUrl = `${
      process.env.CLIENT_URL || "https://booking-behm.vercel.app"
    }/oauth-redirect?token=${token}&user=${encodedUser}`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error("❌ Google callback error:", err.message);
    res.redirect(
      `${
        process.env.CLIENT_URL || "https://booking-behm.vercel.app"
      }/login?error=google_auth_failed`
    );
  }
};