/**
 * Request Logging Middleware
 * Comprehensive HTTP request logging with unique IDs and performance metrics
 */

const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Generate unique request ID
 */
const generateRequestId = () => {
  return crypto.randomBytes(4).toString('hex'); // Generate 8-character hex ID
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Add request ID to request object
  req.requestId = requestId;
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Create child logger with request context
  req.logger = logger.child({ requestId });
  
  // Log request start
  req.logger.http('Request started', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    contentLength: req.get('Content-Length'),
    contentType: req.get('Content-Type')
  });
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - startTime;
    
    // Log response
    req.logger.http('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: JSON.stringify(body).length
    });
    
    // Call original json method
    return originalJson.call(this, body);
  };
  
  // Override res.send to log response
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - startTime;
    
    // Log response if not already logged by res.json
    if (!res.headersSent || res.getHeader('Content-Type') !== 'application/json') {
      req.logger.http('Request completed', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        responseSize: body ? body.length : 0
      });
    }
    
    // Call original send method
    return originalSend.call(this, body);
  };
  
  // Handle response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log if response wasn't logged by json/send overrides
    if (!res.headersSent) {
      req.logger.http('Request finished', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      });
    }
    
    // Log slow requests as warnings
    if (duration > 1000) {
      req.logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        statusCode: res.statusCode
      });
    }
  });
  
  // Handle client disconnection
  req.on('close', () => {
    if (!res.headersSent) {
      req.logger.warn('Client disconnected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${Date.now() - startTime}ms`
      });
    }
  });
  
  next();
};

/**
 * Security logging middleware for sensitive operations
 */
const securityLogger = (req, res, next) => {
  const sensitiveRoutes = ['/auth/login', '/auth/register', '/auth/reset-password'];
  const isSensitive = sensitiveRoutes.some(route => req.path.includes(route));
  
  if (isSensitive) {
    req.logger.info('Security-sensitive request', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer')
    });
  }
  
  next();
};

/**
 * API versioning logger
 */
const apiVersionLogger = (req, res, next) => {
  const apiVersion = req.get('API-Version') || 'v1';
  req.apiVersion = apiVersion;
  
  // Log API version usage for analytics
  if (apiVersion !== 'v1') {
    req.logger.info('Non-default API version used', {
      version: apiVersion,
      method: req.method,
      url: req.originalUrl
    });
  }
  
  next();
};

module.exports = {
  requestLogger,
  securityLogger,
  apiVersionLogger
}; 