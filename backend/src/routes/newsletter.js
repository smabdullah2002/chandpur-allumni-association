const express = require("express");
const Newsletter = require("../models/Newsletter");

const router = express.Router();

router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  try {
    await Newsletter.create({ email });
    res.json({ message: "You've been subscribed successfully!" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "This email is already subscribed." });
    }
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

module.exports = router;
