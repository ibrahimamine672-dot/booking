const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: String,
  destination: String,
  date: String,
  persons: Number
}, { timestamps: true });

// Indexes for faster queries
bookingSchema.index({ user: 1 });              // my-bookings lookups
bookingSchema.index({ destination: 1 });       // bookings for a destination
bookingSchema.index({ date: 1 });              // date-range queries
bookingSchema.index({ user: 1, date: -1 });    // compound: user's bookings sorted by date

module.exports = mongoose.model("Booking", bookingSchema);