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
 * Fixture Loader - Utilities for loading test fixtures efficiently
 *
 * Provides cached fixture loading to avoid repeated file I/O during tests
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = join(__dirname, '../fixtures');

// In-memory cache for fixtures (avoid repeated file I/O)
const fixtureCache = new Map();

export async function loadFixture(category, name) {
  const path = join(FIXTURES_DIR, category, `${name}.json`);
  const content = await readFile(path, 'utf-8');
  return JSON.parse(content);
}

export async function loadGraphFixture(size = 'small') {
  return loadFixture('graphs', size);
}

export async function loadDocumentFixture(type = 'simple') {
  return loadFixture('documents', type);
}

export async function loadConceptFixture(type = 'basic') {
  return loadFixture('concepts', type);
}

// Load fixture with caching (prevents repeated file I/O)
export async function loadFixtureCached(category, name) {
  const key = `${category}/${name}`;
  if (!fixtureCache.has(key)) {
    fixtureCache.set(key, await loadFixture(category, name));
  }
  // Return deep copy to prevent mutation between tests
  return structuredClone(fixtureCache.get(key));
}

// Clear fixture cache (useful for testing)
export function clearFixtureCache() {
  fixtureCache.clear();
}
