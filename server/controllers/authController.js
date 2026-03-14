const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateOtp = require('../utils/generateOtp');
const { sendOtp } = require('../services/smsService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const SALT_ROUNDS = 12;

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'phone';
      return sendError(res, 409, `User with this ${field} already exists`);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || 'staff',
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    return sendSuccess(res, 201, 'Registration successful', {
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Account is deactivated. Contact your manager.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    return sendSuccess(res, 200, 'Login successful', {
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/logout
exports.logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return sendError(res, 401, 'No refresh token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return sendError(res, 401, 'Invalid refresh token');
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    setRefreshCookie(res, newRefreshToken);

    return sendSuccess(res, 200, 'Token refreshed', { accessToken });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Invalid or expired refresh token');
    }
    next(error);
  }
};

// POST /api/v1/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return sendSuccess(res, 200, 'If this phone is registered, an OTP has been sent');
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, SALT_ROUNDS);

    user.otpCode = hashedOtp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtp(phone, otp);

    return sendSuccess(res, 200, 'OTP sent to your phone');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/verify-otp
exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({ phone });
    if (!user || !user.otpCode || !user.otpExpiry) {
      return sendError(res, 400, 'Invalid OTP request');
    }

    if (user.otpExpiry < new Date()) {
      user.otpCode = undefined;
      user.otpExpiry = undefined;
      await user.save();
      return sendError(res, 400, 'OTP has expired. Please request a new one.');
    }

    const isValid = await bcrypt.compare(otp, user.otpCode);
    if (!isValid) {
      return sendError(res, 400, 'Invalid OTP');
    }

    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return sendSuccess(res, 200, 'OTP verified successfully', {
      resetToken: jwt.sign({ id: user._id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' }),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.purpose !== 'reset') {
      return sendError(res, 400, 'Invalid reset token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return sendSuccess(res, 200, 'Password reset successful. Please login with your new password.');
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return sendError(res, 400, 'Invalid or expired reset token');
    }
    next(error);
  }
};

// GET /api/v1/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otpCode -otpExpiry');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    return sendSuccess(res, 200, 'User profile', { user });
  } catch (error) {
    next(error);
  }
};
