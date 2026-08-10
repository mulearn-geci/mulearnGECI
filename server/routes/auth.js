const express = require('express');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validateUserLogin, validateUserRegistration } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  validate: { trustProxy: false },
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// @route   POST /api/auth/register
// @desc    Register a new admin user
// @access  Public (but should be restricted in production)
router.post('/register', authLimiter, validateUserRegistration, authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, validateUserLogin, authController.login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, authController.getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, authController.logout);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', auth, authController.changePassword);

module.exports = router;