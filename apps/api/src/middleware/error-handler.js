/**
 * Enterprise Error Handling Middleware
 * Centralized error handling with proper logging and response formatting
 */

const logger = require('../utils/logger');

/**
 * Custom Application Error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Sequelize validation errors
 */
const handleSequelizeValidationError = (err) => {
  const errors = err.errors.map(error => ({
    field: error.path,
    message: error.message,
    value: error.value
  }));

  return new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors);
};

/**
 * Handle Sequelize unique constraint errors
 */
const handleSequelizeUniqueConstraintError = (err) => {
  const field = err.errors[0]?.path;
  const value = err.errors[0]?.value;
  
  return new AppError(
    `${field} '${value}' already exists`,
    409,
    'DUPLICATE_ENTRY'
  );
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN');
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401, 'TOKEN_EXPIRED');
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, req, res) => {
  logger.error('Development Error:', {
    error: err,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    code: err.code,
    details: err.details
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, req, res) => {
  // Log error details
  logger.error('Production Error:', {
    message: err.message,
    statusCode: err.statusCode,
    code: err.code,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: err.stack
  });

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.code,
      ...(err.details && { details: err.details })
    });
  } else {
    // Programming or other unknown error: don't leak error details
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Handle specific error types
  if (err.name === 'SequelizeValidationError') {
    error = handleSequelizeValidationError(err);
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    error = handleSequelizeUniqueConstraintError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  } else if (err.code === 'ENOENT') {
    error = new AppError('File not found', 404, 'FILE_NOT_FOUND');
  } else if (err.code === 'EACCES') {
    error = new AppError('Permission denied', 403, 'PERMISSION_DENIED');
  } else if (err.type === 'entity.parse.failed') {
    error = new AppError('Invalid JSON payload', 400, 'INVALID_JSON');
  } else if (err.type === 'entity.too.large') {
    error = new AppError('Request payload too large', 413, 'PAYLOAD_TOO_LARGE');
  }

  // Ensure error has proper structure
  if (!error.isOperational) {
    error = new AppError(error.message, error.statusCode, error.code);
  }

  // Send error response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

/**
 * Handle 404 Not Found errors
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

/**
 * Async error wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler
}; 