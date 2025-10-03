/**
 * Logger - Simple structured logging for MCP server
 *
 * Logs to stderr to avoid interfering with MCP stdio communication
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor(level = 'INFO') {
    this.level = LOG_LEVELS[level] || LOG_LEVELS.INFO;
  }

  setLevel(level) {
    this.level = LOG_LEVELS[level] || LOG_LEVELS.INFO;
  }

  debug(message, ...args) {
    if (this.level <= LOG_LEVELS.DEBUG) {
      this.log('DEBUG', message, ...args);
    }
  }

  info(message, ...args) {
    if (this.level <= LOG_LEVELS.INFO) {
      this.log('INFO', message, ...args);
    }
  }

  warn(message, ...args) {
    if (this.level <= LOG_LEVELS.WARN) {
      this.log('WARN', message, ...args);
    }
  }

  error(message, ...args) {
    if (this.level <= LOG_LEVELS.ERROR) {
      this.log('ERROR', message, ...args);
    }
  }

  log(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;

    // Log to stderr to avoid interfering with MCP stdio
    if (args.length > 0) {
      console.error(formattedMessage, ...args);
    } else {
      console.error(formattedMessage);
    }
  }
}

// Get log level from environment variable
const logLevel = process.env.LOG_LEVEL || 'INFO';

export const logger = new Logger(logLevel);
