const express = require('express');
const Donation = require('../models/Donation');
const User = require('../models/User');

const router = express.Router();

// GET /api/stats/public — aggregated donation data, no personal info
router.get('/public', async (req, res) => {
  try {
    const [allDonations, memberCount] = await Promise.all([
      Donation.find().lean(),
      User.countDocuments({ role: 'user', status: 'approved' }),
    ]);

    const approved = allDonations.filter(d => d.status === 'approved');
    const totalAmount = approved.reduce((s, d) => s + Number(d.amount || 0), 0);

    const statusCounts = {
      approved: approved.length,
      pending:  allDonations.filter(d => d.status === 'pending').length,
      rejected: allDonations.filter(d => d.status === 'rejected').length,
    };

    // Monthly breakdown (approved only)
    const monthlyMap = {};
    approved.forEach(d => {
      const date = new Date(d.donationDate);
      const key   = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      if (!monthlyMap[key]) monthlyMap[key] = { month: label, total: 0, count: 0, key };
      monthlyMap[key].total += Number(d.amount || 0);
      monthlyMap[key].count++;
    });
    const monthly = Object.values(monthlyMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(({ month, total, count }) => ({ month, total, count }));

    // Category breakdown (approved only, top 7)
    const catMap = {};
    approved.forEach(d => {
      const cat = d.category || 'General';
      catMap[cat] = (catMap[cat] || 0) + Number(d.amount || 0);
    });
    const categories = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, total]) => ({ name, total }));

    res.json({ totalAmount, memberCount, statusCounts, monthly, categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
