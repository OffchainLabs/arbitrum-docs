#!/usr/bin/env node

/**
 * Performance Profiling Script for Documentation Graph Builder
 *
 * This script profiles CPU, memory, and I/O usage during the analysis pipeline.
 * Run with: node --expose-gc --max-old-space-size=8192 profile-performance.js
 */

import { performance } from 'perf_hooks';
import { cpuUsage, memoryUsage } from 'process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { runAnalysis } from './src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PerformanceProfiler {
  constructor() {
    this.measurements = [];
    this.gcStats = [];
    this.ioStats = {
      reads: 0,
      writes: 0,
      readBytes: 0,
      writeBytes: 0,
      readTimes: [],
      writeTimes: [],
    };

    this.startCpu = null;
    this.startMemory = null;
    this.startTime = null;

    // Track original fs methods for I/O profiling
    this.originalReadFile = fs.readFile;
    this.originalWriteFile = fs.writeFile;
  }

  /**
   * Start profiling session
   */
  start(label = 'profiling') {
    this.label = label;
    this.startTime = performance.now();
    this.startCpu = cpuUsage();
    this.startMemory = memoryUsage();

    console.log(`\n🔍 Starting performance profiling: ${label}`);
    console.log(`Initial memory: ${(this.startMemory.heapUsed / 1024 / 1024).toFixed(2)} MB\n`);

    // Install I/O monitoring
    this.installIOMonitoring();

    // Install GC monitoring if available
    if (global.gc) {
      this.installGCMonitoring();
    }

    return this;
  }

  /**
   * Record a measurement point
   */
  measure(label) {
    const now = performance.now();
    const cpu = cpuUsage(this.startCpu);
    const mem = memoryUsage();

    const measurement = {
      label,
      timestamp: now - this.startTime,
      cpu: {
        user: cpu.user / 1000, // Convert to milliseconds
        system: cpu.system / 1000,
      },
      memory: {
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        external: mem.external,
        rss: mem.rss,
      },
      io: {
        reads: this.ioStats.reads,
        writes: this.ioStats.writes,
        readBytes: this.ioStats.readBytes,
        writeBytes: this.ioStats.writeBytes,
      },
    };

    this.measurements.push(measurement);

    console.log(`📊 ${label}`);
    console.log(`   Time: ${(measurement.timestamp / 1000).toFixed(2)}s`);
    console.log(`   Heap: ${(measurement.memory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   CPU: ${((measurement.cpu.user + measurement.cpu.system) / 1000).toFixed(2)}s`);

    return measurement;
  }

  /**
   * Install I/O monitoring hooks
   */
  installIOMonitoring() {
    const profiler = this;

    // Monitor fs.readFile
    fs.readFile = async function (...args) {
      const startTime = performance.now();
      const result = await profiler.originalReadFile.apply(this, args);
      const duration = performance.now() - startTime;

      profiler.ioStats.reads++;
      profiler.ioStats.readBytes += result.length || 0;
      profiler.ioStats.readTimes.push(duration);

      return result;
    };

    // Monitor fs.writeFile
    fs.writeFile = async function (...args) {
      const startTime = performance.now();
      const result = await profiler.originalWriteFile.apply(this, args);
      const duration = performance.now() - startTime;

      profiler.ioStats.writes++;
      profiler.ioStats.writeBytes += args[1]?.length || 0;
      profiler.ioStats.writeTimes.push(duration);

      return result;
    };
  }

  /**
   * Install GC monitoring
   */
  installGCMonitoring() {
    const profiler = this;
    let gcCount = 0;

    // Trigger GC at intervals and measure
    const originalGc = global.gc;
    global.gc = function () {
      const before = memoryUsage();
      const startTime = performance.now();

      originalGc();

      const duration = performance.now() - startTime;
      const after = memoryUsage();

      gcCount++;
      profiler.gcStats.push({
        count: gcCount,
        duration,
        freed: before.heapUsed - after.heapUsed,
        timestamp: performance.now() - profiler.startTime,
      });

      console.log(
        `🗑️  GC #${gcCount}: freed ${((before.heapUsed - after.heapUsed) / 1024 / 1024).toFixed(
          2,
        )} MB in ${duration.toFixed(2)}ms`,
      );
    };
  }

  /**
   * Force garbage collection if available
   */
  forceGC() {
    if (global.gc) {
      global.gc();
    }
  }

  /**
   * Calculate statistics from measurements
   */
  calculateStats() {
    if (this.measurements.length < 2) {
      return null;
    }

    const stats = {
      phases: [],
      totals: {
        duration: 0,
        cpuTime: 0,
        peakMemory: 0,
        memoryGrowth: 0,
        ioReads: this.ioStats.reads,
        ioWrites: this.ioStats.writes,
        totalReadBytes: this.ioStats.readBytes,
        totalWriteBytes: this.ioStats.writeBytes,
      },
      bottlenecks: {
        slowestPhase: null,
        mostMemoryIntensive: null,
        mostCPUIntensive: null,
        mostIOIntensive: null,
      },
    };

    // Calculate phase statistics
    for (let i = 1; i < this.measurements.length; i++) {
      const prev = this.measurements[i - 1];
      const curr = this.measurements[i];

      const phaseDuration = curr.timestamp - prev.timestamp;
      const phaseCpu = curr.cpu.user + curr.cpu.system - (prev.cpu.user + prev.cpu.system);
      const phaseMemoryGrowth = curr.memory.heapUsed - prev.memory.heapUsed;
      const phaseReads = curr.io.reads - prev.io.reads;
      const phaseWrites = curr.io.writes - prev.io.writes;

      const phase = {
        name: curr.label,
        duration: phaseDuration,
        cpuTime: phaseCpu,
        memoryGrowth: phaseMemoryGrowth,
        peakMemory: curr.memory.heapUsed,
        ioReads: phaseReads,
        ioWrites: phaseWrites,
        cpuPercent: (phaseCpu / phaseDuration) * 100,
      };

      stats.phases.push(phase);

      // Track peak memory
      if (curr.memory.heapUsed > stats.totals.peakMemory) {
        stats.totals.peakMemory = curr.memory.heapUsed;
      }
    }

    // Calculate totals
    const first = this.measurements[0];
    const last = this.measurements[this.measurements.length - 1];

    stats.totals.duration = last.timestamp;
    stats.totals.cpuTime = last.cpu.user + last.cpu.system;
    stats.totals.memoryGrowth = last.memory.heapUsed - first.memory.heapUsed;

    // Identify bottlenecks
    stats.phases.forEach((phase) => {
      if (
        !stats.bottlenecks.slowestPhase ||
        phase.duration > stats.bottlenecks.slowestPhase.duration
      ) {
        stats.bottlenecks.slowestPhase = phase;
      }
      if (
        !stats.bottlenecks.mostMemoryIntensive ||
        phase.memoryGrowth > stats.bottlenecks.mostMemoryIntensive.memoryGrowth
      ) {
        stats.bottlenecks.mostMemoryIntensive = phase;
      }
      if (
        !stats.bottlenecks.mostCPUIntensive ||
        phase.cpuTime > stats.bottlenecks.mostCPUIntensive.cpuTime
      ) {
        stats.bottlenecks.mostCPUIntensive = phase;
      }
      if (
        !stats.bottlenecks.mostIOIntensive ||
        phase.ioReads + phase.ioWrites >
          (stats.bottlenecks.mostIOIntensive?.ioReads || 0) +
            (stats.bottlenecks.mostIOIntensive?.ioWrites || 0)
      ) {
        stats.bottlenecks.mostIOIntensive = phase;
      }
    });

    return stats;
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const stats = this.calculateStats();
    if (!stats) {
      return 'Insufficient data for report';
    }

    const report = [];

    report.push('═══════════════════════════════════════════════════════════════');
    report.push('           PERFORMANCE PROFILING REPORT');
    report.push('═══════════════════════════════════════════════════════════════\n');

    // Overall Summary
    report.push('📈 OVERALL SUMMARY');
    report.push('─────────────────────────────────────────────────────────────');
    report.push(`Total Duration:     ${(stats.totals.duration / 1000).toFixed(2)}s`);
    report.push(`Total CPU Time:     ${(stats.totals.cpuTime / 1000).toFixed(2)}s`);
    report.push(`Peak Memory:        ${(stats.totals.peakMemory / 1024 / 1024).toFixed(2)} MB`);
    report.push(`Memory Growth:      ${(stats.totals.memoryGrowth / 1024 / 1024).toFixed(2)} MB`);
    report.push(
      `File Reads:         ${stats.totals.ioReads} (${(
        stats.totals.totalReadBytes /
        1024 /
        1024
      ).toFixed(2)} MB)`,
    );
    report.push(
      `File Writes:        ${stats.totals.ioWrites} (${(
        stats.totals.totalWriteBytes /
        1024 /
        1024
      ).toFixed(2)} MB)`,
    );
    report.push('');

    // Phase Breakdown
    report.push('⏱️  PHASE BREAKDOWN');
    report.push('─────────────────────────────────────────────────────────────');
    stats.phases.forEach((phase) => {
      report.push(`\n${phase.name}:`);
      report.push(
        `  Duration:        ${(phase.duration / 1000).toFixed(2)}s (${(
          (phase.duration / stats.totals.duration) *
          100
        ).toFixed(1)}%)`,
      );
      report.push(
        `  CPU Time:        ${(phase.cpuTime / 1000).toFixed(2)}s (${phase.cpuPercent.toFixed(
          1,
        )}% CPU utilization)`,
      );
      report.push(`  Memory Growth:   ${(phase.memoryGrowth / 1024 / 1024).toFixed(2)} MB`);
      report.push(`  Peak Memory:     ${(phase.peakMemory / 1024 / 1024).toFixed(2)} MB`);
      report.push(`  I/O Operations:  ${phase.ioReads} reads, ${phase.ioWrites} writes`);
    });
    report.push('');

    // Bottlenecks
    report.push('🔥 IDENTIFIED BOTTLENECKS');
    report.push('─────────────────────────────────────────────────────────────');

    const { slowestPhase, mostMemoryIntensive, mostCPUIntensive, mostIOIntensive } =
      stats.bottlenecks;

    report.push(`\n⏰ Slowest Phase: ${slowestPhase.name}`);
    report.push(
      `   Duration: ${(slowestPhase.duration / 1000).toFixed(2)}s (${(
        (slowestPhase.duration / stats.totals.duration) *
        100
      ).toFixed(1)}% of total)`,
    );

    report.push(`\n💾 Most Memory Intensive: ${mostMemoryIntensive.name}`);
    report.push(
      `   Memory Growth: ${(mostMemoryIntensive.memoryGrowth / 1024 / 1024).toFixed(2)} MB`,
    );

    report.push(`\n🔄 Most CPU Intensive: ${mostCPUIntensive.name}`);
    report.push(`   CPU Time: ${(mostCPUIntensive.cpuTime / 1000).toFixed(2)}s`);

    report.push(`\n💿 Most I/O Intensive: ${mostIOIntensive.name}`);
    report.push(`   I/O Operations: ${mostIOIntensive.ioReads + mostIOIntensive.ioWrites} total`);
    report.push('');

    // I/O Statistics
    report.push('💿 I/O STATISTICS');
    report.push('─────────────────────────────────────────────────────────────');

    const avgReadTime =
      this.ioStats.readTimes.length > 0
        ? this.ioStats.readTimes.reduce((a, b) => a + b, 0) / this.ioStats.readTimes.length
        : 0;
    const avgWriteTime =
      this.ioStats.writeTimes.length > 0
        ? this.ioStats.writeTimes.reduce((a, b) => a + b, 0) / this.ioStats.writeTimes.length
        : 0;

    report.push(`Average Read Time:  ${avgReadTime.toFixed(2)}ms`);
    report.push(`Average Write Time: ${avgWriteTime.toFixed(2)}ms`);
    report.push(
      `Total Read Time:    ${(this.ioStats.readTimes.reduce((a, b) => a + b, 0) / 1000).toFixed(
        2,
      )}s`,
    );
    report.push(
      `Total Write Time:   ${(this.ioStats.writeTimes.reduce((a, b) => a + b, 0) / 1000).toFixed(
        2,
      )}s`,
    );
    report.push('');

    // GC Statistics
    if (this.gcStats.length > 0) {
      report.push('🗑️  GARBAGE COLLECTION STATISTICS');
      report.push('─────────────────────────────────────────────────────────────');
      report.push(`GC Cycles:          ${this.gcStats.length}`);

      const totalFreed = this.gcStats.reduce((sum, gc) => sum + gc.freed, 0);
      const totalGCTime = this.gcStats.reduce((sum, gc) => sum + gc.duration, 0);
      const avgGCTime = totalGCTime / this.gcStats.length;

      report.push(`Total Memory Freed: ${(totalFreed / 1024 / 1024).toFixed(2)} MB`);
      report.push(`Total GC Time:      ${totalGCTime.toFixed(2)}ms`);
      report.push(`Average GC Time:    ${avgGCTime.toFixed(2)}ms`);
      report.push('');
    }

    report.push('═══════════════════════════════════════════════════════════════\n');

    return report.join('\n');
  }

  /**
   * Save profiling data to JSON
   */
  async saveData(outputPath) {
    const data = {
      label: this.label,
      measurements: this.measurements,
      gcStats: this.gcStats,
      ioStats: this.ioStats,
      stats: this.calculateStats(),
    };

    await fs.writeJSON(outputPath, data, { spaces: 2 });
    console.log(`\n💾 Profiling data saved to: ${outputPath}`);
  }
}

/**
 * Main profiling function
 */
async function runPerformanceProfiling() {
  const profiler = new PerformanceProfiler();

  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   Documentation Graph Builder - Performance Profiling         ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');

  profiler.start('Full Analysis Pipeline');

  try {
    // Measure initial state
    profiler.measure('Pipeline Start');

    // Run analysis with profiling checkpoints
    const options = {
      input: '/Users/allup/dev/OCL/arbitrum-docs/docs',
      output: './dist',
      verbose: false,
      skipExtraction: false,
      skipConcepts: false,
      skipAnalysis: false,
      skipVisualization: false,
      issueReport: false,
    };

    // Override logger to add profiling checkpoints
    const originalLogger = await import('./src/utils/logger.js');
    const logger = originalLogger.default;

    const originalSection = logger.section;
    logger.section = function (title) {
      profiler.measure(title);
      return originalSection.call(this, title);
    };

    const originalSuccess = logger.success;
    logger.success = function (...args) {
      profiler.forceGC(); // Force GC after major operations
      return originalSuccess.apply(this, args);
    };

    // Run the analysis
    console.log('\n🚀 Starting analysis with profiling instrumentation...\n');
    await runAnalysis(options);

    profiler.measure('Pipeline Complete');

    // Generate and display report
    console.log('\n' + profiler.generateReport());

    // Save profiling data
    const outputPath = path.join(__dirname, 'dist', 'performance-profile.json');
    await profiler.saveData(outputPath);

    // Generate optimization recommendations
    generateOptimizationRecommendations(profiler.calculateStats());
  } catch (error) {
    console.error('\n❌ Profiling failed:', error);
    throw error;
  }
}

/**
 * Generate optimization recommendations based on profiling data
 */
function generateOptimizationRecommendations(stats) {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         OPTIMIZATION RECOMMENDATIONS                          ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  const recommendations = [];

  // Analyze slowest phase
  const { slowestPhase, mostMemoryIntensive, mostCPUIntensive, mostIOIntensive } =
    stats.bottlenecks;

  // Time-based recommendations
  if (slowestPhase.duration / stats.totals.duration > 0.4) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Performance',
      issue: `${slowestPhase.name} accounts for ${(
        (slowestPhase.duration / stats.totals.duration) *
        100
      ).toFixed(1)}% of total execution time`,
      recommendation:
        'Optimize this phase with parallel processing, caching, or algorithmic improvements',
    });
  }

  // Memory-based recommendations
  if (mostMemoryIntensive.memoryGrowth / (1024 * 1024) > 500) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Memory',
      issue: `${mostMemoryIntensive.name} uses ${(
        mostMemoryIntensive.memoryGrowth /
        1024 /
        1024
      ).toFixed(2)} MB`,
      recommendation:
        'Implement streaming or chunking to reduce memory footprint. Consider processing data in smaller batches.',
    });
  }

  // CPU-based recommendations
  if (mostCPUIntensive.cpuPercent > 80) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'CPU',
      issue: `${mostCPUIntensive.name} has ${mostCPUIntensive.cpuPercent.toFixed(
        1,
      )}% CPU utilization`,
      recommendation:
        'Consider using worker threads or optimizing computational algorithms for this phase',
    });
  }

  // I/O-based recommendations
  const ioRatio =
    (mostIOIntensive.ioReads + mostIOIntensive.ioWrites) /
    (stats.totals.ioReads + stats.totals.ioWrites);
  if (ioRatio > 0.4) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'I/O',
      issue: `${mostIOIntensive.name} performs ${(ioRatio * 100).toFixed(
        1,
      )}% of all I/O operations`,
      recommendation:
        'Implement file caching, batch I/O operations, or use in-memory processing where possible',
    });
  }

  // Overall memory growth recommendations
  if (stats.totals.memoryGrowth / (1024 * 1024) > 2000) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Memory Management',
      issue: `Total memory growth of ${(stats.totals.memoryGrowth / 1024 / 1024).toFixed(2)} MB`,
      recommendation:
        'Implement more aggressive chunking, streaming, or consider database-backed storage for intermediate results',
    });
  }

  // Display recommendations
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. [${rec.priority}] ${rec.category}`);
    console.log(`   Issue: ${rec.issue}`);
    console.log(`   Recommendation: ${rec.recommendation}`);
    console.log('');
  });

  console.log('═══════════════════════════════════════════════════════════════\n');
}

// Run profiling
runPerformanceProfiling().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
