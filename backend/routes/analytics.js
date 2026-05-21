const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), async (req, res) => {
  res.json({ success: true, message: 'Analytics endpoint' });
});

module.exports = router;
