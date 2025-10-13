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
 * SmartCache Unit Tests (TDD - RED Phase)
 * These tests are written FIRST and will FAIL until implementation is complete
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { SmartCache } from '../../../src/core/SmartCache.js';

describe('SmartCache', () => {
  let cache;

  beforeEach(() => {
    cache = new SmartCache({
      enabled: true,
      maxSize: 10 * 1024 * 1024, // 10MB
      ttl: 5000, // 5 seconds for testing
    });
  });

  afterEach(() => {
    if (cache) {
      cache.clear();
    }
  });

  describe('constructor', () => {
    test('SC-U-001: Should create instance with default configuration', () => {
      const defaultCache = new SmartCache();

      expect(defaultCache).toBeDefined();
      expect(defaultCache.enabled).toBe(true);
      expect(defaultCache.maxSize).toBeGreaterThan(0);
    });

    test('SC-U-002: Should accept custom configuration', () => {
      const customCache = new SmartCache({
        enabled: false,
        maxSize: 5 * 1024 * 1024,
        ttl: 10000,
      });

      expect(customCache.enabled).toBe(false);
      expect(customCache.maxSize).toBe(5 * 1024 * 1024);
      expect(customCache.ttl).toBe(10000);
    });
  });

  describe('LRU Cache Implementation', () => {
    test('SC-U-003: Should evict least recently used items when full', async () => {
      const smallCache = new SmartCache({
        enabled: true,
        maxSize: 800, // 800 bytes - enough for ~3 items
        ttl: 60000,
      });

      // Add some delay between operations to ensure distinct timestamps
      smallCache.set('item1', 'x'.repeat(250)); // ~250 bytes
      await new Promise((resolve) => setTimeout(resolve, 5));

      smallCache.set('item2', 'x'.repeat(250));
      await new Promise((resolve) => setTimeout(resolve, 5));

      smallCache.set('item3', 'x'.repeat(250));
      await new Promise((resolve) => setTimeout(resolve, 5));

      // Access item1 to make it most recently used
      const accessed = smallCache.get('item1');
      expect(accessed).not.toBeNull(); // Verify item1 exists before eviction test
      await new Promise((resolve) => setTimeout(resolve, 5));

      // Add item that forces eviction (item2 should be evicted as it's LRU)
      smallCache.set('item4', 'x'.repeat(250));

      // item1 should still exist (it was accessed most recently)
      const item1 = smallCache.get('item1');
      expect(item1).not.toBeNull();

      // Check stats for evictions
      const stats = smallCache.getStats();
      expect(stats.evictions).toBeGreaterThan(0);
    });

    test('SC-U-004: Should track access timestamps correctly', async () => {
      cache.set('item1', 'value1');
      await new Promise((resolve) => setTimeout(resolve, 10));

      cache.set('item2', 'value2');
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Access item1 to update timestamp
      cache.get('item1');

      // Get LRU info
      const lruInfo = cache.getLRUInfo();
      expect(lruInfo).toBeDefined();

      // item2 should be less recently used than item1
      expect(lruInfo.leastRecentlyUsed).toBe('item2');
    });

    test('SC-U-005: Should honor TTL expiration', async () => {
      const shortTTLCache = new SmartCache({
        enabled: true,
        ttl: 100, // 100ms
      });

      shortTTLCache.set('item1', 'value1');

      // Item should exist immediately
      expect(shortTTLCache.get('item1')).toBe('value1');

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Item should be expired and return null
      expect(shortTTLCache.get('item1')).toBeNull();
    });

    test('SC-U-006: Should calculate item size accurately', () => {
      const testObject = {
        name: 'test',
        data: { nested: 'value', array: [1, 2, 3] },
      };

      cache.set('complex', testObject);

      const size = cache.getItemSize('complex');
      expect(size).toBeGreaterThan(0);

      // Size should be close to serialized size
      const serializedSize = JSON.stringify(testObject).length;
      expect(size).toBeGreaterThanOrEqual(serializedSize * 0.9);
      expect(size).toBeLessThanOrEqual(serializedSize * 1.1);
    });

    test('SC-U-007: Should provide cache statistics', () => {
      cache.set('item1', 'value1');
      cache.get('item1'); // Hit
      cache.get('item2'); // Miss

      const stats = cache.getStats();

      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('itemCount');
      expect(stats).toHaveProperty('evictions');

      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe('50.00%');
    });

    test('SC-U-008: Should handle concurrent access safely', async () => {
      const promises = [];

      // Simulate concurrent reads and writes
      for (let i = 0; i < 100; i++) {
        promises.push(
          Promise.resolve().then(() => {
            cache.set(`key${i}`, `value${i}`);
            return cache.get(`key${i}`);
          }),
        );
      }

      const results = await Promise.all(promises);

      // All operations should complete successfully
      expect(results.length).toBe(100);

      // No data corruption
      const stats = cache.getStats();
      expect(stats.itemCount).toBeGreaterThan(0);
    });
  });

  describe('Predictive Prefetching', () => {
    test('SC-U-009: Should detect query patterns from history', async () => {
      const patternCache = new SmartCache({
        enabled: true,
        enablePrefetch: true,
        patternThreshold: 3, // Detect pattern after 3 repetitions
      });

      // Simulate repeated pattern: query A -> query B
      for (let i = 0; i < 5; i++) {
        await patternCache.recordQueryPattern('find_duplicate', 'gas');
        await patternCache.recordQueryPattern('suggest_consolidation', 'gas-docs');
      }

      const patterns = patternCache.getDetectedPatterns();

      expect(patterns.length).toBeGreaterThan(0);

      const pattern = patterns.find(
        (p) => p.sequence[0] === 'find_duplicate' && p.sequence[1] === 'suggest_consolidation',
      );

      expect(pattern).toBeDefined();
      expect(pattern.confidence).toBeGreaterThan(0.5);
    });

    test('SC-U-010: Should prefetch related data on pattern match', async () => {
      const patternCache = new SmartCache({
        enabled: true,
        enablePrefetch: true,
      });

      // Learn pattern
      await patternCache.learnPattern({
        trigger: 'find_duplicate',
        prefetchKeys: ['similarity_matrix', 'doc_concepts'],
      });

      // Trigger prefetch
      const prefetched = await patternCache.triggerPrefetch('find_duplicate');

      expect(prefetched).toBe(true);

      // Check that prefetch was attempted
      const prefetchStats = patternCache.getPrefetchStats();
      expect(prefetchStats.attemptedPrefetches).toBeGreaterThan(0);
    });

    test('SC-U-011: Should limit prefetch to prevent memory bloat', async () => {
      const patternCache = new SmartCache({
        enabled: true,
        enablePrefetch: true,
        maxPrefetchSize: 1024 * 1024, // 1MB prefetch budget
      });

      // Attempt to prefetch large dataset
      const largePrefetchData = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        data: 'x'.repeat(50000), // ~50KB each
      }));

      await patternCache.prefetchData('large_dataset', largePrefetchData);

      const stats = patternCache.getStats();

      // Total size should not exceed max size + prefetch budget
      expect(stats.totalBytes).toBeLessThanOrEqual(
        patternCache.maxSize + patternCache.maxPrefetchSize,
      );
    });

    test('SC-U-012: Should learn from query patterns over time', async () => {
      const learningCache = new SmartCache({
        enabled: true,
        enablePrefetch: true,
        patternLearningEnabled: true,
      });

      // Simulate query pattern 10 times
      for (let i = 0; i < 10; i++) {
        await learningCache.recordQuery('analyze_topic', { topic: 'orbit' });
        await new Promise((resolve) => setTimeout(resolve, 10));
        await learningCache.recordQuery('find_similar', { doc: 'orbit-intro.md' });
      }

      // Pattern should be learned
      const learnedPatterns = learningCache.getLearnedPatterns();
      expect(learnedPatterns.length).toBeGreaterThan(0);

      // Pattern should be persisted
      const persistedPatterns = await learningCache.persistPatterns();
      expect(persistedPatterns).toBe(true);
    });

    test('SC-U-013: Should handle failed prefetch gracefully', async () => {
      const faultTolerantCache = new SmartCache({
        enabled: true,
        enablePrefetch: true,
      });

      // Attempt to prefetch non-existent data
      const prefetchLoader = async (key) => {
        throw new Error(`Data not found: ${key}`);
      };

      faultTolerantCache.setPrefetchLoader(prefetchLoader);

      // Should not throw, should log warning
      await expect(faultTolerantCache.prefetch('missing_key')).resolves.not.toThrow();

      const stats = faultTolerantCache.getPrefetchStats();
      expect(stats.failedPrefetches).toBeGreaterThan(0);
    });

    test('SC-U-014: Should prioritize prefetch by probability', async () => {
      const priorityCache = new SmartCache({
        enabled: true,
        enablePrefetch: true,
      });

      // Add patterns with different probabilities
      await priorityCache.learnPattern({
        id: 'pattern_a',
        trigger: 'query_a',
        prefetchKeys: ['data_a'],
        probability: 0.9,
      });

      await priorityCache.learnPattern({
        id: 'pattern_b',
        trigger: 'query_a',
        prefetchKeys: ['data_b'],
        probability: 0.6,
      });

      // Trigger query
      await priorityCache.triggerPrefetch('query_a');

      const prefetchOrder = priorityCache.getLastPrefetchOrder();

      // pattern_a should be prefetched before pattern_b
      expect(prefetchOrder[0]).toBe('pattern_a');
      expect(prefetchOrder[1]).toBe('pattern_b');
    });
  });

  describe('Query Planning', () => {
    test('SC-U-015: Should analyze query and determine optimal strategy', async () => {
      const planningCache = new SmartCache({
        enabled: true,
        enableQueryPlanning: true,
      });

      const plan = await planningCache.analyzeQuery({
        tool: 'find_duplicate_content',
        params: { topic: 'orbit' },
      });

      expect(plan).toHaveProperty('strategy');
      expect(plan).toHaveProperty('estimatedTime');
      expect(plan).toHaveProperty('dataSources');

      expect(['METADATA_ONLY', 'CACHED', 'FULL_LOAD']).toContain(plan.strategy);
      expect(plan.estimatedTime).toBeGreaterThan(0);
    });

    test('SC-U-016: Should optimize for metadata-only queries', async () => {
      const planningCache = new SmartCache({
        enabled: true,
        enableQueryPlanning: true,
      });

      // Query that can be satisfied with metadata
      const plan = await planningCache.planQuery({
        type: 'list_concepts',
        params: {},
      });

      expect(plan.strategy).toBe('METADATA_ONLY');
      expect(plan.useFullGraph).toBe(false);
      expect(plan.estimatedTime).toBeLessThan(500); // < 500ms
    });

    test('SC-U-017: Should detect when full graph load is required', async () => {
      const planningCache = new SmartCache({
        enabled: true,
        enableQueryPlanning: true,
      });

      // Query requiring detailed traversal
      const plan = await planningCache.planQuery({
        type: 'explore_topic_graph',
        params: { concept: 'orbit', depth: 3 },
      });

      expect(plan.strategy).toBe('FULL_LOAD');
      expect(plan.useFullGraph).toBe(true);
      expect(plan.dataSources).toContain('graph-edges');
    });

    test('SC-U-018: Should estimate response time accurately', async () => {
      const planningCache = new SmartCache({
        enabled: true,
        enableQueryPlanning: true,
      });

      // Record some query history
      await planningCache.recordQueryTime('find_duplicate', 2500);
      await planningCache.recordQueryTime('find_duplicate', 2300);
      await planningCache.recordQueryTime('find_duplicate', 2600);

      // Estimate should be based on historical data
      const estimate = await planningCache.estimateQueryTime('find_duplicate');

      expect(estimate).toBeGreaterThan(2000);
      expect(estimate).toBeLessThan(3000);
      // Should be within 20% of actual average (2466ms)
      expect(Math.abs(estimate - 2466)).toBeLessThan(2466 * 0.2);
    });

    test('SC-U-019: Should suggest query optimizations', async () => {
      const optimizingCache = new SmartCache({
        enabled: true,
        enableQueryPlanning: true,
      });

      const suggestions = await optimizingCache.suggestOptimizations({
        tool: 'find_similar_documents',
        params: { doc: 'intro.md', limit: 100 },
      });

      expect(Array.isArray(suggestions)).toBe(true);

      if (suggestions.length > 0) {
        expect(suggestions[0]).toHaveProperty('optimization');
        expect(suggestions[0]).toHaveProperty('expectedSpeedup');
      }
    });
  });

  describe('Cache Warming', () => {
    test('SC-U-020: Should warm cache on initialization', async () => {
      const warmingCache = new SmartCache({
        enabled: true,
        warmOnInit: true,
        warmingData: {
          metadata: { nodes: 100, edges: 200 },
          topConcepts: ['arbitrum', 'gas', 'rollup'],
        },
      });

      await warmingCache.initialize();

      // Cache should be pre-populated
      expect(warmingCache.get('metadata')).toBeDefined();
      const stats = warmingCache.getStats();
      expect(stats.itemCount).toBeGreaterThan(0);
    });

    test('SC-U-021: Should load frequently accessed data first', async () => {
      const warmingCache = new SmartCache({
        enabled: true,
        warmOnInit: true,
      });

      const accessLog = [
        { key: 'concept_arbitrum', count: 50 },
        { key: 'concept_gas', count: 30 },
        { key: 'concept_rollup', count: 20 },
      ];

      await warmingCache.warmFromAccessLog(accessLog);

      // Most accessed items should be cached
      expect(warmingCache.has('concept_arbitrum')).toBe(true);
      expect(warmingCache.has('concept_gas')).toBe(true);
    });

    test('SC-U-022: Should not block operations during warming', async () => {
      const nonBlockingCache = new SmartCache({
        enabled: true,
        warmOnInit: true,
      });

      // Start warming (async)
      const warmingPromise = nonBlockingCache.startWarming();

      // Should still accept operations immediately
      nonBlockingCache.set('immediate_item', 'value');
      expect(nonBlockingCache.get('immediate_item')).toBe('value');

      // Wait for warming to complete
      await warmingPromise;
    });
  });

  describe('Edge Cases', () => {
    test('SC-E-001: Cache eviction during active query should not fail', async () => {
      const smallCache = new SmartCache({
        enabled: true,
        maxSize: 512, // Very small cache
      });

      // Fill cache
      for (let i = 0; i < 10; i++) {
        smallCache.set(`item${i}`, 'x'.repeat(100));
      }

      // Get item while cache is full (may trigger eviction)
      const value = smallCache.get('item0');

      // Should not throw error
      expect(() => smallCache.set('new_item', 'new_value')).not.toThrow();
    });

    test('SC-E-002: Same item requested by multiple queries should share load', async () => {
      const dedupCache = new SmartCache({
        enabled: true,
        enableRequestDeduplication: true,
      });

      let loadCount = 0;
      const expensiveLoader = async (key) => {
        loadCount++;
        await new Promise((resolve) => setTimeout(resolve, 100));
        return `loaded_${key}`;
      };

      dedupCache.setLoader(expensiveLoader);

      // Request same key multiple times concurrently
      const promises = Array.from({ length: 10 }, () => dedupCache.load('same_key'));

      const results = await Promise.all(promises);

      // All should get same result
      expect(results.every((r) => r === 'loaded_same_key')).toBe(true);

      // But loader should only be called once (deduplicated)
      expect(loadCount).toBe(1);
    });

    test('SC-E-003: Cache disabled should bypass all operations', () => {
      const disabledCache = new SmartCache({ enabled: false });

      disabledCache.set('item1', 'value1');
      expect(disabledCache.get('item1')).toBeNull();

      const stats = disabledCache.getStats();
      expect(stats.itemCount).toBe(0);
    });
  });
});
