#!/usr/bin/env node

/**
 * Documentation Analysis MCP Server
 *
 * Provides interactive tools for detecting content duplication and topic scattering
 * in Arbitrum documentation through the Model Context Protocol.
 */

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
import { logger } from './utils/logger.js';

class DocumentationAnalysisMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'documentation-analysis-mcp-server',
        version: '1.0.0',
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

    // Configuration
    this.config = {
      distPath: '../dist',
      docsPath: '../../docs',
      enableAutoRefresh: true,
      cacheEnabled: true,
      cacheTTL: 300000, // 5 minutes
      performanceTarget: 20000, // 20 seconds
    };

    this.setupHandlers();
  }

  async initialize() {
    try {
      logger.info('Initializing Documentation Analysis MCP Server...');

      // Initialize cache manager
      this.cacheManager = new CacheManager({
        enabled: this.config.cacheEnabled,
        ttl: this.config.cacheTTL,
      });

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

      // Initialize resource manager
      this.resourceManager = new ResourceManager(this.dataLoader);

      // Initialize file watcher if enabled
      if (this.config.enableAutoRefresh) {
        this.fileWatcher = new FileWatcher(this.config.distPath, this.handleDataRefresh.bind(this));
        await this.fileWatcher.start();
      }

      logger.info('MCP Server initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize MCP Server:', error);
      throw error;
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
      if (!this.toolRegistry) {
        throw new Error('Server not initialized');
      }

      const startTime = Date.now();
      try {
        const result = await this.toolRegistry.executeTool(
          request.params.name,
          request.params.arguments || {},
        );

        const executionTime = Date.now() - startTime;
        logger.debug(`Tool ${request.params.name} executed in ${executionTime}ms`);

        if (executionTime > this.config.performanceTarget) {
          logger.warn(
            `Tool ${request.params.name} exceeded performance target (${executionTime}ms > ${this.config.performanceTarget}ms)`,
          );
        }

        return result;
      } catch (error) {
        logger.error(`Error executing tool ${request.params.name}:`, error);
        throw error;
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
      if (!this.resourceManager) {
        throw new Error('Server not initialized');
      }
      return this.resourceManager.readResource(request.params.uri);
    });
  }

  async handleDataRefresh() {
    try {
      logger.info('Data files changed, refreshing...');

      // Reload data
      await this.dataLoader.load();

      // Clear cache
      this.cacheManager.clear();

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

      logger.info('Data refresh complete');
    } catch (error) {
      logger.error('Error during data refresh:', error);
    }
  }

  async run() {
    await this.initialize();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    logger.info('Documentation Analysis MCP Server running on stdio');
  }

  async shutdown() {
    if (this.fileWatcher) {
      await this.fileWatcher.stop();
    }
    logger.info('MCP Server shutdown complete');
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
  logger.error('Fatal error:', error);
  process.exit(1);
});
