const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/create-intent', protect, async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { amount, currency = 'inr' } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { userId: req.user._id.toString() },
    });
    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/verify-coupon', protect, async (req, res) => {
  try {
    const { Coupon } = require('../models/models');
    const coupon = await Coupon.findOne({ code: req.body.code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (new Date() > coupon.validUntil) return res.status(400).json({ success: false, message: 'Coupon expired' });
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    if (coupon.usedBy.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You have already used this coupon' });
    }
    res.json({ success: true, data: coupon });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
