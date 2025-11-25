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

import compromise from 'compromise';
import logger from '../utils/logger.js';

/**
 * PhraseExtractor - Extract multi-word technical phrases from documents
 *
 * Uses NLP-based noun phrase chunking combined with domain-specific patterns
 * to identify and extract meaningful multi-word concepts.
 */
export class PhraseExtractor {
  constructor(config = {}) {
    this.config = {
      minWords: config.minWords || 2,
      maxWords: config.maxWords || 4,
      minFrequency: config.minFrequency || 2,
      maxPhrases: config.maxPhrases || 300,
      domainPhrases: config.domainPhrases || [],
    };

    // Track phrase frequency across corpus
    this.phraseFrequency = new Map();

    // Store phrase metadata
    this.phrases = new Map();

    // Domain-specific phrases (always include if found)
    this.domainPhraseSet = new Set(this.config.domainPhrases.map((p) => p.toLowerCase()));
  }

  /**
   * Extract phrases from a compromise document object
   *
   * @param {Object} doc - Compromise document object
   * @param {number} weight - Weight multiplier for this document
   * @returns {Array} Array of phrase objects
   */
  extractPhrases(doc, weight = 1.0) {
    const phrases = [];

    // Extract different types of multi-word phrases
    phrases.push(...this.extractNounPhrases(doc, weight));
    phrases.push(...this.extractTechnicalCompounds(doc, weight));
    phrases.push(...this.extractDomainPhrases(doc, weight));

    // Filter by length constraints
    return phrases.filter((phrase) => {
      const wordCount = phrase.text.split(/\s+/).length;
      return wordCount >= this.config.minWords && wordCount <= this.config.maxWords;
    });
  }

  /**
   * Extract noun phrases using NLP patterns
   *
   * @param {Object} doc - Compromise document object
   * @param {number} weight - Weight multiplier
   * @returns {Array} Array of noun phrase objects
   */
  extractNounPhrases(doc, weight) {
    const phrases = [];

    // Pattern 1: Adjective + Noun + Noun (e.g., "optimistic rollup design")
    const pattern1 = doc.match('#Adjective? #Noun+ #Noun').json();
    for (const match of pattern1) {
      if (match.text.length > 5) {
        // Only meaningful phrases
        phrases.push({
          text: match.text,
          type: 'noun_phrase',
          pattern: 'adj_noun_noun',
          weight: weight * 1.2,
        });
      }
    }

    // Pattern 2: Noun + Noun compounds (e.g., "gas optimization")
    const pattern2 = doc.match('#Noun #Noun').json();
    for (const match of pattern2) {
      if (match.text.length > 5) {
        phrases.push({
          text: match.text,
          type: 'noun_phrase',
          pattern: 'noun_noun',
          weight: weight * 1.1,
        });
      }
    }

    // Pattern 3: Noun + Preposition + Noun (e.g., "proof of stake")
    const pattern3 = doc.match('#Noun #Preposition #Noun').json();
    for (const match of pattern3) {
      if (match.text.length > 5) {
        phrases.push({
          text: match.text,
          type: 'noun_phrase',
          pattern: 'noun_prep_noun',
          weight: weight * 1.0,
        });
      }
    }

    return phrases;
  }

  /**
   * Extract technical compound terms
   *
   * @param {Object} doc - Compromise document object
   * @param {number} weight - Weight multiplier
   * @returns {Array} Array of technical compound objects
   */
  extractTechnicalCompounds(doc, weight) {
    const phrases = [];
    const text = doc.text();

    // Pattern: Title Case compounds (e.g., "Arbitrum Nova", "Nitro Stack")
    const titleCasePattern = /\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g;
    const titleMatches = Array.from(text.matchAll(titleCasePattern));

    for (const match of titleMatches) {
      phrases.push({
        text: match[0],
        type: 'technical_compound',
        pattern: 'title_case',
        weight: weight * 1.3,
      });
    }

    // Pattern: Hyphenated compounds (e.g., "cross-chain", "state-transition")
    const hyphenatedPattern = /\b[a-z]+(?:-[a-z]+){1,2}\b/gi;
    const hyphenMatches = Array.from(text.matchAll(hyphenatedPattern));

    for (const match of hyphenMatches) {
      // Convert hyphenated to space-separated for consistency
      const normalized = match[0].replace(/-/g, ' ');
      phrases.push({
        text: normalized,
        type: 'technical_compound',
        pattern: 'hyphenated',
        weight: weight * 1.2,
      });
    }

    return phrases;
  }

  /**
   * Extract domain-specific phrases from configuration
   *
   * @param {Object} doc - Compromise document object
   * @param {number} weight - Weight multiplier
   * @returns {Array} Array of domain phrase objects
   */
  extractDomainPhrases(doc, weight) {
    const phrases = [];
    const text = doc.text().toLowerCase();

    for (const domainPhrase of this.domainPhraseSet) {
      // Use word boundaries to match complete phrases only
      const escapedPhrase = domainPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
      const matches = Array.from(text.matchAll(regex));

      for (const match of matches) {
        phrases.push({
          text: match[0],
          type: 'domain_phrase',
          pattern: 'domain_specific',
          weight: weight * 1.5, // Higher weight for domain-specific terms
        });
      }
    }

    return phrases;
  }

  /**
   * Record phrases and track frequency
   *
   * @param {Array} phrases - Array of phrase objects
   * @param {string} filePath - Source file path
   */
  recordPhrases(phrases, filePath) {
    for (const phrase of phrases) {
      const normalized = this.normalizePhrase(phrase.text);

      // Update frequency
      const currentFreq = this.phraseFrequency.get(normalized) || 0;
      this.phraseFrequency.set(normalized, currentFreq + phrase.weight);

      // Store phrase metadata
      if (!this.phrases.has(normalized)) {
        this.phrases.set(normalized, {
          text: phrase.text,
          normalized,
          type: phrase.type,
          pattern: phrase.pattern,
          files: new Set(),
          totalWeight: 0,
          components: normalized.split(/\s+/),
        });
      }

      const phraseData = this.phrases.get(normalized);
      phraseData.files.add(filePath);
      phraseData.totalWeight += phrase.weight;
    }
  }

  /**
   * Get top phrases by frequency
   *
   * @param {number} limit - Maximum number of phrases to return
   * @returns {Array} Array of phrase objects sorted by frequency
   */
  getTopPhrases(limit = null) {
    // Filter by minimum frequency
    const filteredPhrases = Array.from(this.phraseFrequency.entries())
      .filter(([key, freq]) => {
        // Always include domain phrases regardless of frequency
        if (this.domainPhraseSet.has(key)) {
          return true;
        }
        return freq >= this.config.minFrequency;
      })
      .sort((a, b) => b[1] - a[1]);

    // Apply limit
    const limitedPhrases = limit
      ? filteredPhrases.slice(0, Math.min(limit, this.config.maxPhrases))
      : filteredPhrases.slice(0, this.config.maxPhrases);

    // Map to detailed phrase objects
    return limitedPhrases.map(([key, frequency]) => {
      const phraseData = this.phrases.get(key);
      return {
        concept: key,
        data: {
          text: phraseData.text,
          normalized: phraseData.normalized,
          type: 'phrase',
          length: phraseData.components.length,
          components: phraseData.components,
          pattern: phraseData.pattern,
          category: phraseData.type,
          files: Object.fromEntries(Array.from(phraseData.files).map((file) => [file, 1])),
          sources: ['content'], // Phrases come from content extraction
          totalWeight: phraseData.totalWeight,
        },
        frequency,
        fileCount: phraseData.files.size,
      };
    });
  }

  /**
   * Normalize a phrase for comparison
   *
   * @param {string} phrase - Phrase to normalize
   * @returns {string} Normalized phrase
   */
  normalizePhrase(phrase) {
    if (!phrase) return '';

    return phrase
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  /**
   * Build phrase component index for efficient lookup
   * Maps individual words to phrases containing them
   *
   * @returns {Map} Map of word -> array of phrases
   */
  buildComponentIndex() {
    const componentIndex = new Map();

    for (const [normalized, phraseData] of this.phrases.entries()) {
      for (const component of phraseData.components) {
        if (!componentIndex.has(component)) {
          componentIndex.set(component, []);
        }
        componentIndex.get(component).push(normalized);
      }
    }

    return componentIndex;
  }

  /**
   * Get extraction statistics
   *
   * @returns {Object} Statistics about phrase extraction
   */
  getStats() {
    return {
      totalPhrases: this.phrases.size,
      uniquePhrases: this.phraseFrequency.size,
      aboveMinFrequency: Array.from(this.phraseFrequency.values()).filter(
        (freq) => freq >= this.config.minFrequency,
      ).length,
      domainPhrasesFound: Array.from(this.phrases.keys()).filter((key) =>
        this.domainPhraseSet.has(key),
      ).length,
      avgWordsPerPhrase:
        Array.from(this.phrases.values()).reduce((sum, p) => sum + p.components.length, 0) /
          this.phrases.size || 0,
    };
  }
}

export default PhraseExtractor;
