/**
 * Enhanced Logger - Structured logging with metrics and request tracking
 *
 * Logs to stderr to avoid interfering with MCP stdio communication
 * Supports structured JSON logs and performance metrics
 */

import { randomUUID } from 'crypto';

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor(config = {}) {
    this.level = LOG_LEVELS[config.logLevel] || LOG_LEVELS.INFO;
    this.structured = config.enableStructuredLogs || false;
    this.metricsEnabled = config.enableMetrics || false;
    this.context = {};
    this.metrics = {
      toolExecutions: new Map(),
      errors: new Map(),
      cacheStats: { hits: 0, misses: 0 },
      requestCount: 0,
      totalExecutionTime: 0,
    };
  }

  setLevel(level) {
    this.level = LOG_LEVELS[level] || LOG_LEVELS.INFO;
  }

  setContext(context) {
    this.context = { ...this.context, ...context };
  }

  clearContext() {
    this.context = {};
  }

  createRequestContext() {
    const requestId = randomUUID();
    return {
      requestId,
      timestamp: new Date().toISOString(),
    };
  }

  debug(message, meta = {}) {
    if (this.level <= LOG_LEVELS.DEBUG) {
      this.log('DEBUG', message, meta);
    }
  }

  info(message, meta = {}) {
    if (this.level <= LOG_LEVELS.INFO) {
      this.log('INFO', message, meta);
    }
  }

  warn(message, meta = {}) {
    if (this.level <= LOG_LEVELS.WARN) {
      this.log('WARN', message, meta);
    }
  }

  error(message, error = null, meta = {}) {
    if (this.level <= LOG_LEVELS.ERROR) {
      const errorMeta = error
        ? {
            error: {
              message: error.message,
              code: error.code,
              stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
            ...meta,
          }
        : meta;

      this.log('ERROR', message, errorMeta);

      // Track error metrics
      if (this.metricsEnabled && error) {
        const errorType = error.code || error.name || 'UNKNOWN';
        this.metrics.errors.set(errorType, (this.metrics.errors.get(errorType) || 0) + 1);
      }
    }
  }

  log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();

    if (this.structured) {
      // Structured JSON logging
      const logEntry = {
        timestamp,
        level,
        message,
        ...this.context,
        ...meta,
      };

      console.error(JSON.stringify(logEntry));
    } else {
      // Human-readable logging
      const contextStr =
        Object.keys(this.context).length > 0 ? ` ${JSON.stringify(this.context)}` : '';
      const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
      const formattedMessage = `[${timestamp}] [${level}]${contextStr} ${message}${metaStr}`;

      console.error(formattedMessage);
    }
  }

  // Performance tracking
  startTimer(operation) {
    const startTime = Date.now();
    return {
      end: (meta = {}) => {
        const duration = Date.now() - startTime;
        this.debug(`${operation} completed in ${duration}ms`, { duration, operation, ...meta });
        return duration;
      },
    };
  }

  // Tool execution tracking
  logToolExecution(toolName, duration, success = true) {
    if (!this.metricsEnabled) return;

    if (!this.metrics.toolExecutions.has(toolName)) {
      this.metrics.toolExecutions.set(toolName, {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        failures: 0,
      });
    }

    const stats = this.metrics.toolExecutions.get(toolName);
    stats.count++;
    stats.totalTime += duration;
    stats.avgTime = stats.totalTime / stats.count;
    if (!success) {
      stats.failures++;
    }

    this.metrics.requestCount++;
    this.metrics.totalExecutionTime += duration;
  }

  // Cache statistics tracking
  logCacheHit() {
    if (this.metricsEnabled) {
      this.metrics.cacheStats.hits++;
    }
  }

  logCacheMiss() {
    if (this.metricsEnabled) {
      this.metrics.cacheStats.misses++;
    }
  }

  // Get metrics summary
  getMetrics() {
    if (!this.metricsEnabled) {
      return { enabled: false };
    }

    const totalCacheRequests = this.metrics.cacheStats.hits + this.metrics.cacheStats.misses;
    const cacheHitRate =
      totalCacheRequests > 0 ? (this.metrics.cacheStats.hits / totalCacheRequests) * 100 : 0;

    const avgRequestTime =
      this.metrics.requestCount > 0
        ? this.metrics.totalExecutionTime / this.metrics.requestCount
        : 0;

    return {
      enabled: true,
      requests: {
        total: this.metrics.requestCount,
        avgExecutionTime: Math.round(avgRequestTime),
      },
      tools: Object.fromEntries(
        Array.from(this.metrics.toolExecutions.entries()).map(([name, stats]) => [
          name,
          {
            count: stats.count,
            avgTime: Math.round(stats.avgTime),
            failures: stats.failures,
            successRate: stats.count > 0 ? ((stats.count - stats.failures) / stats.count) * 100 : 0,
          },
        ]),
      ),
      cache: {
        hits: this.metrics.cacheStats.hits,
        misses: this.metrics.cacheStats.misses,
        hitRate: cacheHitRate.toFixed(2) + '%',
      },
      errors: Object.fromEntries(this.metrics.errors.entries()),
    };
  }

  // Print metrics summary
  printMetrics() {
    const metrics = this.getMetrics();

    if (!metrics.enabled) {
      this.info('Metrics tracking is disabled');
      return;
    }

    this.info('=== Performance Metrics ===');
    this.info(`Total requests: ${metrics.requests.total}`);
    this.info(`Average execution time: ${metrics.requests.avgExecutionTime}ms`);
    this.info('\nCache performance:');
    this.info(`  Hits: ${metrics.cache.hits}`);
    this.info(`  Misses: ${metrics.cache.misses}`);
    this.info(`  Hit rate: ${metrics.cache.hitRate}`);

    if (Object.keys(metrics.tools).length > 0) {
      this.info('\nTool execution stats:');
      for (const [tool, stats] of Object.entries(metrics.tools)) {
        this.info(
          `  ${tool}: ${stats.count} calls, ${stats.avgTime}ms avg, ${stats.successRate.toFixed(
            1,
          )}% success`,
        );
      }
    }

    if (Object.keys(metrics.errors).length > 0) {
      this.info('\nError summary:');
      for (const [errorType, count] of Object.entries(metrics.errors)) {
        this.info(`  ${errorType}: ${count}`);
      }
    }

    this.info('===========================');
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      toolExecutions: new Map(),
      errors: new Map(),
      cacheStats: { hits: 0, misses: 0 },
      requestCount: 0,
      totalExecutionTime: 0,
    };
  }
}

// Singleton instance - will be initialized with config later
let loggerInstance = null;

export function initializeLogger(config = {}) {
  loggerInstance = new Logger(config);
  return loggerInstance;
}

export function getLogger() {
  if (!loggerInstance) {
    // Fallback to basic logger
    loggerInstance = new Logger({
      logLevel: process.env.LOG_LEVEL || 'INFO',
      enableStructuredLogs: false,
      enableMetrics: false,
    });
  }
  return loggerInstance;
}

// Legacy export for backward compatibility
export const logger = new Proxy(
  {},
  {
    get(target, prop) {
      const instance = getLogger();
      return typeof instance[prop] === 'function' ? instance[prop].bind(instance) : instance[prop];
    },
  },
);
