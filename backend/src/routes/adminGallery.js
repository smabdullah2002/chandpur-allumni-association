const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const Gallery = require('../models/Gallery');
const { authMiddleware, adminMiddleware } = require('../middleware/adminAuth');

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chandpur-alumni/gallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }],
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authMiddleware);
router.use(adminMiddleware);

// GET all
router.get('/', async (_req, res) => {
  try {
    const items = await Gallery.find({}).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!req.file) return res.status(400).json({ error: 'Image is required' });

    const item = await Gallery.create({
      title,
      imageUrl: req.file.path,
      createdBy: req.user._id,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE title
router.put('/:id', async (req, res) => {
  try {
    const { title } = req.body;
    const item = await Gallery.findByIdAndUpdate(
      req.params.id, { title }, { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    if (item.imageUrl) {
      const parts = item.imageUrl.split('/');
      const filename = parts[parts.length - 1].split('.')[0];
      await cloudinary.uploader.destroy(`chandpur-alumni/gallery/${filename}`).catch(() => {});
    }

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
