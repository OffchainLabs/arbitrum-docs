/**
 * ToolRegistry - Defines and executes all MCP tools
 *
 * Implements Tier 1 (must-have) and Tier 2 (nice-to-have) tools for
 * content duplication and topic scattering analysis.
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';

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
    ];
  }

  listTools() {
    return this.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema.shape,
    }));
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
    const { topic, min_similarity, include_exact, include_conceptual } = args;

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
        .slice(0, 10),
    };
  }

  async findScatteredTopics(args) {
    const { concept, depth, min_fragmentation } = args;

    if (concept) {
      // Analyze specific concept
      const analysis = this.scatteringAnalyzer.analyzeConceptScattering(concept);

      if (!analysis.found) {
        return analysis;
      }

      // Enhance based on depth
      if (depth === 'full') {
        // Add consolidation suggestions
        const docPaths = analysis.documentMentions
          .slice(0, 5)
          .map((m) => m.document?.relativePath)
          .filter((p) => p);

        if (docPaths.length >= 2) {
          analysis.consolidationSuggestion = await this.suggestConsolidation({
            doc_paths: docPaths,
            include_alternatives: true,
          });
        }
      }

      return analysis;
    } else {
      // Find all scattered topics
      const scatteredTopics = this.scatteringAnalyzer.findScatteredTopics(min_fragmentation);

      return {
        found: true,
        totalScatteredTopics: scatteredTopics.length,
        topics: scatteredTopics.slice(0, 20).map((topic) => ({
          concept: topic.conceptName,
          fragmentationScore: topic.fragmentationScore,
          documentCount: topic.metrics.totalDocuments,
          maxConcentration: topic.metrics.maxConcentration,
          recommendation: depth !== 'basic' ? topic.recommendation : undefined,
          directorySpread: depth === 'full' ? topic.directoryDistribution.length : undefined,
          navigationIssues: depth === 'full' ? topic.navigationIssues.length : undefined,
        })),
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

    const analysis = this.scatteringAnalyzer.analyzeConceptScattering(concept);

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
      byDirectory: analysis.directoryDistribution.map((dir) => ({
        directory: dir.directory,
        documentCount: dir.documents.length,
        percentage: dir.percentage.toFixed(1) + '%',
      })),
      topDocuments: analysis.documentMentions.slice(0, 10).map((m) => ({
        path: m.document?.relativePath,
        title: m.document?.frontmatter?.title,
        weight: m.weight,
        percentage: m.percentage.toFixed(1) + '%',
      })),
      navigationIssues: analysis.navigationIssues,
    };

    if (include_recommendations) {
      result.recommendations = analysis.recommendation;
    }

    return result;
  }

  async findOrphanedContent(args) {
    const { include_partial_orphans, filter_directory, filter_content_type } = args;

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

    return {
      found: true,
      totalOrphaned: orphaned.length,
      totalPartiallyOrphaned: partiallyOrphaned.length,
      orphanedDocuments: orphaned.map((d) => ({
        path: d.relativePath,
        title: d.frontmatter?.title,
        contentType: d.frontmatter?.content_type,
        directory: d.directory,
      })),
      partiallyOrphanedDocuments: include_partial_orphans
        ? partiallyOrphaned.map((p) => ({
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
