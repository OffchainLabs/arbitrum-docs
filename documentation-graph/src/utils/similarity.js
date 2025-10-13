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
 * Text Similarity Utilities
 *
 * Consolidates string similarity calculations used throughout the codebase.
 * Previously duplicated across:
 * - src/index.js (tokenizeString, calculateStringSimilarity)
 * - src/extractors/conceptExtractor.js (jaccardSimilarity, generateNgrams)
 * - src/builders/graphBuilder.js (similarity calculation)
 * - mcp-server/src/core/SimilarityEngine.js (another implementation)
 */

import THRESHOLDS from '../../config/thresholds.js';

/**
 * Text Similarity Calculator
 *
 * Provides multiple similarity algorithms optimized for different use cases:
 * - Token-based Jaccard similarity (fast, good for documents/phrases)
 * - Character n-gram Jaccard similarity (accurate, good for terms/words)
 * - Fast pre-filtering (very fast, for ruling out obvious non-matches)
 */
export class TextSimilarity {
  constructor() {
    // Cache for n-gram calculations to improve performance
    this.ngramCache = new Map();
    this.maxCacheSize = 1000;
  }

  /**
   * Tokenize a string into words
   * @param {string} str - String to tokenize
   * @returns {Set<string>} Set of lowercase tokens
   */
  tokenizeString(str) {
    if (!str) return new Set();
    return new Set(
      str
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 0),
    );
  }

  /**
   * Calculate token-based Jaccard similarity
   * Good for comparing documents or phrases
   *
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  calculateTokenSimilarity(str1, str2) {
    const words1 = this.tokenizeString(str1);
    const words2 = this.tokenizeString(str2);

    if (words1.size === 0 && words2.size === 0) return 1.0;
    if (words1.size === 0 || words2.size === 0) return 0.0;

    const intersection = new Set([...words1].filter((word) => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Generate character n-grams from a string
   * @param {string} str - Input string
   * @param {number} n - N-gram size (default: 2 for bigrams)
   * @returns {Set<string>} Set of n-grams
   */
  generateNgrams(str, n = 2) {
    if (!str || str.length < n) return new Set();

    // Check cache
    const cacheKey = `${str}:${n}`;
    if (this.ngramCache.has(cacheKey)) {
      return this.ngramCache.get(cacheKey);
    }

    const ngrams = new Set();
    for (let i = 0; i <= str.length - n; i++) {
      ngrams.add(str.slice(i, i + n));
    }

    // Implement LRU cache behavior
    if (this.ngramCache.size >= this.maxCacheSize) {
      const firstKey = this.ngramCache.keys().next().value;
      this.ngramCache.delete(firstKey);
    }

    this.ngramCache.set(cacheKey, ngrams);
    return ngrams;
  }

  /**
   * Calculate Jaccard similarity using character n-grams
   * More accurate for single terms/words than token-based similarity
   *
   * @param {string} term1 - First term
   * @param {string} term2 - Second term
   * @param {number} n - N-gram size (default: 2)
   * @returns {number} Similarity score (0-1)
   */
  calculateNgramSimilarity(term1, term2, n = 2) {
    if (!term1 || !term2) return 0.0;
    if (term1 === term2) return 1.0;

    const ngrams1 = this.generateNgrams(term1, n);
    const ngrams2 = this.generateNgrams(term2, n);

    if (ngrams1.size === 0 && ngrams2.size === 0) return 1.0;
    if (ngrams1.size === 0 || ngrams2.size === 0) return 0.0;

    const intersection = new Set([...ngrams1].filter((x) => ngrams2.has(x)));
    const union = new Set([...ngrams1, ...ngrams2]);

    return intersection.size / union.size;
  }

  /**
   * Fast similarity pre-check
   * Quickly filters out obviously dissimilar terms without expensive calculations
   *
   * @param {string} term1 - First term
   * @param {string} term2 - Second term
   * @returns {boolean} True if terms might be similar (pass to detailed check)
   */
  fastSimilarityCheck(term1, term2) {
    if (!term1 || !term2) return false;
    if (term1 === term2) return true;

    // Check length difference
    const lenDiff = Math.abs(term1.length - term2.length);
    if (lenDiff > Math.max(term1.length, term2.length) * THRESHOLDS.similarity.lengthDifference) {
      return false;
    }

    // Check for substring relationships
    if (term1.includes(term2) || term2.includes(term1)) {
      return true;
    }

    // Check character overlap
    const chars1 = new Set(term1);
    const chars2 = new Set(term2);
    const intersection = new Set([...chars1].filter((x) => chars2.has(x)));
    const union = new Set([...chars1, ...chars2]);

    return intersection.size / union.size > THRESHOLDS.similarity.fastCheck;
  }

  /**
   * Check if two terms are similar enough to be merged
   * Uses n-gram similarity with configurable threshold
   *
   * @param {string} term1 - First term
   * @param {string} term2 - Second term
   * @returns {boolean} True if terms should be merged
   */
  areSimilarTerms(term1, term2) {
    if (!term1 || !term2) return false;
    if (term1 === term2) return true;

    // Fast pre-check
    if (!this.fastSimilarityCheck(term1, term2)) {
      return false;
    }

    // Detailed similarity check
    const similarity = this.calculateNgramSimilarity(term1, term2);
    return (
      similarity > THRESHOLDS.similarity.conceptMerge ||
      term1.includes(term2) ||
      term2.includes(term1)
    );
  }

  /**
   * Check if similarity exceeds edge creation threshold
   * Used for determining when to create edges in knowledge graphs
   *
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @param {boolean} useTokens - Use token-based similarity (default: false, uses n-grams)
   * @returns {boolean} True if similarity exceeds threshold
   */
  meetsEdgeThreshold(str1, str2, useTokens = false) {
    const similarity = useTokens
      ? this.calculateTokenSimilarity(str1, str2)
      : this.calculateNgramSimilarity(str1, str2);

    return similarity > THRESHOLDS.similarity.edgeCreation;
  }

  /**
   * Clear the n-gram cache
   * Useful for freeing memory after processing large batches
   */
  clearCache() {
    this.ngramCache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats (size, maxSize)
   */
  getCacheStats() {
    return {
      size: this.ngramCache.size,
      maxSize: this.maxCacheSize,
      usage: (this.ngramCache.size / this.maxCacheSize) * 100,
    };
  }
}

// Export singleton instance for convenience
export const similarity = new TextSimilarity();

// Export individual functions for backward compatibility
export const tokenizeString = (str) => similarity.tokenizeString(str);
export const calculateStringSimilarity = (str1, str2) =>
  similarity.calculateTokenSimilarity(str1, str2);
export const jaccardSimilarity = (term1, term2) =>
  similarity.calculateNgramSimilarity(term1, term2);
export const generateNgrams = (str, n) => similarity.generateNgrams(str, n);
export const fastSimilarityCheck = (term1, term2) => similarity.fastSimilarityCheck(term1, term2);
export const areSimilar = (term1, term2) => similarity.areSimilarTerms(term1, term2);

export default TextSimilarity;
