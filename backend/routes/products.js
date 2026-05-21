const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', ctrl.getProducts);
router.get('/featured', ctrl.getFeaturedProducts);
router.get('/bestsellers', ctrl.getBestSellers);
router.get('/new-arrivals', ctrl.getNewArrivals);
router.get('/admin/all', protect, authorize('admin'), ctrl.getAdminProducts);
router.get('/admin/:id', protect, authorize('admin'), ctrl.getAdminProductById);
router.get('/:slug', ctrl.getProduct);

router.post('/', protect, authorize('admin'), ctrl.createProduct);
router.put('/:id', protect, authorize('admin'), ctrl.updateProduct);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteProduct);
router.patch('/:id/stock', protect, authorize('admin'), ctrl.updateStock);

module.exports = router;
