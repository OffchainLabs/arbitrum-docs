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
 * Custom Assertion Helpers
 *
 * Domain-specific assertions for documentation graph testing
 */

/**
 * Assert graph structure is valid
 */
export function assertValidGraph(graph) {
  expect(graph).toBeDefined();
  expect(graph).toHaveProperty('nodes');
  expect(graph).toHaveProperty('edges');
  expect(graph).toHaveProperty('metadata');
  expect(Array.isArray(graph.nodes)).toBe(true);
  expect(Array.isArray(graph.edges)).toBe(true);
}

/**
 * Assert node is valid
 */
export function assertValidNode(node, expectedType = null) {
  expect(node).toBeDefined();
  expect(node).toHaveProperty('id');
  expect(node).toHaveProperty('type');
  expect(node).toHaveProperty('label');

  if (expectedType) {
    expect(node.type).toBe(expectedType);
  }
}

/**
 * Assert edge is valid
 */
export function assertValidEdge(edge, expectedType = null) {
  expect(edge).toBeDefined();
  expect(edge).toHaveProperty('id');
  expect(edge).toHaveProperty('source');
  expect(edge).toHaveProperty('target');
  expect(edge).toHaveProperty('type');

  if (expectedType) {
    expect(edge.type).toBe(expectedType);
  }
}

/**
 * Assert document structure is valid
 */
export function assertValidDocument(doc) {
  expect(doc).toBeDefined();
  expect(doc).toHaveProperty('path');
  expect(doc).toHaveProperty('content');
  expect(doc).toHaveProperty('frontmatter');
  expect(doc).toHaveProperty('headings');
  expect(doc).toHaveProperty('links');
}

/**
 * Assert concept is valid
 */
export function assertValidConcept(concept) {
  expect(concept).toBeDefined();
  expect(concept).toHaveProperty('concept');
  expect(concept).toHaveProperty('frequency');
  expect(concept).toHaveProperty('fileCount');
  expect(concept.frequency).toBeGreaterThan(0);
  expect(concept.fileCount).toBeGreaterThan(0);
}

/**
 * Assert analysis result is valid
 */
export function assertValidAnalysis(analysis) {
  expect(analysis).toBeDefined();
  expect(analysis).toHaveProperty('metadata');
  expect(analysis).toHaveProperty('basic');
  expect(analysis).toHaveProperty('centrality');

  // Basic stats
  expect(analysis.basic).toHaveProperty('totalNodes');
  expect(analysis.basic).toHaveProperty('totalEdges');
  expect(analysis.basic).toHaveProperty('density');
  expect(analysis.basic).toHaveProperty('avgDegree');

  // Centrality
  expect(analysis.centrality).toHaveProperty('degree');
  expect(analysis.centrality).toHaveProperty('betweenness');
  expect(analysis.centrality).toHaveProperty('closeness');
}

/**
 * Assert validation result structure
 */
export function assertValidationResult(result, shouldBeValid = true) {
  expect(result).toBeDefined();
  expect(result).toHaveProperty('valid');
  expect(result).toHaveProperty('errors');
  expect(typeof result.valid).toBe('boolean');
  expect(Array.isArray(result.errors)).toBe(true);

  if (shouldBeValid) {
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  } else {
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  }
}

/**
 * Assert markdown contains table
 */
export function assertMarkdownTable(markdown, expectedHeaders = null) {
  expect(markdown).toContain('|');
  expect(markdown).toMatch(/\|[\s-:]+\|/); // Separator line

  if (expectedHeaders) {
    expectedHeaders.forEach((header) => {
      expect(markdown).toContain(header);
    });
  }
}

/**
 * Assert markdown contains heading
 */
export function assertMarkdownHeading(markdown, heading, level = 2) {
  const prefix = '#'.repeat(level);
  expect(markdown).toContain(`${prefix} ${heading}`);
}

/**
 * Assert markdown contains list
 */
export function assertMarkdownList(markdown, items) {
  items.forEach((item) => {
    expect(markdown).toMatch(new RegExp(`[-*]\\s+.*${item}`));
  });
}

/**
 * Assert Cytoscape element structure
 */
export function assertCytoscapeElement(element, type = 'node') {
  expect(element).toBeDefined();
  expect(element).toHaveProperty('data');
  expect(element.data).toHaveProperty('id');

  if (type === 'edge') {
    expect(element.data).toHaveProperty('source');
    expect(element.data).toHaveProperty('target');
  }
}

/**
 * Assert visualization data structure
 */
export function assertVisualizationData(vizData) {
  expect(vizData).toBeDefined();
  expect(vizData).toHaveProperty('metadata');
  expect(vizData).toHaveProperty('elements');
  expect(vizData).toHaveProperty('styles');
  expect(vizData).toHaveProperty('layout');

  expect(vizData.elements).toHaveProperty('nodes');
  expect(vizData.elements).toHaveProperty('edges');
  expect(Array.isArray(vizData.elements.nodes)).toBe(true);
  expect(Array.isArray(vizData.elements.edges)).toBe(true);
  expect(Array.isArray(vizData.styles)).toBe(true);
}

/**
 * Assert schema structure
 */
export function assertValidSchema(schema) {
  expect(schema).toBeDefined();
  expect(schema).toHaveProperty('$schema');
  expect(schema).toHaveProperty('$id');
  expect(schema).toHaveProperty('type');
  expect(schema.$schema).toContain('draft-07');
}

/**
 * Assert file size
 */
export function assertFileSize(filePath, maxBytes, fs) {
  const stats = fs.statSync(filePath);
  expect(stats.size).toBeLessThanOrEqual(maxBytes);
}

/**
 * Assert performance metrics
 */
export function assertPerformance(duration, maxDuration, operation = 'Operation') {
  expect(duration).toBeLessThanOrEqual(maxDuration);
  if (duration > maxDuration * 0.8) {
    console.warn(`⚠️  ${operation} took ${duration}ms (threshold: ${maxDuration}ms)`);
  }
}

/**
 * Assert memory usage
 */
export function assertMemoryUsage(currentHeap, maxHeapMB) {
  const heapMB = currentHeap / (1024 * 1024);
  expect(heapMB).toBeLessThanOrEqual(maxHeapMB);
  if (heapMB > maxHeapMB * 0.8) {
    console.warn(`⚠️  Memory usage: ${heapMB.toFixed(2)}MB (threshold: ${maxHeapMB}MB)`);
  }
}

/**
 * Assert error message contains expected text
 */
export function assertErrorMessage(error, expectedText) {
  expect(error).toBeInstanceOf(Error);
  expect(error.message).toContain(expectedText);
}

/**
 * Assert array contains items matching predicate
 */
export function assertContainsMatching(array, predicate, count = 1) {
  const matches = array.filter(predicate);
  expect(matches.length).toBeGreaterThanOrEqual(count);
}

/**
 * Assert object deep equals (ignoring specific fields)
 */
export function assertDeepEqualExcluding(actual, expected, excludeFields = []) {
  const cleanObject = (obj) => {
    const cleaned = { ...obj };
    excludeFields.forEach((field) => {
      delete cleaned[field];
    });
    return cleaned;
  };

  expect(cleanObject(actual)).toEqual(cleanObject(expected));
}

/**
 * Assert async function throws specific error
 */
export async function assertAsyncThrows(asyncFn, errorMessage = null) {
  let error = null;

  try {
    await asyncFn();
  } catch (e) {
    error = e;
  }

  expect(error).not.toBeNull();

  if (errorMessage) {
    expect(error.message).toContain(errorMessage);
  }
}

/**
 * Assert JSON is valid
 */
export function assertValidJSON(jsonString) {
  expect(() => JSON.parse(jsonString)).not.toThrow();
  const parsed = JSON.parse(jsonString);
  expect(parsed).toBeDefined();
  return parsed;
}

/**
 * Assert array is sorted
 */
export function assertArraySorted(array, compareFn = null, order = 'asc') {
  const sorted = [...array].sort(compareFn);
  if (order === 'desc') {
    sorted.reverse();
  }
  expect(array).toEqual(sorted);
}

export default {
  assertValidGraph,
  assertValidNode,
  assertValidEdge,
  assertValidDocument,
  assertValidConcept,
  assertValidAnalysis,
  assertValidationResult,
  assertMarkdownTable,
  assertMarkdownHeading,
  assertMarkdownList,
  assertCytoscapeElement,
  assertVisualizationData,
  assertValidSchema,
  assertFileSize,
  assertPerformance,
  assertMemoryUsage,
  assertErrorMessage,
  assertContainsMatching,
  assertDeepEqualExcluding,
  assertAsyncThrows,
  assertValidJSON,
  assertArraySorted,
};
