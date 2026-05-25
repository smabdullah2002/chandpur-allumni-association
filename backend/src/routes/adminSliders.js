const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const Slider = require("../models/Slider");
const { authMiddleware, adminMiddleware } = require("../middleware/adminAuth");

const router = express.Router();

// Cloudinary storage for slider images
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chandpur-alumni/sliders",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1920, height: 800, crop: "fill", quality: "auto" }],
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Auth on all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// GET all sliders
router.get("/", async (_req, res) => {
  try {
    const sliders = await Slider.find({})
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();
    res.json(sliders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE slider with image upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { headline = "", subtext = "", ctaText = "", displayOrder = 0, status = "visible" } = req.body;

    if (!req.file && !headline && !subtext) {
      return res.status(400).json({ error: "Provide an image, headline, or subtext" });
    }

    const imageUrl = req.file?.path || "";

    const slider = await Slider.create({
      headline,
      subtext,
      ctaText,
      imageUrl,
      displayOrder: Number(displayOrder) || 0,
      status,
    });

    res.status(201).json(slider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE slider (with optional new image)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { headline, subtext, ctaText, displayOrder, status } = req.body;

    const updateData = {};
    if (headline !== undefined) updateData.headline = headline;
    if (subtext !== undefined) updateData.subtext = subtext;
    if (ctaText !== undefined) updateData.ctaText = ctaText;
    if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder) || 0;
    if (status !== undefined) {
      if (!["visible", "hidden"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      updateData.status = status;
    }

    // If a new image was uploaded, delete old one from Cloudinary and use new
    if (req.file) {
      const existing = await Slider.findById(req.params.id);
      if (existing?.imageUrl) {
        // Extract public_id from URL and delete
        const parts = existing.imageUrl.split("/");
        const filename = parts[parts.length - 1].split(".")[0];
        const publicId = `monone-matlab/sliders/${filename}`;
        await cloudinary.uploader.destroy(publicId).catch(() => {});
      }
      updateData.imageUrl = req.file.path;
    }

    const slider = await Slider.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!slider) return res.status(404).json({ error: "Slider not found" });
    res.json(slider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE slider status only
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!status || !["visible", "hidden"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const slider = await Slider.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!slider) return res.status(404).json({ error: "Slider not found" });
    res.json(slider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE slider (also removes from Cloudinary)
router.delete("/:id", async (req, res) => {
  try {
    const slider = await Slider.findByIdAndDelete(req.params.id);
    if (!slider) return res.status(404).json({ error: "Slider not found" });

    // Delete image from Cloudinary
    if (slider.imageUrl) {
      const parts = slider.imageUrl.split("/");
      const filename = parts[parts.length - 1].split(".")[0];
      const publicId = `monone-matlab/sliders/${filename}`;
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    res.json({ message: "Slider deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;