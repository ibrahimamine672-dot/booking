const passport = require("passport");
const User = require("../models/User");

// Only register Google strategy if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Determine the callback URL with this priority:
  // 1. Explicit GOOGLE_CALLBACK_URL env var
  // 2. RAILWAY_PUBLIC_DOMAIN auto-detection (no manual config needed in Railway)
  // 3. Localhost fallback for development
  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN;
  const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL
    || (railwayDomain ? `https://${railwayDomain}/api/auth/google/callback` : null)
    || "http://localhost:3000/api/auth/google/callback";
  console.log(`🔐 Google OAuth callbackURL: ${googleCallbackURL}`);
  if (!process.env.GOOGLE_CALLBACK_URL && !railwayDomain) {
    console.warn(`⚠️ Neither GOOGLE_CALLBACK_URL nor RAILWAY_PUBLIC_DOMAIN is set. Google auth will fail in production.`);
  }

  const GoogleStrategy = require("passport-google-oauth20").Strategy;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: googleCallbackURL,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          const name = profile.displayName || "Google User";
          const avatar =
            profile.photos && profile.photos[0] ? profile.photos[0].value : null;
          const googleId = profile.id;

          // Try to find an existing user by googleId first, then by email
          let user = await User.findOne({ googleId });

          if (!user && email) {
            user = await User.findOne({ email });
          }

          if (user) {
            // Update existing user with latest Google info (if not already set)
            if (!user.googleId) {
              user.googleId = googleId;
            }
            if (!user.avatar && avatar) {
              user.avatar = avatar;
            }
            await user.save();
          } else {
            // Create a new user with data from Google
            user = await User.create({
              name,
              email,
              googleId,
              avatar,
            });
          }

          return done(null, user);
        } catch (err) {
          console.error("❌ Google OAuth error:", err.message);
          return done(err, null);
        }
      }
    )
  );

  console.log("✅ Google OAuth strategy registered");
} else {
  console.warn("⚠️ Google OAuth disabled — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable");
}

// Serialize user into session (not used with JWT, but required by passport)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
