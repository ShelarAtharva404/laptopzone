const express = require('express');
const router = express.Router();
const { Notification } = require('../models/models');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: notifications });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
