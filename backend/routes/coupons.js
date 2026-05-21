const express = require('express');
const router = express.Router();
const { Coupon } = require('../models/models');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch(e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: coupon });
  } catch(e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
