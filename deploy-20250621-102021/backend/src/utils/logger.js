/**
 * Enterprise Logger Configuration
 * Winston-based logging system with multiple transports and formats
 */

const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define log level colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

// Create logs directory
const logDir = path.join(__dirname, '../../../../storage/logs');
require('fs').mkdirSync(logDir, { recursive: true });

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.LOG_LEVEL || 'info'
  }),
  
  // Error file transport
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  
  // Combined file transport
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
];

// Add daily rotate file transport for production
if (process.env.NODE_ENV === 'production') {
  const DailyRotateFile = require('winston-daily-rotate-file');
  
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: fileFormat,
  transports,
  exitOnError: false
});

// Handle uncaught exceptions and rejections
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logDir, 'exceptions.log'),
    format: fileFormat
  })
);

logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(logDir, 'rejections.log'),
    format: fileFormat
  })
);

// Create stream for HTTP request logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Add request ID to logs
logger.child = (meta) => {
  return {
    info: (message, additionalMeta = {}) => logger.info(message, { ...meta, ...additionalMeta }),
    warn: (message, additionalMeta = {}) => logger.warn(message, { ...meta, ...additionalMeta }),
    error: (message, additionalMeta = {}) => logger.error(message, { ...meta, ...additionalMeta }),
    debug: (message, additionalMeta = {}) => logger.debug(message, { ...meta, ...additionalMeta }),
    http: (message, additionalMeta = {}) => logger.http(message, { ...meta, ...additionalMeta })
  };
};

module.exports = logger; 