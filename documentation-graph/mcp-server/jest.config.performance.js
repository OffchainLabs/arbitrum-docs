export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/test/performance/**/*.test.js'],
  testTimeout: 300000, // 5 minutes for performance tests
  maxWorkers: 1, // Run serially for consistent measurements
  setupFilesAfterEnv: ['<rootDir>/test/setup/performanceSetup.js'],
  verbose: true,
};
