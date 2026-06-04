const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Content is required"],
    trim: true,
    maxlength: [500, "Note cannot exceed 500 characters"],
  },
}, { timestamps: true });

// Index for sorting by newest first
noteSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Note", noteSchema);
