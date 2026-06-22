const Destination = require("../models/Destination");
const mongoose = require("mongoose");

// ➕ CREATE
exports.createDestination = async (req, res) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json(destination);
  } catch (err) {
    console.error("❌ Create destination error:", err.message);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed", errors: err.errors });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: "Destination already exists" });
    }
    res.status(500).json({ message: "Failed to create destination" });
  }
};

// 📥 GET ALL
exports.getDestinations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.country) {
      // Escape regex special chars to prevent ReDoS
      const escaped = req.query.country.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Case-insensitive match so "maroc" also finds "Maroc" / "Morocco"
      filter.country = { $regex: escaped, $options: 'i' };
    }
    const destinations = await Destination.find(filter).sort({ createdAt: -1 });
    res.json(destinations);
  } catch (err) {
    console.error("❌ Get destinations error:", err.message);
    res.status(500).json({ message: "Failed to load destinations" });
  }
};

// 📥 GET ONE
exports.getDestination = async (req, res) => {
  try {
    // Validate ObjectId format before querying
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid destination ID format" });
    }

    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    res.json(destination);
  } catch (err) {
    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid destination ID" });
    }
    console.error("❌ Get destination error:", err.message);
    res.status(500).json({ message: "Failed to load destination" });
  }
};

// ❌ DELETE
exports.deleteDestination = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid destination ID format" });
    }

    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid destination ID" });
    }
    console.error("❌ Delete destination error:", err.message);
    res.status(500).json({ message: "Failed to delete destination" });
  }
};
