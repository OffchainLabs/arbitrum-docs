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
 * Fixture Loader
 *
 * Utilities for loading test fixtures
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.join(__dirname, '../fixtures');

/**
 * Load JSON fixture
 */
export async function loadFixture(relativePath) {
  const fixturePath = path.join(FIXTURES_DIR, relativePath);

  if (!(await fs.pathExists(fixturePath))) {
    throw new Error(`Fixture not found: ${relativePath}`);
  }

  return fs.readJson(fixturePath);
}

/**
 * Load JSON fixture synchronously
 */
export function loadFixtureSync(relativePath) {
  const fixturePath = path.join(FIXTURES_DIR, relativePath);

  if (!fs.existsSync(fixturePath)) {
    throw new Error(`Fixture not found: ${relativePath}`);
  }

  return fs.readJsonSync(fixturePath);
}

/**
 * Load text fixture
 */
export async function loadTextFixture(relativePath) {
  const fixturePath = path.join(FIXTURES_DIR, relativePath);

  if (!(await fs.pathExists(fixturePath))) {
    throw new Error(`Fixture not found: ${relativePath}`);
  }

  return fs.readFile(fixturePath, 'utf8');
}

/**
 * Load all fixtures in a directory
 */
export async function loadFixtureDirectory(relativePath) {
  const fixturePath = path.join(FIXTURES_DIR, relativePath);

  if (!(await fs.pathExists(fixturePath))) {
    throw new Error(`Fixture directory not found: ${relativePath}`);
  }

  const files = await fs.readdir(fixturePath);
  const fixtures = {};

  for (const file of files) {
    if (file.endsWith('.json')) {
      const name = path.basename(file, '.json');
      fixtures[name] = await fs.readJson(path.join(fixturePath, file));
    }
  }

  return fixtures;
}

/**
 * Save test output as fixture
 */
export async function saveAsFixture(relativePath, data) {
  const fixturePath = path.join(FIXTURES_DIR, relativePath);
  await fs.ensureDir(path.dirname(fixturePath));

  if (typeof data === 'string') {
    await fs.writeFile(fixturePath, data, 'utf8');
  } else {
    await fs.writeJson(fixturePath, data, { spaces: 2 });
  }
}

/**
 * Get fixture path
 */
export function getFixturePath(relativePath) {
  return path.join(FIXTURES_DIR, relativePath);
}

/**
 * Check if fixture exists
 */
export async function fixtureExists(relativePath) {
  const fixturePath = path.join(FIXTURES_DIR, relativePath);
  return fs.pathExists(fixturePath);
}

/**
 * Fixture categories
 */
export const FixtureCategory = {
  SCHEMAS: 'schemas',
  GRAPHS: 'graphs',
  DOCUMENTS: 'documents',
  CONCEPTS: 'concepts',
  ANALYSIS: 'analysis',
  REPORTS: 'reports',
  INVALID: 'invalid',
};

/**
 * Typed fixture loaders
 */
export const Fixtures = {
  /**
   * Load valid graph fixture
   */
  async graph(size = 'small') {
    const filename =
      size === 'small'
        ? 'small-graph.json'
        : size === 'medium'
        ? 'medium-graph.json'
        : size === 'large'
        ? 'large-graph.json'
        : `${size}-graph.json`;

    return loadFixture(`${FixtureCategory.GRAPHS}/${filename}`);
  },

  /**
   * Load valid documents fixture
   */
  async documents(size = 'small') {
    const filename =
      size === 'small'
        ? 'small-documents.json'
        : size === 'medium'
        ? 'medium-documents.json'
        : `${size}-documents.json`;

    return loadFixture(`${FixtureCategory.DOCUMENTS}/${filename}`);
  },

  /**
   * Load valid concepts fixture
   */
  async concepts(size = 'small') {
    const filename =
      size === 'small'
        ? 'small-concepts.json'
        : size === 'medium'
        ? 'medium-concepts.json'
        : `${size}-concepts.json`;

    return loadFixture(`${FixtureCategory.CONCEPTS}/${filename}`);
  },

  /**
   * Load valid analysis fixture
   */
  async analysis() {
    return loadFixture(`${FixtureCategory.ANALYSIS}/valid-analysis.json`);
  },

  /**
   * Load schema fixture
   */
  async schema(name) {
    return loadFixture(`${FixtureCategory.SCHEMAS}/${name}`);
  },

  /**
   * Load invalid fixture for negative testing
   */
  async invalid(category, type) {
    return loadFixture(`${FixtureCategory.INVALID}/${category}/${type}.json`);
  },

  /**
   * Load report fixture
   */
  async report(name) {
    return loadTextFixture(`${FixtureCategory.REPORTS}/${name}`);
  },
};

export default {
  loadFixture,
  loadFixtureSync,
  loadTextFixture,
  loadFixtureDirectory,
  saveAsFixture,
  getFixturePath,
  fixtureExists,
  FixtureCategory,
  Fixtures,
};
