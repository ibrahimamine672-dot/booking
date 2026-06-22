const router = require("express").Router();
const paymentController = require("../controllers/paymentController");
const protect = require("../middleware/authMiddleware");

router.post("/checkout", protect, paymentController.checkout);
router.post("/confirm", protect, paymentController.confirmPayment);

module.exports = router;
