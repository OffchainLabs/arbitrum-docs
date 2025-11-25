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

import natural from 'natural';
import logger from '../utils/logger.js';

/**
 * FullTextIndexer - Build inverted index for full-text search
 *
 * This is a BUILD-TIME component that creates a searchable inverted index
 * from document content. The index is saved to dist/fulltext-index.json
 * and loaded by the runtime FullTextSearch engine.
 */
export class FullTextIndexer {
  constructor(config = {}) {
    this.config = {
      stemming: config.stemming !== false,
      minTermLength: config.minTermLength || 3,
      stopWords:
        config.stopWords ||
        new Set([
          'the',
          'and',
          'or',
          'but',
          'for',
          'with',
          'from',
          'this',
          'that',
          'these',
          'those',
          'is',
          'are',
          'was',
          'were',
          'be',
          'been',
          'being',
          'have',
          'has',
          'had',
          'do',
          'does',
          'did',
          'will',
          'would',
          'should',
          'could',
          'may',
          'might',
          'must',
          'can',
          'shall',
          'to',
          'of',
          'in',
          'on',
          'at',
          'by',
          'about',
          'as',
          'into',
          'through',
          'during',
          'before',
          'after',
          'above',
          'below',
          'between',
          'under',
          'again',
          'further',
          'then',
          'once',
          'here',
          'there',
          'when',
          'where',
          'why',
          'how',
          'all',
          'each',
          'every',
          'both',
          'few',
          'more',
          'most',
          'other',
          'some',
          'such',
          'no',
          'nor',
          'not',
          'only',
          'own',
          'same',
          'so',
          'than',
          'too',
          'very',
          'can',
          'just',
          'now',
        ]),
      fieldBoosts: config.fieldBoosts || {
        title: 2.0,
        headings: 1.5,
        body: 1.0,
      },
    };

    // Porter Stemmer from natural library
    this.stemmer = natural.PorterStemmer;

    // Inverted index: term -> [{docId, positions[], tf, fields}]
    this.invertedIndex = new Map();

    // Document metadata: docId -> {path, title, length, ...}
    this.documents = new Map();

    // Document frequency: term -> number of documents containing term
    this.documentFrequency = new Map();

    // Statistics
    this.stats = {
      totalDocuments: 0,
      totalTerms: 0,
      uniqueTerms: 0,
      avgDocLength: 0,
    };
  }

  /**
   * Build full-text index from documents
   *
   * @param {Map} documents - Map of filePath -> document object
   * @returns {Object} Index object ready for JSON serialization
   */
  buildIndex(documents) {
    logger.section('Full-Text Index Construction');
    logger.info(`Building full-text index for ${documents.size} documents...`);

    const startTime = Date.now();
    let totalWordCount = 0;
    let docIndex = 0;

    for (const [filePath, document] of documents.entries()) {
      const docId = `doc_${String(docIndex).padStart(4, '0')}`;
      docIndex++;

      // Index document content in different fields
      const fields = {
        title: document.frontmatter?.title || '',
        headings: document.headings?.map((h) => h.text).join(' ') || '',
        body: document.content || '',
      };

      // Tokenize and index each field
      const docTerms = new Map(); // term -> {tf, positions, fields}

      for (const [fieldName, fieldContent] of Object.entries(fields)) {
        if (!fieldContent) continue;

        const tokens = this.tokenize(fieldContent);
        const fieldWordCount = tokens.length;
        totalWordCount += fieldWordCount;

        // Track positions for each term in this field
        tokens.forEach((token, position) => {
          if (!this.isValidToken(token)) return;

          // Apply stemming if enabled
          const term = this.config.stemming ? this.stemmer.stem(token) : token;

          // Update doc-level term data
          if (!docTerms.has(term)) {
            docTerms.set(term, {
              tf: 0,
              positions: [],
              fields: {
                title: 0,
                headings: 0,
                body: 0,
              },
            });
          }

          const termData = docTerms.get(term);
          termData.tf++;
          termData.positions.push(position);
          termData.fields[fieldName]++;
        });
      }

      // Add document metadata
      this.documents.set(docId, {
        path: document.relativePath || filePath,
        title: fields.title,
        length: totalWordCount,
        frontmatter: document.frontmatter || {},
      });

      // Update inverted index
      for (const [term, termData] of docTerms.entries()) {
        if (!this.invertedIndex.has(term)) {
          this.invertedIndex.set(term, []);
          this.documentFrequency.set(term, 0);
        }

        this.invertedIndex.get(term).push({
          docId,
          tf: termData.tf,
          positions: termData.positions,
          fields: termData.fields,
        });

        // Update document frequency
        this.documentFrequency.set(term, this.documentFrequency.get(term) + 1);
      }

      // Log progress every 50 documents
      if (docIndex % 50 === 0) {
        logger.info(`Indexed ${docIndex}/${documents.size} documents...`);
      }
    }

    // Calculate statistics
    this.stats.totalDocuments = documents.size;
    this.stats.uniqueTerms = this.invertedIndex.size;
    this.stats.totalTerms = Array.from(this.invertedIndex.values()).reduce(
      (sum, postings) => sum + postings.reduce((s, p) => s + p.tf, 0),
      0,
    );
    this.stats.avgDocLength = totalWordCount / documents.size;

    const elapsedTime = Date.now() - startTime;
    logger.success(
      `Full-text index built: ${this.stats.uniqueTerms} unique terms, ` +
        `${this.stats.totalDocuments} documents in ${elapsedTime}ms`,
    );

    return this.serializeIndex();
  }

  /**
   * Tokenize text into terms
   *
   * @param {string} text - Text to tokenize
   * @returns {Array} Array of tokens
   */
  tokenize(text) {
    if (!text || typeof text !== 'string') return [];

    // Clean text
    const cleaned = text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .toLowerCase();

    // Split on whitespace and punctuation
    const tokens = cleaned.split(/[\s\.,;:!?()\[\]{}"']+/);

    return tokens.filter(Boolean);
  }

  /**
   * Check if a token is valid for indexing
   *
   * @param {string} token - Token to validate
   * @returns {boolean} True if valid
   */
  isValidToken(token) {
    if (!token || token.length < this.config.minTermLength) {
      return false;
    }

    // Skip stop words
    if (this.config.stopWords.has(token)) {
      return false;
    }

    // Skip pure numbers
    if (/^\d+$/.test(token)) {
      return false;
    }

    return true;
  }

  /**
   * Calculate IDF (Inverse Document Frequency) for all terms
   *
   * IDF(term) = log(N / df(term))
   * where N = total documents, df = documents containing term
   *
   * @returns {Map} Map of term -> IDF score
   */
  calculateIDF() {
    const idf = new Map();
    const N = this.stats.totalDocuments;

    for (const [term, df] of this.documentFrequency.entries()) {
      idf.set(term, Math.log(N / df));
    }

    return idf;
  }

  /**
   * Serialize index to JSON-friendly object
   *
   * @returns {Object} Serialized index
   */
  serializeIndex() {
    const idf = this.calculateIDF();

    return {
      version: '2.0.0',
      metadata: {
        documentCount: this.stats.totalDocuments,
        termCount: this.stats.uniqueTerms,
        avgDocLength: Math.round(this.stats.avgDocLength),
        indexedAt: new Date().toISOString(),
      },

      // Convert Map to Object for JSON serialization
      invertedIndex: Object.fromEntries(
        Array.from(this.invertedIndex.entries()).map(([term, postings]) => [term, postings]),
      ),

      documentFrequency: Object.fromEntries(this.documentFrequency),

      idf: Object.fromEntries(idf),

      documents: Object.fromEntries(
        Array.from(this.documents.entries()).map(([docId, doc]) => [
          docId,
          {
            path: doc.path,
            title: doc.title,
            length: doc.length,
            fieldWeights: this.config.fieldBoosts,
          },
        ]),
      ),
    };
  }

  /**
   * Get indexing statistics
   *
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      indexSizeEstimate: this.estimateIndexSize(),
    };
  }

  /**
   * Estimate index size in bytes (approximate)
   *
   * @returns {number} Estimated size in bytes
   */
  estimateIndexSize() {
    const serialized = this.serializeIndex();
    return JSON.stringify(serialized).length;
  }
}

export default FullTextIndexer;
