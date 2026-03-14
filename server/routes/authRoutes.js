const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getMe,
} = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getMe);

module.exports = router;
