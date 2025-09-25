import leven from 'leven';
import logger from '../utils/logger.js';

class TopicFilter {
  constructor(options = {}) {
    this.caseSensitive = options.caseSensitive || false;
    this.fuzzyMatching = options.fuzzyMatching || false;
    this.relevanceThreshold = options.relevanceThreshold || 0.3;
    this.maxLevenshteinDistance = options.maxLevenshteinDistance || 3;
  }
  
  filterByTopic(documents, conceptData, topic) {
    const startTime = Date.now();
    logger.subsection(`Filtering by topic: "${topic}"`);
    
    // Normalize topic for matching
    const normalizedTopic = this.caseSensitive ? topic : topic.toLowerCase();
    const topicTokens = this.tokenizeTopic(normalizedTopic);
    
    // Create filtered collections
    const filteredDocuments = new Map();
    const filteredConcepts = new Map();
    const relevanceScores = new Map();
    
    // Statistics
    const stats = {
      totalRelevance: 0,
      avgRelevance: 0,
      topicOccurrences: 0,
      directMatches: 0,
      fuzzyMatches: 0,
      conceptMatches: 0
    };
    
    // Filter documents
    for (const [path, doc] of documents.entries()) {
      const relevance = this.calculateDocumentRelevance(doc, normalizedTopic, topicTokens);
      
      if (relevance >= this.relevanceThreshold) {
        filteredDocuments.set(path, doc);
        relevanceScores.set(path, relevance);
        stats.totalRelevance += relevance;
        
        if (relevance === 1.0) stats.directMatches++;
        else if (this.fuzzyMatching) stats.fuzzyMatches++;
      }
    }
    
    // Filter concepts related to the topic
    for (const [key, concept] of conceptData.concepts.entries()) {
      const conceptText = this.caseSensitive ? concept.text : concept.text.toLowerCase();
      
      if (this.isConceptRelatedToTopic(conceptText, normalizedTopic, topicTokens)) {
        filteredConcepts.set(key, concept);
        stats.conceptMatches++;
      }
    }
    
    // Add concepts from filtered documents
    for (const [path, doc] of filteredDocuments.entries()) {
      if (doc.concepts) {
        for (const conceptKey of doc.concepts) {
          if (conceptData.concepts.has(conceptKey) && !filteredConcepts.has(conceptKey)) {
            const concept = conceptData.concepts.get(conceptKey);
            // Only add if it has some relation to our documents
            if (this.shouldIncludeConcept(concept, filteredDocuments)) {
              filteredConcepts.set(conceptKey, concept);
            }
          }
        }
      }
    }
    
    // Calculate statistics
    stats.avgRelevance = filteredDocuments.size > 0 
      ? stats.totalRelevance / filteredDocuments.size 
      : 0;
    
    // Reconstruct filtered concept data
    const filteredConceptData = this.reconstructConceptData(
      filteredConcepts,
      conceptData,
      filteredDocuments
    );
    
    const duration = Date.now() - startTime;
    logger.info(`Filtering completed in ${duration}ms`);
    logger.stat('Documents retained', `${filteredDocuments.size}/${documents.size}`);
    logger.stat('Concepts retained', `${filteredConcepts.size}/${conceptData.concepts.size}`);
    
    return {
      documents: filteredDocuments,
      concepts: filteredConcepts,
      conceptData: filteredConceptData,
      relevanceScores,
      stats,
      topic,
      filterOptions: {
        caseSensitive: this.caseSensitive,
        fuzzyMatching: this.fuzzyMatching,
        threshold: this.relevanceThreshold
      }
    };
  }
  
  calculateDocumentRelevance(doc, normalizedTopic, topicTokens) {
    let relevance = 0;
    let matchCount = 0;
    let totalChecks = 0;
    
    // Check title
    if (doc.title) {
      const title = this.caseSensitive ? doc.title : doc.title.toLowerCase();
      if (title.includes(normalizedTopic)) {
        relevance += 0.4; // High weight for title match
        matchCount++;
      } else if (this.fuzzyMatching && this.fuzzyMatch(title, normalizedTopic)) {
        relevance += 0.3;
        matchCount++;
      }
      totalChecks++;
    }
    
    // Check description
    if (doc.description) {
      const description = this.caseSensitive ? doc.description : doc.description.toLowerCase();
      if (description.includes(normalizedTopic)) {
        relevance += 0.2;
        matchCount++;
      } else if (this.fuzzyMatching && this.fuzzyMatch(description, normalizedTopic)) {
        relevance += 0.15;
        matchCount++;
      }
      totalChecks++;
    }
    
    // Check content
    if (doc.content) {
      const content = this.caseSensitive ? doc.content : doc.content.toLowerCase();
      const occurrences = this.countOccurrences(content, normalizedTopic);
      
      if (occurrences > 0) {
        // Scale relevance based on occurrences (max 0.3)
        relevance += Math.min(0.3, occurrences * 0.05);
        matchCount++;
      } else if (this.fuzzyMatching) {
        // Check for token matches in content
        let tokenMatches = 0;
        for (const token of topicTokens) {
          if (content.includes(token)) {
            tokenMatches++;
          }
        }
        if (tokenMatches > 0) {
          relevance += Math.min(0.2, tokenMatches * 0.05);
          matchCount++;
        }
      }
      totalChecks++;
    }
    
    // Check tags
    if (doc.tags && doc.tags.length > 0) {
      const tags = doc.tags.map(t => this.caseSensitive ? t : t.toLowerCase());
      for (const tag of tags) {
        if (tag === normalizedTopic || tag.includes(normalizedTopic)) {
          relevance += 0.1;
          matchCount++;
          break;
        }
      }
      totalChecks++;
    }
    
    // Check content type
    if (doc.contentType) {
      const contentType = this.caseSensitive ? doc.contentType : doc.contentType.toLowerCase();
      if (normalizedTopic.includes(contentType) || contentType.includes(normalizedTopic)) {
        relevance += 0.1;
        matchCount++;
      }
      totalChecks++;
    }
    
    // Normalize relevance to 0-1 range
    return Math.min(1.0, relevance);
  }
  
  isConceptRelatedToTopic(conceptText, normalizedTopic, topicTokens) {
    // Direct match
    if (conceptText === normalizedTopic || conceptText.includes(normalizedTopic)) {
      return true;
    }
    
    // Check if topic includes concept
    if (normalizedTopic.includes(conceptText)) {
      return true;
    }
    
    // Token-based matching
    for (const token of topicTokens) {
      if (conceptText.includes(token) || token.includes(conceptText)) {
        return true;
      }
    }
    
    // Fuzzy matching if enabled
    if (this.fuzzyMatching) {
      const distance = leven(conceptText, normalizedTopic);
      if (distance <= this.maxLevenshteinDistance) {
        return true;
      }
      
      // Check against individual tokens
      for (const token of topicTokens) {
        if (token.length > 3) { // Only fuzzy match longer tokens
          const tokenDistance = leven(conceptText, token);
          if (tokenDistance <= Math.min(2, token.length / 3)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
  
  shouldIncludeConcept(concept, filteredDocuments) {
    // Include if concept appears in at least one filtered document
    if (concept.files) {
      for (const file of concept.files) {
        if (filteredDocuments.has(file)) {
          return true;
        }
      }
    }
    
    // Include high-weight domain concepts
    if (concept.type === 'domain' && concept.totalWeight > 10) {
      return true;
    }
    
    return false;
  }
  
  reconstructConceptData(filteredConcepts, originalConceptData, filteredDocuments) {
    const conceptData = {
      concepts: filteredConcepts,
      frequency: new Map(),
      cooccurrence: new Map()
    };
    
    // Rebuild frequency data for filtered concepts
    for (const [key, concept] of filteredConcepts.entries()) {
      let frequency = 0;
      
      // Count frequency in filtered documents
      for (const [path, doc] of filteredDocuments.entries()) {
        if (doc.concepts && doc.concepts.includes(key)) {
          frequency++;
        }
      }
      
      conceptData.frequency.set(key, frequency);
    }
    
    // Rebuild cooccurrence data (simplified)
    if (originalConceptData.cooccurrence) {
      for (const [pair, count] of originalConceptData.cooccurrence.entries()) {
        const [concept1, concept2] = pair.split('::');
        if (filteredConcepts.has(concept1) && filteredConcepts.has(concept2)) {
          conceptData.cooccurrence.set(pair, count);
        }
      }
    }
    
    return conceptData;
  }
  
  tokenizeTopic(topic) {
    // Split by common separators and filter out small words
    return topic
      .split(/[\s\-_,]+/)
      .filter(token => token.length > 2)
      .map(token => token.toLowerCase());
  }
  
  countOccurrences(text, searchString) {
    let count = 0;
    let position = 0;
    
    while ((position = text.indexOf(searchString, position)) !== -1) {
      count++;
      position += searchString.length;
    }
    
    return count;
  }
  
  fuzzyMatch(text, pattern) {
    if (!this.fuzzyMatching) return false;
    
    // Check if pattern exists with small variations
    const words = text.split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && pattern.length > 3) {
        const distance = leven(word, pattern);
        if (distance <= this.maxLevenshteinDistance) {
          return true;
        }
      }
    }
    
    return false;
  }
}

export default TopicFilter;