const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { 
  authenticateToken, 
  authLimiter, 
  sanitizeInput, 
  logAuthAttempt 
} = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9._]+$/)
    .withMessage('Username must be 3-30 characters and can only contain letters, numbers, dots, and underscores'),
  body('password')
    .isLength({ min: 8 })
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please enter a valid phone number')
];

const loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address')
];

const resetPasswordValidation = [
  body('resetToken')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9._]+$/)
    .withMessage('Username must be 3-30 characters and can only contain letters, numbers, dots, and underscores'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Bio cannot exceed 150 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please enter a valid phone number'),
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please enter a valid URL'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Location cannot exceed 50 characters'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean value')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation error',
      message: errors.array()[0].msg
    });
  }
  next();
};

// Import validationResult
const { validationResult } = require('express-validator');

// Public routes (no authentication required)
router.post('/register', 
  authLimiter,
  sanitizeInput,
  logAuthAttempt,
  registerValidation,
  handleValidationErrors,
  authController.register
);

router.post('/login', 
  authLimiter,
  sanitizeInput,
  logAuthAttempt,
  loginValidation,
  handleValidationErrors,
  authController.login
);

router.post('/refresh-token',
  sanitizeInput,
  authController.refreshToken
);

router.post('/forgot-password',
  authLimiter,
  sanitizeInput,
  forgotPasswordValidation,
  handleValidationErrors,
  authController.forgotPassword
);

router.post('/reset-password',
  sanitizeInput,
  resetPasswordValidation,
  handleValidationErrors,
  authController.resetPassword
);

// Username and email availability checks
router.get('/check-username/:username',
  sanitizeInput,
  authController.checkUsername
);

router.get('/check-email/:email',
  sanitizeInput,
  authController.checkEmail
);

// Protected routes (authentication required)
router.post('/logout',
  authenticateToken,
  sanitizeInput,
  authController.logout
);

router.get('/me',
  authenticateToken,
  authController.getProfile
);

router.put('/profile',
  authenticateToken,
  sanitizeInput,
  updateProfileValidation,
  handleValidationErrors,
  authController.updateProfile
);

router.put('/change-password',
  authenticateToken,
  sanitizeInput,
  changePasswordValidation,
  handleValidationErrors,
  authController.changePassword
);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Authentication service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
