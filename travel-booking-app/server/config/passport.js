const passport = require("passport");
const User = require("../models/User");

// Only register Google strategy if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const GoogleStrategy = require("passport-google-oauth20").Strategy;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback",
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
