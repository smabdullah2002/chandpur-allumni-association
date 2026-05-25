const express = require("express");
const About = require("../models/About");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const about = await About.findOne({}).lean();
    res.json({ about: about || null });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to load about" });
  }
});

module.exports = router;
