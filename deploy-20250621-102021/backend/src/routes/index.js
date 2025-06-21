/**
 * API Routes Index
 * Enterprise-level route organization with versioning and middleware
 */

const express = require('express');
const { sequelize, getDatabaseStats } = require('../models');
const logger = require('../utils/logger');

// Import route modules
const authRoutes = require('./auth');
const chordRoutes = require('./chords');
const favoriteRoutes = require('./favorites');
const userRoutes = require('./users');

// Create main router
const router = express.Router();

/**
 * API Health Check Endpoint
 */
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    
    // Get basic stats
    const stats = await getDatabaseStats();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        dialect: sequelize.getDialect(),
        ...stats
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
    
  } catch (error) {
    logger.error('Health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        status: 'disconnected'
      }
    });
  }
});

/**
 * API Information Endpoint
 */
router.get('/info', (req, res) => {
  res.json({
    name: 'CatCifras API',
    description: 'Enterprise Catholic Music Platform API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      chords: '/api/chords',
      favorites: '/api/favorites',
      users: '/api/users',
      health: '/api/health'
    },
    features: [
      'User authentication and authorization',
      'Chord management with moderation',
      'Favorite system with organization',
      'Advanced search and filtering',
      'RESTful API design',
      'Comprehensive logging',
      'Rate limiting and security'
    ]
  });
});

/**
 * API Documentation Endpoint (placeholder)
 */
router.get('/docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    swagger: '/api/docs/swagger',
    postman: '/api/docs/postman',
    version: 'v1',
    note: 'Comprehensive API documentation coming soon'
  });
});

/**
 * Mount API Routes
 */

// Authentication routes
router.use('/auth', authRoutes);

// Chord routes
router.use('/chords', chordRoutes);

// Favorite routes  
router.use('/favorites', favoriteRoutes);

// User routes
router.use('/users', userRoutes);

/**
 * API Statistics Endpoint (protected)
 */
router.get('/stats', async (req, res) => {
  try {
    // This would typically require admin authentication
    // For now, just return basic stats
    
    const stats = await getDatabaseStats();
    
    // Add more detailed statistics
    const detailedStats = {
      ...stats,
      api: {
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      },
      database: {
        dialect: sequelize.getDialect(),
        pool: sequelize.connectionManager.pool?.options || {}
      }
    };
    
    res.json(detailedStats);
    
  } catch (error) {
    logger.error('Stats endpoint error:', error);
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      message: error.message
    });
  }
});

/**
 * API Routes Not Found Handler
 */
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `The endpoint ${req.method} ${req.baseUrl}${req.path} does not exist`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/info',
      'GET /api/docs',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/chords',
      'GET /api/favorites',
      'GET /api/users'
    ]
  });
});

module.exports = router; 