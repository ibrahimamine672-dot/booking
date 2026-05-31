const router = require("express").Router();
const paymentController = require("../controllers/paymentController");
const protect = require("../middleware/authMiddleware");

// POST /api/payment/checkout — Process a payment
router.post("/checkout", protect, paymentController.checkout);

module.exports = router;
