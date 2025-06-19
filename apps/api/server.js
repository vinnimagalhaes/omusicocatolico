/**
 * CatCifras API Server
 * Enterprise-level Express.js server entry point
 */

const app = require('./src/app');
const { initializeConnection, syncDatabase } = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

/**
 * Initialize server with proper error handling
 */
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeConnection();
    await syncDatabase();
    
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 CatCifras API Server running on port ${PORT}`);
      logger.info(`📱 Health check: http://localhost:${PORT}/api/health`);
      logger.info(`🔧 API Documentation: http://localhost:${PORT}/api/docs`);
      logger.info('✅ Database connected successfully!');
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      logger.info(`⚠️  ${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        try {
          const { closeDatabase } = require('./src/config/database');
          await closeDatabase();
          logger.info('✅ Database connections closed');
          logger.info('👋 Server shutdown complete');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('🚫 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer(); 