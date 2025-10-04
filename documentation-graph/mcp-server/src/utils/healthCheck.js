/**
 * Health Check System - Monitor server component status and health
 *
 * Tracks data loaded status, file watcher status, cache stats, and component health
 */

import { getLogger } from './logger.js';

/**
 * Component health status
 */
export const HealthStatus = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
  UNKNOWN: 'unknown',
};

/**
 * Health check manager
 */
export class HealthCheckManager {
  constructor(config = {}) {
    this.config = config;
    this.logger = getLogger();
    this.components = new Map();
    this.checkInterval = null;
    this.lastCheck = null;
    this.enabled = config.enableHealthCheck !== false;
  }

  /**
   * Register a component for health monitoring
   */
  registerComponent(name, checker) {
    this.components.set(name, {
      name,
      checker,
      status: HealthStatus.UNKNOWN,
      lastCheck: null,
      lastError: null,
      consecutiveFailures: 0,
    });

    this.logger.debug(`Health check component registered: ${name}`);
  }

  /**
   * Check health of a specific component
   */
  async checkComponent(name) {
    const component = this.components.get(name);
    if (!component) {
      return {
        status: HealthStatus.UNKNOWN,
        message: 'Component not registered',
      };
    }

    try {
      const result = await component.checker();

      component.status = result.status || HealthStatus.HEALTHY;
      component.lastCheck = new Date().toISOString();
      component.lastError = null;
      component.consecutiveFailures = 0;

      return result;
    } catch (error) {
      component.status = HealthStatus.UNHEALTHY;
      component.lastCheck = new Date().toISOString();
      component.lastError = error.message;
      component.consecutiveFailures++;

      this.logger.error(`Health check failed for ${name}`, error);

      return {
        status: HealthStatus.UNHEALTHY,
        message: error.message,
        consecutiveFailures: component.consecutiveFailures,
      };
    }
  }

  /**
   * Check health of all components
   */
  async checkAll() {
    const results = {};

    for (const [name] of this.components) {
      results[name] = await this.checkComponent(name);
    }

    this.lastCheck = new Date().toISOString();

    // Determine overall status
    const statuses = Object.values(results).map((r) => r.status);
    let overallStatus = HealthStatus.HEALTHY;

    if (statuses.includes(HealthStatus.UNHEALTHY)) {
      overallStatus = HealthStatus.UNHEALTHY;
    } else if (statuses.includes(HealthStatus.DEGRADED)) {
      overallStatus = HealthStatus.DEGRADED;
    } else if (statuses.includes(HealthStatus.UNKNOWN)) {
      overallStatus = HealthStatus.UNKNOWN;
    }

    return {
      status: overallStatus,
      timestamp: this.lastCheck,
      components: results,
    };
  }

  /**
   * Get current health status without running checks
   */
  getStatus() {
    const components = {};

    for (const [name, component] of this.components) {
      components[name] = {
        status: component.status,
        lastCheck: component.lastCheck,
        lastError: component.lastError,
        consecutiveFailures: component.consecutiveFailures,
      };
    }

    return {
      enabled: this.enabled,
      lastCheck: this.lastCheck,
      components,
    };
  }

  /**
   * Start periodic health checks
   */
  startPeriodicChecks(intervalMs = 30000) {
    if (!this.enabled) {
      this.logger.debug('Health checks disabled, skipping periodic checks');
      return;
    }

    if (this.checkInterval) {
      this.logger.warn('Periodic health checks already running');
      return;
    }

    this.logger.info(`Starting periodic health checks (interval: ${intervalMs}ms)`);

    this.checkInterval = setInterval(async () => {
      try {
        const health = await this.checkAll();

        if (health.status !== HealthStatus.HEALTHY) {
          this.logger.warn('Health check status degraded or unhealthy', {
            status: health.status,
            components: health.components,
          });
        } else {
          this.logger.debug('Health check passed', { status: health.status });
        }
      } catch (error) {
        this.logger.error('Error during periodic health check', error);
      }
    }, intervalMs);
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      this.logger.info('Stopped periodic health checks');
    }
  }

  /**
   * Create health check result
   */
  static createResult(status, message, details = {}) {
    return {
      status,
      message,
      ...details,
    };
  }
}

/**
 * Standard health checkers for common components
 */
export class StandardHealthCheckers {
  /**
   * Data loader health checker
   */
  static dataLoader(dataLoader) {
    return async () => {
      if (!dataLoader) {
        return HealthCheckManager.createResult(
          HealthStatus.UNHEALTHY,
          'Data loader not initialized',
        );
      }

      const documentsLoaded = dataLoader.documents && dataLoader.documents.length > 0;
      const conceptsLoaded = dataLoader.concepts && dataLoader.concepts.topConcepts?.length > 0;
      const graphLoaded = dataLoader.graph && dataLoader.graph.nodes?.length > 0;

      if (!documentsLoaded || !conceptsLoaded || !graphLoaded) {
        return HealthCheckManager.createResult(HealthStatus.UNHEALTHY, 'Data not fully loaded', {
          documentsLoaded,
          conceptsLoaded,
          graphLoaded,
        });
      }

      return HealthCheckManager.createResult(HealthStatus.HEALTHY, 'Data loaded successfully', {
        documentCount: dataLoader.documents.length,
        conceptCount: dataLoader.concepts.topConcepts?.length || 0,
        nodeCount: dataLoader.graph.nodes.length,
      });
    };
  }

  /**
   * File watcher health checker
   */
  static fileWatcher(fileWatcher) {
    return async () => {
      if (!fileWatcher) {
        return HealthCheckManager.createResult(HealthStatus.DEGRADED, 'File watcher not enabled');
      }

      // Check if watcher is running
      if (!fileWatcher.watcher) {
        return HealthCheckManager.createResult(HealthStatus.UNHEALTHY, 'File watcher not running');
      }

      return HealthCheckManager.createResult(HealthStatus.HEALTHY, 'File watcher active', {
        watching: fileWatcher.watchPath || 'unknown',
      });
    };
  }

  /**
   * Cache health checker
   */
  static cache(cacheManager) {
    return async () => {
      if (!cacheManager) {
        return HealthCheckManager.createResult(HealthStatus.DEGRADED, 'Cache not enabled');
      }

      const stats = cacheManager.getStats();

      // Warn if hit rate is too low (< 50%) and we have enough requests
      const totalRequests = stats.hits + stats.misses;
      if (totalRequests > 10 && stats.hits / totalRequests < 0.5) {
        return HealthCheckManager.createResult(HealthStatus.DEGRADED, 'Low cache hit rate', stats);
      }

      return HealthCheckManager.createResult(HealthStatus.HEALTHY, 'Cache operating normally', {
        ...stats,
        size: cacheManager.cache.size,
      });
    };
  }

  /**
   * Memory health checker
   */
  static memory(thresholdMB = 1024) {
    return async () => {
      const usage = process.memoryUsage();
      const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
      const rssMB = Math.round(usage.rss / 1024 / 1024);

      if (heapUsedMB > thresholdMB) {
        return HealthCheckManager.createResult(HealthStatus.DEGRADED, 'High memory usage', {
          heapUsedMB,
          heapTotalMB,
          rssMB,
          thresholdMB,
        });
      }

      return HealthCheckManager.createResult(HealthStatus.HEALTHY, 'Memory usage normal', {
        heapUsedMB,
        heapTotalMB,
        rssMB,
      });
    };
  }

  /**
   * Similarity engine health checker
   */
  static similarityEngine(similarityEngine) {
    return async () => {
      if (!similarityEngine) {
        return HealthCheckManager.createResult(
          HealthStatus.UNHEALTHY,
          'Similarity engine not initialized',
        );
      }

      // Check if required data is available
      if (!similarityEngine.graph || !similarityEngine.documents || !similarityEngine.concepts) {
        return HealthCheckManager.createResult(
          HealthStatus.UNHEALTHY,
          'Similarity engine missing data',
        );
      }

      return HealthCheckManager.createResult(HealthStatus.HEALTHY, 'Similarity engine operational');
    };
  }

  /**
   * Scattering analyzer health checker
   */
  static scatteringAnalyzer(scatteringAnalyzer) {
    return async () => {
      if (!scatteringAnalyzer) {
        return HealthCheckManager.createResult(
          HealthStatus.UNHEALTHY,
          'Scattering analyzer not initialized',
        );
      }

      // Check if required data is available
      if (
        !scatteringAnalyzer.graph ||
        !scatteringAnalyzer.documents ||
        !scatteringAnalyzer.concepts
      ) {
        return HealthCheckManager.createResult(
          HealthStatus.UNHEALTHY,
          'Scattering analyzer missing data',
        );
      }

      return HealthCheckManager.createResult(
        HealthStatus.HEALTHY,
        'Scattering analyzer operational',
      );
    };
  }

  /**
   * Tool registry health checker
   */
  static toolRegistry(toolRegistry) {
    return async () => {
      if (!toolRegistry) {
        return HealthCheckManager.createResult(
          HealthStatus.UNHEALTHY,
          'Tool registry not initialized',
        );
      }

      const toolCount = toolRegistry.tools?.length || 0;

      if (toolCount === 0) {
        return HealthCheckManager.createResult(HealthStatus.UNHEALTHY, 'No tools registered');
      }

      return HealthCheckManager.createResult(HealthStatus.HEALTHY, 'Tool registry operational', {
        toolCount,
      });
    };
  }
}

export default HealthCheckManager;
