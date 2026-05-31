const Destination = require("../models/Destination");


// ➕ CREATE
exports.createDestination = async (req, res) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json(destination);  } catch (err) {
    console.error("Create destination error:", err);
    res.status(500).json({ message: "Failed to create destination" });
  }
};


// 📥 GET ALL

exports.getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find();
    res.json(destinations);
  } catch (err) {
    console.error("Get destinations error:", err);
    res.status(500).json({ message: "Failed to load destinations" });
  }
};


// 📥 GET ONE

exports.getDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    res.json(destination);
  } catch (err) {
    console.error("Get destination error:", err);
    res.status(500).json({ message: "Failed to load destination" });
  }
};


// ❌ DELETE

exports.deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete destination error:", err);
    res.status(500).json({ message: "Failed to delete destination" });
  }
};