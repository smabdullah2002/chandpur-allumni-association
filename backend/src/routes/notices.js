const express = require("express");
const Notice = require("../models/Notice");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const notices = await Notice.find({ status: "published" })
      .sort({ createdAt: -1 })
      .select("title content category pdf createdAt")
      .lean();
    res.json({ notices });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "Failed to load notices" });
  }
});

module.exports = router;
