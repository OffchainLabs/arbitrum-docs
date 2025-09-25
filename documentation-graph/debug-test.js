#!/usr/bin/env node

import DocumentExtractor from './src/extractors/documentExtractor.js';
import ConceptExtractor from './src/extractors/conceptExtractor.js';
import logger from './src/utils/logger.js';

async function debugConceptExtraction() {
  console.log('=== Debug Concept Extraction Performance ===');
  
  // Load documents
  const inputDir = '/Users/allup/dev/OCL/arbitrum-docs/docs';
  const extractor = new DocumentExtractor(inputDir);
  
  console.log('Loading a small subset of documents...');
  const allDocuments = await extractor.extractAll();
  
  // Take only first 10 documents for testing
  const testDocuments = new Map();
  let count = 0;
  for (const [path, doc] of allDocuments) {
    testDocuments.set(path, doc);
    count++;
    if (count >= 10) break;
  }
  
  console.log(`Testing with ${testDocuments.size} documents...`);
  
  const conceptExtractor = new ConceptExtractor();
  
  // Monitor memory usage
  const memBefore = process.memoryUsage();
  console.log('Memory before extraction:', {
    rss: Math.round(memBefore.rss / 1024 / 1024) + ' MB',
    heapUsed: Math.round(memBefore.heapUsed / 1024 / 1024) + ' MB'
  });
  
  const startTime = Date.now();
  
  try {
    // This should hang on normalizeConcepts()
    console.log('Starting concept extraction...');
    const result = await conceptExtractor.extractFromDocuments(testDocuments);
    
    const endTime = Date.now();
    const memAfter = process.memoryUsage();
    
    console.log('Extraction completed!');
    console.log('Time taken:', (endTime - startTime) + 'ms');
    console.log('Memory after extraction:', {
      rss: Math.round(memAfter.rss / 1024 / 1024) + ' MB',
      heapUsed: Math.round(memAfter.heapUsed / 1024 / 1024) + ' MB'
    });
    console.log('Concepts extracted:', result.concepts.size);
    
  } catch (error) {
    console.error('Error during extraction:', error);
  }
}

debugConceptExtraction();