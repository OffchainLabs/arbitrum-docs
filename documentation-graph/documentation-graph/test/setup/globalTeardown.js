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
