const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name brand images price discount ratings slug stock');
    res.json({ success: true, data: user.wishlist });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/toggle/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.indexOf(req.params.productId);
    let action;
    if (idx > -1) {
      user.wishlist.splice(idx, 1);
      action = 'removed';
    } else {
      user.wishlist.push(req.params.productId);
      action = 'added';
    }
    await user.save();
    res.json({ success: true, action, wishlist: user.wishlist });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
