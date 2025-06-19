/**
 * Authentication Middleware
 * Enterprise-level JWT authentication with role-based access control
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('./error-handler');
const logger = require('../utils/logger');

/**
 * JWT Configuration
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Generate JWT tokens
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'catcifras-api',
      audience: 'catcifras-app'
    }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { 
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'catcifras-api',
      audience: 'catcifras-app'
    }
  );

  return { accessToken, refreshToken };
};

/**
 * Verify JWT token
 */
const verifyToken = (token, expectedType = 'access') => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'catcifras-api',
      audience: 'catcifras-app'
    });
    
    if (decoded.type !== expectedType) {
      throw new Error(`Invalid token type. Expected ${expectedType}, got ${decoded.type}`);
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token has expired', 401, 'TOKEN_EXPIRED');
    } else if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
    } else {
      throw new AppError(error.message, 401, 'TOKEN_ERROR');
    }
  }
};

/**
 * Extract token from request
 */
const extractToken = (req) => {
  let token = null;
  
  // Check Authorization header
  const authHeader = req.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  // Check cookie as fallback
  if (!token && req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }
  
  return token;
};

/**
 * Authentication middleware
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      throw new AppError('Access token is required', 401, 'TOKEN_REQUIRED');
    }

    // Verify token
    const decoded = verifyToken(token, 'access');
    
    // Get user from database
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      throw new AppError('User no longer exists', 401, 'USER_NOT_FOUND');
    }
    
    if (user.status !== 'active') {
      throw new AppError('User account is not active', 401, 'ACCOUNT_INACTIVE');
    }
    
    if (user.isLocked()) {
      throw new AppError('Account is temporarily locked', 401, 'ACCOUNT_LOCKED');
    }
    
    // Add user to request object
    req.user = user;
    req.token = token;
    
    // Log authentication
    req.logger.info('User authenticated', {
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    next();
    
  } catch (error) {
    // Log authentication failure
    const clientIp = req.ip;
    const userAgent = req.get('User-Agent');
    
    req.logger.warn('Authentication failed', {
      error: error.message,
      ip: clientIp,
      userAgent,
      path: req.path
    });
    
    next(error);
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = verifyToken(token, 'access');
      const user = await User.findByPk(decoded.userId);
      
      if (user && user.status === 'active' && !user.isLocked()) {
        req.user = user;
        req.token = token;
      }
    }
    
    next();
    
  } catch (error) {
    // Don't fail for optional auth - just continue without user
    req.logger.debug('Optional authentication failed (continuing)', {
      error: error.message
    });
    next();
  }
};

/**
 * Role-based authorization middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }
    
    // Check if user has required role
    const hasPermission = allowedRoles.some(role => req.user.hasRole(role));
    
    if (!hasPermission) {
      req.logger.warn('Authorization failed', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path
      });
      
      return next(new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS'));
    }
    
    req.logger.debug('User authorized', {
      userId: req.user.id,
      role: req.user.role,
      requiredRoles: allowedRoles
    });
    
    next();
  };
};

/**
 * Owner-based authorization (user can only access their own resources)
 */
const authorizeOwner = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }
    
    // Admin and master can access any resource
    if (req.user.hasRole('admin')) {
      return next();
    }
    
    const resourceUserId = req.resource?.[resourceUserIdField] || req.params.userId;
    
    if (!resourceUserId) {
      return next(new AppError('Resource owner not specified', 400, 'OWNER_NOT_SPECIFIED'));
    }
    
    if (parseInt(resourceUserId) !== req.user.id) {
      req.logger.warn('Owner authorization failed', {
        userId: req.user.id,
        resourceUserId,
        path: req.path
      });
      
      return next(new AppError('Can only access your own resources', 403, 'OWNER_REQUIRED'));
    }
    
    next();
  };
};

/**
 * Rate limiting for authentication endpoints
 */
const authRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    req.logger.warn('Authentication rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Please try again later',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Refresh token middleware
 */
const refreshAuth = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies.refresh_token;
    
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 401, 'REFRESH_TOKEN_REQUIRED');
    }
    
    const decoded = verifyToken(refreshToken, 'refresh');
    const user = await User.findByPk(decoded.userId);
    
    if (!user || user.status !== 'active') {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
    
    req.user = user;
    next();
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateTokens,
  verifyToken,
  authenticate,
  optionalAuth,
  authorize,
  authorizeOwner,
  authRateLimit,
  refreshAuth,
  JWT_SECRET,
  JWT_EXPIRES_IN
}; 