const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  name: String,
  city: String,
  price: Number
});

// Indexes for faster queries
hotelSchema.index({ city: 1 });      // search hotels by city
hotelSchema.index({ price: 1 });     // price range queries

module.exports = mongoose.model("Hotel", hotelSchema);
