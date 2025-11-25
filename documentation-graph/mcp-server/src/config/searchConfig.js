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
 * Search Configuration for MCP Documentation Analysis Server
 *
 * This configuration controls the behavior of fuzzy matching, phrase extraction,
 * and full-text search features.
 */

export const searchConfig = {
  /**
   * Fuzzy Matching Configuration
   * Handles typos, abbreviations, and morphological variants
   */
  fuzzy: {
    enabled: true,

    // Minimum similarity score (0-1) for Jaccard matching
    jaccardThreshold: 0.7,

    // Maximum Levenshtein distance for fallback matching
    levenshteinMaxDistance: 2,

    // N-gram size for character-based similarity
    ngramSize: 2,

    // Minimum term length for fuzzy matching (prevent over-matching short terms)
    minTermLength: 3,

    // LRU cache size for fuzzy match results
    cacheSize: 5000,

    // Abbreviation expansion map
    abbreviations: {
      ARB: 'arbitrum',
      ETH: 'ethereum',
      L2: 'layer 2',
      USDC: 'usdc',
      DAO: 'dao',
      NFT: 'nft',
      ERC: 'erc',
      EIP: 'eip',
      RPC: 'rpc',
      SDK: 'sdk',
      API: 'api',
    },
  },

  /**
   * Phrase Extraction Configuration
   * Extracts and indexes multi-word technical phrases
   */
  phrases: {
    enabled: true,

    // Minimum occurrences across corpus to index a phrase
    minFrequency: 2,

    // Maximum number of phrases to keep in index
    maxPhrases: 300,

    // Phrase length constraints (word count)
    minWords: 2,
    maxWords: 4,

    // Domain-specific multi-word phrases to always include
    domainPhrases: [
      'optimistic rollup',
      'fraud proof',
      'gas optimization',
      'layer 2 scaling',
      'cross-chain messaging',
      'arbitrum nova',
      'nitro stack',
      'sequencer decentralization',
      'transaction lifecycle',
      'state transition',
      'merkle tree',
      'batch posting',
      'data availability',
      'retryable ticket',
      'delayed inbox',
      'outbox message',
    ],
  },

  /**
   * Full-Text Search Configuration
   * Provides fallback search when concept matching fails
   */
  fulltext: {
    enabled: true,

    // Maximum number of results to return
    maxResults: 20,

    // Context snippet length (characters)
    snippetLength: 150,

    // Enable stemming for morphological variants
    stemming: true,

    // Minimum term length to include in index
    minTermLength: 3,

    // Field boosting weights for BM25 ranking
    fieldBoosts: {
      title: 2.0,
      headings: 1.5,
      body: 1.0,
    },

    // Stop words to exclude from indexing
    stopWords: [
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
    ],
  },

  /**
   * Performance Tuning
   */
  performance: {
    // Maximum query execution time (ms)
    queryTimeout: 5000,

    // Enable query result caching
    enableQueryCache: true,

    // Query cache size (LRU)
    queryCacheSize: 1000,

    // Query cache TTL (ms)
    queryCacheTTL: 300000, // 5 minutes
  },

  /**
   * Feature Flags
   * Can be overridden by environment variables
   */
  features: {
    fuzzyMatching: process.env.FEATURE_FUZZY_MATCHING !== 'false',
    phraseExtraction: process.env.FEATURE_PHRASE_EXTRACTION !== 'false',
    fulltextSearch: process.env.FEATURE_FULLTEXT_SEARCH !== 'false',
  },
};

export default searchConfig;
