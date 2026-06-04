const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  password: String,
  role: {
    type: String,
    default: "user"
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: String,
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
}, {
  // Disable Mongoose query buffering — fail fast with a clear error
  bufferCommands: false,
  bufferTimeoutMS: 0,
});

// Index for admin/user role filtering (email already has a unique index from the schema field)
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);