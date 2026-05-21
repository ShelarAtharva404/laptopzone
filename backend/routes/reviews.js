const express = require('express');
const router = express.Router();
const { Review } = require('../models/models');
const { protect } = require('../middleware/auth');

router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const review = await Review.create({ ...req.body, user: req.user._id });
    const populated = await Review.findById(review._id).populate('user', 'name avatar');
    res.status(201).json({ success: true, data: populated });
  } catch(e) {
    if (e.code === 11000) return res.status(400).json({ success: false, message: 'You already reviewed this product' });
    res.status(400).json({ success: false, message: e.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted' });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
