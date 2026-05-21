const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product', 'name brand images price discount stock slug');
    res.json({ success: true, data: user.cart });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const user = await User.findById(req.user._id);
    const existing = user.cart.find(item => item.product.toString() === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }
    await user.save();
    const updated = await User.findById(req.user._id).populate('cart.product', 'name brand images price discount stock slug');
    res.json({ success: true, data: updated.cart });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/update', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = await User.findById(req.user._id);
    const item = user.cart.find(i => i.product.toString() === productId);
    if (item) {
      if (quantity <= 0) {
        user.cart = user.cart.filter(i => i.product.toString() !== productId);
      } else {
        item.quantity = quantity;
      }
    }
    await user.save();
    const updated = await User.findById(req.user._id).populate('cart.product', 'name brand images price discount stock slug');
    res.json({ success: true, data: updated.cart });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { cart: { product: req.params.productId } }
    });
    const updated = await User.findById(req.user._id).populate('cart.product', 'name brand images price discount stock slug');
    res.json({ success: true, data: updated.cart });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/clear', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { cart: [] });
    res.json({ success: true, data: [] });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
