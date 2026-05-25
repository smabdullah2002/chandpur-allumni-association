const express = require("express");
const Slider = require("../models/Slider");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const sliders = await Slider.find({ status: "visible" })
      .sort({ displayOrder: 1 })
      .lean();
    res.json({ sliders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;