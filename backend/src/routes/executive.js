const express = require('express');
const Executive = require('../models/Executive');

const router = express.Router();

// Public: list all executive years (brief)
router.get('/', async (_req, res) => {
  try {
    const list = await Executive.find({}).select('year title createdAt updatedAt').sort({ year: -1 }).lean();
    res.json({ list });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load executive list' });
  }
});

// Public: get details for a year by id or year string
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let doc = null;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      doc = await Executive.findById(identifier).lean();
    }
    if (!doc) {
      doc = await Executive.findOne({ year: identifier }).lean();
    }
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ executive: doc });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load executive details' });
  }
});

module.exports = router;
