/**
 * Authentication Routes
 * Handle user authentication, registration, and password management
 */

const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/auth');

// Middleware
const { authenticate, optionalAuth, authRateLimit, refreshAuth } = require('../middleware/auth');

// Validators
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateRefreshToken,
  validateVerifyEmail,
  validateResendVerification,
  validateUserExists,
  validateUserDoesNotExist
} = require('../validators/auth');

// Public routes with rate limiting
router.post('/register', 
  authRateLimit,
  validateRegister,
  validateUserDoesNotExist,
  authController.register
);

router.post('/login', 
  authRateLimit,
  validateLogin,
  authController.login
);

router.post('/forgot-password', 
  authRateLimit,
  validateForgotPassword,
  authController.forgotPassword
);

router.post('/reset-password', 
  authRateLimit,
  validateResetPassword,
  authController.resetPassword
);

router.post('/verify-email', 
  validateVerifyEmail,
  authController.verifyEmail
);

router.post('/resend-verification', 
  authRateLimit,
  validateResendVerification,
  authController.resendVerification
);

// Token refresh
router.post('/refresh-token', 
  validateRefreshToken,
  refreshAuth,
  authController.refreshToken
);

// Protected routes
router.post('/logout', 
  optionalAuth,
  authController.logout
);

router.get('/profile', 
  authenticate,
  authController.getProfile
);

router.put('/profile', 
  authenticate,
  authController.updateProfile
);

router.post('/change-password', 
  authenticate,
  validateChangePassword,
  authController.changePassword
);

module.exports = router; 