const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const events = await Event.find({ status: { $ne: "cancelled" } })
      .sort({ date: 1 })
      .lean();
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;