/**
 * Performance measurement utilities for testing
 */

export class PerformanceTimer {
  constructor() {
    this.measurements = [];
  }

  async measure(name, fn, iterations = 1) {
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const sorted = times.sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    const measurement = {
      name,
      iterations,
      avg,
      min,
      max,
      median,
      total: times.reduce((a, b) => a + b, 0),
      times,
    };

    this.measurements.push(measurement);
    return measurement;
  }

  report() {
    if (this.measurements.length === 0) {
      console.log('No measurements recorded');
      return;
    }

    console.table(
      this.measurements.map((m) => ({
        'Name': m.name,
        'Avg (ms)': m.avg.toFixed(2),
        'Min (ms)': m.min.toFixed(2),
        'Max (ms)': m.max.toFixed(2),
        'Median (ms)': m.median.toFixed(2),
        'Iterations': m.iterations,
      })),
    );
  }

  getMeasurement(name) {
    return this.measurements.find((m) => m.name === name);
  }

  assert(name, maxMs, message) {
    const measurement = this.getMeasurement(name);
    if (!measurement) {
      throw new Error(`No measurement found for: ${name}`);
    }
    if (measurement.avg > maxMs) {
      throw new Error(
        `${message || 'Performance assertion failed'}: ${name} took ${measurement.avg.toFixed(
          2,
        )}ms (expected < ${maxMs}ms)`,
      );
    }
  }

  clear() {
    this.measurements = [];
  }
}

export function assertPerformance(actual, threshold, message = 'Performance threshold exceeded') {
  if (actual > threshold) {
    throw new Error(`${message}: ${actual.toFixed(2)}ms exceeds threshold of ${threshold}ms`);
  }
}

export async function measureMemory(fn) {
  // Force garbage collection if exposed
  if (global.gc) {
    global.gc();
  }

  const before = process.memoryUsage();
  await fn();

  // Force garbage collection if exposed
  if (global.gc) {
    global.gc();
  }

  const after = process.memoryUsage();

  return {
    heapUsedMB: (after.heapUsed - before.heapUsed) / 1024 / 1024,
    externalMB: (after.external - before.external) / 1024 / 1024,
    rssMB: (after.rss - before.rss) / 1024 / 1024,
    heapUsedBytes: after.heapUsed - before.heapUsed,
  };
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}
