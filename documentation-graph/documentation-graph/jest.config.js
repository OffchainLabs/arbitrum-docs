/**
 * Jest Configuration for Documentation Graph Tool
 *
 * Comprehensive test configuration for:
 * - Unit tests
 * - Integration tests
 * - Performance tests
 * - Coverage reporting
 */

export default {
  // Use Node environment for testing
  testEnvironment: 'node',

  // Module configuration
  moduleFileExtensions: ['js', 'json'],

  // Transform ES modules
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './babel.config.test.js' }],
  },

  // Test match patterns
  testMatch: ['**/test/**/*.test.js', '**/test/**/*.spec.js'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/**/index.js',
    '!**/*.config.js',
    '!**/node_modules/**',
    '!**/test/**',
    '!**/dist/**',
  ],

  // Coverage thresholds
  coverageThreshold: {
    'global': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Critical components require higher coverage
    './src/validators/**/*.js': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/reporters/**/*.js': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/visualizers/**/*.js': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },

  // Coverage reporters
  coverageReporters: ['text', 'text-summary', 'html', 'lcov', 'json-summary'],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.js'],

  // Global test timeout (2 minutes for performance tests)
  testTimeout: 120000,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^@fixtures/(.*)$': '<rootDir>/test/fixtures/$1',
    '^@mocks/(.*)$': '<rootDir>/test/mocks/$1',
  },

  // Max workers for parallel execution
  maxWorkers: '50%',

  // Global setup/teardown (temporarily disabled for initial TDD)
  // testSequencer: '<rootDir>/test/setup/testSequencer.js',
  // globalSetup: '<rootDir>/test/setup/globalSetup.js',
  // globalTeardown: '<rootDir>/test/setup/globalTeardown.js',

  // Error on deprecated APIs
  errorOnDeprecated: true,

  // Detect open handles
  detectOpenHandles: true,

  // Force exit after tests complete
  forceExit: true,
};
