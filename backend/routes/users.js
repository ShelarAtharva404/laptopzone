const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit);
    const total = await User.countDocuments({ role: 'user' });
    res.json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
    res.json({ success: true, data: user });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
