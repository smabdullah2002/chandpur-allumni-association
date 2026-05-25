const express = require('express');
const Gallery = require('../models/Gallery');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const items = await Gallery.find({}).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
