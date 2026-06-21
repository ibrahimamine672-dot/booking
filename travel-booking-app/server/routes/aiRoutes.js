const router = require("express").Router();
const aiController = require("../controllers/aiController");
const groqController = require("../controllers/groqController");
const protect = require("../middleware/authMiddleware");

// OpenAI-powered chat (requires API credits)
router.post("/chat", protect, aiController.chatAI);

// Free Groq-powered chat (llama-3.3-70b on Groq's free tier)
router.post("/chat/free", protect, groqController.chatWithGroq);

module.exports = router;