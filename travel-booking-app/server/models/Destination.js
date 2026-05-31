const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  country: String,
  city: String,
  description: String,
  image: String,
  price: Number,
  rating: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Indexes for faster queries
// Compound index for country-based filtering (most common query pattern)
destinationSchema.index({ country: 1, city: 1 });
destinationSchema.index({ name: 1 });     // search by name
destinationSchema.index({ price: 1 });    // price range queries
destinationSchema.index({ rating: -1 });  // top-rated sorting

module.exports = mongoose.model("Destination", destinationSchema);
