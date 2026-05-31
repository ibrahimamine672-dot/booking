const router = require("express").Router();
const controller = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

// register
router.post("/register", controller.register);

// login
router.post("/login", controller.login);

module.exports = router;