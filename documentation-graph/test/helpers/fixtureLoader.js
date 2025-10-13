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
 * Fixture loading utilities for test data
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');

/**
 * Load fixture by name and type
 * @param {string} type - Fixture type (minimal, standard, edge-cases)
 * @param {string} name - Fixture name (documents, concepts, etc.)
 * @returns {Promise<Object>} Parsed fixture data
 */
export async function loadFixture(type, name) {
  const fixturePath = path.join(FIXTURES_DIR, type, `${name}.json`);

  if (!(await fs.pathExists(fixturePath))) {
    throw new Error(`Fixture not found: ${fixturePath}`);
  }

  return await fs.readJSON(fixturePath);
}

/**
 * Load all fixtures for a specific type
 * @param {string} type - Fixture type (minimal, standard, edge-cases)
 * @returns {Promise<Object>} Object with all fixtures for the type
 */
export async function loadFixtureSet(type) {
  const fixtures = {
    documents: await loadFixture(type, 'documents'),
    concepts: await loadFixture(type, 'concepts'),
    analysis: await loadFixture(type, 'analysis'),
    graphStats: await loadFixture(type, 'graphStats'),
  };

  // Optionally load sidebar if it exists
  try {
    fixtures.sidebar = await loadFixture(type, 'sidebar');
  } catch (error) {
    fixtures.sidebar = null;
  }

  return fixtures;
}

/**
 * Convert documents array to Map (matching production format)
 * @param {Array} documentsArray - Array of document objects
 * @returns {Map} Documents Map with path as key
 */
export function documentsArrayToMap(documentsArray) {
  const documentsMap = new Map();
  documentsArray.forEach((doc) => {
    documentsMap.set(doc.path, doc);
  });
  return documentsMap;
}

/**
 * Convert concepts object to Map (matching production format)
 * @param {Object} conceptsObj - Concepts object from fixture
 * @returns {Object} Concepts data structure with Map
 */
export function prepareConceptData(conceptsObj) {
  const conceptsMap = new Map();

  Object.entries(conceptsObj.concepts).forEach(([key, concept]) => {
    conceptsMap.set(key, {
      ...concept,
      files: new Set(concept.files || []),
      sources: new Set(concept.sources || []),
    });
  });

  const frequencyMap = new Map(Object.entries(conceptsObj.frequency));
  const cooccurrenceMap = new Map();

  if (conceptsObj.cooccurrence) {
    Object.entries(conceptsObj.cooccurrence).forEach(([concept, related]) => {
      cooccurrenceMap.set(concept, new Map(Object.entries(related)));
    });
  }

  return {
    concepts: conceptsMap,
    frequency: frequencyMap,
    cooccurrence: cooccurrenceMap,
  };
}

/**
 * Load and prepare complete fixture set for testing
 * @param {string} type - Fixture type
 * @returns {Promise<Object>} Prepared fixture data ready for tests
 */
export async function loadPreparedFixtures(type) {
  const fixtures = await loadFixtureSet(type);

  return {
    documents: documentsArrayToMap(fixtures.documents.documents),
    conceptData: prepareConceptData(fixtures.concepts),
    analysis: fixtures.analysis,
    graphStats: fixtures.graphStats,
    sidebarData: fixtures.sidebar,
    exclusionRules: null, // Can be added if needed
  };
}
