/**
 * Jest setup file for performance tests
 * Configures environment for benchmarking
 */

// Increase timeout significantly for performance tests
jest.setTimeout(300000); // 5 minutes

// Disable console output during performance tests unless explicitly enabled
if (!process.env.VERBOSE_PERF) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
}

// Set up performance monitoring
global.performance = {
  ...global.performance,
  marks: new Map(),
  measures: new Map(),
};
