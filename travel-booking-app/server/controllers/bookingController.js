const Booking = require("../models/Booking");

// CREATE BOOKING
exports.createBooking = async (req, res) => {
  try {
    const { destination, date, persons } = req.body;
    if (!destination || !date || !persons) {
      return res.status(400).json({ message: "Missing required fields: destination, date, persons" });
    }
    const booking = await Booking.create({
      user: req.user.id,
      destination,
      date,
      persons
    });
    res.status(201).json(booking);
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ message: "Failed to create booking" });
  }
};

// GET MY BOOKINGS
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id });
    res.json(bookings);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ message: "Failed to load bookings" });
  }
};