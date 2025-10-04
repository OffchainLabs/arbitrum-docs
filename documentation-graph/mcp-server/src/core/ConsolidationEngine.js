/**
 * ConsolidationEngine - Generates consolidation recommendations
 *
 * Analyzes groups of similar/scattered documents and provides actionable
 * recommendations for merging, reorganizing, or creating canonical references.
 */

import { logger } from '../utils/logger.js';

export class ConsolidationEngine {
  constructor(graph, documents, concepts, similarityEngine) {
    this.graph = graph;
    this.documents = documents;
    this.concepts = concepts;
    this.similarityEngine = similarityEngine;
  }

  updateData(graph, documents, concepts) {
    this.graph = graph;
    this.documents = documents;
    this.concepts = concepts;
  }

  /**
   * Suggest consolidation strategy for a group of documents
   */
  suggestConsolidation(documentPaths) {
    if (!Array.isArray(documentPaths) || documentPaths.length < 2) {
      return {
        error: 'At least 2 documents required for consolidation analysis',
      };
    }

    // Resolve document paths
    const docs = documentPaths
      .map((path) => this.documents.find((d) => d.path === path || d.relativePath === path))
      .filter((d) => d !== undefined);

    if (docs.length < 2) {
      return {
        error: 'Could not find all specified documents',
        found: docs.length,
        requested: documentPaths.length,
      };
    }

    // Analyze pairwise similarities
    const similarities = [];
    for (let i = 0; i < docs.length; i++) {
      for (let j = i + 1; j < docs.length; j++) {
        const similarity = this.similarityEngine.calculateComprehensiveSimilarity(docs[i], docs[j]);
        similarities.push({
          doc1: docs[i],
          doc2: docs[j],
          similarity,
        });
      }
    }

    // Calculate average similarity
    const avgSimilarity =
      similarities.reduce((sum, s) => sum + s.similarity.overallScore, 0) / similarities.length;

    // Analyze content types
    const contentTypes = new Map();
    for (const doc of docs) {
      const type = doc.frontmatter?.content_type || 'unknown';
      if (!contentTypes.has(type)) {
        contentTypes.set(type, []);
      }
      contentTypes.get(type).push(doc);
    }

    // Analyze directories
    const directories = new Map();
    for (const doc of docs) {
      if (!directories.has(doc.directory)) {
        directories.set(doc.directory, []);
      }
      directories.get(doc.directory).push(doc);
    }

    // Determine consolidation strategy
    const strategy = this.determineConsolidationStrategy(
      docs,
      avgSimilarity,
      contentTypes,
      directories,
      similarities,
    );

    return {
      documentCount: docs.length,
      averageSimilarity: avgSimilarity.toFixed(3),
      contentTypes: Array.from(contentTypes.entries()).map(([type, docs]) => ({
        type,
        count: docs.length,
      })),
      directories: Array.from(directories.entries()).map(([dir, docs]) => ({
        directory: dir,
        count: docs.length,
      })),
      strategy,
      pairwiseSimilarities: similarities
        .sort((a, b) => b.similarity.overallScore - a.similarity.overallScore)
        .slice(0, 10), // Top 10 most similar pairs
    };
  }

  /**
   * Find canonical reference for a topic
   */
  suggestCanonicalReference(topic) {
    // Find all documents mentioning this topic/concept
    const conceptData = this.concepts.topConcepts.find(
      (c) => c.concept.toLowerCase() === topic.toLowerCase(),
    );

    if (!conceptData) {
      return {
        found: false,
        error: 'Topic/concept not found',
      };
    }

    const files = conceptData.data?.files || {};
    const candidates = Object.entries(files)
      .map(([path, weight]) => {
        const doc = this.documents.find((d) => d.path === path || d.relativePath === path);
        return doc ? { document: doc, weight, path } : null;
      })
      .filter((c) => c !== null);

    if (candidates.length === 0) {
      return {
        found: false,
        error: 'No documents found for this topic',
      };
    }

    // Score each candidate based on multiple factors
    const scoredCandidates = candidates.map((candidate) => {
      const doc = candidate.document;
      const docNode = this.graph.nodes.find(
        (n) => n.type === 'document' && n.filePath === doc.path,
      );

      // Factors for canonical selection:
      // 1. Concept weight in document (how much it focuses on this topic)
      // 2. Document centrality (how well-connected it is)
      // 3. Word count (more comprehensive)
      // 4. Content type (concepts > how-tos > quickstarts)
      // 5. Not orphaned in navigation

      const weightScore = candidate.weight / conceptData.data.totalWeight;

      const centralityScore = docNode
        ? (this.graph.analysis?.centrality?.degree?.values?.[docNode.id] || 0) / 100
        : 0;

      const wordCountScore = Math.min((doc.stats?.wordCount || 0) / 1000, 1.0);

      const contentTypeScores = {
        'concept': 1.0,
        'gentle-introduction': 0.9,
        'tutorial': 0.8,
        'how-to': 0.6,
        'quickstart': 0.4,
        'reference': 0.7,
        'troubleshooting': 0.3,
        'unknown': 0.2,
      };
      const contentTypeScore = contentTypeScores[doc.frontmatter?.content_type] || 0.2;

      const navigationScore = doc.navigation?.isOrphaned ? 0 : 0.2;

      // Weighted combination
      const totalScore =
        weightScore * 0.35 +
        centralityScore * 0.25 +
        wordCountScore * 0.15 +
        contentTypeScore * 0.2 +
        navigationScore * 0.05;

      return {
        ...candidate,
        scores: {
          total: totalScore,
          weight: weightScore,
          centrality: centralityScore,
          wordCount: wordCountScore,
          contentType: contentTypeScore,
          navigation: navigationScore,
        },
      };
    });

    // Sort by total score descending
    scoredCandidates.sort((a, b) => b.scores.total - a.scores.total);

    const topCandidate = scoredCandidates[0];
    const alternatives = scoredCandidates.slice(1, 4); // Top 3 alternatives

    return {
      found: true,
      topic,
      recommendation: {
        document: topCandidate.document,
        confidence: topCandidate.scores.total.toFixed(3),
        reasoning: this.generateCanonicalReasoning(topCandidate),
      },
      alternatives: alternatives.map((alt) => ({
        document: alt.document,
        confidence: alt.scores.total.toFixed(3),
        reasoning: this.generateCanonicalReasoning(alt),
      })),
      totalCandidates: candidates.length,
    };
  }

  /**
   * Identify content gaps based on partial coverage
   */
  identifyContentGaps(topic) {
    const conceptData = this.concepts.topConcepts.find(
      (c) => c.concept.toLowerCase() === topic.toLowerCase(),
    );

    if (!conceptData) {
      return {
        found: false,
        error: 'Topic/concept not found',
      };
    }

    // Find documents that mention this topic
    const files = conceptData.data?.files || {};
    const mentioningDocs = Object.entries(files).map(([path, weight]) => {
      const doc = this.documents.find((d) => d.path === path || d.relativePath === path);
      const percentage = (weight / conceptData.data.totalWeight) * 100;
      return {
        path,
        document: doc,
        weight,
        percentage,
      };
    });

    // Sort by weight
    mentioningDocs.sort((a, b) => b.weight - a.weight);

    // Identify gaps:
    // 1. Many mentions with low weights = topic mentioned but not explained
    // 2. No dominant document = no comprehensive coverage
    // 3. Only appears in certain content types = missing explanations

    const gaps = [];

    // Gap 1: Many shallow mentions
    const shallowMentions = mentioningDocs.filter((m) => m.percentage < 5);
    if (shallowMentions.length >= 5) {
      gaps.push({
        type: 'SHALLOW_COVERAGE',
        severity: 'MEDIUM',
        description: `Topic mentioned in ${shallowMentions.length} documents but never explained in depth`,
        recommendation: 'Create a dedicated concept document explaining this topic',
      });
    }

    // Gap 2: No dominant document
    const maxPercentage = mentioningDocs[0]?.percentage || 0;
    if (maxPercentage < 20 && mentioningDocs.length > 3) {
      gaps.push({
        type: 'NO_COMPREHENSIVE_COVERAGE',
        severity: 'HIGH',
        description: `No single document provides comprehensive coverage (max ${maxPercentage.toFixed(
          1,
        )}%)`,
        recommendation: 'Create or designate a comprehensive guide as canonical reference',
      });
    }

    // Gap 3: Missing content types
    const contentTypes = new Set(
      mentioningDocs.filter((m) => m.document).map((m) => m.document.frontmatter?.content_type),
    );

    const expectedTypes = ['concept', 'how-to', 'reference'];
    const missingTypes = expectedTypes.filter((t) => !contentTypes.has(t));

    if (missingTypes.length > 0) {
      gaps.push({
        type: 'MISSING_CONTENT_TYPES',
        severity: 'LOW',
        description: `Missing content types: ${missingTypes.join(', ')}`,
        recommendation: `Consider creating ${missingTypes.join(' and ')} documents for this topic`,
      });
    }

    return {
      found: true,
      topic,
      gaps,
      coverage: {
        totalMentions: mentioningDocs.length,
        maxConcentration: maxPercentage.toFixed(1) + '%',
        contentTypes: Array.from(contentTypes),
      },
    };
  }

  // Helper methods

  determineConsolidationStrategy(docs, avgSimilarity, contentTypes, directories, similarities) {
    const strategies = [];

    // Strategy 1: High similarity → Merge
    if (avgSimilarity >= 0.8) {
      strategies.push({
        strategy: 'MERGE',
        priority: 'HIGH',
        confidence: avgSimilarity.toFixed(3),
        description: `Documents are highly similar (${(avgSimilarity * 100).toFixed(
          1,
        )}%) - strong candidate for merging into single comprehensive document`,
        steps: [
          'Identify the best base document (highest word count or centrality)',
          'Merge unique content from other documents',
          'Preserve all unique examples and code snippets',
          'Update all internal links to point to consolidated document',
          'Archive or redirect old documents',
        ],
      });
    }

    // Strategy 2: Same content type + same directory → Consolidate
    if (contentTypes.size === 1 && directories.size === 1) {
      strategies.push({
        strategy: 'CONSOLIDATE',
        priority: 'MEDIUM',
        confidence: '0.8',
        description:
          'Documents share same content type and directory - candidates for consolidation',
        steps: [
          'Review each document for unique value',
          'Identify overlapping sections',
          'Create outline for consolidated document',
          'Merge content while preserving distinct perspectives',
          'Update navigation structure',
        ],
      });
    }

    // Strategy 3: Different content types → Create canonical + cross-link
    if (contentTypes.size > 1) {
      strategies.push({
        strategy: 'CANONICAL_WITH_CROSSLINKS',
        priority: 'MEDIUM',
        confidence: '0.7',
        description:
          'Documents serve different purposes - create canonical reference and cross-link',
        steps: [
          'Identify or create a canonical concept document',
          'Keep how-to and quickstart documents separate',
          'Add clear cross-links between all related documents',
          'Ensure canonical document is comprehensive',
          'Link from task-oriented docs to concept doc for background',
        ],
      });
    }

    // Strategy 4: Low similarity → Reorganize only
    if (avgSimilarity < 0.6) {
      strategies.push({
        strategy: 'REORGANIZE',
        priority: 'LOW',
        confidence: '0.5',
        description: 'Documents have moderate overlap - reorganization may be sufficient',
        steps: [
          'Group related documents in same navigation section',
          'Add clear overview/landing page',
          'Improve cross-linking between related docs',
          'Clarify distinct purpose of each document',
        ],
      });
    }

    // Strategy 5: Cross-directory scattering
    if (directories.size > 2) {
      strategies.push({
        strategy: 'CENTRALIZE',
        priority: 'HIGH',
        confidence: '0.75',
        description: `Content scattered across ${directories.size} directories - centralize related content`,
        steps: [
          'Create dedicated section/directory for this topic',
          'Move related documents to common location',
          'Update navigation to group content logically',
          'Add redirects from old locations',
        ],
      });
    }

    // Return strategies sorted by priority
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    strategies.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    return strategies.length > 0
      ? strategies
      : [
          {
            strategy: 'REVIEW',
            priority: 'LOW',
            confidence: '0.3',
            description: 'Documents require manual review',
            steps: ['Review documents for consolidation opportunities'],
          },
        ];
  }

  generateCanonicalReasoning(candidate) {
    const reasons = [];

    if (candidate.scores.weight > 0.3) {
      reasons.push(
        `High topic focus (${(candidate.scores.weight * 100).toFixed(1)}% of total weight)`,
      );
    }

    if (candidate.scores.centrality > 0.1) {
      reasons.push('Well-connected in documentation graph');
    }

    if (candidate.document.stats?.wordCount > 500) {
      reasons.push(`Comprehensive (${candidate.document.stats.wordCount} words)`);
    }

    const contentType = candidate.document.frontmatter?.content_type;
    if (contentType === 'concept' || contentType === 'gentle-introduction') {
      reasons.push(`Appropriate content type (${contentType})`);
    }

    if (!candidate.document.navigation?.isOrphaned) {
      reasons.push('In navigation structure');
    }

    return reasons.length > 0 ? reasons.join('; ') : 'Moderate candidate based on multiple factors';
  }
}
