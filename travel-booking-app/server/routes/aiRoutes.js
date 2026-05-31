const router = require("express").Router();
const aiController = require("../controllers/aiController");
const protect = require("../middleware/authMiddleware");

router.post("/chat", protect, aiController.chatAI);

module.exports = router;