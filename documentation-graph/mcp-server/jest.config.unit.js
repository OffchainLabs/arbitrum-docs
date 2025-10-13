export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/test/unit/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.js'],
  testTimeout: 10000, // Fast unit tests
  maxWorkers: '75%', // Parallelize heavily
  verbose: true,
};
