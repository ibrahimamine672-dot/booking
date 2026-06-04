const router = require("express").Router();
const Note = require("../models/Note");

// GET /api/notes — fetch all notes, newest first
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 }).limit(100);
    res.json(notes);
  } catch (err) {
    console.error("Get notes error:", err);
    res.status(500).json({ message: "Failed to load notes" });
  }
});

// POST /api/notes — create a new note
router.post("/", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    if (content.trim().length > 500) {
      return res.status(400).json({ message: "Note cannot exceed 500 characters" });
    }

    const note = await Note.create({ content: content.trim() });
    res.status(201).json(note);
  } catch (err) {
    console.error("Create note error:", err);
    res.status(500).json({ message: "Failed to create note" });
  }
});

module.exports = router;
