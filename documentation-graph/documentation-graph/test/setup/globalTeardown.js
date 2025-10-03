/**
 * Global Teardown for Jest Tests
 *
 * Runs once after all test suites
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function globalTeardown() {
  console.log('\n🧹 Cleaning up test environment...\n');

  // Optional: Clean test output directory
  const testOutputDir = path.join(__dirname, '../../test/output');
  const keepTestOutput = process.env.KEEP_TEST_OUTPUT === 'true';

  if (!keepTestOutput) {
    await fs.emptyDir(testOutputDir);
    console.log('✅ Test outputs cleaned');
  } else {
    console.log('📁 Test outputs preserved at:', testOutputDir);
  }

  // Generate test summary
  const coverageDir = path.join(__dirname, '../../coverage');
  if (await fs.pathExists(coverageDir)) {
    console.log('📊 Coverage report generated at:', coverageDir);
  }

  console.log('\n✅ Teardown complete\n');
}
