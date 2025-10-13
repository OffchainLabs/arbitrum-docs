/**
 * MIT License
 *
 * Copyright (c) 2025 Offchain Labs
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
