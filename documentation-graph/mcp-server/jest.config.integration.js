export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/test/integration/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.js'],
  testTimeout: 60000, // Allow more time for integration tests
  maxWorkers: 2, // Less parallelization for integration tests
  verbose: true,
};
