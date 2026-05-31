const router = require("express").Router();
const controller = require("../controllers/destinationController");
const protect = require("../middleware/authMiddleware");

// CREATE
router.post("/", protect, controller.createDestination);

// GET ALL — public browsing
router.get("/", controller.getDestinations);

// GET ONE — public browsing
router.get("/:id", controller.getDestination);

// DELETE
router.delete("/:id", protect, controller.deleteDestination);

module.exports = router;