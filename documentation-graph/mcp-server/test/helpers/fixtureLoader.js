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
