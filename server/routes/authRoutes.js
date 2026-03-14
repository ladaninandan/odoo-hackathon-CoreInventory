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
const { loginLimiter, otpLimiter } = require('../middleware/rateLimiter');

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refresh);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getMe);

module.exports = router;
