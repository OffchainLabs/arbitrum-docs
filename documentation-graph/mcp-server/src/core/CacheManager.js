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
 * CacheManager - In-memory caching for expensive computations
 *
 * Caches similarity calculations and analysis results with TTL support
 */

import { logger } from '../utils/logger.js';

export class CacheManager {
  constructor({ enabled = true, ttl = 300000 } = {}) {
    this.enabled = enabled;
    this.ttl = ttl; // Time to live in milliseconds
    this.cache = new Map();
    this.timestamps = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
    };
  }

  get(key) {
    if (!this.enabled) return null;

    if (!this.cache.has(key)) {
      this.stats.misses++;
      logger.logCacheMiss();
      return null;
    }

    // Check if expired
    const timestamp = this.timestamps.get(key);
    const now = Date.now();

    if (now - timestamp > this.ttl) {
      // Expired
      this.cache.delete(key);
      this.timestamps.delete(key);
      this.stats.misses++;
      logger.logCacheMiss();
      return null;
    }

    this.stats.hits++;
    logger.logCacheHit();
    return this.cache.get(key);
  }

  set(key, value) {
    if (!this.enabled) return;

    this.cache.set(key, value);
    this.timestamps.set(key, Date.now());
    this.stats.size = this.cache.size;
  }

  has(key) {
    if (!this.enabled) return false;
    return this.cache.has(key) && this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
    this.stats.size = 0;
    logger.info('Cache cleared');
  }

  getStats() {
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
        : 0;

    return {
      ...this.stats,
      hitRate: hitRate.toFixed(2) + '%',
    };
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    let removed = 0;

    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now - timestamp > this.ttl) {
        this.cache.delete(key);
        this.timestamps.delete(key);
        removed++;
      }
    }

    this.stats.size = this.cache.size;

    if (removed > 0) {
      logger.debug(`Cache cleanup: removed ${removed} expired entries`);
    }

    return removed;
  }

  // Start periodic cleanup
  startPeriodicCleanup(interval = 60000) {
    // Every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, interval);
  }

  // Stop periodic cleanup
  stopPeriodicCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
