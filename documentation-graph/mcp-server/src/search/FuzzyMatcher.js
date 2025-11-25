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

import levenshtein from 'fast-levenshtein';
import { searchConfig } from '../config/searchConfig.js';

/**
 * FuzzyMatcher - Fuzzy string matching with Jaccard similarity and Levenshtein distance
 *
 * Implements a layered approach to fuzzy matching:
 * 1. Fast pre-filtering by length difference
 * 2. Jaccard similarity using character n-grams (primary algorithm)
 * 3. Levenshtein distance (fallback for very short strings)
 * 4. Abbreviation expansion
 * 5. LRU caching for performance
 */
export class FuzzyMatcher {
  /**
   * @param {Array} concepts - Array of concept objects with 'concept' field
   * @param {Object} config - Configuration override (optional)
   */
  constructor(concepts, config = {}) {
    this.concepts = concepts || [];
    this.config = { ...searchConfig.fuzzy, ...config };

    // LRU cache for expensive fuzzy calculations
    this.cache = new Map();
    this.maxCacheSize = this.config.cacheSize || 5000;

    // Abbreviation map for quick lookup
    this.abbreviations = new Map(
      Object.entries(this.config.abbreviations || {}).map(([k, v]) => [
        k.toLowerCase(),
        v.toLowerCase(),
      ]),
    );

    // Pre-build normalized concept list for faster matching
    this.normalizedConcepts = this.concepts.map((c) => ({
      original: c,
      normalized: this.normalizeTerm(c.concept || c),
    }));
  }

  /**
   * Find fuzzy matches for a search term
   *
   * @param {string} searchTerm - The term to search for
   * @param {Object} options - Search options
   * @param {number} options.threshold - Minimum similarity score (0-1)
   * @param {number} options.limit - Maximum results to return
   * @returns {Array} Array of matches with scores
   */
  findFuzzyConcept(searchTerm, options = {}) {
    if (!searchTerm || typeof searchTerm !== 'string') {
      return [];
    }

    const { threshold = this.config.jaccardThreshold || 0.7, limit = 5 } = options;

    const normalized = this.normalizeTerm(searchTerm);

    // Check cache first
    const cacheKey = `${normalized}|${threshold}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const matches = [];

    // STEP 1: Try abbreviation expansion first
    if (this.abbreviations.has(normalized)) {
      const expanded = this.abbreviations.get(normalized);
      const exactMatch = this.normalizedConcepts.find((c) => c.normalized === expanded);
      if (exactMatch) {
        matches.push({
          concept: exactMatch.original.concept || exactMatch.original,
          score: 1.0,
          matchType: 'abbreviation',
          explanation: `Abbreviation expansion: "${searchTerm}" → "${expanded}"`,
        });
        this.setCache(cacheKey, matches);
        return matches;
      }
    }

    // STEP 2: Try exact match (case-insensitive)
    const exactMatch = this.normalizedConcepts.find((c) => c.normalized === normalized);
    if (exactMatch) {
      matches.push({
        concept: exactMatch.original.concept || exactMatch.original,
        score: 1.0,
        matchType: 'exact',
        explanation: 'Exact match (case-insensitive)',
      });
      this.setCache(cacheKey, matches);
      return matches;
    }

    // STEP 3: Fuzzy matching
    // Skip very short terms to avoid over-matching
    if (normalized.length < this.config.minTermLength) {
      this.setCache(cacheKey, matches);
      return matches;
    }

    // Pre-filter candidates by length to avoid expensive calculations
    const candidates = this.preFilterByLength(normalized, this.normalizedConcepts);

    // Calculate similarity scores for remaining candidates
    for (const candidate of candidates) {
      const candidateNorm = candidate.normalized;

      // Substring matching gets a boost
      if (candidateNorm.includes(normalized) || normalized.includes(candidateNorm)) {
        const score = Math.max(
          normalized.length / candidateNorm.length,
          candidateNorm.length / normalized.length,
        );

        if (score >= threshold) {
          matches.push({
            concept: candidate.original.concept || candidate.original,
            score,
            matchType: 'substring',
            explanation: `Substring match (${Math.round(score * 100)}% similarity)`,
          });
        }
        continue;
      }

      // Jaccard similarity (primary algorithm - fast)
      const jaccardScore = this.calculateJaccardSimilarity(normalized, candidateNorm);

      if (jaccardScore >= threshold) {
        matches.push({
          concept: candidate.original.concept || candidate.original,
          score: jaccardScore,
          matchType: 'jaccard',
          explanation: `Fuzzy match via Jaccard similarity (${Math.round(jaccardScore * 100)}%)`,
        });
        continue;
      }

      // Levenshtein distance (fallback for very short strings)
      if (normalized.length <= 5 || candidateNorm.length <= 5) {
        const levenScore = this.calculateLevenshteinSimilarity(normalized, candidateNorm);

        if (levenScore >= threshold) {
          matches.push({
            concept: candidate.original.concept || candidate.original,
            score: levenScore,
            matchType: 'levenshtein',
            explanation: `Fuzzy match via Levenshtein distance (${Math.round(levenScore * 100)}%)`,
          });
        }
      }
    }

    // Sort by score descending and limit results
    matches.sort((a, b) => b.score - a.score);
    const limitedMatches = matches.slice(0, limit);

    // Cache the result
    this.setCache(cacheKey, limitedMatches);

    return limitedMatches;
  }

  /**
   * Calculate Jaccard similarity using character n-grams
   *
   * Jaccard similarity = |A ∩ B| / |A ∪ B|
   * where A and B are sets of character n-grams
   *
   * @param {string} term1 - First term
   * @param {string} term2 - Second term
   * @returns {number} Similarity score (0-1)
   */
  calculateJaccardSimilarity(term1, term2) {
    const ngrams1 = this.generateNgrams(term1, this.config.ngramSize);
    const ngrams2 = this.generateNgrams(term2, this.config.ngramSize);

    // Calculate intersection
    const intersection = new Set([...ngrams1].filter((x) => ngrams2.has(x)));

    // Calculate union
    const union = new Set([...ngrams1, ...ngrams2]);

    // Jaccard coefficient
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Generate character n-grams from a string
   *
   * @param {string} str - Input string
   * @param {number} n - N-gram size (default: 2 for bigrams)
   * @returns {Set} Set of n-grams
   */
  generateNgrams(str, n = 2) {
    const ngrams = new Set();

    // Add padding for edge matching
    const padded = '_'.repeat(n - 1) + str + '_'.repeat(n - 1);

    for (let i = 0; i <= padded.length - n; i++) {
      ngrams.add(padded.substring(i, i + n));
    }

    return ngrams;
  }

  /**
   * Calculate Levenshtein similarity (normalized edit distance)
   *
   * similarity = 1 - (distance / max_length)
   *
   * @param {string} term1 - First term
   * @param {string} term2 - Second term
   * @returns {number} Similarity score (0-1)
   */
  calculateLevenshteinSimilarity(term1, term2) {
    const distance = levenshtein.get(term1, term2);
    const maxLength = Math.max(term1.length, term2.length);

    return maxLength === 0 ? 1 : 1 - distance / maxLength;
  }

  /**
   * Pre-filter candidates by length difference
   * Significant length difference indicates low similarity
   *
   * @param {string} searchTerm - Normalized search term
   * @param {Array} candidates - Array of {normalized, original} objects
   * @returns {Array} Filtered candidates
   */
  preFilterByLength(searchTerm, candidates) {
    const searchLen = searchTerm.length;
    const maxLengthDiff = Math.ceil(searchLen * 0.4); // Allow 40% length difference

    return candidates.filter((candidate) => {
      const lengthDiff = Math.abs(candidate.normalized.length - searchLen);
      return lengthDiff <= maxLengthDiff;
    });
  }

  /**
   * Normalize a term for comparison
   *
   * @param {string} term - Term to normalize
   * @returns {string} Normalized term
   */
  normalizeTerm(term) {
    if (!term) return '';

    return term
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  /**
   * Set cache entry with LRU eviction
   *
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   */
  setCache(key, value) {
    // Implement LRU behavior - remove oldest if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   *
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0,
    };
  }
}

export default FuzzyMatcher;
