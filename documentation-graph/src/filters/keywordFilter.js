import logger from '../utils/logger.js';

class KeywordFilter {
  constructor(options = {}) {
    this.operator = options.operator || 'OR'; // OR or AND
    this.includeRelated = options.includeRelated || false;
    this.relatedDepth = options.relatedDepth || 1;
    this.minScore = options.minScore || 0.2;
    this.maxResults = options.maxResults || 100;
  }
  
  filterByKeywords(documents, conceptData, keywords) {
    const startTime = Date.now();
    logger.subsection(`Filtering by keywords: ${keywords.join(', ')} (${this.operator})`);
    
    // Normalize keywords
    const normalizedKeywords = keywords.map(kw => kw.toLowerCase().trim());
    
    // Create filtered collections
    const filteredDocuments = new Map();
    const filteredConcepts = new Map();
    const relevanceScores = new Map();
    const documentKeywords = new Map(); // Track which keywords matched each document
    const keywordMatches = new Map(); // Track match count per keyword
    
    // Initialize keyword match counts
    normalizedKeywords.forEach(kw => keywordMatches.set(kw, 0));
    
    // Statistics
    const stats = {
      totalMatches: 0,
      avgRelevance: 0,
      maxRelevance: 0,
      minRelevance: 1.0,
      keywordCoverage: 0
    };
    
    // Score and filter documents
    const documentScores = [];
    
    for (const [path, doc] of documents.entries()) {
      const result = this.scoreDocument(doc, normalizedKeywords);
      
      if (result.score >= this.minScore) {
        documentScores.push({
          path,
          doc,
          score: result.score,
          matchedKeywords: result.matchedKeywords
        });
        
        // Update keyword match counts
        result.matchedKeywords.forEach(kw => {
          keywordMatches.set(kw, (keywordMatches.get(kw) || 0) + 1);
        });
      }
    }
    
    // Sort by score and limit results
    documentScores.sort((a, b) => b.score - a.score);
    const topDocuments = documentScores.slice(0, this.maxResults);
    
    // Add top documents to filtered collection
    for (const { path, doc, score, matchedKeywords } of topDocuments) {
      filteredDocuments.set(path, doc);
      relevanceScores.set(path, score);
      documentKeywords.set(path, matchedKeywords);
      
      stats.totalMatches++;
      stats.avgRelevance += score;
      stats.maxRelevance = Math.max(stats.maxRelevance, score);
      stats.minRelevance = Math.min(stats.minRelevance, score);
    }
    
    // Calculate keyword coverage
    const coveredKeywords = Array.from(keywordMatches.values()).filter(count => count > 0).length;
    stats.keywordCoverage = coveredKeywords / normalizedKeywords.length;
    
    // Filter concepts based on keywords
    for (const [key, concept] of conceptData.concepts.entries()) {
      if (this.isConceptRelevant(concept, normalizedKeywords)) {
        filteredConcepts.set(key, concept);
      }
    }
    
    // Include related concepts if requested
    if (this.includeRelated) {
      this.addRelatedConcepts(
        filteredConcepts,
        conceptData,
        filteredDocuments,
        this.relatedDepth
      );
    }
    
    // Add concepts from filtered documents
    for (const [path, doc] of filteredDocuments.entries()) {
      if (doc.concepts) {
        for (const conceptKey of doc.concepts) {
          if (conceptData.concepts.has(conceptKey) && !filteredConcepts.has(conceptKey)) {
            filteredConcepts.set(conceptKey, conceptData.concepts.get(conceptKey));
          }
        }
      }
    }
    
    // Calculate final statistics
    stats.avgRelevance = stats.totalMatches > 0 
      ? stats.avgRelevance / stats.totalMatches 
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
    logger.stat('Keyword coverage', `${(stats.keywordCoverage * 100).toFixed(1)}%`);
    
    return {
      documents: filteredDocuments,
      concepts: filteredConcepts,
      conceptData: filteredConceptData,
      relevanceScores,
      documentKeywords,
      keywordMatches,
      stats,
      keywords: normalizedKeywords,
      filterOptions: {
        operator: this.operator,
        includeRelated: this.includeRelated,
        minScore: this.minScore
      }
    };
  }
  
  scoreDocument(doc, keywords) {
    const matchedKeywords = new Set();
    const keywordScores = new Map();
    
    for (const keyword of keywords) {
      let keywordScore = 0;
      
      // Check title (highest weight)
      if (doc.title) {
        const titleLower = doc.title.toLowerCase();
        if (titleLower.includes(keyword)) {
          keywordScore += 0.4;
          matchedKeywords.add(keyword);
        }
      }
      
      // Check description
      if (doc.description) {
        const descLower = doc.description.toLowerCase();
        if (descLower.includes(keyword)) {
          keywordScore += 0.2;
          matchedKeywords.add(keyword);
        }
      }
      
      // Check content
      if (doc.content) {
        const contentLower = doc.content.toLowerCase();
        const occurrences = this.countOccurrences(contentLower, keyword);
        
        if (occurrences > 0) {
          // Logarithmic scaling for content matches
          const contentScore = Math.min(0.3, Math.log(occurrences + 1) * 0.1);
          keywordScore += contentScore;
          matchedKeywords.add(keyword);
        }
      }
      
      // Check tags
      if (doc.tags && doc.tags.length > 0) {
        const tagsLower = doc.tags.map(t => t.toLowerCase());
        if (tagsLower.some(tag => tag.includes(keyword))) {
          keywordScore += 0.1;
          matchedKeywords.add(keyword);
        }
      }
      
      // Check headings
      if (doc.headings && doc.headings.length > 0) {
        const headingsText = doc.headings.map(h => h.text.toLowerCase()).join(' ');
        if (headingsText.includes(keyword)) {
          keywordScore += 0.15;
          matchedKeywords.add(keyword);
        }
      }
      
      keywordScores.set(keyword, keywordScore);
    }
    
    // Calculate final score based on operator
    let finalScore = 0;
    
    if (this.operator === 'AND') {
      // All keywords must match for AND operator
      if (matchedKeywords.size === keywords.length) {
        // Average of all keyword scores
        finalScore = Array.from(keywordScores.values()).reduce((sum, score) => sum + score, 0) / keywords.length;
      } else {
        finalScore = 0; // Doesn't meet AND criteria
      }
    } else { // OR operator
      // Sum of all keyword scores (max 1.0)
      finalScore = Math.min(1.0, Array.from(keywordScores.values()).reduce((sum, score) => sum + score, 0));
    }
    
    return {
      score: finalScore,
      matchedKeywords: Array.from(matchedKeywords),
      keywordScores: Object.fromEntries(keywordScores)
    };
  }
  
  isConceptRelevant(concept, keywords) {
    const conceptTextLower = concept.text.toLowerCase();
    
    for (const keyword of keywords) {
      if (conceptTextLower.includes(keyword) || keyword.includes(conceptTextLower)) {
        return true;
      }
      
      // Check if concept is a substring of keyword or vice versa
      if (conceptTextLower.length > 3 && keyword.length > 3) {
        if (this.areRelatedTerms(conceptTextLower, keyword)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  areRelatedTerms(term1, term2) {
    // Check for common word stems or partial matches
    const words1 = term1.split(/[\s\-_]+/);
    const words2 = term2.split(/[\s\-_]+/);
    
    for (const w1 of words1) {
      for (const w2 of words2) {
        if (w1.length > 4 && w2.length > 4) {
          // Check if one word starts with the other
          if (w1.startsWith(w2) || w2.startsWith(w1)) {
            return true;
          }
          
          // Check for common root (simple stemming)
          const minLen = Math.min(w1.length, w2.length);
          if (minLen > 5) {
            const root1 = w1.substring(0, minLen - 2);
            const root2 = w2.substring(0, minLen - 2);
            if (root1 === root2) {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  }
  
  addRelatedConcepts(filteredConcepts, conceptData, filteredDocuments, depth) {
    if (depth <= 0) return;
    
    const conceptsToAdd = new Set();
    
    // Find concepts that co-occur with already filtered concepts
    if (conceptData.cooccurrence) {
      for (const [pair, count] of conceptData.cooccurrence.entries()) {
        const [concept1, concept2] = pair.split('::');
        
        if (filteredConcepts.has(concept1) && !filteredConcepts.has(concept2)) {
          if (count > 5) { // Only add if significant co-occurrence
            conceptsToAdd.add(concept2);
          }
        } else if (filteredConcepts.has(concept2) && !filteredConcepts.has(concept1)) {
          if (count > 5) {
            conceptsToAdd.add(concept1);
          }
        }
      }
    }
    
    // Add the related concepts
    for (const conceptKey of conceptsToAdd) {
      if (conceptData.concepts.has(conceptKey)) {
        filteredConcepts.set(conceptKey, conceptData.concepts.get(conceptKey));
      }
    }
    
    // Recursively add more related concepts if depth > 1
    if (depth > 1 && conceptsToAdd.size > 0) {
      this.addRelatedConcepts(filteredConcepts, conceptData, filteredDocuments, depth - 1);
    }
  }
  
  reconstructConceptData(filteredConcepts, originalConceptData, filteredDocuments) {
    const conceptData = {
      concepts: filteredConcepts,
      frequency: new Map(),
      cooccurrence: new Map()
    };
    
    // Rebuild frequency data
    for (const [key, concept] of filteredConcepts.entries()) {
      let frequency = 0;
      
      for (const [path, doc] of filteredDocuments.entries()) {
        if (doc.concepts && doc.concepts.includes(key)) {
          frequency++;
        }
      }
      
      conceptData.frequency.set(key, frequency);
    }
    
    // Rebuild cooccurrence data
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
  
  countOccurrences(text, searchString) {
    let count = 0;
    let position = 0;
    
    while ((position = text.indexOf(searchString, position)) !== -1) {
      count++;
      position += searchString.length;
    }
    
    return count;
  }
}

export default KeywordFilter;