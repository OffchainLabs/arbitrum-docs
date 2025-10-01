/**
 * Shared Assertion Helpers
 *
 * Reusable assertion functions for common test patterns
 */

/**
 * Assert that a string contains a content type with count
 */
export function assertContentTypeCount(result, contentType, count) {
  const regex = new RegExp(`${contentType}.*${count}`, 'i');
  if (!regex.test(result)) {
    throw new Error(`Expected result to contain "${contentType}" with count ${count}`);
  }
}

/**
 * Assert that a string contains a percentage
 */
export function assertContainsPercentage(text, expectedValue) {
  const regex = new RegExp(`${expectedValue}%|${expectedValue}\\.0%`);
  if (!regex.test(text)) {
    throw new Error(`Expected text to contain percentage ${expectedValue}%`);
  }
}

/**
 * Assert that a result contains all specified items
 */
export function assertContainsAll(result, items) {
  const missing = items.filter((item) => !result.includes(item));
  if (missing.length > 0) {
    throw new Error(`Missing items in result: ${missing.join(', ')}`);
  }
}

/**
 * Assert that a result does NOT contain any specified items
 */
export function assertContainsNone(result, items) {
  const found = items.filter((item) => result.includes(item));
  if (found.length > 0) {
    throw new Error(`Result should not contain: ${found.join(', ')}`);
  }
}

/**
 * Assert that a Map has a specific size
 */
export function assertMapSize(map, expectedSize) {
  if (map.size !== expectedSize) {
    throw new Error(`Expected Map size ${expectedSize}, got ${map.size}`);
  }
}

/**
 * Assert that an array has items matching a predicate
 */
export function assertHasItemWhere(array, predicate, description = 'item') {
  if (!array.some(predicate)) {
    throw new Error(`Expected array to have ${description}`);
  }
}

/**
 * Assert that a concept data structure is valid
 */
export function assertValidConceptData(conceptData) {
  if (!conceptData.concepts || !(conceptData.concepts instanceof Map)) {
    throw new Error('conceptData.concepts must be a Map');
  }
  if (!conceptData.frequency || !(conceptData.frequency instanceof Map)) {
    throw new Error('conceptData.frequency must be a Map');
  }
  if (!conceptData.cooccurrence || !(conceptData.cooccurrence instanceof Map)) {
    throw new Error('conceptData.cooccurrence must be a Map');
  }
}

/**
 * Assert that a documents Map contains valid document objects
 */
export function assertValidDocuments(documents) {
  if (!(documents instanceof Map)) {
    throw new Error('documents must be a Map');
  }

  documents.forEach((doc, path) => {
    if (!doc.path) {
      throw new Error(`Document at ${path} missing path property`);
    }
    if (typeof doc.wordCount !== 'number') {
      throw new Error(`Document at ${path} has invalid wordCount`);
    }
  });
}

/**
 * Assert that a result contains a specific pattern with capture groups
 */
export function assertMatchesPattern(result, pattern, description = 'pattern') {
  const match = result.match(pattern);
  if (!match) {
    throw new Error(`Expected result to match ${description}: ${pattern}`);
  }
  return match;
}

/**
 * Assert that a number is within a range
 */
export function assertInRange(value, min, max, label = 'value') {
  if (value < min || value > max) {
    throw new Error(`${label} ${value} not in range [${min}, ${max}]`);
  }
}

/**
 * Assert that an array is sorted by a property
 */
export function assertSortedBy(array, propertyOrFn, order = 'desc') {
  for (let i = 0; i < array.length - 1; i++) {
    const current =
      typeof propertyOrFn === 'function' ? propertyOrFn(array[i]) : array[i][propertyOrFn];
    const next =
      typeof propertyOrFn === 'function' ? propertyOrFn(array[i + 1]) : array[i + 1][propertyOrFn];

    if (order === 'desc' && current < next) {
      throw new Error(`Array not sorted descending at index ${i}: ${current} < ${next}`);
    }
    if (order === 'asc' && current > next) {
      throw new Error(`Array not sorted ascending at index ${i}: ${current} > ${next}`);
    }
  }
}
