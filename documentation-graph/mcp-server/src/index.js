#!/usr/bin/env node

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
 * Documentation Analysis MCP Server
 *
 * Provides interactive tools for detecting content duplication and topic scattering
 * in Arbitrum documentation through the Model Context Protocol.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { DataLoader } from './core/DataLoader.js';
import { SimilarityEngine } from './core/SimilarityEngine.js';
import { ScatteringAnalyzer } from './core/ScatteringAnalyzer.js';
import { ConsolidationEngine } from './core/ConsolidationEngine.js';
import { FileWatcher } from './core/FileWatcher.js';
import { QueryParser } from './core/QueryParser.js';
import { ToolRegistry } from './tools/ToolRegistry.js';
import { ResourceManager } from './resources/ResourceManager.js';
import { CacheManager } from './core/CacheManager.js';
import { initializeLogger, getLogger } from './utils/logger.js';
import { getConfig, validateConfigPaths, printConfig } from './config/serverConfig.js';
import { ToolMiddleware } from './middleware/toolMiddleware.js';
import { HealthCheckManager, StandardHealthCheckers } from './utils/healthCheck.js';
import { PathValidator } from './utils/security.js';
import { ServerNotInitializedError, ToolNotFoundError, wrapError } from './utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DocumentationAnalysisMCPServer {
  constructor() {
    // Load configuration from environment
    this.config = getConfig();

    // Initialize logger with configuration
    initializeLogger(this.config);
    this.logger = getLogger();

    // Initialize server
    this.server = new Server(
      {
        name: 'documentation-analysis-mcp-server',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      },
    );

    // Core components
    this.dataLoader = null;
    this.similarityEngine = null;
    this.scatteringAnalyzer = null;
    this.consolidationEngine = null;
    this.fileWatcher = null;
    this.queryParser = null;
    this.toolRegistry = null;
    this.resourceManager = null;
    this.cacheManager = null;
    this.toolMiddleware = null;
    this.healthCheck = null;
    this.pathValidator = null;

    // Server state
    this.isInitialized = false;
    this.startTime = Date.now();

    this.setupHandlers();
  }

  async initialize() {
    const timer = this.logger.startTimer('Server initialization');

    try {
      this.logger.info('Initializing Documentation Analysis MCP Server v2.0.0...');

      // Print configuration
      if (this.config.logLevel === 'DEBUG') {
        printConfig(this.config);
      }

      // Validate configuration paths
      await validateConfigPaths(this.config);
      this.logger.info('Configuration validated successfully');

      // Initialize path validator for security
      this.pathValidator = new PathValidator([this.config.distPath, this.config.docsPath]);

      // Initialize cache manager
      this.cacheManager = new CacheManager({
        enabled: this.config.enableCache,
        ttl: this.config.cacheTtl,
      });

      // Start periodic cache cleanup if enabled
      if (this.config.enableCache) {
        this.cacheManager.startPeriodicCleanup(this.config.cacheCleanupInterval);
      }

      // Initialize data loader
      this.dataLoader = new DataLoader(this.config.distPath);
      await this.dataLoader.load();

      // Initialize core engines
      this.similarityEngine = new SimilarityEngine(
        this.dataLoader.graph,
        this.dataLoader.documents,
        this.dataLoader.concepts,
        this.cacheManager,
      );

      this.scatteringAnalyzer = new ScatteringAnalyzer(
        this.dataLoader.graph,
        this.dataLoader.documents,
        this.dataLoader.concepts,
        this.cacheManager,
      );

      this.consolidationEngine = new ConsolidationEngine(
        this.dataLoader.graph,
        this.dataLoader.documents,
        this.dataLoader.concepts,
        this.similarityEngine,
      );

      this.queryParser = new QueryParser(this.dataLoader.documents, this.dataLoader.concepts);

      // Initialize tool registry
      this.toolRegistry = new ToolRegistry({
        similarityEngine: this.similarityEngine,
        scatteringAnalyzer: this.scatteringAnalyzer,
        consolidationEngine: this.consolidationEngine,
        queryParser: this.queryParser,
        dataLoader: this.dataLoader,
      });

      // Initialize tool middleware
      this.toolMiddleware = new ToolMiddleware(this.config);

      // Initialize resource manager
      this.resourceManager = new ResourceManager(this.dataLoader);

      // Initialize health check system
      if (this.config.enableHealthCheck) {
        this.healthCheck = new HealthCheckManager(this.config);

        // Register health check components
        this.healthCheck.registerComponent(
          'dataLoader',
          StandardHealthCheckers.dataLoader(this.dataLoader),
        );
        this.healthCheck.registerComponent(
          'cache',
          StandardHealthCheckers.cache(this.cacheManager),
        );
        this.healthCheck.registerComponent(
          'memory',
          StandardHealthCheckers.memory(1024), // 1GB threshold
        );
        this.healthCheck.registerComponent(
          'similarityEngine',
          StandardHealthCheckers.similarityEngine(this.similarityEngine),
        );
        this.healthCheck.registerComponent(
          'scatteringAnalyzer',
          StandardHealthCheckers.scatteringAnalyzer(this.scatteringAnalyzer),
        );
        this.healthCheck.registerComponent(
          'toolRegistry',
          StandardHealthCheckers.toolRegistry(this.toolRegistry),
        );

        // Start periodic health checks
        this.healthCheck.startPeriodicChecks(this.config.healthCheckInterval);

        // Run initial health check
        const health = await this.healthCheck.checkAll();
        this.logger.info('Initial health check completed', { status: health.status });
      }

      // Initialize file watcher if enabled
      if (this.config.enableAutoRefresh) {
        this.fileWatcher = new FileWatcher(this.config.distPath, this.handleDataRefresh.bind(this));
        await this.fileWatcher.start();

        // Register file watcher health check
        if (this.healthCheck) {
          this.healthCheck.registerComponent(
            'fileWatcher',
            StandardHealthCheckers.fileWatcher(this.fileWatcher),
          );
        }
      }

      this.isInitialized = true;
      const duration = timer.end();
      this.logger.info('MCP Server initialized successfully', {
        duration,
        toolCount: this.toolRegistry.tools.length,
        documentCount: this.dataLoader.documents.length,
      });
    } catch (error) {
      const wrappedError = wrapError(error, { phase: 'initialization' });
      this.logger.error('Failed to initialize MCP Server', wrappedError);
      throw wrappedError;
    }
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      if (!this.toolRegistry) {
        return { tools: [] };
      }
      return { tools: this.toolRegistry.listTools() };
    });

    // Call tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (!this.isInitialized || !this.toolRegistry) {
        throw new ServerNotInitializedError('toolRegistry', 'Server not fully initialized');
      }

      // Create request context for logging
      const requestContext = this.logger.createRequestContext();
      this.logger.setContext(requestContext);

      try {
        this.logger.debug('Tool call received', {
          toolName: request.params.name,
          hasArgs: !!request.params.arguments,
        });

        // Find tool
        const tool = this.toolRegistry.tools.find((t) => t.name === request.params.name);

        if (!tool) {
          const availableTools = this.toolRegistry.tools.map((t) => ({ name: t.name }));
          throw new ToolNotFoundError(request.params.name, availableTools);
        }

        // Execute through middleware with timeout, validation, and monitoring
        const result = await this.toolMiddleware.execute(
          tool,
          request.params.arguments || {},
          requestContext,
        );

        return result;
      } catch (error) {
        const wrappedError = wrapError(error, {
          toolName: request.params.name,
          requestId: requestContext.requestId,
        });

        this.logger.error('Tool execution failed', wrappedError, {
          toolName: request.params.name,
        });

        // Return error in MCP format
        throw wrappedError;
      } finally {
        this.logger.clearContext();
      }
    });

    // List resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      if (!this.resourceManager) {
        return { resources: [] };
      }
      return { resources: this.resourceManager.listResources() };
    });

    // Read resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      if (!this.isInitialized || !this.resourceManager) {
        throw new ServerNotInitializedError('resourceManager', 'Server not fully initialized');
      }

      try {
        this.logger.debug('Resource read requested', { uri: request.params.uri });
        return this.resourceManager.readResource(request.params.uri);
      } catch (error) {
        const wrappedError = wrapError(error, { uri: request.params.uri });
        this.logger.error('Resource read failed', wrappedError);
        throw wrappedError;
      }
    });
  }

  async handleDataRefresh() {
    const timer = this.logger.startTimer('Data refresh');

    try {
      this.logger.info('Data files changed, refreshing...');

      // Reload data
      await this.dataLoader.load();

      // Clear cache
      this.cacheManager.clear();
      this.logger.info('Cache cleared for refresh');

      // Reinitialize engines with new data
      this.similarityEngine.updateData(
        this.dataLoader.graph,
        this.dataLoader.documents,
        this.dataLoader.concepts,
      );

      this.scatteringAnalyzer.updateData(
        this.dataLoader.graph,
        this.dataLoader.documents,
        this.dataLoader.concepts,
      );

      this.consolidationEngine.updateData(
        this.dataLoader.graph,
        this.dataLoader.documents,
        this.dataLoader.concepts,
      );

      const duration = timer.end();
      this.logger.info('Data refresh complete', {
        duration,
        documentCount: this.dataLoader.documents.length,
      });

      // Run health check after refresh
      if (this.healthCheck) {
        const health = await this.healthCheck.checkAll();
        this.logger.info('Post-refresh health check', { status: health.status });
      }
    } catch (error) {
      const wrappedError = wrapError(error, { phase: 'data_refresh' });
      this.logger.error('Error during data refresh', wrappedError);
    }
  }

  /**
   * Get server health status
   */
  async getHealth() {
    if (!this.healthCheck) {
      return {
        status: 'unknown',
        message: 'Health checks disabled',
      };
    }

    return await this.healthCheck.checkAll();
  }

  /**
   * Get server metrics and statistics
   */
  getMetrics() {
    const uptime = Date.now() - this.startTime;

    return {
      uptime,
      initialized: this.isInitialized,
      logger: this.logger.getMetrics(),
      cache: this.cacheManager?.getStats(),
      middleware: this.toolMiddleware?.getStatus(),
      health: this.healthCheck?.getStatus(),
    };
  }

  async run() {
    await this.initialize();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    this.logger.info('Documentation Analysis MCP Server v2.0.0 running on stdio', {
      toolCount: this.toolRegistry.tools.length,
      resourceCount: this.resourceManager.listResources().length,
    });

    // Print metrics on startup if debug mode
    if (this.config.logLevel === 'DEBUG') {
      this.logger.printMetrics();
    }
  }

  async shutdown() {
    this.logger.info('Shutting down MCP Server...');

    try {
      // Stop health checks
      if (this.healthCheck) {
        this.healthCheck.stopPeriodicChecks();
      }

      // Stop cache cleanup
      if (this.cacheManager) {
        this.cacheManager.stopPeriodicCleanup();
      }

      // Stop file watcher
      if (this.fileWatcher) {
        await this.fileWatcher.stop();
      }

      // Print final metrics
      if (this.config.enableMetrics) {
        this.logger.printMetrics();
      }

      this.logger.info('MCP Server shutdown complete');
    } catch (error) {
      this.logger.error('Error during shutdown', error);
    }
  }
}

// Main execution
const server = new DocumentationAnalysisMCPServer();

process.on('SIGINT', async () => {
  await server.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.shutdown();
  process.exit(0);
});

server.run().catch((error) => {
  const logger = getLogger();
  logger.error('Fatal error during server startup', error);
  process.exit(1);
});
