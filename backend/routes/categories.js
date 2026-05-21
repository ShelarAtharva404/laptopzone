const express = require('express');
const router = express.Router();
const { Category } = require('../models/models');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, data: categories });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch(e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: category });
  } catch(e) { res.status(400).json({ success: false, message: e.message }); }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Category deactivated' });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
