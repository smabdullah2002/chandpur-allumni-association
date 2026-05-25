const express = require('express');
const User = require('../models/User');

const router = express.Router();

// GET approved members — phone only returned if phonePublic: true
router.get('/', async (_req, res) => {
  try {
    const users = await User.find({ status: 'approved', role: 'user' })
      .select('fullName upazila villageName district lastEducation profileImage phonePublic mobileNumber badge createdAt')
      .sort({ fullName: 1 })
      .lean();

    const members = users.map(u => ({
      id: u._id,
      fullName: u.fullName,
      upazila: u.upazila || '',
      villageName: u.villageName || '',
      district: u.district || '',
      lastEducation: u.lastEducation || '',
      profileImage: u.profileImage || '',
      mobileNumber: u.phonePublic ? (u.mobileNumber || '') : '',
      phonePublic: u.phonePublic ?? false,
      badge: (u.badge?.name) ? { name: u.badge.name, color: u.badge.color || '#6366f1' } : null,
      joinedAt: u.createdAt,
    }));

    res.json({ members });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch members' });
  }
});

module.exports = router;
