/**
 * Enterprise Database Configuration
 * Sequelize configuration with connection pooling, monitoring, and multi-environment support
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const logger = require('../utils/logger');

/**
 * Database configuration by environment
 */
const configs = {
  development: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../../../storage/database.sqlite'),
    logging: (msg) => logger.debug('Database Query:', msg),
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true, // Soft deletes
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  },
  
  production: {
    dialect: process.env.DB_DIALECT || 'mysql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    dialectOptions: {
      charset: 'utf8mb4',
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false
    }
  }
};

/**
 * Get current environment
 */
const environment = process.env.NODE_ENV || 'development';
const config = configs[environment];

if (!config) {
  throw new Error(`Invalid environment: ${environment}`);
}

/**
 * Create Sequelize instance
 */
const sequelize = new Sequelize(config);

/**
 * Connection monitoring and health checks
 */
let connectionStatus = {
  isConnected: false,
  lastCheck: null,
  consecutiveFailures: 0,
  maxRetries: 5
};

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    connectionStatus.isConnected = true;
    connectionStatus.lastCheck = new Date();
    connectionStatus.consecutiveFailures = 0;
    
    logger.info(`✅ Database connection established (${config.dialect})`);
    return true;
  } catch (error) {
    connectionStatus.isConnected = false;
    connectionStatus.lastCheck = new Date();
    connectionStatus.consecutiveFailures++;
    
    logger.error('❌ Database connection failed:', {
      error: error.message,
      dialect: config.dialect,
      consecutiveFailures: connectionStatus.consecutiveFailures
    });
    
    if (connectionStatus.consecutiveFailures >= connectionStatus.maxRetries) {
      logger.error('💥 Maximum database connection retries exceeded');
      throw error;
    }
    
    return false;
  }
};

/**
 * Initialize database connection with retry logic
 */
const initializeConnection = async () => {
  let retries = 0;
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds
  
  while (retries < maxRetries) {
    try {
      const success = await testConnection();
      if (success) {
        return true;
      }
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        throw error;
      }
      
      logger.warn(`Database connection attempt ${retries}/${maxRetries} failed, retrying in ${retryDelay/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw new Error('Failed to establish database connection after maximum retries');
};

/**
 * Synchronize database models
 */
const syncDatabase = async (options = {}) => {
  try {
    const { force = false, alter = false } = options;
    
    logger.info('🔄 Starting database synchronization...');
    
    // Import and initialize models
    const models = require('../models');
    
    await sequelize.sync({ force, alter });
    
    logger.info('✅ Database synchronized successfully');
    
    // Run seeders in development or if force is true
    if (force || environment === 'development') {
      logger.info('🌱 Running database seeders...');
      await runSeeders();
    }
    
    return true;
  } catch (error) {
    logger.error('❌ Database synchronization failed:', error);
    throw error;
  }
};

/**
 * Run database seeders
 */
const runSeeders = async () => {
  try {
    const seeders = require('../database/seeders');
    await seeders.run();
    logger.info('✅ Database seeders completed');
  } catch (error) {
    logger.error('❌ Database seeders failed:', error);
    throw error;
  }
};

/**
 * Close database connection gracefully
 */
const closeDatabase = async () => {
  try {
    await sequelize.close();
    connectionStatus.isConnected = false;
    logger.info('✅ Database connection closed gracefully');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
    throw error;
  }
};

/**
 * Get connection health status
 */
const getHealthStatus = () => {
  return {
    ...connectionStatus,
    environment,
    dialect: config.dialect,
    poolSize: {
      max: config.pool?.max || 0,
      min: config.pool?.min || 0
    }
  };
};

/**
 * Connection event handlers
 */
sequelize.addHook('beforeConnect', (config) => {
  logger.debug('🔌 Attempting database connection...');
});

sequelize.addHook('afterConnect', (connection, config) => {
  logger.debug('✅ Database connection established');
});

sequelize.addHook('beforeDisconnect', (connection) => {
  logger.debug('🔌 Closing database connection...');
});

/**
 * Query performance monitoring
 */
if (environment === 'development') {
  sequelize.addHook('beforeQuery', (options) => {
    options.startTime = Date.now();
  });
  
  sequelize.addHook('afterQuery', (options) => {
    const duration = Date.now() - options.startTime;
    if (duration > 1000) { // Log slow queries (>1s)
      logger.warn('🐌 Slow query detected:', {
        duration: `${duration}ms`,
        sql: options.sql.substring(0, 200) + (options.sql.length > 200 ? '...' : '')
      });
    }
  });
}

module.exports = {
  sequelize,
  initializeConnection,
  testConnection,
  syncDatabase,
  closeDatabase,
  getHealthStatus,
  connectionStatus
}; 