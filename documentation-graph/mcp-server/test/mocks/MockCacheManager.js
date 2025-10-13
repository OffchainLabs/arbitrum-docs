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
 * Mock CacheManager with tracking capabilities for testing
 */
export class MockCacheManager {
  constructor({ enabled = true, ttl = 300000 } = {}) {
    this.enabled = enabled;
    this.ttl = ttl;
    this.cache = new Map();
    this.timestamps = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      size: 0,
      evictions: 0,
    };

    // For testing - track all method calls
    this.callLog = [];
  }

  get(key) {
    this.callLog.push({ method: 'get', key, timestamp: Date.now() });

    if (!this.enabled) {
      this.stats.misses++;
      return null;
    }

    if (!this.cache.has(key)) {
      this.stats.misses++;
      return null;
    }

    // Check TTL
    const timestamp = this.timestamps.get(key);
    if (Date.now() - timestamp > this.ttl) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      return null;
    }

    this.stats.hits++;
    return this.cache.get(key);
  }

  set(key, value) {
    this.callLog.push({ method: 'set', key, timestamp: Date.now() });

    if (!this.enabled) return;

    this.cache.set(key, value);
    this.timestamps.set(key, Date.now());
    this.stats.sets++;
    this.stats.size = this.cache.size;
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    this.callLog.push({ method: 'delete', key, timestamp: Date.now() });

    const deleted = this.cache.delete(key);
    this.timestamps.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
      this.stats.evictions++;
    }
    return deleted;
  }

  clear() {
    this.callLog.push({ method: 'clear', timestamp: Date.now() });

    this.cache.clear();
    this.timestamps.clear();
    this.stats.size = 0;
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      hitRate: hitRate.toFixed(2) + '%',
    };
  }

  // Test helper methods
  resetCallLog() {
    this.callLog = [];
  }

  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      size: 0,
      evictions: 0,
    };
  }

  // Simulate TTL expiration for testing
  expireKey(key) {
    if (this.timestamps.has(key)) {
      this.timestamps.set(key, Date.now() - this.ttl - 1000);
    }
  }
}
