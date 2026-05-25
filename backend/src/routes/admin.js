const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const Notice = require("../models/Notice");
const Donation = require("../models/Donation");
const About = require("../models/About");
const Event = require("../models/Event");
const { authMiddleware, adminMiddleware } = require("../middleware/adminAuth");
const sendStatusEmail = require("../utils/sendStatusEmail");
const { sendDonationStatusEmail, sendNoticePublishedEmail, sendEventCreatedEmail } = require("../utils/sendNotificationEmail");

// In-memory multer for PDFs — we upload manually so resource_type:"raw" is reliable
const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype === "application/pdf" ||
               file.originalname.toLowerCase().endsWith(".pdf");
    cb(null, ok);
  },
});

async function uploadPdfToCloudinary(buffer, originalName) {
  return new Promise((resolve, reject) => {
    // Keep the .pdf extension in the public_id so Cloudinary serves the file
    // with the correct extension and the browser recognises it as a PDF
    const baseName = originalName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
    const publicId = `notice-${Date.now()}-${baseName.endsWith(".pdf") ? baseName : baseName + ".pdf"}`;
    const stream = cloudinary.uploader.upload_stream(
      { folder: "monone-matlab/notices/pdfs", resource_type: "raw", public_id: publicId },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// ==================== USER MANAGEMENT ====================

// GET all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-passwordHash");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single user
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE user (admin can update any user field except role and email)
router.put("/users/:id", async (req, res) => {
  try {
    const { fullName, mobileNumber, lastEducation, upazila, villageName } =
      req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (mobileNumber) updateData.mobileNumber = mobileNumber;
    if (lastEducation) updateData.lastEducation = lastEducation;
    if (upazila) updateData.upazila = upazila;
    if (villageName) updateData.villageName = villageName;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE user badge
router.put("/users/:id/badge", async (req, res) => {
  try {
    const { name, color } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { badge: { name: name || '', color: color || '' } },
      { new: true }
    ).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE user status (approve/reject)
router.put("/users/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === "super-admin") {
      return res.status(400).json({ error: "Cannot update super-admin status" });
    }

    user.status = status;
    await user.save();

    // Non-blocking email — failure is logged but never breaks the response
    sendStatusEmail(user, status).catch((err) =>
      console.error("[Email] Failed to send status notification:", err.message)
    );

    const sanitized = await User.findById(user._id).select(
      "-passwordHash -nidDocument -certificateDocument"
    );
    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DONATION MANAGEMENT ====================

// GET all donations
router.get("/donations", async (req, res) => {
  try {
    const donations = await Donation.find({})
      .populate("user", "fullName email mobileNumber upazila villageName policeStation lastEducation district division dateOfBirth politicalAffiliation")
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE donation status (approve/reject)
router.put("/donations/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }

    donation.status = status;
    donation.reviewedBy = req.user._id;
    donation.reviewedAt = new Date();
    await donation.save();

    const populated = await Donation.findById(donation._id).populate(
      "user",
      "fullName email"
    );

    // Non-blocking email to donation owner
    if (populated.user) {
      sendDonationStatusEmail(populated.user, donation, status).catch((err) =>
        console.error("[Email] Failed to send donation status notification:", err.message)
      );
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE donation
router.delete("/donations/:id", async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ error: "Donation not found" });
    res.json({ message: "Donation deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== NOTICE MANAGEMENT ====================

// GET all notices
router.get("/notices", async (req, res) => {
  try {
    const notices = await Notice.find({}).populate(
      "createdBy",
      "fullName email"
    );
    res.json(notices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single notice
router.get("/notices/:id", async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id).populate(
      "createdBy",
      "fullName email"
    );
    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }
    res.json(notice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE notice
router.post("/notices", uploadPdf.single("pdf"), async (req, res) => {
  try {
    const { title, content, category, status, eventDate, eventLocation } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content required" });
    }

    let pdfUrl = null;
    if (req.file) {
      pdfUrl = await uploadPdfToCloudinary(req.file.buffer, req.file.originalname);
    }

    const notice = new Notice({
      title,
      content,
      category: category || "general",
      status: status || "draft",
      createdBy: req.user._id,
      pdf: pdfUrl,
    });

    await notice.save();

    // Auto-create an Event entry when category is "event"
    if (category === "event") {
      await Event.create({
        title,
        description: content,
        date: eventDate ? new Date(eventDate) : new Date(),
        location: eventLocation || "",
        status: "upcoming",
        createdBy: req.user._id,
        noticeRef: notice._id,
      });
    }

    await notice.populate("createdBy", "fullName email");

    // Broadcast email when notice is published
    if (notice.status === "published") {
      User.find({ status: "approved", role: "user" }).select("email fullName").then((members) => {
        sendNoticePublishedEmail(members, notice).catch((err) =>
          console.error("[Email] Failed to broadcast notice email:", err.message)
        );
      }).catch((err) => console.error("[Email] Failed to fetch members for notice broadcast:", err.message));
    }

    // Broadcast event email when an event notice is published
    if (category === "event" && notice.status === "published") {
      User.find({ status: "approved", role: "user" }).select("email fullName").then((members) => {
        sendEventCreatedEmail(members, {
          title,
          description: content,
          date: eventDate,
          location: eventLocation || "",
        }).catch((err) =>
          console.error("[Email] Failed to broadcast event email:", err.message)
        );
      }).catch((err) => console.error("[Email] Failed to fetch members for event broadcast:", err.message));
    }

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE notice
router.put("/notices/:id", uploadPdf.single("pdf"), async (req, res) => {
  try {
    const { title, content, category, status, eventDate, eventLocation, removePdf } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (status) updateData.status = status;
    if (req.file) {
      updateData.pdf = await uploadPdfToCloudinary(req.file.buffer, req.file.originalname);
    }
    if (removePdf === "true") updateData.pdf = null;

    const notice = await Notice.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("createdBy", "fullName email");

    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    // Sync event: if category is "event", upsert the linked Event
    if (category === "event") {
      const existing = await Event.findOne({ noticeRef: notice._id });
      if (existing) {
        await Event.findByIdAndUpdate(existing._id, {
          title: title || existing.title,
          description: content || existing.description,
          date: eventDate ? new Date(eventDate) : existing.date,
          location: eventLocation !== undefined ? eventLocation : existing.location,
        });
      } else {
        await Event.create({
          title: notice.title,
          description: notice.content,
          date: eventDate ? new Date(eventDate) : new Date(),
          location: eventLocation || "",
          status: "upcoming",
          createdBy: notice.createdBy,
          noticeRef: notice._id,
        });
      }
    }

    // Broadcast when notice is set to published
    if (status === "published") {
      User.find({ status: "approved", role: "user" }).select("email fullName").then((members) => {
        sendNoticePublishedEmail(members, notice).catch((err) =>
          console.error("[Email] Failed to broadcast notice email:", err.message)
        );
        // Also send event email if this notice is an event
        if (notice.category === "event") {
          sendEventCreatedEmail(members, {
            title: notice.title,
            description: notice.content,
            date: eventDate,
            location: eventLocation || "",
          }).catch((err) =>
            console.error("[Email] Failed to broadcast event email:", err.message)
          );
        }
      }).catch((err) => console.error("[Email] Failed to fetch members for broadcast:", err.message));
    }

    res.json(notice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE notice
router.delete("/notices/:id", async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }
    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ABOUT MANAGEMENT ====================

// GET about content
router.get("/about", async (_req, res) => {
  try {
    const about = await About.findOne({}).lean();
    res.json({ about: about || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE about content
router.put("/about", async (req, res) => {
  try {
    const { title, body, trustPoints, stats, members, lifetimeMembers, committee } = req.body;

    const updateData = {
      title: title || "",
      body: body || "",
      trustPoints: Array.isArray(trustPoints) ? trustPoints : [],
      stats: Array.isArray(stats)
        ? stats.map((item) => ({
            value: item?.value || "",
            label: item?.label || "",
          }))
        : [],
      members: members || "",
      lifetimeMembers: lifetimeMembers || "",
      committee: committee || "",
    };

    const about = await About.findOneAndUpdate({}, updateData, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    res.json({ about });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== FEE CATEGORIES ====================
const FeeCategory = require("../models/FeeCategory");

// GET all categories
router.get("/fee-categories", async (req, res) => {
  try {
    const categories = await FeeCategory.find({}).sort({ createdAt: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE category
router.post("/fee-categories", async (req, res) => {
  try {
    const { name, description, amount } = req.body;
    if (!name || amount === undefined) {
      return res.status(400).json({ error: "Name and amount are required" });
    }
    const category = await FeeCategory.create({
      name, description, amount: Number(amount), createdBy: req.user._id,
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE category
router.put("/fee-categories/:id", async (req, res) => {
  try {
    const { name, description, amount } = req.body;
    const category = await FeeCategory.findByIdAndUpdate(
      req.params.id,
      { name, description, amount: Number(amount) },
      { new: true }
    );
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE category
router.delete("/fee-categories/:id", async (req, res) => {
  try {
    const category = await FeeCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;