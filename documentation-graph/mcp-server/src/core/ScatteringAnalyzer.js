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
 * ScatteringAnalyzer - Detects topic scattering and fragmentation
 *
 * Identifies when a single concept or topic is fragmented across multiple documents,
 * making it hard for users to find comprehensive information.
 */

import { logger } from '../utils/logger.js';

export class ScatteringAnalyzer {
  constructor(graph, documents, concepts, cacheManager) {
    this.graph = graph;
    this.documents = documents;
    this.concepts = concepts;
    this.cacheManager = cacheManager;

    // Scattering thresholds
    this.thresholds = {
      minDocuments: 3, // Concept must appear in at least 3 docs to be scattered
      maxConcentration: 0.3, // If <30% of weight in single doc, it's scattered
      fragmentationScore: 0.6, // Composite score threshold
    };
  }

  updateData(graph, documents, concepts) {
    this.graph = graph;
    this.documents = documents;
    this.concepts = concepts;
  }

  /**
   * Analyze scattering for a specific concept
   */
  analyzeConceptScattering(conceptName) {
    const cacheKey = `scattering:${conceptName.toLowerCase()}`;
    const cached = this.cacheManager.get(cacheKey);
    if (cached !== null) return cached;

    const concept = this.concepts.topConcepts.find(
      (c) => c.concept.toLowerCase() === conceptName.toLowerCase(),
    );

    if (!concept) {
      return {
        found: false,
        conceptName,
        error: 'Concept not found',
      };
    }

    // Get all documents mentioning this concept
    const files = concept.data?.files || {};
    const documentMentions = Object.entries(files).map(([path, weight]) => {
      const doc = this.documents.find((d) => d.path === path || d.relativePath === path);
      return {
        path,
        weight,
        document: doc,
      };
    });

    const totalWeight = concept.data?.totalWeight || 0;
    const docCount = documentMentions.length;

    // Calculate concentration metrics
    const weightDistribution = documentMentions.map((m) => ({
      ...m,
      percentage: totalWeight > 0 ? (m.weight / totalWeight) * 100 : 0,
    }));

    // Sort by weight descending
    weightDistribution.sort((a, b) => b.weight - a.weight);

    // Calculate Gini coefficient for weight distribution (0 = even, 1 = concentrated)
    const giniCoefficient = this.calculateGiniCoefficient(weightDistribution.map((w) => w.weight));

    // Calculate scattering score
    const maxConcentration = weightDistribution.length > 0 ? weightDistribution[0].percentage : 0;
    const isScattered =
      docCount >= this.thresholds.minDocuments &&
      maxConcentration < this.thresholds.maxConcentration * 100;

    // Calculate fragmentation score (composite metric)
    const fragmentationScore = this.calculateFragmentationScore(
      docCount,
      maxConcentration,
      giniCoefficient,
    );

    // Group by directory to detect cross-section scattering
    const directoryDistribution = this.groupByDirectory(weightDistribution);

    // Detect navigation/discoverability issues
    const navigationIssues = this.detectNavigationIssues(weightDistribution);

    const result = {
      found: true,
      conceptName: concept.concept,
      isScattered,
      fragmentationScore,
      metrics: {
        totalDocuments: docCount,
        totalWeight,
        maxConcentration: maxConcentration.toFixed(2) + '%',
        giniCoefficient: giniCoefficient.toFixed(3),
        averageWeight: totalWeight / docCount,
      },
      documentMentions: weightDistribution,
      directoryDistribution,
      navigationIssues,
      recommendation: this.generateScatteringRecommendation(
        isScattered,
        fragmentationScore,
        docCount,
        maxConcentration,
        directoryDistribution,
        navigationIssues,
      ),
    };

    this.cacheManager.set(cacheKey, result);
    return result;
  }

  /**
   * Find all scattered topics across the documentation
   */
  findScatteredTopics(minFragmentationScore = 0.6) {
    const scatteredTopics = [];

    for (const concept of this.concepts.topConcepts) {
      const analysis = this.analyzeConceptScattering(concept.concept);

      if (analysis.isScattered && analysis.fragmentationScore >= minFragmentationScore) {
        scatteredTopics.push(analysis);
      }
    }

    // Sort by fragmentation score descending
    scatteredTopics.sort((a, b) => b.fragmentationScore - a.fragmentationScore);

    return scatteredTopics;
  }

  /**
   * Analyze topic distribution for a specific document
   */
  analyzeDocumentTopicDistribution(docPath) {
    const doc = this.documents.find((d) => d.path === docPath || d.relativePath === docPath);

    if (!doc) {
      return {
        found: false,
        error: 'Document not found',
      };
    }

    // Find all concepts in this document
    const conceptMentions = [];

    for (const concept of this.concepts.topConcepts) {
      const files = concept.data?.files || {};
      const weight = files[doc.path] || files[doc.relativePath];

      if (weight) {
        conceptMentions.push({
          concept: concept.concept,
          weight,
          category: concept.data?.category,
          scattering: this.analyzeConceptScattering(concept.concept),
        });
      }
    }

    // Sort by weight descending
    conceptMentions.sort((a, b) => b.weight - a.weight);

    // Identify which concepts are scattered
    const scatteredConcepts = conceptMentions.filter((c) => c.scattering.isScattered);

    return {
      found: true,
      document: {
        path: doc.path,
        title: doc.frontmatter?.title,
        contentType: doc.frontmatter?.content_type,
      },
      totalConcepts: conceptMentions.length,
      scatteredConcepts: scatteredConcepts.length,
      concepts: conceptMentions.slice(0, 20), // Top 20
      recommendation:
        scatteredConcepts.length > 5
          ? `This document touches on ${scatteredConcepts.length} scattered topics - consider if it should be split or if it could serve as a canonical reference`
          : 'Topic distribution looks reasonable',
    };
  }

  // Helper methods

  calculateGiniCoefficient(weights) {
    if (weights.length === 0) return 0;

    const sorted = [...weights].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);

    if (sum === 0) return 0;

    let numerator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (2 * (i + 1) - n - 1) * sorted[i];
    }

    return numerator / (n * sum);
  }

  calculateFragmentationScore(docCount, maxConcentration, giniCoefficient) {
    // Higher score = more fragmented
    // Factors:
    // 1. Number of documents (more docs = more fragmented)
    // 2. Low max concentration (no dominant document)
    // 3. Low Gini coefficient (even distribution)

    const docCountScore = Math.min(docCount / 10, 1.0); // Normalize to [0,1]
    const concentrationScore = 1 - maxConcentration / 100; // Invert: low concentration = high score
    const giniScore = 1 - giniCoefficient; // Invert: low Gini = high score

    // Weighted combination
    return docCountScore * 0.3 + concentrationScore * 0.4 + giniScore * 0.3;
  }

  groupByDirectory(weightDistribution) {
    const byDirectory = new Map();

    for (const item of weightDistribution) {
      if (!item.document) continue;

      const dir = item.document.directory;
      if (!byDirectory.has(dir)) {
        byDirectory.set(dir, {
          directory: dir,
          documents: [],
          totalWeight: 0,
          percentage: 0,
        });
      }

      const dirData = byDirectory.get(dir);
      dirData.documents.push(item);
      dirData.totalWeight += item.weight;
    }

    // Calculate percentages
    const totalWeight = weightDistribution.reduce((sum, item) => sum + item.weight, 0);
    for (const dirData of byDirectory.values()) {
      dirData.percentage = totalWeight > 0 ? (dirData.totalWeight / totalWeight) * 100 : 0;
    }

    // Convert to array and sort by weight
    const result = Array.from(byDirectory.values()).sort((a, b) => b.totalWeight - a.totalWeight);

    return result;
  }

  detectNavigationIssues(weightDistribution) {
    const issues = [];

    // Check if documents are orphaned (not in navigation)
    const orphanedDocs = weightDistribution.filter((item) => item.document?.navigation?.isOrphaned);

    if (orphanedDocs.length > 0) {
      issues.push({
        type: 'ORPHANED_CONTENT',
        severity: 'HIGH',
        count: orphanedDocs.length,
        description: `${orphanedDocs.length} documents are orphaned (not in navigation)`,
        documents: orphanedDocs.map((d) => d.path),
      });
    }

    // Check if documents are in different top-level categories
    const categories = new Set(
      weightDistribution
        .filter((item) => item.document?.navigation?.categories)
        .flatMap((item) => item.document.navigation.categories),
    );

    if (categories.size > 3) {
      issues.push({
        type: 'SCATTERED_NAVIGATION',
        severity: 'MEDIUM',
        count: categories.size,
        description: `Content scattered across ${categories.size} different navigation categories`,
        categories: Array.from(categories),
      });
    }

    // Check if documents have different content types
    const contentTypes = new Set(
      weightDistribution
        .filter((item) => item.document?.frontmatter?.content_type)
        .map((item) => item.document.frontmatter.content_type),
    );

    if (contentTypes.size > 2) {
      issues.push({
        type: 'MIXED_CONTENT_TYPES',
        severity: 'LOW',
        count: contentTypes.size,
        description: `Topic appears in ${contentTypes.size} different content types`,
        contentTypes: Array.from(contentTypes),
      });
    }

    return issues;
  }

  generateScatteringRecommendation(
    isScattered,
    fragmentationScore,
    docCount,
    maxConcentration,
    directoryDistribution,
    navigationIssues,
  ) {
    if (!isScattered) {
      return {
        action: 'NO_ACTION',
        priority: 'LOW',
        description: 'Content is adequately concentrated',
      };
    }

    const recommendations = [];

    // High fragmentation
    if (fragmentationScore >= 0.8) {
      recommendations.push({
        action: 'CREATE_CANONICAL',
        priority: 'HIGH',
        description: `Create a single canonical reference document for this topic (currently in ${docCount} documents)`,
      });
    } else if (fragmentationScore >= 0.6) {
      recommendations.push({
        action: 'CONSOLIDATE',
        priority: 'MEDIUM',
        description: `Consider consolidating related content (currently in ${docCount} documents)`,
      });
    }

    // Low concentration
    if (maxConcentration < 20) {
      recommendations.push({
        action: 'IDENTIFY_PRIMARY',
        priority: 'MEDIUM',
        description: `No dominant document - identify or create a primary reference`,
      });
    }

    // Cross-directory scattering
    if (directoryDistribution.length > 3) {
      recommendations.push({
        action: 'REORGANIZE',
        priority: 'MEDIUM',
        description: `Content scattered across ${directoryDistribution.length} directories - consider reorganization`,
      });
    }

    // Navigation issues
    if (navigationIssues.length > 0) {
      for (const issue of navigationIssues) {
        if (issue.type === 'ORPHANED_CONTENT') {
          recommendations.push({
            action: 'FIX_NAVIGATION',
            priority: 'HIGH',
            description: issue.description,
          });
        }
      }
    }

    return recommendations.length > 0
      ? recommendations
      : [
          {
            action: 'REVIEW',
            priority: 'LOW',
            description: 'Review content distribution',
          },
        ];
  }
}
