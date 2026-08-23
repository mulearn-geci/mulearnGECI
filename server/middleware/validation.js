const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Post validation rules
const validatePost = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 250 })
    .withMessage('Title must be between 2 and 250 characters'),
  body('description')
    .optional()
    .trim(),
  body('content')
    .optional()
    .trim(),
  body('category')
    .optional()
    .trim(),
  body('eventDate')
    .optional(),
  body('location')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
  body('registrationLink')
    .optional(),
  handleValidationErrors
];

// Event validation rules
const validateEvent = [
  body('title')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 250 })
    .withMessage('Title must be between 2 and 250 characters'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 5000 })
    .withMessage('Description must be between 2 and 5000 characters'),
  body('date')
    .optional({ checkFalsy: true }),
  body('time')
    .optional({ checkFalsy: true })
    .trim(),
  body('location')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  body('type')
    .optional({ checkFalsy: true })
    .trim(),
  body('maxAttendees')
    .optional({ checkFalsy: true }),
  body('registrationLink')
    .optional({ checkFalsy: true })
    .trim(),
  body('price')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  handleValidationErrors
];

// Contact validation rules
const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['general', 'event', 'partnership', 'feedback', 'complaint', 'suggestion'])
    .withMessage('Invalid category'),
  handleValidationErrors
];

// Parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePost,
  validateEvent,
  validateContact,
  validateObjectId,
  validatePagination,
  handleValidationErrors
};