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

import lunr from 'lunr';
import { searchConfig } from '../config/searchConfig.js';

/**
 * FullTextSearchEngine - Runtime full-text search using Lunr.js
 *
 * Provides BM25-ranked search across document content with:
 * - Phrase search (quoted strings)
 * - Boolean operators (AND, OR, NOT)
 * - Field-specific search
 * - Context snippets with highlighting
 */
export class FullTextSearchEngine {
  /**
   * @param {Map} documents - Map of document objects
   * @param {Object} fulltextIndex - Pre-built fulltext index (optional)
   * @param {Object} config - Configuration override (optional)
   */
  constructor(documents, fulltextIndex = null, config = {}) {
    this.documents = documents;
    this.fulltextIndex = fulltextIndex;
    this.config = { ...searchConfig.fulltext, ...config };

    // LRU cache for search results
    this.cache = new Map();
    this.maxCacheSize = searchConfig.performance.queryCacheSize || 1000;

    // Build Lunr index
    this.lunrIndex = null;
    this.documentMap = new Map(); // docId -> document object

    if (documents && documents.size > 0) {
      this.buildLunrIndex();
    }
  }

  /**
   * Build Lunr.js index from documents
   */
  buildLunrIndex() {
    const documentsArray = Array.from(this.documents.entries());
    const documentMap = this.documentMap;
    const config = this.config;

    this.lunrIndex = lunr(function () {
      // Define indexed fields with boosting
      this.ref('id');
      this.field('title', { boost: config?.fieldBoosts?.title || 2 });
      this.field('headings', { boost: config?.fieldBoosts?.headings || 1.5 });
      this.field('content', { boost: config?.fieldBoosts?.body || 1 });

      // Store position metadata for snippet generation
      this.metadataWhitelist = ['position'];

      // Index each document
      documentsArray.forEach(([filePath, doc], index) => {
        const docId = `doc_${index}`;

        this.add({
          id: docId,
          title: doc.frontmatter?.title || '',
          headings: doc.headings?.map((h) => h.text).join(' ') || '',
          content: doc.content || '',
        });

        // Store document reference
        documentMap.set(docId, {
          ...doc,
          filePath,
          id: docId,
        });
      });
    });
  }

  /**
   * Search documents using full-text search
   *
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @param {string} options.type - Search type: 'simple', 'phrase', 'boolean'
   * @param {number} options.minScore - Minimum relevance score (0-1)
   * @param {number} options.limit - Maximum results to return
   * @param {boolean} options.snippets - Include context snippets
   * @returns {Array} Array of search results
   */
  search(query, options = {}) {
    if (!query || typeof query !== 'string') {
      return [];
    }

    const {
      type = 'simple',
      minScore = 0.5,
      limit = this.config.maxResults || 20,
      snippets = true,
    } = options;

    // Check cache first
    const cacheKey = `${query}|${type}|${minScore}|${limit}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (!this.lunrIndex) {
      return [];
    }

    try {
      // Parse and execute query based on type
      let lunrQuery = query;

      if (type === 'phrase') {
        // Exact phrase matching - quote the query
        lunrQuery = `"${query}"`;
      } else if (type === 'boolean') {
        // Boolean query - use as-is (user provides AND/OR/NOT)
        lunrQuery = query;
      }

      // Execute Lunr search
      const lunrResults = this.lunrIndex.search(lunrQuery);

      // Filter by minimum score and map to our result format
      const results = lunrResults
        .filter((result) => result.score >= minScore)
        .slice(0, limit)
        .map((result) => {
          const document = this.documentMap.get(result.ref);

          const searchResult = {
            document: {
              relativePath: document.relativePath || document.filePath,
              frontmatter: document.frontmatter,
              content: document.content,
            },
            score: result.score,
            matchType: type,
            matches: result.matchData?.metadata || {},
          };

          // Generate snippets if requested
          if (snippets && document) {
            searchResult.snippets = this.generateSnippets(
              document,
              query,
              this.config.snippetLength || 150,
            );
          }

          return searchResult;
        });

      // Cache the result
      this.setCache(cacheKey, results);

      return results;
    } catch (error) {
      console.error('Full-text search error:', error);
      return [];
    }
  }

  /**
   * Generate context snippets showing matched terms
   *
   * @param {Object} document - Document object
   * @param {string} query - Search query
   * @param {number} contextLength - Characters of context around match
   * @returns {Array} Array of snippet strings
   */
  generateSnippets(document, query, contextLength = 150) {
    const content = document.content || '';
    const snippets = [];

    // Extract search terms (remove quotes, operators, etc.)
    const terms = query
      .replace(/["'()]/g, '')
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !['AND', 'OR', 'NOT'].includes(t.toUpperCase()));

    // Find positions of terms in content
    const termPositions = [];
    const lowerContent = content.toLowerCase();

    for (const term of terms) {
      const lowerTerm = term.toLowerCase();
      let pos = lowerContent.indexOf(lowerTerm);

      while (pos !== -1) {
        termPositions.push({ pos, term, end: pos + lowerTerm.length });
        pos = lowerContent.indexOf(lowerTerm, pos + 1);
      }
    }

    // Sort positions and generate snippets
    termPositions.sort((a, b) => a.pos - b.pos);

    // Group nearby matches (within contextLength distance)
    const groups = [];
    let currentGroup = [];

    for (const match of termPositions) {
      if (
        currentGroup.length === 0 ||
        match.pos - currentGroup[currentGroup.length - 1].end <= contextLength
      ) {
        currentGroup.push(match);
      } else {
        groups.push(currentGroup);
        currentGroup = [match];
      }
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    // Generate snippet for each group (limit to 3)
    for (const group of groups.slice(0, 3)) {
      const firstMatch = group[0];
      const lastMatch = group[group.length - 1];

      const snippetStart = Math.max(0, firstMatch.pos - Math.floor(contextLength / 2));
      const snippetEnd = Math.min(content.length, lastMatch.end + Math.floor(contextLength / 2));

      let snippet = content.substring(snippetStart, snippetEnd);

      // Add ellipsis if not at document boundaries
      if (snippetStart > 0) {
        snippet = '...' + snippet;
      }
      if (snippetEnd < content.length) {
        snippet = snippet + '...';
      }

      // Highlight matched terms (simple case-insensitive replace)
      for (const term of terms) {
        const regex = new RegExp(`(${term})`, 'gi');
        snippet = snippet.replace(regex, '<mark>$1</mark>');
      }

      snippets.push(snippet);
    }

    return snippets;
  }

  /**
   * Phrase search - find documents with consecutive terms
   *
   * @param {string} phrase - Phrase to search for
   * @returns {Array} Array of matching documents
   */
  phraseSearch(phrase) {
    return this.search(phrase, {
      type: 'phrase',
      snippets: true,
    });
  }

  /**
   * Boolean search - supports AND, OR, NOT operators
   *
   * @param {string} query - Boolean query
   * @returns {Array} Array of matching documents
   */
  booleanSearch(query) {
    return this.search(query, {
      type: 'boolean',
      snippets: true,
    });
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
    };
  }
}

export default FullTextSearchEngine;
