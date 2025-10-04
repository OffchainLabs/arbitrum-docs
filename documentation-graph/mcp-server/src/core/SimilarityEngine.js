/**
 * SimilarityEngine - Detects content duplication through multiple similarity measures
 *
 * Implements three types of similarity detection:
 * 1. Exact text duplication (using n-grams and Jaccard similarity)
 * 2. Conceptual overlap (based on shared concepts from graph)
 * 3. Semantic similarity (using TF-IDF weighted concept vectors)
 */

import natural from 'natural';
import { logger } from '../utils/logger.js';

const { JaroWinklerDistance, NGrams, TfIdf } = natural;

export class SimilarityEngine {
  constructor(graph, documents, concepts, cacheManager) {
    this.graph = graph;
    this.documents = documents;
    this.concepts = concepts;
    this.cacheManager = cacheManager;

    // Similarity thresholds
    this.thresholds = {
      exact: 0.85, // 85% Jaccard similarity for exact duplication
      conceptual: 0.7, // 70% concept overlap for conceptual duplication
      semantic: 0.75, // 75% cosine similarity for semantic similarity
    };

    // Pre-compute TF-IDF if needed
    this.tfidf = null;
    this.initializeTfIdf();
  }

  updateData(graph, documents, concepts) {
    this.graph = graph;
    this.documents = documents;
    this.concepts = concepts;
    this.initializeTfIdf();
  }

  initializeTfIdf() {
    // Build TF-IDF model from document content
    this.tfidf = new TfIdf();
    for (const doc of this.documents) {
      this.tfidf.addDocument(doc.content || '');
    }
  }

  /**
   * Calculate exact text similarity using n-grams and Jaccard similarity
   */
  calculateExactSimilarity(doc1, doc2) {
    const cacheKey = `exact:${doc1.path}:${doc2.path}`;
    const cached = this.cacheManager.get(cacheKey);
    if (cached !== null) return cached;

    const text1 = this.normalizeText(doc1.content || '');
    const text2 = this.normalizeText(doc2.content || '');

    // Generate trigrams
    const ngrams1 = new Set(NGrams.trigrams(text1));
    const ngrams2 = new Set(NGrams.trigrams(text2));

    // Calculate Jaccard similarity
    const intersection = new Set([...ngrams1].filter((x) => ngrams2.has(x)));
    const union = new Set([...ngrams1, ...ngrams2]);

    const jaccardSimilarity = union.size > 0 ? intersection.size / union.size : 0;

    // Also use Jaro-Winkler for shorter texts
    const jaroWinklerSimilarity = JaroWinklerDistance(text1, text2);

    // Weighted combination
    const similarity = jaccardSimilarity * 0.7 + jaroWinklerSimilarity * 0.3;

    // Find duplicated text segments
    const duplicatedSegments = this.findDuplicatedSegments(doc1.content || '', doc2.content || '');

    const result = {
      score: similarity,
      isDuplicate: similarity >= this.thresholds.exact,
      jaccardSimilarity,
      jaroWinklerSimilarity,
      duplicatedSegments,
    };

    this.cacheManager.set(cacheKey, result);
    return result;
  }

  /**
   * Calculate conceptual overlap based on shared concepts
   */
  calculateConceptualOverlap(doc1, doc2) {
    const cacheKey = `conceptual:${doc1.path}:${doc2.path}`;
    const cached = this.cacheManager.get(cacheKey);
    if (cached !== null) return cached;

    // Get concepts for each document
    const concepts1 = this.getDocumentConcepts(doc1);
    const concepts2 = this.getDocumentConcepts(doc2);

    if (concepts1.length === 0 || concepts2.length === 0) {
      return { score: 0, isDuplicate: false, sharedConcepts: [] };
    }

    // Find shared concepts with weights
    const conceptMap1 = new Map(concepts1.map((c) => [c.concept, c.weight || 1]));
    const conceptMap2 = new Map(concepts2.map((c) => [c.concept, c.weight || 1]));

    const sharedConcepts = [];
    let sharedWeight = 0;
    let totalWeight1 = 0;
    let totalWeight2 = 0;

    for (const [concept, weight] of conceptMap1) {
      totalWeight1 += weight;
      if (conceptMap2.has(concept)) {
        const weight2 = conceptMap2.get(concept);
        const avgWeight = (weight + weight2) / 2;
        sharedWeight += avgWeight;
        sharedConcepts.push({
          concept,
          weight1: weight,
          weight2: weight2,
          avgWeight,
        });
      }
    }

    for (const weight of conceptMap2.values()) {
      totalWeight2 += weight;
    }

    // Calculate overlap using weighted Jaccard
    const avgTotalWeight = (totalWeight1 + totalWeight2) / 2;
    const overlapScore = avgTotalWeight > 0 ? sharedWeight / avgTotalWeight : 0;

    // Sort shared concepts by average weight
    sharedConcepts.sort((a, b) => b.avgWeight - a.avgWeight);

    const result = {
      score: overlapScore,
      isDuplicate: overlapScore >= this.thresholds.conceptual,
      sharedConcepts: sharedConcepts.slice(0, 20), // Top 20
      conceptCount1: concepts1.length,
      conceptCount2: concepts2.length,
      sharedCount: sharedConcepts.length,
    };

    this.cacheManager.set(cacheKey, result);
    return result;
  }

  /**
   * Calculate semantic similarity using TF-IDF weighted vectors
   */
  calculateSemanticSimilarity(doc1, doc2) {
    const cacheKey = `semantic:${doc1.path}:${doc2.path}`;
    const cached = this.cacheManager.get(cacheKey);
    if (cached !== null) return cached;

    // Get document indexes
    const idx1 = this.documents.findIndex((d) => d.path === doc1.path);
    const idx2 = this.documents.findIndex((d) => d.path === doc2.path);

    if (idx1 === -1 || idx2 === -1) {
      return { score: 0, isDuplicate: false };
    }

    // Get TF-IDF vectors
    const terms = new Set();
    this.tfidf.listTerms(idx1).forEach((item) => terms.add(item.term));
    this.tfidf.listTerms(idx2).forEach((item) => terms.add(item.term));

    const vector1 = [];
    const vector2 = [];

    for (const term of terms) {
      vector1.push(this.tfidf.tfidf(term, idx1));
      vector2.push(this.tfidf.tfidf(term, idx2));
    }

    // Calculate cosine similarity
    const cosineSimilarity = this.cosineSimilarity(vector1, vector2);

    const result = {
      score: cosineSimilarity,
      isDuplicate: cosineSimilarity >= this.thresholds.semantic,
    };

    this.cacheManager.set(cacheKey, result);
    return result;
  }

  /**
   * Calculate comprehensive similarity combining all measures
   */
  calculateComprehensiveSimilarity(doc1, doc2) {
    const exact = this.calculateExactSimilarity(doc1, doc2);
    const conceptual = this.calculateConceptualOverlap(doc1, doc2);
    const semantic = this.calculateSemanticSimilarity(doc1, doc2);

    // Weighted combination: exact (40%), conceptual (35%), semantic (25%)
    const overallScore = exact.score * 0.4 + conceptual.score * 0.35 + semantic.score * 0.25;

    return {
      overallScore,
      isDuplicate: overallScore >= 0.7, // Overall threshold
      exact,
      conceptual,
      semantic,
      recommendation: this.generateSimilarityRecommendation(
        overallScore,
        exact,
        conceptual,
        semantic,
      ),
    };
  }

  /**
   * Find all similar documents to a given document
   */
  findSimilarDocuments(doc, minSimilarity = 0.7, limit = 10) {
    const similarities = [];

    for (const otherDoc of this.documents) {
      if (otherDoc.path === doc.path) continue;

      const similarity = this.calculateComprehensiveSimilarity(doc, otherDoc);

      if (similarity.overallScore >= minSimilarity) {
        similarities.push({
          document: otherDoc,
          similarity,
        });
      }
    }

    // Sort by overall score descending
    similarities.sort((a, b) => b.similarity.overallScore - a.similarity.overallScore);

    return similarities.slice(0, limit);
  }

  /**
   * Find duplicate clusters across all documents
   */
  findDuplicateClusters(minSimilarity = 0.7) {
    const processed = new Set();
    const clusters = [];

    for (const doc of this.documents) {
      if (processed.has(doc.path)) continue;

      const similar = this.findSimilarDocuments(doc, minSimilarity, 50);

      if (similar.length > 0) {
        const cluster = {
          documents: [doc, ...similar.map((s) => s.document)],
          similarities: similar,
          avgSimilarity:
            similar.reduce((sum, s) => sum + s.similarity.overallScore, 0) / similar.length,
        };

        clusters.push(cluster);

        // Mark all documents in cluster as processed
        processed.add(doc.path);
        similar.forEach((s) => processed.add(s.document.path));
      }
    }

    // Sort clusters by average similarity
    clusters.sort((a, b) => b.avgSimilarity - a.avgSimilarity);

    return clusters;
  }

  // Helper methods

  normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  findDuplicatedSegments(text1, text2, minLength = 50) {
    // Find common substrings of at least minLength characters
    const segments = [];
    const sentences1 = text1.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentences2 = text2.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    for (const sent1 of sentences1) {
      for (const sent2 of sentences2) {
        if (sent1.trim().length < minLength) continue;

        const similarity = JaroWinklerDistance(
          this.normalizeText(sent1),
          this.normalizeText(sent2),
        );

        if (similarity > 0.9) {
          segments.push({
            text: sent1.trim(),
            similarity,
          });
        }
      }
    }

    return segments.slice(0, 5); // Top 5 duplicated segments
  }

  getDocumentConcepts(doc) {
    // Extract concepts mentioned in this document from the graph
    const concepts = [];

    // Find all concept nodes connected to this document
    const docNode = this.graph.nodes.find((n) => n.type === 'document' && n.filePath === doc.path);

    if (!docNode) return concepts;

    // Find edges from document to concepts
    const mentionEdges = this.graph.edges.filter(
      (e) => e.source === docNode.id && e.type === 'mentions',
    );

    for (const edge of mentionEdges) {
      const conceptNode = this.graph.nodes.find((n) => n.id === edge.target);
      if (conceptNode && conceptNode.type === 'concept') {
        concepts.push({
          concept: conceptNode.label,
          weight: edge.weight || 1,
        });
      }
    }

    return concepts;
  }

  cosineSimilarity(vec1, vec2) {
    if (vec1.length !== vec2.length || vec1.length === 0) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  generateSimilarityRecommendation(overallScore, exact, conceptual, semantic) {
    if (overallScore >= 0.9) {
      return 'HIGHLY_DUPLICATE - Strong candidate for consolidation';
    } else if (overallScore >= 0.8) {
      return 'DUPLICATE - Consider merging or creating canonical reference';
    } else if (overallScore >= 0.7) {
      return 'SIMILAR - Review for potential redundancy';
    } else if (exact.score >= 0.85) {
      return 'EXACT_TEXT_MATCH - Check for copy-pasted content';
    } else if (conceptual.score >= 0.75) {
      return 'CONCEPTUAL_OVERLAP - May cover similar topics differently';
    } else {
      return 'RELATED - Documents share some concepts';
    }
  }
}
