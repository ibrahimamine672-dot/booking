const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  role: {
    type: String,
    default: "user"
  }
});

// Indexes for faster queries
userSchema.index({ email: 1 });     // login lookups (unique already creates an index, but explicit never hurts)
userSchema.index({ role: 1 });       // admin/user role filtering

module.exports = mongoose.model("User", userSchema);