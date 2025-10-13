/**
 * Jest setup file for unit and integration tests
 * Runs before each test file
 */

// Extend Jest matchers if needed
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Set up global test utilities
global.testUtils = {
  delay: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

// Note: jest.setTimeout is not available in ES modules
// Use testTimeout in jest.config.js instead
