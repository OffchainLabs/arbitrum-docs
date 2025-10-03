/**
 * Global Setup for Jest Tests
 *
 * Runs once before all test suites
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function globalSetup() {
  console.log('\n🧪 Setting up test environment...\n');

  // Create test output directories
  const testOutputDir = path.join(__dirname, '../../test/output');
  const coverageDir = path.join(__dirname, '../../coverage');

  await fs.ensureDir(testOutputDir);
  await fs.ensureDir(coverageDir);

  // Clean previous test outputs
  await fs.emptyDir(testOutputDir);

  // Set environment variables for tests
  process.env.TEST_MODE = 'true';
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Suppress logs during tests

  // Enable garbage collection for performance tests
  if (global.gc) {
    console.log('✅ Garbage collection enabled for memory tests');
  } else {
    console.log('⚠️  Run with --expose-gc for accurate memory tests');
  }

  console.log('✅ Test environment ready\n');
}
