/**
 * Authentication Controller
 * Enterprise-level authentication endpoints with comprehensive security
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../models');
const { AppError } = require('../middleware/error-handler');
const { generateTokens } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * Register new user
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      emailVerificationToken,
      emailVerificationExpires,
      role: 'user',
      status: 'pending' // Requires email verification
    });
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // TODO: Send verification email
    // await sendVerificationEmail(user.email, emailVerificationToken);
    
    req.logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      name: user.name
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
    
  } catch (error) {
    req.logger.error('Registration failed', {
      error: error.message,
      email: req.body.email
    });
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password, remember } = req.body;
    
    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      await User.recordFailedLogin(email, req.ip);
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }
    
    // Check if account is locked
    if (user.isLocked()) {
      throw new AppError('Account is temporarily locked due to too many failed login attempts', 423, 'ACCOUNT_LOCKED');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      await user.recordFailedLogin(req.ip);
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }
    
    // Check account status
    if (user.status === 'suspended') {
      throw new AppError('Account is suspended', 403, 'ACCOUNT_SUSPENDED');
    }
    
    if (user.status === 'inactive') {
      throw new AppError('Account is inactive', 403, 'ACCOUNT_INACTIVE');
    }
    
    // Reset failed login attempts
    await user.resetFailedLogins();
    
    // Update last login
    await user.update({
      lastLoginAt: new Date(),
      lastLoginIp: req.ip
    });
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Set cookie if remember me
    if (remember) {
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }
    
    req.logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
      ip: req.ip,
      remember
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          lastLoginAt: user.lastLoginAt
        },
        tokens: {
          accessToken,
          refreshToken: remember ? refreshToken : undefined
        }
      }
    });
    
  } catch (error) {
    req.logger.error('Login failed', {
      error: error.message,
      email: req.body.email,
      ip: req.ip
    });
    next(error);
  }
};

/**
 * Logout user
 */
const logout = async (req, res, next) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refresh_token');
    
    req.logger.info('User logged out successfully', {
      userId: req.user?.id,
      email: req.user?.email
    });
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res, next) => {
  try {
    const user = req.user; // Set by refreshAuth middleware
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);
    
    req.logger.info('Token refreshed successfully', {
      userId: user.id,
      email: user.email
    });
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      }
    });
    
  } catch (error) {
    req.logger.error('Token refresh failed', {
      error: error.message,
      userId: req.user?.id
    });
    next(error);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          profileImage: user.profileImage
        }
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, email } = req.body;
    
    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError('Email already exists', 409, 'EMAIL_EXISTS');
      }
      
      // If email is changed, require re-verification
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      await user.update({
        name,
        email,
        emailVerified: false,
        emailVerificationToken,
        emailVerificationExpires
      });
      
      // TODO: Send verification email
      // await sendVerificationEmail(email, emailVerificationToken);
      
      req.logger.info('Profile updated with email change', {
        userId: user.id,
        oldEmail: user.email,
        newEmail: email
      });
      
      return res.json({
        success: true,
        message: 'Profile updated successfully. Please verify your new email address.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified
          }
        }
      });
    }
    
    // Update profile without email change
    await user.update({ name });
    
    req.logger.info('Profile updated successfully', {
      userId: user.id,
      email: user.email
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified
        }
      }
    });
    
  } catch (error) {
    req.logger.error('Profile update failed', {
      error: error.message,
      userId: req.user?.id
    });
    next(error);
  }
};

/**
 * Change password
 */
const changePassword = async (req, res, next) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await user.update({
      password: hashedNewPassword,
      passwordChangedAt: new Date()
    });
    
    req.logger.info('Password changed successfully', {
      userId: user.id,
      email: user.email
    });
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    req.logger.error('Password change failed', {
      error: error.message,
      userId: req.user?.id
    });
    next(error);
  }
};

/**
 * Forgot password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await user.update({
      passwordResetToken: resetToken,
      passwordResetExpires: resetTokenExpires
    });
    
    // TODO: Send reset email
    // await sendPasswordResetEmail(user.email, resetToken);
    
    req.logger.info('Password reset requested', {
      userId: user.id,
      email: user.email
    });
    
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent.'
    });
    
  } catch (error) {
    req.logger.error('Forgot password failed', {
      error: error.message,
      email: req.body.email
    });
    next(error);
  }
};

/**
 * Reset password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { [User.sequelize.Sequelize.Op.gt]: new Date() }
      }
    });
    
    if (!user) {
      throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Update password and clear reset token
    await user.update({
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      passwordChangedAt: new Date()
    });
    
    req.logger.info('Password reset successfully', {
      userId: user.id,
      email: user.email
    });
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
    
  } catch (error) {
    req.logger.error('Password reset failed', {
      error: error.message
    });
    next(error);
  }
};

/**
 * Verify email
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { [User.sequelize.Sequelize.Op.gt]: new Date() }
      }
    });
    
    if (!user) {
      throw new AppError('Invalid or expired verification token', 400, 'INVALID_VERIFICATION_TOKEN');
    }
    
    // Verify email and activate account
    await user.update({
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      status: 'active'
    });
    
    req.logger.info('Email verified successfully', {
      userId: user.id,
      email: user.email
    });
    
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
    
  } catch (error) {
    req.logger.error('Email verification failed', {
      error: error.message
    });
    next(error);
  }
};

/**
 * Resend verification email
 */
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.json({
        success: true,
        message: 'If the email exists and is not verified, a new verification link has been sent.'
      });
    }
    
    if (user.emailVerified) {
      return res.json({
        success: true,
        message: 'Email is already verified'
      });
    }
    
    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await user.update({
      emailVerificationToken,
      emailVerificationExpires
    });
    
    // TODO: Send verification email
    // await sendVerificationEmail(user.email, emailVerificationToken);
    
    req.logger.info('Verification email resent', {
      userId: user.id,
      email: user.email
    });
    
    res.json({
      success: true,
      message: 'If the email exists and is not verified, a new verification link has been sent.'
    });
    
  } catch (error) {
    req.logger.error('Resend verification failed', {
      error: error.message,
      email: req.body.email
    });
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
}; 