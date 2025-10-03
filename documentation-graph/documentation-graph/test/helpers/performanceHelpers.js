/**
 * Performance Testing Helpers
 *
 * Utilities for measuring and asserting performance metrics
 */

/**
 * Measure execution time of async function
 */
export async function measureTime(fn) {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;

  return {
    result,
    duration,
    durationMs: duration,
    durationSeconds: duration / 1000,
  };
}

/**
 * Measure memory usage of async function
 */
export async function measureMemory(fn) {
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  const memBefore = process.memoryUsage();
  const result = await fn();

  if (global.gc) {
    global.gc();
  }

  const memAfter = process.memoryUsage();

  return {
    result,
    heapUsedBefore: memBefore.heapUsed,
    heapUsedAfter: memAfter.heapUsed,
    heapIncrease: memAfter.heapUsed - memBefore.heapUsed,
    heapIncreaseMB: (memAfter.heapUsed - memBefore.heapUsed) / (1024 * 1024),
    rss: memAfter.rss,
    rssMB: memAfter.rss / (1024 * 1024),
  };
}

/**
 * Measure both time and memory
 */
export async function measurePerformance(fn) {
  if (global.gc) {
    global.gc();
  }

  const memBefore = process.memoryUsage();
  const start = Date.now();

  const result = await fn();

  const duration = Date.now() - start;

  if (global.gc) {
    global.gc();
  }

  const memAfter = process.memoryUsage();

  return {
    result,
    duration,
    durationMs: duration,
    durationSeconds: duration / 1000,
    heapIncrease: memAfter.heapUsed - memBefore.heapUsed,
    heapIncreaseMB: (memAfter.heapUsed - memBefore.heapUsed) / (1024 * 1024),
    rssMB: memAfter.rss / (1024 * 1024),
  };
}

/**
 * Run benchmark multiple times and get statistics
 */
export async function benchmark(fn, iterations = 10) {
  const results = [];

  for (let i = 0; i < iterations; i++) {
    const { duration, heapIncreaseMB } = await measurePerformance(fn);
    results.push({ duration, heapIncreaseMB });
  }

  const durations = results.map((r) => r.duration);
  const memoryIncreases = results.map((r) => r.heapIncreaseMB);

  return {
    iterations,
    time: {
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: durations.reduce((a, b) => a + b, 0) / iterations,
      median: median(durations),
    },
    memory: {
      min: Math.min(...memoryIncreases),
      max: Math.max(...memoryIncreases),
      avg: memoryIncreases.reduce((a, b) => a + b, 0) / iterations,
      median: median(memoryIncreases),
    },
    results,
  };
}

/**
 * Calculate median
 */
function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Performance assertion helper
 */
export function assertPerformanceThreshold(metrics, thresholds) {
  if (thresholds.maxDuration !== undefined) {
    expect(metrics.duration).toBeLessThanOrEqual(thresholds.maxDuration);
  }

  if (thresholds.maxMemoryMB !== undefined) {
    expect(metrics.heapIncreaseMB).toBeLessThanOrEqual(thresholds.maxMemoryMB);
  }

  if (thresholds.maxRssMB !== undefined) {
    expect(metrics.rssMB).toBeLessThanOrEqual(thresholds.maxRssMB);
  }
}

/**
 * Create performance report
 */
export function createPerformanceReport(benchmarks) {
  const report = {
    timestamp: new Date().toISOString(),
    benchmarks: {},
  };

  for (const [name, results] of Object.entries(benchmarks)) {
    report.benchmarks[name] = {
      iterations: results.iterations,
      time: {
        min: `${results.time.min}ms`,
        max: `${results.time.max}ms`,
        avg: `${results.time.avg.toFixed(2)}ms`,
        median: `${results.time.median}ms`,
      },
      memory: {
        min: `${results.memory.min.toFixed(2)}MB`,
        max: `${results.memory.max.toFixed(2)}MB`,
        avg: `${results.memory.avg.toFixed(2)}MB`,
        median: `${results.memory.median.toFixed(2)}MB`,
      },
    };
  }

  return report;
}

/**
 * Memory leak detector
 */
export class MemoryLeakDetector {
  constructor(sampleCount = 10) {
    this.sampleCount = sampleCount;
    this.samples = [];
  }

  async sample(fn) {
    const { heapIncreaseMB } = await measureMemory(fn);
    this.samples.push(heapIncreaseMB);

    if (this.samples.length > this.sampleCount) {
      this.samples.shift();
    }
  }

  hasLeak(threshold = 1.0) {
    if (this.samples.length < this.sampleCount) {
      return false;
    }

    // Check if memory consistently increases
    const trend = this.calculateTrend();
    return trend > threshold; // MB per iteration
  }

  calculateTrend() {
    if (this.samples.length < 2) {
      return 0;
    }

    const firstHalf = this.samples.slice(0, Math.floor(this.samples.length / 2));
    const secondHalf = this.samples.slice(Math.floor(this.samples.length / 2));

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    return avgSecond - avgFirst;
  }

  reset() {
    this.samples = [];
  }
}

/**
 * Throttle detector (for rate limiting tests)
 */
export class ThrottleDetector {
  constructor() {
    this.callTimes = [];
  }

  recordCall() {
    this.callTimes.push(Date.now());
  }

  getCallsInWindow(windowMs) {
    const now = Date.now();
    const windowStart = now - windowMs;
    return this.callTimes.filter((time) => time >= windowStart).length;
  }

  getRatePerSecond() {
    if (this.callTimes.length < 2) {
      return 0;
    }

    const duration = this.callTimes[this.callTimes.length - 1] - this.callTimes[0];
    return (this.callTimes.length / duration) * 1000;
  }

  reset() {
    this.callTimes = [];
  }
}

/**
 * Wait with timeout
 */
export async function waitWithTimeout(fn, timeoutMs) {
  return Promise.race([
    fn(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs),
    ),
  ]);
}

/**
 * Retry with backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 100) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = initialDelay * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export default {
  measureTime,
  measureMemory,
  measurePerformance,
  benchmark,
  assertPerformanceThreshold,
  createPerformanceReport,
  MemoryLeakDetector,
  ThrottleDetector,
  waitWithTimeout,
  retryWithBackoff,
};
