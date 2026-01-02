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
 * ToolRegistry - Defines and executes all MCP tools
 *
 * Implements Tier 1 (must-have) and Tier 2 (nice-to-have) tools for
 * content duplication and topic scattering analysis.
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';
import {
  ResponseSizer,
  toDocumentReference,
  toDocumentReferences,
} from '../utils/responseSizer.js';

export class ToolRegistry {
  constructor({
    similarityEngine,
    scatteringAnalyzer,
    consolidationEngine,
    queryParser,
    dataLoader,
  }) {
    this.similarityEngine = similarityEngine;
    this.scatteringAnalyzer = scatteringAnalyzer;
    this.consolidationEngine = consolidationEngine;
    this.queryParser = queryParser;
    this.dataLoader = dataLoader;
    this.responseSizer = new ResponseSizer(100 * 1024); // 100KB limit

    this.tools = this.defineTools();
  }

  defineTools() {
    return [
      // TIER 1 TOOLS - Must Have

      {
        name: 'find_duplicate_content',
        description:
          'Find exact and conceptual duplicates for a topic or concept. Returns documents with high similarity scores.',
        inputSchema: z.object({
          topic: z.string().describe('The topic or concept to search for duplicates'),
          min_similarity: z
            .number()
            .min(0)
            .max(1)
            .default(0.7)
            .optional()
            .describe('Minimum similarity threshold (0-1, default 0.7)'),
          include_exact: z
            .boolean()
            .default(true)
            .optional()
            .describe('Include exact text duplication analysis'),
          include_conceptual: z
            .boolean()
            .default(true)
            .optional()
            .describe('Include conceptual overlap analysis'),
          max_results: z
            .number()
            .min(1)
            .max(50)
            .default(10)
            .optional()
            .describe('Maximum number of duplicate pairs to return (default 10)'),
        }),
        handler: this.findDuplicateContent.bind(this),
      },

      {
        name: 'find_scattered_topics',
        description:
          'Identify topics that are fragmented across multiple documents, making them hard to discover.',
        inputSchema: z.object({
          concept: z
            .string()
            .optional()
            .describe('Specific concept to analyze (omit to find all scattered topics)'),
          depth: z
            .enum(['basic', 'semantic', 'full'])
            .default('semantic')
            .optional()
            .describe(
              'Analysis depth: basic (metrics only), semantic (includes recommendations), full (comprehensive)',
            ),
          min_fragmentation: z
            .number()
            .min(0)
            .max(1)
            .default(0.6)
            .optional()
            .describe('Minimum fragmentation score (0-1, default 0.6)'),
          max_results: z
            .number()
            .min(1)
            .max(50)
            .default(20)
            .optional()
            .describe('Maximum number of results to return (default 20, max 50)'),
          offset: z
            .number()
            .min(0)
            .default(0)
            .optional()
            .describe('Number of results to skip for pagination (default 0)'),
        }),
        handler: this.findScatteredTopics.bind(this),
      },

      {
        name: 'suggest_consolidation',
        description:
          'Analyze a group of documents and recommend consolidation strategy (merge, reorganize, create canonical reference, etc.).',
        inputSchema: z.object({
          doc_paths: z
            .array(z.string())
            .min(2)
            .describe('Array of document paths (relative or absolute) to analyze'),
          include_alternatives: z
            .boolean()
            .default(true)
            .optional()
            .describe('Include alternative consolidation strategies'),
        }),
        handler: this.suggestConsolidation.bind(this),
      },

      {
        name: 'find_content_overlaps',
        description:
          'Compare two documents in detail to identify overlapping content, shared concepts, and duplicated text.',
        inputSchema: z.object({
          doc_path_1: z.string().describe('First document path'),
          doc_path_2: z.string().describe('Second document path'),
          detailed: z
            .boolean()
            .default(true)
            .optional()
            .describe('Include detailed segment-by-segment comparison'),
        }),
        handler: this.findContentOverlaps.bind(this),
      },

      // TIER 2 TOOLS - Nice to Have

      {
        name: 'find_similar_documents',
        description:
          'Find documents similar to a given document based on content, concepts, and semantic similarity.',
        inputSchema: z.object({
          doc_path: z.string().describe('Document path to find similar documents for'),
          limit: z
            .number()
            .min(1)
            .max(50)
            .default(10)
            .optional()
            .describe('Maximum number of similar documents to return'),
          min_similarity: z
            .number()
            .min(0)
            .max(1)
            .default(0.6)
            .optional()
            .describe('Minimum similarity threshold'),
        }),
        handler: this.findSimilarDocuments.bind(this),
      },

      {
        name: 'analyze_topic_distribution',
        description:
          'Show how a concept is distributed across the documentation, including weight distribution, directory spread, and navigation issues.',
        inputSchema: z.object({
          concept: z.string().describe('Concept name to analyze'),
          include_recommendations: z
            .boolean()
            .default(true)
            .optional()
            .describe('Include actionable recommendations'),
        }),
        handler: this.analyzeTopicDistribution.bind(this),
      },

      {
        name: 'find_orphaned_content',
        description:
          'Find documents that are isolated or disconnected from the main documentation structure.',
        inputSchema: z.object({
          include_partial_orphans: z
            .boolean()
            .default(false)
            .optional()
            .describe('Include documents with weak connections'),
          filter_directory: z.string().optional().describe('Filter to specific directory'),
          filter_content_type: z.string().optional().describe('Filter to specific content type'),
          max_results: z
            .number()
            .min(1)
            .max(100)
            .default(50)
            .optional()
            .describe('Maximum number of results to return (default 50)'),
        }),
        handler: this.findOrphanedContent.bind(this),
      },

      {
        name: 'suggest_canonical_reference',
        description:
          'Recommend the best document to serve as the authoritative/canonical reference for a topic.',
        inputSchema: z.object({
          topic: z.string().describe('Topic or concept name'),
          include_alternatives: z
            .boolean()
            .default(true)
            .optional()
            .describe('Include alternative candidates'),
        }),
        handler: this.suggestCanonicalReference.bind(this),
      },

      {
        name: 'get_document_details',
        description: 'Fetch detailed information for a specific document by path.',
        inputSchema: z.object({
          doc_path: z.string().describe('Document path (relative or absolute)'),
          include_content: z
            .boolean()
            .default(false)
            .optional()
            .describe('Include full document content (default: false)'),
          include_concepts: z
            .boolean()
            .default(true)
            .optional()
            .describe('Include concepts mentioned in the document (default: true)'),
        }),
        handler: this.getDocumentDetails.bind(this),
      },
    ];
  }

  listTools() {
    return this.tools.map((tool) => {
      // Convert Zod schema to JSON Schema format expected by MCP
      const zodSchema = tool.inputSchema;
      const jsonSchema = {
        type: 'object',
        properties: {},
        required: [],
      };

      // Extract properties from Zod schema
      const shape = zodSchema.shape || zodSchema._def?.shape?.();
      if (shape) {
        for (const [key, value] of Object.entries(shape)) {
          // Convert Zod types to JSON Schema types
          jsonSchema.properties[key] = this.zodToJsonSchema(value);

          // Check if field is required (not optional)
          if (!value.isOptional()) {
            jsonSchema.required.push(key);
          }
        }
      }

      return {
        name: tool.name,
        description: tool.description,
        inputSchema: jsonSchema,
      };
    });
  }

  zodToJsonSchema(zodType) {
    // Handle Zod type to JSON Schema conversion
    const typeName = zodType._def?.typeName;

    if (typeName === 'ZodString') {
      const schema = { type: 'string' };
      if (zodType._def.description) {
        schema.description = zodType._def.description;
      }
      return schema;
    }

    if (typeName === 'ZodNumber') {
      const schema = { type: 'number' };
      if (zodType._def.description) {
        schema.description = zodType._def.description;
      }
      // Add min/max constraints if present
      for (const check of zodType._def.checks || []) {
        if (check.kind === 'min') schema.minimum = check.value;
        if (check.kind === 'max') schema.maximum = check.value;
      }
      return schema;
    }

    if (typeName === 'ZodBoolean') {
      const schema = { type: 'boolean' };
      if (zodType._def.description) {
        schema.description = zodType._def.description;
      }
      return schema;
    }

    if (typeName === 'ZodArray') {
      const schema = { type: 'array' };
      if (zodType._def.description) {
        schema.description = zodType._def.description;
      }
      if (zodType._def.type) {
        schema.items = this.zodToJsonSchema(zodType._def.type);
      }
      // Add min/max items constraints
      if (zodType._def.minLength) {
        schema.minItems = zodType._def.minLength.value;
      }
      if (zodType._def.maxLength) {
        schema.maxItems = zodType._def.maxLength.value;
      }
      return schema;
    }

    if (typeName === 'ZodEnum') {
      const schema = { type: 'string', enum: zodType._def.values };
      if (zodType._def.description) {
        schema.description = zodType._def.description;
      }
      return schema;
    }

    if (typeName === 'ZodOptional' || typeName === 'ZodDefault') {
      // Unwrap optional/default and convert inner type
      const innerSchema = this.zodToJsonSchema(zodType._def.innerType);
      if (zodType._def.description) {
        innerSchema.description = zodType._def.description;
      }
      if (typeName === 'ZodDefault' && zodType._def.defaultValue) {
        innerSchema.default = zodType._def.defaultValue();
      }
      return innerSchema;
    }

    // Fallback for unknown types
    return { type: 'string', description: zodType._def?.description || '' };
  }

  async executeTool(toolName, args) {
    const tool = this.tools.find((t) => t.name === toolName);

    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    // Validate arguments
    const validatedArgs = tool.inputSchema.parse(args);

    // Execute handler
    logger.debug(`Executing tool: ${toolName}`, validatedArgs);
    const result = await tool.handler(validatedArgs);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  // TIER 1 TOOL HANDLERS

  async findDuplicateContent(args) {
    const { topic, min_similarity, include_exact, include_conceptual, max_results } = args;

    // Find all documents mentioning this topic
    const docsWithConcept = this.dataLoader.getDocumentsForConcept(topic);

    if (docsWithConcept.length === 0) {
      return {
        found: false,
        topic,
        error: 'Topic not found in documentation',
        suggestion: 'Try searching for related terms or check spelling',
      };
    }

    const documents = docsWithConcept.map((d) => d.document);

    // Find duplicates among these documents
    const duplicatePairs = [];

    for (let i = 0; i < documents.length; i++) {
      for (let j = i + 1; j < documents.length; j++) {
        const similarity = this.similarityEngine.calculateComprehensiveSimilarity(
          documents[i],
          documents[j],
        );

        if (similarity.overallScore >= min_similarity) {
          duplicatePairs.push({
            doc1: {
              path: documents[i].relativePath,
              title: documents[i].frontmatter?.title,
              contentType: documents[i].frontmatter?.content_type,
            },
            doc2: {
              path: documents[j].relativePath,
              title: documents[j].frontmatter?.title,
              contentType: documents[j].frontmatter?.content_type,
            },
            overallSimilarity: similarity.overallScore,
            exactTextSimilarity: include_exact ? similarity.exact.score : null,
            conceptualOverlap: include_conceptual ? similarity.conceptual.score : null,
            recommendation: similarity.recommendation,
            sharedConcepts: include_conceptual
              ? similarity.conceptual.sharedConcepts?.slice(0, 10)
              : null,
            duplicatedSegments: include_exact ? similarity.exact.duplicatedSegments : null,
          });
        }
      }
    }

    // Group into clusters (documents that are all similar to each other)
    const clusters = this.groupIntoClusters(duplicatePairs, documents);

    return {
      found: true,
      topic,
      totalDocuments: documents.length,
      duplicatePairs: duplicatePairs.length,
      clusters: clusters.map((cluster) => ({
        documents: cluster.documents.map((d) => ({
          path: d.relativePath,
          title: d.frontmatter?.title,
          contentType: d.frontmatter?.content_type,
          wordCount: d.stats?.wordCount,
        })),
        avgSimilarity: cluster.avgSimilarity,
        recommendation: this.generateClusterRecommendation(cluster),
      })),
      topDuplicatePairs: duplicatePairs
        .sort((a, b) => b.overallSimilarity - a.overallSimilarity)
        .slice(0, max_results),
    };
  }

  async findScatteredTopics(args) {
    const { concept, depth, min_fragmentation, max_results, offset } = args;

    if (concept) {
      // Analyze specific concept with depth parameter
      const analysis = this.scatteringAnalyzer.analyzeConceptScattering(concept, depth);

      if (!analysis.found) {
        return analysis;
      }

      // Add consolidation suggestions only for full depth
      if (depth === 'full' && analysis.documentMentions && analysis.documentMentions.length >= 2) {
        const docPaths = analysis.documentMentions
          .slice(0, 5)
          .map((m) => m.path)
          .filter((p) => p);

        if (docPaths.length >= 2) {
          analysis.consolidationSuggestion = await this.suggestConsolidation({
            doc_paths: docPaths,
            include_alternatives: false, // Reduce size
          });
        }
      }

      return analysis;
    } else {
      // Find all scattered topics with depth parameter
      const allScatteredTopics = this.scatteringAnalyzer.findScatteredTopics(
        min_fragmentation,
        depth,
      );

      // Apply pagination
      const start = offset || 0;
      const end = start + (max_results || 20);
      const paginatedTopics = allScatteredTopics.slice(start, end);

      return {
        found: true,
        totalScatteredTopics: allScatteredTopics.length,
        offset: start,
        limit: max_results || 20,
        hasMore: end < allScatteredTopics.length,
        topics: paginatedTopics.map((topic) => {
          const result = {
            concept: topic.conceptName,
            fragmentationScore: topic.fragmentationScore,
            documentCount: topic.metrics.totalDocuments,
            maxConcentration: topic.metrics.maxConcentration,
          };

          // Add fields based on depth
          if (depth !== 'basic') {
            result.recommendation = topic.recommendation;
          }

          if (depth === 'full') {
            result.directorySpread = topic.directoryDistribution?.length;
            result.navigationIssuesCount = topic.navigationIssues?.length;
            // Include top 3 documents
            if (topic.documentMentions) {
              result.topDocuments = topic.documentMentions.slice(0, 3).map((m) => ({
                path: m.path,
                weight: m.weight,
                percentage: m.percentage?.toFixed(1) + '%',
              }));
            }
          }

          return result;
        }),
      };
    }
  }

  async suggestConsolidation(args) {
    const { doc_paths, include_alternatives } = args;

    const result = this.consolidationEngine.suggestConsolidation(doc_paths);

    if (!include_alternatives && result.strategy) {
      // Return only the top recommendation
      result.strategy = result.strategy.slice(0, 1);
    }

    return result;
  }

  async findContentOverlaps(args) {
    const { doc_path_1, doc_path_2, detailed } = args;

    const doc1 = this.dataLoader.getDocument(doc_path_1);
    const doc2 = this.dataLoader.getDocument(doc_path_2);

    if (!doc1) {
      return { error: `Document not found: ${doc_path_1}` };
    }

    if (!doc2) {
      return { error: `Document not found: ${doc_path_2}` };
    }

    const similarity = this.similarityEngine.calculateComprehensiveSimilarity(doc1, doc2);

    const result = {
      doc1: {
        path: doc1.relativePath,
        title: doc1.frontmatter?.title,
        contentType: doc1.frontmatter?.content_type,
        wordCount: doc1.stats?.wordCount,
      },
      doc2: {
        path: doc2.relativePath,
        title: doc2.frontmatter?.title,
        contentType: doc2.frontmatter?.content_type,
        wordCount: doc2.stats?.wordCount,
      },
      overallSimilarity: similarity.overallScore,
      isDuplicate: similarity.isDuplicate,
      recommendation: similarity.recommendation,
      breakdown: {
        exactTextSimilarity: similarity.exact.score,
        conceptualOverlap: similarity.conceptual.score,
        semanticSimilarity: similarity.semantic.score,
      },
    };

    if (detailed) {
      result.sharedConcepts = similarity.conceptual.sharedConcepts;
      result.duplicatedTextSegments = similarity.exact.duplicatedSegments;
      result.conceptualAnalysis = {
        doc1ConceptCount: similarity.conceptual.conceptCount1,
        doc2ConceptCount: similarity.conceptual.conceptCount2,
        sharedConceptCount: similarity.conceptual.sharedCount,
      };
    }

    return result;
  }

  // TIER 2 TOOL HANDLERS

  async findSimilarDocuments(args) {
    const { doc_path, limit, min_similarity } = args;

    const doc = this.dataLoader.getDocument(doc_path);

    if (!doc) {
      return { error: `Document not found: ${doc_path}` };
    }

    const similar = this.similarityEngine.findSimilarDocuments(doc, min_similarity, limit);

    return {
      found: true,
      document: {
        path: doc.relativePath,
        title: doc.frontmatter?.title,
      },
      similarDocuments: similar.map((s) => ({
        path: s.document.relativePath,
        title: s.document.frontmatter?.title,
        contentType: s.document.frontmatter?.content_type,
        similarity: s.similarity.overallScore,
        recommendation: s.similarity.recommendation,
      })),
      totalFound: similar.length,
    };
  }

  async analyzeTopicDistribution(args) {
    const { concept, include_recommendations } = args;

    // Use 'semantic' depth for balanced output
    const analysis = this.scatteringAnalyzer.analyzeConceptScattering(concept, 'semantic');

    if (!analysis.found) {
      return analysis;
    }

    const result = {
      concept: analysis.conceptName,
      distribution: {
        totalDocuments: analysis.metrics.totalDocuments,
        totalWeight: analysis.metrics.totalWeight,
        averageWeight: analysis.metrics.averageWeight,
        maxConcentration: analysis.metrics.maxConcentration,
      },
      scattering: {
        isScattered: analysis.isScattered,
        fragmentationScore: analysis.fragmentationScore,
        giniCoefficient: analysis.metrics.giniCoefficient,
      },
    };

    // Add directory distribution if available
    if (analysis.directoryDistribution) {
      result.byDirectory = analysis.directoryDistribution;
    }

    // Add document mentions if available (already formatted in semantic mode)
    if (analysis.documentMentions) {
      result.topDocuments = analysis.documentMentions;
    }

    // Add navigation issues if available
    if (analysis.navigationIssues) {
      result.navigationIssues = analysis.navigationIssues;
    }

    if (include_recommendations) {
      result.recommendations = analysis.recommendation;
    }

    return result;
  }

  async findOrphanedContent(args) {
    const { include_partial_orphans, filter_directory, filter_content_type, max_results } = args;

    let documents = this.dataLoader.getAllDocuments();

    // Apply filters
    if (filter_directory) {
      documents = documents.filter((d) => d.directory === filter_directory);
    }

    if (filter_content_type) {
      documents = documents.filter((d) => d.frontmatter?.content_type === filter_content_type);
    }

    // Find orphaned documents
    const orphaned = documents.filter((d) => d.navigation?.isOrphaned);

    // Find partially orphaned (weak connections)
    const partiallyOrphaned = [];
    if (include_partial_orphans) {
      for (const doc of documents) {
        if (doc.navigation?.isOrphaned) continue;

        // Check connection strength
        const docNode = this.dataLoader.getGraphNode(doc.path);
        if (!docNode) continue;

        const edges = this.dataLoader.getGraphEdges(docNode.id);
        const linkEdges = edges.filter((e) => e.type === 'links_to');

        if (linkEdges.length <= 2) {
          partiallyOrphaned.push({
            document: doc,
            linkCount: linkEdges.length,
          });
        }
      }
    }

    // Apply max_results limit
    const limit = max_results || 50;
    const limitedOrphaned = orphaned.slice(0, limit);
    const limitedPartiallyOrphaned = partiallyOrphaned.slice(0, limit);

    return {
      found: true,
      totalOrphaned: orphaned.length,
      totalPartiallyOrphaned: partiallyOrphaned.length,
      showing: limitedOrphaned.length,
      orphanedDocuments: limitedOrphaned.map((d) => ({
        path: d.relativePath,
        title: d.frontmatter?.title,
        contentType: d.frontmatter?.content_type,
        directory: d.directory,
      })),
      partiallyOrphanedDocuments: include_partial_orphans
        ? limitedPartiallyOrphaned.map((p) => ({
            path: p.document.relativePath,
            title: p.document.frontmatter?.title,
            linkCount: p.linkCount,
          }))
        : undefined,
      recommendation:
        orphaned.length > 0
          ? 'Add these documents to the navigation structure (sidebars.js) or link them from existing documents'
          : 'No orphaned content found',
    };
  }

  async suggestCanonicalReference(args) {
    const { topic, include_alternatives } = args;

    const result = this.consolidationEngine.suggestCanonicalReference(topic);

    if (!include_alternatives && result.alternatives) {
      delete result.alternatives;
    }

    // Use document references instead of full objects
    if (result.recommendation?.document) {
      result.recommendation.document = toDocumentReference(result.recommendation.document);
    }

    if (result.alternatives && Array.isArray(result.alternatives)) {
      result.alternatives = result.alternatives.map((alt) => ({
        ...alt,
        document: toDocumentReference(alt.document),
      }));
    }

    return result;
  }

  async getDocumentDetails(args) {
    const { doc_path, include_content, include_concepts } = args;

    const doc = this.dataLoader.getDocument(doc_path);

    if (!doc) {
      return {
        found: false,
        error: `Document not found: ${doc_path}`,
        suggestion: 'Check the document path and try again',
      };
    }

    const result = {
      found: true,
      document: {
        path: doc.relativePath,
        absolutePath: doc.path,
        title: doc.frontmatter?.title,
        description: doc.frontmatter?.description,
        contentType: doc.frontmatter?.content_type,
        author: doc.frontmatter?.author,
        userStory: doc.frontmatter?.user_story,
        directory: doc.directory,
        wordCount: doc.stats?.wordCount,
        headingCount: doc.stats?.headingCount,
      },
      navigation: {
        isOrphaned: doc.navigation?.isOrphaned,
        sidebarLabel: doc.frontmatter?.sidebar_label,
        sidebarPosition: doc.frontmatter?.sidebar_position,
      },
      links: {
        internal: doc.links?.internal?.length || 0,
        external: doc.links?.external?.length || 0,
      },
    };

    if (include_content) {
      result.document.content = doc.content;
      result.document.excerpt = doc.content?.substring(0, 500) + '...';
    }

    if (include_concepts) {
      // Find concepts mentioned in this document
      const concepts = [];

      for (const concept of this.dataLoader.concepts.topConcepts || []) {
        const files = concept.data?.files || {};
        const weight = files[doc.path] || files[doc.relativePath];

        if (weight) {
          concepts.push({
            concept: concept.concept,
            weight,
            category: concept.data?.category,
          });
        }
      }

      // Sort by weight and limit to top 20
      concepts.sort((a, b) => b.weight - a.weight);
      result.concepts = concepts.slice(0, 20);
    }

    return result;
  }

  // Helper methods

  groupIntoClusters(duplicatePairs, allDocuments) {
    // Build adjacency map
    const adjacency = new Map();

    for (const pair of duplicatePairs) {
      const path1 = pair.doc1.path;
      const path2 = pair.doc2.path;

      if (!adjacency.has(path1)) adjacency.set(path1, new Set());
      if (!adjacency.has(path2)) adjacency.set(path2, new Set());

      adjacency.get(path1).add(path2);
      adjacency.get(path2).add(path1);
    }

    // Find connected components (clusters)
    const visited = new Set();
    const clusters = [];

    for (const [path, neighbors] of adjacency) {
      if (visited.has(path)) continue;

      const cluster = new Set();
      const queue = [path];

      while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;

        visited.add(current);
        cluster.add(current);

        const currentNeighbors = adjacency.get(current);
        if (currentNeighbors) {
          for (const neighbor of currentNeighbors) {
            if (!visited.has(neighbor)) {
              queue.push(neighbor);
            }
          }
        }
      }

      if (cluster.size > 1) {
        const clusterDocs = Array.from(cluster)
          .map((path) => allDocuments.find((d) => d.relativePath === path))
          .filter((d) => d);

        // Calculate average similarity within cluster
        const clusterPairs = duplicatePairs.filter(
          (p) => cluster.has(p.doc1.path) && cluster.has(p.doc2.path),
        );

        const avgSimilarity =
          clusterPairs.length > 0
            ? clusterPairs.reduce((sum, p) => sum + p.overallSimilarity, 0) / clusterPairs.length
            : 0;

        clusters.push({
          documents: clusterDocs,
          avgSimilarity,
          pairCount: clusterPairs.length,
        });
      }
    }

    return clusters.sort((a, b) => b.avgSimilarity - a.avgSimilarity);
  }

  generateClusterRecommendation(cluster) {
    if (cluster.avgSimilarity >= 0.9) {
      return `URGENT: ${cluster.documents.length} highly similar documents should be merged immediately`;
    } else if (cluster.avgSimilarity >= 0.8) {
      return `HIGH PRIORITY: Consider consolidating these ${cluster.documents.length} documents`;
    } else if (cluster.avgSimilarity >= 0.7) {
      return `Review these ${cluster.documents.length} documents for potential consolidation`;
    } else {
      return `Monitor these ${cluster.documents.length} related documents`;
    }
  }
}
