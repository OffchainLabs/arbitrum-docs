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
 * QueryParser - Natural language query parsing and filtering
 *
 * Parses natural language queries to extract filters and search criteria.
 * Enhanced with fuzzy matching, phrase matching, and full-text search fallback.
 */

import { FuzzyMatcher } from '../search/FuzzyMatcher.js';
import { FullTextSearchEngine } from '../search/FullTextSearch.js';
import { searchConfig } from '../config/searchConfig.js';

export class QueryParser {
  constructor(documents, concepts, fullTextSearch = null) {
    this.documents = documents;
    this.concepts = concepts;
    this.fullTextSearch = fullTextSearch;

    // Initialize fuzzy matcher if concepts are available
    this.fuzzyMatcher = null;
    if (concepts && concepts.topConcepts) {
      this.fuzzyMatcher = new FuzzyMatcher(concepts.topConcepts);
    }
  }

  /**
   * Set full-text search engine (optional, for fallback search)
   *
   * @param {FullTextSearchEngine} fullTextSearch - Full-text search engine
   */
  setFullTextSearch(fullTextSearch) {
    this.fullTextSearch = fullTextSearch;
  }

  /**
   * Parse natural language query into structured filters
   * Examples:
   * - "Show me all docs about Gas optimization"
   * - "Find all quickstarts with >70% similarity"
   * - "Show hub documents (>10 connections)"
   * - "Orphaned concept docs in the DAO section"
   */
  parseQuery(query) {
    const filters = {
      concept: null,
      contentType: null,
      directory: null,
      similarity: null,
      connections: null,
      orphaned: null,
    };

    const queryLower = query.toLowerCase();

    // Extract concept/topic
    const conceptMatch =
      queryLower.match(/about\s+([a-z\s]+?)(?:\s|$)/i) ||
      queryLower.match(/for\s+([a-z\s]+?)(?:\s|$)/i) ||
      queryLower.match(/regarding\s+([a-z\s]+?)(?:\s|$)/i);

    if (conceptMatch) {
      filters.concept = conceptMatch[1].trim();
    }

    // Extract content type
    const contentTypes = [
      'quickstart',
      'how-to',
      'concept',
      'tutorial',
      'reference',
      'troubleshooting',
      'gentle-introduction',
    ];
    for (const type of contentTypes) {
      if (queryLower.includes(type)) {
        filters.contentType = type;
        break;
      }
    }

    // Extract similarity threshold
    const similarityMatch = queryLower.match(/(\d+)%\s+similarity/);
    if (similarityMatch) {
      filters.similarity = parseInt(similarityMatch[1]) / 100;
    }

    // Extract connection threshold
    const connectionsMatch = queryLower.match(/>(\d+)\s+connection/);
    if (connectionsMatch) {
      filters.connections = parseInt(connectionsMatch[1]);
    }

    // Extract orphaned filter
    if (queryLower.includes('orphan')) {
      filters.orphaned = true;
    }

    // Extract directory
    const directories = [...new Set(this.documents.map((d) => d.directory))];
    for (const dir of directories) {
      if (queryLower.includes(dir.toLowerCase())) {
        filters.directory = dir;
        break;
      }
    }

    return filters;
  }

  /**
   * Apply filters to document set
   */
  applyFilters(documents, filters) {
    let filtered = [...documents];

    if (filters.contentType) {
      filtered = filtered.filter((d) => d.frontmatter?.content_type === filters.contentType);
    }

    if (filters.directory) {
      filtered = filtered.filter((d) => d.directory === filters.directory);
    }

    if (filters.orphaned !== null) {
      filtered = filtered.filter((d) => d.navigation?.isOrphaned === filters.orphaned);
    }

    return filtered;
  }

  /**
   * Search for documents matching query
   */
  searchDocuments(query) {
    const filters = this.parseQuery(query);
    const results = this.applyFilters(this.documents, filters);

    return {
      query,
      filters,
      results: results.map((d) => ({
        path: d.relativePath,
        title: d.frontmatter?.title,
        contentType: d.frontmatter?.content_type,
        directory: d.directory,
      })),
      totalResults: results.length,
    };
  }

  /**
   * Find concept using layered search strategy
   * 1. Exact match → 2. Fuzzy match → 3. Partial match → 4. Full-text fallback
   *
   * @param {string} searchTerm - The term to search for
   * @param {Object} options - Search options
   * @returns {string|null} Matched concept or null
   */
  findConcept(searchTerm, options = {}) {
    const searchLower = searchTerm.toLowerCase();

    // LAYER 1: Exact match (case-insensitive)
    const exactMatch = this.concepts.topConcepts?.find(
      (c) => c.concept.toLowerCase() === searchLower,
    );
    if (exactMatch) {
      return exactMatch.concept;
    }

    // LAYER 2: Fuzzy matching (typos, abbreviations, variants)
    if (this.fuzzyMatcher && searchConfig.features.fuzzyMatching) {
      const fuzzyMatches = this.fuzzyMatcher.findFuzzyConcept(searchTerm, {
        threshold: options.fuzzyThreshold || searchConfig.fuzzy.jaccardThreshold,
        limit: 1,
      });

      if (fuzzyMatches.length > 0) {
        return fuzzyMatches[0].concept;
      }
    }

    // LAYER 3: Partial substring match (fallback)
    const partialMatches = this.concepts.topConcepts?.filter((c) =>
      c.concept.toLowerCase().includes(searchLower),
    );

    if (partialMatches && partialMatches.length > 0) {
      // Return most frequent
      partialMatches.sort((a, b) => b.frequency - a.frequency);
      return partialMatches[0].concept;
    }

    // No match found
    return null;
  }

  /**
   * Enhanced concept search with full details and fallback
   * Returns detailed match information including score and match type
   *
   * @param {string} searchTerm - The term to search for
   * @param {Object} options - Search options
   * @returns {Object} Match result with details
   */
  findConceptWithFallbacks(searchTerm, options = {}) {
    const {
      fuzzyThreshold = searchConfig.fuzzy.jaccardThreshold,
      enableFuzzy = searchConfig.features.fuzzyMatching,
      enableFulltext = searchConfig.features.fulltextSearch,
    } = options;

    const result = {
      found: false,
      query: searchTerm,
      bestMatch: null,
      attempts: [],
      confidence: 0,
    };

    const searchLower = searchTerm.toLowerCase();

    // LAYER 1: Exact match
    const exactMatch = this.concepts.topConcepts?.find(
      (c) => c.concept.toLowerCase() === searchLower,
    );

    if (exactMatch) {
      result.attempts.push({ layer: 'exact', success: true });
      result.found = true;
      result.bestMatch = {
        concept: exactMatch.concept,
        matchType: 'exact',
        score: 1.0,
        confidence: 1.0,
        layer: 'exact',
        explanation: 'Exact match (case-insensitive)',
      };
      return result;
    }

    result.attempts.push({ layer: 'exact', success: false });

    // LAYER 2: Fuzzy matching
    if (enableFuzzy && this.fuzzyMatcher) {
      const fuzzyMatches = this.fuzzyMatcher.findFuzzyConcept(searchTerm, {
        threshold: fuzzyThreshold,
        limit: 1,
      });

      if (fuzzyMatches.length > 0 && fuzzyMatches[0].score >= fuzzyThreshold) {
        result.attempts.push({
          layer: 'fuzzy',
          success: true,
          score: fuzzyMatches[0].score,
        });
        result.found = true;
        result.bestMatch = {
          ...fuzzyMatches[0],
          confidence: fuzzyMatches[0].score,
          layer: 'fuzzy',
        };
        return result;
      }

      result.attempts.push({ layer: 'fuzzy', success: false });
    }

    // LAYER 3: Partial substring match
    const partialMatches = this.concepts.topConcepts?.filter((c) =>
      c.concept.toLowerCase().includes(searchLower),
    );

    if (partialMatches && partialMatches.length > 0) {
      partialMatches.sort((a, b) => b.frequency - a.frequency);

      result.attempts.push({ layer: 'partial', success: true });
      result.found = true;
      result.bestMatch = {
        concept: partialMatches[0].concept,
        matchType: 'partial',
        score: 0.7,
        confidence: 0.7,
        layer: 'partial',
        explanation: `Partial substring match (contains "${searchTerm}")`,
      };
      return result;
    }

    result.attempts.push({ layer: 'partial', success: false });

    // LAYER 4: Full-text search fallback
    if (enableFulltext && this.fullTextSearch) {
      const fulltextResults = this.fullTextSearch.search(searchTerm, {
        minScore: 0.5,
        limit: 1,
        snippets: true,
      });

      if (fulltextResults.length > 0) {
        result.attempts.push({
          layer: 'fulltext',
          success: true,
          score: fulltextResults[0].score,
        });
        result.found = true;
        result.bestMatch = {
          concept: searchTerm,
          matchType: 'fulltext',
          score: fulltextResults[0].score,
          confidence: fulltextResults[0].score,
          layer: 'fulltext',
          documents: fulltextResults,
          explanation: 'Full-text search match (concept not in index)',
        };
        return result;
      }

      result.attempts.push({ layer: 'fulltext', success: false });
    }

    // No match found
    return result;
  }
}
