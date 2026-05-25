const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const Donation = require("../models/Donation");
const FeeCategory = require("../models/FeeCategory");
const { authMiddleware } = require("../middleware/adminAuth");

const router = express.Router();

// Cloudinary storage for receipts
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chandpur-alumni/receipts",
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "webp"],
    resource_type: "auto", // allows PDF uploads too
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Public endpoint — returns fee category names for the donation form
router.get("/categories", authMiddleware, async (req, res) => {
  try {
    const categories = await FeeCategory.find({}).sort({ createdAt: 1 }).select("name amount description");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to load donations" });
  }
});

router.post("/", authMiddleware, upload.single("receipt"), async (req, res) => {
  try {
    if (req.user.status !== "approved" && req.user.role === "user") {
      return res.status(403).json({ message: "Account pending approval" });
    }

    const { category, amount, date, txn, message } = req.body;
    if (!amount || !date) {
      return res.status(400).json({ message: "Amount and date are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Receipt is required" });
    }

    const donation = await Donation.create({
      user: req.user._id,
      category: category || "",
      amount: Number(amount),
      donationDate: new Date(date),
      transactionId: txn || "",
      message: message || "",
      receipt: req.file.path, // Cloudinary URL
    });

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to submit donation" });
  }
});

module.exports = router;