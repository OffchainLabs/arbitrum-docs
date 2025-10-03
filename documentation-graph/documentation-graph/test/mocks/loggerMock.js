/**
 * Logger Mock
 *
 * Mock implementation of logger for testing
 */

import { jest } from '@jest/globals';

/**
 * Create mock logger
 */
export function createMockLogger() {
  return {
    section: jest.fn((title) => {
      // Silent in tests
    }),

    info: jest.fn((message, ...args) => {
      // Silent in tests
    }),

    success: jest.fn((message, ...args) => {
      // Silent in tests
    }),

    error: jest.fn((message, ...args) => {
      // Silent in tests
    }),

    warn: jest.fn((message, ...args) => {
      // Silent in tests
    }),

    stat: jest.fn((label, value) => {
      // Silent in tests
    }),

    progress: jest.fn((current, total, message) => {
      // Silent in tests
    }),

    debug: jest.fn((message, ...args) => {
      // Silent in tests
    }),

    // Utility methods
    reset: function () {
      this.section.mockClear();
      this.info.mockClear();
      this.success.mockClear();
      this.error.mockClear();
      this.warn.mockClear();
      this.stat.mockClear();
      this.progress.mockClear();
      this.debug.mockClear();
    },

    // Get all calls for a specific method
    getCalls: function (method) {
      return this[method].mock.calls;
    },

    // Check if method was called with specific message
    wasCalledWith: function (method, message) {
      return this[method].mock.calls.some((call) =>
        call.some((arg) => String(arg).includes(message)),
      );
    },
  };
}

/**
 * Create verbose logger for debugging tests
 */
export function createVerboseMockLogger() {
  const logger = createMockLogger();

  // Override to actually log in verbose mode
  if (process.env.VERBOSE_TESTS === 'true') {
    logger.section = jest.fn((title) => console.log(`\n=== ${title} ===\n`));
    logger.info = jest.fn((message, ...args) => console.log('ℹ️ ', message, ...args));
    logger.success = jest.fn((message, ...args) => console.log('✅', message, ...args));
    logger.error = jest.fn((message, ...args) => console.error('❌', message, ...args));
    logger.warn = jest.fn((message, ...args) => console.warn('⚠️ ', message, ...args));
    logger.stat = jest.fn((label, value) => console.log(`📊 ${label}: ${value}`));
    logger.progress = jest.fn((current, total, message) =>
      console.log(`📈 [${current}/${total}] ${message}`),
    );
    logger.debug = jest.fn((message, ...args) => console.log('🔍', message, ...args));
  }

  return logger;
}

export default createMockLogger;
