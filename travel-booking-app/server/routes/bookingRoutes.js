const router = require("express").Router();
const bookingController = require("../controllers/bookingController");
const protect = require("../middleware/authMiddleware");

// Create booking
router.post("/", protect, bookingController.createBooking);

// Get all bookings
router.get("/", protect, bookingController.getBookings);

module.exports = router;