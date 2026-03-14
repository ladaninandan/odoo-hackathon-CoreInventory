const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many OTP requests. Try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000, // massively increased for testing
  message: { success: false, message: 'Too many login attempts. Try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // massively increased for testing
  message: { success: false, message: 'Rate limit exceeded. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { otpLimiter, loginLimiter, apiLimiter };
