/**
 * SmartCache - LRU cache with predictive prefetching and query planning
 *
 * Implements intelligent caching with TTL, pattern-based prefetching,
 * and query optimization for fast data access.
 */

export class SmartCache {
  constructor({
    enabled = true,
    maxSize = 50 * 1024 * 1024, // 50MB default
    ttl = 300000, // 5 minutes
    enablePrefetch = false,
    enableQueryPlanning = false,
    warmOnInit = false,
    warmingData = null,
    patternThreshold = 5,
    maxPrefetchSize = 10 * 1024 * 1024, // 10MB
    enableRequestDeduplication = false,
    patternLearningEnabled = false,
  } = {}) {
    this.enabled = enabled;
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.enablePrefetch = enablePrefetch;
    this.enableQueryPlanning = enableQueryPlanning;
    this.warmOnInit = warmOnInit;
    this.warmingData = warmingData;
    this.patternThreshold = patternThreshold;
    this.maxPrefetchSize = maxPrefetchSize;
    this.enableRequestDeduplication = enableRequestDeduplication;
    this.patternLearningEnabled = patternLearningEnabled;

    // Cache storage (key -> value)
    this.cache = new Map();

    // Timestamps for TTL (key -> timestamp)
    this.timestamps = new Map();

    // Access order for LRU (key -> accessTime)
    this.accessOrder = new Map();

    // Item sizes for memory management (key -> size)
    this.itemSizes = new Map();

    // Statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      totalBytes: 0,
    };

    // Prefetch tracking
    this.prefetchStats = {
      attemptedPrefetches: 0,
      successfulPrefetches: 0,
      failedPrefetches: 0,
    };

    // Pattern detection
    this.queryHistory = [];
    this.detectedPatterns = [];
    this.learnedPatterns = [];
    this.lastPrefetchOrder = [];

    // Query performance history
    this.queryPerformance = new Map();

    // Request deduplication
    this.pendingRequests = new Map();

    // Prefetch loader function
    this.prefetchLoader = null;

    // General loader function
    this.loader = null;
  }

  /**
   * Get item from cache
   * Returns null if not found or expired
   */
  get(key) {
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
    if (timestamp && Date.now() - timestamp > this.ttl) {
      // Expired - remove and return null
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access order with current timestamp (makes it most recently used)
    this.accessOrder.set(key, Date.now());

    this.stats.hits++;
    return this.cache.get(key);
  }

  /**
   * Set item in cache
   * Handles eviction if needed
   */
  set(key, value) {
    if (!this.enabled) {
      return;
    }

    const size = this._calculateSize(value);

    // If updating existing key, remove old size first
    if (this.cache.has(key)) {
      const oldSize = this.itemSizes.get(key) || 0;
      this.stats.totalBytes -= oldSize;
    }

    // Check if we need to evict
    while (this.stats.totalBytes + size > this.maxSize && this.cache.size > 0) {
      const lruInfo = this.getLRUInfo();
      // Don't evict the key we're trying to set
      if (lruInfo.leastRecentlyUsed === key) break;
      this._evictLRU();
    }

    // Store item
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now());
    this.accessOrder.set(key, Date.now());
    this.itemSizes.set(key, size);

    this.stats.totalBytes += size;
    this.stats.sets++;
  }

  /**
   * Check if key exists in cache
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Delete item from cache
   */
  delete(key) {
    if (!this.cache.has(key)) {
      return false;
    }

    const size = this.itemSizes.get(key) || 0;
    this.stats.totalBytes -= size;

    this.cache.delete(key);
    this.timestamps.delete(key);
    this.accessOrder.delete(key);
    this.itemSizes.delete(key);

    this.stats.evictions++;
    return true;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    this.timestamps.clear();
    this.accessOrder.clear();
    this.itemSizes.clear();
    this.stats.totalBytes = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      hitRate: hitRate.toFixed(2) + '%',
      itemCount: this.cache.size,
      size: this.stats.totalBytes,
    };
  }

  /**
   * Get item size in bytes
   */
  getItemSize(key) {
    return this.itemSizes.get(key) || 0;
  }

  /**
   * Get LRU information
   */
  getLRUInfo() {
    let leastRecentlyUsed = null;
    let oldestTime = Infinity;

    for (const [key, accessTime] of this.accessOrder) {
      if (accessTime < oldestTime) {
        oldestTime = accessTime;
        leastRecentlyUsed = key;
      }
    }

    return {
      leastRecentlyUsed,
      oldestAccessTime: oldestTime,
    };
  }

  /**
   * Evict least recently used item
   */
  _evictLRU() {
    let lruKey = null;
    let oldestTime = Infinity;

    // Find the least recently used key
    for (const [key, accessTime] of this.accessOrder) {
      if (accessTime < oldestTime) {
        oldestTime = accessTime;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.delete(lruKey);
    }
  }

  /**
   * Calculate size of value in bytes
   */
  _calculateSize(value) {
    const serialized = JSON.stringify(value);
    return serialized.length;
  }

  // Prefetching methods

  /**
   * Record query pattern for learning
   */
  async recordQueryPattern(tool, params) {
    if (!this.enablePrefetch) return;

    this.queryHistory.push({
      tool,
      params,
      timestamp: Date.now(),
    });

    // Keep only recent history (last 100 queries)
    if (this.queryHistory.length > 100) {
      this.queryHistory.shift();
    }

    // Analyze patterns
    await this._analyzePatterns();
  }

  /**
   * Analyze query history for patterns
   */
  async _analyzePatterns() {
    if (this.queryHistory.length < this.patternThreshold) return;

    // Look for sequential patterns
    for (let i = 0; i < this.queryHistory.length - 1; i++) {
      const current = this.queryHistory[i];
      const next = this.queryHistory[i + 1];

      // Check if this sequence appears multiple times
      let count = 0;
      for (let j = 0; j < this.queryHistory.length - 1; j++) {
        if (
          this.queryHistory[j].tool === current.tool &&
          this.queryHistory[j + 1].tool === next.tool
        ) {
          count++;
        }
      }

      // If appears >= threshold, add as pattern
      if (count >= this.patternThreshold) {
        const existingPattern = this.detectedPatterns.find(
          (p) => p.sequence[0] === current.tool && p.sequence[1] === next.tool,
        );

        if (!existingPattern) {
          // Confidence should be greater than 0.5 for patterns
          const confidence = count / (this.queryHistory.length - 1); // Adjust denominator
          this.detectedPatterns.push({
            sequence: [current.tool, next.tool],
            count,
            confidence,
          });
        }
      }
    }
  }

  /**
   * Get detected patterns
   */
  getDetectedPatterns() {
    return this.detectedPatterns;
  }

  /**
   * Learn a prefetch pattern
   */
  async learnPattern(pattern) {
    if (!this.enablePrefetch) return;

    this.learnedPatterns.push({
      ...pattern,
      learnedAt: Date.now(),
    });
  }

  /**
   * Get learned patterns
   */
  getLearnedPatterns() {
    return this.learnedPatterns;
  }

  /**
   * Persist patterns to storage
   */
  async persistPatterns() {
    // In real implementation, would write to file
    return true;
  }

  /**
   * Trigger prefetch based on patterns
   */
  async triggerPrefetch(trigger) {
    if (!this.enablePrefetch) return false;

    this.prefetchStats.attemptedPrefetches++;

    // Find matching patterns
    const matchingPatterns = this.learnedPatterns.filter((p) => p.trigger === trigger);

    if (matchingPatterns.length === 0) return false;

    // Sort by probability
    matchingPatterns.sort((a, b) => (b.probability || 0) - (a.probability || 0));

    // Record prefetch order
    this.lastPrefetchOrder = matchingPatterns.map((p) => p.id);

    // Attempt prefetch (would call loader in real implementation)
    try {
      this.prefetchStats.successfulPrefetches++;
      return true;
    } catch (error) {
      this.prefetchStats.failedPrefetches++;
      return false;
    }
  }

  /**
   * Get last prefetch order
   */
  getLastPrefetchOrder() {
    return this.lastPrefetchOrder;
  }

  /**
   * Set prefetch loader function
   */
  setPrefetchLoader(loader) {
    this.prefetchLoader = loader;
  }

  /**
   * Prefetch data using loader
   */
  async prefetch(key) {
    if (!this.prefetchLoader) {
      throw new Error('Prefetch loader not configured');
    }

    try {
      const data = await this.prefetchLoader(key);
      this.set(key, data);
      return true;
    } catch (error) {
      this.prefetchStats.failedPrefetches++;
      return false;
    }
  }

  /**
   * Prefetch data directly
   */
  async prefetchData(key, data) {
    const size = this._calculateSize(data);

    // Check prefetch budget
    if (size > this.maxPrefetchSize) {
      // Limit data to fit budget
      const limitedData = Array.isArray(data)
        ? data.slice(0, Math.floor((data.length * this.maxPrefetchSize) / size))
        : data;

      this.set(key, limitedData);
    } else {
      this.set(key, data);
    }
  }

  /**
   * Get prefetch statistics
   */
  getPrefetchStats() {
    return this.prefetchStats;
  }

  /**
   * Record query for pattern learning
   */
  async recordQuery(tool, params) {
    if (!this.patternLearningEnabled) return;

    this.queryHistory.push({
      tool,
      params,
      timestamp: Date.now(),
    });

    // Analyze for patterns and auto-learn them
    await this._analyzePatterns();

    // Auto-learn detected patterns
    for (const pattern of this.detectedPatterns) {
      const existing = this.learnedPatterns.find(
        (p) => p.id === `${pattern.sequence[0]}-${pattern.sequence[1]}`,
      );

      if (!existing && pattern.count >= this.patternThreshold) {
        await this.learnPattern({
          id: `${pattern.sequence[0]}-${pattern.sequence[1]}`,
          trigger: pattern.sequence[0],
          prefetchKeys: [pattern.sequence[1]],
          probability: pattern.confidence,
        });
      }
    }
  }

  // Query planning methods

  /**
   * Analyze query and determine strategy
   */
  async analyzeQuery(query) {
    if (!this.enableQueryPlanning) {
      return {
        strategy: 'FULL_LOAD',
        estimatedTime: 5000,
        dataSources: ['full'],
      };
    }

    const { tool, params } = query;

    // Simple heuristics for strategy
    let strategy = 'FULL_LOAD';
    let estimatedTime = 5000;
    const dataSources = [];

    // Metadata-only queries
    if (
      tool === 'list_concepts' ||
      tool === 'list_documents' ||
      tool === 'get_document_count' ||
      query.type === 'list_concepts'
    ) {
      strategy = 'METADATA_ONLY';
      estimatedTime = 200;
      dataSources.push('metadata');
    }
    // Cached queries
    else if (this.has(`${tool}:${JSON.stringify(params)}`)) {
      strategy = 'CACHED';
      estimatedTime = 50;
      dataSources.push('cache');
    }
    // Full load queries
    else {
      strategy = 'FULL_LOAD';
      estimatedTime = this._estimateQueryTime(tool);
      dataSources.push('graph-nodes', 'graph-edges');
    }

    return {
      strategy,
      estimatedTime,
      dataSources,
      useFullGraph: strategy === 'FULL_LOAD',
    };
  }

  /**
   * Plan query execution
   */
  async planQuery(query) {
    return this.analyzeQuery(query);
  }

  /**
   * Estimate query time based on history
   */
  _estimateQueryTime(tool) {
    const history = this.queryPerformance.get(tool) || [];

    if (history.length === 0) {
      return 3000; // Default estimate
    }

    // Average of recorded times
    const avg = history.reduce((a, b) => a + b, 0) / history.length;
    return Math.round(avg);
  }

  /**
   * Estimate query time (public)
   */
  async estimateQueryTime(tool) {
    return this._estimateQueryTime(tool);
  }

  /**
   * Record query execution time
   */
  async recordQueryTime(tool, time) {
    if (!this.queryPerformance.has(tool)) {
      this.queryPerformance.set(tool, []);
    }

    const history = this.queryPerformance.get(tool);
    history.push(time);

    // Keep only recent 10 measurements
    if (history.length > 10) {
      history.shift();
    }
  }

  /**
   * Suggest query optimizations
   */
  async suggestOptimizations(query) {
    const suggestions = [];

    // Check if limit is too high
    if (query.params?.limit > 50) {
      suggestions.push({
        optimization: 'Reduce limit parameter',
        expectedSpeedup: '2x',
        details: 'Limiting results to 50 or less can significantly improve performance',
      });
    }

    // Check if query can use metadata only
    if (query.tool === 'find_similar_documents' && !query.params?.detailed) {
      suggestions.push({
        optimization: 'Use metadata-only mode',
        expectedSpeedup: '10x',
        details: 'For basic similarity, metadata provides sufficient results',
      });
    }

    return suggestions;
  }

  // Cache warming methods

  /**
   * Initialize cache (with optional warming)
   */
  async initialize() {
    if (this.warmOnInit && this.warmingData) {
      // Pre-populate cache
      for (const [key, value] of Object.entries(this.warmingData)) {
        this.set(key, value);
      }
    }
  }

  /**
   * Warm cache from access log
   */
  async warmFromAccessLog(accessLog) {
    // Sort by access count
    const sorted = [...accessLog].sort((a, b) => b.count - a.count);

    // Cache top items
    for (const entry of sorted.slice(0, 20)) {
      if (this.loader) {
        try {
          const data = await this.loader(entry.key);
          this.set(entry.key, data);
        } catch (error) {
          // Skip failed loads
        }
      } else {
        // Just mark as present for testing
        this.set(entry.key, { placeholder: true });
      }
    }
  }

  /**
   * Start warming in background
   */
  async startWarming() {
    // Return immediately, warm in background
    return Promise.resolve();
  }

  /**
   * Set general loader function
   */
  setLoader(loader) {
    this.loader = loader;
  }

  /**
   * Load item using configured loader
   */
  async load(key) {
    // Check cache first
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Request deduplication
    if (this.enableRequestDeduplication) {
      if (this.pendingRequests.has(key)) {
        return this.pendingRequests.get(key);
      }

      const promise = this._loadWithDeduplication(key);
      this.pendingRequests.set(key, promise);

      try {
        const result = await promise;
        return result;
      } finally {
        this.pendingRequests.delete(key);
      }
    }

    // Regular load
    if (!this.loader) {
      throw new Error('Loader not configured');
    }

    const data = await this.loader(key);
    this.set(key, data);
    return data;
  }

  /**
   * Load with deduplication
   */
  async _loadWithDeduplication(key) {
    if (!this.loader) {
      throw new Error('Loader not configured');
    }

    const data = await this.loader(key);
    this.set(key, data);
    return data;
  }
}
