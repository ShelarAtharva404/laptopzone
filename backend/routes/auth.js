// routes/auth.js
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.get('/me', protect, authCtrl.getMe);
router.put('/profile', protect, authCtrl.updateProfile);
router.put('/change-password', protect, authCtrl.changePassword);
router.post('/forgot-password', authCtrl.forgotPassword);
router.post('/reset-password/:token', authCtrl.resetPassword);
router.post('/address', protect, authCtrl.addAddress);
router.delete('/address/:addressId', protect, authCtrl.deleteAddress);

module.exports = router;
