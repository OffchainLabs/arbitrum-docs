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
 * Performance Monitoring Utility
 * Provides timing and memory measurement for performance optimization
 */

export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTimes = new Map();
  }

  /**
   * Start timing a specific operation
   * @param {string} operationName - Name of the operation to measure
   */
  start(operationName) {
    this.startTimes.set(operationName, {
      timestamp: Date.now(),
      cpuTime: process.cpuUsage(),
      memory: process.memoryUsage(),
    });
  }

  /**
   * End timing and record metrics for an operation
   * @param {string} operationName - Name of the operation to measure
   * @returns {Object} Performance metrics for this operation
   */
  end(operationName) {
    if (!this.startTimes.has(operationName)) {
      throw new Error(`No start time recorded for operation: ${operationName}`);
    }

    const startData = this.startTimes.get(operationName);
    const endTime = Date.now();
    const endCpuTime = process.cpuUsage(startData.cpuTime);
    const endMemory = process.memoryUsage();

    const metrics = {
      duration: endTime - startData.timestamp,
      cpuUser: Math.round(endCpuTime.user / 1000), // Convert to ms
      cpuSystem: Math.round(endCpuTime.system / 1000), // Convert to ms
      memoryStart: Math.round(startData.memory.heapUsed / 1024 / 1024), // Convert to MB
      memoryEnd: Math.round(endMemory.heapUsed / 1024 / 1024), // Convert to MB
      memoryDelta: Math.round((endMemory.heapUsed - startData.memory.heapUsed) / 1024 / 1024), // Convert to MB
    };

    // Store metrics
    if (!this.metrics.has(operationName)) {
      this.metrics.set(operationName, []);
    }
    this.metrics.get(operationName).push(metrics);

    // Clean up start time
    this.startTimes.delete(operationName);

    return metrics;
  }

  /**
   * Get all metrics for a specific operation
   * @param {string} operationName - Name of the operation
   * @returns {Array} Array of metrics
   */
  getMetrics(operationName) {
    return this.metrics.get(operationName) || [];
  }

  /**
   * Get aggregated statistics for an operation
   * @param {string} operationName - Name of the operation
   * @returns {Object} Aggregated statistics
   */
  getStats(operationName) {
    const metrics = this.getMetrics(operationName);
    if (metrics.length === 0) {
      return null;
    }

    const durations = metrics.map((m) => m.duration);
    const memoryDeltas = metrics.map((m) => m.memoryDelta);

    return {
      count: metrics.length,
      totalDuration: durations.reduce((a, b) => a + b, 0),
      avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / metrics.length),
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      avgMemoryDelta: Math.round(memoryDeltas.reduce((a, b) => a + b, 0) / metrics.length),
      totalMemoryDelta: memoryDeltas.reduce((a, b) => a + b, 0),
    };
  }

  /**
   * Get all aggregated statistics
   * @returns {Object} Object containing stats for all operations
   */
  getAllStats() {
    const allStats = {};
    for (const operationName of this.metrics.keys()) {
      allStats[operationName] = this.getStats(operationName);
    }
    return allStats;
  }

  /**
   * Format metrics as a readable string
   * @param {string} operationName - Name of the operation
   * @param {Object} metrics - Metrics object from end()
   * @returns {string} Formatted metrics string
   */
  formatMetrics(operationName, metrics) {
    return [
      `${operationName}:`,
      `  Duration: ${metrics.duration}ms`,
      `  CPU: ${metrics.cpuUser}ms user, ${metrics.cpuSystem}ms system`,
      `  Memory: ${metrics.memoryStart}MB → ${metrics.memoryEnd}MB (Δ ${
        metrics.memoryDelta > 0 ? '+' : ''
      }${metrics.memoryDelta}MB)`,
    ].join('\n');
  }

  /**
   * Generate a performance report
   * @returns {string} Formatted performance report
   */
  generateReport() {
    const report = ['Performance Report', '='.repeat(60), ''];
    const allStats = this.getAllStats();

    for (const [operationName, stats] of Object.entries(allStats)) {
      report.push(`${operationName}:`);
      report.push(`  Executions: ${stats.count}`);
      report.push(`  Total Time: ${stats.totalDuration}ms`);
      report.push(
        `  Avg Time: ${stats.avgDuration}ms (min: ${stats.minDuration}ms, max: ${stats.maxDuration}ms)`,
      );
      report.push(
        `  Avg Memory Δ: ${stats.avgMemoryDelta > 0 ? '+' : ''}${stats.avgMemoryDelta}MB`,
      );
      report.push('');
    }

    return report.join('\n');
  }

  /**
   * Clear all recorded metrics
   */
  clear() {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
