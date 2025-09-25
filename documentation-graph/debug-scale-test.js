#!/usr/bin/env node

import DocumentExtractor from './src/extractors/documentExtractor.js';
import ConceptExtractor from './src/extractors/conceptExtractor.js';

async function testScaling() {
  console.log('=== Scaling Test ===');
  
  const inputDir = '/Users/allup/dev/OCL/arbitrum-docs/docs';
  const extractor = new DocumentExtractor(inputDir);
  const allDocuments = await extractor.extractAll();
  
  console.log(`Total documents: ${allDocuments.size}`);
  
  // Test with increasing document counts
  const testSizes = [10, 25, 50, 100];
  
  for (const size of testSizes) {
    console.log(`\n--- Testing with ${size} documents ---`);
    
    const testDocuments = new Map();
    let count = 0;
    for (const [path, doc] of allDocuments) {
      testDocuments.set(path, doc);
      count++;
      if (count >= size) break;
    }
    
    const conceptExtractor = new ConceptExtractor();
    const startTime = Date.now();
    const memBefore = process.memoryUsage();
    
    try {
      // Set a timeout to avoid hanging
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 30000)
      );
      
      const extraction = conceptExtractor.extractFromDocuments(testDocuments);
      
      const result = await Promise.race([extraction, timeout]);
      
      const endTime = Date.now();
      const memAfter = process.memoryUsage();
      
      console.log(`✓ Completed in ${endTime - startTime}ms`);
      console.log(`  Concepts: ${result.concepts.size}`);
      console.log(`  Memory: ${Math.round((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024)}MB increase`);
      
      // Calculate theoretical O(n²) operations for normalization
      const conceptCount = result.concepts.size;
      const normalizeOperations = (conceptCount * (conceptCount - 1)) / 2;
      console.log(`  Normalization operations: ${normalizeOperations.toLocaleString()}`);
      
    } catch (error) {
      console.log(`✗ Failed: ${error.message}`);
      break;
    }
  }
}

testScaling();