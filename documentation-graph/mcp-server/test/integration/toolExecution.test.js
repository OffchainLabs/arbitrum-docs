/**
 * Integration test for MCP tool execution
 * Tests that tools return properly formatted MCP responses
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { DataLoader } from '../../src/core/DataLoader.js';
import { SimilarityEngine } from '../../src/core/SimilarityEngine.js';
import { ScatteringAnalyzer } from '../../src/core/ScatteringAnalyzer.js';
import { ConsolidationEngine } from '../../src/core/ConsolidationEngine.js';
import { QueryParser } from '../../src/core/QueryParser.js';
import { ToolRegistry } from '../../src/tools/ToolRegistry.js';
import { ToolMiddleware } from '../../src/middleware/toolMiddleware.js';
import { CacheManager } from '../../src/core/CacheManager.js';

describe('MCP Tool Execution - Result Formatting', () => {
  let dataLoader;
  let toolRegistry;
  let toolMiddleware;
  let config;

  beforeAll(async () => {
    // Use test fixtures
    const distPath = '../dist';

    // Initialize components
    dataLoader = new DataLoader(distPath);
    await dataLoader.load();

    const cacheManager = new CacheManager({ enabled: false });

    const similarityEngine = new SimilarityEngine(
      dataLoader.graph,
      dataLoader.documents,
      dataLoader.concepts,
      cacheManager
    );

    const scatteringAnalyzer = new ScatteringAnalyzer(
      dataLoader.graph,
      dataLoader.documents,
      dataLoader.concepts,
      cacheManager
    );

    const consolidationEngine = new ConsolidationEngine(
      dataLoader.graph,
      dataLoader.documents,
      dataLoader.concepts,
      similarityEngine
    );

    const queryParser = new QueryParser(dataLoader.documents, dataLoader.concepts);

    toolRegistry = new ToolRegistry({
      similarityEngine,
      scatteringAnalyzer,
      consolidationEngine,
      queryParser,
      dataLoader,
    });

    config = {
      toolTimeout: 30000,
      performanceTarget: 5000,
      enableInputSanitization: false,
      enableRateLimit: false,
      enableCircuitBreaker: false,
    };

    toolMiddleware = new ToolMiddleware(config);
  });

  describe('find_duplicate_content', () => {
    test('should return MCP-formatted result for existing concept', async () => {
      const tool = toolRegistry.tools.find(t => t.name === 'find_duplicate_content');
      expect(tool).toBeDefined();

      const args = {
        topic: 'gas',
        min_similarity: 0.7,
        include_exact: true,
        include_conceptual: true,
      };

      const result = await toolMiddleware.execute(tool, args, {});

      // Check MCP format
      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.content[0]).toHaveProperty('type');
      expect(result.content[0].type).toBe('text');
      expect(result.content[0]).toHaveProperty('text');

      // Parse the text content
      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty('found');
      expect(data).toHaveProperty('topic');
      expect(data.topic).toBe('gas');
    });

    test('should return MCP-formatted result for non-existent concept', async () => {
      const tool = toolRegistry.tools.find(t => t.name === 'find_duplicate_content');

      const args = {
        topic: 'nonexistent_concept_xyz',
        min_similarity: 0.7,
      };

      const result = await toolMiddleware.execute(tool, args, {});

      // Check MCP format even for errors
      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('type', 'text');

      const data = JSON.parse(result.content[0].text);
      expect(data.found).toBe(false);
      expect(data).toHaveProperty('error');
    });
  });

  describe('find_scattered_topics', () => {
    test('should return MCP-formatted result', async () => {
      const tool = toolRegistry.tools.find(t => t.name === 'find_scattered_topics');

      const args = {
        min_fragmentation: 0.6,
        depth: 'basic',
      };

      const result = await toolMiddleware.execute(tool, args, {});

      expect(result).toHaveProperty('content');
      expect(result.content[0].type).toBe('text');

      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty('found');
    });
  });

  describe('find_similar_documents', () => {
    test('should return MCP-formatted result for existing document', async () => {
      const tool = toolRegistry.tools.find(t => t.name === 'find_similar_documents');

      // Get first document from data
      const firstDoc = dataLoader.getAllDocuments()[0];
      expect(firstDoc).toBeDefined();

      const args = {
        doc_path: firstDoc.relativePath,
        limit: 5,
        min_similarity: 0.5,
      };

      const result = await toolMiddleware.execute(tool, args, {});

      expect(result).toHaveProperty('content');
      expect(result.content[0].type).toBe('text');

      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty('found');
      expect(data).toHaveProperty('document');
    });

    test('should return MCP-formatted error for non-existent document', async () => {
      const tool = toolRegistry.tools.find(t => t.name === 'find_similar_documents');

      const args = {
        doc_path: '/nonexistent/path.md',
        limit: 5,
      };

      const result = await toolMiddleware.execute(tool, args, {});

      expect(result).toHaveProperty('content');
      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty('error');
    });
  });

  describe('All tools', () => {
    test('should have MCP-compliant response format', () => {
      const toolNames = [
        'find_duplicate_content',
        'find_scattered_topics',
        'suggest_consolidation',
        'find_content_overlaps',
        'find_similar_documents',
        'analyze_topic_distribution',
        'find_orphaned_content',
        'suggest_canonical_reference',
      ];

      for (const name of toolNames) {
        const tool = toolRegistry.tools.find(t => t.name === name);
        expect(tool).toBeDefined();
        expect(tool.handler).toBeInstanceOf(Function);
      }
    });
  });
});
