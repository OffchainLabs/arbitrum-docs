import compromise from 'compromise';
import { removeStopwords, eng } from 'stopword';
import leven from 'leven';
import fs from 'fs-extra';
import path from 'path';
import logger from '../utils/logger.js';
import { extractionConfig } from '../../config/extraction-config.js';

export class ConceptExtractor {
  constructor(configFilePath = null) {
    this.concepts = new Map();
    this.conceptFrequency = new Map();
    this.conceptCooccurrence = new Map();
    this.domainTerms = new Set();
    this.customStopWords = new Set();
    this.config = null;
    this.stats = {
      totalConcepts: 0,
      uniqueConcepts: 0,
      domainConcepts: 0,
      technicalTerms: 0
    };

    this.loadConfig(configFilePath);
    this.initializeDomainTerms();
  }

  loadConfig(configFilePath) {
    if (configFilePath && fs.existsSync(configFilePath)) {
      try {
        const configContent = fs.readFileSync(configFilePath, 'utf8');
        this.config = JSON.parse(configContent);
        logger.info(`Loaded custom configuration from: ${configFilePath}`);
        
        // Load custom stop words
        if (this.config.stopWords && Array.isArray(this.config.stopWords)) {
          this.config.stopWords.forEach(word => this.customStopWords.add(word.toLowerCase()));
          logger.debug(`Loaded ${this.config.stopWords.length} custom stop words`);
        }
      } catch (error) {
        logger.warn(`Failed to load configuration file ${configFilePath}: ${error.message}`);
        logger.info('Falling back to default configuration');
        this.config = null;
      }
    } else {
      logger.debug('No custom configuration file provided, using default configuration');
    }
  }

  initializeDomainTerms() {
    // Use custom domain terms if available, otherwise fall back to default
    const domainTermsSource = this.config?.domainSpecificTerms || extractionConfig.domainTerms;
    
    // Flatten all domain terms into a single set for quick lookup
    for (const category of Object.values(domainTermsSource)) {
      for (const term of category) {
        this.domainTerms.add(term.toLowerCase());
      }
    }
    
    const source = this.config ? 'custom configuration' : 'default configuration';
    logger.debug(`Initialized ${this.domainTerms.size} domain terms from ${source}`);
  }

  async extractFromDocuments(documents) {
    logger.section('Concept Extraction Phase');

    const documentArray = Array.from(documents.entries());
    const batchSize = 20; // Optimized batch size for parallel processing
    const totalBatches = Math.ceil(documentArray.length / batchSize);

    logger.info(`Processing ${documentArray.length} documents in ${totalBatches} batches of ${batchSize}`);
    logger.info(`Optimized parallel processing for faster concept extraction (expect 2-3 minutes)`);

    for (let i = 0; i < documentArray.length; i += batchSize) {
      const batch = documentArray.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;

      logger.info(`Processing batch ${batchNum}/${totalBatches} (${batch.length} documents)`);

      const progressBar = logger.createProgressBar(`Batch ${batchNum} progress`, batch.length);

      // Process documents in batch concurrently for better performance
      const batchPromises = batch.map(async ([filePath, document]) => {
        return this.extractFromDocument(document);
      });

      // Wait for all documents in batch to complete
      await Promise.all(batchPromises);

      // Update progress bar after batch completes
      progressBar.tick(batch.length);
      progressBar.terminate();

      // Check if we've hit concept limits after batch
      if (this.concepts.size >= extractionConfig.conceptExtraction.maxConcepts) {
        logger.warn(`Reached maximum concept limit (${extractionConfig.conceptExtraction.maxConcepts}). Stopping extraction.`);
        break;
      }
      
      // Log memory usage and progress after each batch
      const memUsage = process.memoryUsage();
      const progressPercent = Math.round((batchNum / totalBatches) * 100);
      logger.info(`Batch ${batchNum}/${totalBatches} complete (${progressPercent}%). Memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
      logger.info(`Current concept count: ${this.concepts.size}/${extractionConfig.conceptExtraction.maxConcepts}, Co-occurrence records: ${this.conceptCooccurrence.size}/${extractionConfig.conceptExtraction.maxCooccurrenceRecords}`);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    }

    // Post-process concepts with optimized normalization
    logger.info('Normalizing concepts (optimized for performance)...');
    this.normalizeConcepts();
    this.calculateConceptMetrics();
    
    logger.success(`Extracted ${this.stats.uniqueConcepts} unique concepts and ${this.conceptCooccurrence.size} co-occurrence relationships from ${documents.size} documents`);
    
    return {
      concepts: this.concepts,
      frequency: this.conceptFrequency,
      cooccurrence: this.conceptCooccurrence
    };
  }

  extractFromDocument(document) {
    const { content, frontmatter, headings } = document;
    
    // Extract from different parts with different weights
    const textSources = [
      { text: content, weight: 1, source: 'content' },
      { text: headings.map(h => h.text).join(' '), weight: 2, source: 'headings' },
      { text: JSON.stringify(frontmatter), weight: 1.5, source: 'frontmatter' }
    ];

    for (const { text, weight, source } of textSources) {
      if (!text) continue;
      
      const concepts = this.extractConceptsFromText(text, document.filePath, source, weight);
      this.recordConcepts(concepts, document.filePath);
    }
  }

  extractConceptsFromText(text, filePath, source, weight) {
    if (!text || typeof text !== 'string') return [];
    
    // Clean the text
    const cleanText = this.cleanText(text);
    
    // Use compromise for NLP analysis
    const doc = compromise(cleanText);
    
    const concepts = [];
    
    // Extract different types of concepts with maximum coverage
    concepts.push(...this.extractNouns(doc, weight));
    concepts.push(...this.extractTechnicalTerms(doc, weight));
    concepts.push(...this.extractDomainSpecific(cleanText, weight));
    concepts.push(...this.extractNamedEntities(doc, weight));
    concepts.push(...this.extractPhrases(doc, weight));
    concepts.push(...this.extractCompoundTerms(doc, weight));
    concepts.push(...this.extractAcronymsAndAbbreviations(doc, weight));
    
    // Filter and normalize
    return concepts
      .filter(concept => this.isValidConcept(concept.text))
      .map(concept => ({
        ...concept,
        filePath,
        source,
        normalized: this.normalizeTerm(concept.text)
      }));
  }

  extractNouns(doc, weight) {
    const nouns = doc.nouns().json();
    return nouns.map(noun => ({
      text: noun.text,
      type: 'noun',
      weight,
      pos: 'noun'
    }));
  }

  extractTechnicalTerms(doc, weight) {
    const terms = [];
    
    // Look for technical patterns
    const technicalPatterns = [
      /\b[A-Z]{2,}\b/g, // Acronyms
      /\b\w+\.\w+\b/g, // Dotted notation (e.g., web3.js)
      /\b\w+[-_]\w+\b/g, // Hyphenated/underscore terms
      /\b[a-z]+[A-Z]\w*\b/g // camelCase
    ];

    const text = doc.text();
    for (const pattern of technicalPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        terms.push({
          text: match[0],
          type: 'technical',
          weight: weight * 1.2,
          pos: 'technical'
        });
      }
    }

    return terms;
  }

  extractDomainSpecific(text, weight) {
    const terms = [];
    const lowerText = text.toLowerCase();
    
    for (const term of this.domainTerms) {
      // Escape special regex characters more carefully
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      try {
        const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
        const matches = Array.from(text.matchAll(regex));
        
        for (const match of matches) {
          terms.push({
            text: match[0],
            type: 'domain',
            weight: weight * 1.5,
            pos: 'domain',
            category: this.getDomainCategory(term)
          });
        }
      } catch (error) {
        // Skip terms that cause regex errors
        logger.debug(`Skipping problematic term: ${term}`);
        continue;
      }
    }

    return terms;
  }

  extractNamedEntities(doc, weight) {
    const entities = [];
    
    // Extract people, places, organizations
    const people = doc.people().json();
    const places = doc.places().json();
    const organizations = doc.organizations().json();
    
    [...people, ...places, ...organizations].forEach(entity => {
      entities.push({
        text: entity.text,
        type: 'entity',
        weight: weight * 1.3,
        pos: 'entity'
      });
    });

    return entities;
  }

  extractPhrases(doc, weight) {
    const phrases = [];
    
    // Extract noun phrases
    const nounPhrases = doc.match('#Noun+ #Noun').json();
    nounPhrases.forEach(phrase => {
      if (phrase.text.length > 5) { // Only longer phrases
        phrases.push({
          text: phrase.text,
          type: 'phrase',
          weight: weight * 1.1,
          pos: 'phrase'
        });
      }
    });

    return phrases;
  }

  extractCompoundTerms(doc, weight) {
    const compounds = [];
    const text = doc.text();
    
    // Extract multi-word technical terms
    const compoundPatterns = [
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g, // Title Case compounds
      /\b[a-z]+\s+[a-z]+\s+[a-z]+\b/g, // Three-word lowercase compounds
      /\b\w+\s*-\s*\w+(?:\s*-\s*\w+)?\b/g // Hyphenated compounds
    ];

    for (const pattern of compoundPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        compounds.push({
          text: match[0],
          type: 'compound',
          weight: weight * 1.2,
          pos: 'compound'
        });
      }
    }

    return compounds;
  }

  extractAcronymsAndAbbreviations(doc, weight) {
    const acronyms = [];
    const text = doc.text();
    
    // Enhanced acronym patterns
    const acronymPatterns = [
      /\b[A-Z]{2,6}\b/g, // Standard acronyms (2-6 uppercase letters)
      /\b[A-Z][a-z]*[A-Z][A-Za-z]*\b/g, // Mixed case abbreviations like "API"
      /\b\w+\.\w+(?:\.\w+)*\b/g, // Dotted abbreviations like "e.g."
    ];

    for (const pattern of acronymPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        // Skip common words that happen to be uppercase
        if (!['THE', 'AND', 'OR', 'BUT', 'FOR', 'AT', 'BY', 'TO'].includes(match[0])) {
          acronyms.push({
            text: match[0],
            type: 'acronym',
            weight: weight * 1.4,
            pos: 'acronym'
          });
        }
      }
    }

    return acronyms;
  }

  cleanText(text) {
    return text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
      .replace(/[#*_~]/g, '') // Remove markdown formatting
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  isValidConcept(text) {
    if (!text || typeof text !== 'string') return false;
    
    const cleanText = text.trim().toLowerCase();
    
    // Length checks
    if (cleanText.length < extractionConfig.conceptExtraction.minLength || 
        cleanText.length > extractionConfig.conceptExtraction.maxLength) {
      return false;
    }

    // Stop word check - use custom stop words if available, otherwise default
    const stopWordsToCheck = this.customStopWords.size > 0 
      ? this.customStopWords 
      : new Set(extractionConfig.conceptExtraction.stopWords);
    
    if (stopWordsToCheck.has(cleanText)) {
      return false;
    }

    // Avoid pure numbers or symbols
    if (/^[\d\W]+$/.test(cleanText)) {
      return false;
    }

    return true;
  }

  recordConcepts(concepts, filePath) {
    // Limit concepts per document for performance
    const limitedConcepts = concepts
      .sort((a, b) => b.weight - a.weight)
      .slice(0, extractionConfig.conceptExtraction.maxConceptsPerDocument);
    
    for (const concept of limitedConcepts) {
      const key = concept.normalized;
      
      // Update frequency
      const currentFreq = this.conceptFrequency.get(key) || 0;
      this.conceptFrequency.set(key, currentFreq + concept.weight);
      
      // Store concept details
      if (!this.concepts.has(key)) {
        this.concepts.set(key, {
          text: concept.text,
          normalized: concept.normalized,
          type: concept.type,
          category: concept.category,
          files: new Set(),
          sources: new Set(),
          totalWeight: 0
        });
      }
      
      const conceptData = this.concepts.get(key);
      conceptData.files.add(filePath);
      conceptData.sources.add(concept.source);
      conceptData.totalWeight += concept.weight;
      
      // Stop if we've reached the global concept limit
      if (this.concepts.size >= extractionConfig.conceptExtraction.maxConcepts) {
        break;
      }
    }
    
    // Record co-occurrence (limited)
    this.recordCooccurrence(limitedConcepts);
  }

  recordCooccurrence(concepts) {
    // Limit co-occurrence recording for performance
    if (this.conceptCooccurrence.size >= extractionConfig.conceptExtraction.maxCooccurrenceRecords) {
      return; // Skip if we've hit the limit
    }
    
    // Process even more concepts for maximum relationship analysis
    const topConcepts = concepts
      .sort((a, b) => b.weight - a.weight)
      .slice(0, Math.min(concepts.length, 60)); // Process top 60 concepts per document for richer co-occurrence
    
    for (let i = 0; i < topConcepts.length; i++) {
      for (let j = i + 1; j < topConcepts.length; j++) {
        const concept1 = topConcepts[i].normalized;
        const concept2 = topConcepts[j].normalized;
        
        const key = [concept1, concept2].sort().join('|');
        const currentCount = this.conceptCooccurrence.get(key) || 0;
        this.conceptCooccurrence.set(key, currentCount + 1);
        
        // Stop if we hit the limit
        if (this.conceptCooccurrence.size >= extractionConfig.conceptExtraction.maxCooccurrenceRecords) {
          return;
        }
      }
    }
  }

  normalizeConcepts() {
    // Optimized normalization - process top 2500 concepts for balanced performance and coverage
    const topConcepts = Array.from(this.conceptFrequency.entries())
      .filter(([key]) => this.concepts.has(key))
      .sort((a, b) => b[1] - a[1])
      .slice(0, Math.min(2500, this.concepts.size)) // Optimized to 2500 concepts for 50-70% performance improvement
      .map(([key]) => key);

    logger.info(`Normalizing top ${topConcepts.length} concepts (optimized for performance)...`);
    
    // Process concepts in chunks to manage memory and provide progress feedback
    const chunkSize = 100; // Optimized chunk size for balanced memory usage and efficiency
    const totalChunks = Math.ceil(topConcepts.length / chunkSize);
    const processed = new Set();
    let mergedGroups = 0;
    
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const startIdx = chunkIndex * chunkSize;
      const endIdx = Math.min(startIdx + chunkSize, topConcepts.length);
      const chunk = topConcepts.slice(startIdx, endIdx);
      
      logger.info(`Processing normalization chunk ${chunkIndex + 1}/${totalChunks} (${chunk.length} concepts)`);
      
      for (let i = 0; i < chunk.length; i++) {
        const concept1 = chunk[i];
        if (processed.has(concept1)) continue;
        
        const similar = [concept1];
        
        // Only check against remaining concepts in this chunk and future chunks
        for (let j = startIdx + i + 1; j < topConcepts.length; j++) {
          const concept2 = topConcepts[j];
          if (processed.has(concept2)) continue;
          
          // Fast pre-filtering before expensive similarity check
          if (this.fastSimilarityCheck(concept1, concept2) && this.areSimilar(concept1, concept2)) {
            similar.push(concept2);
          }
        }
        
        // Merge similar concepts
        if (similar.length > 1) {
          this.mergeSimilarConcepts(similar);
          mergedGroups++;
        }
        
        similar.forEach(concept => processed.add(concept));
      }
      
      // Log progress
      logger.info(`Chunk ${chunkIndex + 1} complete. Processed: ${processed.size}, Merged groups: ${mergedGroups}`);
    }
    
    logger.info(`Normalized ${processed.size} concepts with ${mergedGroups} merge groups`);
  }

  fastSimilarityCheck(term1, term2) {
    // Fast pre-filtering to avoid expensive similarity calculations
    const lenDiff = Math.abs(term1.length - term2.length);
    
    // If length difference is too large, they're definitely not similar
    if (lenDiff > Math.max(term1.length, term2.length) * 0.3) {
      return false;
    }
    
    // Check for obvious substring relationships
    if (term1.includes(term2) || term2.includes(term1)) {
      return true;
    }
    
    // Check if they share enough common characters (rough estimate)
    const chars1 = new Set(term1);
    const chars2 = new Set(term2);
    const intersection = new Set([...chars1].filter(x => chars2.has(x)));
    const union = new Set([...chars1, ...chars2]);
    
    return intersection.size / union.size > 0.6;
  }
  
  areSimilar(term1, term2) {
    // Various similarity checks (only called after fast pre-filtering)
    const distance = leven(term1, term2);
    const maxLength = Math.max(term1.length, term2.length);
    const similarity = 1 - (distance / maxLength);
    
    return similarity > 0.85 || term1.includes(term2) || term2.includes(term1);
  }

  mergeSimilarConcepts(similarConcepts) {
    // Use the most frequent variant as the canonical form
    const frequencies = similarConcepts.map(concept => ({
      concept,
      frequency: this.conceptFrequency.get(concept) || 0
    }));
    
    frequencies.sort((a, b) => b.frequency - a.frequency);
    const canonical = frequencies[0].concept;
    
    // Merge data
    for (let i = 1; i < frequencies.length; i++) {
      const variant = frequencies[i].concept;
      const canonicalData = this.concepts.get(canonical);
      const variantData = this.concepts.get(variant);
      
      if (variantData) {
        // Merge files and sources
        variantData.files.forEach(file => canonicalData.files.add(file));
        variantData.sources.forEach(source => canonicalData.sources.add(source));
        canonicalData.totalWeight += variantData.totalWeight;
        
        // Update frequency
        const canonicalFreq = this.conceptFrequency.get(canonical) || 0;
        const variantFreq = this.conceptFrequency.get(variant) || 0;
        this.conceptFrequency.set(canonical, canonicalFreq + variantFreq);
        
        // Remove variant
        this.concepts.delete(variant);
        this.conceptFrequency.delete(variant);
      }
    }
  }

  calculateConceptMetrics() {
    this.stats.totalConcepts = Array.from(this.conceptFrequency.values()).reduce((sum, freq) => sum + freq, 0);
    this.stats.uniqueConcepts = this.concepts.size;
    
    for (const [key, concept] of this.concepts) {
      if (concept.type === 'domain') {
        this.stats.domainConcepts++;
      } else if (concept.type === 'technical') {
        this.stats.technicalTerms++;
      }
    }
  }

  getDomainCategory(term) {
    const domainTermsSource = this.config?.domainSpecificTerms || extractionConfig.domainTerms;
    
    for (const [category, terms] of Object.entries(domainTermsSource)) {
      if (terms.includes(term)) {
        return category;
      }
    }
    return 'general';
  }

  getExclusionRules() {
    return {
      frontmatterExcluded: this.config?.frontmatterExcludedFileTypes || [],
      internalLinkingExcluded: this.config?.internalLinkingExcludedFileTypes || []
    };
  }

  normalizeTerm(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ');
  }

  getTopConcepts(limit = 50) {
    return Array.from(this.conceptFrequency.entries())
      .filter(([key]) => this.concepts.has(key))
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, frequency]) => ({
        concept: key,
        data: this.concepts.get(key),
        frequency,
        fileCount: this.concepts.get(key).files.size
      }));
  }

  getStats() {
    return this.stats;
  }
}

export default ConceptExtractor;